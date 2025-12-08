import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FacultyManagement.css";

export default function FacultyManagement() {
  const navigate = useNavigate();

  // Bộ lọc Faculty
  const [selectedFaculty, setSelectedFaculty] = useState("all");

  // Fake data danh sách Khoa (Faculty)
  const [faculties, setFaculties] = useState([
    { id: 1, name: "Khoa Công nghệ Thông tin", code: "IT", description: "Đào tạo về CNTT và Khoa học máy tính", isActive: true },
    { id: 2, name: "Khoa Kinh tế", code: "ECO", description: "Đào tạo về Kinh tế và Quản trị kinh doanh", isActive: true },
    { id: 3, name: "Khoa Ngoại ngữ", code: "FL", description: "Đào tạo về Ngôn ngữ và Văn hóa", isActive: true },
    { id: 4, name: "Khoa Kỹ thuật", code: "ENG", description: "Đào tạo về Kỹ thuật và Công nghệ", isActive: false },
  ]);

  // Fake data danh sách Chuyên ngành (Major)
  const [majors, setMajors] = useState([
    { id: 1, name: "Khoa học Máy tính", code: "CS", facultyId: 1, description: "Chuyên ngành về lập trình và thuật toán", studentCount: 150, isActive: true },
    { id: 2, name: "Hệ thống Thông tin", code: "IS", facultyId: 1, description: "Quản lý và phát triển hệ thống thông tin", studentCount: 120, isActive: true },
    { id: 3, name: "An toàn Thông tin", code: "SEC", facultyId: 1, description: "Bảo mật và an toàn mạng", studentCount: 80, isActive: true },
    { id: 4, name: "Kinh tế Quốc tế", code: "IE", facultyId: 2, description: "Kinh tế và thương mại quốc tế", studentCount: 200, isActive: true },
    { id: 5, name: "Quản trị Kinh doanh", code: "BM", facultyId: 2, description: "Quản lý và điều hành doanh nghiệp", studentCount: 180, isActive: true },
    { id: 6, name: "Tiếng Anh", code: "ENG", facultyId: 3, description: "Ngôn ngữ và văn hóa Anh - Mỹ", studentCount: 100, isActive: true },
    { id: 7, name: "Tiếng Nhật", code: "JPN", facultyId: 3, description: "Ngôn ngữ và văn hóa Nhật Bản", studentCount: 90, isActive: false },
  ]);

  // State cho form thêm Faculty
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [newFaculty, setNewFaculty] = useState({ 
    name: "", 
    code: "",
    description: "",
    isActive: true
  });

  // State cho form thêm Major
  const [showMajorModal, setShowMajorModal] = useState(false);
  const [newMajor, setNewMajor] = useState({ 
    name: "", 
    code: "",
    facultyId: "",
    description: "",
    isActive: true
  });

  // State cho form chỉnh sửa Major
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMajor, setEditingMajor] = useState(null);

  // Lọc majors theo faculty
  const filteredMajors = selectedFaculty === "all" 
    ? majors 
    : majors.filter(major => major.facultyId === parseInt(selectedFaculty));

  // Đếm số major active
  const activeCount = filteredMajors.filter(m => m.isActive).length;
  const totalCount = filteredMajors.length;

  // Đếm tổng số sinh viên
  const totalStudents = filteredMajors.reduce((sum, m) => sum + m.studentCount, 0);

  // Thêm Faculty mới
  const handleAddFaculty = (e) => {
    e.preventDefault();
    if (!newFaculty.name.trim()) return alert("Tên khoa không được để trống");
    if (!newFaculty.code.trim()) return alert("Mã khoa không được để trống");

    const faculty = {
      id: faculties.length + 1,
      name: newFaculty.name.trim(),
      code: newFaculty.code.trim().toUpperCase(),
      description: newFaculty.description.trim(),
      isActive: newFaculty.isActive,
    };

    setFaculties([...faculties, faculty]);
    alert(`✅ Đã thêm khoa "${faculty.name}" thành công!`);
    setShowFacultyModal(false);
    setNewFaculty({ name: "", code: "", description: "", isActive: true });
  };

  // Thêm Major mới
  const handleAddMajor = (e) => {
    e.preventDefault();
    if (!newMajor.name.trim()) return alert("Tên chuyên ngành không được để trống");
    if (!newMajor.code.trim()) return alert("Mã chuyên ngành không được để trống");
    if (!newMajor.facultyId) return alert("Vui lòng chọn khoa");

    const major = {
      id: majors.length + 1,
      name: newMajor.name.trim(),
      code: newMajor.code.trim().toUpperCase(),
      facultyId: parseInt(newMajor.facultyId),
      description: newMajor.description.trim(),
      studentCount: 0,
      isActive: newMajor.isActive,
    };

    setMajors([...majors, major]);
    const faculty = faculties.find(f => f.id === major.facultyId);
    alert(`✅ Đã thêm chuyên ngành "${major.name}" vào ${faculty.name}`);
    setShowMajorModal(false);
    setNewMajor({ name: "", code: "", facultyId: "", description: "", isActive: true });
  };

  // Mở form chỉnh sửa Major
  const handleEditMajor = (e, major) => {
    e.stopPropagation();
    setEditingMajor({ ...major });
    setShowEditModal(true);
  };

  // Lưu chỉnh sửa Major
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingMajor.name.trim()) return alert("Tên chuyên ngành không được để trống");

    setMajors(majors.map(m => 
      m.id === editingMajor.id ? editingMajor : m
    ));
    
    alert(`✅ Đã cập nhật thông tin chuyên ngành "${editingMajor.name}"`);
    setShowEditModal(false);
    setEditingMajor(null);
  };

  // Xem danh sách sinh viên trong major
  const handleViewStudents = (major) => {
    if (!major.isActive) {
      return alert("Chuyên ngành này đang không hoạt động!");
    }
    navigate(`/admin/faculty-management/student-management/${major.id}`, {
      state: { major, faculty: faculties.find(f => f.id === major.facultyId) }
    });
  };

  // Get faculty name
  const getFacultyName = (facultyId) => {
    const faculty = faculties.find(f => f.id === facultyId);
    return faculty ? faculty.name : "N/A";
  };

  return (
    <div className="faculty-container">
      {/* HEADER */}
      <div className="faculty-header">
        <div>
          <h1>Quản lý Khoa và Chuyên ngành</h1>
          <p>Xem và quản lý danh sách các khoa và chuyên ngành đào tạo</p>
        </div>
        <div className="header-actions">
          <button className="add-major-btn" onClick={() => setShowMajorModal(true)}>
            + Thêm Chuyên ngành
          </button>
          <button className="add-faculty-btn" onClick={() => setShowFacultyModal(true)}>
            + Thêm Khoa
          </button>
        </div>
      </div>

      {/* BỘ LỌC VÀ THỐNG KÊ */}
      <div className="filter-section">
        <div className="filter-left">
          <label>Lọc theo Khoa:</label>
          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
          >
            <option value="all">Tất cả các Khoa</option>
            {faculties.filter(f => f.isActive).map(faculty => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.name} ({faculty.code})
              </option>
            ))}
          </select>
        </div>
        <div className="stats-info">
          <span className="stat-item active">
            ✓ Đang hoạt động: <strong>{activeCount}</strong>
          </span>
          <span className="stat-item total">
            Tổng chuyên ngành: <strong>{totalCount}</strong>
          </span>
          <span className="stat-item students">
            👨‍🎓 Sinh viên: <strong>{totalStudents}</strong>
          </span>
        </div>
      </div>

      {/* DANH SÁCH CHUYÊN NGÀNH */}
      <div className="major-list">
        {filteredMajors.length === 0 ? (
          <p className="no-data">Chưa có chuyên ngành nào.</p>
        ) : (
          filteredMajors.map((major) => (
            <div
              key={major.id}
              className={`major-item ${!major.isActive ? 'inactive' : ''}`}
              onClick={() => handleViewStudents(major)}
            >
              <div className="major-info">
                <div className="major-header-row">
                  <h3>{major.name}</h3>
                  <span className={`status-badge ${major.isActive ? 'active' : 'inactive'}`}>
                    {major.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
                <p>Mã: {major.code} | Khoa: {getFacultyName(major.facultyId)}</p>
                <p className="major-description">{major.description}</p>
                <p className="student-count">👨‍🎓 {major.studentCount} sinh viên</p>
              </div>
              <div className="major-actions">
                <button 
                  className="edit-btn"
                  onClick={(e) => handleEditMajor(e, major)}
                >
                  ✏️ Chỉnh sửa
                </button>
                <span className="view-students-link">→ Xem sinh viên</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* POPUP THÊM KHOA */}
      {showFacultyModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Thêm Khoa mới</h2>
              <button className="close-btn" onClick={() => setShowFacultyModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleAddFaculty} className="modal-form">
              <label>Tên Khoa:</label>
              <input
                type="text"
                value={newFaculty.name}
                onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                placeholder="Ví dụ: Khoa Công nghệ Thông tin"
              />

              <label>Mã Khoa:</label>
              <input
                type="text"
                value={newFaculty.code}
                onChange={(e) => setNewFaculty({ ...newFaculty, code: e.target.value })}
                placeholder="Ví dụ: IT"
              />

              <label>Mô tả:</label>
              <textarea
                value={newFaculty.description}
                onChange={(e) => setNewFaculty({ ...newFaculty, description: e.target.value })}
                placeholder="Nhập mô tả khoa..."
                rows="3"
                className="textarea-input"
              />

              <label className="checkbox-label-inline">
                <input
                  type="checkbox"
                  checked={newFaculty.isActive}
                  onChange={(e) => setNewFaculty({ ...newFaculty, isActive: e.target.checked })}
                />
                <span>Kích hoạt khoa</span>
              </label>

              <div className="modal-actions">
                <button type="submit" className="save-btn">Lưu</button>
                <button type="button" className="cancel-btn" onClick={() => setShowFacultyModal(false)}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP THÊM CHUYÊN NGÀNH */}
      {showMajorModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Thêm Chuyên ngành mới</h2>
              <button className="close-btn" onClick={() => setShowMajorModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleAddMajor} className="modal-form">
              <label>Chọn Khoa:</label>
              <select
                value={newMajor.facultyId}
                onChange={(e) => setNewMajor({ ...newMajor, facultyId: e.target.value })}
              >
                <option value="">-- Chọn khoa --</option>
                {faculties.filter(f => f.isActive).map(faculty => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name} ({faculty.code})
                  </option>
                ))}
              </select>

              <label>Tên Chuyên ngành:</label>
              <input
                type="text"
                value={newMajor.name}
                onChange={(e) => setNewMajor({ ...newMajor, name: e.target.value })}
                placeholder="Ví dụ: Khoa học Máy tính"
              />

              <label>Mã Chuyên ngành:</label>
              <input
                type="text"
                value={newMajor.code}
                onChange={(e) => setNewMajor({ ...newMajor, code: e.target.value })}
                placeholder="Ví dụ: CS"
              />

              <label>Mô tả:</label>
              <textarea
                value={newMajor.description}
                onChange={(e) => setNewMajor({ ...newMajor, description: e.target.value })}
                placeholder="Nhập mô tả chuyên ngành..."
                rows="3"
                className="textarea-input"
              />

              <label className="checkbox-label-inline">
                <input
                  type="checkbox"
                  checked={newMajor.isActive}
                  onChange={(e) => setNewMajor({ ...newMajor, isActive: e.target.checked })}
                />
                <span>Kích hoạt chuyên ngành</span>
              </label>

              <div className="modal-actions">
                <button type="submit" className="save-btn">Lưu</button>
                <button type="button" className="cancel-btn" onClick={() => setShowMajorModal(false)}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP CHỈNH SỬA CHUYÊN NGÀNH */}
      {showEditModal && editingMajor && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Chỉnh sửa Chuyên ngành</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="modal-form">
              <label>Khoa:</label>
              <select
                value={editingMajor.facultyId}
                onChange={(e) => setEditingMajor({ ...editingMajor, facultyId: parseInt(e.target.value) })}
              >
                {faculties.map(faculty => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name} ({faculty.code})
                  </option>
                ))}
              </select>

              <label>Tên Chuyên ngành:</label>
              <input
                type="text"
                value={editingMajor.name}
                onChange={(e) => setEditingMajor({ ...editingMajor, name: e.target.value })}
              />

              <label>Mã Chuyên ngành:</label>
              <input
                type="text"
                value={editingMajor.code}
                onChange={(e) => setEditingMajor({ ...editingMajor, code: e.target.value })}
              />

              <label>Mô tả:</label>
              <textarea
                value={editingMajor.description}
                onChange={(e) => setEditingMajor({ ...editingMajor, description: e.target.value })}
                rows="3"
                className="textarea-input"
              />

              <label className="checkbox-label-inline">
                <input
                  type="checkbox"
                  checked={editingMajor.isActive}
                  onChange={(e) => setEditingMajor({ ...editingMajor, isActive: e.target.checked })}
                />
                <span>{editingMajor.isActive ? 'Đang hoạt động' : 'Không hoạt động'}</span>
              </label>

              <div className="modal-actions">
                <button type="submit" className="save-btn">Lưu thay đổi</button>
                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}