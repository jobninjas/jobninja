# Quick Stripe Setup (5 Minutes)

## ⚡ Fast Track to Working Payments

### 1. Sign Up for Stripe (2 min)
Go to: https://dashboard.stripe.com/register
- Use your email
- Stay in **Test Mode** (toggle in top-right corner)

### 2. Get API Keys (1 min)
In Stripe Dashboard:
- Click **Developers** → **API keys**
- Copy these two keys:
  - **Secret key**: `sk_test_...` (click "Reveal test key")
  - **Publishable key**: `pk_test_...`

### 3. Create Products (2 min)
Go to **Products** → **Add product**

**Create these 3 products:**

| Product Name | Price | Applications | Billing |
|-------------|-------|--------------|---------|
| Nova Ninjas - Starter | $399 | 400/month | Monthly |
| Nova Ninjas - Pro | $499 | 500/month | Monthly |
| Nova Ninjas - Urgent | $599 | 600/month | Monthly |

**After creating each product, copy the Price ID** (starts with `price_...`)

### 4. Add Keys to Your App
Open `/app/backend/.env` and replace these lines:

```bash
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE

STRIPE_PRICE_STARTER=price_YOUR_STARTER_ID
STRIPE_PRICE_PRO=price_YOUR_PRO_ID
STRIPE_PRICE_URGENT=price_YOUR_URGENT_ID
```

### 5. Restart Backend
```bash
sudo supervisorctl restart backend
```

### 6. Test Payment
1. Go to http://localhost:3000/pricing
2. Click **Subscribe Now**
3. Use test card: **4242 4242 4242 4242**
4. Expiry: any future date (12/25)
5. CVC: any 3 digits (123)

## ✅ Done!

Payment now works with:
- 💳 All credit/debit cards
- 🍎 Apple Pay (automatic)
- 🤖 Google Pay (automatic)
- 💵 Cash App Pay (automatic)

## 📚 Need More Help?

See full guide: `/app/STRIPE_SETUP_GUIDE.md`
- Webhook setup
- Production deployment
- Troubleshooting
- Test card scenarios
