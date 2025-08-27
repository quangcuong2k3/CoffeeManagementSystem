# ☕ Coffee Management System - Quick Start

Welcome to your new Coffee Management System! This comprehensive admin dashboard will help you manage your coffee business efficiently.

## 🎯 What You Have

A complete **Next.js 14 TypeScript** web application featuring:

### 📊 **Analytics Dashboard**
- Real-time sales metrics
- Customer analytics
- Inventory tracking
- Financial reports

### 🛍️ **Order Management**
- Order processing & tracking
- Payment management
- Customer communication
- Delivery coordination

### ☕ **Product Management**
- Coffee inventory tracking
- Product catalog management
- Pricing & promotions
- Stock alerts

### 👥 **Customer Relationship Management**
- Customer profiles & history
- Loyalty program management
- Review & feedback system
- Communication tools

### 💰 **Financial Management**
- Revenue tracking
- Expense management
- Profit analysis
- Tax reporting

## 🚀 Getting Started (5 Minutes)

### Step 1: Install Dependencies
```bash
cd CoffeeManagementSystem
npm install
```

### Step 2: Configure Firebase
Create `.env.local` file:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXTAUTH_SECRET=your_secret_key
```

### Step 3: Run Development Server
```bash
npm run dev
```

**Open http://localhost:3000** 🎉

## 📱 Integration with Your React Native App

This system **shares the same Firebase backend** as your React Native Coffee app:

- ✅ **Same Database**: All data syncs in real-time
- ✅ **Same Authentication**: Manage users across platforms
- ✅ **Same Products**: Changes reflect immediately in mobile app
- ✅ **Same Orders**: Process mobile orders through web dashboard

## 🎨 Features Overview

### Dashboard Home
- **Quick Metrics**: Sales, orders, customers, revenue
- **Recent Activity**: Latest orders and customer actions
- **Alerts**: Low stock, pending orders, system notifications
- **Quick Actions**: Add products, process orders, view reports

### Product Management
- Add/edit coffee products and accessories
- Bulk import/export capabilities
- Category and tag management
- Pricing and discount management
- Image upload and management

### Order Processing
- Real-time order notifications
- Order status tracking
- Payment processing integration
- Customer communication tools
- Delivery coordination

### Analytics & Reports
- Sales trends and forecasting
- Customer behavior analysis
- Inventory turnover reports
- Financial performance metrics
- Custom report generation

### Customer Management
- Customer profile management
- Purchase history tracking
- Loyalty program administration
- Review and rating management
- Communication history

## 🔧 Configuration Guide

### Firebase Setup
1. Use your existing Firebase project from React Native app
2. Enable Firestore, Authentication, and Storage
3. Update security rules for admin access
4. Create admin user account

### Environment Variables
```env
# Firebase Configuration (from your React Native app)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Authentication
NEXTAUTH_SECRET=generate_a_secure_secret

# Optional: Admin Configuration
ADMIN_EMAIL=admin@coffeehouse.com
```

### Creating Admin User
1. Go to Firebase Console → Authentication
2. Add user with admin email
3. Use this email to login to the management system

## 📂 Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── dashboard/         # Main dashboard pages
│   ├── products/          # Product management
│   ├── orders/            # Order management
│   ├── customers/         # Customer management
│   ├── analytics/         # Reports & analytics
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (Shadcn)
│   ├── dashboard/        # Dashboard-specific components
│   ├── forms/            # Form components
│   └── charts/           # Chart components
├── services/             # Firebase & API services
├── store/               # Zustand state management
├── types/               # TypeScript definitions
├── lib/                 # Utilities and configurations
└── theme/               # Styling and theme
```

## 🛠️ Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **State Management**: Zustand + TanStack Query
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

## 🚀 Deployment Options

### Vercel (Recommended)
1. Push to GitHub repository
2. Connect to Vercel
3. Add environment variables
4. Deploy automatically

### Docker
```bash
docker build -t coffee-management .
docker run -p 3000:3000 coffee-management
```

### Traditional Server
- Node.js 18+
- PM2 for process management
- Nginx for reverse proxy

## 📊 Usage Examples

### Adding a New Coffee Product
1. Navigate to Products → Add Product
2. Fill in product details (name, description, price)
3. Upload product images
4. Set inventory levels
5. Publish to mobile app

### Processing Orders
1. View incoming orders on Dashboard
2. Update order status (preparing, ready, delivered)
3. Send notifications to customers
4. Track delivery and completion

### Analyzing Sales Data
1. Go to Analytics dashboard
2. Select date range
3. View sales trends, popular products
4. Export reports for accounting

## 🔒 Security Features

- Firebase Authentication integration
- Role-based access control
- Secure API endpoints
- Data validation and sanitization
- Audit logging
- Rate limiting

## 🆘 Support & Documentation

- **README.md**: Detailed setup instructions
- **DEPLOYMENT.md**: Production deployment guide
- **Components Documentation**: In-code documentation
- **API Documentation**: Firebase service layer docs

## 🔄 Development Workflow

1. **Local Development**: `npm run dev`
2. **Type Checking**: `npm run type-check`
3. **Linting**: `npm run lint`
4. **Building**: `npm run build`
5. **Testing**: `npm run test`

## 📈 Performance Monitoring

The system includes:
- Real-time error tracking
- Performance monitoring
- User analytics
- System health checks
- Automated alerts

## 🎯 Next Steps

1. **Install and Configure**: Follow the quick start guide
2. **Customize Branding**: Update colors, logos, and styling
3. **Add Team Members**: Create additional admin accounts
4. **Configure Notifications**: Set up email/SMS alerts
5. **Deploy to Production**: Use Vercel for easy deployment

---

**Ready to manage your coffee business like a pro!** ☕

Need help? Check the detailed documentation or reach out for support.

**Happy Coffee Managing!** 🎉
