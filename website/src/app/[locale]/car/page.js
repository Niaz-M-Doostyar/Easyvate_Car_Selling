'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002';

const getImageUrl = (path) => {
  if (!path) return '/img/cars/car-1.jpg';
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
};

export default function CarPage() {
  const { t } = useTranslation('common');
  const { locale } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Refs for nice‑select removal (no longer needed, but kept for potential future)
  const filterSidebarRef = useRef(null);
  const rightColumnRef = useRef(null);

  // Data state
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [draftFilters, setDraftFilters] = useState({
    brand: '',
    model: '',
    bodyStyle: '',
    year: '',
    transmission: '',
    mileage: '',
    fuelType: '',
    steering: '',
    color: '',
    minPrice: '',
    maxPrice: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(draftFilters);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Read filters from URL on initial load
  useEffect(() => {
    const q = searchParams.get('q');
    const brand = searchParams.get('brand');
    const model = searchParams.get('model');
    const bodyStyle = searchParams.get('bodyStyle');
    const year = searchParams.get('year');
    const transmission = searchParams.get('transmission');
    const mileage = searchParams.get('mileage');
    const fuelType = searchParams.get('fuelType');
    const steering = searchParams.get('steering');
    const color = searchParams.get('color');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const initialFilters = {
      brand: brand || '',
      model: model || '',
      bodyStyle: bodyStyle || '',
      year: year || '',
      transmission: transmission || '',
      mileage: mileage || '',
      fuelType: fuelType || '',
      steering: steering || '',
      color: color || '',
      minPrice: minPrice || '',
      maxPrice: maxPrice || '',
    };

    setDraftFilters(initialFilters);
    setAppliedFilters(initialFilters);
    if (q) setSearchTerm(q);
  }, [searchParams]);

  // Fetch vehicles
  useEffect(() => {
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => {
        setVehicles(data.vehicles || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch vehicles', err);
        setLoading(false);
      });
  }, []);

  // Helper: get unique values for dropdowns
  const getUniqueValues = (key) => {
    const values = vehicles.map(v => v[key]).filter(Boolean);
    return [...new Set(values)].sort();
  };

  // Filtered models based on selected brand
  const filteredModels = useMemo(() => {
    if (!draftFilters.brand) return getUniqueValues('model');
    return [...new Set(
      vehicles.filter(v => v.manufacturer === draftFilters.brand).map(v => v.model)
    )];
  }, [draftFilters.brand, vehicles]);

  // Filter logic
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        v.manufacturer?.toLowerCase().includes(searchLower) ||
        v.model?.toLowerCase().includes(searchLower) ||
        v.category?.toLowerCase().includes(searchLower);

      const matchesBrand = !appliedFilters.brand || v.manufacturer === appliedFilters.brand;
      const matchesModel = !appliedFilters.model || v.model === appliedFilters.model;
      const matchesBodyStyle = !appliedFilters.bodyStyle || v.category === appliedFilters.bodyStyle;
      const matchesYear = !appliedFilters.year || v.year === Number(appliedFilters.year);
      const matchesTransmission = !appliedFilters.transmission || v.transmission === appliedFilters.transmission;
      const matchesFuelType = !appliedFilters.fuelType || v.fuelType === appliedFilters.fuelType;
      const matchesSteering = !appliedFilters.steering || v.steering === appliedFilters.steering;
      const matchesColor = !appliedFilters.color || v.color === appliedFilters.color;

      const mileageVal = appliedFilters.mileage ? Number(appliedFilters.mileage) : null;
      const matchesMileage = mileageVal === null || (v.mileage && v.mileage <= mileageVal);

      const minPrice = appliedFilters.minPrice ? Number(appliedFilters.minPrice) : null;
      const maxPrice = appliedFilters.maxPrice ? Number(appliedFilters.maxPrice) : null;
      const matchesMinPrice = minPrice === null || (v.sellingPrice && v.sellingPrice >= minPrice);
      const matchesMaxPrice = maxPrice === null || (v.sellingPrice && v.sellingPrice <= maxPrice);

      return matchesSearch &&
        matchesBrand && matchesModel && matchesBodyStyle &&
        matchesYear && matchesTransmission && matchesFuelType &&
        matchesSteering && matchesColor && matchesMileage &&
        matchesMinPrice && matchesMaxPrice;
    });
  }, [vehicles, searchTerm, appliedFilters]);

  // Sorting
  const sortedVehicles = useMemo(() => {
    const sorted = [...filteredVehicles];
    if (sortBy === 'price-low-to-high') {
      sorted.sort((a, b) => (a.sellingPrice || 0) - (b.sellingPrice || 0));
    } else if (sortBy === 'price-high-to-low') {
      sorted.sort((a, b) => (b.sellingPrice || 0) - (a.sellingPrice || 0));
    }
    return sorted;
  }, [filteredVehicles, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedVehicles.length / itemsPerPage);
  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedVehicles.slice(start, start + itemsPerPage);
  }, [sortedVehicles, currentPage, itemsPerPage]);

  // Handlers
  const handleDraftChange = (e) => {
    const { name, value } = e.target;
    setDraftFilters(prev => {
      if (name === 'brand') {
        return { ...prev, brand: value, model: '' };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setCurrentPage(1);
    // Optionally update URL to reflect the applied filters (could be done, but not required)
  };

  const resetFilters = () => {
    const empty = {
      brand: '',
      model: '',
      bodyStyle: '',
      year: '',
      transmission: '',
      mileage: '',
      fuelType: '',
      steering: '',
      color: '',
      minPrice: '',
      maxPrice: '',
    };
    setDraftFilters(empty);
    setAppliedFilters(empty);
    setSearchTerm('');
    setCurrentPage(1);
    // Clear URL query parameters
    router.push(`/${locale}/car`);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="text-center py-5"><h3>{t('loading_cars') || 'Loading vehicles...'}</h3></div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      {/* Breadcrumb */}
      <div className="breadcrumb-option" style={{ backgroundImage: 'url(/img/breadcrumb-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <div className="breadcrumb__text">
                <h2>{t('car_listing') || 'Car Listing'}</h2>
                <div className="breadcrumb__links">
                  <Link href={`/${locale}`}><i className="fa fa-home"></i> {t('home')}</Link>
                  <span>{t('car_listing') || 'Car Listing'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Car Section */}
      <section className="car spad">
        <div className="container">
          <div className="row">
            {/* Sidebar Filters */}
            <div className="col-lg-3" ref={filterSidebarRef}>
              <div className="car__sidebar">
                <div className="car__search">
                  <h5>{t('car_search') || 'Car Search'}</h5>
                  <form onSubmit={(e) => e.preventDefault()}>
                    <input
                      type="text"
                      placeholder={t('search_placeholder') || "name, year, model..."}
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                    <button type="submit"><i className="fa fa-search"></i></button>
                  </form>
                </div>
                <div className="car__filter">
                  <h5>{t('car_filter') || 'Car Filter'}</h5>
                  <form onSubmit={(e) => e.preventDefault()}>
                    {/* Brand */}
                    <select name="brand" value={draftFilters.brand} onChange={handleDraftChange}>
                      <option value="">{t('brand') || 'Select Brand'}</option>
                      {getUniqueValues('manufacturer').map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    {/* Model */}
                    <select name="model" value={draftFilters.model} onChange={handleDraftChange}>
                      <option value="">{t('model') || 'Select Model'}</option>
                      {filteredModels.map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                    {/* Body Style (category) */}
                    <select name="bodyStyle" value={draftFilters.bodyStyle} onChange={handleDraftChange}>
                      <option value="">{t('body_style') || 'Body Style'}</option>
                      {getUniqueValues('category').map(bs => (
                        <option key={bs} value={bs}>{bs}</option>
                      ))}
                    </select>
                    {/* Year */}
                    <select name="year" value={draftFilters.year} onChange={handleDraftChange}>
                      <option value="">{t('year') || 'Year'}</option>
                      {getUniqueValues('year').map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    {/* Transmission */}
                    <select name="transmission" value={draftFilters.transmission} onChange={handleDraftChange}>
                      <option value="">{t('transmission') || 'Transmission'}</option>
                      {getUniqueValues('transmission').map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    {/* Mileage */}
                    <select name="mileage" value={draftFilters.mileage} onChange={handleDraftChange}>
                      <option value="">{t('mileage') || 'Mileage (up to)'}</option>
                      <option value="10000">10,000 km</option>
                      <option value="20000">30,000 km</option>
                      <option value="30000">70,000 km</option>
                      <option value="40000">150,000 km</option>
                      <option value="50000">200,000 km</option>
                    </select>
                    {/* Fuel Type */}
                    <select name="fuelType" value={draftFilters.fuelType} onChange={handleDraftChange}>
                      <option value="">{t('fuel_type') || 'Fuel Type'}</option>
                      {getUniqueValues('fuelType').map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                    {/* Steering */}
                    <select name="steering" value={draftFilters.steering} onChange={handleDraftChange}>
                      <option value="">{t('steering') || 'Steering'}</option>
                      {getUniqueValues('steering').map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {/* Colors */}
                    <select name="color" value={draftFilters.color} onChange={handleDraftChange}>
                      <option value="">{t('colors') || 'Colors'}</option>
                      {getUniqueValues('color').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {/* Price Range */}
                    <div className="filter-price">
                      <p>{t('price') || 'Price'}:</p>
                      <div className="row">
                        <div className="col-6">
                          <input
                            type="number"
                            name="minPrice"
                            placeholder={t('min_price') || 'Min'}
                            value={draftFilters.minPrice}
                            onChange={handleDraftChange}
                            className="form-control"
                            style={{ marginBottom: '5px' }}
                          />
                        </div>
                        <div className="col-6">
                          <input
                            type="number"
                            name="maxPrice"
                            placeholder={t('max_price') || 'Max'}
                            value={draftFilters.maxPrice}
                            onChange={handleDraftChange}
                            className="form-control"
                            style={{ marginBottom: '5px' }}
                          />
                        </div>
                      </div>
                    </div>
                    {/* Filter Buttons */}
                    <div className="car__filter__btn">
                      <button type="button" className="site-btn" onClick={applyFilters} style={{ marginBottom: '10px' }}>{t('apply_filter') || 'Apply Filter'}</button>
                      <button type="button" className="site-btn" onClick={resetFilters}>{t('reset_filter') || 'Reset Filter'}</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="col-lg-9" ref={rightColumnRef}>
              <div className="car__filter__option">
                <div className="row">
                  <div className="col-lg-6 col-md-6">
                    <div className="car__filter__option__item">
                      <h6>{t('show_on_page') || 'Show On Page'}</h6>
                      <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                        <option value="9">9 {t('cars') || 'Cars'}</option>
                        <option value="15">15 {t('cars') || 'Cars'}</option>
                        <option value="20">21 {t('cars') || 'Cars'}</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-6">
                    <div className="car__filter__option__item car__filter__option__item--right">
                      <h6>{t('sort_by') || 'Sort By'}</h6>
                      <select value={sortBy} onChange={handleSortChange}>
                        <option value="">{t('default') || 'Default'}</option>
                        <option value="price-low-to-high">{t('price_low_to_high') || 'Price: Low to High'}</option>
                        <option value="price-high-to-low">{t('price_high_to_low') || 'Price: High to Low'}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Car Grid */}
              <div className="row">
                {paginatedVehicles.length > 0 ? (
                  paginatedVehicles.map(vehicle => {
                    const title = `${vehicle.manufacturer} ${vehicle.model} ${vehicle.year}`;
                    const images = vehicle.allImages || [];
                    return (
                      <div key={vehicle.id} className="col-lg-4 col-md-4">
                        <div className="car__item">
                          <div className="car__item__pic__slider">
                            <Swiper
                              key={vehicle.id}
                              modules={[Navigation, Pagination]}
                              spaceBetween={0}
                              slidesPerView={1}
                              navigation
                              pagination={{ clickable: true }}
                              loop={images.length > 1}
                              className="car-swiper"
                            >
                              {images.length > 0 ? (
                                images.map((imgPath, idx) => (
                                  <SwiperSlide key={idx}>
                                    <img src={getImageUrl(imgPath)} alt="" />
                                  </SwiperSlide>
                                ))
                              ) : (
                                <SwiperSlide>
                                  <img src="/img/cars/car-1.jpg" alt="" />
                                </SwiperSlide>
                              )}
                            </Swiper>
                          </div>
                          <div className="car__item__text">
                            <div className="car__item__text__inner">
                              <div className="label-date">{vehicle.year}</div>
                              <h5><Link href={`/${locale}/carDetails?id=${vehicle.id}`}>{title}</Link></h5>
                              <ul>
                                <li><span>{vehicle.mileage?.toLocaleString() || 'N/A'}</span> km</li>
                                <li>{vehicle.transmission || 'N/A'}</li>
                                <li><span>{vehicle.engineType || 'N/A'}</span> cc</li>
                              </ul>
                            </div>
                            <div className="car__item__price" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                              <span className="car-option">؋ {vehicle.sellingPrice?.toLocaleString() || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-12 text-center py-5"><h4>{t('no_cars_match') || 'No cars match your criteria.'}</h4></div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination__option">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <a
                      key={page}
                      href="#"
                      onClick={(e) => { e.preventDefault(); setCurrentPage(page); }}
                      className={currentPage === page ? 'active' : ''}
                    >
                      {page}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}