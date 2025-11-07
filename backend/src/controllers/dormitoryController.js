const dormitoryRepo = require('../repositories/dormitoryRepository');
const { catchAsync } = require('../utils/appError');
const Student = require('../models/Student'); // add this require at top if not present
//Sus
const ALLOWED_STATUSES = ['Pending', 'Under Review', 'Approved', 'Rejected'];

class DormitoryController {
  // POST /api/dormitory/requests
  createDormitoryRequests = catchAsync(async (req, res) => {
    const { requests } = req.body;
    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({ success: false, message: 'No requests provided' });
    }

    // Get user id from auth middleware (support both req.userData and req.user) (New)
    const userId = (req.userData && req.userData.id) || (req.user && req.user._id);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Resolve Student profile (Student.user references User._id) OR accept userId if student _id equals userId
    let studentDoc = await Student.findOne({ user: userId }).lean();
    if (!studentDoc) {
      // fallback: maybe the token contains student._id directly
      studentDoc = await Student.findById(userId).lean();
    }
    if (!studentDoc) {
      return res.status(400).json({ success: false, message: 'Student profile not found for this user' });
    }

    // Update payload to use category ObjectId instead of string
    const payload = requests
      .map(r => ({
        student: studentDoc._id,
        category: r.categoryId, // Change from r.category to r.categoryId (ObjectId)
        deviceName: (r.deviceName || '').trim(),
        description: (r.description || '').trim(),
        status: 'Pending'
      }))
      .filter(p => p.category && p.deviceName);

    if (payload.length === 0) {
      return res.status(400).json({ success: false, message: 'All requests are invalid' });
    }

    const created = await dormitoryRepo.createMany(payload);
    return res.status(201).json({ success: true, data: created });
  });   //New
  // New 
  getMyRequests = catchAsync(async (req, res) => {
    const userId = (req.userData && req.userData.id) || (req.user && req.user._id);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Resolve Student profile
    let studentDoc = await Student.findOne({ user: userId }).lean();
    if (!studentDoc) {
      studentDoc = await Student.findById(userId).lean();
    }
    if (!studentDoc) {
      return res.status(400).json({ success: false, message: 'Student profile not found for this user' });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 50);
    const skip = (page - 1) * limit;

    const [results, total] = await Promise.all([
      dormitoryRepo.findByStudent(studentDoc._id, { skip, limit }),
      dormitoryRepo.countByStudent(studentDoc._id)
    ]);

    return res.status(200).json({
      success: true,
      data: results,
      meta: { page, limit, total }
    });
  });

  // GET /api/dormitory/requests/:id
  getRequestById = catchAsync(async (req, res) => {
    const id = req.params.id;
    const doc = await dormitoryRepo.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });

    if (req.user && req.user.role === 'STUDENT' && String(doc.student._id || doc.student) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    return res.status(200).json({ success: true, data: doc });
  });

  // PATCH /api/dormitory/requests/:id/status
  updateRequestStatus = catchAsync(async (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updaterId = req.user && req.user._id;
    const updated = await dormitoryRepo.updateStatus(id, status, updaterId);
    if (!updated) return res.status(404).json({ success: false, message: 'Not found' });

    return res.status(200).json({ success: true, data: updated });
  });

  // DELETE /api/dormitory/requests/:id
  deleteDormitoryRequest = catchAsync(async (req, res) => {
    const { id } = req.params;

    const deletedRequest = await DormitoryRequest.findByIdAndDelete(id);
  
    if (!deletedRequest) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // For now, just return success (since you don't have a Dormitory model yet)
    res.status(200).json({
      success: true,
      message: 'Request deleted successfully'
    });
  });

  // Add this method to dormitoryController.js
  getCategories = catchAsync(async (req, res) => {
    const DormitoryCategory = require('../models/DormitoryCategory');
    const categories = await DormitoryCategory.find({ isActive: true });
    
    res.status(200).json({
      success: true,
      data: categories
    });
  });
}

module.exports = new DormitoryController();