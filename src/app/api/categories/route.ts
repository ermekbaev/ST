// app/api/categories/route.ts  
import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

export async function GET() {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (STRAPI_API_TOKEN) {
      headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
    }

    const response = await fetch(`${STRAPI_URL}/api/categories?sort=name:asc`, {
      headers,
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    const categories = data.data?.map((item: any) => ({
      id: item.id,
      name: item.attributes.name,
      slug: item.attributes.slug
    })) || [];

    return NextResponse.json({ categories });

  } catch (error) {
    console.error('❌ API: Ошибка загрузки категорий:', error);
    return NextResponse.json(
      { error: 'Ошибка загрузки категорий' },
      { status: 500 }
    );
  }
}