'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const getImageUrl = (path) => {
  if (!path) return '/img/cars/details/cd-1.jpg';
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
};

export default function CarDetailsPage() {
  const { t } = useTranslation('common');
  const { locale } = useParams();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/vehicles/${id}?locale=${locale}`)
      .then(res => res.json())
      .then(data => {
        setVehicle(data.vehicle);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch vehicle details', err);
        setLoading(false);
      });
  }, [id, locale]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="text-center py-5"><h3>{t('loading_vehicle') || 'Loading vehicle...'}</h3></div>
        <Footer />
      </>
    );
  }

  if (!vehicle) {
    return (
      <>
        <Header />
        <div className="text-center py-5">
          <h3>{t('vehicle_not_found') || 'Vehicle not found.'}</h3>
          <Link href={`/${locale}/car`} className="primary-btn mt-3">
            {t('back_to_listing') || 'Back to listing'}
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const images = vehicle.images || [];
  const mainImageSrc = images.length > 0 ? getImageUrl(images[0].path) : '/img/cars/details/cd-1.jpg';

  return (
    <>
      <Header />

      {/* Breadcrumb */}
      <div
        className="breadcrumb-option set-bg"
        data-setbg="/img/breadcrumb-bg.jpg"
        style={{
          backgroundImage: 'url(/img/breadcrumb-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <div className="breadcrumb__text">
                <h2>{vehicle.manufacturer} {vehicle.model} {vehicle.year}</h2>
                <div className="breadcrumb__links">
                  <Link href={`/${locale}`}><i className="fa fa-home"></i> {t('home')}</Link>
                  <Link href={`/${locale}/car`}>{t('car_listing') || 'Car Listing'}</Link>
                  <span>{vehicle.manufacturer} {vehicle.model}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Car Details Section */}
      <section className="car-details spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="car__details__pic">
                {/* Main Image Carousel */}
                <div className="car__details__pic__large">
                  {images.length > 0 ? (
                    <Swiper
                      modules={[Navigation, Pagination, Thumbs]}
                      navigation
                      pagination={{ clickable: true }}
                      thumbs={{ swiper: thumbsSwiper }}
                      spaceBetween={0}
                      slidesPerView={1}
                      className="main-carousel"
                    >
                      {images.map((img, idx) => (
                        <SwiperSlide key={idx}>
                          <img className="car-big-img" src={getImageUrl(img.path)} alt="" />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  ) : (
                    <img className="car-big-img" src="/img/cars/details/cd-1.jpg" alt="" />
                  )}
                </div>

                {/* Thumbnail Carousel (if multiple images) */}
                {images.length > 1 && (
                  <div className="car-thumbs">
                    <Swiper
                      onSwiper={setThumbsSwiper}
                      modules={[Navigation, Thumbs]}
                      spaceBetween={10}
                      slidesPerView={4}
                      navigation
                      watchSlidesProgress
                      className="car-thumbs-track car__thumb__slider"
                    >
                      {images.map((img, idx) => (
                        <SwiperSlide key={idx}>
                          <div className="ct" data-imgbigurl={getImageUrl(img.path)}>
                            <img src={getImageUrl(img.path)} alt="" />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="car__details__tab">
                <ul className="nav nav-tabs" role="tablist">
                  <li className="nav-item">
                    <a className="nav-link active" data-toggle="tab" href="#tabs-1" role="tab">
                      {t('vehicle_overview') || 'Vehicle Overview'}
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" data-toggle="tab" href="#tabs-3" role="tab">
                      {t('features_options') || 'Features & Options'}
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" data-toggle="tab" href="#tabs-4" role="tab">
                      {t('vehicle_location') || 'Vehicle Location'}
                    </a>
                  </li>
                </ul>
                <div className="tab-content">
                  <div className="tab-pane active" id="tabs-1" role="tabpanel">
                    <div className="car__details__tab__info">
                      <div className="row">
                        <div className="col-lg-12 col-md-6">
                          <div className="car__details__tab__info__item">
                            <h5>{t('general_information') || 'General Information'}</h5>
                            <p>
                              {t('car_description') || 'No description available.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="car__details__tab__feature">
                      <div className="row">
                        <div className="col-lg-4 col-md-6 col-sm-6">
                          <div className="car__details__tab__feature__item">
                            <h5>{t('interior_features') || 'Interior Features'}</h5>
                            <ul>
                              <li><i className="fa fa-check-circle"></i> {t('air_conditioning') || 'Air Conditioning'}</li>
                              <li><i className="fa fa-check-circle"></i> {t('bluetooth_connectivity') || 'Bluetooth Connectivity'}</li>
                              <li><i className="fa fa-check-circle"></i> {t('power_windows') || 'Power Windows'}</li>
                              <li><i className="fa fa-check-circle"></i> {t('central_locking_system') || 'Central Locking System'}</li>
                            </ul>
                          </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-6">
                          <div className="car__details__tab__feature__item">
                            <h5>{t('safety_features') || 'Safety Features'}</h5>
                            <ul>
                              <li><i className="fa fa-check-circle"></i> {t('abs') || 'Anti-lock Braking System (ABS)'}</li>
                              <li><i className="fa fa-check-circle"></i> {t('airbags') || 'Airbags'}</li>
                              <li><i className="fa fa-check-circle"></i> {t('parking_sensors') || 'Parking Sensors'}</li>
                              <li><i className="fa fa-check-circle"></i> {t('rear_camera') || 'Rear Camera'}</li>
                            </ul>
                          </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-6">
                          <div className="car__details__tab__feature__item">
                            <h5>{t('exterior_features') || 'Exterior Features'}</h5>
                            <ul>
                              <li><i className="fa fa-check-circle"></i> {t('alloy_wheels') || 'Alloy Wheels'}</li>
                              <li><i className="fa fa-check-circle"></i> {t('led_headlights') || 'LED Headlights'}</li>
                              <li><i className="fa fa-check-circle"></i> {t('electric_side_mirrors') || 'Electric Side Mirrors'}</li>
                              <li><i className="fa fa-check-circle"></i> {t('fog_lights') || 'Fog Lights'}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="tab-pane" id="tabs-3" role="tabpanel">
                    <div className="car__details__tab__info">
                      <h5>{t('features_options') || 'Features & Options'}</h5>
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <tbody>
                             <tr>
                              <th>{t('interior') || 'Interior'}</th>
                              <td>{t('air_conditioning') || 'Air Conditioning'}</td>
                              <th>{t('entertainment') || 'Entertainment'}</th>
                              <td>{t('bluetooth_connectivity') || 'Bluetooth Connectivity'}</td>
                            </tr>
                            <tr>
                              <th>{t('safety') || 'Safety'}</th>
                              <td>{t('airbags') || 'Airbags'}</td>
                              <th>{t('braking_system') || 'Braking System'}</th>
                              <td>{t('abs') || 'ABS (Anti-lock Braking System)'}</td>
                            </tr>
                            <tr>
                              <th>{t('parking') || 'Parking'}</th>
                              <td>{t('rear_camera') || 'Rear Camera'}</td>
                              <th>{t('sensors') || 'Sensors'}</th>
                              <td>{t('parking_sensors') || 'Parking Sensors'}</td>
                            </tr>
                            <tr>
                              <th>{t('convenience') || 'Convenience'}</th>
                              <td>{t('keyless_entry') || 'Keyless Entry'}</td>
                              <th>{t('locks') || 'Locks'}</th>
                              <td>{t('central_locking') || 'Central Locking'}</td>
                            </tr>
                            <tr>
                              <th>{t('exterior') || 'Exterior'}</th>
                              <td>{t('alloy_wheels') || 'Alloy Wheels'}</td>
                              <th>{t('lighting') || 'Lighting'}</th>
                              <td>{t('led_headlights') || 'LED Headlights'}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className="tab-pane" id="tabs-4" role="tabpanel">
                    <div className="car__details__tab__info">
                      <h5>{t('vehicle_location') || 'Vehicle Location'}</h5>
                      <p>{t('vehicle_location_text') || 'This vehicle is available at our verified dealership. Visit our showroom to inspect the vehicle in person or contact our sales team for more information.'}</p>
                      <ul>
                        <li><strong>{t('dealer_label') || 'Dealer:'}</strong> {t('dealer_name') || 'Niazai Khpalwak Car Showroom'}</li>
                        <li><strong>{t('location_label') || 'Location:'}</strong> {t('location_address') || 'Kandahar, Afghanistan'}</li>
                        {/* <li><strong>{t('phone_label') || 'Phone:'}</strong> <a href={`tel:${t('dealer_phone') || '+937000000000'}`} style={{color:'#000', background:'#bebebe', borderRadius:'20px'}}>{t('dealer_phone') || '+93 7000000000'}</a></li> */}
                        <li><strong>{t('working_hours_label') || 'Working Hours:'}</strong> {t('working_hours') || '08:00 AM – 05:00 PM'}</li>
                        <li><strong>{t('friday_label') || 'Friday:'}</strong> {t('friday_hours') || '08:00 AM – 12:00 PM'}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-lg-4">
              <div className="car__details__sidebar">
                <div className="car__details__sidebar__model">
                  <ul>
                    <li>{t('make_label') || 'Make'} <span>{vehicle.manufacturer || '-'}</span></li>
                    <li>{t('chassis_number_label') || 'Chassis Number'} <span>{vehicle.chassisNumber || '-'}</span></li>
                    <li>{t('registration_date_label') || 'Registration Date'} <span>{vehicle.year || '-'}</span></li>
                    <li>{t('mileage_label') || 'Mileage'} <span>{vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : '-'}</span></li>
                    <li>{t('horsepower_label') || 'Horsepower'} <span>{vehicle.engineType || '-'}</span></li>
                    <li>{t('engine_number_label') || 'Engine Number'} <span>{vehicle.engineNumber || '-'}</span></li>
                    <li>{t('fuel_type_label') || 'Fuel Type'} <span>{vehicle.fuelType || '-'}</span></li>
                    <li>{t('transmission_label') || 'Transmission'} <span>{vehicle.transmission || '-'}</span></li>
                    <li>{t('steering_label') || 'Steering'} <span>{vehicle.steering || '-'}</span></li>
                    <li>{t('body_status_label') || 'Body Status'} <span>{vehicle.monolithicCut || '-'}</span></li>
                    <li>{t('stock_status_label') || 'Stock Status'} <span>{vehicle.status || '-'}</span></li>
                  </ul>
                </div>
                <div className="car__details__sidebar__payment">
                  <ul>
                    <li>{t('price_label') || 'Price'} <span>؋ {vehicle.sellingPrice?.toLocaleString() || '-'}</span></li>
                  </ul>
                </div>
                <div>
                  <Link href={`/${locale}/contact`} className="primary-btn">
                    {t('contact_dealer') || 'Contact Dealer'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}