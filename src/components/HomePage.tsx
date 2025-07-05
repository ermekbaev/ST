import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import CategorySection from './CategorySection';
import HeroSection from './HeroSection';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Функция для получения данных из Google Sheets
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // Обновление каждые 5-10 минут
    const interval = setInterval(fetchProducts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Группировка товаров по категориям
  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category || 'Прочее';
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>Ошибка загрузки: {error}</p>
        <button 
          onClick={fetchProducts}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Герой секция с баннером */}
      <HeroSection />
      
      {/* Основной контент */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Секция "ОБУВЬ" */}
        <CategorySection 
          title="ОБУВЬ" 
          products={groupedProducts['Обувь'] || []}
          viewAllLink="/catalog?category=shoes"
        />

        {/* Секция "ОДЕЖДА" */}
        <CategorySection 
          title="ОДЕЖДА" 
          products={groupedProducts['Одежда'] || []}
          viewAllLink="/catalog?category=clothing"
        />

        {/* Секция "АКСЕССУАРЫ" */}
        <CategorySection 
          title="АКСЕССУАРЫ" 
          products={groupedProducts['Аксессуары'] || []}
          viewAllLink="/catalog?category=accessories"
        />

        {/* Секция "КОЛЛЕКЦИИ" */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">КОЛЛЕКЦИИ</h2>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              все коллекции →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-full h-32 bg-gray-300 rounded mb-4 flex items-center justify-center">
                  <span className="text-gray-600">png?</span>
                </div>
                <h3 className="font-semibold text-gray-900">коллекция</h3>
                <p className="text-sm text-gray-600">название</p>
              </div>
            ))}
          </div>
        </section>

        {/* Секция индивидуального заказа */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">В КАТАЛОГЕ НЕТ ИНТЕРЕСУЮЩЕЙ МОДЕЛИ?</h2>
          <p className="text-xl mb-2">ВЫ ВСЕГДА МОЖЕТЕ ОФОРМИТЬ</p>
          <p className="text-3xl font-bold mb-6">ИНДИВИДУАЛЬНЫЙ ЗАКАЗ</p>
          <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded hover:bg-white hover:text-gray-900 transition-colors font-semibold">
            ОФОРМИТЬ ИНДИВИДУАЛЬНЫЙ ЗАКАЗ
          </button>
        </section>
      </div>
    </div>
  );
};

export default HomePage;