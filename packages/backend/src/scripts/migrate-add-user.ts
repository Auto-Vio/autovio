/**
 * Migration script to add userId to existing projects
 * 
 * This script:
 * 1. Creates a default admin user if one doesn't exist
 * 2. Updates all projects without userId to be owned by the admin user
 * 
 * Usage: bun run tsx src/scripts/migrate-add-user.ts
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

import { connectDB, disconnectDB } from "../db/index.js";
import { UserModel } from "../db/models/User.js";
import { ProjectModel } from "../db/models/Project.js";

const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || "admin@autovio.local";
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || "changeme123";
const DEFAULT_ADMIN_NAME = process.env.DEFAULT_ADMIN_NAME || "Admin";

async function migrate() {
  console.log("🚀 Starting user migration...\n");

  await connectDB();

  let adminUser = await UserModel.findOne({ email: DEFAULT_ADMIN_EMAIL }).lean();

  if (!adminUser) {
    console.log(`📝 Creating default admin user: ${DEFAULT_ADMIN_EMAIL}`);
    
    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);
    const now = Date.now();

    adminUser = await UserModel.create({
      _id: crypto.randomUUID(),
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash,
      name: DEFAULT_ADMIN_NAME,
      createdAt: now,
      updatedAt: now,
    });

    console.log(`✅ Admin user created with ID: ${adminUser._id}`);
    console.log(`   Email: ${DEFAULT_ADMIN_EMAIL}`);
    console.log(`   Password: ${DEFAULT_ADMIN_PASSWORD}`);
    console.log(`   ⚠️  Please change this password after first login!\n`);
  } else {
    console.log(`✅ Admin user already exists: ${adminUser.email}\n`);
  }

  const projectsWithoutUser = await ProjectModel.find({
    $or: [
      { userId: { $exists: false } },
      { userId: null },
      { userId: "" },
    ],
  }).lean();

  if (projectsWithoutUser.length === 0) {
    console.log("✅ All projects already have userId assigned.\n");
  } else {
    console.log(`📝 Found ${projectsWithoutUser.length} projects without userId`);
    console.log(`   Assigning to admin user: ${adminUser._id}\n`);

    const result = await ProjectModel.updateMany(
      {
        $or: [
          { userId: { $exists: false } },
          { userId: null },
          { userId: "" },
        ],
      },
      { $set: { userId: adminUser._id } }
    );

    console.log(`✅ Updated ${result.modifiedCount} projects\n`);
  }

  const stats = {
    totalUsers: await UserModel.countDocuments(),
    totalProjects: await ProjectModel.countDocuments(),
    projectsWithUser: await ProjectModel.countDocuments({ 
      userId: { $exists: true },
      $and: [{ userId: { $ne: null } }, { userId: { $ne: "" } }]
    }),
  };

  console.log("📊 Database Statistics:");
  console.log(`   Total users: ${stats.totalUsers}`);
  console.log(`   Total projects: ${stats.totalProjects}`);
  console.log(`   Projects with userId: ${stats.projectsWithUser}`);

  await disconnectDB();
  console.log("\n✅ Migration completed successfully!");
}

migrate().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});
