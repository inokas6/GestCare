const DailyTip = () => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Dica do dia</h3>
        <button className="text-purple-600 text-sm font-medium">Ver mais</button>
      </div>
      
      <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
        <h4 className="font-medium text-purple-800 mb-2">Hidratação é essencial</h4>
        <p className="text-gray-700 text-sm mb-3">
          Nesta fase da gravidez, mantenha-se bem hidratada. Tente beber pelo menos 8-10 copos de água por dia para apoiar o desenvolvimento saudável do bebé e seu bem-estar.
        </p>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-purple-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M3 9c2-2 5.5-1.5 5.5 1 0 1.5-1 2-2 3l-.5 1h3"></path>
              <circle cx="15" cy="12" r="3"></circle>
              <path d="M18 22a5 5 0 0 0 0-10"></path>
            </svg>
            <span className="text-xs font-medium">Dicas para 2° trimestre</span>
          </div>
          <span className="text-xs text-gray-500">Hoje</span>
        </div>
      </div>
    </div>
  );
};

export default DailyTip; 