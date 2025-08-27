# Deployment Guide - Coffee Management System

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides the easiest deployment for Next.js applications with automatic CI/CD.

#### Prerequisites
- GitHub/GitLab/Bitbucket repository
- Vercel account (free tier available)

#### Steps

1. **Push to Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Coffee Management System"
   git remote add origin YOUR_REPOSITORY_URL
   git push -u origin main
   ```

2. **Deploy with Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Configure build settings:
     - Framework Preset: Next.js
     - Build Command: `npm run build`
     - Output Directory: `.next`
     - Install Command: `npm install`

3. **Environment Variables**
   Add these in Vercel Dashboard → Project → Settings → Environment Variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_value
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_value
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_value
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_value
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_value
   NEXT_PUBLIC_FIREBASE_APP_ID=your_value
   FIREBASE_ADMIN_PROJECT_ID=your_value
   FIREBASE_ADMIN_CLIENT_EMAIL=your_value
   FIREBASE_ADMIN_PRIVATE_KEY=your_value
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your_generated_secret
   ```

4. **Deploy**
   - Click "Deploy"
   - Your app will be available at `https://your-project.vercel.app`

#### Custom Domain (Optional)
- Add custom domain in Vercel Dashboard → Project → Settings → Domains
- Update DNS records as instructed
- SSL certificate is automatically provided

### Option 2: Netlify

1. **Build Settings**
   - Build Command: `npm run build && npm run export`
   - Publish Directory: `out`

2. **netlify.toml** (create in root)
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

### Option 3: Docker

1. **Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   COPY package.json package-lock.json ./
   RUN npm ci --only=production

   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY . .
   COPY --from=deps /app/node_modules ./node_modules
   RUN npm run build

   FROM node:18-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV production
   RUN addgroup -g 1001 -S nodejs
   RUN adduser -S nextjs -u 1001
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
   COPY --from=builder /app/node_modules ./node_modules
   COPY --from=builder /app/package.json ./package.json
   USER nextjs
   EXPOSE 3000
   ENV PORT 3000
   CMD ["npm", "start"]
   ```

2. **Build and Run**
   ```bash
   docker build -t coffee-management .
   docker run -p 3000:3000 coffee-management
   ```

### Option 4: Traditional VPS/Server

1. **Server Requirements**
   - Node.js 18+
   - PM2 (process manager)
   - Nginx (reverse proxy)
   - SSL certificate

2. **Setup Steps**
   ```bash
   # Install dependencies
   npm install

   # Build application
   npm run build

   # Install PM2
   npm install -g pm2

   # Start with PM2
   pm2 start npm --name "coffee-management" -- start
   pm2 save
   pm2 startup
   ```

3. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🔧 Post-Deployment Configuration

### 1. Firebase Security Rules

Update Firestore rules for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin access
    match /{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.email in [
          'admin@coffeehouse.com',
          'manager@coffeehouse.com'
        ];
    }
    
    // Public read access for products (if needed by mobile app)
    match /products/{productId} {
      allow read: if true;
    }
  }
}
```

### 2. Create Admin User

1. Go to Firebase Console → Authentication
2. Add user with admin email
3. Note the UID for future reference

### 3. Environment Verification

Create a health check endpoint to verify configuration:

```typescript
// pages/api/health.ts
export default function handler(req: any, res: any) {
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'FIREBASE_ADMIN_PROJECT_ID',
    'NEXTAUTH_SECRET'
  ];
  
  const missing = requiredEnvVars.filter(env => !process.env[env]);
  
  if (missing.length > 0) {
    return res.status(500).json({
      status: 'error',
      message: `Missing environment variables: ${missing.join(', ')}`
    });
  }
  
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
}
```

### 4. Performance Optimization

1. **Enable Compression**
   ```javascript
   // next.config.js
   module.exports = {
     compress: true,
     poweredByHeader: false,
     generateEtags: false,
   }
   ```

2. **Bundle Analysis**
   ```bash
   npm install --save-dev @next/bundle-analyzer
   ANALYZE=true npm run build
   ```

### 5. Monitoring Setup

1. **Error Tracking**
   - Sentry integration
   - Firebase Crashlytics

2. **Performance Monitoring**
   - Vercel Analytics
   - Google Analytics
   - Firebase Performance

3. **Uptime Monitoring**
   - UptimeRobot
   - Pingdom
   - StatusCake

## 🔒 Security Checklist

- [ ] Environment variables secured
- [ ] Firebase security rules updated
- [ ] HTTPS enabled
- [ ] Admin user created with strong password
- [ ] API endpoints secured
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation in place
- [ ] Audit logs enabled

## 📊 Production Monitoring

### Key Metrics to Monitor

1. **Application Performance**
   - Response times
   - Error rates
   - Memory usage
   - CPU usage

2. **Business Metrics**
   - Order processing times
   - User engagement
   - Revenue tracking
   - Inventory accuracy

3. **Infrastructure**
   - Database performance
   - Firebase usage
   - CDN performance
   - Server uptime

### Alerts Setup

Configure alerts for:
- Application errors
- High response times
- Low inventory
- Failed payments
- Unusual traffic patterns

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build application
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify Firebase configuration
   - Clear `.next` folder and rebuild

2. **Authentication Issues**
   - Verify Firebase Auth configuration
   - Check admin user creation
   - Confirm NEXTAUTH_SECRET is set

3. **Database Connection**
   - Verify Firestore rules
   - Check Firebase project ID
   - Confirm service account permissions

### Support Channels

1. Check application logs
2. Review Firebase console
3. Monitor Vercel function logs
4. Check browser developer tools

## 📈 Scaling Considerations

### Performance Optimization

1. **Database**
   - Index optimization
   - Query optimization
   - Caching strategies

2. **Frontend**
   - Code splitting
   - Image optimization
   - CDN usage

3. **API**
   - Rate limiting
   - Response caching
   - Connection pooling

### Infrastructure Scaling

1. **Horizontal Scaling**
   - Load balancers
   - Multiple instances
   - Database replicas

2. **Vertical Scaling**
   - Increased server resources
   - Memory optimization
   - CPU optimization

---

**Deployment Complete!** 🎉

Your Coffee Management System is now live and ready to manage your coffee business efficiently.
