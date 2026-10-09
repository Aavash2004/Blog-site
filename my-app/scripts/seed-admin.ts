import dotenv from "dotenv";
import path from "path";

// Load local environment files before database connection
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  const email = process.argv[2];

  if (!email || !email.trim()) {
    console.error("\n❌ Error: Missing target email address.");
    console.error("Usage: pnpm run seed:admin <user-email>\n");
    console.error("Example: pnpm run seed:admin admin@ournepal.org\n");
    process.exit(1);
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Dynamically import db after env variables are loaded
  const { promoteUserToAdmin } = await import("../lib/db");

  console.log(`\n🔍 Searching for user account with email: "${normalizedEmail}"...`);

  const result = await promoteUserToAdmin(normalizedEmail);

  if (!result.success) {
    console.error(`\n❌ Failed to promote user: ${result.error}\n`);
    process.exit(1);
  }

  if (result.alreadyAdmin) {
    console.log(`\nℹ️ User "${result.user.email}" (ID: ${result.user.id}, Name: ${result.user.name}) is ALREADY an admin.`);
    console.log("No changes were necessary.\n");
    process.exit(0);
  }

  console.log("\n✅ Successfully promoted user to admin!");
  console.log(`   - ID:    ${result.user.id}`);
  console.log(`   - Name:  ${result.user.name}`);
  console.log(`   - Email: ${result.user.email}`);
  console.log(`   - Role:  ${result.user.role}\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌ Unexpected error during admin promotion:", err);
  process.exit(1);
});
