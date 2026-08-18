import { Check, Sparkles, Star } from 'lucide-react';
import { persistUserUpdate, refreshUserFromServer } from '../utils/userSync';

const plans = [
  {
    name: 'Starter',
    price: '$1',
    description: 'For creators testing the platform',
    features: ['10 monthly credits', 'Article generator', 'Basic support'],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$19',
    description: 'For power users and agencies',
    features: ['Unlimited drafts', 'File tool access', 'Priority support'],
    highlighted: true,
  },
  {
    name: 'Business',
    price: '$49',
    description: 'For teams shipping at scale',
    features: ['Team workspace', 'Advanced AI tools', 'Analytics dashboard'],
    highlighted: false,
  },
];

export default function Pricing() {
  const handleCheckout = async (plan) => {
    try {
      const email = JSON.parse(localStorage.getItem('user') || '{}')?.email || 'user@example.com';
      const normalizedPlan = {
        Starter: 'FREE',
        Pro: 'MONTHLY',
        Business: 'YEARLY',
      }[plan] || plan;

      const response = await fetch('http://localhost:8080/api/payment/mock-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ plan: normalizedPlan, email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (data?.credits !== undefined || data?.currentPlan !== undefined) {
        persistUserUpdate({
          credits: data.credits ?? storedUser.credits ?? 0,
          currentPlan: data.currentPlan ?? storedUser.currentPlan ?? 'FREE',
        });
      } else {
        await refreshUserFromServer();
      }

      alert(`Payment successful: ${data.message}`);
    } catch (error) {
      alert(error.message || 'Payment failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Plans</p>
            <h1 className="text-2xl font-bold text-white">Pricing</h1>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map(({ name, price, description, features, highlighted }) => (
          <div
            key={name}
            className={`rounded-3xl border border-slate-800 bg-slate-900/80 p-6 transition-all duration-300 hover:border-indigo-500/40 hover:bg-slate-900 hover:shadow-xl hover:shadow-indigo-500/10 ${highlighted ? 'ring-1 ring-indigo-500/20' : ''}`}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">{name}</h2>
              {highlighted && (
                <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/50 bg-indigo-500/10 px-2 py-1 text-xs text-indigo-200">
                  <Star className="h-3 w-3" />
                  Popular
                </span>
              )}
            </div>

            <div className="mb-4 flex items-end gap-2">
              <span className="text-4xl font-bold text-white">{price}</span>
              <span className="pb-1 text-sm text-slate-400">/ month</span>
            </div>

            <p className="mb-5 text-sm text-slate-300">{description}</p>

            <ul className="space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-slate-200">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => handleCheckout(name)}
              className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 font-medium transition border ${
                highlighted
                  ? 'border-slate-700 bg-slate-950 text-slate-200 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-white'
                  : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-white'
              }`}
            >
              Choose plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
