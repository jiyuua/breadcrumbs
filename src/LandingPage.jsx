import { useState } from 'react';
import { useNavigate } from 'react-router';
import './LandingPage.css';

// Images belong in public/assets/; see README for their original filenames.
const asset = (filename) => `/assets/${filename}`;

const places = [
  { name: 'Banter', area: 'Greenwich Village', rating: '4.7', image: 'banter.png' },
  { name: 'The High Line', area: 'Chelsea', rating: '4.8', image: 'highline.png' },
  { name: 'Times Square', area: 'Midtown', rating: '4.5', image: 'times-square.png' },
];
const itinerary = [
  { name: "Breakfast at Sadelle's", info: '9:00 AM · SoHo', color: 'sand' },
  { name: 'Walk the High Line', info: '11:00 AM · Chelsea', color: 'sage' },
  { name: 'Explore DUMBO', info: '2:00 PM · Brooklyn', color: 'taupe' },
];

function Photo({ file, alt, className = '' }) {
  const [missing, setMissing] = useState(false);
  return <div className={`photo-frame ${className} ${missing ? 'photo-missing' : ''}`}>
    {!missing && <img src={asset(file)} alt={alt} onError={() => setMissing(true)} />}
    {missing && <span className="photo-placeholder" role="img" aria-label={alt}>✦ <small>{alt}</small></span>}
  </div>;
}

function Header({ onAuth }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <header className="site-header container">
    <a href="#home" className="brand" onClick={() => setMenuOpen(false)}><span className="brand-mark">✦</span> Breadcrumbs</a>
    <button className="menu-button" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>☰</button>
    <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
      {['Home', 'Features', 'About', 'Blog'].map((name) => <a key={name} href={`#${name.toLowerCase()}`} onClick={() => setMenuOpen(false)}>{name}</a>)}
      <div className="mobile-auth"><button className="btn btn-light" onClick={() => onAuth('login')}>Log In</button><button className="btn btn-primary" onClick={() => onAuth('signup')}>Sign Up</button></div>
    </nav>
    <div className="header-actions"><button className="btn btn-light" onClick={() => onAuth('login')}>Log In</button><button className="btn btn-primary" onClick={() => onAuth('signup')}>Sign Up</button></div>
  </header>;
}

function Hero({ onAuth }) {
  return <section className="hero container" id="home">
    <div className="hero-copy">
      <p className="eyebrow">EXPLORE · PLAN · GO TOGETHER · REMEMBER</p>
      <h1>Find your way<br /><em>through NYC</em></h1>
      <p className="hero-description">Discover amazing places, build personalized itineraries, explore with friends, and save your favorite memories — all in one app.</p>
      <div className="hero-actions"><button className="btn btn-primary btn-large" onClick={() => onAuth('signup')}>Sign Up <span aria-hidden="true">→</span></button><button className="btn btn-light btn-large" onClick={() => onAuth('login')}>Log In</button><a className="demo-button" href="#features"><span className="play">▶</span> Explore Demo</a></div>
      <div className="community-row"><div className="avatar-stack" aria-hidden="true">{[1,2,3,4,5].map(n => <span key={n} className={`avatar avatar-${n}`} />)}</div><p>Explore NYC together.<br /><strong>Make the city your story.</strong></p></div>
    </div>
    <div className="hero-visual"><Photo file="hero-background.png" alt="New York City skyline" className="hero-background" /><div className="hero-gradient" /><p className="trail-note">Same City<br />New Stories<br />Always a Good Trail</p><div className="trail-line" aria-hidden="true" />
      <div className="phone"><div className="phone-notch" /><div className="phone-screen"><div className="phone-brand">✦ Breadcrumbs</div><div className="phone-search">⌕ Search NYC spots...</div><div className="phone-categories">{[['🍴','Food'],['☕','Coffee'],['✧','Explore'],['△','Views']].map(([ico,label]) => <span key={label}>{ico}<small>{label}</small></span>)}</div><Photo className="phone-map-wrap" file="phone-map.png" alt="Map preview of NYC" /><div className="map-pin pin-one"/><div className="map-pin pin-two"/></div></div>
      <article className="floating-card"><Photo file="levain.png" alt="Levain Bakery cookies"/><div><strong>Levain Bakery</strong><span>Upper West Side</span><span>Cookies worth the hype.</span><b>★ 4.8</b></div></article>
      <div className="sticky">Explore<br/>Together ✦</div>
    </div>
  </section>;
}

function Discover() { return <article className="feature-column"><div className="feature-heading"><span className="feature-icon gold">⌖</span><div><h2>Discover</h2><p>Find the best food, sights, hidden gems, and local favorites across NYC.</p></div></div><div className="place-grid">{places.map(place => <article className="place-card" key={place.name}><Photo file={place.image} alt={place.name}/><h3>{place.name}</h3><p>{place.area}</p><span>★ {place.rating}</span></article>)}</div></article>; }
function Plan() {return <article className="feature-column"><div className="feature-heading"><span className="feature-icon teal">●●</span><div><h2>Plan Together</h2><p>Build itineraries with friends, share places, and make the most of your time in the city.</p></div></div><div className="itinerary-card"><div className="itinerary-header"><div><h3>NYC Weekend Trip</h3><p>Sample itinerary</p></div><span className="friends-bubble">+ friends</span></div><ol className="itinerary-list">{itinerary.map((stop,i) => <li key={stop.name}><span className={`step-thumb ${stop.color}`}>{i+1}</span><div><strong>{stop.name}</strong><small>{stop.info}</small></div></li>)}</ol></div></article>;}
function Memories(){return <article className="feature-column"><div className="feature-heading"><span className="feature-icon gold">▣</span><div><h2>Save Memories</h2><p>Keep your favorite spots, photos, and moments all in one place.</p></div></div><div className="memory-collage"><Photo file="memory-dumbo.png" alt="DUMBO memory" className="memory-one"/><Photo file="memory-coffee.png" alt="Coffee memory" className="memory-two"/><Photo file="memory-skyline.png" alt="NYC skyline memory" className="memory-three"/><div className="memory-note">NYC<br/>Hits Different ♡</div></div></article>;}

export default function LandingPage() {
  const navigate = useNavigate();
  const onAuth = (page) => navigate(`/${page}`);
  return <div className="landing-page">
    <Header onAuth={onAuth}/>
    <main>
      <Hero onAuth={onAuth}/>
      <section className="features container" id="features"><Discover/><Plan/><Memories/></section>
      <section className="simple-section container" id="about"><p className="eyebrow">ABOUT BREADCRUMBS</p><h2>One place to discover, plan, explore, and remember New York.</h2><p>Find your next breadcrumb, wherever your NYC story takes you.</p></section>
      <section className="simple-section container" id="blog"><p className="eyebrow">STORIES</p><h2>Travel stories and NYC recommendations are coming soon.</h2></section>
    </main>
    <footer className="footer container"><a href="#home" className="brand"><span className="brand-mark">✦</span> Breadcrumbs</a><p>Capstone project · Personalized NYC travel guide</p></footer>
  </div>;
}
