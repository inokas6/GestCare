const AppointmentsWidget = () => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Próximas consultas</h3>
        <button className="text-purple-600 text-sm font-medium">Agendar</button>
      </div>
      
      <div className="border-l-2 border-purple-200 pl-4 space-y-4">
        <div>
          <span className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded mb-1">15 Abril</span>
          <h4 className="font-medium text-gray-800">Dr. Silva - Obstetra</h4>
          <p className="text-gray-600 text-sm">Hospital Santa Maria, 14:30</p>
        </div>
        
        <div>
          <span className="inline-block bg-pink-100 text-pink-800 text-xs font-medium px-2 py-1 rounded mb-1">28 Abril</span>
          <h4 className="font-medium text-gray-800">Ultrassom detalhado</h4>
          <p className="text-gray-600 text-sm">Clínica Saúde Materna, 10:00</p>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsWidget; 