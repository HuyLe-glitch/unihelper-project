import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DepartmentList.css";

export default function DepartmentList() {
  const navigate = useNavigate();

  // Bộ lọc StaffType
  const [selectedType, setSelectedType] = useState("CTSV");

  // Fake data mô phỏng danh sách phòng ban (với description và isActive)
  const [departments, setDepartments] = useState([
    { 
      id: 1, 
      name: "Phòng Công tác Sinh viên", 
      staffType: "CTSV",
      description: "Quản lý các hoạt động và hỗ trợ sinh viên",
      isActive: true
    },
    { 
      id: 2, 
      name: "Phòng Học vụ", 
      staffType: "CTSV",
      description: "Quản lý học tập, thi cử và chương trình đào tạo",
      isActive: true
    },
    { 
      id: 3, 
      name: "Ký túc xá Khu A", 
      staffType: "KTX",
      description: "Quản lý ký túc xá khu A - 500 chỗ ở",
      isActive: true
    },
    { 
      id: 4, 
      name: "Ký túc xá Khu B", 
      staffType: "KTX",
      description: "Quản lý ký túc xá khu B - 300 chỗ ở",
      isActive: false
    },
  ]);

  // Fake data staff roles
  const [staffRoles, setStaffRoles] = useState([
    { id: 1, roleName: "Trưởng phòng", departmentIds: [1] },
    { id: 2, roleName: "Nhân viên hỗ trợ", departmentIds: [1, 2] },
    { id: 3, roleName: "Quản lý KTX", departmentIds: [3, 4] },
  ]);

  // State cho form thêm phòng ban
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [newDept, setNewDept] = useState({ 
    name: "", 
    staffType: "CTSV",
    description: "",
    isActive: true
  });

  // State cho form chỉnh sửa phòng ban
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  // State cho form thêm staff role
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState({ roleName: "", departmentIds: [] });

  // Lọc department theo staffType
  const filteredDepartments = departments.filter(
    (dept) => dept.staffType === selectedType
  );

  // Đếm số phòng ban active
  const activeCount = filteredDepartments.filter(dept => dept.isActive).length;
  const totalCount = filteredDepartments.length;

  // Thêm phòng ban mới
  const handleAddDepartment = (e) => {
    e.preventDefault();
    if (!newDept.name.trim()) return alert("Tên phòng ban không được để trống");

    const newDepartment = {
      id: departments.length + 1,
      name: newDept.name.trim(),
      staffType: newDept.staffType,
      description: newDept.description.trim(),
      isActive: newDept.isActive,
    };

    setDepartments([...departments, newDepartment]);
    setShowDeptModal(false);
    setNewDept({ name: "", staffType: "CTSV", description: "", isActive: true });
  };

  // Mở form chỉnh sửa phòng ban
  const handleEditDepartment = (e, dept) => {
    e.stopPropagation(); // Ngăn click vào card
    setEditingDept({ ...dept });
    setShowEditModal(true);
  };

  // Lưu chỉnh sửa phòng ban
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingDept.name.trim()) return alert("Tên phòng ban không được để trống");

    setDepartments(departments.map(dept => 
      dept.id === editingDept.id ? editingDept : dept
    ));
    
    alert(`✅ Đã cập nhật thông tin phòng ban "${editingDept.name}"`);
    setShowEditModal(false);
    setEditingDept(null);
  };

  // Toggle department selection
  const handleToggleDepartment = (deptId) => {
    setNewRole(prev => {
      const isSelected = prev.departmentIds.includes(deptId);
      if (isSelected) {
        return {
          ...prev,
          departmentIds: prev.departmentIds.filter(id => id !== deptId)
        };
      } else {
        return {
          ...prev,
          departmentIds: [...prev.departmentIds, deptId]
        };
      }
    });
  };

  // Thêm staff role mới
  const handleAddStaffRole = (e) => {
    e.preventDefault();
    if (!newRole.roleName.trim()) return alert("Tên vai trò không được để trống");
    if (newRole.departmentIds.length === 0) return alert("Vui lòng chọn ít nhất một phòng ban");

    const newStaffRole = {
      id: staffRoles.length + 1,
      roleName: newRole.roleName.trim(),
      departmentIds: [...newRole.departmentIds],
    };

    setStaffRoles([...staffRoles, newStaffRole]);
    
    const selectedDeptNames = departments
      .filter(d => newRole.departmentIds.includes(d.id))
      .map(d => d.name)
      .join(", ");
    
    alert(`✅ Đã thêm vai trò "${newStaffRole.roleName}" cho: ${selectedDeptNames}`);
    setShowRoleModal(false);
    setNewRole({ roleName: "", departmentIds: [] });
  };

  // Xem chi tiết staff trong department
  const handleViewStaff = (dept) => {
    if (!dept.isActive) {
      return alert("Phòng ban này đang không hoạt động!");
    }
    alert(`Đi đến danh sách nhân viên của ${dept.name}`);
    navigate(`/admin/department-management/staff-management`);
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
          <button className="add-dept-btn" onClick={() => setShowDeptModal(true)}>
            + Thêm Phòng ban
          </button>
        </div>
      </div>

      {/* BỘ LỌC VÀ THỐNG KÊ */}
      <div className="filter-section">
        <div className="filter-left">
          <label>Chọn loại phòng ban:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="CTSV">CTSV</option>
            <option value="KTX">KTX</option>
          </select>
        </div>
        <div className="stats-info">
          <span className="stat-item active">
            ✓ Đang hoạt động: <strong>{activeCount}</strong>
          </span>
          <span className="stat-item total">
            Tổng: <strong>{totalCount}</strong>
          </span>
        </div>
      </div>

      {/* DANH SÁCH PHÒNG BAN */}
      <div className="department-list">
        {filteredDepartments.length === 0 ? (
          <p className="no-data">Chưa có phòng ban nào trong {selectedType}.</p>
        ) : (
          filteredDepartments.map((dept) => (
            <div
              key={dept.id}
              className={`department-item ${!dept.isActive ? 'inactive' : ''}`}
              onClick={() => handleViewStaff(dept)}
            >
              <div className="dept-info">
                <div className="dept-header-row">
                  <h3>{dept.name}</h3>
                  <span className={`status-badge ${dept.isActive ? 'active' : 'inactive'}`}>
                    {dept.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
                <p>Loại: {dept.staffType}</p>
                <p className="dept-description">{dept.description}</p>
              </div>
              <div className="dept-actions">
                <button 
                  className="edit-btn"
                  onClick={(e) => handleEditDepartment(e, dept)}
                >
                  ✏️ Chỉnh sửa
                </button>
                <span className="view-staff-link">→ Xem nhân viên</span>
              </div>
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

              <label>Mô tả:</label>
              <textarea
                value={newDept.description}
                onChange={(e) =>
                  setNewDept({ ...newDept, description: e.target.value })
                }
                placeholder="Nhập mô tả phòng ban..."
                rows="3"
                className="textarea-input"
              />

              <label className="checkbox-label-inline">
                <input
                  type="checkbox"
                  checked={newDept.isActive}
                  onChange={(e) =>
                    setNewDept({ ...newDept, isActive: e.target.checked })
                  }
                />
                <span>Kích hoạt phòng ban</span>
              </label>

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

      {/* POPUP CHỈNH SỬA PHÒNG BAN */}
      {showEditModal && editingDept && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Chỉnh sửa Phòng ban</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="modal-form">
              <label>Tên phòng ban:</label>
              <input
                type="text"
                value={editingDept.name}
                onChange={(e) =>
                  setEditingDept({ ...editingDept, name: e.target.value })
                }
                placeholder="Nhập tên phòng ban..."
              />

              <label>Loại phòng ban:</label>
              <select
                value={editingDept.staffType}
                onChange={(e) =>
                  setEditingDept({ ...editingDept, staffType: e.target.value })
                }
              >
                <option value="CTSV">CTSV</option>
                <option value="KTX">KTX</option>
              </select>

              <label>Mô tả:</label>
              <textarea
                value={editingDept.description}
                onChange={(e) =>
                  setEditingDept({ ...editingDept, description: e.target.value })
                }
                placeholder="Nhập mô tả phòng ban..."
                rows="3"
                className="textarea-input"
              />

              <label className="checkbox-label-inline">
                <input
                  type="checkbox"
                  checked={editingDept.isActive}
                  onChange={(e) =>
                    setEditingDept({ ...editingDept, isActive: e.target.checked })
                  }
                />
                <span>{editingDept.isActive ? 'Đang hoạt động' : 'Không hoạt động'}</span>
              </label>

              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  Lưu thay đổi
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowEditModal(false)}
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