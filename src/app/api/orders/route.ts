// src/app/api/orders/route.ts - ПОЛНАЯ ВЕРСИЯ С ИСПРАВЛЕННОЙ ОТПРАВКОЙ (ТЕКСТ + ФОТО ОТДЕЛЬНО)
import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
const ADMIN_TELEGRAM_CHAT_ID = process.env.ADMIN_TELEGRAM_CHAT_ID;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

interface CreateOrderData {
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  items: Array<{
    productId: string;
    size: string;
    quantity: number;
    priceAtTime: number;
    productName?: string;
    productImage?: string; // ✅ ДОБАВИЛИ ПОЛЕ ДЛЯ ИЗОБРАЖЕНИЯ ИЗ КОРЗИНЫ
  }>;
  totalAmount: number;
  deliveryMethod: string;
  paymentMethod: string;
  deliveryAddress?: string;
  notes?: string;
}

interface ProductImage {
  url: string;
  productName: string;
  productId: string;
}

// POST /api/orders - создать заказ
export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderData = await request.json();

    // Получаем токен пользователя
    const authHeader = request.headers.get("authorization");
    const userToken = authHeader?.replace("Bearer ", "") || null;

    // ОБЯЗАТЕЛЬНАЯ АВТОРИЗАЦИЯ - без регистрации заказ создать нельзя
    if (!userToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Для оформления заказа необходимо войти в аккаунт",
          code: "AUTH_REQUIRED",
        },
        { status: 401 }
      );
    }

    // Получаем данные пользователя
    let userId: string | null = null;
    try {
      const userResponse = await fetch(`${STRAPI_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        userId = userData.id.toString();
      } else {
        // Токен невалиден
        return NextResponse.json(
          {
            success: false,
            error: "Сессия истекла. Пожалуйста, войдите в аккаунт заново",
            code: "INVALID_TOKEN",
          },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error("❌ Ошибка проверки пользователя:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Ошибка проверки авторизации",
          code: "AUTH_ERROR",
        },
        { status: 401 }
      );
    }

    // Базовая валидация
    const validation = validateOrderData(body);
    if (!validation.isValid) {
      console.error("❌ Валидация заказа не прошла:", validation.error);
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Генерируем номер заказа
    const orderNumber = generateOrderNumber();

    // Подготавливаем данные для Strapi с правильной связью пользователя
    const orderData = {
      orderNumber,
      customerName: body.customerInfo.name,
      customerPhone: body.customerInfo.phone,
      customerEmail: body.customerInfo.email || "",
      totalAmount: body.totalAmount,
      deliveryMethod: body.deliveryMethod,
      paymentMethod: body.paymentMethod,
      deliveryAddress: body.deliveryAddress || "",
      notes: body.notes || "",
      orderStatus: "pending",
      paymentStatus:
        body.paymentMethod === "cash_vladivostok" ? "pending" : "pending",
      // Правильная связь с пользователем
      ...(userId && {
        user: {
          connect: [{ id: parseInt(userId) }],
        },
      }),
    };

    // Сохраняем заказ в Strapi
    const orderId = await saveOrderToStrapi(orderData, body.items);

    // ✅ ИСПРАВЛЕННАЯ ОТПРАВКА: ТЕКСТ + ФОТО ОТДЕЛЬНО
    await sendAdminNotificationWithPhotos(orderNumber, body, orderData);

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      message: "Заказ успешно создан",
      userOrder: !!userId,
    });
  } catch (error) {
    console.error("❌ Ошибка создания заказа:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Внутренняя ошибка сервера",
        details: error instanceof Error ? error.message : "Неизвестная ошибка",
      },
      { status: 500 }
    );
  }
}

// Сохранение заказа в Strapi
async function saveOrderToStrapi(
  orderData: any,
  items: CreateOrderData["items"]
): Promise<string> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // 1. Создаем основной заказ
  const orderResponse = await fetch(`${STRAPI_URL}/api/orders`, {
    method: "POST",
    headers,
    body: JSON.stringify({ data: orderData }),
  });

  if (!orderResponse.ok) {
    const errorText = await orderResponse.text();
    console.error("❌ Ошибка ответа Strapi:", errorText);
    throw new Error(
      `Ошибка создания заказа в Strapi: ${orderResponse.status} - ${errorText}`
    );
  }

  const orderResult = await orderResponse.json();
  const orderId = orderResult.data.id;

  const createdOrderItems: string[] = [];
  let successCount = 0;

  for (let index = 0; index < items.length; index++) {
    const item = items[index];

    try {
      // Пытаемся найти размер
      const sizeId = await findSizeId(item.productId, item.size);

      // Правильная структура для новых связей
      const itemData = {
        orderId: orderId.toString(),
        productId: item.productId,
        productName: item.productName || `Товар ${item.productId}`,
        quantity: item.quantity,
        priceAtTime: item.priceAtTime,
        productImage: item.productImage || '', // ✅ Сохраняем фото товара

        // Связь с product
        product: {
          connect: [{ id: parseInt(item.productId) }],
        },

        // Связь с заказом
        order: {
          connect: [{ id: orderId }],
        },

        // Размер только если найден
        ...(sizeId && {
          size: {
            connect: [{ id: parseInt(sizeId) }],
          },
        }),
      };

      const itemResponse = await fetch(`${STRAPI_URL}/api/order-items`, {
        method: "POST",
        headers,
        body: JSON.stringify({ data: itemData }),
      });

      if (!itemResponse.ok) {
        const errorText = await itemResponse.text();
        console.error(`❌ Ошибка создания позиции ${index + 1}:`, errorText);

        const fallbackData = {
          orderId: orderId.toString(),
          productId: item.productId,
          productName: item.productName || `Товар ${item.productId}`,
          quantity: item.quantity,
          priceAtTime: item.priceAtTime,
          productImage: item.productImage || '', // ✅ Сохраняем фото товара
        };

        const fallbackResponse = await fetch(`${STRAPI_URL}/api/order-items`, {
          method: "POST",
          headers,
          body: JSON.stringify({ data: fallbackData }),
        });

        if (fallbackResponse.ok) {
          const fallbackResult = await fallbackResponse.json();
          createdOrderItems.push(fallbackResult.data.id.toString());
          successCount++;
        } else {
          const fallbackError = await fallbackResponse.text();
          console.error(
            `❌ Fallback также не сработал для позиции ${index + 1}:`,
            fallbackError
          );
        }
      } else {
        const itemResult = await itemResponse.json();
        const orderItemId = itemResult.data.id;

        createdOrderItems.push(orderItemId.toString());
        successCount++;
      }

      // Небольшая пауза между созданием позиций для стабильности
      if (index < items.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    } catch (error) {
      console.error(
        `❌ Критическая ошибка создания позиции ${index + 1}:`,
        error
      );
    }
  }

  if (successCount === 0) {
    throw new Error("Не удалось создать ни одной позиции заказа");
  }

  // Обновляем заказ с новым полем связи
  if (createdOrderItems.length > 0) {
    await updateOrderWithItems(orderId, createdOrderItems);

    // Проверяем результат связывания
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await verifyOrderLinks(orderId.toString());
  }

  return orderId.toString();
}

// Обновление заказа с новым названием поля связи
async function updateOrderWithItems(
  orderId: string,
  orderItemIds: string[]
): Promise<void> {
  try {
    // Получаем documentId заказа
    let documentId = null;

    try {
      const searchResponse = await fetch(
        `${STRAPI_URL}/api/orders?filters[id][$eq]=${orderId}`
      );

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.data && searchData.data.length > 0) {
          documentId = searchData.data[0].documentId;
        }
      }
    } catch (error) {
      console.warn("⚠️ Поиск documentId не удался:", error);
    }

    if (!documentId) {
      console.warn(
        `⚠️ DocumentId не найден для заказа ${orderId}, используем orderId`
      );
      documentId = orderId;
    }

    // Проверим разные варианты названий полей
    const possibleFieldNames = ["order_items", "orderItems", "order_item"];

    for (const fieldName of possibleFieldNames) {
      const updateData = {
        [fieldName]: orderItemIds.map((id) => ({ id: parseInt(id) })),
      };

      const updateResponse = await fetch(
        `${STRAPI_URL}/api/orders/${documentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: updateData,
          }),
        }
      );

      if (updateResponse.ok) {
        const result = await updateResponse.json();
        return;
      } else {
        const errorText = await updateResponse.text();
        console.warn(
          `⚠️ Не удалось обновить через поле "${fieldName}":`,
          errorText
        );
      }
    }

    for (const fieldName of possibleFieldNames) {
      const connectData = {
        [fieldName]: {
          connect: orderItemIds.map((id) => ({ id: parseInt(id) })),
        },
      };

      const connectResponse = await fetch(
        `${STRAPI_URL}/api/orders/${documentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: connectData,
          }),
        }
      );

      if (connectResponse.ok) {
        return;
      } else {
        const connectError = await connectResponse.text();
        console.warn(
          `⚠️ Connect через "${fieldName}" не сработал:`,
          connectError
        );
      }
    }

    console.error(`❌ Все попытки обновления заказа ${orderId} не удались`);
  } catch (error) {
    console.error(`❌ Критическая ошибка обновления заказа ${orderId}:`, error);
  }
}

// Проверка связей с учетом нового поля
async function verifyOrderLinks(orderId: string): Promise<void> {
  try {
    // Проверяем разные варианты populate
    const populateOptions = ["order_items", "orderItems", "order_item"];

    for (const populateField of populateOptions) {
      try {
        const orderResponse = await fetch(
          `${STRAPI_URL}/api/orders/${orderId}?populate=${populateField}`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        if (orderResponse.ok) {
          const orderData = await orderResponse.json();
          const orderItems = orderData.data?.[populateField] || [];

          if (Array.isArray(orderItems) && orderItems.length > 0) {
            orderItems.forEach((item: any, index: number) => {});
            return;
          }
        }
      } catch (error) {
        console.warn(
          `⚠️ Ошибка проверки через поле "${populateField}":`,
          error
        );
      }
    }

    console.warn(
      `⚠️ У заказа ${orderId} не найдены связанные order_items ни в одном поле!`
    );
  } catch (error) {
    console.error(`❌ Ошибка проверки связей:`, error);
  }
}

async function getProductImages(
  items: CreateOrderData["items"]
): Promise<ProductImage[]> {
  const images: ProductImage[] = [];

  for (const item of items) {
    try {
      if (
        item.productImage &&
        item.productImage.trim() &&
        (item.productImage.startsWith("http://") ||
          item.productImage.startsWith("https://"))
      ) {
        images.push({
          url: item.productImage,
          productName: item.productName || `Товар ${item.productId}`,
          productId: item.productId,
        });

        continue;
      }

      let productData = null;
      let productResponse = null;

      try {
        productResponse = await fetch(
          `${STRAPI_URL}/api/products?filters[id][$eq]=${item.productId}&populate=mainPhoto`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (productResponse.ok) {
          productData = await productResponse.json();
        } else {
        }
      } catch (error) {}

      if (!productData?.data?.length) {
        try {
          productResponse = await fetch(
            `${STRAPI_URL}/api/products/${item.productId}?populate=mainPhoto`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (productResponse.ok) {
            const directData = await productResponse.json();
            if (directData.data) {
              productData = { data: [directData.data] };
            }
          } else {
          }
        } catch (error) {}
      }

      if (!productData?.data?.length && isNaN(Number(item.productId))) {
        try {
          productResponse = await fetch(
            `${STRAPI_URL}/api/products?filters[slug][$eq]=${item.productId}&populate=mainPhoto`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (productResponse.ok) {
            productData = await productResponse.json();
            if (productData?.data?.length > 0) {
            }
          } else {
          }
        } catch (error) {}
      }

      // Обрабатываем результат из Strapi
      if (productData?.data?.length > 0) {
        const product = productData.data[0];

        // Проверяем разные структуры изображения
        let imageUrl = null;

        if (product.mainPhoto?.url) {
          imageUrl = product.mainPhoto.url;
        } else if (product.mainPhoto?.data?.attributes?.url) {
          imageUrl = product.mainPhoto.data.attributes.url;
        } else if (product.attributes?.mainPhoto?.data?.attributes?.url) {
          imageUrl = product.attributes.mainPhoto.data.attributes.url;
        } else if (product.mainPhoto?.formats?.small?.url) {
          imageUrl = product.mainPhoto.formats.small.url;
        } else if (product.mainPhoto?.formats?.thumbnail?.url) {
          imageUrl = product.mainPhoto.formats.thumbnail.url;
        }

        if (imageUrl) {
          const fullImageUrl = imageUrl.startsWith("http")
            ? imageUrl
            : `${STRAPI_URL}${imageUrl}`;

          images.push({
            url: fullImageUrl,
            productName:
              item.productName ||
              product.name ||
              product.attributes?.name ||
              `Товар ${item.productId}`,
            productId: item.productId,
          });
        } else {
        }
      } else {
      }
    } catch (error) {}
  }

  return images;
}

function groupProductsByImage(
  items: CreateOrderData["items"],
  productImages: ProductImage[]
): Array<{
  imageUrl: string;
  productName: string;
  productId: string;
  items: Array<{
    size: string;
    quantity: number;
    priceAtTime: number;
  }>;
  totalQuantity: number;
  totalPrice: number;
}> {
  const groups: Map<string, any> = new Map();

  items.forEach((item, index) => {
    const correspondingImage = productImages.find(
      (img) => img.productId === item.productId
    );

    if (correspondingImage) {
      const key = correspondingImage.url;

      if (!groups.has(key)) {
        groups.set(key, {
          imageUrl: correspondingImage.url,
          productName: correspondingImage.productName,
          productId: correspondingImage.productId,
          items: [],
          totalQuantity: 0,
          totalPrice: 0,
        });
      }

      const group = groups.get(key);
      group.items.push({
        size: item.size,
        quantity: item.quantity,
        priceAtTime: item.priceAtTime,
      });
      group.totalQuantity += item.quantity;
      group.totalPrice += item.priceAtTime * item.quantity;
    }
  });

  return Array.from(groups.values());
}

async function sendAdminNotificationWithPhotos(
  orderNumber: string,
  orderData: CreateOrderData,
  savedData: any
): Promise<void> {
  try {
    if (!TELEGRAM_BOT_TOKEN || !ADMIN_TELEGRAM_CHAT_ID) {
      const message = formatAdminNotification(
        orderNumber,
        orderData,
        savedData
      );
      return;
    }

    // Получаем изображения товаров
    const productImages = await getProductImages(orderData.items);
    const groupedProducts = groupProductsByImage(
      orderData.items,
      productImages
    );

    const mainMessage = formatAdminNotificationWithGrouping(
      orderNumber,
      orderData,
      savedData,
      groupedProducts
    );
    const textSent = await sendTelegramTextMessage(mainMessage);

    if (!textSent) {
      console.error("❌ Не удалось отправить основную информацию");
      return;
    }

    if (productImages.length === 0) {
      return;
    }

    if (productImages.length === 1) {
      await sendTelegramPhotoWithCaption(
        productImages[0].url,
        `📦 ${productImages[0].productName}`
      );
      return;
    }

    await sendPhotosOnlyMediaGroup(groupedProducts);
  } catch (error) {
    console.error("❌ Ошибка отправки уведомления админу:", error);

    try {
      const message = formatAdminNotification(
        orderNumber,
        orderData,
        savedData
      );
      await sendTelegramTextMessage(message);
    } catch (fallbackError) {
      console.error("❌ Ошибка финального fallback:", fallbackError);
    }
  }
}

async function sendPhotosOnlyMediaGroup(
  groupedProducts: any[]
): Promise<boolean> {
  try {
    // Ограничиваем до 10 изображений (лимит Telegram)
    const imagesToSend = groupedProducts.slice(0, 10);

    const mediaArray = imagesToSend.map((group) => ({
      type: "photo",
      media: group.imageUrl,
    }));

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMediaGroup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: ADMIN_TELEGRAM_CHAT_ID,
          media: mediaArray,
        }),
      }
    );

    if (response.ok) {
      // Отправляем названия товаров отдельным сообщением
      const productNames = imagesToSend
        .map((group, index) => `${index + 1}. 📦 ${group.productName}`)
        .join("\n");

      await sendTelegramTextMessage(
        `<b>Товары на фото:</b>\n\n${productNames}`
      );

      // Если товаров больше 10, отправляем дополнительную информацию
      if (groupedProducts.length > 10) {
        const remainingProducts = groupedProducts.slice(10);
        const remainingInfo = remainingProducts
          .map(
            (group, index) =>
              `${index + 11}. ${
                group.productName
              } = ${group.totalPrice.toLocaleString("ru-RU")}₽`
          )
          .join("\n");

        await sendTelegramTextMessage(
          `📦 <b>Дополнительные товары:</b>\n\n${remainingInfo}`
        );
      }

      return true;
    } else {
      const errorText = await response.text();
      console.error("❌ Ошибка отправки медиа-группы:", errorText);

      return await sendIndividualPhotos(groupedProducts);
    }
  } catch (error) {
    console.error("❌ Ошибка отправки медиа-группы:", error);

    return await sendIndividualPhotos(groupedProducts);
  }
}

async function sendIndividualPhotos(groupedProducts: any[]): Promise<boolean> {
  try {
    let successCount = 0;

    for (let i = 0; i < groupedProducts.length; i++) {
      const group = groupedProducts[i];

      try {
        const success = await sendTelegramPhotoWithCaption(
          group.imageUrl,
          `📦 ${group.productName}`
        );

        if (success) {
          successCount++;
        }

        // Небольшая пауза между отправками (500ms)
        if (i < groupedProducts.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`❌ Ошибка отправки фото товара ${i + 1}:`, error);
      }
    }

    return successCount > 0;
  } catch (error) {
    console.error("❌ Ошибка отправки индивидуальных фото:", error);
    return false;
  }
}

function formatAdminNotificationWithGrouping(
  orderNumber: string,
  orderData: CreateOrderData,
  savedData: any,
  groupedProducts: any[]
): string {
  const { customerInfo, totalAmount, deliveryMethod, paymentMethod } =
    orderData;

  let message = `🛍️ <b>НОВЫЙ ЗАКАЗ!</b>\n\n`;
  message += `📋 <b>Номер:</b> ${orderNumber}\n`;
  message += `👤 <b>Клиент:</b> ${customerInfo.name}\n`;
  message += `📞 <b>Телефон:</b> ${customerInfo.phone}\n`;

  if (customerInfo.email) {
    message += `📧 <b>Email:</b> ${customerInfo.email}\n`;
  }

  message += `\n📦 <b>Товары (${groupedProducts.length} наименований):</b>\n`;
  groupedProducts.forEach((group, index) => {
    const sizesText = group.items
      .map((item: any) => `${item.size}×${item.quantity}`)
      .join(", ");
    message += `${index + 1}. ${
      group.productName
    } (${sizesText}) = ${group.totalPrice.toLocaleString("ru-RU")}₽\n`;
  });

  message += `\n💰 <b>Итого:</b> ${totalAmount.toLocaleString("ru-RU")}₽\n`;
  message += `🚚 <b>Доставка:</b> ${getDeliveryMethodName(deliveryMethod)}\n`;
  message += `💳 <b>Оплата:</b> ${getPaymentMethodName(paymentMethod)}\n`;

  if (savedData.deliveryAddress) {
    message += `📍 <b>Адрес:</b> ${savedData.deliveryAddress}\n`;
  }

  if (savedData.notes) {
    message += `📝 <b>Примечания:</b> ${savedData.notes}\n`;
  }

  message += `\n⏰ ${new Date().toLocaleString("ru-RU")}`;

  return message;
}

// Отправка фото с подписью в Telegram
async function sendTelegramPhotoWithCaption(
  photoUrl: string,
  caption: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: ADMIN_TELEGRAM_CHAT_ID,
          photo: photoUrl,
          caption: caption,
          parse_mode: "HTML",
        }),
      }
    );

    if (response.ok) {
      return true;
    } else {
      const errorText = await response.text();
      console.error("❌ Ошибка отправки фото в Telegram:", errorText);
      return false;
    }
  } catch (error) {
    console.error("❌ Ошибка Telegram API при отправке фото:", error);
    return false;
  }
}

async function sendTelegramTextMessage(message: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: ADMIN_TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    if (response.ok) {
      return true;
    } else {
      const errorText = await response.text();
      console.error(
        "❌ Ошибка отправки текстового сообщения в Telegram:",
        errorText
      );
      return false;
    }
  } catch (error) {
    console.error("❌ Ошибка Telegram API:", error);
    return false;
  }
}

function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 999)
    .toString()
    .padStart(3, "0");

  return `TS-${year}${month}${day}${random}`;
}

function validateOrderData(data: CreateOrderData): {
  isValid: boolean;
  error?: string;
} {
  if (!data.customerInfo?.name?.trim()) {
    return { isValid: false, error: "Не указано имя покупателя" };
  }

  if (!data.customerInfo?.phone?.trim()) {
    return { isValid: false, error: "Не указан телефон покупателя" };
  }

  const phoneRegex = /^[+]?[0-9\s\-\(\)]{10,}$/;
  if (!phoneRegex.test(data.customerInfo.phone.trim())) {
    return { isValid: false, error: "Неверный формат телефона" };
  }

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    return { isValid: false, error: "Корзина пуста" };
  }

  if (!data.totalAmount || data.totalAmount <= 0) {
    return { isValid: false, error: "Неверная сумма заказа" };
  }

  if (!data.deliveryMethod || !data.paymentMethod) {
    return { isValid: false, error: "Не указан способ доставки или оплаты" };
  }

  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    if (!item.productId || !item.size || !item.quantity || !item.priceAtTime) {
      return { isValid: false, error: `Неверные данные товара #${i + 1}` };
    }

    if (item.quantity <= 0 || item.priceAtTime <= 0) {
      return {
        isValid: false,
        error: `Неверное количество или цена товара #${i + 1}`,
      };
    }
  }

  return { isValid: true };
}

// Поиск размеров
async function findSizeId(
  productId: string,
  sizeValue: string
): Promise<string | null> {
  try {
    // Метод 1: Получаем товар с размерами
    const productResponse = await fetch(
      `${STRAPI_URL}/api/products?filters[id][$eq]=${productId}&populate=sizes`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (productResponse.ok) {
      const productData = await productResponse.json();

      if (productData.data && productData.data.length > 0) {
        const product = productData.data[0];

        if (product.sizes && Array.isArray(product.sizes)) {
          const targetSize = product.sizes.find(
            (size: any) => size.value === sizeValue
          );

          if (targetSize) {
            return targetSize.id.toString();
          }
        }
      }
    }

    // Метод 2: Прямой поиск размера
    const sizeResponse = await fetch(
      `${STRAPI_URL}/api/sizes?filters[value][$eq]=${sizeValue}&populate=*`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (sizeResponse.ok) {
      const sizeData = await sizeResponse.json();

      if (sizeData.data && sizeData.data.length > 0) {
        const firstSize = sizeData.data[0];
        return firstSize.id.toString();
      }
    }

    return null;
  } catch (error) {
    console.error("❌ Ошибка поиска размера:", error);
    return null;
  }
}

// Обновленное форматирование уведомления (для fallback)
function formatAdminNotification(
  orderNumber: string,
  orderData: CreateOrderData,
  savedData: any
): string {
  const { customerInfo, items, totalAmount, deliveryMethod, paymentMethod } =
    orderData;

  let message = `🛍️ <b>НОВЫЙ ЗАКАЗ!</b>\n\n`;
  message += `📋 <b>Номер:</b> ${orderNumber}\n`;
  message += `👤 <b>Клиент:</b> ${customerInfo.name}\n`;
  message += `📞 <b>Телефон:</b> ${customerInfo.phone}\n`;

  if (customerInfo.email) {
    message += `📧 <b>Email:</b> ${customerInfo.email}\n`;
  }

  message += `\n📦 <b>Товары (${items.length} шт.):</b>\n`;
  items.forEach((item, index) => {
    message += `${index + 1}. ${item.productName || item.productId} (${
      item.size
    }) × ${item.quantity} = ${(item.priceAtTime * item.quantity).toLocaleString(
      "ru-RU"
    )}₽\n`;
  });

  message += `\n💰 <b>Итого:</b> ${totalAmount.toLocaleString("ru-RU")}₽\n`;
  message += `🚚 <b>Доставка:</b> ${getDeliveryMethodName(deliveryMethod)}\n`;
  message += `💳 <b>Оплата:</b> ${getPaymentMethodName(paymentMethod)}\n`;

  if (savedData.deliveryAddress) {
    message += `📍 <b>Адрес:</b> ${savedData.deliveryAddress}\n`;
  }

  if (savedData.notes) {
    message += `📝 <b>Примечания:</b> ${savedData.notes}\n`;
  }

  message += `\n⏰ ${new Date().toLocaleString("ru-RU")}`;

  return message;
}

// Вспомогательные функции для читаемых названий
function getDeliveryMethodName(method: string): string {
  const methods = {
    store_pickup: "Самовывоз из магазина",
    courier_ts: "Курьер TS",
    cdek_pickup: "СДЭК до пункта выдачи",
    cdek_courier: "СДЭК курьером",
  };
  //@ts-ignore
  return methods[method] || method;
}

function getPaymentMethodName(method: string): string {
  const methods = {
    card: "Онлайн картой",
    cash_vladivostok: "Наличными во Владивостоке",
  };
  //@ts-ignore
  return methods[method] || method;
}
