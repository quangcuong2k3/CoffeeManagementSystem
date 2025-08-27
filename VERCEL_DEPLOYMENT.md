# 🚀 Vercel Deployment Guide - Coffee Management System

## 📋 Pre-Deployment Checklist

✅ Code pushed to GitHub repository  
✅ Environment variables template created  
✅ Firebase project configured  
✅ Admin user created in Firebase Authentication  

## 🌐 Deploy to Vercel

### Step 1: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account (AlbertDung)
3. Click **"New Project"**
4. Import your repository: `quangcuong2k3/CoffeeManagementSystem`

### Step 2: Configure Build Settings
Vercel will auto-detect Next.js, but verify these settings:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Step 3: Environment Variables Setup

In Vercel Dashboard → Project → Settings → Environment Variables, add:

#### 🔥 Firebase Configuration (Required)
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBMhsrrtQ-aLpOQ8yXXTSFxtuRqi1fzyus
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=thecoffee-b780f.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=thecoffee-b780f
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=thecoffee-b780f.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=458399154801
NEXT_PUBLIC_FIREBASE_APP_ID=1:458399154801:web:03642abbae40990fbf51d0
```

#### 🔐 Authentication (Required)
```
NEXTAUTH_SECRET=coffee-management-super-secret-key-2025-production
ADMIN_EMAIL=admin@coffeehouse.com
ADMIN_PASSWORD=SecureAdminPassword123!
```

#### 🌐 URLs (Update after deployment)
```
NEXTAUTH_URL=https://your-app-name.vercel.app
API_BASE_URL=https://your-app-name.vercel.app/api
NEXT_PUBLIC_FIREBASE_STORAGE_BASE_URL=https://storage.googleapis.com/thecoffee-b780f.firebasestorage.app
```

#### 🤖 Optional APIs
```
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyA15I39YBZwpHWeNWfDdIGULYRtWRzxh28
GEMINI_API_ENDPOINT=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
```

#### 🔧 Firebase Admin (Optional)
```
FIREBASE_ADMIN_PROJECT_ID=thecoffee-b780f
FIREBASE_ADMIN_CLIENT_EMAIL=your_admin_email@thecoffee-b780f.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"
```

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for build to complete (2-3 minutes)
3. Your app will be live at `https://your-app-name.vercel.app`

## 🔧 Post-Deployment Setup

### 1. Update Firebase Configuration
Add your Vercel domain to Firebase:
1. Go to [Firebase Console](https://console.firebase.google.com/project/thecoffee-b780f)
2. **Authentication** → **Settings** → **Authorized domains**
3. Add: `your-app-name.vercel.app`

### 2. Update Environment Variables
1. Copy your actual Vercel URL
2. Update in Vercel Dashboard:
   - `NEXTAUTH_URL=https://your-actual-domain.vercel.app`
   - `API_BASE_URL=https://your-actual-domain.vercel.app/api`

### 3. Test Deployment
1. Visit your live URL
2. Test login with admin credentials
3. Verify Firebase connection
4. Check all features work

## 🎯 Custom Domain (Optional)

### Add Custom Domain
1. Vercel Dashboard → Project → Settings → **Domains**
2. Add your domain: `coffee-admin.yourdomain.com`
3. Configure DNS records as shown
4. Update environment variables with new domain

### SSL Certificate
- Vercel automatically provides SSL
- Your site will be `https://` enabled

## 🔄 Automatic Deployments

### GitHub Integration
- Every push to `main` branch triggers deployment
- Preview deployments for pull requests
- Rollback capability in Vercel dashboard

### Branch Protection
Consider setting up:
- Required status checks
- Automatic deployments from `main` only

## 📊 Monitoring & Analytics

### Vercel Analytics
1. Enable in Project Settings → **Analytics**
2. Monitor performance and usage
3. Track page views and user behavior

### Error Monitoring
Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Firebase Performance monitoring

## 🔐 Security Checklist

✅ Environment variables secured in Vercel  
✅ Firebase domains authorized  
✅ Strong admin password set  
✅ HTTPS enabled by default  
✅ No sensitive data in public repository  

## 🆘 Troubleshooting

### Build Failures
- Check build logs in Vercel dashboard
- Verify all dependencies in package.json
- Test build locally: `npm run build`

### Environment Variables
- Ensure all required variables are set
- Check for typos in variable names
- Verify Firebase credentials

### Firebase Connection
- Verify project ID matches
- Check authorized domains
- Test authentication flow

## 🎉 Success!

Your Coffee Management System is now live on Vercel!

### Next Steps
1. **Share with team**: Send the live URL to collaborators
2. **Monitor usage**: Check Vercel analytics
3. **Scale as needed**: Upgrade Vercel plan if needed
4. **Backup regularly**: Keep Firebase project backed up

---

**Live URL**: `https://your-app-name.vercel.app`  
**Admin Login**: Use Firebase Authentication credentials  
**Dashboard**: Full access to your coffee business data  

🚀 **Your coffee business is now managed in the cloud!** ☕
