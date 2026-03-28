'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function RouteChangeHandler() {
  const pathname = usePathname();
  const timeoutRef = useRef();

  useEffect(() => {
    const initTemplate = () => {
      if (typeof window !== 'undefined' && window.initTemplate) {
        window.initTemplate();
        console.log('Template re-initialised for route:', pathname);
      } else {
        // Retry after a short delay
        timeoutRef.current = setTimeout(initTemplate, 50);
      }
    };

    // Wait a bit for DOM to settle
    timeoutRef.current = setTimeout(initTemplate, 50);

    return () => clearTimeout(timeoutRef.current);
  }, [pathname]);

  return null;
}