import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'npm:stripe@14.25.0'
import { resolvePricing } from '../_shared/pricing.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== 'GET') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
  const secret = Deno.env.get('STRIPE_SECRET_KEY');
  if (!secret) return new Response(JSON.stringify({ error: 'Pricing temporarily unavailable' }), { status: 503, headers: corsHeaders });
  try {
    const stripe = new Stripe(secret, { apiVersion: '2023-10-16', httpClient: Stripe.createFetchHttpClient() });
    const pricing = await resolvePricing(stripe);
    return new Response(JSON.stringify(pricing), { status: 200, headers: corsHeaders });
  } catch {
    return new Response(JSON.stringify({ error: 'Pricing temporarily unavailable' }), { status: 503, headers: corsHeaders });
  }
});
