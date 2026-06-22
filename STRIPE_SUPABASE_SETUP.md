# Stripe & Supabase Integration Setup Guide

This document explains how to set up the Stripe and Supabase integration for the DS Boilerplate Landing Page.

## Overview

The integration allows users to purchase subscriptions (Monthly or Lifetime) through Stripe Payment Links, with webhooks updating customer data in Supabase.

## Features

- **Monthly Plan**: $5.99/month with cancel anytime option
- **Lifetime Plan**: $49.90 one-time payment
- **URL Parameter Capture**: Captures `user_id` or `email` from URL parameters sent by the plugin
- **Stripe Integration**: Passes user identifiers to Stripe via `client_reference_id` and `prefilled_email`
- **Supabase Webhook**: Automatically updates customer subscription status via Stripe webhooks

## Setup Instructions

### 1. Stripe Configuration

1. **Create Stripe Products and Prices**
   - Go to Stripe Dashboard → Products
   - Create a product for "Monthly Plan" ($5.99/month)
   - Create a product for "Lifetime Plan" ($49.90 one-time)
   - Note the Product IDs for webhook configuration

2. **Create Payment Links**
   - Go to Stripe Dashboard → Payment Links
   - Create a payment link for the Monthly product
   - Create a payment link for the Lifetime product
   - Copy the URLs to update in `src/app/App.tsx`

3. **Setup Webhook**
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
   - Select events: `checkout.session.completed`
   - Copy the webhook signing secret

4. **Get API Keys**
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

4. **Deploy Edge Function**
   ```bash
   # Deploy the webhook function
   supabase functions deploy stripe-webhook
   ```

5. **Set Environment Variables**
   - Go to Supabase Dashboard → Edge Functions → stripe-webhook
   - Add the following environment variables:
     - `STRIPE_SECRET_KEY`: Your Stripe secret key
     - `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook signing secret
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### 3. Update Application Code

1. **Update Stripe Links in App.tsx**
   ```typescript
   // In src/app/App.tsx, update these constants:
   const STRIPE_MONTHLY_LINK = "https://buy.stripe.com/your-actual-monthly-link";
   const STRIPE_LIFETIME_LINK = "https://buy.stripe.com/your-actual-lifetime-link";
   ```

2. **Update Product IDs in Edge Function**
   ```typescript
   // In supabase/functions/stripe-webhook/index.ts, update:
   const PRODUCT_IDS = {
     MONTHLY: 'prod_your_actual_monthly_product_id',
     LIFETIME: 'prod_your_actual_lifetime_product_id'
   }
   ```

3. **Set Environment Variables (Local Development)**
   - Copy `.env.example` to `.env.local`
   - Fill in your actual values

## How It Works

### Payment Flow

1. User visits landing page with URL parameters: `?user_id=abc123` or `?email=user@example.com`
2. Application captures these parameters from the URL
3. User clicks "Get Started" or "Get Lifetime Access"
4. Application redirects to Stripe Payment Link with:
   - `client_reference_id=user_id` (if user_id exists)
   - `prefilled_email=email` (if email exists)
5. User completes payment in Stripe
6. Stripe sends `checkout.session.completed` webhook to Supabase Edge Function
7. Edge Function extracts user identifiers and product information
8. Edge Function inserts/updates customer record in Supabase:
   - Sets `subscription_status = 'active'`
   - Sets `lifetime = true` (if lifetime product) or `false` (if monthly)
   - Links to user via `user_id` or `email`

### Database Schema

The `customers` table includes:
- `id`: UUID primary key
- `user_id`: User identifier from plugin (unique)
- `email`: Customer email (unique)
- `subscription_status`: 'active', 'inactive', 'canceled', 'past_due'
- `lifetime`: Boolean for lifetime access
- `stripe_customer_id`: Stripe customer ID
- `stripe_subscription_id`: Stripe subscription ID (for monthly plans)
- `created_at` / `updated_at`: Timestamps

### Security

- Row Level Security (RLS) is enabled on the customers table
- Service role can manage all customer data
- Authenticated users can only read their own data
- Webhook uses service role key for database operations

## Testing

1. **Test URL Parameter Capture**
   - Visit: `http://localhost:5173?user_id=test123`
   - Check browser console to verify parameters are captured

2. **Test Payment Flow**
   - Use Stripe test mode for testing
   - Use test card: `4242 4242 4242 4242`
   - Verify webhook is received in Supabase logs
   - Check customers table for new/updated record

3. **Test Webhook**
   - Use Stripe CLI to test webhooks locally:
     ```bash
     stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
     stripe trigger checkout.session.completed
     ```

## Troubleshooting

### Webhook Not Receiving Events
- Verify webhook URL is correct in Stripe Dashboard
- Check webhook secret matches in Supabase Edge Function
- Check Supabase Edge Function logs

### Customer Not Created in Database
- Verify service role key has correct permissions
- Check RLS policies allow service role operations
- Check Edge Function logs for errors

### URL Parameters Not Captured
- Verify parameters are in URL format: `?user_id=xxx` or `?email=xxx`
- Check browser console for JavaScript errors
- Verify useEffect hook is running

## Production Deployment

1. Update all environment variables with production values
2. Deploy Edge Function to production:
   ```bash
   supabase functions deploy stripe-webhook --project-ref your-project-id
   ```
3. Update Stripe webhook endpoint to production URL
4. Test the full payment flow in production

## Support

For issues or questions:
- Check Supabase Edge Function logs
- Check Stripe Dashboard webhook events
- Review browser console for JavaScript errors
