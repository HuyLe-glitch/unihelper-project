import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StaffManagement.css";

export default function StaffManagement() {
  const navigate = useNavigate();

  // ⚙️ Giả lập dữ liệu phòng ban được chọn (ví dụ từ router param)
  const department = {
    id: 1,
    name: "Phòng Công tác Sinh viên",
    staffType: "CTSV",
  };

  // ⚙️ Fake data danh sách staff
  const [staffs, setStaffs] = useState([
    { id: 1, name: "Nguyễn Văn A", email: "nguyenvana@tdtu.edu.vn", role: "Trưởng phòng", status: "active" },
    { id: 2, name: "Trần Thị B", email: "tranthib@tdtu.edu.vn", role: "Nhân viên hỗ trợ", status: "active" },
    { id: 3, name: "Lê Văn C", email: "levanc@tdtu.edu.vn", role: "Thư ký sinh viên", status: "inactive" },
  ]);

  // ⚙️ Fake data các role khả dụng (sẽ lấy từ StaffRole trong DB sau)
  const availableRoles = [
    "Trưởng phòng",
    "Nhân viên hỗ trợ",
    "Thư ký sinh viên",
    "Chuyên viên tư vấn",
  ];

  // ⚙️ State cho popup phân quyền
  const [showModal, setShowModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [newRole, setNewRole] = useState("");

  // 👉 Khi admin nhấn "Phân quyền"
  const handleAssignRole = (staff) => {
    setSelectedStaff(staff);
    setNewRole(staff.role);
    setShowModal(true);
  };

  // 👉 Lưu thay đổi role
  const handleSaveRole = (e) => {
    e.preventDefault();
    if (!newRole.trim()) return alert("Vui lòng chọn vai trò hợp lệ");

    setStaffs(
      staffs.map((s) =>
        s.id === selectedStaff.id ? { ...s, role: newRole } : s
      )
    );
    alert(`✅ Đã cập nhật quyền cho ${selectedStaff.name} thành: ${newRole}`);
    setShowModal(false);
  };

  // 👉 Back button functionality
  const handleBack = () => {
    navigate('/admin/department-management'); // Navigate back to department list
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
            <h1>Quản lý nhân viên</h1>
            <p>
              Danh sách nhân viên thuộc{" "}
              <strong>
                {department.name} ({department.staffType})
              </strong>
            </p>
          </div>

          <button className="add-btn" onClick={() => setShowAddModal(true)}>
            + Thêm nhân viên
          </button>
        </div>
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
                    <span className={`status-badge ${staff.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                      {staff.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
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
              <label>Chọn chức vụ mới:</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                {availableRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

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