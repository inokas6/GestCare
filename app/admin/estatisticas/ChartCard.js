export default function ChartCard({ title, children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      {children}
    </div>
  );
} 