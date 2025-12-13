const mongoose = require("mongoose");

async function dropDB() {
  await mongoose.connect("mongodb://127.0.0.1:27017/unihelper");
  await mongoose.connection.dropDatabase();
  console.log("✅ Dropped database unihelper");
  mongoose.connection.close();
}

dropDB();
