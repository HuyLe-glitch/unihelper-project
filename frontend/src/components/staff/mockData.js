// Dữ liệu mô phỏng cho các màn nhân viên (sẽ thay bằng API thực tế)
export const CTSV_REQUESTS = [
  { id: 'CTS-2301', student: 'Nguyễn Văn An', status: 'processing', submittedAt: '2024-10-12' },
  { id: 'CTS-2298', student: 'Trần Thị Bình', status: 'approved', submittedAt: '2024-10-11' },
  { id: 'CTS-2295', student: 'Lê Hoàng Nam', status: 'needs-update', submittedAt: '2024-10-10' },
  { id: 'CTS-2289', student: 'Phạm Minh Châu', status: 'processing', submittedAt: '2024-10-08' },
];

export const TTX_REQUESTS = [
  { id: 'TTX-1045', student: 'Phạm Thảo Vy', room: 'A3-204', status: 'pending-confirmation', submittedAt: '2024-10-12' },
  { id: 'TTX-1039', student: 'Hoàng Minh Quân', room: 'B1-108', status: 'assigned', submittedAt: '2024-10-09' },
  { id: 'TTX-1032', student: 'Võ Đức Huy', room: '', status: 'rejected', submittedAt: '2024-10-07' },
  { id: 'TTX-1028', student: 'Nguyễn Bảo Hân', room: 'C2-305', status: 'processing', submittedAt: '2024-10-05' },
];

export const STAFF_HISTORY = [
  { id: 'HIS-2201', type: 'CTS', action: 'Đã duyệt chứng nhận CTSV', staff: 'Lê Thị Nhàn', time: '12/10/2024 15:30' },
  { id: 'HIS-2198', type: 'TTX', action: 'Từ chối yêu cầu TTX', staff: 'Đỗ Minh Thu', time: '12/10/2024 09:45' },
  { id: 'HIS-2194', type: 'CTS', action: 'Yêu cầu bổ sung hồ sơ CTSV', staff: 'Trần Văn Hùng', time: '11/10/2024 16:20' },
  { id: 'HIS-2188', type: 'TTX', action: 'Đã xếp phòng TTX', staff: 'Phạm Nhật Anh', time: '10/10/2024 14:05' },
];

export const STAFF_DEPARTMENT_INFO = {
  name: 'Phòng Công tác Sinh viên',
  advisor: 'ThS. Trần Thanh Tùng',
  email: 'ctsv@unihelper.edu.vn',
  phone: '(028) 377 550 301',
  workingHours: 'Thứ 2 - Thứ 6, 8:00 - 16:30',
  address: 'Tầng 2, Nhà Điều hành',
  responsibilities: [
    'Hỗ trợ và giải đáp các yêu cầu CTSV',
    'Phối hợp với Trung tâm TTX trong việc xếp phòng',
    'Quản lý thông tin, hồ sơ sinh viên',
  ],
};
