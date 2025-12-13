import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StaffList.css";

export default function StaffList() {
  const navigate = useNavigate();

  // ⚙️ Giả lập dữ liệu phòng ban được chọn (ví dụ từ router param)
  const department = {
    id: 1,
    name: "Phòng Công tác Sinh viên",
    staffType: "CTSV",
  };

  // ⚙️ Fake data danh sách departments (để chuyển phòng ban)
  const allDepartments = [
    { id: 1, name: "Phòng Công tác Sinh viên", staffType: "CTSV" },
    { id: 2, name: "Phòng Học vụ", staffType: "CTSV" },
    { id: 3, name: "Ký túc xá Khu A", staffType: "KTX" },
    { id: 4, name: "Ký túc xá Khu B", staffType: "KTX" },
  ];

  // ⚙️ Fake data danh sách staff với trạng thái mới
  const [staffs, setStaffs] = useState([
    { 
      id: 1, 
      name: "Nguyễn Văn A", 
      email: "nguyenvana@tdtu.edu.vn", 
      role: "Trưởng phòng", 
      status: "ACTIVE",
      departmentId: 1
    },
    { 
      id: 2, 
      name: "Trần Thị B", 
      email: "tranthib@tdtu.edu.vn", 
      role: "Nhân viên hỗ trợ", 
      status: "ACTIVE",
      departmentId: 1
    },
    { 
      id: 3, 
      name: "Lê Văn C", 
      email: "levanc@tdtu.edu.vn", 
      role: "Thư ký sinh viên", 
      status: "ON_LEAVE",
      departmentId: 1
    },
    { 
      id: 4, 
      name: "Phạm Thị D", 
      email: "phamthid@tdtu.edu.vn", 
      role: "Nhân viên hỗ trợ", 
      status: "RETIRED",
      departmentId: 1
    },
  ]);

  // ⚙️ Fake data các role khả dụng (sẽ lấy từ StaffRole trong DB sau)
  const availableRoles = [
    "Trưởng phòng",
    "Nhân viên hỗ trợ",
    "Thư ký sinh viên",
    "Chuyên viên tư vấn",
  ];

  // ⚙️ Danh sách trạng thái staff
  const staffStatuses = [
    { value: 'ACTIVE', label: 'Đang làm việc' },
    { value: 'INACTIVE', label: 'Không hoạt động' },
    { value: 'RETIRED', label: 'Đã nghỉ hưu' },
    { value: 'ON_LEAVE', label: 'Đang nghỉ phép' },
    { value: 'TERMINATED', label: 'Đã thôi việc' },
  ];

  // ⚙️ State cho popup phân quyền
  const [showModal, setShowModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [newDepartmentId, setNewDepartmentId] = useState(""); // null = giữ nguyên phòng ban

  // 👉 Khi admin nhấn "Phân quyền"
  const handleAssignRole = (staff) => {
    setSelectedStaff(staff);
    setNewRole(staff.role);
    setNewDepartmentId(""); // Mặc định là null (không chuyển phòng)
    setShowModal(true);
  };

  // Navigate to Add Staff page
  const handleAddStaff = () => {
    navigate('/admin/department-management/add-staff', {
      state: { department }
    });
  };

  // 👉 Lưu thay đổi role
  const handleSaveRole = (e) => {
    e.preventDefault();
    
    // Validation: Role không được để trống
    if (!newRole.trim()) {
      return alert("❌ Vui lòng chọn vai trò hợp lệ");
    }

    // Mock logic update
    const updatedStaff = {
      ...selectedStaff,
      role: newRole,
      departmentId: newDepartmentId ? parseInt(newDepartmentId) : selectedStaff.departmentId
    };

    setStaffs(
      staffs.map((s) =>
        s.id === selectedStaff.id ? updatedStaff : s
      )
    );

    // Thông báo kết quả
    if (newDepartmentId) {
      const newDept = allDepartments.find(d => d.id === parseInt(newDepartmentId));
      alert(`✅ Đã cập nhật:\n- Vai trò: ${newRole}\n- Chuyển sang: ${newDept.name}`);
    } else {
      alert(`✅ Đã cập nhật vai trò cho ${selectedStaff.name} thành: ${newRole}\n(Giữ nguyên phòng ban hiện tại)`);
    }
    
    setShowModal(false);
  };

  // 👉 Get status label
  const getStatusLabel = (status) => {
    const statusObj = staffStatuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  // 👉 Get status class
  const getStatusClass = (status) => {
    const statusMap = {
      'ACTIVE': 'status-active',
      'INACTIVE': 'status-inactive',
      'RETIRED': 'status-retired',
      'ON_LEAVE': 'status-leave',
      'TERMINATED': 'status-terminated',
    };
    return statusMap[status] || 'status-inactive';
  };

  // 👉 Back button functionality
  const handleBack = () => {
    navigate('/admin/department-management');
  };

  return (
    <div className="staff-page">
      {/* HEADER */}
      <div className="staff-header">
        <div className="header-content">
          <button className="back-btn" onClick={handleBack}>
            ← Quay lại
          </button>
          <div className="header-text">
            <h1>Quản lý nhân sự</h1>
            <p>
              Danh sách nhân viên thuộc{" "}
              <strong>
                {department.name} ({department.staffType})
              </strong>
            </p>
          </div>
        </div>
        <button className="add-staff-btn" onClick={handleAddStaff}>
          + Thêm nhân viên
        </button>
      </div>

      {/* DANH SÁCH STAFF */}
      <div className="staff-list">
        {staffs.length === 0 ? (
          <p className="no-staff">Chưa có nhân viên nào trong phòng ban này.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Tên nhân viên</th>
                <th>Email</th>
                <th>Chức vụ hiện tại</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {staffs.map((staff) => (
                <tr key={staff.id}>
                  <td>{staff.name}</td>
                  <td>{staff.email}</td>
                  <td>{staff.role}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(staff.status)}`}>
                      {getStatusLabel(staff.status)}
                    </span>
                  </td>
                  <td>
                    <button
                      className="assign-btn"
                      onClick={() => handleAssignRole(staff)}
                    >
                      Phân quyền
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* POPUP PHÂN QUYỀN */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Phân quyền cho {selectedStaff.name}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="modal-form">
              <label>
                Chọn chức vụ mới: <span className="required">*</span>
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                required
              >
                <option value="">-- Chọn vai trò --</option>
                {availableRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <label>
                Chuyển phòng ban (tùy chọn):
              </label>
              <select
                value={newDepartmentId}
                onChange={(e) => setNewDepartmentId(e.target.value)}
              >
                <option value="">-- Giữ nguyên phòng ban hiện tại --</option>
                {allDepartments
                  .filter(d => d.id !== selectedStaff.departmentId)
                  .map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.staffType})
                    </option>
                  ))}
              </select>

              {newDepartmentId && (
                <div className="info-box">
                  ℹ️ Nhân viên sẽ được chuyển sang phòng ban mới
                </div>
              )}

              <div className="current-info">
                <p><strong>Thông tin hiện tại:</strong></p>
                <p>• Vai trò: {selectedStaff.role}</p>
                <p>• Phòng ban: {allDepartments.find(d => d.id === selectedStaff.departmentId)?.name}</p>
                <p>• Trạng thái: {getStatusLabel(selectedStaff.status)}</p>
              </div>

              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  Lưu thay đổi
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
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