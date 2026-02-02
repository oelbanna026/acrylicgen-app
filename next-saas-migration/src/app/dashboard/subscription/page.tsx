import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession } from '@/actions/stripe'
import { Check, Star, Zap } from 'lucide-react'

export default async function SubscriptionPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('users')
    .select('plan, credits')
    .eq('id', user?.id)
    .single()

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Upgrade your plan</h1>
        <p className="text-gray-500">Choose the perfect plan for your acrylic business.</p>
        <div className="mt-6 inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
            Current Plan: <span className="uppercase">{profile?.plan}</span> ({profile?.credits} credits left)
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Pro Plan */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:border-blue-300 transition-all relative overflow-hidden flex-1">
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-3 py-1 rounded-bl-xl font-medium">POPULAR</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Pro Plan</h3>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-bold">$10</span>
            <span className="text-gray-500">/month</span>
          </div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex gap-3 text-sm text-gray-600">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" /> 50 Exports / month
            </li>
            <li className="flex gap-3 text-sm text-gray-600">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" /> Unlimited Projects
            </li>
            <li className="flex gap-3 text-sm text-gray-600">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" /> Commercial License
            </li>
          </ul>

          <form action={createCheckoutSession.bind(null, 'pro')}>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                <Star className="w-4 h-4" /> Upgrade to Pro
            </button>
          </form>
        </div>

        {/* Business Plan */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:border-purple-300 transition-all flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Business Plan</h3>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-bold">$30</span>
            <span className="text-gray-500">/month</span>
          </div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex gap-3 text-sm text-gray-600">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" /> Unlimited Exports
            </li>
            <li className="flex gap-3 text-sm text-gray-600">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" /> Priority Support
            </li>
            <li className="flex gap-3 text-sm text-gray-600">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" /> Custom Branding
            </li>
          </ul>

          <form action={createCheckoutSession.bind(null, 'business')}>
            <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" /> Upgrade to Business
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
