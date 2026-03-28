import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getContactData } from '@/lib/db';

export default async function Contact({ params }) {
  const { locale } = await params;
  const messages = (await import(`@/locales/${locale}/common.json`)).default;
  const contacts = await getContactData(locale); // or locale if you have localized addresses

  const firstContact = contacts.length > 0 ? contacts[0] : null;
  const weekdayHours = firstContact?.weekdays || '08:00 am to 05:00 pm';
  const fridayHours = firstContact?.friday || '08:00 am to 12:00 pm';

  return (
    <>
      <Header />

      {/* Breadcrumb Begin */}
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
                <h2>{messages.contact || 'Contact Us'}</h2>
                <div className="breadcrumb__links">
                  <Link href={`/${locale}`}>
                    <i className="fa fa-home"></i> {messages.home || 'Home'}
                  </Link>
                  <span>{messages.contact || 'Contact Us'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Breadcrumb End */}

      {/* Contact Section Begin */}
      <section className="contact spad">
        <div className="container">
          <div className="row">
            {/* Left column: Contact info and hours */}
            <div className="col-lg-6 col-md-6">
              <div className="contact__text">
                <div className="section-title">
                  <h2>{messages.lets_work_together || 'Let’s Work Together'}</h2>
                  <p>{messages.contact_description || 'To make requests for further information, contact us via our social channels.'}</p>
                </div>
                <ul>
                  <li><span>{messages.weekdays || 'Weekday'}</span> {weekdayHours}</li>
                  <li><span>{messages.friday || 'Friday:'}</span> {fridayHours}</li>
                </ul>
              </div>
            </div>

            {/* Right column: Embedded Google Map (exact iframe provided) */}
            <div className="col-lg-6 col-md-6">
              <div className="contact__map">
                <iframe
                  title="Google Map – Niazai khpalwak Car showroom"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3397.838162489427!2d65.75756717507305!3d31.61089404266507!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ed6714673b75161%3A0x9fe8375ec0afc643!2sNiazai%20khpalwak%20Car%20showroom!5e0!3m2!1sen!2s!4v1774637541607!5m2!1sen!2s"
                  width="100%"
                  height="450"
                  style={{ border: 0, borderRadius: '8px' }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Contact Section End */}

      {/* Contact Addresses (multiple branches) */}
      <div className="contact-address">
        <div className="container">
          <div className="contact__address__text">
            <div className="row">
              {contacts.length > 0 ? (
                contacts.map((contact) => (
                  <div key={contact.id} className="col-lg-4 col-md-6 col-sm-6">
                    <div className="contact__address__item">
                      <h4>{contact.branchName || messages.showroom || 'Showroom'}</h4>
                      <p style={{ color: '#000' }}>
                        {contact.address || messages.address_not_available || 'Address not available'}<br />
                        {contact.email && (
                          <>
                            <strong>{messages.email || 'Email: '}</strong>
                            <a href={`mailto:${contact.email}`} style={{ color: '#000', background: '#bebebe', borderRadius: '20px' }}>
                              {contact.email}
                            </a>
                          </>
                        )}
                      </p>
                      {contact.phone && (
                        <>
                          <strong>{messages.phone_label || 'Phone: '}</strong>
                          <a href={`tel:${contact.phone}`} style={{ color: '#000', background: '#bebebe', borderRadius: '20px' }}>
                            {contact.phone}
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center">
                  <p>{messages.no_contact_info || 'No contact information available at the moment.'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Contact Address End */}

      <Footer />
    </>
  );
}