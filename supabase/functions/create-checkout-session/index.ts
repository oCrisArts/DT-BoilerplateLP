import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "npm:stripe"
import { getPrices } from "../_shared/pricing.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

serve(async (req) => {
  // Trata a requisição de preflight do CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { plan, variant = 'A', email, userId } = await req.json()

    if (!['A', 'B'].includes(variant) || !['monthly', 'annual', 'lifetime'].includes(plan) || (variant === 'A' && plan === 'annual')) {
      return new Response(JSON.stringify({ error: 'Invalid plan' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      console.error('Missing STRIPE_SECRET_KEY')
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient()
    })

    // Get the base URL for redirects
    const baseUrl = Deno.env.get('BASE_URL') || 'http://localhost:5173'

    // Select price based on plan
    const prices = getPrices(name => Deno.env.get(name));
    const priceId = variant === 'A'
      ? prices.A[plan as keyof typeof prices.A]
      : prices.B[plan as keyof typeof prices.B];
    if (!priceId) {
      return new Response(JSON.stringify({ error: 'Pricing is not configured for this plan' }), {
        status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: plan === 'lifetime' ? 'payment' : 'subscription',
      payment_method_types: ['card'],
      allow_promotion_codes: true, // <--- ADICIONE ESTA LINHA
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
        pricing_variant: variant,
        user_id: userId || ''
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    console.log(`Created checkout session for ${plan} plan: ${session.id}`)

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: {  
        ...corsHeaders,
        'Content-Type': 'application/json',
      }
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error details:', errorMessage)
    return new Response(JSON.stringify({ error: 'Failed to create checkout session', details: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
