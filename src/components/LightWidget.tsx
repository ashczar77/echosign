import React from 'react';
import './LightWidget.css';

interface LightWidgetProps {
  isOn: boolean;
}

const LightWidget: React.FC<LightWidgetProps> = ({ isOn }) => {
  return (
    <div className={`glass-panel widget light-widget ${isOn ? 'on' : 'off'}`}>
      <div className="icon-container">
        <svg 
          viewBox="0 0 24 24" 
          fill={isOn ? '#ffcc00' : 'none'} 
          stroke={isOn ? '#ffcc00' : '#8e8e99'} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M9 18h6" />
          <path d="M10 22h4" />
          <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.45.62 2.84 1.5 3.5.76.76 1.23 1.52 1.41 2.5" />
        </svg>
      </div>
      <div className="widget-info">
        <h3>Living Room Light</h3>
        <p>{isOn ? 'ON' : 'OFF'}</p>
      </div>
    </div>
  );
};

export default LightWidget;
