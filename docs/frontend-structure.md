# Cau truc Frontend UniHelper

Tai lieu nay tom tat nhanh cach frontend duoc to chuc de ca nhom de dang tiep nhan va mo rong.

## Tong quan
- Nen tang: Vite + React 19 (`frontend/package.json`).
- `src/main.jsx` khoi tao React root va boc `<App />` trong `BrowserRouter` de ho tro routing.
- `App.jsx` su dung React Router V6 map cac route tu `src/routes` (student, staff, admin) va redirect `/` ve `/student/dashboard`.
- Styles duoc tach theo tung component/layout bang cac file `.css`.
- Co the boc toan bo ung dung bang `AuthProvider` (`src/contexts/AuthContext.js`) khi tich hop dang nhap.

## Cay thu muc chinh
```
frontend/
|-- src/
|   |-- assets/              # Anh, icon, font...
|   |-- components/
|   |   |-- common/          # Layout, Sidebar, Modal dung chung
|   |   |-- student/         # Chuc nang giao dien cho sinh vien
|   |   |-- staff/           # Chuc nang giao dien cho nhan vien
|   |   `-- admin/           # (Dang placeholder) thanh phan cho admin
|   |-- constants/           # menuConfig, roles, permissions
|   |-- contexts/            # AuthContext va cac provider khac
|   |-- hooks/               # Custom hooks (vi du: useAuth)
|   |-- layouts/             # Layout wrap cho tung vai tro (Student/Staff/Admin)
|   |-- routes/              # Cau hinh route cho moi vai tro
|   |-- services/            # Goi API chia theo vai tro va auth
|   `-- utils/               # Ham tien ich (format date, currency...)
|-- App.jsx
|-- App.css
|-- main.jsx
`-- index.css
```

## Component va Layout
- `components/common/Layout`: Layout dung chung, nhan prop `userRole` va hien `Sidebar` tuong ung, noi dung chinh la children (thuong la `<Outlet />`).
- `components/common/Sidebar`: Doc `MENU_CONFIGS` de render menu theo vai tro, ho tro submenu "Gui yeu cau" va highlight theo URL hien tai bang `NavLink`.
- `components/student/dashboard`: Dashboard sinh vien gom thong ke yeu cau, modal danh sach va `ProfilePanel`.
- `components/staff/dashboard`: Dashboard nhan vien hien thi tong quan, thong ke va tac vu nhanh.
- `components/staff/cts`, `components/staff/ttx`, `components/staff/history`, `components/staff/department`: Cac trang rieng phuc vu yeu cau CTSV, yeu cau TTX, lich su xu ly va thong tin phong ban.
- `components/student/profile/ProfilePanel`: Panel thong tin ca nhan co san.
- `components/common/Modal`: Modal dung chung voi props `isOpen`, `onClose`, `title`.

## Context, Hooks va Trang thai
- `contexts/AuthContext.js`: Cung cap `AuthProvider` va hook `useAuthContext`.
- `hooks/useAuth.js`: Quan ly trang thai dang nhap thong qua `authService` (dang mock localStorage).

## Dinh tuyen
- Thu muc `routes/` chua cac mang route (student/staff/admin) truyen vao `<Routes>` trong `App.jsx`.
- Moi route la mot layout (StudentLayout/StaffLayout/AdminLayout) boc `<Layout>` va render `<Outlet />`.
- `menuConfig.js` khai bao duong dan (`path`) de `Sidebar` dieu huong thang toi cac page (vd `/staff/dashboard`, `/student/student-affairs`).
- Route staff gom `StaffDashboard`, trang yeu cau CTSV (`/staff/cts-requests`), yeu cau TTX (`/staff/ttx-requests`), lich su xu ly (`/staff/history`) va phong ban (`/staff/department`); student route su dung `Dashboard`, `StudentAffairs`, `ProfilePanel` va placeholder cho cac trang chua xong.

## Dich vu API
- `services/api.js`: Tao axios client chung, set `baseURL` va interceptor token/401.
- `services/auth.js`: Xu ly login/logout, luu token + role trong localStorage.
- `services/student.js`, `staff.js`, `admin.js`: Gom cac API dac thu tung vai tro (profile, requests, dashboard...).
- `services/index.js`: Re-export de import ngan gon.

## Constants va Utils
- `constants/menuConfig.js`: Cau hinh menu + path theo tung vai tro.
- `constants/roles.js`, `constants/permissions.js`: Dinh nghia role va quyen.
- `utils/index.js`: Ham tien ich (formatDate, formatCurrency, isValidEmail...).

## Styles
- Moi component/layout co file `.css` cung ten.
- `App.css` + `index.css` chua style tong.
- Sidebar + Layout su dung gradient va responsive (thu gon sidebar duoi 768px).

## Huong mo rong
- Ket noi cac service toi backend, thay mock data trong dashboard bang API that.
- Bo sung cac man hinh staff/admin khac (requests, reports, settings...) theo cau truc da co.
- Tich hop `AuthProvider` de dieu huong theo quyen truy cap va tinh nang dang nhap.
- Viet test UI hoac unit test cho cac hook/service khi can.
