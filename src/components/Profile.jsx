
import { useState } from "react";
import { Link } from "react-router";
import "./Profile.css";
import FriendsMapWidget from "./FriendsMapWidget";
const initialSpots = [
  {
    id: 1,
    name: "Levain Bakery",
    area: "Upper West Side",
    category: "Food",
    image: "/assets/levain-new.jpg",
  },
  {
    id: 2,
    name: "Central Park",
    area: "Manhattan",
    category: "Nature",
    image: "/assets/cp.jpg",
  },
  {
    id: 3,
    name: "DUMBO",
    area: "Brooklyn",
    category: "Views",
    image: "/assets/dumbo-new.jpg",
  },
  {
    id: 4,
    name: "The High Line",
    area: "Chelsea",
    category: "Nature",
    image: "/assets/highline-new.jpg",
  },
  {
    id: 5,
    name: "Times Square",
    area: "Midtown",
    category: "Adventure",
    image: "/assets/timessquare-new.jpg",
  },
];

const friends = [
  { name: "Raissa", location: "Central Park", status: "Online", color: "#B88B6E" },
  { name: "Katherin", location: "SoHo", status: "Online", color: "#BD93AA" },
  { name: "Jin", location: "Times Square", status: "Away", color: "#86B0B2" },
  { name: "Omar", location: "DUMBO", status: "Away", color: "#9A9B7F" },
];

const memories = [
  {
    title: "A Brooklyn kind of day",
    date: "October 2026",
    image: "/assets/friendsnyc.jpg",
  },
  {
    title: "Coffee & conversations",
    date: "September 2026",
    image: "/assets/cafe.jpg",
  },
  {
    title: "City lights",
    date: "August 2026",
    image: "/assets/timessquare-new.jpg",
  },
];

const menuItems = [
  { id: "overview", label: "Profile", icon: "◉" },
  { id: "map", label: "Friends Map", icon: "⌖" },
  { id: "saved", label: "Saved Spots", icon: "♡" },
  { id: "memories", label: "My Memories", icon: "▧" },
  { id: "friends", label: "My Friends", icon: "♧" },
];

function Photo({ src, alt }) {
  const [error, setError] = useState(false);

  return error ? (
    <div className="bp-photo-fallback">✦ Breadcrumbs</div>
  ) : (
    <img src={src} alt={alt} onError={() => setError(true)} />
  );
}

export default function Profile() {
  const [active, setActive] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [name, setName] = useState("Claire Ruth");
  const [bio, setBio] = useState(
    "Exploring NYC one coffee shop at a time ☕ Food, views, and good company."
  );
  const [draftName, setDraftName] = useState(name);
  const [draftBio, setDraftBio] = useState(bio);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(initialSpots.slice(0, 3).map(s => s.id));
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");

  const choose = (section) => {
    setActive(section);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSaved = (id) => {
    setSaved((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const visibleSpots = initialSpots.filter((spot) => {
    const matchesSaved = saved.includes(spot.id);
    const matchesCategory = filter === "All" || spot.category === filter;
    const matchesSearch =
      `${spot.name} ${spot.area}`.toLowerCase().includes(search.toLowerCase());

    return matchesSaved && matchesCategory && matchesSearch;
  });

  const SavedSpots = ({ preview = false }) => (
    <section className="bp-panel">
      <div className="bp-section-heading">
        <div>
          <span className="bp-eyebrow">PLACES WORTH REMEMBERING</span>
          <h2>♡ My Saved Spots</h2>
        </div>
        {preview && (
          <button className="bp-link-button" onClick={() => choose("saved")}>
            See all →
          </button>
        )}
      </div>

      {!preview && (
        <div className="bp-spot-tools">
          <input
            placeholder="Search your saved places..."
            aria-label="Search saved places"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="bp-filters">
            {["All", "Food", "Nature", "Views", "Adventure"].map((item) => (
              <button
                key={item}
                className={filter === item ? "selected" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {visibleSpots.length ? (
        <div className="bp-spots">
          {visibleSpots.slice(0, preview ? 3 : undefined).map((spot) => (
            <article key={spot.id} className="bp-spot">
              <div className="bp-spot-image">
                <Photo src={spot.image} alt={spot.name} />
                <button
                  className="bp-heart"
                  aria-label={`Remove ${spot.name} from saved spots`}
                  onClick={() => toggleSaved(spot.id)}
                >
                  ♥
                </button>
              </div>
              <div className="bp-spot-details">
                <strong>{spot.name}</strong>
                <small>⌖ {spot.area}</small>
                <span>{spot.category}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="bp-empty">No saved spots match your search yet. ✦</p>
      )}
    </section>
  );

  const FriendsMap = ({ preview = false }) => (
    <section className="bp-panel">
      <div className="bp-section-heading">
        <div>
          <span className="bp-eyebrow">EXPLORING IS BETTER TOGETHER</span>
          <h2>⌖ Friends Map</h2>
        </div>
        {preview && (
          <button className="bp-link-button" onClick={() => choose("map")}>
            Explore map →
          </button>
        )}
      </div>

      <p className="bp-muted">
        See where your friends are exploring around NYC.
      </p>

     
     <FriendsMapWidget />

      <p className="bp-demo">
        Preview only — live locations will be connected to the Friends Map
        backend later.
      </p>
    </section>
  );

  const Memories = ({ preview = false }) => (
    <section className="bp-panel">
      <div className="bp-section-heading">
        <div>
          <span className="bp-eyebrow">EVERY BREADCRUMB TELLS A STORY</span>
          <h2>▧ My Memories</h2>
        </div>
        <button
          className="bp-link-button"
          onClick={() =>
            preview
              ? choose("memories")
              : setNotice("Memory uploads will be connected later.")
          }
        >
          {preview ? "See all →" : "+ Add memory"}
        </button>
      </div>

      <div className="bp-memories">
        {memories.slice(0, preview ? 2 : undefined).map((memory) => (
          <article className="bp-memory" key={memory.title}>
            <Photo src={memory.image} alt={memory.title} />
            <div>
              <small>{memory.date}</small>
              <h3>{memory.title}</h3>
            </div>
          </article>
        ))}
      </div>
    </section>
  );

  return (
    <div className="bp-page">
      {/* HEADER */}
      <header className="bp-header">
        <Link to="/" className="bp-brand">
          <span>✦</span> Breadcrumbs
        </Link>

        <nav className={menuOpen ? "bp-nav open" : "bp-nav"}>
          <Link to="/">Home</Link>
          <Link to="/#features">Explore</Link>
          <button onClick={() => choose("map")}>Friends Map</button>
          <button onClick={() => choose("saved")}>Saved</button>
          <button onClick={() => choose("memories")}>Memories</button>
        </nav>

        <div className="bp-header-actions">
          <button
            className="bp-profile-shortcut"
            onClick={() => choose("overview")}
            aria-label="Go to profile"
          >
            {name[0]}
          </button>
          <button
            className="bp-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </header>

      <div className="bp-shell">
        {/* SIDEBAR */}
        <aside className="bp-sidebar">
          <p>YOUR SPACE ✦</p>

          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => choose(item.id)}
              className={active === item.id ? "active" : ""}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div className="bp-sidebar-note">
            ✦ Little adventures make the best memories.
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="bp-content">
          <p className="bp-breadcrumb">
            MY BREADCRUMBS /{" "}
            <strong>{menuItems.find((item) => item.id === active)?.label}</strong>
          </p>

          {active === "overview" && (
            <>
              <div className="bp-overview-grid">
                <section className="bp-profile-card">
                  <div className="bp-cover">
                    <Photo
                      src="/assets/sunset.jpg"
                      alt="NYC skyline at sunset"
                    />
                    <div className="bp-cover-note">
                      Good food
                      <br />
                      Bright days
                      <br />
                      Same city ♡
                    </div>
                  </div>

                  <div className="bp-profile-information">
                    <div className="bp-large-avatar">{name[0]}</div>

                    <button
                      className="bp-edit-button"
                      onClick={() => {
                        setDraftName(name);
                        setDraftBio(bio);
                        setEditing(true);
                      }}
                    >
                      ✎ Edit Profile
                    </button>

                    <h1>{name}</h1>
                    <small>⌖ New York, NY</small>
                    <p>{bio}</p>

                    <div className="bp-stats">
                      <button onClick={() => choose("friends")}>
                        <strong>24</strong>
                        <span>Friends</span>
                      </button>
                      <div>
                        <strong>Jan 2024</strong>
                        <span>Date Joined</span>
                      </div>
                      <button onClick={() => choose("saved")}>
                        <strong>{saved.length}</strong>
                        <span>Saved Spots</span>
                      </button>
                    </div>
                  </div>
                </section>

                <div className="bp-overview-side">
                  <section className="bp-panel">
                    <h2>My Travel Stats ✈</h2>
                    <div className="bp-travel-stat">
                      🏙️ <span>Favorite Borough <strong>Manhattan</strong></span>
                    </div>
                    <div className="bp-travel-stat">
                      ☕ <span>Most Visited <strong>Coffee Shops</strong></span>
                    </div>
                    <div className="bp-travel-stat">
                      🌿 <span>Travel Style <strong>Foodie & Explorer</strong></span>
                    </div>
                  </section>

                  <section className="bp-panel">
                    <h2>Recent Activity ✦</h2>
                    <div className="bp-activity">♡ Saved new NYC spots</div>
                    <div className="bp-activity">▧ Collected a new memory</div>
                    <div className="bp-activity">⌖ Explored Brooklyn</div>
                  </section>
                </div>
              </div>

              <SavedSpots preview />
              <FriendsMap preview />
              <Memories preview />
            </>
          )}

          {active === "saved" && <SavedSpots />}
          {active === "map" && <FriendsMap />}
          {active === "memories" && <Memories />}

          {active === "friends" && (
            <section className="bp-panel">
              <div className="bp-section-heading">
                <div>
                  <span className="bp-eyebrow">YOUR NYC CREW</span>
                  <h2>♧ My Friends</h2>
                </div>
                <button
                  className="bp-link-button"
                  onClick={() => setNotice("Friend invitations coming soon!")}
                >
                  + Invite a friend
                </button>
              </div>

              <div className="bp-friends-grid">
                {friends.map((friend) => (
                  <article className="bp-friend-card" key={friend.name}>
                    <span
                      className="bp-friend-avatar"
                      style={{ background: friend.color }}
                    >
                      {friend.name[0]}
                    </span>
                    <h3>{friend.name}</h3>
                    <p>⌖ {friend.location}</p>
                    <button onClick={() => choose("map")}>
                      See on map →
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* EDIT PROFILE MODAL */}
      {editing && (
        <div className="bp-modal-backdrop">
          <div className="bp-modal" role="dialog" aria-modal="true">
            <h2>Edit your profile</h2>
            <label>
              Display name
              <input
                value={draftName}
                maxLength={40}
                onChange={(e) => setDraftName(e.target.value)}
              />
            </label>
            <label>
              Your bio
              <textarea
                value={draftBio}
                rows={4}
                maxLength={180}
                onChange={(e) => setDraftBio(e.target.value)}
              />
            </label>
            <div className="bp-modal-actions">
              <button onClick={() => setEditing(false)}>Cancel</button>
              <button
                onClick={() => {
                  if (!draftName.trim()) return;
                  setName(draftName.trim());
                  setBio(draftBio.trim());
                  setEditing(false);
                  setNotice("Profile updated for this preview! ✦");
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {notice && (
        <div className="bp-toast" role="status">
          {notice}
          <button onClick={() => setNotice("")}>✕</button>
        </div>
      )}
    </div>
  );
}
