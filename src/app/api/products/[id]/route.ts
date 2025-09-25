import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || '';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let strapiUrl: string;
    
    if (!isNaN(Number(id))) {
      strapiUrl = `${STRAPI_URL}/api/products/${id}?populate=*`;
    } else if (id.length > 10 && id.match(/^[a-z0-9]+$/)) {
      strapiUrl = `${STRAPI_URL}/api/products?filters[documentId][$eq]=${id}&populate=*`;
    } else {
      strapiUrl = `${STRAPI_URL}/api/products?filters[slug][$eq]=${id}&populate=*`;
    }
    
    const strapiResponse = await fetch(strapiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });


    if (!strapiResponse.ok) {
      if (strapiResponse.status === 404) {
        return NextResponse.json(
          { error: 'Товар не найден' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Ошибка загрузки товара из Strapi' },
        { status: strapiResponse.status }
      );
    }

    const strapiData = await strapiResponse.json();
    
    let item;
    if (strapiData.data) {
      if (Array.isArray(strapiData.data)) {
        if (strapiData.data.length === 0) {
          return NextResponse.json(
            { error: 'Товар не найден' },
            { status: 404 }
          );
        }
        item = strapiData.data[0];
      } else {
        item = strapiData.data;
      }
    } else {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }

    let allSizes = [];
    
    if (item.sizes && Array.isArray(item.sizes)) {
      allSizes = item.sizes
        .filter((sizeItem: any) => {
          const hasPrice = sizeItem.price !== null && sizeItem.price !== undefined;
          const hasStock = sizeItem.stockQuantity !== null && sizeItem.stockQuantity !== undefined;
          return hasPrice && hasStock;
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
            availableQuantity: availableQty,
            article: sizeItem.article || ''
          };
        });
      
      allSizes.sort((a: any, b: any) => {
        const aNum = parseFloat(a.size.replace(/[^\d.]/g, ''));
        const bNum = parseFloat(b.size.replace(/[^\d.]/g, ''));
        return aNum - bNum;
      });
      
    }

    const brand = item.brand?.name ? String(item.brand.name) : 'Nike';
    const category = item.category?.name ? String(item.category.name) : 'Кроссовки';
    const gender = item.gender?.name ? String(item.gender.name) : 'Унисекс';

    const mainPhoto = item.mainPhoto || '/images/placeholder.jpg';
    let additionalPhotos = [];
    
    if (item.addTotalPhotos && Array.isArray(item.addTotalPhotos)) {
      additionalPhotos = item.addTotalPhotos;
    }

    const sizesForFrontend = allSizes;

    if (sizesForFrontend.length === 0) {
      return; 
    }

    const product = {
      id: item.id?.toString() || '',
      article: item.article || '',
      brand: brand,
      name: item.name || '',
      
      size: sizesForFrontend[0]?.size || '',
      sizes: sizesForFrontend.map((s: any) => s.size),
      
      allSizes: allSizes, 
      
      category: category,
      gender: gender,
      price: allSizes.length > 0 ? Math.min(...allSizes.map((s: any) => s.price)) : 0,
      
      photo: mainPhoto,
      mainPhoto: mainPhoto,
      additionalPhotos: additionalPhotos,
      
      stockQuantity: allSizes.reduce((sum: number, s: any) => sum + (s.stockQuantity || 0), 0),
      availableStock: allSizes.reduce((sum: number, s: any) => sum + (s.availableQuantity || 0), 0),
      inStock: allSizes.some((s: any) => s.available),
      
      isActive: item.isActive !== false,
      slug: item.slug || item.documentId || '',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      
      description: `${brand} ${item.name} - ${category}`,
      deliveryInfo: 'Доставка 7-14 дня по России'
    };
    
    return NextResponse.json({ product });

} catch (error) {
  console.error(`❌ API: Ошибка загрузки товара:`, error);
  return NextResponse.json(
    { error: 'Внутренняя ошибка сервера' },
    { status: 500 }
  );
}
}