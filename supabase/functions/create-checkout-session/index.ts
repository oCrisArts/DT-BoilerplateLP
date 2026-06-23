import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "npm:stripe"

const PRICE_IDS = {
  MONTHLY: 'price_1Tl8XDGjwjNbQit1cNafBUxk', // Replace with actual Stripe Price ID for $5.99/month
  LIFETIME: 'price_1Tl8UgGjwjNbQit1TtLP764N' // Replace with actual Stripe Price ID for $49 one-time
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    const { plan, email, userId } = await req.json()

    if (!plan || (plan !== 'monthly' && plan !== 'lifetime')) {
      return new Response(JSON.stringify({ error: 'Invalid plan' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      console.error('Missing STRIPE_SECRET_KEY')
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient()
    })

    // Get the base URL for redirects
    const baseUrl = Deno.env.get('BASE_URL') || 'http://localhost:5173'

    // Select price based on plan
    const priceId = plan === 'monthly' ? PRICE_IDS.MONTHLY : PRICE_IDS.LIFETIME

    // Create checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: plan === 'monthly' ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/cancel`,
      customer_email: email || undefined,
      metadata: {
        plan: plan,
        user_id: userId || ''
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    console.log(`Created checkout session for ${plan} plan: ${session.id}`)

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(JSON.stringify({ error: 'Failed to create checkout session' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
