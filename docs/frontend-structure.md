# Cau truc Frontend UniHelper

Tai lieu nay tom tat nhanh cach ma phan frontend duoc to chuc de ca nhom co the nắm bat va mo rong de dang.

## Tong quan
- Cong cu: Vite + React 19 (`frontend/package.json`).
- Entry point: `src/main.jsx` khoi tao React root va render `<App />`.
- `App.jsx` hien tai nap `StudentLayout` lam giao dien chinh (se mo rong them routing vai tro sau nay).
- Styles duoc tach theo tung component/layout bang cac file `.css`.
- Sau nay co the bao boc toan bo ung dung bang `AuthProvider` tu `src/contexts/AuthContext.js` de chia se trang thai dang nhap.

## Cay thu muc chinh
```
frontend/
|-- src/
|   |-- assets/              # Anh, icon, font...
|   |-- components/
|   |   |-- common/          # Layout, Sidebar, Modal dung chung
|   |   |-- student/         # Giao dien danh rieng cho sinh vien
|   |   |-- staff/           # (Placeholder) thanh phan cho can bo
|   |   `-- admin/           # (Placeholder) thanh phan cho admin
|   |-- constants/           # roles, permissions, menuConfig
|   |-- contexts/            # AuthContext va cac Provider
|   |-- hooks/               # Custom hooks (vi du: useAuth)
|   |-- layouts/             # Layout wrap cho tung vai tro
|   |-- routes/              # Cau hinh React Router cho moi vai tro
|   |-- services/            # Goi API chia theo vai tro va auth
|   `-- utils/               # Ham tien ich (format date, currency...)
|-- App.jsx
|-- App.css
|-- main.jsx
`-- index.css
```

## Component va Layout
- `components/common/Layout`: Layout co Sidebar chung, quan ly tab active noi bo.
- `components/common/Sidebar`: Doc cau hinh tu `constants/menuConfig.js` de tao menu theo vai tro (student/staff/admin); ho tro submenu "Gui yeu cau".
- `components/student/StudentLayout/StudentLayout.jsx`: Layout cu the cho sinh vien, hien thi `Sidebar` va render noi dung theo tab.
- `components/student/dashboard`: Dashboard sinh vien gom thong ke yeu cau, modal danh sach, va `ProfilePanel`.
- `components/student/profile/ProfilePanel`: Sidebar thong tin ca nhan mac dinh.
- `components/common/Modal`: Modal co props `isOpen`, `onClose`, `title` dung chung.

## Context, Hooks va Trang thai
- `contexts/AuthContext.js`: Cung cap `AuthProvider` va hook `useAuthContext`.
- `hooks/useAuth.js`: Quan ly trang thai dang nhap (user, token) thong qua `authService`. Hien chua duoc gan vao `App` nhung san sang su dung khi tich hop backend.

## Dinh tuyen
- Thu muc `routes/` chia route theo vai tro (`studentRoutes`, `staffRoutes`, `adminRoutes`) va su dung cac layout tuong ung.
- Hien tai cac trang noi dung trong routes la placeholder (`div`) de doi bang component that khi san sang.
- Co the ket hop cac mang routes nay vao React Router V6 trong `App.jsx` hoac mot thanh phan routing rieng.

## Dich vu API
- `services/api.js`: Tao `axios` client chung, set `baseURL` tu `REACT_APP_API_URL`, chen interceptor de dinh kem bearer token va xu ly 401.
- `services/auth.js`: Xu ly login/logout, luu token va role vao `localStorage`, cung cap helper `isAuthenticated`.
- `services/student.js`, `staff.js`, `admin.js`: Dong goi cac endpoint dac thu tung vai tro (profile, requests, dashboard, reports...).
- `services/index.js`: Re-export de import ngan gon (`import { studentService } from '../services'`).

## Constants va Utils
- `constants/menuConfig.js`: Cau hinh menu theo vai tro, bao gom icon Unicode, label va submenu.
- `constants/roles.js`, `constants/permissions.js`: Dinh nghia role va quyen (co the dung cho guard sau nay).
- `utils/index.js`: Tap hop ham xu ly dinh dang ngay, tien, validate email/phone, debounce...

## Styles
- Moi component/layout co file `.css` cung ten, giup scope ro dang.
- CSS tong cho ung dung nam trong `App.css` va `index.css`.
- Co the xem `components/student/dashboard/Dashboard.css` va `components/common/Layout/Layout.css` de tham khao pattern style.

## Huong mo rong de xuat
- Giai doan tiep: bo sung React Router vao `App.jsx` de phuc vu nhieu vai tro, su dung cac route config san co.
- Bao boc `App` bang `AuthProvider` va su dung `useAuthContext` de hien thi thong tin nguoi dung that.
- Ket noi cac service toi backend, thay the mock data trong `Dashboard.jsx` bang API that.
- Chuan hoa lai ten file/tab (dang co cung luc dung component `StudentLayout` o `components` va `layouts`; can thong nhat khi codebase on dinh).

---

Mo hinh nay giup team de dang dinh danh vi tri canchinh sua, them trang moi, hoac tich hop API ma khong lam xao tron cac nhom chuc nang hien co.

