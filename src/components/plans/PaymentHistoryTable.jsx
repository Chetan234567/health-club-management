/*
 * File Path: src/components/plans/PaymentHistoryTable.jsx
 * Description: Payment Transaction Audit Table rendering Order IDs, amounts, dates, and Razorpay statuses.
 * Viva Tip: Allows Admins to search transactions by Order ID / Member Email and filter by status.
 */
import { Search } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge.jsx';

export default function PaymentHistoryTable({
  payments = [],
  isAdmin,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter
}) {
  // Filter payments list for Admin view
  const filteredPayments = payments.filter((pay) => {
    const matchesSearch = (pay.memberName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (pay.memberEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (pay.razorpayOrderId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (pay.planName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || (pay.paymentStatus || '').toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const displayList = isAdmin ? filteredPayments : payments;

  return (
    <div className="panel border border-slate-200 bg-white p-5 rounded-xl shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-bold text-slate-900">{isAdmin ? 'All System Payments' : 'Payment History'}</h2>
        {isAdmin && (
          <div className="flex gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                className="field text-xs py-1.5 pl-8 pr-2 w-48 border border-slate-300 rounded-lg"
                placeholder="Search order/member..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="field text-xs py-1.5 px-2 border border-slate-300 rounded-lg"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="CREATED">CREATED</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600 font-semibold bg-slate-50">
              <th className="p-2.5">Razorpay Order ID</th>
              <th className="p-2.5">Payment ID</th>
              {isAdmin && <th className="p-2.5">Member</th>}
              <th className="p-2.5">Plan</th>
              <th className="p-2.5">Amount</th>
              <th className="p-2.5">Date</th>
              <th className="p-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayList.length === 0 ? (
              <tr><td colSpan={7} className="p-4 text-center text-slate-400">No payment records found.</td></tr>
            ) : (
              displayList.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-50">
                  <td className="p-2.5 font-mono text-slate-800">{pay.razorpayOrderId}</td>
                  <td className="p-2.5 font-mono text-slate-600">{pay.razorpayPaymentId || '—'}</td>
                  {isAdmin && (
                    <td className="p-2.5 font-semibold text-slate-900">
                      {pay.memberName} <span className="block text-[10px] font-normal text-slate-400">{pay.memberEmail}</span>
                    </td>
                  )}
                  <td className="p-2.5 text-teal-700 font-semibold">{pay.planName}</td>
                  <td className="p-2.5 font-bold text-slate-900">₹{pay.amount}</td>
                  <td className="p-2.5 text-slate-500">{pay.paymentDate}</td>
                  <td className="p-2.5">
                    <StatusBadge status={pay.paymentStatus} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
