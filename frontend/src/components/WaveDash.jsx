// src/components/WaveDash.jsx
import React from 'react';

const WaveDash = ({ children }) => {
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Ombak bergerak sebagai background */}
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        style={{
          position: 'fixed',     // menempel di viewport
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
        }}
      >
        <path
          fill="#007bff"
          fillOpacity="1"
          d="M0,0 C300,100 900,0 1200,100 L1200,0 L0,0 Z"
        >
          <animate
            attributeName="d"
            dur="6s"
            repeatCount="indefinite"
            values="
              M0,0 C300,100 900,0 1200,100 L1200,0 L0,0 Z;
              M0,0 C300,50 900,150 1200,50 L1200,0 L0,0 Z;
              M0,0 C300,100 900,0 1200,100 L1200,0 L0,0 Z"
          />
        </path>
      </svg>

      {/* Konten apa pun yang dibungkus WaveDash */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export { WaveDash };
