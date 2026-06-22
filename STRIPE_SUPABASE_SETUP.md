# Stripe & Supabase Integration Setup Guide

This document explains how to set up the Stripe and Supabase integration for the DS Boilerplate Landing Page.

## Overview

The integration allows users to purchase subscriptions (Monthly or Lifetime) through Stripe Checkout Sessions, with webhooks updating customer data in Supabase.

## Features

- **Monthly Plan**: $5.99/month with cancel anytime option
- **Lifetime Plan**: $49.90 one-time payment
- **URL Parameter Capture**: Captures `user_id` or `email` from URL parameters sent by the plugin
- **Stripe Checkout**: Uses official Stripe Checkout Sessions instead of Payment Links
- **Supabase Webhook**: Automatically updates customer subscription status via Stripe webhooks
- **License Verification**: Edge Function to verify customer premium status

## Setup Instructions

### 1. Stripe Configuration

1. **Create Stripe Products and Prices**
   - Go to Stripe Dashboard → Products
   - Create a product for "Monthly Plan" ($5.99/month recurring)
   - Create a product for "Lifetime Plan" ($49.90 one-time)
   - Note the **Price IDs** (starts with `price_`) for Edge Function configuration

2. **Setup Webhook**
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://lyexuguaeuwdtjeqwmst.supabase.co/functions/v1/stripe-webhook`
   - Select events: `checkout.session.completed`
   - Copy the webhook signing secret

3. **Get API Keys**
   - Go to Stripe Dashboard → Developers → API keys
   - Copy your Secret Key (starts with `sk_`)

### 2. Supabase Configuration

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Copy your project URL and anon key

2. **Run Database Migration**
   ```bash
   # Apply the migration to create the customers table
   supabase db push
   ```
   Or manually run the SQL from `supabase/migrations/001_create_customers_table.sql` in the Supabase SQL Editor.

3. **Get Service Role Key**
   - Go to Supabase Dashboard → Project Settings → API
   - Copy the `service_role` key (keep this secret!)

4. **Deploy Edge Functions**
   ```bash
   # Deploy the webhook function
   supabase functions deploy stripe-webhook --no-verify-jwt --project-ref lyexuguaeuwdtjeqwmst
   
   # Deploy the checkout session function
   supabase functions deploy create-checkout-session --no-verify-jwt --project-ref lyexuguaeuwdtjeqwmst
   
   # Deploy the license verification function
   supabase functions deploy verify-license --no-verify-jwt --project-ref lyexuguaeuwdtjeqwmst
   ```

5. **Set Environment Variables for stripe-webhook**
   - Go to Supabase Dashboard → Edge Functions → stripe-webhook
   - Add the following environment variables:
     - `STRIPE_SECRET_KEY`: Your Stripe secret key
     - `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook signing secret
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

6. **Set Environment Variables for create-checkout-session**
   - Go to Supabase Dashboard → Edge Functions → create-checkout-session
   - Add the following environment variables:
     - `STRIPE_SECRET_KEY`: Your Stripe secret key
     - `BASE_URL`: Your application base URL (e.g., `http://localhost:5173` for local, or your production URL)

7. **Set Environment Variables for verify-license**
   - Go to Supabase Dashboard → Edge Functions → verify-license
   - Add the following environment variables:
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_ANON_KEY`: Your Supabase anon key

### 3. Update Application Code

1. **Update Price IDs in create-checkout-session Edge Function**
   ```typescript
   // In supabase/functions/create-checkout-session/index.ts, update:
   const PRICE_IDS = {
     MONTHLY: 'price_your_actual_monthly_price_id',
     LIFETIME: 'price_your_actual_lifetime_price_id'
   }
   ```

2. **Update Product IDs in stripe-webhook Edge Function**
   ```typescript
   // In supabase/functions/stripe-webhook/index.ts, update:
   const PRODUCT_IDS = {
     MONTHLY: 'prod_your_actual_monthly_product_id',
     LIFETIME: 'prod_your_actual_lifetime_product_id'
   }
   ```

## How It Works

### Payment Flow

1. User visits landing page with URL parameters: `?user_id=abc123` or `?email=user@example.com`
2. Application captures these parameters from the URL
3. User clicks "Get Started" or "Get Lifetime Access"
4. Application calls `create-checkout-session` Edge Function with plan, email, and userId
5. Edge Function creates Stripe Checkout Session and returns checkout URL
6. Application redirects user to Stripe Checkout
7. User completes payment in Stripe
8. Stripe redirects to `/success` (payment completed) or `/cancel` (payment cancelled)
9. Stripe sends `checkout.session.completed` webhook to Supabase Edge Function
10. Edge Function extracts email and product information from session
11. Edge Function inserts/updates customer record in Supabase:
    - Sets `subscription_status = 'active'`
    - Sets `lifetime = true` (if lifetime product) or `false` (if monthly)
    - Links to user via email

### License Verification Flow

1. Plugin calls `verify-license` Edge Function with user email
2. Edge Function queries `customers` table by email
3. Edge Function returns premium status based on:
   - `lifetime = true` → premium = true
   - `subscription_status = 'active'` → premium = true
   - Otherwise → premium = false

### Database Schema

The `customers` table includes:
- `id`: UUID primary key
- `email`: Customer email (unique, primary identifier)
- `subscription_status`: 'active', 'inactive', 'canceled', 'past_due'
- `lifetime`: Boolean for lifetime access
- `stripe_customer_id`: Stripe customer ID
- `stripe_subscription_id`: Stripe subscription ID (for monthly plans)
- `created_at` / `updated_at`: Timestamps

### Security

- Row Level Security (RLS) is enabled on the customers table
- Service role can manage all customer data
- Authenticated users can only read their own data by email
- Webhook uses service role key for database operations
- License verification uses anon key for public access

## Testing

1. **Test URL Parameter Capture**
   - Visit: `http://localhost:5173?user_id=test123`
   - Check browser console to verify parameters are captured

2. **Test Payment Flow**
   - Use Stripe test mode for testing
   - Use test card: `4242 4242 4242 4242`
   - Verify redirect to `/success` or `/cancel`
   - Verify webhook is received in Supabase logs
   - Check customers table for new/updated record

3. **Test License Verification**
   ```bash
   curl -X POST https://lyexuguaeuwdtjeqwmst.supabase.co/functions/v1/verify-license \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com"}'
   ```
   Expected response: `{"premium": true}` or `{"premium": false}`

4. **Test Webhook**
   - Use Stripe CLI to test webhooks locally:
     ```bash
     stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
     stripe trigger checkout.session.completed
     ```

## Troubleshooting

### Checkout Session Not Created
- Verify Stripe secret key is set in create-checkout-session function
- Check price IDs are correct in the Edge Function
- Verify BASE_URL is set correctly for redirects
- Check Supabase Edge Function logs for errors

### Webhook Not Receiving Events
- Verify webhook URL is correct in Stripe Dashboard
- Check webhook secret matches in Supabase Edge Function
- Check Supabase Edge Function logs

### Customer Not Created in Database
- Verify service role key has correct permissions
- Check RLS policies allow service role operations
- Check Edge Function logs for errors
- Verify email is being extracted correctly from session

### License Verification Failing
- Verify SUPABASE_URL and SUPABASE_ANON_KEY are set
- Check customer record exists in database
- Verify email matches exactly (case-sensitive)

### URL Parameters Not Captured
- Verify parameters are in URL format: `?user_id=xxx` or `?email=xxx`
- Check browser console for JavaScript errors
- Verify useEffect hook is running

## Production Deployment

1. Update all environment variables with production values:
   - Update BASE_URL in create-checkout-session to production URL
   - Update Stripe secret keys to production keys
   - Update webhook endpoint to production URL

2. Deploy Edge Functions to production:
   ```bash
   supabase functions deploy stripe-webhook --no-verify-jwt --project-ref lyexuguaeuwdtjeqwmst
   supabase functions deploy create-checkout-session --no-verify-jwt --project-ref lyexuguaeuwdtjeqwmst
   supabase functions deploy verify-license --no-verify-jwt --project-ref lyexuguaeuwdtjeqwmst
   ```

3. Update Stripe webhook endpoint to production URL:
   - Go to Stripe Dashboard → Webhooks
   - Update endpoint to: `https://lyexuguaeuwdtjeqwmst.supabase.co/functions/v1/stripe-webhook`

4. Test the full payment flow in production

## Support

For issues or questions:
- Check Supabase Edge Function logs
- Check Stripe Dashboard webhook events
- Review browser console for JavaScript errors
