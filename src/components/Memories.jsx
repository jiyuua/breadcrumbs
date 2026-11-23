
import { useState } from "react";
import "./Memories.css";

const starterMemories = [
  {
    id: 1,
    title: "A Brooklyn kind of day",
    date: "October 2026",
    location: "DUMBO, Brooklyn",
    description: "Good food, great company, and a beautiful day in Brooklyn.",
    photos: ["/assets/friendsnyc.jpg"],
    friends: ["Katherin", "Jin"],
    collection: "NYC Adventures",
    favorite: false,
    comments: [],
  },
  {
    id: 2,
    title: "Coffee & conversations",
    date: "September 2026",
    location: "Manhattan",
    description: "A little coffee break worth remembering.",
    photos: ["/assets/cafe.jpg"],
    friends: [],
    collection: "Coffee & Bites",
    favorite: false,
    comments: [],
  },
  {
    id: 3,
    title: "City lights",
    date: "August 2026",
    location: "Times Square",
    description: "New York really does hit different at night.",
    photos: ["/assets/timessquare-new.jpg"],
    friends: [],
    collection: "NYC Adventures",
    favorite: false,
    comments: [],
  },
];

const emptyForm = {
  title: "",
  location: "",
  description: "",
  collection: "NYC Adventures",
  friends: "",
};

export default function Memories({ preview = false, onSeeAll }) {
  const [memories, setMemories] = useState(starterMemories);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [uploads, setUploads] = useState([]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [comment, setComment] = useState("");

  const selectedMemory = memories.find((m) => m.id === selected);

  const visible = memories.filter((memory) => {
    const matchesSearch = [
      memory.title,
      memory.location,
      memory.description,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      (filter === "Favorites" && memory.favorite) ||
      (filter === "With Friends" && memory.friends.length > 0);

    return matchesSearch && matchesFilter;
  });

  const toggleFavorite = (id) => {
    setMemories((previous) =>
      previous.map((memory) =>
        memory.id === id
          ? { ...memory, favorite: !memory.favorite }
          : memory
      )
    );
  };

  const handlePhotos = (event) => {
    const files = Array.from(event.target.files || []);
    const remaining = 6 - uploads.length;
    const accepted = files.slice(0, remaining);

    const readers = accepted.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers).then((photos) => {
      setUploads((previous) => [...previous, ...photos].slice(0, 6));
    });
    event.target.value = "";
  };

  const createMemory = (event) => {
    event.preventDefault();

    if (!form.title.trim() || uploads.length === 0) return;

    const memory = {
      id: Date.now(),
      title: form.title.trim(),
      date: new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      location: form.location.trim() || "New York City",
      description: form.description.trim(),
      collection: form.collection,
      friends: form.friends
        .split(",")
        .map((friend) => friend.trim())
        .filter(Boolean),
      photos: uploads,
      favorite: false,
      comments: [],
    };

    setMemories((previous) => [memory, ...previous]);
    setCreating(false);
    setForm(emptyForm);
    setUploads([]);
    setSearch("");
    setFilter("All");
  };

  const addComment = (event) => {
    event.preventDefault();
    if (!comment.trim() || selected === null) return;

    setMemories((previous) =>
      previous.map((memory) =>
        memory.id === selected
          ? {
              ...memory,
              comments: [
                ...memory.comments,
                { id: Date.now(), author: "You", text: comment.trim() },
              ],
            }
          : memory
      )
    );
    setComment("");
  };

  return (
    <section className="bp-panel bp-memories-panel">
      <div className="bp-section-heading">
        <div>
          <span className="bp-eyebrow">
            EVERY BREADCRUMB TELLS A STORY
          </span>
          <h2>▧ My Memories</h2>
          {!preview && (
            <p className="bp-memory-subtitle">
              A little collection of moments worth keeping.
            </p>
          )}
        </div>

        <button
          className="bp-memory-create"
          onClick={() => (preview ? onSeeAll?.() : setCreating(true))}
        >
          {preview ? "See all →" : "+ Add memory"}
        </button>
      </div>

      {!preview && (
        <div className="bp-memory-toolbar">
          <input
            type="search"
            placeholder="Search your memories..."
            aria-label="Search memories"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="bp-memory-filters">
            {["All", "With Friends", "Favorites"].map((item) => (
              <button
                key={item}
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {visible.length === 0 ? (
        <p className="bp-memory-empty">
          No memories found. Your next adventure is waiting! ✦
        </p>
      ) : (
        <div className="bp-memories">
          {visible.slice(0, preview ? 2 : undefined).map((memory) => (
            <article className="bp-memory" key={memory.id}>
              <div className="bp-memory-image-wrap">
                <button
                  className="bp-memory-open"
                  onClick={() => {
                    setSelected(memory.id);
                    setPhotoIndex(0);
                  }}
                  aria-label={`View ${memory.title}`}
                >
                  <img src={memory.photos[0]} alt={memory.title} />
                </button>

                {!preview && (
                  <button
                    className={`bp-memory-favorite ${
                      memory.favorite ? "active" : ""
                    }`}
                    onClick={() => toggleFavorite(memory.id)}
                    aria-label={
                      memory.favorite ? "Remove favorite" : "Add favorite"
                    }
                  >
                    {memory.favorite ? "♥" : "♡"}
                  </button>
                )}
              </div>

              <div className="bp-memory-card-content">
                <small>{memory.date}</small>
                <h3>{memory.title}</h3>
                <p>⌖ {memory.location}</p>

                {!preview && (
                  <div className="bp-memory-card-footer">
                    <span>▧ {memory.photos.length} photos</span>
                    <span>♡ {memory.comments.length} comments</span>
                  </div>
                )}

                <button
                  className="bp-memory-view-link"
                  onClick={() => {
                    setSelected(memory.id);
                    setPhotoIndex(0);
                  }}
                >
                  View memory →
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedMemory && (
        <div
          className="bp-memory-backdrop"
          onClick={() => setSelected(null)}
        >
          <div
            className="bp-memory-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={selectedMemory.title}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="bp-memory-close"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              ×
            </button>

            <div className="bp-memory-gallery">
              <img
                src={selectedMemory.photos[photoIndex]}
                alt={selectedMemory.title}
              />

              {selectedMemory.photos.length > 1 && (
                <div className="bp-memory-gallery-controls">
                  <button
                    onClick={() =>
                      setPhotoIndex((previous) =>
                        (previous - 1 + selectedMemory.photos.length) %
                        selectedMemory.photos.length
                      )
                    }
                    aria-label="Previous photo"
                  >
                    ←
                  </button>
                  <span>
                    {photoIndex + 1} / {selectedMemory.photos.length}
                  </span>
                  <button
                    onClick={() =>
                      setPhotoIndex((previous) =>
                        (previous + 1) % selectedMemory.photos.length
                      )
                    }
                    aria-label="Next photo"
                  >
                    →
                  </button>
                </div>
              )}
            </div>

            <div className="bp-memory-dialog-content">
              <small>{selectedMemory.date}</small>
              <h2>{selectedMemory.title}</h2>
              <p>⌖ {selectedMemory.location}</p>
              <p>{selectedMemory.description}</p>

              <p className="bp-memory-collection">
                ▧ {selectedMemory.collection}
              </p>

              {selectedMemory.friends.length > 0 && (
                <p>
                  With {selectedMemory.friends.join(", ")}
                </p>
              )}

              <button
                className="bp-memory-like"
                onClick={() => toggleFavorite(selectedMemory.id)}
              >
                {selectedMemory.favorite ? "♥ Favorited" : "♡ Add to favorites"}
              </button>

              <div className="bp-memory-comments">
                <h3>Comments</h3>

                {selectedMemory.comments.length === 0 && (
                  <p>No comments yet. Start the conversation!</p>
                )}

                {selectedMemory.comments.map((entry) => (
                  <div key={entry.id} className="bp-memory-comment">
                    <strong>{entry.author}</strong>
                    <p>{entry.text}</p>
                  </div>
                ))}

                <form onSubmit={addComment}>
                  <input
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Leave a little note..."
                    aria-label="Write a comment"
                  />
                  <button type="submit">Post</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {creating && (
        <div
          className="bp-memory-backdrop"
          onClick={() => setCreating(false)}
        >
          <div
            className="bp-memory-dialog bp-memory-create-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Create memory"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="bp-memory-close"
              onClick={() => setCreating(false)}
              aria-label="Close"
            >
              ×
            </button>

            <h2>Create a Memory ✦</h2>
            <p>Save the little moments that made your day special.</p>

            <form onSubmit={createMemory}>
              <label>
                Memory title
                <input
                  required
                  maxLength={80}
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="A day worth remembering..."
                />
              </label>

              <label>
                Location
                <input
                  value={form.location}
                  onChange={(event) =>
                    setForm({ ...form, location: event.target.value })
                  }
                  placeholder="Where did you go?"
                />
              </label>

              <label>
                Your story
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Tell us about this memory..."
                />
              </label>

              <label>
                Collection
                <select
                  value={form.collection}
                  onChange={(event) =>
                    setForm({ ...form, collection: event.target.value })
                  }
                >
                  <option>NYC Adventures</option>
                  <option>Coffee & Bites</option>
                  <option>With Friends</option>
                  <option>Little Moments</option>
                </select>
              </label>

              <label>
                Friends (separate names with commas)
                <input
                  value={form.friends}
                  onChange={(event) =>
                    setForm({ ...form, friends: event.target.value })
                  }
                  placeholder="Katherin, Jin, Omar"
                />
              </label>

              <label>
                Upload photos (up to 6)
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotos}
                  disabled={uploads.length >= 6}
                />
              </label>

              <p>{uploads.length} / 6 photos selected</p>

              {uploads.length > 0 && (
                <div className="bp-memory-upload-preview">
                  {uploads.map((photo, index) => (
                    <div key={index}>
                      <img src={photo} alt={`Upload ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() =>
                          setUploads((previous) =>
                            previous.filter((_, i) => i !== index)
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="bp-memory-submit"
                type="submit"
                disabled={!form.title.trim() || uploads.length === 0}
              >
                Save Memory ✦
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
