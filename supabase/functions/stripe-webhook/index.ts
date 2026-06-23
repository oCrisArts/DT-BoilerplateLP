import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "npm:stripe"

const PRODUCT_IDS = {
  MONTHLY: 'prod_UkdoEv0GrJSWP9',
  LIFETIME: 'prod_UkdmgT3cV6LpRA'
}

serve(async (req) => {
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables');
    return new Response(JSON.stringify({ error: 'Missing environment variables' }), { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient()
  });

  const signature = req.headers.get('Stripe-Signature');
  if (!signature) {
    console.error('No Stripe-Signature header found');
    return new Response(JSON.stringify({ error: 'No signature' }), { status: 400 });
  }

  let event;

  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Get email from customer_details.email or customer_email
    const customerEmail = session.customer_details?.email || session.customer_email;
    
    if (!customerEmail) {
      console.error('No email found in session');
      return new Response(JSON.stringify({ error: 'No email found' }), { status: 400 });
    }

    const stripeCustomerId = session.customer as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
      // Fetch session with expanded line_items to get product information
      const sessionWithLineItems = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items']
      });

      // Get product ID from line_items
      const productId = sessionWithLineItems.line_items?.data?.[0]?.price?.product as string;
      
      if (!productId) {
        console.error('No product ID found in line_items');
        return new Response(JSON.stringify({ error: 'No product ID found' }), { status: 400 });
      }

      // Determine if this is a lifetime purchase
      const isLifetime = productId === PRODUCT_IDS.LIFETIME;

      console.log(`Processing checkout for email: ${customerEmail}, product: ${productId}, lifetime: ${isLifetime}`);

      // Check if customer already exists by email
      const { data: existingCustomer, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('email', customerEmail)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching customer:', fetchError);
        return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
      }

      if (existingCustomer) {
        // Update existing customer
        const { error: updateError } = await supabase
          .from('customers')
          .update({
            subscription_status: 'active',
            lifetime: isLifetime,
            stripe_customer_id: stripeCustomerId,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCustomer.id);

        if (updateError) {
          console.error('Error updating customer:', updateError);
          return new Response(JSON.stringify({ error: 'Update failed' }), { status: 500 });
        }

        console.log(`Updated customer: ${existingCustomer.id}`);
      } else {
        // Insert new customer
        const { error: insertError } = await supabase
          .from('customers')
          .insert({
            id: crypto.randomUUID(), // Geração nativa do UUID no Deno
            email: customerEmail,
            subscription_status: 'active',
            lifetime: isLifetime,
            stripe_customer_id: stripeCustomerId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error inserting customer:', insertError);
          return new Response(JSON.stringify({ error: 'Insert failed' }), { status: 500 });
        }

        console.log(`Created new customer for: ${customerEmail}`);
      }

      return new Response(JSON.stringify({ received: true }), { status: 200 });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return new Response(JSON.stringify({ error: 'Processing error' }), { status: 500 });
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});