/**
 * Firebase Configuration
 * - Local development: Dùng file firebase-service-account.json
 * - Cloud Run production: Dùng IAM Service Account (không cần file key)
 */
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let bucket = null;
let firebaseInitialized = false;

const initializeFirebase = () => {
  try {
    // Nếu đã khởi tạo rồi thì bỏ qua
    if (admin.apps.length) {
      bucket = admin.storage().bucket();
      firebaseInitialized = true;
      return;
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
    const hasServiceAccountFile = fs.existsSync(serviceAccountPath);

    if (isProduction && !hasServiceAccountFile) {
      // PRODUCTION trên Cloud Run: Dùng Application Default Credentials (IAM)
      // Cloud Run Service Account cần có quyền "Storage Object Admin"
      console.log('🔐 Firebase: Using IAM Service Account (Cloud Run)');
      
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    } else if (hasServiceAccountFile) {
      // LOCAL DEVELOPMENT: Dùng file service account
      console.log('🔐 Firebase: Using service account file (Local)');
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    } else {
      console.warn('⚠️ Firebase: No credentials available. File upload disabled.');
      return;
    }

    bucket = admin.storage().bucket();
    firebaseInitialized = true;
    console.log('✅ Firebase Storage connected successfully');
    console.log(`📁 Bucket: ${process.env.FIREBASE_STORAGE_BUCKET}`);

  } catch (error) {
    console.error('❌ Firebase Storage connection failed:', error.message);
    console.log('⚠️ File upload will be disabled');
  }
};

// Khởi tạo ngay khi import
initializeFirebase();

module.exports = { bucket, admin, firebaseInitialized };
