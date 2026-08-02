/*
 * File Path: src/components/ui/StatusBadge.jsx
 * Description: Reusable status pill badge component (e.g., Active, Pending, Expired, Success).
 * Viva Tip: Simple presentation component that accepts a 'status' prop and renders styled text.
 */
import { getStatusBadgeStyle } from '../../utils/formatters.js';

export default function StatusBadge({ status }) {
  const badgeStyle = getStatusBadgeStyle(status);

  return (
    <span className={`inline-block rounded px-2.5 py-0.5 text-xs font-semibold border ${badgeStyle}`}>
      {status || 'Pending'}
    </span>
  );
}
