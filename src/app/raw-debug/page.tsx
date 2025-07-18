// Создайте файл src/app/raw-debug/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function RawCSVDebugPage() {
  const [rawCSV, setRawCSV] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('TS-1011055');

  useEffect(() => {
    const fetchRawCSV = async () => {
      try {
        setLoading(true);
        
        const SHEET_ID = '1naTkxDrQFfj_d7Q2U46GOj24hSqTAqrt_Yz1ImaKyVc';
        const response = await fetch(
          `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`,
          { cache: 'no-store' }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const csvText = await response.text();
        setRawCSV(csvText);
        
      } catch (error) {
        console.error('Ошибка загрузки CSV:', error);
        setError(error instanceof Error ? error.message : 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchRawCSV();
  }, []);

  // Ищем строки содержащие поисковый термин
  const findRelevantLines = (csv: string, term: string): string[] => {
    const lines = csv.split('\n');
    const relevantLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes(term)) {
        // Добавляем предыдущую строку для контекста
        if (i > 0) {
          relevantLines.push(`[${i}] ${lines[i - 1]}`);
        }
        // Добавляем саму строку
        relevantLines.push(`[${i + 1}] ${line}`);
        // Добавляем следующую строку для контекста
        if (i < lines.length - 1) {
          relevantLines.push(`[${i + 2}] ${lines[i + 1]}`);
        }
        relevantLines.push('---');
      }
    }
    
    return relevantLines;
  };

  // Анализируем количество запятых в строках
  const analyzeCSVStructure = (csv: string): { line: number; commas: number; content: string }[] => {
    const lines = csv.split('\n');
    const analysis: { line: number; commas: number; content: string }[] = [];
    
    for (let i = 0; i < Math.min(lines.length, 20); i++) {
      const line = lines[i];
      const commas = (line.match(/,/g) || []).length;
      analysis.push({
        line: i + 1,
        commas,
        content: line.substring(0, 100) + '...'
      });
    }
    
    return analysis;
  };

  // Ищем строки с URL изображений
  const findLinesWithImages = (csv: string): string[] => {
    const lines = csv.split('\n');
    const imageLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('cdn-img.thepoizon.ru') || line.includes('https://')) {
        imageLines.push(`[Строка ${i + 1}] ${line}`);
      }
    }
    
    return imageLines.slice(0, 10); // Показываем первые 10
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-900">Загрузка сырых CSV данных...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Ошибка: {error}</div>
      </div>
    );
  }

  const relevantLines = findRelevantLines(rawCSV, searchTerm);
  const structureAnalysis = analyzeCSVStructure(rawCSV);
  const imageLinesAnalysis = findLinesWithImages(rawCSV);

  return (
    <div className="min-h-screen bg-gray-50 p-4 text-black">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">
          Анализ сырых CSV данных
        </h1>
        
        {/* Поиск */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Поиск в CSV (артикул или название):
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="TS-1011055"
          />
        </div>

        {/* Статистика CSV */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Статистика CSV:</h2>
          <p className="text-gray-800">Размер файла: {rawCSV.length.toLocaleString()} символов</p>
          <p className="text-gray-800">Всего строк: {rawCSV.split('\n').length.toLocaleString()}</p>
          <p className="text-gray-800">Строк с изображениями: {imageLinesAnalysis.length}</p>
        </div>

        {/* Анализ структуры (первые 20 строк) */}
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Анализ структуры (первые 20 строк):</h2>
          <div className="text-xs space-y-1">
            {structureAnalysis.map((item, i) => (
              <div key={i} className={`p-2 rounded ${
                item.commas < 8 ? 'bg-red-100' : item.commas > 12 ? 'bg-orange-100' : 'bg-green-100'
              }`}>
                <strong>Строка {item.line}:</strong> {item.commas} запятых - {item.content}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            🔴 Красное: менее 8 запятых (неполные данные)
            🟠 Оранжевое: более 12 запятых (лишние данные)
            🟢 Зеленое: 8-12 запятых (нормально)
          </p>
        </div>

        {/* Поиск конкретного товара */}
        {relevantLines.length > 0 && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-gray-900">
              Найдено строк с "{searchTerm}": {relevantLines.length}
            </h2>
            <div className="text-xs space-y-2 max-h-96 overflow-y-auto">
              {relevantLines.map((line, i) => (
                <div key={i} className="p-2 bg-white rounded border break-all">
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Строки с изображениями */}
        <div className="mb-6 p-4 bg-purple-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">
            Строки с изображениями (первые 10):
          </h2>
          <div className="text-xs space-y-2 max-h-96 overflow-y-auto">
            {imageLinesAnalysis.map((line, i) => (
              <div key={i} className="p-2 bg-white rounded border break-all">
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* Сырой CSV (первые 50 строк) */}
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">
            Сырой CSV (первые 50 строк):
          </h2>
          <pre className="text-xs bg-white p-4 rounded border max-h-96 overflow-auto whitespace-pre-wrap">
            {rawCSV.split('\n').slice(0, 50).join('\n')}
          </pre>
        </div>
      </div>
    </div>
  );
}