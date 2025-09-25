import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

let cachedProducts: { products: any; total?: any; } | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; 

export async function GET(request: NextRequest) {
  try {
    
    const now = Date.now();
    const cacheAge = now - cacheTimestamp;
    const isCacheValid = cachedProducts && cacheAge < CACHE_DURATION;
    
    if (isCacheValid) {//@ts-ignore
      return NextResponse.json(cachedProducts);
    }
    
    
    const getAllProductsParallel = async () => {
      
      const firstPageUrl = `${STRAPI_URL}/api/products?populate=*&pagination[page]=1&pagination[pageSize]=100`;
      const firstResponse = await fetch(firstPageUrl);
      
      if (!firstResponse.ok) {
        throw new Error(`Ошибка получения первой страницы: ${firstResponse.status}`);
      }
      
      const firstData = await firstResponse.json();
      const totalItems = firstData.meta?.pagination?.total || 0;
      const pageSize = 100;
      const totalPages = Math.ceil(totalItems / pageSize);
      
      if (totalPages <= 1) {
        return firstData.data || [];
      }
      
      const promises = [];
      
      promises.push(Promise.resolve(firstData.data));
      
      for (let page = 2; page <= totalPages; page++) {
        const pageUrl = `${STRAPI_URL}/api/products?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
        
        const pagePromise = fetch(pageUrl)
          .then(response => {
            if (!response.ok) {
              console.error(`❌ Ошибка на странице ${page}: ${response.status}`);
              return [];
            }
            return response.json();
          })
          .then(data => {
            return data.data || [];
          })
          .catch(error => {
            console.error(`❌ Ошибка загрузки страницы ${page}:`, error);
            return [];
          });
        
        promises.push(pagePromise);
      }
      
      const startTime = Date.now();
      
      const results = await Promise.all(promises);
      
      const endTime = Date.now();
      
      const allProducts = results.flat();
      
      return allProducts;
    };

    const allStrapiProducts = await getAllProductsParallel();
    
    if (allStrapiProducts.length === 0) {
      return NextResponse.json({
        products: [],
        total: 0,
        message: 'Нет товаров в Strapi'
      });
    }

    const processStartTime = Date.now();

    const products = allStrapiProducts.map((item: any) => {
      const data = item;

      let productSizes = [];
      
      if (data.sizes && Array.isArray(data.sizes)) {
        productSizes = data.sizes
          .filter((sizeItem: any) => {
            return sizeItem.price !== null && 
                   sizeItem.stockQuantity !== null;
          })
          .map((sizeItem: any) => {
            const stockQty = sizeItem.stockQuantity || 0;
            const reservedQty = sizeItem.reservedQuantity || 0;
            const availableQty = Math.max(0, stockQty - reservedQty);
            
            return {
              id: sizeItem.id,
              size: String(sizeItem.value || ''),
              price: sizeItem.price || 0,
              originalPrice: sizeItem.originalPrice,
              available: availableQty > 0,
              stockQuantity: stockQty,
              reservedQuantity: reservedQty,
              availableQuantity: availableQty
            };
          });
        
        productSizes.sort((a: any, b: any) => {
          const aNum = parseFloat(a.size.replace(/[^\d.]/g, ''));
          const bNum = parseFloat(b.size.replace(/[^\d.]/g, ''));
          return aNum - bNum;
        });
      }

      const brand = data.brand?.name ? String(data.brand.name) : 'Не указан';
      const category = data.category?.name ? String(data.category.name) : 'Не указана';
      const gender = data.gender?.name ? String(data.gender.name) : 'Унисекс';

      const basePrice = productSizes.length > 0 
        ? Math.min(...productSizes.map((s: any) => s.price))
        : 0;

      const mainPhoto = String(data.mainPhoto || '/images/placeholder.jpg');
      let additionalPhotos = [];
      
      if (data.addTotalPhotos && Array.isArray(data.addTotalPhotos)) {
        additionalPhotos = data.addTotalPhotos;
      }
      
      return {
        id: String(item.id || ''),
        article: String(data.article || ''),
        brand: brand,
        name: String(data.name || ''),
        
        size: productSizes[0]?.size || '',
        sizes: productSizes.map((s: any) => s.size),
        
        allSizes: productSizes,
        
        category: category,
        gender: gender,
        price: basePrice,
        
        photo: mainPhoto,
        mainPhoto: mainPhoto,
        additionalPhotos: additionalPhotos,
        
        stockQuantity: productSizes.reduce((sum: number, s: any) => sum + (s.stockQuantity || 0), 0),
        availableStock: productSizes.reduce((sum: number, s: any) => sum + (s.availableQuantity || 0), 0),
        inStock: productSizes.some((s: any) => s.available),
        
        isActive: data.isActive !== false,
        slug: String(data.slug || ''),
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    });
    
    const processEndTime = Date.now();
    
    const result = {
      products,
      total: allStrapiProducts.length,
    };
    
    cachedProducts = result;
    cacheTimestamp = now;
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ API: Ошибка загрузки товаров:', error);
    
    if (cachedProducts) {
      return NextResponse.json({
        ...cachedProducts,
        cached: true,
        error: 'Данные могут быть устаревшими'
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Ошибка подключения к Strapi',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
        suggestion: 'Проверьте что Strapi запущен и содержит товары с размерами'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  cachedProducts = null;
  cacheTimestamp = 0;
  
  return NextResponse.json({ 
    message: 'Кэш очищен',
    success: true 
  });
}