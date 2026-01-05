# 🚀 UniHelper - Hướng Dẫn Deploy Lên Google Cloud Run

## 📋 Mục Lục

1. [Tổng Quan](#1-tổng-quan)
2. [Kiến Trúc Hệ Thống](#2-kiến-trúc-hệ-thống)
3. [Công Nghệ Sử Dụng](#3-công-nghệ-sử-dụng)
4. [Cấu Trúc Files Deploy](#4-cấu-trúc-files-deploy)
5. [Chuẩn Bị Trước Khi Deploy](#5-chuẩn-bị-trước-khi-deploy)
6. [Quy Trình Deploy Backend](#6-quy-trình-deploy-backend)
7. [Quy Trình Deploy Frontend](#7-quy-trình-deploy-frontend)
8. [Cấu Hình Environment Variables](#8-cấu-hình-environment-variables)
9. [Kiểm Tra Và Xác Nhận](#9-kiểm-tra-và-xác-nhận)
10. [Chi Phí Và Tối Ưu](#10-chi-phí-và-tối-ưu)
11. [Xử Lý Sự Cố](#11-xử-lý-sự-cố)

---

## 1. Tổng Quan

### 1.1. Giới Thiệu

UniHelper là hệ thống quản lý sinh viên đại học, được triển khai trên **Google Cloud Run** - một nền tảng serverless cho phép chạy các container một cách tự động và có khả năng mở rộng.

### 1.2. URLs Production

| Service | URL |
|---------|-----|
| **Frontend** | https://unihelper-frontend-715097834178.asia-southeast1.run.app |
| **Backend API** | https://unihelper-backend-715097834178.asia-southeast1.run.app/api |
| **Health Check** | https://unihelper-backend-715097834178.asia-southeast1.run.app/api/health |

### 1.3. Thông Tin Project

- **Google Cloud Project ID:** `unihelper-lkxr`
- **Region:** `asia-southeast1` (Singapore)
- **Container Registry:** `gcr.io/unihelper-lkxr`

---

## 2. Kiến Trúc Hệ Thống

### 2.1. Sơ Đồ Kiến Trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERNET                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GOOGLE CLOUD RUN                              │
│  ┌─────────────────────┐      ┌─────────────────────┐          │
│  │   Frontend Service   │      │   Backend Service   │          │
│  │   (Nginx + React)    │─────▶│   (Node.js/Express) │          │
│  │   Port: 8080         │      │   Port: 8080        │          │
│  └─────────────────────┘      └──────────┬──────────┘          │
└─────────────────────────────────────────────────────────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
          ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
          │  MongoDB Atlas  │   │ Firebase Storage │   │   Socket.IO     │
          │  (Database)     │   │ (File Upload)    │   │ (Real-time)     │
          └─────────────────┘   └─────────────────┘   └─────────────────┘
```

### 2.2. Luồng Request

1. **User** truy cập Frontend URL
2. **Frontend (React)** gửi API request đến Backend
3. **Backend (Express)** xử lý logic, truy vấn MongoDB Atlas
4. **Response** được trả về cho Frontend hiển thị

---

## 3. Công Nghệ Sử Dụng

### 3.1. Cloud Platform

| Công Nghệ | Mục Đích | Lý Do Chọn |
|-----------|----------|------------|
| **Google Cloud Run** | Container hosting | Serverless, auto-scaling, pay-per-use |
| **Google Cloud Build** | CI/CD, build images | Tích hợp sẵn, không cần cài Docker local |
| **Google Container Registry** | Lưu trữ Docker images | Tích hợp với Cloud Run |

### 3.2. Backend Stack

| Công Nghệ | Version | Mục Đích |
|-----------|---------|----------|
| **Node.js** | 20-alpine | Runtime JavaScript |
| **Express.js** | 4.x | Web framework |
| **MongoDB Atlas** | 7.x | Database (Cloud) |
| **Mongoose** | 8.x | ODM cho MongoDB |
| **Socket.IO** | 4.x | Real-time communication |
| **Firebase Admin** | 12.x | File storage |
| **JWT** | - | Authentication |

### 3.3. Frontend Stack

| Công Nghệ | Version | Mục Đích |
|-----------|---------|----------|
| **React** | 18.x | UI Library |
| **Vite** | 5.x | Build tool |
| **Nginx** | Alpine | Static file server |
| **Axios** | - | HTTP client |
| **React Router** | 6.x | Client-side routing |
| **Ant Design** | 5.x | UI Components |

### 3.4. DevOps & Containerization

| Công Nghệ | Mục Đích |
|-----------|----------|
| **Docker** | Containerization |
| **Multi-stage Build** | Tối ưu image size |
| **gcloud CLI** | Deploy & manage services |

---

## 4. Cấu Trúc Files Deploy

### 4.1. Backend Files

```
backend/
├── Dockerfile              # Docker build configuration
├── .dockerignore           # Files to exclude from Docker build
├── package.json            # Dependencies
└── src/
    ├── app.js              # Express app (CORS, health check)
    ├── server.js           # Server startup (port 8080)
    └── config/
        └── firebase.js     # Firebase IAM configuration
```

### 4.2. Frontend Files

```
frontend/
├── Dockerfile              # Docker build configuration
├── .dockerignore           # Files to exclude from Docker build
├── cloudbuild.yaml         # Cloud Build configuration
├── nginx.conf              # Nginx server configuration
├── package.json            # Dependencies
└── src/
    └── ...                 # React source code
```

### 4.3. Chi Tiết Từng File

#### 📄 Backend Dockerfile

```dockerfile
# ===========================================
# UNIHELPER BACKEND - GOOGLE CLOUD RUN
# ===========================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Remove sensitive files
RUN rm -f .env firebase-service-account.json 2>/dev/null || true

USER expressjs

# Cloud Run uses PORT 8080
EXPOSE 8080
ENV PORT=8080

CMD ["node", "src/server.js"]
```

**Giải thích:**
- **Multi-stage build**: Tách riêng stage cài dependencies và stage chạy app
- **Non-root user**: Tăng bảo mật bằng cách không chạy với quyền root
- **Port 8080**: Cloud Run yêu cầu sử dụng port 8080

#### 📄 Backend .dockerignore

```
node_modules
npm-debug.log
.env
.env.*
firebase-service-account.json
uploads/*
!uploads/.gitkeep
.git
.gitignore
README.md
*.md
.DS_Store
Thumbs.db
```

**Mục đích:** Loại bỏ các file không cần thiết khỏi Docker image để giảm size và bảo mật.

#### 📄 Frontend Dockerfile

```dockerfile
# ===========================================
# UNIHELPER FRONTEND - GOOGLE CLOUD RUN
# ===========================================

# Stage 1: Build React app
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
```

**Giải thích:**
- **Stage 1 (Builder)**: Build React app với Vite
- **ARG VITE_API_URL**: Cho phép truyền API URL lúc build
- **Stage 2**: Dùng Nginx nhẹ để serve static files

#### 📄 Frontend nginx.conf

```nginx
server {
    listen 8080;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # SPA routing - redirect all to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

**Giải thích:**
- **SPA Routing**: `try_files` đảm bảo React Router hoạt động đúng
- **Gzip**: Nén response để tăng tốc độ load
- **Cache**: Cache static files 1 năm
- **Security Headers**: Bảo vệ khỏi clickjacking và MIME sniffing

#### 📄 Frontend cloudbuild.yaml

```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '--build-arg'
      - 'VITE_API_URL=https://unihelper-backend-715097834178.asia-southeast1.run.app/api'
      - '-t'
      - 'gcr.io/unihelper-lkxr/unihelper-frontend'
      - '.'
images:
  - 'gcr.io/unihelper-lkxr/unihelper-frontend'
```

**Mục đích:** Cấu hình Cloud Build để build Docker image với API URL.

---

## 5. Chuẩn Bị Trước Khi Deploy

### 5.1. Yêu Cầu

- [x] Tài khoản Google Cloud với billing enabled
- [x] Cài đặt Google Cloud SDK (gcloud CLI)
- [x] MongoDB Atlas cluster đã tạo và cấu hình
- [x] Firebase project với Storage enabled

### 5.2. Cài Đặt Google Cloud SDK

```bash
# Windows: Download và cài đặt từ
# https://cloud.google.com/sdk/docs/install

# Xác thực
gcloud auth login

# Chọn project
gcloud config set project unihelper-lkxr

# Enable các APIs cần thiết
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

### 5.3. Cấu Hình MongoDB Atlas

1. Truy cập [MongoDB Atlas](https://cloud.mongodb.com/)
2. Vào **Network Access** → **Add IP Address**
3. Chọn **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Lấy connection string từ **Connect** → **Connect your application**

---

## 6. Quy Trình Deploy Backend

### 6.1. Bước 1: Di chuyển đến thư mục Backend

```cmd
cd /d d:\TDT_lesson\DACNTT\unihelper-project\backend
```

### 6.2. Bước 2: Build Docker Image

```cmd
gcloud builds submit --tag gcr.io/unihelper-lkxr/unihelper-backend
```

**Output mong đợi:**
```
Creating temporary tarball archive...
Uploading tarball of [.] to [gs://unihelper-lkxr_cloudbuild/source/...]
...
DONE
```

**Thời gian:** ~3-5 phút

### 6.3. Bước 3: Deploy lên Cloud Run

```cmd
gcloud run deploy unihelper-backend ^
  --image gcr.io/unihelper-lkxr/unihelper-backend ^
  --platform managed ^
  --region asia-southeast1 ^
  --allow-unauthenticated ^
  --port 8080 ^
  --memory 512Mi ^
  --cpu 1 ^
  --min-instances 0 ^
  --max-instances 10
```

**Giải thích các tham số:**

| Tham số | Giá trị | Mô tả |
|---------|---------|-------|
| `--image` | gcr.io/.../backend | Docker image đã build |
| `--platform` | managed | Cloud Run fully managed |
| `--region` | asia-southeast1 | Singapore (gần Việt Nam) |
| `--allow-unauthenticated` | - | Cho phép truy cập public |
| `--port` | 8080 | Port container lắng nghe |
| `--memory` | 512Mi | RAM cho mỗi instance |
| `--cpu` | 1 | Số CPU cores |
| `--min-instances` | 0 | Tối thiểu 0 (scale to zero) |
| `--max-instances` | 10 | Tối đa 10 instances |

### 6.4. Bước 4: Cấu hình Environment Variables

```cmd
gcloud run services update unihelper-backend ^
  --region asia-southeast1 ^
  --set-env-vars "NODE_ENV=production" ^
  --set-env-vars "MONGO_URI=mongodb+srv://..." ^
  --set-env-vars "JWT_SECRET=your-secret-key" ^
  --set-env-vars "JWT_EXPIRE=7d" ^
  --set-env-vars "FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com" ^
  --set-env-vars "CLIENT_URL=https://unihelper-frontend-xxx.run.app"
```

---

## 7. Quy Trình Deploy Frontend

### 7.1. Bước 1: Di chuyển đến thư mục Frontend

```cmd
cd /d d:\TDT_lesson\DACNTT\unihelper-project\frontend
```

### 7.2. Bước 2: Build Docker Image với Cloud Build

```cmd
gcloud builds submit --config cloudbuild.yaml
```

**Lưu ý:** File `cloudbuild.yaml` đã chứa API URL của Backend.

**Thời gian:** ~5-7 phút (do cần build React app)

### 7.3. Bước 3: Deploy lên Cloud Run

```cmd
gcloud run deploy unihelper-frontend ^
  --image gcr.io/unihelper-lkxr/unihelper-frontend ^
  --platform managed ^
  --region asia-southeast1 ^
  --allow-unauthenticated ^
  --port 8080 ^
  --memory 256Mi
```

**Lưu ý:** Frontend chỉ cần 256Mi memory vì chỉ serve static files.

---

## 8. Cấu Hình Environment Variables

### 8.1. Backend Environment Variables

| Variable | Mô tả | Ví dụ |
|----------|-------|-------|
| `NODE_ENV` | Môi trường chạy | `production` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key cho JWT | `a8f5f167f44f4964e6c998dee827110c...` |
| `JWT_EXPIRE` | Thời gian hết hạn token | `7d` |
| `FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket | `project-id.appspot.com` |
| `CLIENT_URL` | URL của Frontend | `https://frontend-xxx.run.app` |

### 8.2. Cách Cấu Hình

**Cách 1: Dùng gcloud CLI**

```cmd
gcloud run services update unihelper-backend ^
  --region asia-southeast1 ^
  --set-env-vars "KEY1=value1,KEY2=value2"
```

**Cách 2: Dùng Google Cloud Console**

1. Truy cập: https://console.cloud.google.com/run
2. Click vào service → **Edit & Deploy New Revision**
3. Mở **Variables & Secrets** tab
4. Thêm các biến môi trường
5. Click **Deploy**

### 8.3. Firebase IAM Configuration

Thay vì dùng file JSON key (không an toàn), Cloud Run sử dụng IAM Service Account:

```javascript
// backend/src/config/firebase.js
if (process.env.NODE_ENV === 'production') {
  // Sử dụng IAM Service Account của Cloud Run
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}
```

**Cấu hình IAM:**

```cmd
# Lấy service account của Cloud Run
gcloud run services describe unihelper-backend ^
  --region asia-southeast1 ^
  --format "value(spec.template.spec.serviceAccountName)"

# Cấp quyền Firebase Storage
gcloud projects add-iam-policy-binding unihelper-lkxr ^
  --member "serviceAccount:SERVICE_ACCOUNT_EMAIL" ^
  --role "roles/storage.objectAdmin"
```

---

## 9. Kiểm Tra Và Xác Nhận

### 9.1. Kiểm Tra Backend Health

```cmd
curl https://unihelper-backend-715097834178.asia-southeast1.run.app/api/health
```

**Response mong đợi:**

```json
{
  "status": "healthy",
  "service": "unihelper-backend",
  "timestamp": "2026-01-04T17:02:48.030Z",
  "uptime": 19.28,
  "environment": "production"
}
```

### 9.2. Kiểm Tra Logs

```cmd
# Backend logs
gcloud run services logs read unihelper-backend --region asia-southeast1 --limit 50

# Frontend logs
gcloud run services logs read unihelper-frontend --region asia-southeast1 --limit 50
```

### 9.3. Kiểm Tra Frontend

1. Mở browser và truy cập: https://unihelper-frontend-715097834178.asia-southeast1.run.app
2. Thử đăng nhập với tài khoản test
3. Kiểm tra các chức năng chính

### 9.4. Monitoring Dashboard

Truy cập: https://console.cloud.google.com/run?project=unihelper-lkxr

- Xem số request, latency, errors
- Theo dõi memory và CPU usage
- Xem billing và chi phí

---

## 10. Chi Phí Và Tối Ưu

### 10.1. Google Cloud Free Tier

Cloud Run cung cấp free tier hàng tháng:

| Resource | Free Tier |
|----------|-----------|
| CPU | 180,000 vCPU-seconds |
| Memory | 360,000 GiB-seconds |
| Requests | 2 million requests |
| Networking | 1 GB egress (North America) |

### 10.2. Ước Tính Chi Phí

Với cấu hình hiện tại và lưu lượng thấp:

| Service | Cấu hình | Chi phí ước tính/tháng |
|---------|----------|------------------------|
| Backend | 512Mi, 1 CPU | ~$5-15 |
| Frontend | 256Mi | ~$2-5 |
| Cloud Build | - | ~$0-2 |
| **Tổng** | | **~$7-22/tháng** |

### 10.3. Tối Ưu Chi Phí

1. **Scale to Zero**: Đặt `--min-instances 0` để không tốn phí khi không có traffic
2. **Giảm Memory**: Frontend chỉ cần 256Mi, Backend có thể giảm xuống 256Mi nếu ổn định
3. **Sử dụng Artifact Registry**: Thay vì Container Registry (sẽ deprecated)
4. **Đặt budget alerts**: Cảnh báo khi chi phí vượt ngưỡng

```cmd
# Đặt budget alert
gcloud billing budgets create ^
  --billing-account=BILLING_ACCOUNT_ID ^
  --display-name="UniHelper Budget" ^
  --budget-amount=50USD ^
  --threshold-rule=percent=50 ^
  --threshold-rule=percent=90
```

---

## 11. Xử Lý Sự Cố

### 11.1. Lỗi "Service Unavailable"

**Nguyên nhân:** Container không start được

**Giải pháp:**
1. Kiểm tra logs: `gcloud run services logs read SERVICE_NAME --region asia-southeast1`
2. Kiểm tra environment variables đã được set
3. Đảm bảo MongoDB Atlas cho phép IP 0.0.0.0/0

### 11.2. Lỗi CORS

**Nguyên nhân:** CLIENT_URL không đúng

**Giải pháp:**
```cmd
gcloud run services update unihelper-backend ^
  --region asia-southeast1 ^
  --update-env-vars "CLIENT_URL=https://unihelper-frontend-xxx.run.app"
```

### 11.3. Lỗi Database Connection

**Nguyên nhân:** MONGO_URI không đúng hoặc IP chưa whitelist

**Giải pháp:**
1. Kiểm tra MONGO_URI trong environment variables
2. Vào MongoDB Atlas → Network Access → Add IP Address → 0.0.0.0/0

### 11.4. Lỗi Firebase Storage

**Nguyên nhân:** Thiếu quyền IAM

**Giải pháp:**
1. Kiểm tra FIREBASE_STORAGE_BUCKET
2. Cấp quyền `roles/storage.objectAdmin` cho service account

### 11.5. Cold Start Chậm

**Nguyên nhân:** Scale to zero, container cần khởi động lại

**Giải pháp:**
```cmd
# Đặt minimum instances
gcloud run services update unihelper-backend ^
  --region asia-southeast1 ^
  --min-instances 1
```

**Lưu ý:** Sẽ tốn thêm chi phí khi có instance chạy 24/7

---

## 📚 Tài Liệu Tham Khảo

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

---

## 📞 Liên Hệ Hỗ Trợ

Nếu gặp vấn đề trong quá trình deploy, vui lòng:

1. Kiểm tra logs trước
2. Tham khảo phần "Xử Lý Sự Cố" ở trên
3. Liên hệ team phát triển

---

**Cập nhật lần cuối:** January 5, 2026  
**Phiên bản:** 1.0.0
