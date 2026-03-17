import React from 'react';

const NinjaIcon = ({ className = "w-4 h-4" }) => (
    <svg 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Simple Ninja Mask SVG path */}
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM6.64 6H17.36C18.61 7.37 19.35 9.12 19.35 11H4.65C4.65 9.12 5.39 7.37 6.64 6ZM12 18C10.07 18 8.44 16.92 7.61 15.34C9.07 14.5 10.49 14 12 14C13.51 14 14.93 14.5 16.39 15.34C15.56 16.92 13.93 18 12 18ZM17 11C16.45 11 16 10.55 16 10C16 9.45 16.45 9 17 9C17.55 9 18 9.45 18 10C18 10.55 17.55 11 17 11ZM7 11C6.45 11 6 10.55 6 10C6 9.45 6.45 9 7 9C7.55 9 8 9.45 8 10C8 10.55 7.55 11 7 11Z" />
    </svg>
);

export default NinjaIcon;
