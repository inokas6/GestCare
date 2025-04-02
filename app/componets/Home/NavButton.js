const NavButton = ({ label, active }) => {
  return (
    <button 
      className={`px-3 py-2 rounded-lg transition ${active ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-purple-700'}`}
    >
      {label}
    </button>
  );
};

export default NavButton; 