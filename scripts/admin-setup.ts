// Generate dashboard credentials for .env.
// Usage: npm run admin:setup -- you@example.com "a long passphrase" [--totp]
import { randomBytes } from "node:crypto";
import { hash } from "@node-rs/argon2";
import { Secret, TOTP } from "otpauth";

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== "--totp");
  const wantTotp = process.argv.includes("--totp");
  const [email, password] = args;

  if (!email || !password) {
    console.error('Usage: npm run admin:setup -- you@example.com "a long passphrase" [--totp]');
    process.exit(1);
  }
  if (password.length < 12) {
    console.error("Use a passphrase of at least 12 characters.");
    process.exit(1);
  }

  const passwordHash = await hash(password);
  const lines = [
    `ADMIN_EMAIL=${email}`,
    // Base64 so the $-separated argon2 string survives .env variable expansion.
    `ADMIN_PASSWORD_HASH_B64=${Buffer.from(passwordHash).toString("base64")}`,
    `AUTH_SECRET=${randomBytes(32).toString("base64url")}`,
  ];

  if (wantTotp) {
    const secret = new Secret({ size: 20 });
    const totp = new TOTP({ issuer: "Portfolio admin", label: email, secret });
    lines.push(`ADMIN_TOTP_SECRET=${secret.base32}`);
    console.log("\nAdd this to your authenticator app (or enter the secret manually):");
    console.log(totp.toString());
  }

  console.log("\nPaste these into .env (keep AUTH_SECRET if you already have one):\n");
  console.log(lines.join("\n"));
  console.log();
}

main();
