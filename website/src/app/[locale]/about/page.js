import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAboutData } from '@/lib/db';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const getImageUrl = (path) => {
  if (!path) return '/img/clients/client-1.png';
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
};

export default async function AboutUs({ params }) {
  // ✅ Await the params Promise
  const { locale } = await params;
  const messages = (await import(`@/locales/${locale}/common.json`)).default;

  // Fetch about content and logos (still using English, but could pass locale)
  const { about, logos } = await getAboutData(locale);

  // Fallback values (original static content) – now use translations
  const data = about || {
    title: messages.about_title || 'Welcome to Niazay Khpalwak Car Showroom',
    subtitle: messages.about_subtitle || 'Your Trusted Platform for Buying and Selling Vehicles',
    description: messages.about_description || 'Niazay Khpalwak Car Showroom is a trusted platform for buying and selling high-quality vehicles. We specialize in container imported cars, licensed vehicles, and a wide variety of brands including Toyota, BMW, Mercedes, Luxes, and more. Our goal is to connect buyers and sellers easily while providing transparent pricing, reliable vehicles, and excellent customer service to thousands of satisfied clients.',
    wide_feature: messages.wide_feature || 'We offer a large selection of cars including container imports, licensed vehicles, luxury cars, and family vehicles from top brands around the world.',
    trust_feature: messages.trust_feature || 'Our platform connects buyers and sellers in a secure and transparent way, helping customers find the best deals with confidence.',
    professional_feature: messages.professional_feature || 'We import high-quality vehicles from international markets and ensure they meet customer expectations in terms of performance and reliability.',
    about_us: messages.about_us || 'Niazay Khpalwak Car Showroom has built a strong reputation for providing reliable vehicles and honest service. Our marketplace includes container cars, licensed cars, and exchange options that help customers easily find the car that fits their needs and budget.',
    experience: messages.experience || 'With years of experience in the automotive industry, we have served thousands of customers and built long-term relationships with car dealers and import partners. Our focus is on quality vehicles, transparent transactions, and customer satisfaction.',
    choose_trust: messages.choose_trust || 'All vehicles come from verified dealers and trusted suppliers.',
    choose_quality: messages.choose_quality || 'We carefully select vehicles to ensure reliability and performance.',
    choose_process: messages.choose_process || 'Our platform makes buying or selling cars simple and convenient.',
  };

  return (
    <>
      <Header />

      {/* Breadcrumb */}
      <div
        className="breadcrumb-option"
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
                <h2>{messages.about || 'About Us'}</h2>
                <div className="breadcrumb__links">
                  <Link href={`/${locale}`}><i className="fa fa-home"></i> {messages.home || 'Home'}</Link>
                  <span>{messages.about || 'About Us'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <section className="about spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title about-title">
                <p style={{ textAlign: 'center', color: '#233a68', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
                  <strong>{data.title}</strong><br />
                  {data.subtitle}
                </p>
                <p style={{ textAlign: 'center' }}>{data.description}</p>
              </div>
            </div>
          </div>
          <div className="about__feature">
            <div className="row">
              <div className="col-lg-4 col-md-6 col-sm-6">
                <div className="about__feature__item">
                  <img src="/img/about/af-1.png" alt="" />
                  <h5>{messages.wide_range_of_vehicles || 'Wide Range of Vehicles'}</h5>
                  <p>{data.wide_feature}</p>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-6">
                <div className="about__feature__item">
                  <img src="/img/about/af-2.png" alt="" />
                  <h5>{messages.trusted_marketplace || 'Trusted Marketplace'}</h5>
                  <p>{data.trust_feature}</p>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-6">
                <div className="about__feature__item">
                  <img src="/img/about/af-3.png" alt="" />
                  <h5>{messages.professional_car_import_services || 'Professional Car Import Services'}</h5>
                  <p>{data.professional_feature}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-6 col-md-6 col-sm-6">
              <div className="about__item">
                <h5>{messages.about_our_marketplace || 'About Our Marketplace'}</h5>
                <p>{data.about_us}</p>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-sm-6">
              <div className="about__item">
                <h5>{messages.our_experience || 'Our Experience'}</h5>
                <p>{data.experience}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Counter Section */}
      <div
        className="counter spad"
        style={{
          backgroundImage: 'url(/img/counter-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-6 col-sm-6">
              <div className="counter__item">
                <h2 className="counter-num">300</h2><strong>+</strong>
                <p>{messages.vehicles_available || 'Vehicles Available'}</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-sm-6">
              <div className="counter__item">
                <h2 className="counter-num">1000</h2><strong>+</strong>
                <p>{messages.cars_sold || 'Cars Sold'}</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-sm-6">
              <div className="counter__item">
                <h2 className="counter-num">900</h2><strong>+</strong>
                <p>{messages.happy_clients || 'Happy Clients'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <section className="chooseabout spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title text-center">
                <h2>{messages.why_choose_our_car_services || 'Why Choose Our Car Services'}</h2>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-6">
              <div className="chooseus__item">
                <h5><i className="fa fa-check-circle"></i> {messages.trusted_dealers || 'Trusted Dealers'}</h5>
                <p>{data.choose_trust}</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="chooseus__item">
                <h5><i className="fa fa-check-circle"></i> {messages.quality_vehicles || 'Quality Vehicles'}</h5>
                <p>{data.choose_quality}</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="chooseus__item">
                <h5><i className="fa fa-check-circle"></i> {messages.easy_buying_process || 'Easy Buying Process'}</h5>
                <p>{data.choose_process}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clients / Logos */}
      <div className="clients spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title client-title">
                <span>{messages.partner || 'Partner'}</span>
                <h2>{messages.our_clients || 'Our Clients'}</h2>
              </div>
            </div>
          </div>
          <div className="row">
            {logos && logos.length > 0 ? (
              logos.map((logo) => (
                <div key={logo.id} className="col-lg-3 col-md-4 col-sm-6">
                  <a href="#" className="client__item">
                    <img src={getImageUrl(logo.path)} alt={logo.filename} />
                  </a>
                </div>
              ))
            ) : (
              // Fallback static images
              [1, 2, 3, 2, 4, 5, 6, 7].map((num, idx) => (
                <div key={idx} className="col-lg-3 col-md-4 col-sm-6">
                  <a href="#" className="client__item">
                    <img src={`/img/clients/client-${num}.png`} alt="" />
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}