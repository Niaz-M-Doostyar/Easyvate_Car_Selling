'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002';

const getImageUrl = (path) => {
  if (!path) return '/img/cars/car-1.jpg';
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
};

const renderStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<i key={`star-${i}`} className="fa fa-star"></i>);
  }
  if (hasHalf) {
    stars.push(<i key="half" className="fa fa-star-half-o"></i>);
  }
  return stars;
};

export default function HomePage() {
  const { t } = useTranslation('common');
  const { locale } = useParams();
  const router = useRouter();

  const [cars, setCars] = useState({ all: [], container: [], licensed: [] });
  const [carouselSlides, setCarouselSlides] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [chooseVideo, setChooseVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef(null);

  // Filter state (copied from car page)
  const [vehiclesForFilters, setVehiclesForFilters] = useState([]);
  const [draftFilters, setDraftFilters] = useState({
    brand: '', model: '', bodyStyle: '', year: '', transmission: '',
    mileage: '', fuelType: '', steering: '', color: '', minPrice: '', maxPrice: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch vehicles for filter dropdowns
  useEffect(() => {
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => setVehiclesForFilters(data.vehicles || []))
      .catch(err => console.error('Failed to fetch vehicles for filters', err));
  }, []);

  const getUniqueValues = (key) => {
    const values = vehiclesForFilters.map(v => v[key]).filter(Boolean);
    return [...new Set(values)].sort();
  };

  const filteredModels = (() => {
    if (!draftFilters.brand) return getUniqueValues('model');
    return [...new Set(
      vehiclesForFilters.filter(v => v.manufacturer === draftFilters.brand).map(v => v.model)
    )];
  })();

  const handleDraftChange = (e) => {
    const { name, value } = e.target;
    setDraftFilters(prev => {
      if (name === 'brand') return { ...prev, brand: value, model: '' };
      return { ...prev, [name]: value };
    });
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const resetFilters = () => {
    setDraftFilters({
      brand: '', model: '', bodyStyle: '', year: '', transmission: '',
      mileage: '', fuelType: '', steering: '', color: '', minPrice: '', maxPrice: '',
    });
    setSearchTerm('');
  };

  const searchCars = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    Object.entries(draftFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.push(`/${locale}/car?${params.toString()}`);
  };

  // Fetch home page specific data
  useEffect(() => {
    fetch(`/api/home-cars?locale=${locale}`)
      .then(res => res.json())
      .then(data => {
        const fetchedCars = data?.cars || { all: [], container: [], licensed: [] };
        setCars(fetchedCars);
        setCarouselSlides(data?.carousel || []);
        setTestimonials(data?.testimonials || []);
        setChooseVideo(data?.chooseVideo || null);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch home data', err);
        setCars({ all: [], container: [], licensed: [] });
        setCarouselSlides([]);
        setTestimonials([]);
        setChooseVideo(null);
        setLoading(false);
      });
  }, [locale]);

  const currentCars = activeFilter === 'all'
    ? (cars?.all || [])
    : activeFilter === 'container'
      ? (cars?.container || [])
      : (cars?.licensed || []);

  return (
    <>
      <Header />

      {/* Hero Section – Overlay filter on desktop, stack on mobile */}
      <section className="hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          loop={carouselSlides.length > 1}           // loop only if enough slides
          autoplay={{ delay: 5000, disableOnInteraction: false }} // keep playing after user click
          navigation
          pagination={{ clickable: true }}
          className="hero-carousel"
        >
          {carouselSlides.map((slide, index) => {
            const slideImageUrl = getImageUrl(slide.image);
            return (
              <SwiperSlide key={slide.id || index}>
                <div
                  className="hero__slide"
                  style={{
                    backgroundImage: `url(${slideImageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '700px',
                    position: 'relative',
                  }}
                >
                  <img
                    src={slideImageUrl}
                    alt={slide.title || `slide-${index}`}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: 0,
                    }}
                  />

                <div className="container h-100">
                  <div className="row h-100 align-items-center">
                    <div className="col-lg-7">
                      <div className="hero__text">
                        <div className="hero__text__title">
                          <h2>{slide.title}</h2>
                        </div>
                        <div className="hero__text__price">
                          <div className="car-model">Model {slide.model}</div>
                          <h2>Price: ؋{slide.price}</h2>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Filter Panel – overlaid on desktop */}
        <div className="hero__tab" style={{
          position: 'absolute',
          top: '60%',
          [locale !== 'en' ? 'left' : 'right']: '5%',
          transform: 'translateY(-50%)',
          width: '350px',
          background: '#F6F9FC',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
          zIndex: 10,
        }}>
          <div className="car__filter">
            <h5 style={{ marginBottom: '15px' }}>{t('car_filter') || 'Car Filter'}</h5>
            <form onSubmit={(e) => e.preventDefault()}>
              {/* Search input – full width */}
              <div className="car__search" style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder={t('search_placeholder') || "Search cars..."}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>

              {/* Two‑column grid for dropdowns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <select name="brand" value={draftFilters.brand} onChange={handleDraftChange}>
                  <option value="">{t('brand') || 'Select Brand'}</option>
                  {getUniqueValues('manufacturer').map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <select name="model" value={draftFilters.model} onChange={handleDraftChange}>
                  <option value="">{t('model') || 'Select Model'}</option>
                  {filteredModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
                <select name="year" value={draftFilters.year} onChange={handleDraftChange}>
                  <option value="">{t('year') || 'Year'}</option>
                  {getUniqueValues('year').map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <select name="mileage" value={draftFilters.mileage} onChange={handleDraftChange}>
                  <option value="">{t('mileage') || 'Mileage (up to)'}</option>
                  <option value="10000">10,000 km</option>
                  <option value="20000">30,000 km</option>
                  <option value="30000">70,000 km</option>
                  <option value="40000">150,000 km</option>
                  <option value="50000">200,000 km</option>
                </select>
                <select name="steering" value={draftFilters.steering} onChange={handleDraftChange}>
                  <option value="">{t('steering') || 'Steering'}</option>
                  {getUniqueValues('steering').map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select name="color" value={draftFilters.color} onChange={handleDraftChange}>
                  <option value="">{t('colors') || 'Colors'}</option>
                  {getUniqueValues('color').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Price Range (already two‑column) */}
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

              {/* Buttons */}
              <div className="car__filter__btn">
                <button type="button" className="site-btn" onClick={searchCars}>
                  {t('search') || 'Searching'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Responsive CSS: on smaller screens, remove absolute positioning and make filter stack below */}
        <style jsx>{`
          @media (max-width: 991px) {
            .hero-carousel {
              height: 500px;
              }
              .hero__tab {
                position: relative;
                top: auto;
                right: auto;
                left: auto;
                transform: none;
                width: calc(100% - 40px);
                max-width: 400px;
                margin: 20px auto;
              }
            }
          @media (max-width: 576px) {
            .hero-carousel {
              height: 400px;
              }
              .hero__tab .filter-grid {
                grid-template-columns: 1fr !important;
              }
            }
        `}</style>
      </section>

      {/* All other sections remain unchanged */}
      <section className="services spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title">
                <span>{t('service')}</span>
                <h2>{t('offer')}</h2>
                <p>{t('provide')}</p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="services__item">
                <i className="fa fa-car"></i>
                <h5>{t('container')}</h5>
                <p>{t('containerDesc')}</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="services__item">
                <i className="fa fa-key"></i>
                <h5>{t('document')}</h5>
                <p>{t('documentDesc')}</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="services__item">
                <i className="fa fa-exchange"></i>
                <h5>{t('exchange')}</h5>
                <p>{t('exchangeDesc')}</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="services__item">
                <i className="fa fa-handshake-o"></i>
                <h5>{t('buy')}</h5>
                <p>{t('buyDes')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="chooseus spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-5">
              <div className="chooseus__text">
                <div className="section-title">
                  <h2>{t('choose')}</h2>
                  <p>{t('chooseDesc')}</p>
                </div>
                <ul>
                  <li><i className="fa fa-check-circle"></i> {t('trusted')}</li>
                  <li><i className="fa fa-check-circle"></i> {t('wide')}</li>
                  <li><i className="fa fa-check-circle"></i> {t('fair')}</li>
                  <li><i className="fa fa-check-circle"></i> {t('easyExchange')}</li>
                </ul>
                <a href="#" className="primary-btn">{t('about')}</a>
              </div>
            </div>
          </div>
        </div>
        <div className="chooseus__video">
          {chooseVideo ? (
            <>
              <video
                ref={videoRef}
                poster="/img/chooseus-video.png"
                style={{ width: '100%', height: '100%', objectFit: 'inherit', cursor: 'pointer' }}
                controls
                preload="auto"
                loop={false}
                onPlaying={() => setVideoPlaying(true)}
                onPause={() => setVideoPlaying(false)}
                onEnded={() => {
                  setVideoPlaying(false);
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    videoRef.current.pause();
                    videoRef.current.load();
                  }
                }}
                onError={(e) => console.error('Video error:', e.target.error)}
              >
                <source src={getImageUrl(chooseVideo.videoPath)} type="video/mp4" />
              </video>
              {!videoPlaying && (
                <div className="custom-play-btn" onClick={() => videoRef.current?.play()}>
                  <i className="fa fa-play"></i>
                </div>
              )}
            </>
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {t('loading_video') || 'Loading video...'}
            </div>
          )}
        </div>
      </section>

      <section className="spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title">
                <span>{t('vehicle')}</span>
                <h2>{t('available')}</h2>
              </div>
              <ul className="filter__controls">
                <li className={activeFilter === 'all' ? 'active' : ''} onClick={() => setActiveFilter('all')}>
                  {t('all_cars') || 'All Cars'}
                </li>
                <li className={activeFilter === 'container' ? 'active' : ''} onClick={() => setActiveFilter('container')}>
                  {t('container_cars') || 'Container Cars'}
                </li>
                <li className={activeFilter === 'licensed' ? 'active' : ''} onClick={() => setActiveFilter('licensed')}>
                  {t('licensed_cars') || 'Licensed Cars'}
                </li>
              </ul>
            </div>
          </div>
          <div className="row car-filter">
            {loading ? (
              <div className="col-12 text-center py-5"><h4>{t('loading_cars') || 'Loading cars...'}</h4></div>
            ) : currentCars.length === 0 ? (
              <div className="col-12 text-center py-5"><h4>{t('no_cars') || 'No cars in this category.'}</h4></div>
            ) : (
              currentCars.map(car => {
                const title = `${car.manufacturer} ${car.model} ${car.year}`;
                return (
                  <div key={car.id} className="col-lg-3 col-md-4 col-sm-6 mix">
                    <div className="car__item">
                      <div className="car__item__pic__slider">
                        <Swiper
                          modules={[Autoplay, Navigation, Pagination]}
                          spaceBetween={0}
                          slidesPerView={1}
                          loop={car.images.length > 1}
                          autoplay={{ delay: 5000, disableOnInteraction: false }}
                          navigation
                          pagination={{ clickable: true }}
                          className="car-swiper"
                        >
                          {car.images.length > 0 ? (
                            car.images.map((img, idx) => (
                              <SwiperSlide key={idx}>
                                <img src={getImageUrl(img)} alt="" />
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
                          <div className="label-date">{t('arrival')}</div>
                          <h5><Link href={`/${locale}/carDetails?id=${car.id}`}>{title}</Link></h5>
                          <ul>
                            <li><span>{car.mileage?.toLocaleString() || 'N/A'}</span> km</li>
                            <li>{car.transmission || 'N/A'}</li>
                            <li><span>{car.engineType || 'N/A'}</span> cc</li>
                          </ul>
                        </div>
                        <div className="car__item__price d-flex justify-content-between align-items-center">
                          <span className="car-option">؋ {car.sellingPrice?.toLocaleString() || 'N/A'}</span>
                          <Link href={`/${locale}/carDetails?id=${car.id}`} className="primary-btn">
                            <i className="fa fa-eye"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="latest spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title">
                <span>{t('Customer')}</span>
                <h2>{t('clientSay')}</h2>
                <p>{t('clientSayDesc')}</p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <Swiper
                modules={[Autoplay, Navigation, Pagination]}
                spaceBetween={30}
                slidesPerView={3}
                loop={testimonials.length > 1}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                navigation
                pagination={{ clickable: true }}
                breakpoints={{
                  0: { slidesPerView: 1 },
                  768: { slidesPerView: 2 },
                  1200: { slidesPerView: 3 }
                }}
              >
                {testimonials.map((review) => (
                  <SwiperSlide key={review.id}>
                    <div className="latest__blog__item">
                      <div className="latest__blog__item__pic" style={{ backgroundSize: 'cover', backgroundPosition: 'center' }}>
                        <ul>
                          <li>{review.name}</li>
                          <li>{review.year ? `${review.year}` : ''}</li>
                          <li>{renderStars(review.rating)}</li>
                        </ul>
                      </div>
                      <div className="latest__blog__item__text">
                        <h5>{review.title}</h5>
                        <p>{review.message}</p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </section>

      <div className="cta-app-download">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-md-6">
              <div className="cta__item app-store-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundImage: 'url(/img/cta/cta-1.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', padding: '30px', borderRadius: '10px', minHeight: '200px' }}>
                <div className="app-text" style={{ color: '#fff' }}>
                  <h4>{t('downloadAppStore')}</h4>
                  <p>{t('appStoreDesc')}</p>
                  <a href="#"><img src="/img/cta/appStore.png" alt="App Store" style={{ width: '120px', marginTop: '10px' }} /></a>
                </div>
                <div className="app-image"><img src="/img/cta/app.png" alt="App Screenshot" style={{ maxHeight: '150px', borderRadius: '10px' }} /></div>
              </div>
            </div>
            <div className="col-lg-6 col-md-6">
              <div className="cta__item play-store-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundImage: 'url(/img/cta/cta-2.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', padding: '30px', borderRadius: '10px', minHeight: '200px' }}>
                <div className="app-text" style={{ color: '#fff' }}>
                  <h4>{t('downloadPlayStore')}</h4>
                  <p>{t('playStoreDesc')}</p>
                  <a href="#"><img src="/img/cta/playStore.png" alt="Play Store" style={{ width: '120px', marginTop: '10px' }} /></a>
                </div>
                <div className="app-image"><img src="/img/cta/app.png" alt="App Screenshot" style={{ maxHeight: '150px', borderRadius: '10px' }} /></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}