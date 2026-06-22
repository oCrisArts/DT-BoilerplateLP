import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY'); // Replace with your Stripe Secret Key

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Product IDs mapping - Replace with your actual Stripe Product IDs
const PRODUCT_IDS = {
  MONTHLY: 'prod_UkaqmahkivPdmI', // Replace with actual monthly product ID
  LIFETIME: 'prod_Ukaj6CALYh322z' // Replace with actual lifetime product ID
}

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')! // Replace with your Stripe Webhook Secret
  let event

  try {
    const body = await req.text()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err)
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 })
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    
    // Extract client_reference_id (user_id) and customer email
    const userId = session.client_reference_id
    const customerEmail = session.customer_details?.email
    const productId = session.line_items?.data[0]?.price?.product
    
    if (!userId && !customerEmail) {
      console.error('No user identifier found in session')
      return new Response(JSON.stringify({ error: 'No user identifier' }), { status: 400 })
    }

    // Determine if this is a lifetime purchase
    const isLifetime = productId === PRODUCT_IDS.LIFETIME

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    try {
      // Check if customer already exists
      const { data: existingCustomer, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .or(`user_id.eq.${userId},email.eq.${customerEmail}`)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching customer:', fetchError)
        return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 })
      }

      if (existingCustomer) {
        // Update existing customer
        const { error: updateError } = await supabase
          .from('customers')
          .update({
            subscription_status: 'active',
            lifetime: isLifetime,
            stripe_customer_id: session.customer,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCustomer.id)

        if (updateError) {
          console.error('Error updating customer:', updateError)
          return new Response(JSON.stringify({ error: 'Update failed' }), { status: 500 })
        }

        console.log(`Updated customer: ${existingCustomer.id}`)
      } else {
        // Insert new customer
        const { error: insertError } = await supabase
          .from('customers')
          .insert({
            user_id: userId || null,
            email: customerEmail || null,
            subscription_status: 'active',
            lifetime: isLifetime,
            stripe_customer_id: session.customer,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError) {
          console.error('Error inserting customer:', insertError)
          return new Response(JSON.stringify({ error: 'Insert failed' }), { status: 500 })
        }

        console.log(`Created new customer for: ${userId || customerEmail}`)
      }

      return new Response(JSON.stringify({ received: true }), { status: 200 })
    } catch (error) {
      console.error('Error processing webhook:', error)
      return new Response(JSON.stringify({ error: 'Processing error' }), { status: 500 })
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
