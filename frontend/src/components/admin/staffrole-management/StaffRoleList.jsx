import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StaffRoleList.css";

export default function StaffRoleList() {
  const navigate = useNavigate();

  // ⚙️ Fake data danh sách departments
  const allDepartments = [
    { id: 1, name: "Phòng Công tác Sinh viên", staffType: "CTSV" },
    { id: 2, name: "Phòng Học vụ", staffType: "CTSV" },
    { id: 3, name: "Ký túc xá Khu A", staffType: "KTX" },
    { id: 4, name: "Ký túc xá Khu B", staffType: "KTX" },
  ];

  // ⚙️ Fake data danh sách staff roles
  const [staffRoles, setStaffRoles] = useState([
    {
      id: 1,
      name: "Trưởng phòng",
      description: "Quản lý và điều hành toàn bộ phòng ban",
      departments: [1, 2], // IDs của departments
      isActive: true,
    },
    {
      id: 2,
      name: "Nhân viên hỗ trợ",
      description: "Hỗ trợ công việc hành chính và tư vấn sinh viên",
      departments: [1, 2, 3, 4],
      isActive: true,
    },
    {
      id: 3,
      name: "Thư ký sinh viên",
      description: "Quản lý hồ sơ và giấy tờ sinh viên",
      departments: [1, 2],
      isActive: true,
    },
    {
      id: 4,
      name: "Chuyên viên tư vấn",
      description: "Tư vấn học tập và định hướng nghề nghiệp",
      departments: [1],
      isActive: false,
    },
  ]);

  // ⚙️ State cho modal thêm/sửa role
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    departments: [],
    isActive: true,
  });

  // 👉 Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      departments: [],
      isActive: true,
    });
    setSelectedRole(null);
    setIsEditMode(false);
  };

  // 👉 Mở modal thêm mới
  const handleAddRole = () => {
    resetForm();
    setShowModal(true);
  };

  // 👉 Mở modal chỉnh sửa
  const handleEditRole = (role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      departments: role.departments,
      isActive: role.isActive,
    });
    setIsEditMode(true);
    setShowModal(true);
  };

  // 👉 Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // 👉 Handle department selection
  const handleDepartmentToggle = (deptId) => {
    const currentDepts = formData.departments;
    if (currentDepts.includes(deptId)) {
      setFormData({
        ...formData,
        departments: currentDepts.filter((id) => id !== deptId),
      });
    } else {
      setFormData({
        ...formData,
        departments: [...currentDepts, deptId],
      });
    }
  };

  // 👉 Lưu role (thêm mới hoặc cập nhật)
  const handleSaveRole = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      return alert("❌ Vui lòng nhập tên vai trò");
    }
    if (formData.departments.length === 0) {
      return alert("❌ Vai trò phải thuộc ít nhất 1 phòng ban");
    }

    if (isEditMode) {
      // Cập nhật role
      setStaffRoles(
        staffRoles.map((role) =>
          role.id === selectedRole.id
            ? { ...role, ...formData }
            : role
        )
      );
      alert(`✅ Đã cập nhật vai trò: ${formData.name}`);
    } else {
      // Thêm role mới
      const newRole = {
        id: Math.max(...staffRoles.map((r) => r.id)) + 1,
        ...formData,
      };
      setStaffRoles([...staffRoles, newRole]);
      alert(`✅ Đã thêm vai trò mới: ${formData.name}`);
    }

    setShowModal(false);
    resetForm();
  };

  // 👉 Toggle trạng thái active
  const handleToggleActive = (roleId) => {
    setStaffRoles(
      staffRoles.map((role) =>
        role.id === roleId ? { ...role, isActive: !role.isActive } : role
      )
    );
  };

  // 👉 Xóa role
  const handleDeleteRole = (role) => {
    if (window.confirm(`Bạn có chắc muốn xóa vai trò "${role.name}"?`)) {
      setStaffRoles(staffRoles.filter((r) => r.id !== role.id));
      alert(`✅ Đã xóa vai trò: ${role.name}`);
    }
  };

  // 👉 Get department names
  const getDepartmentNames = (deptIds) => {
    return deptIds
      .map((id) => allDepartments.find((d) => d.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  // 👉 Back button
  const handleBack = () => {
    navigate("/admin/department-management");
  };

  return (
    <div className="staff-role-page">
      {/* HEADER */}
      <div className="staff-role-header">
        <div className="header-content">
          <button className="back-btn" onClick={handleBack}>
            ← Quay lại
          </button>
          <div className="header-text">
            <h1>Quản lý vai trò nhân viên</h1>
            <p>Định nghĩa các vai trò và phân quyền cho từng phòng ban</p>
          </div>
        </div>
        <button className="add-role-btn" onClick={handleAddRole}>
          + Thêm vai trò
        </button>
      </div>

      {/* DANH SÁCH ROLES */}
      <div className="staff-role-list">
        {staffRoles.length === 0 ? (
          <p className="no-role">Chưa có vai trò nào được định nghĩa.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Tên vai trò</th>
                <th>Mô tả</th>
                <th>Phòng ban áp dụng</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {staffRoles.map((role) => (
                <tr key={role.id}>
                  <td>
                    <strong>{role.name}</strong>
                  </td>
                  <td className="description-cell">
                    {role.description || <em>Không có mô tả</em>}
                  </td>
                  <td className="departments-cell">
                    {getDepartmentNames(role.departments)}
                  </td>
                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={role.isActive}
                        onChange={() => handleToggleActive(role.id)}
                      />
                      <span className="slider"></span>
                    </label>
                    <span className={`status-text ${role.isActive ? 'active' : 'inactive'}`}>
                      {role.isActive ? "Hoạt động" : "Tạm dừng"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => handleEditRole(role)}
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteRole(role)}
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL THÊM/SỬA ROLE */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{isEditMode ? `Chỉnh sửa: ${selectedRole?.name}` : "Thêm vai trò mới"}</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-form">
              <label>
                Tên vai trò: <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="VD: Trưởng phòng, Nhân viên hỗ trợ..."
                required
              />

              <label>Mô tả:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Mô tả về vai trò này..."
                rows="3"
              />

              <label>
                Áp dụng cho phòng ban: <span className="required">*</span>
              </label>
              <div className="department-checkboxes">
                {allDepartments.map((dept) => (
                  <label key={dept.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.departments.includes(dept.id)}
                      onChange={() => handleDepartmentToggle(dept.id)}
                    />
                    <span>
                      {dept.name} ({dept.staffType})
                    </span>
                  </label>
                ))}
              </div>

              {formData.departments.length === 0 && (
                <div className="warning-box">
                  ⚠️ Vui lòng chọn ít nhất 1 phòng ban
                </div>
              )}

              <label className="checkbox-label-inline">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <span>Kích hoạt vai trò này</span>
              </label>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="save-btn"
                  onClick={handleSaveRole}
                >
                  {isEditMode ? "Cập nhật" : "Thêm mới"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}