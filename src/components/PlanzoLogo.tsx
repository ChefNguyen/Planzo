import React from 'react';

interface PlanzoLogoProps {
  className?: string;
  size?: number;
  color?: string;
}

export const PlanzoLogo: React.FC<PlanzoLogoProps> = ({
  className = 'w-8 h-8',
  color = '#00ced1',
}) => {
  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Sleek Teal Paper Airplane Icon */}
      <path
        d="M414.2 118.8L66.7 239.5C53.3 244.1 54.7 263.5 68.6 266.3L198.8 292.5C206.6 294.1 213.2 299.7 216.5 306.9L262.3 406.8C267.4 417.9 283.1 417.3 287.3 405.8L422.1 133.7C426.3 122.2 414.6 111.4 403.4 115.3L414.2 118.8Z"
        fill={color}
      />
      {/* Inner Fold Slash cut out for authentic 3D paper plane effect */}
      <path
        d="M208.5 294.2L342.1 170.8"
        stroke="#ffffff"
        strokeWidth="18"
        strokeLinecap="round"
      />
      <path
        d="M214 300L196 388L262 334L214 300Z"
        fill={color}
        opacity="0.9"
      />
    </svg>
  );
};
