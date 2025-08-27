#!/usr/bin/env node

// Admin Setup Script for Coffee Management System
// This script helps create an admin user in Firebase Authentication

const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

console.log('🚀 Coffee Management System - Admin Setup');
console.log('==========================================\n');

// Check if service account key exists
const fs = require('fs');
const path = require('path');

// You can use your existing service account from the React Native app
const serviceAccountPath = path.join(__dirname, '..', 'TheCoffee', 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.log('❌ Service account key not found!');
  console.log('📝 To create an admin user, you need to:');
  console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
  console.log('2. Generate a new private key');
  console.log('3. Save it as serviceAccountKey.json in the project root');
  console.log('4. Or manually create an admin user in Firebase Authentication\n');
  
  console.log('🔧 Manual Setup Instructions:');
  console.log('1. Go to Firebase Console → Authentication → Users');
  console.log('2. Add a new user with email: admin@coffeehouse.com');
  console.log('3. Use a strong password');
  console.log('4. Copy the User UID');
  console.log('5. Update your .env.local with ADMIN_EMAIL=admin@coffeehouse.com\n');
  
  process.exit(0);
}

async function createAdminUser() {
  try {
    // Initialize Firebase Admin
    const serviceAccount = require(serviceAccountPath);
    const app = initializeApp({
      credential: cert(serviceAccount),
      projectId: 'thecoffee-b780f'
    });

    const auth = getAuth(app);
    const firestore = getFirestore(app);

    const adminEmail = 'admin@coffeehouse.com';
    const adminPassword = 'CoffeeAdmin2025!';

    console.log('🔨 Creating admin user...');

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email: adminEmail,
      password: adminPassword,
      displayName: 'Coffee House Admin',
      emailVerified: true
    });

    console.log(`✅ Admin user created successfully!`);
    console.log(`👤 UID: ${userRecord.uid}`);
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);

    // Create user document in Firestore
    await firestore.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: adminEmail,
      displayName: 'Coffee House Admin',
      firstName: 'Coffee',
      lastName: 'Admin',
      isAdmin: true,
      role: 'admin',
      favoriteItems: [],
      cartItems: [],
      orderHistory: [],
      preferences: {
        notifications: true,
        theme: 'light',
        language: 'en'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: true
    });

    console.log('📄 User document created in Firestore');
    console.log('\n🎉 Setup Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Visit http://localhost:3000');
    console.log(`3. Login with email: ${adminEmail}`);
    console.log(`4. Login with password: ${adminPassword}`);
    console.log('5. Change the password after first login\n');

  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('ℹ️  Admin user already exists!');
      console.log('📧 Email: admin@coffeehouse.com');
      console.log('🔑 Use the existing password or reset it in Firebase Console');
    } else {
      console.error('❌ Error creating admin user:', error.message);
    }
  }
}

createAdminUser();
