# ✅ Vercel Deployment Checklist

## 🚀 Quick Deployment Steps

### 1. **Prepare Repository**
- [x] Code pushed to GitHub
- [x] `.env.example` created with template values
- [x] `.env.local` contains actual values (not committed)
- [x] `vercel.json` configuration ready
- [x] Deployment guide created

### 2. **Deploy to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. **New Project** → Import `quangcuong2k3/CoffeeManagementSystem`
3. **Framework**: Next.js (auto-detected)
4. **Click Deploy** (will fail first time - that's expected)

### 3. **Configure Environment Variables**
Go to Vercel Dashboard → Project → Settings → Environment Variables:

**Copy these from your `.env.local`:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBMhsrrtQ-aLpOQ8yXXTSFxtuRqi1fzyus
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=thecoffee-b780f.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=thecoffee-b780f
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=thecoffee-b780f.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=458399154801
NEXT_PUBLIC_FIREBASE_APP_ID=1:458399154801:web:03642abbae40990fbf51d0
NEXTAUTH_SECRET=coffee-management-super-secret-key-2025-production
ADMIN_EMAIL=admin@coffeehouse.com
ADMIN_PASSWORD=SecureAdminPassword123!
NEXT_PUBLIC_FIREBASE_STORAGE_BASE_URL=https://storage.googleapis.com/thecoffee-b780f.firebasestorage.app
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyA15I39YBZwpHWeNWfDdIGULYRtWRzxh28
GEMINI_API_ENDPOINT=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
```

**Will be updated after deployment:**
```
NEXTAUTH_URL=https://[your-vercel-url].vercel.app
API_BASE_URL=https://[your-vercel-url].vercel.app/api
```

### 4. **Redeploy**
- After adding environment variables
- Go to **Deployments** tab → **Redeploy**
- Wait for successful build

### 5. **Post-Deployment**
1. **Copy your Vercel URL** (e.g., `https://coffee-management-system-abc123.vercel.app`)
2. **Update Environment Variables:**
   - `NEXTAUTH_URL=https://your-actual-url.vercel.app`
   - `API_BASE_URL=https://your-actual-url.vercel.app/api`
3. **Redeploy again**

### 6. **Configure Firebase**
1. Go to [Firebase Console](https://console.firebase.google.com/project/thecoffee-b780f)
2. **Authentication** → **Settings** → **Authorized domains**
3. **Add**: `your-vercel-url.vercel.app`

### 7. **Test Live Site**
1. Visit your Vercel URL
2. Login with: `admin@coffeehouse.com` / `SecureAdminPassword123!`
3. Verify dashboard loads
4. Test Firebase connection

## 🎯 Expected Result

✅ **Live URL**: `https://your-app.vercel.app`  
✅ **Admin Login**: Working Firebase authentication  
✅ **Dashboard**: Full access to coffee business data  
✅ **Real-time**: Connected to your React Native app database  

## 🔧 Troubleshooting

**Build Fails?**
- Check environment variables are set
- Verify no typos in variable names

**Login Doesn't Work?**
- Check Firebase authorized domains
- Verify admin user exists in Firebase
- Check NEXTAUTH_URL is correct

**Data Not Loading?**
- Verify Firebase project ID
- Check Firebase permissions
- Test Firebase connection in console

---

**🚀 Ready to deploy? Follow these steps and your Coffee Management System will be live in 10 minutes!**
