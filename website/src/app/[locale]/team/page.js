import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getTeamData } from '@/lib/db';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const normalizeUrl = (url) => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
};

const getImageUrl = (path) => {
  if (!path) return '/img/about/team-1.jpg';
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
};

export default async function TeamPage({ params }) {
  // ✅ Unwrap params Promise
  const { locale } = await params;
  const messages = (await import(`@/locales/${locale}/common.json`)).default;
  const teamMembers = await getTeamData(locale); // Change to locale if you want localized team data

  return (
    <>
      <Header />

      {/* Breadcrumb Section */}
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
                <h2>{messages.team || 'Our Team'}</h2>
                <div className="breadcrumb__links">
                  <Link href={`/${locale}`}><i className="fa fa-home"></i> {messages.home || 'Home'}</Link>
                  <span>{messages.team || 'Our Team'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Team Section */}
      <section className="our-team spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title team-title">
                <span>{messages.meet_out_experts || 'Meet Our Experts'}</span>
                <h2>{messages.dedicated_team_of_professionals || 'Dedicated Team of Professionals'}</h2>
                <p>{messages.team_description || 'Our experienced team is here to help you find the perfect vehicle and ensure a smooth experience.'}</p>
              </div>
            </div>
          </div>
          <div className="row">
            {teamMembers.length > 0 ? (
              teamMembers.map(member => (
                <div key={member.id} className="col-lg-3 col-md-6 col-sm-6">
                  <div className="our-team__item">
                    <div className="our-team__item__pic">
                      <img src={getImageUrl(member.image)} alt={member.name} />
                    </div>
                    <div className="our-team__item__text" style={{ textAlign: 'center' }}>
                      <h5><strong>{member.name}</strong></h5>
                      <span><strong>{member.position}</strong></span>
                      <p>{member.description}</p>
                      <div className="our-team__item__social">
                        {member.facebook && (
                          <a href={normalizeUrl(member.facebook)} className="facebook" target="_blank" rel="noopener noreferrer">
                            <i className="fa-brands fa-facebook"></i>
                          </a>
                        )}
                        {member.x && (
                          <a href={normalizeUrl(member.x)} className="x" target="_blank" rel="noopener noreferrer">
                            <i className="fa-brands fa-x-twitter"></i>
                          </a>
                        )}
                        {member.instagram && (
                          <a href={normalizeUrl(member.instagram)} className="instagram" target="_blank" rel="noopener noreferrer">
                            <i className="fa-brands fa-instagram"></i>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center">
                <p>{messages.no_team_members || 'No team members available at the moment.'}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}