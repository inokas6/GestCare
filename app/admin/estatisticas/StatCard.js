export default function StatCard({ title, value, change, icon: Icon, color, trend }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
              <span className="mr-1">{trend === 'up' ? '↑' : '↓'}</span>
              <span>{change}% vs mês anterior</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <span className="text-white text-xl">•</span>
        </div>
      </div>
    </div>
  );
} 