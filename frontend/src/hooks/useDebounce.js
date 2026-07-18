import { useEffect, useState } from 'react';

/** Debounces a rapidly-changing value (e.g. search input) by `delay` ms. */
export function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);

  return debounced;
}

export default useDebounce;
