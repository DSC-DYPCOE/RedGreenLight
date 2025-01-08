import React from 'react';
import { Play, Book } from 'lucide-react'; // Import icons from lucide-react

const Button = ({ text, icon: Icon, color, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`bg-${color}-500 hover:bg-${color}-600 text-white px-8 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105 flex items-center gap-2`}
    >
      <Icon className="w-6 h-6" />
      {text}
    </button>
  );
};

export default Button;