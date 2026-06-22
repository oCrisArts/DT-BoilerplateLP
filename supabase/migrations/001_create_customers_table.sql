-- Create customers table for Stripe integration
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'canceled', 'past_due')),
  lifetime BOOLEAN DEFAULT false,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- Create index on stripe_customer_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_stripe_customer_id ON public.customers(stripe_customer_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to insert/update customers
CREATE POLICY "Service role can manage customers"
  ON public.customers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create policy to allow users to read their own customer data by email
CREATE POLICY "Users can read own customer data"
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (auth.email() = email);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.customers IS 'Stores customer subscription data from Stripe';
COMMENT ON COLUMN public.customers.email IS 'Customer email from Stripe checkout (primary identifier)';
COMMENT ON COLUMN public.customers.subscription_status IS 'Current subscription status: active, inactive, canceled, past_due';
COMMENT ON COLUMN public.customers.lifetime IS 'True if customer has lifetime access';
COMMENT ON COLUMN public.customers.stripe_customer_id IS 'Stripe customer ID';
COMMENT ON COLUMN public.customers.stripe_subscription_id IS 'Stripe subscription ID (for monthly plans)';
