'use client';
import { useState, useEffect } from 'react';
import { fetchCarBrands } from '@/services/carApi';

export default function SearchForm() {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    fetchCarBrands().then(setBrands).catch(console.error);
  }, []);

  return (
    <select className="nice-select">
      <option>Select Brand</option>
      {brands.map(b => <option key={b.id}>{b.name}</option>)}
    </select>
  );
}