const { catchAsync } = require('../utils/appError');
const mongoose = require('mongoose');
const dormitoryRepo = require('../repositories/dormitoryRepository');
const DormitoryRequest = require('../models/DormitoryRequest');
const DormitoryCategory = require('../models/DormitoryCategory');
const Student = require('../models/Student');

const ALLOWED_STATUSES = ['Pending', 'Under Review', 'Approved', 'Rejected'];

// ==================== DORMITORY REQUEST CRUD ====================

// CREATE - Tạo dormitory request mới
const createDormitoryRequest = catchAsync(async (req, res) => {
  const { student, category, description } = req.body;

  // Không cho phép student tự set status
  if (req.body.status) {
    return res.status(400).json({
      success: false,
      message: 'Không được phép tự set status khi tạo request'
    });
  }

  if (!student) {
    return res.status(400).json({ success: false, message: 'student is required' });
  }

  const studentExists = await Student.findById(student);
  if (!studentExists) {
    return res.status(400).json({ success: false, message: 'Student không tồn tại' });
  }

  if (!Array.isArray(category) || category.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'category phải là array và có ít nhất 1 phần tử'
    });
  }

  const foundCategories = await DormitoryCategory.find({
    _id: { $in: category },
    isActive: true
  });

  if (foundCategories.length !== category.length) {
    return res.status(400).json({
      success: false,
      message: 'Một hoặc nhiều category không tồn tại hoặc không active'
    });
  }

  const newRequest = await DormitoryRequest.create({
    student,
    category,
    description: description?.trim() || '',
    status: 'Pending',
    requestDate: new Date()
  });

  return res.status(201).json({
    success: true,
    data: newRequest
  });
});

// READ - Lấy tất cả dormitory requests (có phân trang và filter)
const getAllDormitoryRequests = catchAsync(async (req, res) => {
  const { page = 1, limit = 50, status, studentId } = req.query;
  const skip = (page - 1) * limit;

  const filters = {};
  if (status) filters.status = status;
  if (studentId) filters.student = studentId;

  const requests = await DormitoryRequest.find(filters)
    .populate('student', 'name email studentId')
    .populate('category', 'name description')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await DormitoryRequest.countDocuments(filters);

  return res.status(200).json({
    success: true,
    data: requests,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// READ - Lấy dormitory request theo ID
const getRequestById = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const doc = await dormitoryRepo.findById(id);
  if (!doc) {
    return res.status(404).json({ success: false, message: 'Request không tồn tại' });
  }

  if (req.user && req.user.role === 'STUDENT' && String(doc.student._id || doc.student) !== String(req.user._id)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  return res.status(200).json({ success: true, data: doc });
});

// UPDATE - Cập nhật dormitory request
const updateDormitoryRequest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Lấy request hiện tại để kiểm tra status
  const currentRequest = await DormitoryRequest.findById(id);
  if (!currentRequest) {
    return res.status(404).json({ success: false, message: 'Request không tồn tại' });
  }

  // Không cho phép update nếu status đã là "Under Review", "Approved", hoặc "Rejected"
  if (['Under Review', 'Approved', 'Rejected'].includes(currentRequest.status)) {
    return res.status(400).json({
      success: false,
      message: `Không thể cập nhật request khi status đã là "${currentRequest.status}"`
    });
  }

  // Không cho phép student tự thay đổi status
  if (updateData.status) {
    return res.status(400).json({
      success: false,
      message: 'Không được phép tự thay đổi status'
    });
  }

  if (updateData.student) {
    return res.status(400).json({
      success: false,
      message: 'Không được phép thay đổi student trong request'
    });
  }

  if (updateData.category) {
    if (!Array.isArray(updateData.category) || updateData.category.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'category phải là array và có ít nhất 1 phần tử'
      });
    }

    const foundCategories = await DormitoryCategory.find({
      _id: { $in: updateData.category },
      isActive: true
    });

    if (foundCategories.length !== updateData.category.length) {
      return res.status(400).json({
        success: false,
        message: 'Một hoặc nhiều category không tồn tại hoặc không active'
      });
    }
  }

  const updated = await DormitoryRequest.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('student', 'name email studentId')
   .populate('category', 'name description');

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Request không tồn tại' });
  }

  return res.status(200).json({ success: true, data: updated });
});

// UPDATE - Cập nhật status của dormitory request
const updateRequestStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const updaterId = req.user && req.user._id;
  const updated = await dormitoryRepo.updateStatus(id, status, updaterId);
  
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Request không tồn tại' });
  }

  return res.status(200).json({ success: true, data: updated });
});

// DELETE - Xóa dormitory request
const deleteDormitoryRequest = catchAsync(async (req, res) => {
  const { id } = req.params;

  const deletedRequest = await DormitoryRequest.findByIdAndDelete(id);

  if (!deletedRequest) {
    return res.status(404).json({
      success: false,
      message: 'Request không tồn tại'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Đã xóa request thành công'
  });
});

// ==================== DORMITORY CATEGORY CRUD ====================

// CREATE - Tạo category mới
const createCategory = catchAsync(async (req, res) => {
  const { name, description, isActive = true } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Tên category không được để trống'
    });
  }

  const existingCategory = await DormitoryCategory.findOne({ name: name.trim() });
  if (existingCategory) {
    return res.status(400).json({
      success: false,
      message: 'Category với tên này đã tồn tại'
    });
  }

  const newCategory = await DormitoryCategory.create({
    name: name.trim(),
    description: description?.trim() || '',
    isActive
  });

  return res.status(201).json({
    success: true,
    data: newCategory
  });
});

// READ - Lấy tất cả categories
const getCategories = catchAsync(async (req, res) => {
  const { isActive } = req.query;
  
  const filters = {};
  if (isActive !== undefined) {
    filters.isActive = isActive === 'true';
  }

  const categories = await DormitoryCategory.find(filters).sort({ name: 1 });

  return res.status(200).json({
    success: true,
    data: categories
  });
});

// READ - Lấy category theo ID
const getCategoryById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const category = await DormitoryCategory.findById(id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category không tồn tại'
    });
  }

  return res.status(200).json({
    success: true,
    data: category
  });
});

// UPDATE - Cập nhật category
const updateCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, description, isActive } = req.body;

  if (name && !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Tên category không được để trống'
    });
  }

  if (name) {
    const existingCategory = await DormitoryCategory.findOne({
      name: name.trim(),
      _id: { $ne: id }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category với tên này đã tồn tại'
      });
    }
  }

  const updateData = {};
  if (name) updateData.name = name.trim();
  if (description !== undefined) updateData.description = description.trim();
  if (isActive !== undefined) updateData.isActive = isActive;

  const updated = await DormitoryCategory.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!updated) {
    return res.status(404).json({
      success: false,
      message: 'Category không tồn tại'
    });
  }

  return res.status(200).json({
    success: true,
    data: updated
  });
});

// DELETE - Xóa category
const deleteCategory = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Kiểm tra xem có request nào đang sử dụng category này không
  const requestsUsingCategory = await DormitoryRequest.countDocuments({
    category: id
  });

  if (requestsUsingCategory > 0) {
    return res.status(400).json({
      success: false,
      message: `Không thể xóa category vì có ${requestsUsingCategory} request đang sử dụng`
    });
  }

  const deletedCategory = await DormitoryCategory.findByIdAndDelete(id);

  if (!deletedCategory) {
    return res.status(404).json({
      success: false,
      message: 'Category không tồn tại'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Đã xóa category thành công'
  });
});

// ==================== STATISTICS ====================

// Lấy thống kê requests theo tháng
const getDormitoryRequestsByMonth = catchAsync(async (req, res) => {
  const dormitoryRequestsByMonth = await DormitoryRequest.aggregate([
    {
      $group: {
        _id: { $month: '$requestDate' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        month: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id', 1] }, then: 'Jan' },
              { case: { $eq: ['$_id', 2] }, then: 'Feb' },
              { case: { $eq: ['$_id', 3] }, then: 'Mar' },
              { case: { $eq: ['$_id', 4] }, then: 'Apr' },
              { case: { $eq: ['$_id', 5] }, then: 'May' },
              { case: { $eq: ['$_id', 6] }, then: 'Jun' },
              { case: { $eq: ['$_id', 7] }, then: 'Jul' },
              { case: { $eq: ['$_id', 8] }, then: 'Aug' },
              { case: { $eq: ['$_id', 9] }, then: 'Sep' },
              { case: { $eq: ['$_id', 10] }, then: 'Oct' },
              { case: { $eq: ['$_id', 11] }, then: 'Nov' },
              { case: { $eq: ['$_id', 12] }, then: 'Dec' }
            ],
            default: 'Unknown'
          }
        },
        count: 1
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return res.status(200).json({
    success: true,
    data: dormitoryRequestsByMonth
  });
});

// ==================== EXPORTS ====================

module.exports = {
  // Dormitory Request CRUD
  createDormitoryRequest,
  getAllDormitoryRequests,
  getRequestById,
  updateDormitoryRequest,
  updateRequestStatus,
  deleteDormitoryRequest,
  
  // Category CRUD
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  
  // Statistics
  getDormitoryRequestsByMonth
};
