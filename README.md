# Coffee House Management System

A comprehensive, modern admin dashboard for the Coffee House mobile application built with Next.js 14, TypeScript, and Firebase.

## 🚀 Features

### 📊 Dashboard & Analytics
- Real-time sales overview with interactive charts
- Revenue analytics (daily/weekly/monthly)
- Customer behavior insights
- Product performance metrics
- Geographic delivery analysis

### 🛒 Order Management
- Real-time order tracking and status updates
- Order lifecycle management (pending → delivered)
- Customer order history
- Payment method analytics (Stripe, MoMo, COD)
- Bulk order operations

### 📦 Product & Inventory Management
- Product catalog management (coffee & beans)
- Real-time inventory tracking
- Low stock alerts and notifications
- Supplier management
- Stock movement history
- Automated reorder point alerts

### 👥 Customer Relationship Management
- Customer profiles and segmentation
- Order history and preferences
- Support ticket management
- Review and rating moderation
- Customer lifetime value analytics

### 💰 Financial Management
- Revenue tracking and forecasting
- Payment reconciliation
- Expense tracking
- Profit margin analysis
- Financial reporting

### 🎯 Marketing & Campaigns
- Push notification management
- Email campaign tools
- Discount and promotion management
- Customer segmentation
- A/B testing capabilities

### 🔧 System Administration
- User role management
- Security monitoring
- System performance metrics
- Backup and recovery
- API monitoring

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **State Management**: Zustand + TanStack Query
- **Charts**: Recharts
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- Firebase project (shared with your React Native app)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Environment Setup

Create `.env.local` file in the root directory:

```env
# Firebase Configuration (Copy from your React Native app)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (for server-side operations)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_admin_email@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"

# Admin Authentication
ADMIN_EMAIL=admin@coffeehouse.com
ADMIN_PASSWORD=SecureAdminPassword123!
```

### 3. Firebase Configuration

1. **Get Firebase Config**: Copy the configuration from your React Native app's `firebaseconfig.ts`
2. **Enable Firebase Services**: Ensure Firestore, Authentication, and Storage are enabled
3. **Set Up Admin User**: Create an admin user in Firebase Authentication Console
4. **Security Rules**: Update Firestore security rules to allow admin access

### 4. Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## 🔐 Authentication

The system uses Firebase Authentication with email/password. Create an admin user with these steps:

1. Go to Firebase Console → Authentication → Users
2. Add a new user with admin email and secure password
3. Note the UID for admin privileges setup

## 📁 Project Structure

```
src/
├── app/                  # Next.js 14 App Router
│   ├── dashboard/        # Dashboard pages
│   ├── products/         # Product management
│   ├── orders/           # Order management
│   ├── customers/        # Customer management
│   ├── inventory/        # Inventory management
│   ├── analytics/        # Analytics and reports
│   └── settings/         # System settings
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (Shadcn)
│   ├── charts/          # Chart components
│   ├── forms/           # Form components
│   └── layout/          # Layout components
├── lib/                 # Utilities and configurations
├── services/            # API and Firebase services
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── store/               # State management
└── utils/               # Utility functions
```

## 🎨 UI Components

Built with [Shadcn/UI](https://ui.shadcn.com/) for consistency and accessibility:

- **Dashboard**: Cards, charts, metrics
- **Tables**: Sortable, filterable data tables
- **Forms**: Validation with React Hook Form + Zod
- **Modals**: Confirmation dialogs, forms
- **Navigation**: Sidebar, breadcrumbs
- **Notifications**: Toast messages, alerts

## 📊 Dashboard Features

### Real-time Metrics
- Total revenue with growth percentage
- Order count and trends
- Customer analytics
- Product performance

### Interactive Charts
- Revenue trends (line charts)
- Order status distribution (pie charts)
- Sales by product category (bar charts)
- Geographic sales distribution

### Quick Actions
- View recent orders
- Check inventory alerts
- Monitor customer reviews
- System notifications

## 🛡 Security

- Firebase Authentication for secure admin access
- Role-based access control (RBAC)
- Input validation and sanitization
- Secure API endpoints
- HTTPS enforcement

## 🚀 Deployment

### Vercel Deployment

1. **Connect Repository**:
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Environment Variables**: Set all environment variables in Vercel dashboard

3. **Build Settings**:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Custom Domain
Configure your custom domain in Vercel dashboard for production access.

## 🔧 Configuration

### Firebase Security Rules

Update Firestore rules for admin access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow admin users full access
    match /{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.email in ['admin@coffeehouse.com'];
    }
  }
}
```

### Customization

1. **Branding**: Update colors and logos in `tailwind.config.js`
2. **Features**: Enable/disable modules in configuration
3. **Integrations**: Add third-party services as needed

## 📈 Analytics Integration

- **Firebase Analytics**: Built-in event tracking
- **Custom Metrics**: Business-specific KPIs
- **Real-time Data**: Live updates via Firestore
- **Export Capabilities**: CSV/Excel report generation

## 🤝 Integration with Mobile App

This management system seamlessly integrates with your React Native Coffee House app:

- **Shared Database**: Same Firebase Firestore collections
- **Real-time Sync**: Changes reflect immediately in mobile app
- **Order Management**: Update order status from admin panel
- **Inventory Sync**: Stock updates sync to mobile app
- **User Management**: Manage customer accounts

## 📞 Support

For technical support and questions:

1. Check the documentation
2. Review Firebase console for errors
3. Check browser developer tools
4. Ensure environment variables are correct

## 🗺 Roadmap

- [ ] Advanced reporting with custom date ranges
- [ ] Mobile admin app (React Native)
- [ ] Multi-language support
- [ ] Advanced customer segmentation
- [ ] Automated marketing campaigns
- [ ] AI-powered inventory forecasting
- [ ] WhatsApp/SMS integration
- [ ] Advanced role management
- [ ] Audit logs and compliance

## 📄 License

This project is part of the Coffee House application suite. All rights reserved.

---

**Coffee House Management System** - Empowering your coffee business with data-driven insights and efficient operations management.
