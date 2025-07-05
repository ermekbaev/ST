import ProductCard from './ProductCard';

const CategorySection = ({ title, products, viewAllLink }) => {
  // Показываем только первые 4 товара для главной страницы
  const displayProducts = products.slice(0, 4);

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <a 
          href={viewAllLink}
          className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          все товары →
        </a>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayProducts.map((product, index) => (
          <ProductCard key={product.id || index} product={product} />
        ))}
      </div>
      
      {/* Если товаров нет, показываем заглушки */}
      {displayProducts.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-gray-100 rounded-lg p-4 animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CategorySection;