const BabyModel3D = ({ week }) => {
  return (
    <div className="relative w-64 h-64 bg-purple-100 rounded-full flex items-center justify-center">
      <div className="absolute inset-0 rounded-full overflow-hidden">
        {/* Esta div representaria o componente real 3D */}
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative w-40 h-40 rounded-full bg-pink-200 flex items-center justify-center">
            <div className="absolute w-32 h-32 rounded-full bg-pink-300 flex items-center justify-center animate-pulse">
              <div className="relative w-24 h-24 rounded-full bg-pink-400 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-pink-500"></div>
              </div>
            </div>
          </div>
          <div className="absolute top-4 right-4 bg-white rounded-full px-2 py-1 text-xs text-purple-700 font-medium shadow-sm">
            3D
          </div>
        </div>
      </div>
      <div className="absolute -bottom-3 bg-white rounded-full px-3 py-1 text-sm text-purple-700 font-medium shadow-sm">
        Rotação 360°
      </div>
    </div>
  );
};

export default BabyModel3D; 