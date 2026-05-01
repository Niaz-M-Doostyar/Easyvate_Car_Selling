import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default async function PrivacyPolicy({ params }) {
  const { locale } = await params;
  const messages = (await import(`@/locales/${locale}/common.json`)).default;

  // Static content for Privacy Policy (you can replace with your own text)
  const content = {
    title: messages.privacy_title || 'Privacy Policy',
    lastUpdated: messages.privacy_last_updated || 'Last updated: April 7, 2025',
    intro: messages.privacy_intro || 'At Niazai Khpalwak Car Showroom, we respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you visit our website.',
    sections: [
      {
        title: messages.privacy_section1_title || 'Information We Collect',
        text: messages.privacy_section1_text || 'We may collect personal information such as your name, email address, phone number, and any other details you voluntarily provide when contacting us, making an inquiry, or using our services. We also collect non‑personal data like browser type, IP address, and pages visited to improve our website.'
      },
      {
        title: messages.privacy_section2_title || 'How We Use Your Information',
        text: messages.privacy_section2_text || 'We use your information to respond to your inquiries, provide our services, process transactions, improve our website, and communicate with you about our products and offers. We do not sell your personal data to third parties.'
      },
      {
        title: messages.privacy_section3_title || 'Cookies and Tracking',
        text: messages.privacy_section3_text || 'Our website may use cookies to enhance user experience. You can choose to disable cookies through your browser settings, but this may affect certain functionalities.'
      },
      {
        title: messages.privacy_section5_title || 'Data Security',
        text: messages.privacy_section5_text || 'We implement reasonable security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.'
      },
      {
        title: messages.privacy_section6_title || 'Your Rights',
        text: messages.privacy_section6_text || 'You have the right to access, correct, or delete your personal data. If you have any questions, please contact us using the information below.'
      },
      {
        title: messages.privacy_section7_title || 'Contact Us',
        text: messages.privacy_section7_text || 'If you have any questions about this Privacy Policy, please contact us at: info@niazaykhpalwak.com or call +93 700 000 000.'
      }
    ]
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
                <h2>{content.title}</h2>
                <div className="breadcrumb__links">
                  <Link href={`/${locale}`}>
                    <i className="fa fa-home"></i> {messages.home || 'Home'}
                  </Link>
                  <span>{content.title}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Policy Content */}
      <section className="privacy-policy spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="privacy-content">
                <p className="last-updated" style={{ fontStyle: 'italic', marginBottom: '30px' }}>
                  {content.lastUpdated}
                </p>
                <p style={{ marginBottom: '30px' }}>{content.intro}</p>
                {content.sections.map((section, idx) => (
                  <div key={idx} style={{ marginBottom: '30px' }}>
                    <h4 style={{ fontWeight: 'bold', marginBottom: '10px' }}>{section.title}</h4>
                    <p>{section.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}