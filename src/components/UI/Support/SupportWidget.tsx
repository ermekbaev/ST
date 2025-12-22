"use client";

import React, { useState, useEffect } from "react";

interface SupportWidgetProps {
  forceVisible?: boolean;
  onToggle?: (isExpanded: boolean) => void;
}

const SupportWidget: React.FC<SupportWidgetProps> = ({
  forceVisible = false,
  onToggle,
}) => {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setMounted(true);

    if (!isMobile) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setTimeout(() => {
          setShowComment(true);
        }, 500);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  const handleContactClick = (type: "telegram" | "whatsapp" | "email") => {
    const links = {
      telegram: "https://t.me/TIGRSHOPsupport",
      whatsapp: "https://wa.me/79958714667",
      email: "mailto:support@tigrshop.ru",
    };

    window.open(links[type], "_blank");
  };

  const handleMainButtonClick = () => {
    if (forceVisible) {
      setIsExpanded(!isExpanded);
      if (onToggle) {
        onToggle(!isExpanded);
      }
    } else {
      setShowComment(false);
      setIsExpanded(!isExpanded);
    }
  };

  const shouldShow = mounted && (isVisible || forceVisible);
  const shouldShowComment =
    !forceVisible && mounted && isVisible && !isExpanded && showComment;

  // 🚨 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: если виджет полностью скрыт, не рендерим вообще
  if (!shouldShow) {
    return null;
  }

  return (
    <div
      className={`fixed ${
        forceVisible ? "bottom-[90px]" : "bottom-8"
      } right-4 lg:bottom-8 lg:right-8 flex items-end space-x-4 transition-all duration-500`}
      style={{
        zIndex: 45,
      }}
    >
      {/* 🎯 ИСПРАВЛЕНИЕ КОММЕНТАРИЯ: полностью убираем из DOM когда не нужен */}
      {shouldShowComment && (
        <div
          className="bg-white rounded-xl relative transition-all duration-500 ease-in-out"
          style={{
            fontFamily: "Arial, sans-serif",
            border: "4px solid #595047",
            width: isMobile ? "280px" : "310px",
            height: "115px",
            padding: "15px 30px 13px 20px",
            ...(isMobile && {
              position: "absolute",
              bottom: "50px",
              right: "0",
            }),
          }}
        >
          <button
            onClick={() => setShowComment(false)}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-black hover:text-gray-600 transition-colors font-bold text-lg leading-none"
          >
            ×
          </button>

          <div>
            <div
              className="text-base font-bold text-black"
              style={{
                fontFamily: "Arial, sans-serif",
                fontWeight: "bold",
                marginBottom: "4px",
              }}
            >
              TIGR SHOP
            </div>
            <div
              className="text-sm text-gray-700"
              style={{ fontFamily: "Arial, sans-serif", lineHeight: "1.3" }}
            >
              Это <span className="font-bold text-black">TIGR SHOP</span>!<br />
              Если у вас возникли вопросы,
              <br />
              обратитесь в чат.
            </div>
          </div>
        </div>
      )}

      <div className="relative flex flex-col items-center">
        <div className="relative">
          {/* Кнопки связи - показываем только когда нужно */}
          {(forceVisible || isExpanded) && (
            <>
              <button
                onClick={() => handleContactClick("telegram")}
                className="absolute bottom-0 right-0 rounded-full flex items-center justify-center hover:opacity-80 hover:scale-105 shadow-lg"
                title="Telegram"
                style={{
                  transform: "translateY(-170px)",
                  transitionDelay: "0ms",
                  transitionDuration: "300ms",
                  transitionTimingFunction: "ease-out",
                  transitionProperty: "all",
                  border: "none",
                  outline: "none",
                }}
              >
                <img
                  src="/supportIcons/Telegram.svg"
                  alt="Telegram"
                  className="w-13 h-13"
                  style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))" }}
                />
              </button>

              <button
                onClick={() => handleContactClick("whatsapp")}
                className="absolute bottom-0 right-0 rounded-full flex items-center justify-center hover:opacity-80 hover:scale-105 shadow-lg"
                title="WhatsApp"
                style={{
                  transform: "translateY(-112px)",
                  transitionDelay: "100ms",
                  transitionDuration: "300ms",
                  transitionTimingFunction: "ease-out",
                  transitionProperty: "all",
                }}
              >
                <img
                  src="/supportIcons/WhatsApp.svg"
                  alt="WhatsApp"
                  className="w-13 h-13"
                  style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))" }}
                />
              </button>

              <button
                onClick={() => handleContactClick("email")}
                className="absolute bottom-0 right-0 rounded-full flex items-center justify-center hover:opacity-80 hover:scale-105 shadow-lg"
                title="Email"
                style={{
                  transform: "translateY(-56px)",
                  transitionDelay: "200ms",
                  transitionDuration: "300ms",
                  transitionTimingFunction: "ease-out",
                  transitionProperty: "all",
                }}
              >
                <img
                  src="/supportIcons/Email.svg"
                  alt="Email"
                  className="w-13 h-13"
                  style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))" }}
                />
              </button>
            </>
          )}

          {/* Основная кнопка поддержки */}
          <button
            onClick={handleMainButtonClick}
            className={` rounded-full flex items-center justify-center hover:opacity-90 hover:scale-105 shadow-lg ${
              isExpanded ? "w-12 h-12" : "w-16 h-16"
            }`}
            title="Связаться с нами"
            style={{
              transitionDuration: "500ms",
              transitionTimingFunction: "ease-out",
              transitionProperty: "all",
              border: "none",
              outline: "none",
            }}
          >
            <img
              src="/supportIcons/Support.svg"
              alt="Support"
              className={`${isExpanded ? "w-13 h-13" : "w-14 h-14"}`}
              style={{
                transitionDuration: "300ms",
                transitionTimingFunction: "ease-out",
                transitionProperty: "all",
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
              }}
            />
          </button>

          {/* НА МОБИЛЬНОМ: невидимая область для клика - только когда комментарий показан */}
          {shouldShowComment && isMobile && (
            <div
              onClick={() => {
                setShowComment(false);
                setIsExpanded(true);
              }}
              className="absolute bottom-0 right-0 w-16 h-16 cursor-pointer"
              title="Связаться с нами"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportWidget;
