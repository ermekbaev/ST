'use client';

import React, { useState } from 'react';
import CustomOrderMobile from './CustomOrderMobile';
import CustomOrderDesktop from './CustomOrderDesktop';
import HowItWorksModal from '../UI/Modal/HowItWorksModal';

interface CustomOrderSectionProps {
  onHowItWorksClick?: () => void;
}

const CustomOrderSection: React.FC<CustomOrderSectionProps> = ({ onHowItWorksClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleHowItWorksClick = () => {
    if (onHowItWorksClick) {
      onHowItWorksClick();
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <section 
        className="relative overflow-hidden h-[400px] md:h-[650px]"
        style={{ 
          background: 'radial-gradient(circle at center, #595047 0%, #D9CDBF 100%)'
        }}
      >
        {/* Контент баннера */}
        <div className="relative z-10 h-full px-4 md:px-5">
          
          {/* Мобильная версия */}
          <CustomOrderMobile onHowItWorksClick={handleHowItWorksClick} />
          
          {/* Десктопная версия */}
          <div className="hidden md:flex md:flex-col md:justify-center md:h-full">
            <CustomOrderDesktop onHowItWorksClick={handleHowItWorksClick} />
          </div>
          
        </div>
      </section>

      {/* Модальное окно "Как это работает?" */}
      <HowItWorksModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default CustomOrderSection;