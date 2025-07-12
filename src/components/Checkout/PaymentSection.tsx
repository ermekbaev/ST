'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';

interface PaymentSectionProps {
 form: UseFormReturn<any>;
 isMobile?: boolean;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({ form, isMobile = false }) => {
 const { register, watch, setValue } = form;
 
 const paymentOptions = [
   { id: 'card', name: 'Оплата картой (МИР, VIZA, MasterCard)' },
   { id: 'cash_vladivostok', name: 'Оплата наличными в городе Владивосток' }
 ];

 const selectedPayment = watch('paymentMethod');

 const handlePaymentChange = (optionId: string) => {
   setValue('paymentMethod', optionId, { shouldValidate: true });
 };

 return (
   <div className="space-y-6">
     {/* Заголовок секции */}
     <h2 className={isMobile ? 'checkout-section-title--mobile' : 'checkout-section-title'}>
       СПОСОБ ОПЛАТЫ
     </h2>

     {/* Опции оплаты */}
     <div className="checkout-checkbox-group">
       {paymentOptions.map((option) => (
         <label 
           key={option.id} 
           className="checkout-checkbox-item"
           onClick={() => handlePaymentChange(option.id)}
         >
           <input
             type="radio"
             {...register('paymentMethod')}
             value={option.id}
             className="sr-only"
             onChange={() => handlePaymentChange(option.id)}
           />
           <div 
             className={`checkout-checkbox ${selectedPayment === option.id ? 'checkout-checkbox--checked' : ''}`} 
           />
           <span className={`checkout-checkbox-label ${isMobile ? 'checkout-checkbox-label--mobile' : ''}`}>
             {option.name}
           </span>
         </label>
       ))}
     </div>
   </div>
 );
};

export default PaymentSection;