import { useState, useEffect } from 'react';

// Hook para aplicar "debounce" a un valor (ej. texto de búsqueda).
// Devuelve el valor solo después de que el usuario deje de escribir por cierto tiempo.
export default function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Inicia un temporizador que actualiza el valor después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Si el usuario sigue escribiendo, se limpia el temporizador anterior
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
