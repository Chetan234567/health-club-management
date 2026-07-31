/*
 * File Path: src/views/PlansView.jsx
 * Description: Clean modular view combining SubscriptionBanner, PlanCard, and PaymentHistoryTable.
 * Student Viva Note: Demonstrates React modularity by composing small components into a page.
 */
import { ShieldAlert, X } from 'lucide-react';
import { useState } from 'react';
import SectionHeader from '../components/SectionHeader.jsx';
import SubscriptionBanner from '../components/plans/SubscriptionBanner.jsx';
import PlanCard from '../components/plans/PlanCard.jsx';
import PaymentHistoryTable from '../components/plans/PaymentHistoryTable.jsx';
import { calculateRemainingDays } from '../utils/formatters.js';

const emptyPlan = { name: '', price: '', duration: 'Monthly', features: '' };

export default function PlansView({ role, dashboard = {} }) {
  // Local UI State
  const [form, setForm] = useState(emptyPlan);
  const [editingId, setEditingId] = useState(null);
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Warning Modal for Active Subscriptions
  const [activeWarningModal, setActiveWarningModal] = useState(null);

  // Admin Payment Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const isAdmin = role === 'admin';
  const isMember = role === 'member';

  const plans = dashboard?.plans || [];
  const memberProfile = dashboard?.memberProfile || {};
  const payments = dashboard?.payments || [];
  const activePlans = plans.filter((p) => p.active !== false);

  // Active Subscription Rule Check
  const todayStr = new Date().toISOString().slice(0, 10);
  const isRenewalValid = memberProfile?.nextRenewal && memberProfile.nextRenewal >= todayStr;
  const isStatusActive = memberProfile?.status === 'Active' || memberProfile?.status === 'ACTIVE' || memberProfile?.status === 'Renewal Due';
  const hasActiveSubscription = isMember && isRenewalValid && isStatusActive;

  // Admin Plan Add/Edit Handlers
  const handleSavePlan = (event) => {
    event.preventDefault();
    if (editingId && dashboard?.updatePlan) {
      dashboard.updatePlan(editingId, form);
    } else if (dashboard?.addPlan) {
      dashboard.addPlan(form);
    }
    setForm(emptyPlan);
    setEditingId(null);
  };

  const handleStartEdit = (plan) => {
    setEditingId(plan.id);
    setForm({
      name: plan.name,
      price: plan.price,
      duration: plan.duration,
      features: (plan.features || []).join(', ')
    });
  };

  // Member Subscription Handler via Razorpay
  const handleSubscribeNow = async (plan) => {
    setSuccessMessage('');
    setErrorMessage('');

    if (hasActiveSubscription) {
      setActiveWarningModal({
        currentPlan: memberProfile.plan || 'Monthly Gym',
        validTill: memberProfile.nextRenewal || todayStr,
        remainingDays: calculateRemainingDays(memberProfile.nextRenewal)
      });
      return;
    }

    setLoadingPlanId(plan.id);
    try {
      if (dashboard?.initiateRazorpayPayment) {
        await dashboard.initiateRazorpayPayment(plan);
        setSuccessMessage(`Payment successful! Your subscription to ${plan.name} is now ACTIVE.`);
      } else {
        throw new Error('Payment gateway service unavailable.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Razorpay payment failed or was cancelled.');
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <>
      <SectionHeader eyebrow={isAdmin ? 'Admin Panel' : 'Member Workspace'} title="Membership Plans" />

      {/* 1. MEMBER TOP SUBSCRIPTION SUMMARY BANNER (Modular Component) */}
      {isMember && (
        <SubscriptionBanner
          memberProfile={memberProfile}
          hasActiveSubscription={hasActiveSubscription}
        />
      )}

      {/* FEEDBACK ALERT MESSAGES */}
      {successMessage && (
        <div className="mb-6 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-200 flex items-center justify-between">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-800 hover:text-emerald-900"><X size={16} /></button>
        </div>
      )}
      {errorMessage && (
        <div className="mb-6 rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-800 border border-rose-200 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="text-rose-800 hover:text-rose-900"><X size={16} /></button>
        </div>
      )}

      {/* ADMIN ADD/EDIT PLAN FORM */}
      {isAdmin && (
        <form onSubmit={handleSavePlan} className="panel mb-6 grid gap-3 md:grid-cols-4 border border-slate-200 bg-white p-4 rounded-xl shadow-sm">
          <input className="field text-xs py-2" placeholder="Plan name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="field text-xs py-2" placeholder="Price (e.g. ₹1,499)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <input className="field text-xs py-2" placeholder="Duration (e.g. Monthly)" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required />
          <input className="field text-xs py-2" placeholder="Features (comma-separated)" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} required />
          <button className="btn-primary text-xs py-2 md:col-span-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg">
            {editingId ? 'Update Plan' : 'Add New Plan'}
          </button>
        </form>
      )}

      {/* 2. MEMBERSHIP PLAN CARDS GRID (Modular Component) */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-slate-800 mb-3">Available Plans</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {activePlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isMember={isMember}
              isAdmin={isAdmin}
              isCurrentPlan={isMember && hasActiveSubscription && memberProfile.plan === plan.name}
              hasActiveSubscription={hasActiveSubscription}
              loadingPlanId={loadingPlanId}
              onSubscribe={handleSubscribeNow}
              onEdit={handleStartEdit}
              onDelete={dashboard?.deletePlan}
            />
          ))}
        </div>
      </div>

      {/* 3. PAYMENT TRANSACTION AUDIT LOG TABLE (Modular Component) */}
      <PaymentHistoryTable
        payments={payments}
        isAdmin={isAdmin}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* ACTIVE SUBSCRIPTION WARNING MODAL */}
      {activeWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-lg relative border border-slate-200">
            <button onClick={() => setActiveWarningModal(null)} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm mb-2">
              <ShieldAlert size={18} />
              <span>Active Subscription Exists</span>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              You already have an active subscription (<strong className="text-slate-900">{activeWarningModal.currentPlan}</strong>). You can purchase another plan after it expires on <strong className="text-slate-900">{activeWarningModal.validTill}</strong>.
            </p>

            <button onClick={() => setActiveWarningModal(null)} className="w-full py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
