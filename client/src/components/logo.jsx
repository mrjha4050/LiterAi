
import React from 'react';
import { BookOpen } from 'lucide-react';

const Logo = () => {
  return (
    <div className="flex items-center gap-2 text-4xl font-bold">
      <BookOpen className="w-10 h-10 text-purple-500" />
      <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-transparent bg-clip-text">
        literAI
      </span>
    </div>
  );
};

export default Logo;