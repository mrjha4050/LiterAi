import React from 'react';
import { Mail, Instagram } from 'lucide-react';

const SocialLink = ({ href, icon: Icon, label }) => (
  <a
    href={href}
    className="group relative flex items-center justify-center w-8 h-8"
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
  >
    <div className="absolute inset-0 bg-white/5 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
    <Icon className="w-4 h-4 text-white/70 group-hover:text-white transition-all duration-300 group-hover:scale-110" />
  </a>
);

const Footer = () => {
  return (
    <footer className="relative w-full overflow-hidden">
      {/* Minimal gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/80 to-pink-600/80 opacity-90"></div>
      
      {/* Content */}
      <div className="relative container mx-auto px-6 py-8">
        <div className="flex flex-col items-center space-y-6 text-center">
          {/* Brand */}
          <span className="text-xl font-light tracking-wide text-white/90">
            literAI
          </span>

          {/* Social links */}
          <div className="flex gap-6">
            <SocialLink href="https://instagram.com/jhanaman_23" icon={Instagram} label="Instagram" />
            <SocialLink href="mailto:nj230904@gmail.com.com" icon={Mail} label="Email us" />
          </div>

          {/* Tagline */}
          <p className="text-sm font-light text-white/60 max-w-xs">
            Where words come alive || All rights reserved by Naman &copy;
          </p>
          
        </div>
      </div>

      {/* Minimal decorative element */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
    </footer>
  );
};

export default Footer;