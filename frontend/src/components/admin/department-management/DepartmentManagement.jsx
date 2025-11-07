import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DepartmentManagement.css";

export default function DepartmentManagement() {
  const navigate = useNavigate();

  // Bộ lọc StaffType
  const [selectedType, setSelectedType] = useState("CTSV");

  // Fake data mô phỏng danh sách phòng ban
  const [departments, setDepartments] = useState([
    { id: 1, name: "Phòng Công tác Sinh viên", staffType: "CTSV" },
    { id: 2, name: "Phòng Học vụ", staffType: "CTSV" },
    { id: 3, name: "Ký túc xá Khu A", staffType: "KTX" },
    { id: 4, name: "Ký túc xá Khu B", staffType: "KTX" },
  ]);

  // Fake data staff roles
  const [staffRoles, setStaffRoles] = useState([
    { id: 1, roleName: "Trưởng phòng", departmentId: 1 },
    { id: 2, roleName: "Nhân viên hỗ trợ", departmentId: 1 },
    { id: 3, roleName: "Quản lý KTX", departmentId: 3 },
  ]);

  // State cho form thêm phòng ban
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [newDept, setNewDept] = useState({ name: "", staffType: "CTSV" });

  // State cho form thêm staff role
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState({ roleName: "", departmentId: "" });

  // Lọc department theo staffType
  const filteredDepartments = departments.filter(
    (dept) => dept.staffType === selectedType
  );

  // Thêm phòng ban mới
  const handleAddDepartment = (e) => {
    e.preventDefault();
    if (!newDept.name.trim()) return alert("Tên phòng ban không được để trống");

    const newDepartment = {
      id: departments.length + 1,
      name: newDept.name.trim(),
      staffType: newDept.staffType,
    };

    setDepartments([...departments, newDepartment]);
    setShowDeptModal(false);
    setNewDept({ name: "", staffType: "CTSV" });
  };

  // Thêm staff role mới
  const handleAddStaffRole = (e) => {
    e.preventDefault();
    if (!newRole.roleName.trim()) return alert("Tên vai trò không được để trống");
    if (!newRole.departmentId) return alert("Vui lòng chọn phòng ban");

    const newStaffRole = {
      id: staffRoles.length + 1,
      roleName: newRole.roleName.trim(),
      departmentId: parseInt(newRole.departmentId),
    };

    setStaffRoles([...staffRoles, newStaffRole]);
    alert(`✅ Đã thêm vai trò "${newStaffRole.roleName}" thành công!`);
    setShowRoleModal(false);
    setNewRole({ roleName: "", departmentId: "" });
  };

  // Xem chi tiết staff trong department
  const handleViewStaff = (dept) => {
    alert(`Đi đến danh sách nhân viên của ${dept.name}`);
    navigate(`/admin/staff-management`);
  };

  return (
    <div className="department-container">
      {/* HEADER */}
      <div className="department-header">
        <div>
          <h1>Quản lý Phòng ban</h1>
          <p>Xem và quản lý danh sách các phòng ban thuộc hệ thống</p>
        </div>
        <div className="header-actions">
          <button className="add-role-btn" onClick={() => setShowRoleModal(true)}>
            + Thêm vai trò
          </button>
          <button className="add-dept-btn" onClick={() => setShowDeptModal(true)}>
            + Thêm Phòng ban
          </button>
        </div>
      </div>

      {/* BỘ LỌC */}
      <div className="filter-section">
        <label>Chọn loại phòng ban:</label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="CTSV">CTSV</option>
          <option value="KTX">KTX</option>
        </select>
      </div>

      {/* DANH SÁCH PHÒNG BAN */}
      <div className="department-list">
        {filteredDepartments.length === 0 ? (
          <p className="no-data">Chưa có phòng ban nào trong {selectedType}.</p>
        ) : (
          filteredDepartments.map((dept) => (
            <div
              key={dept.id}
              className="department-item"
              onClick={() => handleViewStaff(dept)}
            >
              <div className="dept-info">
                <h3>{dept.name}</h3>
                <p>Loại: {dept.staffType}</p>
              </div>
              <span className="view-staff-link">→ Xem nhân viên</span>
            </div>
          ))
        )}
      </div>

      {/* POPUP THÊM PHÒNG BAN */}
      {showDeptModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Thêm Phòng ban mới</h2>
              <button className="close-btn" onClick={() => setShowDeptModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleAddDepartment} className="modal-form">
              <label>Tên phòng ban:</label>
              <input
                type="text"
                value={newDept.name}
                onChange={(e) =>
                  setNewDept({ ...newDept, name: e.target.value })
                }
                placeholder="Nhập tên phòng ban..."
              />

              <label>Loại phòng ban:</label>
              <select
                value={newDept.staffType}
                onChange={(e) =>
                  setNewDept({ ...newDept, staffType: e.target.value })
                }
              >
                <option value="CTSV">CTSV</option>
                <option value="KTX">KTX</option>
              </select>

              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  Lưu
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowDeptModal(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP THÊM STAFF ROLE */}
      {showRoleModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Thêm vai trò nhân viên</h2>
              <button className="close-btn" onClick={() => setShowRoleModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleAddStaffRole} className="modal-form">
              <label>Tên vai trò:</label>
              <input
                type="text"
                value={newRole.roleName}
                onChange={(e) =>
                  setNewRole({ ...newRole, roleName: e.target.value })
                }
                placeholder="Ví dụ: Trưởng phòng, Nhân viên..."
              />

              <label>Chọn phòng ban:</label>
              <select
                value={newRole.departmentId}
                onChange={(e) =>
                  setNewRole({ ...newRole, departmentId: e.target.value })
                }
              >
                <option value="">-- Chọn phòng ban --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.staffType})
                  </option>
                ))}
              </select>

              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  Lưu vai trò
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowRoleModal(false)}
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