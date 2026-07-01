import bcrypt from 'bcryptjs';
import { User } from './models/User.js';

// Seed a super_admin on first boot if no super_admin exists yet.
// Reads BOOTSTRAP_SUPER_USERNAME / BOOTSTRAP_SUPER_PASSWORD from env.
// Safe to run on every startup — it no-ops once a super_admin is present.
export async function bootstrapSuperAdmin() {
  const existing = await User.findOne({ role: 'super_admin' });
  if (existing) return;

  const username = (process.env.BOOTSTRAP_SUPER_USERNAME || '').trim().toLowerCase();
  const password = process.env.BOOTSTRAP_SUPER_PASSWORD || '';

  if (!username || !password) {
    console.warn(
      '⚠ No super_admin found and BOOTSTRAP_SUPER_USERNAME / BOOTSTRAP_SUPER_PASSWORD not set. ' +
        'Admin panel will be inaccessible until one is created directly in the database.'
    );
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({
    username,
    name: 'Convention Super Admin',
    passwordHash,
    role: 'super_admin',
    active: true,
  });
  console.log(`✓ Bootstrapped super_admin "${username}" (change password on first login)`);
}
