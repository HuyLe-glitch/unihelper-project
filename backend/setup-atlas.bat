@echo off
REM Script setup MongoDB Atlas cho Windows PowerShell/CMD
REM Chay: setup-atlas.bat

echo ================================================================
echo    Setup MongoDB Atlas cho UniHelper
echo ================================================================
echo.

REM Kiem tra file .env
if exist "backend\.env" (
    echo [OK] File .env da ton tai
    set /p answer="Ban co muon ghi de file .env? (y/n): "
    if /i "%answer%"=="n" (
        echo [SKIP] Bo qua tao file .env
        goto :skip_env
    )
)

echo [CREATE] Dang tao file .env...
(
echo # MongoDB Atlas Configuration
echo MONGO_URI=mongodb+srv://admin:admin@cluster0.aexcjwz.mongodb.net/unihelper?retryWrites=true^&w=majority
echo.
echo # JWT Configuration
echo JWT_SECRET=unihelper_jwt_secret_key_2024_very_secure
echo JWT_EXPIRE=7d
echo.
echo # Bcrypt
echo BCRYPT_SALT_ROUNDS=12
echo.
echo # Server
echo PORT=5000
echo NODE_ENV=development
echo FRONTEND_URL=http://localhost:5173
) > backend\.env

echo [OK] File .env da duoc tao
echo.

:skip_env

echo ================================================================
echo    CAC BUOC TIEP THEO
echo ================================================================
echo 1. cd backend
echo 2. npm install
echo 3. node test-connection.js     (test ket noi)
echo 4. node scripts/seedAll.js     (tao du lieu)
echo 5. npm run dev                 (khoi dong server)
echo.
echo LUU Y:
echo    - Dam bao IP cua ban da duoc whitelist trong MongoDB Atlas
echo    - Truy cap: https://cloud.mongodb.com
echo    - Vao Network Access va Add Current IP Address
echo.
echo ================================================================
pause

