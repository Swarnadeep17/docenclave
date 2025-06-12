// src/components/shared/Logo.jsx
import React from 'react';

const Logo = ({ className }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield background */}
      <path 
        d="M50 10L10 35V85L50 90L90 85V35L50 10Z" 
        fill="url(#logoGradient)"
        stroke="#0F172A"
        strokeWidth="2"
      />
      
      {/* Document inside shield */}
      <path 
        d="M35 50L35 75H65L65 50L50 48L35 50Z" 
        stroke="#0F172A"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="square"
      />
      
      {/* Document lines */}
      <line 
        x1="40" 
        y1="55" 
        x2="60" 
        y2="55" 
        stroke="#0F172A" 
        strokeWidth="1" 
      />
      <line 
        x1="40" 
        y1="62" 
        x2="60" 
        y2="62" 
        stroke="#0F172A" 
        strokeWidth="1" 
      />
      <line 
        x1="40" 
        y1="69" 
        x2="50" 
        y2="69" 
        stroke="#0F172A" 
        strokeWidth="1" 
      />
      
      {/* Lock icon */}
      <path 
        d="M55 60C55 61.657 52.761 63 50 63C47.239 63 45 61.657 45 60C45 58.343 47.239 57 50 57C52.761 57 55 58.343 55 60Z" 
        stroke="#0F172A"
        strokeWidth="1.5"
      />
      <line 
        x1="50" 
        y1="62" 
        x2="50" 
        y2="65" 
        stroke="#0F172A" 
        strokeWidth="1.5"
      />
      
      {/* Page fold */}
      <path 
        d="M65 50L50 48L50 50" 
        fill="#0F172A"
      />
      
      {/* Gradient definition */}
      <defs>
        <linearGradient 
          id="logoGradient" 
          x1="0" 
          y1="0" 
          x2="100%" 
          y2="100%" 
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#6366F1" />
          <stop offset="0.7" stopColor="#0EA5E9" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Logo;
