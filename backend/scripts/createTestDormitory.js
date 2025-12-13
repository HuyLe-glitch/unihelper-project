/**
 * Simple script to insert test DormitoryRequest documents into the database.
 * Usage:
 *   cd backend
 *   node scripts/createTestDormitory.js
 *
 * It loads environment variables from .env if present (via dotenv),
 * connects to MongoDB, inserts sample documents, then exits.
 *
 * This script does NOT modify any existing project files.
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/unihelper';

// require model
const DormitoryRequest = require('../src/models/DormitoryRequest');

async function main() {
  console.log('Connecting to MongoDB:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    const now = new Date();
    const samples = [
      {
        // provide a fake student ObjectId string — replace with a real one if needed
        student: new mongoose.Types.ObjectId(),
        category: 'Thiết bị điện',
        deviceName: 'Quạt trần',
        description: 'Quạt kêu to và chớp tắt',
        requestDate: now,
        status: 'Pending'
      },
      {
        student: new mongoose.Types.ObjectId(),
        category: 'Nội thất',
        deviceName: 'Giường',
        description: 'Khung giường lỏng lẻo',
        requestDate: now,
        status: 'Pending'
      },
      {
        student: new mongoose.Types.ObjectId(),
        category: 'Thiết bị nước',
        deviceName: 'Vòi nước',
        description: 'Rò rỉ ở phòng tắm',
        requestDate: now,
        status: 'Under Review'
      }
    ];

    console.log(`Inserting ${samples.length} test dormitory request(s)...`);
    const created = await DormitoryRequest.insertMany(samples);
    console.log('Inserted documents:');
    created.forEach((doc) => {
      console.log(`- id: ${doc._id.toString()}, student: ${doc.student.toString()}, status: ${doc.status}`);
    });
  } catch (err) {
    console.error('Error inserting test documents:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected. Exiting.');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});