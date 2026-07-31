/*
 * File Path: src/components/plans/SubscriptionBanner.jsx
 * Description: Member Overview Banner displaying current plan name, status, expiry date, and remaining days.
 * Viva Tip: Modular component used at the top of the Member Workspace page.
 */
import StatusBadge from '../ui/StatusBadge.jsx';
import { calculateRemainingDays } from '../../utils/formatters.js';

export default function SubscriptionBanner({ memberProfile = {}, hasActiveSubscription }) {
  const remainingDays = calculateRemainingDays(memberProfile?.nextRenewal);

  return (
    <div className="panel mb-6 border border-slate-200 bg-white p-4 rounded-xl shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current Subscription</span>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">
            {hasActiveSubscription ? (memberProfile.plan || 'Monthly Gym') : 'No Active Membership'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs">
          <div>
            <span className="block font-semibold text-slate-500 mb-0.5">Status</span>
            <StatusBadge status={hasActiveSubscription ? (memberProfile.status || 'Active') : (memberProfile.status || 'Pending')} />
          </div>

          <div>
            <span className="block font-semibold text-slate-500">Expiry Date</span>
            <span className="font-bold text-slate-800 mt-0.5 block">
              {hasActiveSubscription ? memberProfile.nextRenewal : (memberProfile.nextRenewal ? 'Expired' : 'Not Subscribed')}
            </span>
          </div>

          <div>
            <span className="block font-semibold text-slate-500">Remaining</span>
            <span className="font-bold text-slate-800 mt-0.5 block">
              {hasActiveSubscription ? `${remainingDays} Days` : '0 Days'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
