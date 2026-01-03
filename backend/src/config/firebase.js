/**
 * Firebase Configuration
 * Khởi tạo Firebase Admin SDK để upload file lên Firebase Storage
 */
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Load service account key
const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

let bucket = null;
let firebaseInitialized = false;

try {
  // Kiểm tra file service account tồn tại
  if (!fs.existsSync(serviceAccountPath)) {
    console.warn('⚠️ Firebase service account file not found. File upload will be disabled.');
  } else {
    // Kiểm tra xem đã khởi tạo chưa
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    }
    
    bucket = admin.storage().bucket();
    firebaseInitialized = true;
    console.log('✅ Firebase Storage connected successfully');
    console.log(`📁 Bucket: ${process.env.FIREBASE_STORAGE_BUCKET}`);
  }
} catch (error) {
  console.error('❌ Firebase Storage connection failed:', error.message);
  console.log('⚠️ File upload will be disabled');
}

module.exports = { bucket, admin, firebaseInitialized };
