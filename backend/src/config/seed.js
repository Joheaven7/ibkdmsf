const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const User = require('../models/User');

const users = [
  {
    name:     'Super Admin',
    username: 'superadmin',
    email:    'superadmin@ibkdms.gov.et',
    password: 'SuperAdmin@2024',
    role:     'superadmin',
    kebele:   '03',
    phone:    '0911000001',
    status:   'active',
  },
  {
    name:     'Admin User',
    username: 'admin',
    email:    'admin@ibkdms.gov.et',
    password: 'AdminUser@2024',
    role:     'admin',
    kebele:   '03',
    phone:    '0911000002',
    status:   'active',
  },
  {
    name:     'Clerk User',
    username: 'clerk',
    email:    'clerk@ibkdms.gov.et',
    password: 'ClerkUser@2024',
    role:     'clerk',
    kebele:   '03',
    phone:    '0911000003',
    status:   'active',
  },
  {
    name:     'Resident User',
    username: 'resident',
    email:    'resident@ibkdms.gov.et',
    password: 'Resident@2024',
    role:     'resident',
    kebele:   '03',
    phone:    '0911000004',
    status:   'active',
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  await User.deleteMany({});
  console.log('🗑  Cleared existing users');

  console.log('\n📋 Seed Data - SECURE PASSWORDS:');
  console.log('────────────────────────────────');

  for (const u of users) {
    const salt = await bcrypt.genSalt(10);
    u.password = await bcrypt.hash(u.password, salt);
    await User.create(u);
    console.log(`✅ Created ${u.role.toUpperCase()}: ${u.email}`);
  }

  console.log('\n⚠️  IMPORTANT: These are DEFAULT/TEST credentials only.');
  console.log('📝 Change all passwords immediately in production.');
  console.log('\n🎉 Seed complete!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });