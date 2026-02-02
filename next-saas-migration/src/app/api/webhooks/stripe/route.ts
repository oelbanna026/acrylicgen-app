import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('Stripe-Signature') as string

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as any
  const supabase = createClient()

  if (event.type === 'checkout.session.completed') {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    
    // Update user plan
    await supabase.from('users').update({
        stripe_customer_id: session.customer as string,
        plan: session.metadata.plan, // 'pro' or 'business'
        credits: session.metadata.plan === 'business' ? 9999 : 50
    }).eq('id', session.metadata.userId)

    // Store subscription
    await supabase.from('subscriptions').insert({
        id: subscription.id,
        user_id: session.metadata.userId,
        status: subscription.status,
        plan: session.metadata.plan,
        current_period_end: new Date(subscription.current_period_end * 1000)
    })
  }

  if (event.type === 'invoice.payment_succeeded') {
     const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
     
     // Renew Subscription
     await supabase.from('subscriptions').update({
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000)
     }).eq('id', subscription.id)
  }

  return new Response(null, { status: 200 })
}
