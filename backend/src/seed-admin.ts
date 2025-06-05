import { connect, disconnect } from 'mongoose';
import { UserSchema, AppRole } from './users/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { model } from 'mongoose';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_ROLE = process.env.ADMIN_ROLE || AppRole.ADMIN;

if (!MONGO_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error(
    'Brakuje wymaganych zmiennych środowiskowych: MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD',
  );
}

async function seedAdmin() {
  await connect(MONGO_URI!);
  const UserModel = model('User', UserSchema);
  const existing = await UserModel.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log('Admin already exists:', ADMIN_EMAIL);
    await disconnect();
    return;
  }
  const hash = await bcrypt.hash(ADMIN_PASSWORD as string, 10);
  await UserModel.create({
    email: ADMIN_EMAIL,
    password: hash,
    role: ADMIN_ROLE,
  });
  console.log('Admin created:', ADMIN_EMAIL);
  await disconnect();
}

seedAdmin().catch((err) => {
  console.error('Seeding admin failed:', err);
  disconnect();
});
