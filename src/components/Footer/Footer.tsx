import React from 'react';
import FooterContent from './FooterContent';
import FooterBottom from './FooterBottom';

const Footer = () => {
  return (
    <footer className="bg-[#0B0B0D] text-white py-8 md:py-12">
      <div className="w-full mx-auto px-4 sm:px-8 lg:px-[70px]">
        <FooterContent />
        <FooterBottom />
      </div>
    </footer>
  );
};

export default Footer;