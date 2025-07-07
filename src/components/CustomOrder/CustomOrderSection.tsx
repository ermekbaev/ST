'use client';

import React from 'react';
import CustomOrderMobile from './CustomOrderMobile';
import CustomOrderDesktop from './CustomOrderDesktop';

interface CustomOrderSectionProps {
  onHowItWorksClick: () => void;
}

const CustomOrderSection: React.FC<CustomOrderSectionProps> = ({ onHowItWorksClick }) => {
  return (
    <section 
      className="relative overflow-hidden h-[400px] md:h-[830px]"
      style={{ 
        background: 'radial-gradient(circle at center, #595047 0%, #D9CDBF 100%)'
      }}
    >
      {/* Контент баннера */}
      <div className="relative z-10 h-full px-4 md:px-5">
        
        {/* Мобильная версия */}
        <CustomOrderMobile onHowItWorksClick={onHowItWorksClick} />
        
        {/* Десктопная версия */}
        <div className="hidden md:flex md:flex-col md:justify-center md:h-full">
          <CustomOrderDesktop onHowItWorksClick={onHowItWorksClick} />
        </div>
        
      </div>
    </section>
  );
};

export default CustomOrderSection;