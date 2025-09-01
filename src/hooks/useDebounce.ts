import { useState, useEffect } from 'react';


export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}


export function useDebouncedSearch(initialValue: string = '', delay: number = 300) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedValue = useDebounce(inputValue, delay);

  useEffect(() => {
    if (inputValue !== debouncedValue) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [inputValue, debouncedValue]);

  const clearSearch = () => {
    setInputValue('');
    setIsSearching(false);
  };

  return {
    inputValue,
    debouncedValue,
    isSearching,
    setInputValue,
    clearSearch
  };
}