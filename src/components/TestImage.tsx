'use client'
const TestImage = () => {
  return (
    <section className="w-full h-[500px] bg-gray-200 border-2 border-red-500">
      <h2 className="text-center py-4 text-xl">Тест изображения</h2>
      
      <div className="w-full h-[400px] relative bg-blue-200">
        <img
          src="/banners/Banner1-1.png"
          alt="Тест баннера"
          className="w-full h-full object-cover"
          onError={(e) => {
            console.log('ОШИБКА загрузки:', e);
            e.currentTarget.style.backgroundColor = 'red';
            e.currentTarget.style.color = 'white';
            e.currentTarget.innerHTML = 'ОШИБКА ЗАГРУЗКИ';
          }}
          onLoad={() => {
            console.log('УСПЕШНО загружено: /banners/Banner1-1.png');
          }}
        />
      </div>
    </section>
  );
};

export default TestImage;