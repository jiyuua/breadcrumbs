
import { useEffect, useState } from "react";
import { Link } from "react-router";
import "./LandingPage.css";

const assets = "/assets/";

const spots = [
  {
    name: "Banter",
    area: "Greenwich Village",
    rating: "4.7",
    image: "banter-new.jpg",
  },
  {
    name: "The High Line",
    area: "Chelsea",
    rating: "4.8",
    image: "highline-new.jpg",
  },
  {
    name: "Times Square",
    area: "Midtown",
    rating: "4.5",
    image: "timessquare-new.jpg",
  },
];

const vibes = [
  {
    id: "coffee",
    icon: "☕",
    label: "Coffee & Bites",
    title: "A little café hopping",
    description:
      "Start with a delicious coffee, discover a cozy corner, and let the city surprise you.",
    image: "cafe.jpg",
    area: "Greenwich Village",
  },
  {
    id: "views",
    icon: "✦",
    label: "Scenic Views",
    title: "Take the scenic route",
    description:
      "Find beautiful skyline views, waterfront walks, and the perfect place to watch the sunset.",
    image: "island-pier.jpg",
    area: "DUMBO, Brooklyn",
  },
  {
    id: "adventures",
    icon: "⌖",
    label: "City Adventures",
    title: "Follow your curiosity",
    description:
      "Explore iconic landmarks, hidden gems, and new neighborhoods one breadcrumb at a time.",
    image: "cp.jpg",
    area: "Central Park, Manhattan",
  },
];

const stories = [
  {
    id: 1,
    title: "Getting lost in the best way",
    area: "DUMBO, Brooklyn",
    image: "dumbo-new.jpg",
    description:
      "Cobblestone streets, skyline views, and little discoveries around every corner.",
    category: "CITY ADVENTURES",
  },
  {
    id: 2,
    title: "Coffee stops & conversations",
    area: "New York City",
    image: "convo.jpg",
    description:
      "Sometimes the best memories happen between coffee stops and good conversations.",
    category: "FOOD & COFFEE",
  },
  {
    id: 3,
    title: "A New York kind of sunset",
    area: "New York City",
    image: "sunset.jpg",
    description:
      "Golden hour, beautiful city views, and another moment worth remembering.",
    category: "NYC MEMORIES",
  },
];


function Header() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const updateActive = () => {
      const ids = ["home", "features", "about", "blog"];
      const scrollPosition = window.scrollY + window.innerHeight * 0.35;

      let current = "home";

      for (const id of ids) {
        const section = document.getElementById(id);

        if (section) {
          const sectionTop =
            section.getBoundingClientRect().top + window.scrollY;

          if (scrollPosition >= sectionTop) {
            current = id;
          }
        }
      }

      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 5
      ) {
        current = "blog";
      }

      setActiveSection(current);
    };

    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);

    updateActive();

    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, []);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "features", label: "Features" },
    { id: "about", label: "About" },
    { id: "blog", label: "Blog" },
  ];

  return (
    <header className="bc-header">
      <a className="bc-logo" href="#home">
        <span aria-hidden="true">✦</span> Breadcrumbs
      </a>

      <button
        className="bc-menu-toggle"
        type="button"
        aria-expanded={open}
        aria-label="Toggle navigation"
        onClick={() => setOpen(!open)}
      >
        {open ? "✕" : "☰"}
      </button>

      <nav
        className={`bc-nav ${open ? "bc-nav-open" : ""}`}
        aria-label="Main navigation"
      >
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={
              activeSection === item.id ? "bc-nav-active" : ""
            }
            aria-current={
              activeSection === item.id ? "location" : undefined
            }
            onClick={() => {
              setActiveSection(item.id);
              setOpen(false);
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="bc-header-actions">
        <Link className="bc-button bc-outline" to="/login">
          Log In
        </Link>

        <Link className="bc-button bc-primary" to="/signup">
          Sign Up
        </Link>
      </div>
    </header>
  );
}


// PHONE MOCKUP
function PhoneMockup() {
  const categories = [
    ["🍴", "Food"],
    ["☕", "Coffee"],
    ["✧", "Things to do"],
    ["△", "Views"],
    ["•••", "More"],
  ];

  return (
    <div
      className="bc-phone"
      aria-label="Preview of Breadcrumbs map discovery app"
    >
      <div className="bc-phone-notch" />

      <div className="bc-phone-screen">
        <div className="bc-phone-logo">
          <span>✦</span> Breadcrumbs
        </div>

        <div className="bc-phone-search">
          Search places, neighborhoods, or vibes...
        </div>

        <div className="bc-phone-categories">
          {categories.map(([symbol, label]) => (
            <div key={label}>
              <span>{symbol}</span>
              <small>{label}</small>
            </div>
          ))}
        </div>

        <div className="bc-map">
          <img
            src={`${assets}friendmap.jpg`}
            alt="NYC neighborhood map preview"
          />
          <i className="bc-pin bc-pin-one" />
          <i className="bc-pin bc-pin-two" />
          <i className="bc-pin bc-pin-three" />
        </div>
      </div>
    </div>
  );
}

// HERO SECTION
function Hero() {
  return (
    <section className="bc-hero" id="home">
      <div className="bc-hero-copy">
        <p className="bc-eyebrow">
          EXPLORE · PLAN · GO TOGETHER · REMEMBER
        </p>

        <h1>
          Find your way
          <br />
          through NYC
        </h1>

        <p className="bc-intro">
          Discover amazing places, build personalized itineraries,
          explore with friends, and save your favorite memories —
          all in one app.
        </p>

        <div className="bc-hero-actions">
          <Link className="bc-button bc-primary" to="/signup">
            Sign Up <span aria-hidden="true">→</span>
          </Link>

          <Link className="bc-button bc-outline" to="/login">
            Log In
          </Link>

          <a className="bc-demo" href="#features">
            <span>▶</span> Explore Demo
          </a>
        </div>

        <div className="bc-community">
          <div className="bc-avatars" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} />
            ))}
          </div>

          <p>
            A new way to explore
            <br />
            <strong>New York City together.</strong>
          </p>
        </div>
      </div>

      <div className="bc-hero-art">
        <img
          className="bc-skyline"
          src={`${assets}hero-background.png`}
          alt="Brooklyn Bridge and Manhattan skyline at sunset"
        />

        <div className="bc-gradient" />

        <p className="bc-trail-note">
          Same City
          <br />
          New Stories
          <br />
          Always a Good Trail
        </p>

        <div className="bc-trail-line" aria-hidden="true" />

        
        <article className="bc-floating bc-levain">
          <img
            src={`${assets}levain-new.jpg`}
            alt="Levain Bakery cookies"
          />
          <div>
            <strong>Levain Bakery</strong>
            <small>Upper West Side · 0.8 mi</small>
            <small>Iconic cookies worth the hype.</small>
            <small className="bc-rating">★ 4.8 (2.1K)</small>
          </div>
        </article>

        <PhoneMockup />

        <div className="bc-sticky bc-sticky-one">
          Explore
          <br />
          Together ✦
        </div>

        <div className="bc-sticky bc-sticky-two">
          More
          <br />
          Breadcrumbs
          <br />
          Please.
        </div>
      </div>
    </section>
  );
}

// THREE MAIN FEATURES
function Features() {
  return (
    <section
      className="bc-features"
      id="features"
      aria-label="What Breadcrumbs can do"
    >
      <article className="bc-feature">
        <div className="bc-feature-head">
          <span className="bc-icon bc-gold">⌖</span>
          <div>
            <h2>Discover</h2>
            <p>
              Find the best food, sights, hidden gems,
              and local favorites across NYC.
            </p>
          </div>
        </div>

        <div className="bc-places">
          {spots.map((spot) => (
            <div className="bc-place" key={spot.name}>
              <img
                src={`${assets}${spot.image}`}
                alt={spot.name}
                loading="lazy"
              />
              <h3>{spot.name}</h3>
              <p>{spot.area}</p>
              <span>★ {spot.rating}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="bc-feature bc-feature-mid">
        <div className="bc-feature-head">
          <span className="bc-icon bc-teal">●●</span>
          <div>
            <h2>Plan Together</h2>
            <p>
              Build itineraries with friends, share places,
              and make the most of your time in the city.
            </p>
          </div>
        </div>

        <div className="bc-itinerary">
          <div className="bc-itin-head">
            <div>
              <h3>NYC Weekend Trip</h3>
              <small>Sample itinerary</small>
            </div>
            <div className="bc-mini-avatars">
              ● ● ● <strong>+2</strong>
            </div>
          </div>

          {[
            ["Breakfast at Sadelle's", "9:00 AM · SoHo"],
            ["Walk the High Line", "11:00 AM · Chelsea"],
            ["Explore DUMBO", "2:00 PM · Brooklyn"],
          ].map(([title, detail], i) => (
            <div className="bc-itin-row" key={title}>
              <span>{i + 1}</span>
              <i />
              <strong>{title}</strong>
              <small>{detail}</small>
            </div>
          ))}
        </div>
      </article>

      <article className="bc-feature">
        <div className="bc-feature-head">
          <span className="bc-icon bc-gold">▣</span>
          <div>
            <h2>Save Memories</h2>
            <p>
              Keep your favorite spots, photos,
              and moments all in one place.
            </p>
          </div>
        </div>

        <div className="bc-memories bc-memories-updated">
          <img
            src={`${assets}friendsnyc.jpg`}
            alt="DUMBO memory"
            loading="lazy"
          />
          <img
            src={`${assets}tour.jpg`}
            alt="Coffee memory"
            loading="lazy"
          />
          <img
            src={`${assets}bffs.jpg`}
            alt="NYC skyline memory"
            loading="lazy"
          />
          <span>
            NYC
            <br />
            Hits Different ♡
          </span>
        </div>
      </article>
    </section>
  );
}

// INTERACTIVE ABOUT SECTION
function About() {
  const [selectedVibe, setSelectedVibe] = useState("views");

  const selected =
    vibes.find((vibe) => vibe.id === selectedVibe) || vibes[0];

  return (
    <section className="bc-about-section" id="about">
      <div className="bc-about-heading">
        <p className="bc-eyebrow">GET TO KNOW BREADCRUMBS</p>

        <h2>
          The city is better
          <br />
          when it feels like <em>you.</em>
        </h2>

        <p>
          Your interests, your plans, your favorite people.
          Breadcrumbs helps you discover your own version
          of New York City.
        </p>
      </div>

      <div className="bc-vibe-experience">
        <div className="bc-vibe-selection">
          <span className="bc-section-label">
            A LITTLE TASTE OF BREADCRUMBS
          </span>

          <h3>What's your NYC vibe?</h3>
          <p>
            Pick something you love and follow your curiosity.
          </p>

          <div className="bc-vibe-options">
            {vibes.map((vibe) => (
              <button
                key={vibe.id}
                type="button"
                className={`bc-vibe-button ${
                  selectedVibe === vibe.id ? "selected" : ""
                }`}
                aria-pressed={selectedVibe === vibe.id}
                onClick={() => setSelectedVibe(vibe.id)}
              >
                <span>{vibe.icon}</span>
                {vibe.label}
              </button>
            ))}
          </div>

          <p className="bc-vibe-hint">
            ✦ Little adventures, made personal.
          </p>
        </div>

        <div className="bc-vibe-result" aria-live="polite">
          <div className="bc-vibe-image">
            <img
              src={`${assets}${selected.image}`}
              alt={selected.title}
            />
            <span className="bc-vibe-image-label">
              YOUR NEXT BREADCRUMB
            </span>
          </div>

          <div className="bc-vibe-result-copy">
            <div>
              <small>✦ {selected.area}</small>
              <h3>{selected.title}</h3>
              <p>{selected.description}</p>
            </div>
            <span className="bc-vibe-arrow" aria-hidden="true">
              ↗
            </span>
          </div>
        </div>
      </div>

    </section>
  );
}

// INTERACTIVE BLOG / STORY PREVIEW
function Blog() {
  const [currentStory, setCurrentStory] = useState(0);
  const [savedStories, setSavedStories] = useState([]);

  const story = stories[currentStory];
  const isSaved = savedStories.includes(story.id);

  const changeStory = (direction) => {
    setCurrentStory((previous) =>
      (previous + direction + stories.length) % stories.length
    );
  };

  const toggleSave = () => {
    setSavedStories((previous) =>
      previous.includes(story.id)
        ? previous.filter((id) => id !== story.id)
        : [...previous, story.id]
    );
  };

  return (
    <section className="bc-blog-section" id="blog">
      <div className="bc-blog-heading">
        <div>
          <p className="bc-eyebrow">LITTLE MOMENTS, BIG MEMORIES</p>
          <h2>Every breadcrumb tells a story.</h2>
          <p>
            Good places are even better when they become
            memories worth keeping.
          </p>
        </div>

        <div className="bc-blog-controls">
          <button
            type="button"
            onClick={() => changeStory(-1)}
            aria-label="Previous story"
          >
            ←
          </button>

          <button
            type="button"
            onClick={() => changeStory(1)}
            aria-label="Next story"
          >
            →
          </button>
        </div>
      </div>

      <div className="bc-story-showcase">
        <div className="bc-story-image">
          <img
            src={`${assets}${story.image}`}
            alt={story.title}
          />

          <span className="bc-story-counter">
            0{currentStory + 1} / 0{stories.length}
          </span>
        </div>

        <div className="bc-story-content">
          <span className="bc-section-label">
            {story.category}
          </span>

          <h3>{story.title}</h3>

          <p>{story.description}</p>

          <div className="bc-story-location">
            <span>⌖</span> {story.area}
          </div>

          <button
            type="button"
            className={`bc-story-save ${isSaved ? "saved" : ""}`}
            onClick={toggleSave}
            aria-pressed={isSaved}
          >
            <span aria-hidden="true">
              {isSaved ? "♥" : "♡"}
            </span>
            {isSaved ? "Saved to inspiration" : "Save inspiration"}
          </button>

          <div className="bc-story-dots">
            {stories.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Show story ${index + 1}`}
                aria-current={
                  currentStory === index ? "true" : undefined
                }
                className={
                  currentStory === index ? "active" : ""
                }
                onClick={() => setCurrentStory(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bc-footer">
      <a href="#home">✦ Breadcrumbs</a>
      <span>
        Capstone project · Personalized NYC travel guide
      </span>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="bc-page">
      <Header />

      <main>
        <Hero />
        <Features />
        <About />
        <Blog />
      </main>

      <Footer />
    </div>
  );
}
