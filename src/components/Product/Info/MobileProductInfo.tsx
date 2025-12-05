"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../../contexts/CartContext";

export interface ProductSize {
  size: string;
  price: number;
  available: boolean;
  originalPrice?: number;
  article?: string;
}

export interface ProductInfo {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  category: string;
  article: string;
  description?: string;
  sizes: ProductSize[];
  allSizes?: ProductSize[];
  inStock: boolean;
  isNew?: boolean;
  isExclusive?: boolean;
  deliveryInfo?: string;

  gender?: string;
  photo?: string;
  mainPhoto?: string;
  additionalPhotos?: string[];
}

interface MobileProductInfoProps {
  product: ProductInfo;
  selectedSize: string | null;
  selectedSizeInfo: ProductSize | null | undefined;
  onSizeSelect: (size: string) => void;
  onAddToCart: () => void;
  isAddingToCart: boolean;
}

const MobileProductInfo: React.FC<MobileProductInfoProps> = ({
  product,
  selectedSize,
  selectedSizeInfo,
  onSizeSelect,
  onAddToCart,
  isAddingToCart,
}) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);

  const formatPrice = (price: number) => {
    return price.toLocaleString("ru-RU") + " ₽";
  };

  const availableSizes =
    product.allSizes && product.allSizes.length > 0
      ? product.allSizes
      : product.sizes;

  const actualSelectedSizeInfo =
    selectedSize && availableSizes
      ? availableSizes.find((s) => s.size === selectedSize)
      : selectedSizeInfo;

  const finalPrice = actualSelectedSizeInfo?.price || product.price;
  const hasDiscount =
    actualSelectedSizeInfo?.originalPrice &&
    actualSelectedSizeInfo.originalPrice > finalPrice;

  const sortedSizes = [...availableSizes].sort((a, b) => {
    const aNum = parseFloat(a.size.replace(/[^\d.]/g, ""));
    const bNum = parseFloat(b.size.replace(/[^\d.]/g, ""));
    return aNum - bNum;
  });

  // Автоматический выбор самого маленького размера при загрузке
  useEffect(() => {
    if (!selectedSize && sortedSizes.length > 0) {
      const firstAvailableSize = sortedSizes.find((size) => size.available);
      if (firstAvailableSize) {
        onSizeSelect(firstAvailableSize.size);
      }
    }
  }, []);

  const getButtonText = () => {
    if (isAddingToCart) return "ДОБАВЛЯЕМ...";
    if (!selectedSize) return "НЕ ВЫБРАНО";
    return "ДОБАВИТЬ В КОРЗИНУ";
  };

  // Функция для кнопки "Оплатить"
  const handlePayment = async () => {
    if (!selectedSize || !product.inStock) {
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Создаем объект товара для добавления в корзину
      const cartItem = {
        id: product.id,
        article: actualSelectedSizeInfo?.article || product.article,
        brand: product.brand,
        name: product.name,
        size: selectedSize,
        category: product.category,
        gender: product.gender,
        price: finalPrice,
        photo: product.photo || product.mainPhoto,
      };

      //@ts-ignore
      addToCart(cartItem);

      // Небольшая задержка для UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Перенаправляем на страницу оформления заказа
      router.push("/checkout");
    } catch (error) {
      console.error("Ошибка при переходе к оплате:", error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="w-full flex justify-center px-4">
      <div className="space-y-4 w-full max-w-md">
        {/* Название товара */}
        <h1 className="product-name--small text-black ">{product.name}</h1>

        {/* Цена и артикул */}
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <span className="product-price--medium text-brand-light-beige">
              {formatPrice(finalPrice)}
            </span>

            {hasDiscount && actualSelectedSizeInfo?.originalPrice && (
              <span className="text-gray-400 line-through text-lg">
                {formatPrice(actualSelectedSizeInfo.originalPrice)}
              </span>
            )}
          </div>

          {/* Артикул выбранного размера */}
          <span className="product-article product-article--small text-brand-gray product-price--small">
            {actualSelectedSizeInfo?.article || "Артикул"}
          </span>
        </div>

        {/* Кнопка "Добавить в корзину" с выбранным размером */}
        <div className="relative">
          <button
            onClick={onAddToCart}
            disabled={!selectedSize || isAddingToCart || !product.inStock}
            className={`btn-add-cart btn-add-cart--mobile w-full ${
              !selectedSize || !product.inStock
                ? "bg-gray-400 cursor-not-allowed"
                : isAddingToCart
                ? "bg-gray-600 cursor-wait"
                : ""
            }`}
          >
            {/* Левая часть - "Размер" или конкретный размер */}
            <div className="flex items-center justify-center w-20">
              <span className="text-white text-center text-[14px] leading-[18px]">
                {selectedSize || "Размер"}
              </span>
            </div>

            {/* Разделитель */}
            <div className="btn-add-cart__divider btn-add-cart__divider--mobile"></div>

            {/* Правая часть - текст кнопки */}
            <div className="flex items-center justify-center flex-1">
              <span className="text-white text-[12px] leading-[16px]">
                {getButtonText()}
              </span>
            </div>
          </button>
        </div>

        {/* Заголовок "ВЫБЕРИТЕ РАЗМЕР" */}
        <div>
          <h3 className="product-name--small text-black mb-2 uppercase">
            ВЫБЕРИТЕ РАЗМЕР
          </h3>

          {/* Выпадающий список размеров */}
          <div className="relative">
            <button
              onClick={() => setIsSizeDropdownOpen(!isSizeDropdownOpen)}
              className="size-dropdown size-dropdown--mobile w-full"
            >
              <div className="flex flex-col items-start w-full">
                {/* Основная строка с размером и ценой */}
                <span className="text-black text-left text-[15px] leading-[20px]">
                  {selectedSize
                    ? `${selectedSize} RU — ${formatPrice(
                        actualSelectedSizeInfo?.price || product.price
                      )}`
                    : "Выберите размер"}
                </span>
              </div>

              {/* Стрелка */}
              <div
                className={`w-2 h-2 border-r-2 border-b-2 border-black transform transition-transform ${
                  isSizeDropdownOpen ? "-rotate-45" : "rotate-45"
                }`}
                style={{ marginTop: isSizeDropdownOpen ? "2px" : "-2px" }}
              ></div>
            </button>

            {/* Список размеров */}
            {isSizeDropdownOpen && (
              <div className="size-dropdown-list max-h-60">
                {sortedSizes.map((size) => (
                  <button
                    key={size.size}
                    onClick={() => {
                      onSizeSelect(size.size);
                      setIsSizeDropdownOpen(false);
                    }}
                    disabled={!size.available}
                    className={`size-dropdown-item size-dropdown-item--mobile ${
                      selectedSize === size.size ? "selected" : ""
                    }`}
                  >
                    <div className="flex flex-col items-start w-full">
                      {/* Основная строка с размером и ценой */}
                      <span className="text-left text-[15px] leading-[20px]">
                        {size.size} RU — {formatPrice(size.price)}
                        {!size.available && " (нет в наличии)"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Информация о доставке */}
        <div className="flex items-start gap-3 pt-2">
          {/* Иконка доставки */}
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-4 h-4 flex items-center justify-center">
              <img src="../icons/delivery.svg" alt="" />
            </div>
          </div>

          <div className="flex-1">
            <p className="text-body--tiny text-black">
              {product.deliveryInfo ||
                "Среднее время стандартной доставки: 15-20 рабочих дней."}
            </p>
          </div>
        </div>

        {/* Блок качества - мобильная версия */}
        <div className="quality-badge-mobile">
          <span className="text-black text-[11px] leading-[12px]">
            Товар прошел проверку на качество и оригинальность
          </span>
        </div>

        {/* Кнопка "Оплатить" */}
        <div className="pt-4 space-y-2">
          <button
            onClick={handlePayment}
            disabled={!selectedSize || isProcessingPayment || !product.inStock}
            className={`w-full h-[50px] text-white text-[20px] leading-[27px] transition-colors product-price--medium ${
              !selectedSize || !product.inStock
                ? "bg-gray-400 cursor-not-allowed"
                : isProcessingPayment
                ? "bg-gray-600 cursor-wait"
                : "bg-black hover:bg-gray-800"
            }`}
          >
            {isProcessingPayment ? "Переходим к оплате..." : "Оплатить"}
          </button>
        </div>

        {/* Информация о бренде */}
        <div className="border-t border-b border-brand-light-gray py-2">
          <div className="flex justify-between items-center">
            <span className="text-brand-light-gray text-body--large leading-[35px]">
              Бренд
            </span>
            <div className="flex justify-between items-center gap-2">
              <span className="text-brand-light-gray text-body--large leading-[35px]">
                {product.brand}
              </span>
              {/* Стрелка */}
              <img src="../utils/arrow_right.svg" alt="" className="w-[10px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileProductInfo;
