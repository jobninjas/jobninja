# Nova Ninjas - Complete Project Documentation

**A Human-Powered Job Application Service Platform**

Version: 1.0.0  
Last Updated: November 2025

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Project Structure](#project-structure)
5. [Installation & Setup](#installation--setup)
6. [Environment Configuration](#environment-configuration)
7. [Running the Application](#running-the-application)
8. [API Documentation](#api-documentation)
9. [Payment Integration](#payment-integration)
10. [Authentication System](#authentication-system)
11. [Dashboard Features](#dashboard-features)
12. [Deployment](#deployment)
13. [Development Workflow](#development-workflow)
14. [Testing](#testing)
15. [Troubleshooting](#troubleshooting)
16. [Future Roadmap](#future-roadmap)

---

## 📖 Project Overview

**Nova Ninjas** is a full-stack SaaS application that provides human-powered job application services. Unlike AI bots, Nova Ninjas uses real specialists to apply to 20-40 jobs per day on behalf of job seekers in the US.

### Key Value Proposition
- **Human specialists** (not bots) apply to jobs
- **400-600 applications per month** based on subscription tier
- **Target audience**: Recently laid-off professionals, visa holders, career changers
- **Focus**: Free up time for networking, skill-building, and interview preparation

### Business Model
- **Subscription-based pricing**: $399-$599/month
- **Payment processing**: Stripe (supports cards, Apple Pay, Google Pay, Cash App)
- **Target market**: US-based job seekers

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.0.0
- **UI Library**: shadcn/ui (Radix UI components)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM 7.5.1
- **HTTP Client**: Axios
- **Port**: 3000

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB
- **ORM**: Motor (async MongoDB driver)
- **Payment**: Stripe SDK
- **Authentication**: Mock (ready for Clerk/Firebase)
- **Port**: 8001

### Infrastructure
- **Process Manager**: Supervisor
- **Package Managers**: 
  - Frontend: Yarn
  - Backend: pip
- **Environment**: Ubuntu/Debian Linux

---

## ✨ Features

### Public Features
- ✅ **Marketing Landing Page**
  - Hero section with live dashboard preview
  - "How It Works" 4-step process
  - Human vs AI Bots comparison table
  - Pricing tiers (Starter/Pro/Urgent)
  - FAQ accordion
  - Testimonials and metrics
  - Contact/Waitlist form

- ✅ **Authentication**
  - Email/password signup
  - Login with role-based redirect
  - Mock auth (ready for real provider)
  - Protected routes

- ✅ **Pricing Page**
  - Three subscription tiers
  - Stripe Checkout integration
  - Support for multiple payment methods

### Customer Features (After Login)
- ✅ **Customer Dashboard**
  - Live KPI cards (auto-incrementing)
  - Applications pipeline table
  - Approve & Submit queue (placeholder)
  - Billing management
  - Settings section

- ✅ **Real-Time Metrics**
  - Our Applications This Week: 124 (+ auto-increment)
  - Total Jobs Applied: 1,064 (+ auto-increment)
  - Hours Saved: 224h
  - Numbers increase by 1 every 10 minutes

### Payment Features
- ✅ **Stripe Integration**
  - Checkout session creation
  - Webhook handling (subscription lifecycle)
  - Customer portal for subscription management
  - Support for cards, Apple Pay, Google Pay, Cash App Pay

### Admin/Employee Features (Placeholders)
- 🔜 **Employee Portal** - Case management, application logging
- 🔜 **Admin Console** - System metrics, customer management

---

## 📁 Project Structure

```
/app/
├── frontend/                      # React application
│   ├── public/
│   │   ├── index.html            # Main HTML with meta tags
│   │   └── logo.png              # Nova Ninjas logo
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui components
│   │   │   ├── LandingPage.jsx   # Main landing page
│   │   │   ├── Login.jsx         # Login form
│   │   │   ├── Signup.jsx        # Signup form
│   │   │   ├── Dashboard.jsx     # Customer dashboard
│   │   │   ├── Pricing.jsx       # Pricing page
│   │   │   ├── Employee.jsx      # Employee portal (placeholder)
│   │   │   ├── Admin.jsx         # Admin console (placeholder)
│   │   │   ├── PaymentSuccess.jsx # Payment success page
│   │   │   ├── PaymentCanceled.jsx # Payment canceled page
│   │   │   └── ProtectedRoute.jsx # Route protection wrapper
│   │   ├── contexts/
│   │   │   └── AuthContext.js    # Mock auth context
│   │   ├── hooks/
│   │   │   └── use-toast.js      # Toast notifications
│   │   ├── mock.js               # Mock data
│   │   ├── App.js                # Main app with routing
│   │   ├── App.css               # Global styles
│   │   ├── LandingPage.css       # Landing page styles
│   │   └── index.css             # Tailwind & global CSS
│   ├── package.json              # Frontend dependencies
│   └── tailwind.config.js        # Tailwind configuration
│
├── backend/                       # FastAPI application
│   ├── server.py                 # Main FastAPI app
│   ├── payment_service.py        # Stripe integration
│   ├── models.py                 # Pydantic models
│   ├── .env                      # Environment variables
│   └── requirements.txt          # Python dependencies
│
├── saas-app/                      # Next.js SaaS app (separate)
│   └── [Next.js structure]       # For future multi-role dashboards
│
├── STRIPE_SETUP_GUIDE.md         # Stripe integration guide
├── QUICK_STRIPE_SETUP.md         # 5-minute Stripe setup
├── SAAS_UPGRADE_GUIDE.md         # SaaS upgrade documentation
└── PROJECT.md                     # This file
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 16+ and Yarn
- Python 3.11+
- MongoDB (local or cloud)
- Stripe account (for payments)

### 1. Clone and Install Dependencies

#### Frontend Setup
```bash
cd /app/frontend
yarn install
```

#### Backend Setup
```bash
cd /app/backend
pip install -r requirements.txt
```

### 2. Environment Configuration

#### Frontend Environment (`/app/frontend/.env`)
```bash
REACT_APP_BACKEND_URL=http://localhost:8001
```

#### Backend Environment (`/app/backend/.env`)
```bash
# Database
MONGO_URL=mongodb://localhost:27017/
DB_NAME=nova_squad

# Stripe (get from dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs (create products first)
STRIPE_PRICE_STARTER=price_starter_id
STRIPE_PRICE_PRO=price_pro_id
STRIPE_PRICE_URGENT=price_urgent_id

# App URLs
FRONTEND_URL=http://localhost:3000
```

### 3. Start Services

#### Using Supervisor (Recommended)
```bash
sudo supervisorctl restart all
```

#### Manual Start

**Backend:**
```bash
cd /app/backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Frontend:**
```bash
cd /app/frontend
yarn start
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001/api/
- **API Docs**: http://localhost:8001/docs

---

## 🔐 Environment Configuration

### Required Environment Variables

#### Frontend
| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_BACKEND_URL` | Backend API URL | `http://localhost:8001` |

#### Backend
| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URL` | MongoDB connection string | `mongodb://localhost:27017/` |
| `DB_NAME` | Database name | `nova_squad` |
| `STRIPE_SECRET_KEY` | Stripe secret API key | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | `whsec_...` |
| `STRIPE_PRICE_STARTER` | Starter plan price ID | `price_...` |
| `STRIPE_PRICE_PRO` | Pro plan price ID | `price_...` |
| `STRIPE_PRICE_URGENT` | Urgent plan price ID | `price_...` |
| `FRONTEND_URL` | Frontend URL for redirects | `http://localhost:3000` |

---

## 📡 API Documentation

### Base URL
```
http://localhost:8001/api
```

### Public Endpoints

#### Health Check
```http
GET /api/
```
**Response:**
```json
{
  "message": "Hello World"
}
```

#### Create Checkout Session
```http
POST /api/create-checkout-session
Content-Type: application/json

{
  "plan_id": "1",
  "user_email": "customer@example.com",
  "user_id": "user_123"
}
```
**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/...",
  "status": "created"
}
```

#### Stripe Webhook
```http
POST /api/webhooks/stripe
Stripe-Signature: t=...,v1=...

[Stripe webhook payload]
```

#### Get Subscription
```http
GET /api/subscription/{user_id}
```
**Response:**
```json
{
  "id": "sub_123",
  "user_id": "user_123",
  "plan_id": "2",
  "status": "active",
  "current_period_end": "2025-02-24T00:00:00Z"
}
```

#### Create Customer Portal Session
```http
POST /api/create-portal-session
Content-Type: application/json

{
  "user_id": "user_123"
}
```
**Response:**
```json
{
  "url": "https://billing.stripe.com/..."
}
```

---

## 💳 Payment Integration

### Stripe Setup (Quick Guide)

1. **Sign up at Stripe**: https://dashboard.stripe.com/register
2. **Stay in Test Mode** for development
3. **Get API Keys**: Developers → API Keys
4. **Create Products**: 
   - Starter: $399/month (400 applications)
   - Pro: $499/month (500 applications)
   - Urgent: $599/month (600 applications)
5. **Add Keys to .env**: Copy secret key and price IDs
6. **Restart Backend**: `sudo supervisorctl restart backend`

### Supported Payment Methods
- ✅ **Credit/Debit Cards** - All major brands
- ✅ **Apple Pay** - Automatic on compatible devices
- ✅ **Google Pay** - Automatic on compatible devices
- ✅ **Cash App Pay** - US customers only

### Webhook Events Handled
- `checkout.session.completed` - Subscription activated
- `customer.subscription.updated` - Status changed
- `customer.subscription.deleted` - Subscription canceled
- `invoice.payment_failed` - Payment failed

### Testing Payments

**Test Card Numbers:**
| Card | Result |
|------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Declined |
| `4000 0000 0000 9995` | Insufficient funds |

**Expiry**: Any future date (e.g., 12/25)  
**CVC**: Any 3 digits (e.g., 123)

---

## 🔒 Authentication System

### Current Implementation: Mock Auth

The application currently uses localStorage-based mock authentication for development. This is designed to be easily replaced with a real auth provider.

#### Mock Auth Features
- ✅ Email/password signup and login
- ✅ User session storage (localStorage)
- ✅ Role-based routing (customer/employee/admin)
- ✅ Protected routes
- ✅ Auto-redirect based on role

#### Auth Context Location
```javascript
/app/frontend/src/contexts/AuthContext.js
```

#### How It Works
1. User signs up/logs in with any email/password
2. Mock user object created with role: `customer`
3. Token and user data stored in localStorage
4. Protected routes check `isAuthenticated` state
5. Role-based redirect on login

#### Replacing with Real Auth

**Option 1: Firebase Auth**
```bash
yarn add firebase
```

**Option 2: Clerk**
```bash
yarn add @clerk/clerk-react
```

**Option 3: Auth0**
```bash
yarn add @auth0/auth0-react
```

See `/app/SAAS_UPGRADE_GUIDE.md` for detailed integration instructions.

---

## 📊 Dashboard Features

### Customer Dashboard

#### KPI Cards (Auto-Incrementing)
- **Our Applications This Week**: Base 124, +1 every 10 minutes
- **Total Jobs Applied**: Base 1,064, +1 every 10 minutes
- **Interviews**: 3 (static)
- **Hours Saved**: 224h (static)

#### Auto-Increment Implementation
```javascript
// Base values
const BASE_KPI_VALUES = {
  applicationsThisWeek: 124,
  totalJobsApplied: 1064,
  interviews: 3,
  hoursSaved: 224
};

// Increments stored in localStorage with timestamp
// Calculates elapsed time and adds increments
// Updates every 1 minute while dashboard is open
```

#### Tabs/Sections
1. **Pipeline** - Applications table with mock data
2. **Approve & Submit Queue** - Placeholder for approval flow
3. **Billing & Subscription** - Plan details and management
4. **Settings** - User preferences (placeholder)

### Landing Page Dashboard Card
- Shows animated numbers on page load
- Displays same metrics as customer dashboard
- Located in hero section
- Title: "Our Dashboard"

---

## 🌐 Deployment

### Production Checklist

#### 1. Environment Setup
- [ ] Set production MongoDB URL
- [ ] Use Stripe Live Mode keys
- [ ] Update `FRONTEND_URL` to production domain
- [ ] Set up production webhook endpoint

#### 2. Stripe Configuration
- [ ] Switch to Live Mode in Stripe Dashboard
- [ ] Create live products (Starter/Pro/Urgent)
- [ ] Get live API keys
- [ ] Configure live webhook URL: `https://yourdomain.com/api/webhooks/stripe`
- [ ] Enable payment methods: Cards, Apple Pay, Google Pay, Cash App

#### 3. Build & Deploy
```bash
# Frontend
cd /app/frontend
yarn build

# Backend (requirements already frozen)
# Deploy server.py with gunicorn or uvicorn
```

#### 4. Database
- [ ] Use MongoDB Atlas or production MongoDB
- [ ] Set up indexes for performance
- [ ] Enable authentication
- [ ] Regular backups

#### 5. Security
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set CORS allowed origins
- [ ] Secure environment variables
- [ ] Enable Stripe webhook signature verification
- [ ] Rate limiting on API endpoints

---

## 👨‍💻 Development Workflow

### Adding New Features

#### Frontend Components
```bash
cd /app/frontend/src/components
# Create new component file
# Import shadcn/ui components from ./ui/
# Use Tailwind for styling
```

#### Backend Endpoints
```python
# Add to /app/backend/server.py
@api_router.post("/your-endpoint")
async def your_function():
    # Your logic here
    return {"status": "success"}
```

#### Mock Data
```javascript
// Update /app/frontend/src/mock.js
export const yourMockData = [
  // Your data here
];
```

### Code Style Guidelines

#### Frontend
- Use functional components with hooks
- Named exports for components: `export const ComponentName`
- Default exports for pages: `export default PageName`
- Use shadcn/ui components from `./components/ui/`
- Tailwind CSS for styling
- Lucide React for icons (NO emoji icons)

#### Backend
- FastAPI with async/await
- Pydantic models for validation
- Type hints for all functions
- API endpoints under `/api` prefix
- Error handling with HTTPException

### Git Workflow (When Connected)
```bash
# Feature development
git checkout -b feature/your-feature
# Make changes
git commit -m "Add: feature description"
git push origin feature/your-feature
# Create PR for review
```

---

## 🧪 Testing

### Manual Testing

#### Test Authentication Flow
1. Go to http://localhost:3000
2. Click "Get Started"
3. Fill signup form (any email/password)
4. Verify redirect to pricing page
5. Go to login, use same credentials
6. Verify redirect to dashboard

#### Test Payment Flow (Test Mode)
1. Login to account
2. Go to Pricing page
3. Click "Subscribe Now" on any plan
4. Use test card: `4242 4242 4242 4242`
5. Complete checkout
6. Verify redirect to success page
7. Check subscription in database

#### Test Dashboard
1. Login to account
2. Verify KPI numbers display correctly
3. Wait 1 minute, check if numbers auto-update
4. Click different tabs (Pipeline, Billing, Settings)
5. Verify all sections load

### Testing with Stripe CLI

**Install Stripe CLI:**
```bash
# Ubuntu/Debian
curl -s https://packages.stripe.com/api/v1/buster/public.key | sudo apt-key add -
echo "deb https://packages.stripe.com/stripe-cli-debian-local stable main" | sudo tee /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe
```

**Forward Webhooks:**
```bash
stripe login
stripe listen --forward-to http://localhost:8001/api/webhooks/stripe
```

**Trigger Test Events:**
```bash
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
```

---

## 🐛 Troubleshooting

### Common Issues

#### Frontend Won't Start
```bash
# Check if port 3000 is in use
sudo lsof -i :3000
# Kill process if needed
kill -9 <PID>

# Clear cache and reinstall
rm -rf node_modules yarn.lock
yarn install
```

#### Backend Won't Start
```bash
# Check backend logs
tail -f /var/log/supervisor/backend.err.log

# Common issues:
# 1. Missing environment variables
# 2. MongoDB not running
# 3. Port 8001 already in use

# Restart backend
sudo supervisorctl restart backend
```

#### Payment Integration Not Working
```bash
# Check Stripe keys are set
cat /app/backend/.env | grep STRIPE

# Verify you're in Test Mode in Stripe Dashboard
# Make sure Price IDs are correct
# Check backend logs for detailed error
```

#### Dashboard Numbers Not Incrementing
```bash
# Clear localStorage in browser console:
localStorage.clear()

# Reload page
# Numbers should start from base values
```

#### MongoDB Connection Failed
```bash
# Check MongoDB is running
sudo systemctl status mongod

# Start MongoDB if stopped
sudo systemctl start mongod

# Verify connection string in .env
```

### Logs Location
```bash
# Frontend logs
/var/log/supervisor/frontend.out.log
/var/log/supervisor/frontend.err.log

# Backend logs
/var/log/supervisor/backend.out.log
/var/log/supervisor/backend.err.log

# View live logs
tail -f /var/log/supervisor/backend.err.log
```

### Restart Services
```bash
# Restart all services
sudo supervisorctl restart all

# Restart specific service
sudo supervisorctl restart frontend
sudo supervisorctl restart backend

# Check status
sudo supervisorctl status
```

---

## 🗺️ Future Roadmap

### Phase 1: Core Functionality (Current)
- ✅ Landing page with marketing content
- ✅ User authentication (mock)
- ✅ Customer dashboard with KPIs
- ✅ Stripe payment integration
- ✅ Subscription management

### Phase 2: Real Backend Integration (Next)
- 🔜 Replace mock auth with Clerk/Firebase
- 🔜 Real API endpoints for customer data
- 🔜 Database models for users and applications
- 🔜 Admin panel for customer management

### Phase 3: Employee Portal
- 🔜 Employee login and dashboard
- 🔜 Case management interface
- 🔜 Application logging system
- 🔜 Customer assignment workflow

### Phase 4: Advanced Features
- 🔜 Email notifications (SendGrid/AWS SES)
- 🔜 Document upload (S3/Cloud Storage)
- 🔜 Interview scheduling integration
- 🔜 Performance analytics

### Phase 5: Scaling
- 🔜 Multi-role admin console
- 🔜 API rate limiting
- 🔜 Caching layer (Redis)
- 🔜 Load balancing
- 🔜 Monitoring & alerting

---

## 📞 Support & Resources

### Documentation
- **Stripe Setup**: `/app/STRIPE_SETUP_GUIDE.md`
- **Quick Setup**: `/app/QUICK_STRIPE_SETUP.md`
- **SaaS Upgrade**: `/app/SAAS_UPGRADE_GUIDE.md`
- **This File**: `/app/PROJECT.md`

### External Resources
- **Stripe Docs**: https://stripe.com/docs
- **React Docs**: https://react.dev
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com

### Tech Stack Versions
- React: 19.0.0
- FastAPI: 0.110.1
- MongoDB: Motor 3.3.1
- Stripe: 14.0.1
- Tailwind: 3.4.17

---

## 📄 License

Proprietary - Nova Ninjas  
© 2025 Nova Ninjas. All rights reserved.

---

## 📝 Change Log

### Version 1.0.0 (November 2025)
- Initial release
- Landing page with full marketing content
- Mock authentication system
- Customer dashboard with auto-incrementing KPIs
- Stripe payment integration (cards, Apple Pay, Google Pay, Cash App)
- Three subscription tiers
- Success/Cancel payment pages
- Logo branding across all pages
- Mobile responsive design
- Auto-increment feature (permanent growth metrics)

---

**Last Updated**: November 27, 2025  
**Maintained By**: Nova Ninjas Development Team  
**Contact**: support@novaninjas.com (placeholder)

---

*This documentation is continuously updated as the project evolves. For the latest updates, check the repository or contact the development team.*
