import bcrypt from "bcryptjs";
import { db } from "../lib/db";
import { admins } from "../lib/db/schema";

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Admin User";

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newAdmin = await db
      .insert(admins)
      .values({
        email,
        password: hashedPassword,
        name,
      })
      .returning();

    console.log("✅ Admin user created successfully!");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Please change the password after first login.");
  } catch (error) {
    console.error("❌ Error creating admin:", error);
  }
}

createAdmin();
