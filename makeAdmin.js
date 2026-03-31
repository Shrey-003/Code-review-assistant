const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // Find the newest user and make them admin
    const latestUser = await User.findOne().sort({ createdAt: -1 });
    if (latestUser) {
      latestUser.role = 'admin';
      await latestUser.save();
      console.log(`✅ User ${latestUser.username} (${latestUser.email}) is now an admin!`);
    } else {
      console.log("❌ No users found to promote.");
    }
  } catch (error) {
    console.error("❌ Failed:", error);
  } finally {
    process.exit(0);
  }
}

makeAdmin();
