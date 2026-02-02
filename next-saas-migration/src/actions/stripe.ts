'use server'

import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createCheckoutSession(plan: 'pro' | 'business') {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Define prices (Replace with your actual Stripe Price IDs)
  const prices = {
    pro: 'price_1Q...', // $10/month
    business: 'price_1Q...' // $30/month
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: [
      {
        price: prices[plan],
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/dashboard/subscription?canceled=true`,
    metadata: {
        userId: user.id,
        plan: plan
    }
  })

  if (session.url) {
    redirect(session.url)
  }
}
