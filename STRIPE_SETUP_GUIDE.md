# Stripe Payment Setup Guide for Nova Ninjas

## ✅ What's Already Built

Your payment system is **fully coded** and ready. You just need to:
1. Create a Stripe account
2. Get API keys
3. Create subscription products
4. Add keys to `.env` file

## 🎯 Payment Methods Supported

When customers click "Subscribe Now", they'll be redirected to Stripe Checkout which automatically supports:

✅ **Credit/Debit Cards** - Visa, Mastercard, Amex, Discover
✅ **Apple Pay** - Automatically shown if user has it configured
✅ **Google Pay** - Automatically shown if user has it configured  
✅ **Cash App Pay** - For US customers with Cash App

**You don't need to do anything special** - Stripe Checkout handles all of this automatically!

## 📝 Step-by-Step Setup (15 minutes)

### Step 1: Create Stripe Account

1. Go to https://dashboard.stripe.com/register
2. Sign up with your email
3. Complete business information
4. **Important**: Use **Test Mode** for development (toggle in top right)

### Step 2: Get Your API Keys

1. In Stripe Dashboard, go to: **Developers → API keys**
2. You'll see:
   - **Publishable key**: Starts with `pk_test_...`
   - **Secret key**: Click "Reveal test key" - starts with `sk_test_...`

3. Copy both keys

### Step 3: Create Subscription Products

You need to create 3 subscription products matching your pricing page:

#### Product 1: Starter Plan
1. Go to **Products → Add product**
2. Fill in:
   - **Name**: Nova Ninjas - Starter
   - **Description**: 400 applications per month
   - **Pricing model**: Recurring
   - **Price**: $399 USD
   - **Billing period**: Monthly
3. Click **Save product**
4. **Copy the Price ID** (starts with `price_...`) - you'll need this!

#### Product 2: Pro Plan
1. Click **Add product** again
2. Fill in:
   - **Name**: Nova Ninjas - Pro
   - **Description**: 500 applications per month
   - **Pricing model**: Recurring
   - **Price**: $499 USD
   - **Billing period**: Monthly
3. Click **Save product**
4. **Copy the Price ID**

#### Product 3: Urgent Plan
1. Click **Add product** again
2. Fill in:
   - **Name**: Nova Ninjas - Urgent
   - **Description**: 600 applications per month
   - **Pricing model**: Recurring
   - **Price**: $599 USD
   - **Billing period**: Monthly
3. Click **Save product**
4. **Copy the Price ID**

### Step 4: Add Keys to Your Backend

1. Open `/app/backend/.env` file
2. Replace these lines with your actual keys:

```bash
# Replace these with your Stripe keys
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# Replace these with your Price IDs from Step 3
STRIPE_PRICE_STARTER=price_YOUR_STARTER_PRICE_ID
STRIPE_PRICE_PRO=price_YOUR_PRO_PRICE_ID
STRIPE_PRICE_URGENT=price_YOUR_URGENT_PRICE_ID

# These are already set correctly
FRONTEND_URL=http://localhost:3000
```

3. Save the file

### Step 5: Restart Backend

```bash
cd /app
sudo supervisorctl restart backend
```

### Step 6: Test the Payment Flow

1. Go to http://localhost:3000
2. Click **Get Started** → create account
3. Go to **Pricing** page
4. Click **Subscribe Now** on any plan
5. You'll be redirected to Stripe Checkout
6. Use Stripe test card:
   - **Card number**: `4242 4242 4242 4242`
   - **Expiry**: Any future date (e.g., `12/25`)
   - **CVC**: Any 3 digits (e.g., `123`)
   - **Name**: Your name
   - **Email**: Your test email

7. Complete payment
8. You'll be redirected to success page!

## 🧪 Testing Different Payment Methods

### Test Apple Pay (if on iPhone/Mac)
1. Have Apple Pay set up on your device
2. Go through checkout flow
3. Apple Pay button will automatically appear
4. Use a test card in your Apple Wallet

### Test Cash App Pay
1. In Test Mode, Stripe provides a test Cash App option
2. During checkout, you'll see Cash App Pay button
3. Click it to test the flow

### Test Card Declines
Use these test cards to simulate different scenarios:

| Card Number         | Description                    |
|---------------------|--------------------------------|
| 4000 0000 0000 0002 | Card declined (generic)        |
| 4000 0000 0000 9995 | Insufficient funds             |
| 4000 0000 0000 0069 | Expired card                   |
| 4242 4242 4242 4242 | Success (always works)         |

## 🔔 Setting Up Webhooks (Important!)

Webhooks tell your backend when subscriptions change (canceled, payment failed, etc.)

### Local Development (using Stripe CLI)

1. **Install Stripe CLI**:
```bash
# On Ubuntu/Debian
curl -s https://packages.stripe.com/api/v1/buster/public.key | sudo apt-key add -
echo "deb https://packages.stripe.com/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe
```

2. **Login to Stripe CLI**:
```bash
stripe login
```

3. **Forward webhooks to your local backend**:
```bash
stripe listen --forward-to http://localhost:8001/api/webhooks/stripe
```

4. You'll see: `Your webhook signing secret is whsec_...`
5. Copy this secret and add to `/app/backend/.env`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

6. Restart backend: `sudo supervisorctl restart backend`

### Production Deployment

When you deploy to production:

1. Go to Stripe Dashboard → **Developers → Webhooks**
2. Click **Add endpoint**
3. Enter your production URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the **Signing secret**
6. Add it to your production environment variables

## 💰 Going Live (Production)

Once testing is done and you're ready for real payments:

1. **Complete Stripe account verification**:
   - Business details
   - Bank account for payouts
   - Tax information

2. **Switch to Live Mode**:
   - Toggle from "Test" to "Live" in Stripe Dashboard
   - Get new API keys (will start with `pk_live_...` and `sk_live_...`)

3. **Create live products**:
   - Create the same 3 products in Live mode
   - Get new Price IDs

4. **Update production environment**:
   - Use live API keys
   - Use live Price IDs
   - Set up production webhook

5. **Enable payment methods**:
   - Go to **Settings → Payment methods**
   - Enable: Cards, Apple Pay, Google Pay, Cash App Pay

## 📊 Monitoring Payments

### Stripe Dashboard
View all your payments, subscriptions, and customers at: https://dashboard.stripe.com

### Check Subscriptions in Your Database
```bash
# In your app
curl http://localhost:8001/api/subscription/USER_ID_HERE
```

### Check Webhook Events
All webhook events are logged in MongoDB collection: `webhook_events`

## 🔒 Security Notes

✅ **Already implemented**:
- Webhook signature verification
- Secure API key handling (server-side only)
- No credit card data touches your servers
- PCI compliance handled by Stripe

## 💡 Customer Portal

Users can manage their subscriptions (update card, cancel, view invoices) using Stripe's Customer Portal.

This is already set up! When a user clicks "Manage Subscription" in your dashboard, they'll be redirected to a Stripe-hosted portal.

## 🆘 Troubleshooting

### "Invalid API key"
- Make sure you copied the full key (starts with `sk_test_` for secret or `pk_test_` for publishable)
- Make sure you're in Test Mode in Stripe Dashboard
- Restart backend after adding keys

### "No such price"
- Make sure you copied the Price IDs correctly (start with `price_`)
- Make sure products are created in Test Mode
- Check if you're using the right plan ID (1, 2, or 3) from your pricing page

### Webhook not working
- Make sure Stripe CLI is running: `stripe listen`
- Check webhook secret is added to .env
- Backend must be restarted after adding webhook secret
- Check `/var/log/supervisor/backend.err.log` for errors

### Payment succeeded but not showing in dashboard
- Check webhook is working (see above)
- Check MongoDB database: `use nova_squad; db.subscriptions.find()`
- Look for errors in backend logs

## 📱 Mobile Testing

### Test on real devices:
1. Use `ngrok` to expose your local server:
```bash
ngrok http 3000
```

2. Update `FRONTEND_URL` in backend `.env` to your ngrok URL

3. Open the ngrok URL on your phone

4. Test Apple Pay (iPhone) or Google Pay (Android)

## ✅ Checklist

Before going live, make sure:

- [ ] Stripe account fully verified
- [ ] Live mode API keys added to production
- [ ] All 3 products created in Live mode
- [ ] Webhook endpoint configured for production
- [ ] Test payment successful in Test mode
- [ ] Webhook events logging correctly
- [ ] Customer can access dashboard after payment
- [ ] "Manage Subscription" button works

## 🎉 You're Done!

Your payment system is complete! Customers can now:
- Subscribe with card, Apple Pay, Google Pay, or Cash App
- Manage their subscription
- Cancel anytime
- Update payment method

All payment data is handled securely by Stripe. You never see or store credit card numbers.

---

**Need Help?**
- Stripe docs: https://stripe.com/docs
- Test cards: https://stripe.com/docs/testing
- Stripe support: https://support.stripe.com/

**Your Current Setup:**
- Backend endpoint: http://localhost:8001/api/create-checkout-session
- Webhook endpoint: http://localhost:8001/api/webhooks/stripe
- Success page: http://localhost:3000/payment/success
- Cancel page: http://localhost:3000/payment/canceled
