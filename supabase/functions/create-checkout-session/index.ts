import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "npm:stripe@14.25.0"
import { getLegacyPrices, resolvePricing, LOOKUP_KEYS, type PaidPlan } from "../_shared/pricing.ts"

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
    const { plan, pricingVersion: requestedVersion, variant, email, userId, priceId: displayedPriceId } = await req.json()
    // Backward compatibility for already-published clients, not an experiment.
    const pricingVersion = requestedVersion ?? (variant === undefined || variant === 'A' ? 'legacy' : variant === 'B' ? 'new' : null);

    if (!['legacy', 'new'].includes(pricingVersion) || !['monthly', 'annual', 'lifetime'].includes(plan) || (pricingVersion === 'legacy' && plan === 'annual')) {
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

    let priceId: string;
    if (pricingVersion === 'legacy') {
      const prices = getLegacyPrices(name => Deno.env.get(name));
      priceId = prices[plan as keyof typeof prices];
    } else {
      // Bind checkout to the exact Price displayed by the modern LP.
      // Published variant B clients may omit it for technical compatibility.
      if (requestedVersion === 'new' && (typeof displayedPriceId !== 'string' || !displayedPriceId)) {
        return new Response(JSON.stringify({ error: 'Displayed price is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      try {
        priceId = (await resolvePricing(stripe, [plan as PaidPlan]))[plan as PaidPlan].priceId;
      } catch {
        return new Response(JSON.stringify({ error: 'Pricing temporarily unavailable' }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (displayedPriceId !== undefined && displayedPriceId !== priceId) {
        return new Response(JSON.stringify({ error: 'Pricing changed. Refresh prices and try again.', code: 'price_changed' }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
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
        pricing_version: pricingVersion,
        pricing_variant: pricingVersion === 'legacy' ? 'A' : 'B',
        user_id: userId || '',
        ...(pricingVersion === 'new' ? { pricing_lookup_key: LOOKUP_KEYS[plan as PaidPlan], price_id: priceId } : {})
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    console.log(`Created checkout session for ${plan} plan: ${session.id}`)

    return new Response(JSON.stringify({ url: session.url, pricingVersion, plan }), {
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
    return new Response(JSON.stringify({ error: 'Failed to create checkout session' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
