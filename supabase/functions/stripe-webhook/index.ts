import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "npm:stripe"

const PRODUCT_IDS = {
  MONTHLY: 'prod_UkaqmahkivPdmI',
  LIFETIME: 'prod_Ukaj6CALYh322z'
}

serve(async (req) => {
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: 'Missing environment variables' }), { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient()
  });

  const signature = req.headers.get('Stripe-Signature');
  let event;

  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(body, signature || '', webhookSecret);
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    const userId = session.client_reference_id;
    const customerEmail = session.customer_details?.email;
    const productId = session.line_items?.data?.[0]?.price?.product;
    
    if (!customerEmail) {
      return new Response(JSON.stringify({ error: 'No email found' }), { status: 400 });
    }

    const isLifetime = productId === PRODUCT_IDS.LIFETIME;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
      // 1. Procura sempre pelo e-mail da compra primeiro
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('*')
        .eq('email', customerEmail)
        .single();

      if (existingCustomer) {
        await supabase
          .from('customers')
          .update({
            subscription_status: 'active',
            lifetime: isLifetime,
            stripe_customer_id: session.customer,
            user_id: userId || existingCustomer.user_id, // Atualiza o ID do Figma se existir
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCustomer.id);
      } else {
        await supabase
          .from('customers')
          .insert({
            user_id: userId || null,
            email: customerEmail,
            subscription_status: 'active',
            lifetime: isLifetime,
            stripe_customer_id: session.customer,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }

      return new Response(JSON.stringify({ received: true }), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});