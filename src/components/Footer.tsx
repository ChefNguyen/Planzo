import React from 'react';
import { PlanzoLogo } from './PlanzoLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-10 px-6 lg:px-[120px] flex flex-col md:flex-row justify-between items-center gap-6 bg-white border-t-2 border-[#1b1c19] mt-auto transition-colors duration-300">
      <div className="flex flex-col items-center md:items-start gap-1">
        <span className="text-base font-extrabold text-[#00696b] font-headline flex items-center gap-1">
          <PlanzoLogo className="w-5 h-5" color="#00696b" />
          <span>Planzo AI</span>
        </span>
        <p className="text-xs text-[#3b4949]">
          © 2024 Planzo AI. Your Passport to Playful Discipline.
        </p>
      </div>

      <nav className="flex flex-wrap justify-center gap-6 text-xs text-[#3b4949]">
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="text-[#00696b] font-semibold hover:underline decoration-[#00696b]/30 transition-colors"
        >
          Terms of Service
        </a>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="hover:text-[#00696b] hover:underline decoration-[#00696b]/30 transition-colors"
        >
          Privacy Policy
        </a>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="hover:text-[#00696b] hover:underline decoration-[#00696b]/30 transition-colors"
        >
          Help Center
        </a>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="hover:text-[#00696b] hover:underline decoration-[#00696b]/30 transition-colors"
        >
          Instagram
        </a>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="hover:text-[#00696b] hover:underline decoration-[#00696b]/30 transition-colors"
        >
          Twitter
        </a>
      </nav>
    </footer>
  );
};
