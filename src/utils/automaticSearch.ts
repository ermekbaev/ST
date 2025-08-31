// =============================================
// МОДУЛЬНАЯ ВЕРСИЯ С JSON СЛОВАРЯМИ
// src/utils/automaticSearch.ts
// =============================================

import brandsDictionary from '@/data/searchDictionaries/brands.json';
import categoriesDictionary from '@/data/searchDictionaries/categories.json';

interface Product {
  id?: string;
  article: string;
  brand: string;
  name: string;
  size: string;
  category: string;
  gender: string;
  price: number;
  photo: string;
  sizes?: string[];
}

interface SearchResult {
  product: Product;
  score: number;
  matchType: string[];
}

interface SearchStats {
  query: string;
  totalProducts: number;
  foundProducts: number;
  executionTime: number;
  topMatches: Array<{name: string, brand: string, score: number}>;
}

// =============================================
// УТИЛИТЫ ДЛЯ РАБОТЫ С СЛОВАРЯМИ
// =============================================
class DictionaryService {
  private flatBrandsDictionary: Record<string, string[]> = {};
  private flatCategoriesDictionary: Record<string, string[]> = {};

  constructor() {
    this.initializeDictionaries();
  }

  private initializeDictionaries() {
    // Объединяем все бренды в один словарь
    const allBrands = {
      ...brandsDictionary.sportsBrands,
      ...brandsDictionary.luxuryBrands,
      ...brandsDictionary.streetwearBrands,
      ...brandsDictionary.otherBrands,
      ...brandsDictionary.reverseMappings
    };

    this.flatBrandsDictionary = allBrands;

    // Объединяем все категории
    const allCategories = {
      ...categoriesDictionary.footwear,
      ...categoriesDictionary.clothing,
      ...categoriesDictionary.accessories,
      ...categoriesDictionary.collectibles,
      ...categoriesDictionary.seasonal,
      ...categoriesDictionary.genderMapping,
      ...categoriesDictionary.reverseMappings
    };

    this.flatCategoriesDictionary = allCategories;

    console.log('📚 Словари загружены:', {
      brands: Object.keys(this.flatBrandsDictionary).length,
      categories: Object.keys(this.flatCategoriesDictionary).length
    });
  }

  getBrandTranslations(brand: string): string[] {
    return this.flatBrandsDictionary[brand.toLowerCase()] || [];
  }

  getCategoryTranslations(category: string): string[] {
    return this.flatCategoriesDictionary[category.toLowerCase()] || [];
  }

  // Получить все возможные варианты для поискового термина
  getAllVariants(term: string): string[] {
    const normalized = this.normalizeText(term);
    const variants = new Set([normalized]);

    // Добавляем переводы брендов
    const brandTranslations = this.getBrandTranslations(normalized);
    brandTranslations.forEach(t => variants.add(t));

    // Добавляем переводы категорий
    const categoryTranslations = this.getCategoryTranslations(normalized);
    categoryTranslations.forEach(t => variants.add(t));

    return Array.from(variants);
  }

  normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/ё/g, 'е')
      .replace(/[^\wа-яё]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

// =============================================
// КЛАСС ДЛЯ ПОИСКА
// =============================================
class SearchService {
  private dictionary: DictionaryService;

  constructor() {
    this.dictionary = new DictionaryService();
  }

  // Главная функция поиска
  search(products: Product[], searchQuery: string): Product[] {
    if (!searchQuery.trim()) return products;

    const startTime = performance.now();
    console.log('🔍 Модульный поиск для:', searchQuery);

    const results = this.performSearch(products, searchQuery);
    const executionTime = performance.now() - startTime;

    // Статистика
    const stats: SearchStats = {
      query: searchQuery,
      totalProducts: products.length,
      foundProducts: results.length,
      executionTime: Math.round(executionTime),
      topMatches: results.slice(0, 3).map(r => ({
        name: r.product.name,
        brand: r.product.brand,
        score: r.score
      }))
    };

    this.logSearchStats(stats);
    return results.map(r => r.product);
  }

  private performSearch(products: Product[], query: string): SearchResult[] {
    const normalizedQuery = this.dictionary.normalizeText(query);
    const queryWords = normalizedQuery.split(' ').filter(w => w.length > 1);
    
    const results: SearchResult[] = [];

    products.forEach(product => {
      const match = this.calculateProductScore(product, queryWords, query);
      
      if (match.score > 0) {
        results.push({
          product,
          score: match.score,
          matchType: match.reasons
        });
      }
    });

    return results.sort((a, b) => b.score - a.score);
  }

  private calculateProductScore(product: Product, queryWords: string[], originalQuery: string) {
    let totalScore = 0;
    const reasons: string[] = [];

    const normalizedProduct = {
      name: this.dictionary.normalizeText(product.name),
      brand: this.dictionary.normalizeText(product.brand),
      category: this.dictionary.normalizeText(product.category),
      gender: this.dictionary.normalizeText(product.gender)
    };

    // 1. ПОИСК ПО БРЕНДАМ (высокий приоритет)
    for (const word of queryWords) {
      // Прямое совпадение
      if (normalizedProduct.brand.includes(word)) {
        totalScore += 30;
        reasons.push(`бренд: ${word}`);
        continue;
      }

      // Через словарь переводов
      const brandVariants = this.dictionary.getAllVariants(word);
      for (const variant of brandVariants) {
        if (normalizedProduct.brand.includes(variant) && variant !== word) {
          totalScore += 35;
          reasons.push(`бренд (перевод): ${word} → ${variant}`);
          break;
        }
      }
    }

    // 2. ПОИСК ПО КАТЕГОРИЯМ
    for (const word of queryWords) {
      // Прямое совпадение
      if (normalizedProduct.category.includes(word)) {
        totalScore += 20;
        reasons.push(`категория: ${word}`);
        continue;
      }

      // Через словарь переводов
      const categoryVariants = this.dictionary.getAllVariants(word);
      for (const variant of categoryVariants) {
        if (normalizedProduct.category.includes(variant) && variant !== word) {
          totalScore += 25;
          reasons.push(`категория (перевод): ${word} → ${variant}`);
          break;
        }
      }
    }

    // 3. ПОИСК ПО НАЗВАНИЮ
    for (const word of queryWords) {
      if (normalizedProduct.name.includes(word)) {
        totalScore += 15;
        reasons.push(`название: ${word}`);
      }
    }

    // 4. СПЕЦИАЛЬНЫЕ КОМБИНАЦИИ
    totalScore += this.getSpecialBonuses(originalQuery, product, reasons);

    return { score: totalScore, reasons };
  }

  private getSpecialBonuses(query: string, product: Product, reasons: string[]): number {
    let bonus = 0;
    const normalizedQuery = this.dictionary.normalizeText(query);
    const normalizedBrand = this.dictionary.normalizeText(product.brand);

    // Зимняя обувь = UGG + Timberland автоматически
    if (normalizedQuery.includes('зимняя обувь') || 
        (normalizedQuery.includes('зимн') && normalizedQuery.includes('обув'))) {
      
      const winterBrands = ['ugg', 'timberland', 'sorel'];
      for (const brand of winterBrands) {
        if (normalizedBrand.includes(brand)) {
          bonus += 40;
          reasons.push(`зимний бренд: ${brand}`);
          break;
        }
      }
    }

    // УГГи = UGG товары
    if (normalizedQuery.includes('угги') || normalizedQuery.includes('угг')) {
      if (normalizedBrand.includes('ugg')) {
        bonus += 40;
        reasons.push('UGG товар');
      }
    }

    // Спортивная обувь = известные спорт-бренды
    if ((normalizedQuery.includes('спорт') && normalizedQuery.includes('обув')) ||
        normalizedQuery.includes('кроссовки')) {
      
      const sportBrands = ['nike', 'adidas', 'puma', 'reebok'];
      for (const brand of sportBrands) {
        if (normalizedBrand.includes(brand)) {
          bonus += 30;
          reasons.push(`спорт-бренд: ${brand}`);
          break;
        }
      }
    }

    return bonus;
  }

  private logSearchStats(stats: SearchStats) {
    console.log(`✅ Поиск завершен: ${stats.foundProducts}/${stats.totalProducts} за ${stats.executionTime}мс`);
    
    if (stats.topMatches.length > 0) {
      console.log('🔥 Топ результаты:');
      stats.topMatches.forEach((match, i) => {
        console.log(`  ${i+1}. "${match.name}" (${match.brand}) - ${match.score} баллов`);
      });
    }
  }
}

// =============================================
// ЭКСПОРТИРУЕМЫЕ ФУНКЦИИ
// =============================================
const searchService = new SearchService();

export const fullyAutomaticSearch = (products: Product[], searchQuery: string): Product[] => {
  return searchService.search(products, searchQuery);
};

// Простая версия для быстрого поиска
export const simpleSearch = (products: Product[], searchQuery: string): Product[] => {
  if (!searchQuery.trim()) return products;
  
  const dictionary = new DictionaryService();
  const normalizedQuery = dictionary.normalizeText(searchQuery);
  
  return products.filter(product => {
    const normalizedProduct = {
      name: dictionary.normalizeText(product.name),
      brand: dictionary.normalizeText(product.brand),
      category: dictionary.normalizeText(product.category)
    };

    // Простой поиск с переводами
    const allVariants = dictionary.getAllVariants(normalizedQuery);
    
    return allVariants.some(variant => 
      normalizedProduct.name.includes(variant) ||
      normalizedProduct.brand.includes(variant) ||
      normalizedProduct.category.includes(variant)
    );
  });
};

// Функция для добавления новых переводов (для админки в будущем)
export const addBrandTranslation = (brand: string, translations: string[]) => {
  console.log(`🔧 Добавление перевода для бренда: ${brand} → ${translations.join(', ')}`);
  // В будущем можно реализовать сохранение в JSON файл
};

export default fullyAutomaticSearch;