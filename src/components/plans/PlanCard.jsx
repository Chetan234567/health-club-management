/*
 * File Path: src/components/plans/PlanCard.jsx
 * Description: Membership plan card rendering price, duration, feature bullets, and Subscribe button.
 * Viva Tip: Enforces single active plan locks and triggers Razorpay checkout when clicked.
 */
import { Check, Dumbbell, Lock } from 'lucide-react';

export default function PlanCard({
  plan,
  isMember,
  isAdmin,
  isCurrentPlan,
  hasActiveSubscription,
  loadingPlanId,
  onSubscribe,
  onEdit,
  onDelete
}) {
  return (
    <div className={`panel flex flex-col justify-between border bg-white p-5 rounded-xl shadow-sm ${
      isCurrentPlan ? 'border-teal-500 bg-teal-50/20' : 'border-slate-200'
    }`}>
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>
          <Dumbbell size={18} className="text-slate-400" />
        </div>
        <p className="mt-2 text-xl font-extrabold text-slate-900">
          {plan.price} <span className="text-xs font-normal text-slate-500">/ {plan.duration}</span>
        </p>

        <ul className="mt-4 space-y-2 text-xs text-slate-600">
          {(plan.features || []).map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <Check size={14} className="text-teal-600 shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 pt-3 border-t border-slate-100">
        {isMember && (
          <>
            {isCurrentPlan ? (
              <button disabled className="w-full text-xs font-semibold py-2 rounded-lg bg-teal-100 text-teal-800 cursor-not-allowed text-center">
                ✓ Current Active Plan
              </button>
            ) : hasActiveSubscription ? (
              <button disabled className="w-full text-xs font-semibold py-2 rounded-lg bg-slate-100 text-slate-400 cursor-not-allowed text-center flex items-center justify-center gap-1">
                <Lock size={12} /> Subscription Locked
              </button>
            ) : (
              <button
                onClick={() => onSubscribe(plan)}
                disabled={loadingPlanId === plan.id}
                className="w-full text-xs font-semibold py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition text-center"
              >
                {loadingPlanId === plan.id ? 'Opening Razorpay...' : 'Subscribe Now'}
              </button>
            )}
          </>
        )}

        {isAdmin && (
          <div className="flex gap-2">
            <button className="btn-soft text-xs flex-1 py-1.5" onClick={() => onEdit(plan)}>Edit</button>
            <button className="btn-danger text-xs flex-1 py-1.5" onClick={() => onDelete(plan.id)}>Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}
