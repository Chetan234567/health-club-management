/*
 * File Path: src/components/SectionHeader.jsx
 * Description: Reusable page header component rendering eyebrow badge, main title, and right-aligned action buttons.
 * Props: eyebrow (string), title (string), action (ReactNode).
 */
export default function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-teal-700">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-bold text-ink-900">{title}</h1>
      </div>
      {action}
    </div>
  );
}
