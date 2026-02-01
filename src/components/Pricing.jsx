import React, { useState } from 'react';
import Head from 'next/head';

// Check Icon Component
const CheckIcon = ({ className }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

// Close/X Icon Component
const XIcon = ({ className }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  // Pricing Data
  const plans = [
    {
      name: 'Free',
      description: 'Perfect for hobbyists and trying out the tool.',
      price: 0,
      features: [
        '3 Exports per day',
        'Basic Shapes (Rectangle, Circle)',
        'Watermarked Exports',
        'Standard Nesting',
        'Community Support',
        'Ad-supported'
      ],
      notIncluded: [
        'Unlimited Exports',
        'Advanced Shapes',
        'DXF & SVG Export',
        'Save Projects',
        'Commercial License'
      ],
      cta: 'Start for Free',
      ctaLink: '/auth/register',
      highlight: false
    },
    {
      name: 'Pro',
      description: 'For professional designers and makers.',
      price: 12,
      features: [
        'Unlimited Exports',
        'No Watermark',
        'Ad-free Experience',
        'All Shapes (Star, Polygon, Custom)',
        'Auto Nesting Algorithm',
        'Save & Load Projects',
        'DXF & SVG Export',
        'Priority Email Support'
      ],
      cta: 'Get Started',
      ctaLink: '/checkout/pro',
      highlight: true, // Most Popular
      badge: 'Most Popular'
    },
    {
      name: 'Business',
      description: 'For print shops and laser cutting factories.',
      price: 39,
      features: [
        'Everything in Pro',
        'Bulk Export (Zip)',
        'Multiple Files Support',
        'Project Management Dashboard',
        'Advanced Nesting Options',
        'Cost Calculation Reports',
        'Commercial License',
        '1-on-1 Onboarding'
      ],
      cta: 'Upgrade to Business',
      ctaLink: '/checkout/business',
      highlight: false
    },
    {
      name: 'Enterprise',
      description: 'Custom solutions for large organizations.',
      price: 'Custom',
      features: [
        'API Access',
        'Team Management',
        'SSO Integration',
        'Custom Invoice Billing',
        'Dedicated Account Manager',
        'SLA Support',
        'On-premise Deployment'
      ],
      cta: 'Contact Sales',
      ctaLink: '/contact',
      highlight: false
    }
  ];

  const faqs = [
    {
      q: "Can I cancel my subscription at any time?",
      a: "Yes, you can cancel your subscription at any time from your account settings. You will retain access until the end of your billing period."
    },
    {
      q: "What file formats do you support?",
      a: "We support exporting to DXF (for CAD/CAM) and SVG (for Vector/Web). We also generate PDF reports for cost estimation."
    },
    {
      q: "Do you offer refunds?",
      a: "We offer a 14-day money-back guarantee if you are not satisfied with the Pro or Business plan."
    },
    {
      q: "Is the payment secure?",
      a: "Yes, all payments are processed securely via Stripe/PayPal. We do not store your credit card information."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-20 px-4 sm:px-6 lg:px-8 font-sans">
      <Head>
        <title>Pricing - AcrylicGen</title>
        <meta name="description" content="Choose the best plan for your acrylic design needs." />
      </Head>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-2">Pricing Plans</h2>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl mb-4">
            Choose the perfect plan for your business
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Start for free and upgrade as you grow. No hidden fees.
          </p>

          {/* Toggle */}
          <div className="mt-8 flex justify-center items-center gap-4">
            <span className={`text-sm font-semibold ${!isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isAnnual ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-semibold ${isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
              Yearly <span className="text-green-500 text-xs ml-1">(Save 20%)</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-20">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                plan.highlight
                  ? 'bg-white dark:bg-slate-800 border-2 border-blue-500 ring-4 ring-blue-500/10 z-10 scale-105'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 min-h-[40px]">{plan.description}</p>
              </div>

              <div className="mb-6">
                {typeof plan.price === 'number' ? (
                  <div className="flex items-baseline">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                      ${isAnnual ? Math.round(plan.price * 12 * 0.8 / 12) : plan.price}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 ml-2">/month</span>
                  </div>
                ) : (
                  <div className="text-4xl font-extrabold text-slate-900 dark:text-white">{plan.price}</div>
                )}
                {isAnnual && typeof plan.price === 'number' && plan.price > 0 && (
                  <p className="text-xs text-green-500 mt-1 font-semibold">
                    Billed ${Math.round(plan.price * 12 * 0.8)} yearly
                  </p>
                )}
              </div>

              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <CheckIcon className="text-green-500 flex-shrink-0 mr-3" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">{feature}</span>
                  </li>
                ))}
                {plan.notIncluded && plan.notIncluded.map((feature) => (
                  <li key={feature} className="flex items-start opacity-50">
                    <XIcon className="text-slate-400 flex-shrink-0 mr-3" />
                    <span className="text-sm text-slate-500 dark:text-slate-500">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.ctaLink}
                className={`w-full py-3 px-4 rounded-lg text-center font-bold transition-colors ${
                  plan.highlight
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto border-t border-slate-200 dark:border-slate-700 pt-16">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{faq.q}</h3>
                <p className="text-slate-600 dark:text-slate-300">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-20 text-center bg-blue-600 rounded-3xl p-10 sm:p-16 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Ready to optimize your workflow?</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of print shops and designers using AcrylicGen to automate their production.
            </p>
            <a
              href="/auth/register"
              className="inline-block bg-white text-blue-600 font-bold py-4 px-8 rounded-full hover:bg-blue-50 transition-colors shadow-lg transform hover:scale-105 duration-200"
            >
              Get Started for Free
            </a>
          </div>
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-600 rounded-full opacity-50 blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}
