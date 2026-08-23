"use client";

import { useEffect, useMemo, useState } from "react";

type Category = "Signals" | "Products" | "Research" | "Practice";
type Filter = "All" | Category;

type Story = {
  id: string;
  category: Category;
  source: string;
  title: string;
  summary: string;
  why: string;
  time: string;
  readMinutes: number;
  read: boolean;
  saved: boolean;
};

const CATEGORIES: Category[] = ["Signals", "Products", "Research", "Practice"];

const SEED: Story[] = [
  {
    id: "small-models",
    category: "Signals",
    source: "FIELD NOTE / COMPUTING",
    title: "Small models are changing what a useful tool can be",
    summary: "When capability becomes cheap enough to sit inside the workflow, the product question moves from access to judgment.",
    why: "Useful for deciding where an AI feature should stay quiet, local, and inspectable.",
    time: "08:40",
    readMinutes: 4,
    read: false,
    saved: true,
  },
  {
    id: "calm-software",
    category: "Products",
    source: "DESIGN DESK / INTERFACES",
    title: "The best interface may be the one that leaves room to think",
    summary: "A product can communicate confidence through pacing, hierarchy, and the restraint to keep a secondary action secondary.",
    why: "A useful counterweight when a portfolio surface starts accumulating features faster than meaning.",
    time: "YESTERDAY",
    readMinutes: 6,
    read: true,
    saved: false,
  },
  {
    id: "retrieval",
    category: "Research",
    source: "RESEARCH LOG / KNOWLEDGE",
    title: "Retrieval is a product decision, not a search box",
    summary: "The shape of a memory system determines which questions feel askable and which context quietly disappears.",
    why: "Worth reading before adding another index, tag, or filter to a personal knowledge tool.",
    time: "18 AUG",
    readMinutes: 5,
    read: false,
    saved: false,
  },
  {
    id: "shipping",
    category: "Practice",
    source: "STUDIO MEMO / SOLO WORK",
    title: "Shipping small is a way to protect attention",
    summary: "A narrow release creates a real surface to learn from; a perfect plan mostly creates another place to hide.",
    why: "A reminder for choosing the next experiment without exposing the whole operating system.",
    time: "16 AUG",
    readMinutes: 3,
    read: false,
    saved: false,
  },
  {
    id: "interfaces",
    category: "Products",
    source: "OBSERVATION / WEB",
    title: "A page can feel fast before it is technically fast",
    summary: "Clear anticipation, stable layout, and a visible first answer reduce the feeling of waiting more than motion alone.",
    why: "Useful when tuning page transitions and deciding what should appear before a route settles.",
    time: "12 AUG",
    readMinutes: 4,
    read: false,
    saved: false,
  },
];

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      // Browser storage is external state; this read intentionally follows hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      // Keep the sample edition if storage is unavailable.
    }
    setReady(true);
  }, [key]);

  useEffect(() => {
    if (ready) localStorage.setItem(key, JSON.stringify(value));
  }, [key, value, ready]);

  return [value, setValue] as const;
}

export default function Home() {
  const [stories, setStories] = useLocalStorage<Story[]>("news-desk-v2", SEED);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [selectedId, setSelectedId] = useState(SEED[0]?.id ?? "");
  const [notice, setNotice] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return stories.filter((story) => {
      const matchesFilter = filter === "All" || story.category === filter;
      const matchesQuery = !needle || `${story.title} ${story.summary} ${story.source} ${story.category}`.toLowerCase().includes(needle);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query, stories]);

  const selected = stories.find((story) => story.id === selectedId) ?? visible[0] ?? stories[0];
  const unreadCount = stories.filter((story) => !story.read).length;
  const savedCount = stories.filter((story) => story.saved).length;

  function updateStory(id: string, changes: Partial<Story>, message: string) {
    setStories((current) => current.map((story) => story.id === id ? { ...story, ...changes } : story));
    setNotice(message);
  }

  return (
    <main className="news-desk">
      <div className="desk-frame">
        <header className="desk-header">
          <div className="desk-mark"><span className="mark-rule" aria-hidden="true" />NEWS DESK</div>
          <p>SAMPLE EDITION · PRIVATE READING QUEUE</p>
        </header>

        <section className="desk-masthead" aria-labelledby="page-title">
          <div>
            <h1 id="page-title">What deserves a closer look?</h1>
            <p>A small briefing for the moment between noticing a headline and deciding whether it belongs in your day.</p>
          </div>
          <div className="edition-stamp">
            <span>EDITION 01</span>
            <strong>23 AUG<br />2026</strong>
            <span>CURATED SAMPLE · NOT LIVE NEWS</span>
          </div>
        </section>

        <section className="desk-body" aria-label="News reading desk">
          <aside className="desk-sidebar">
            <div className="sidebar-block">
              <p className="label">READING QUEUE</p>
              <div className="queue-line"><span>Unread</span><strong>{unreadCount.toString().padStart(2, "0")}</strong></div>
              <div className="queue-line"><span>Saved for later</span><strong>{savedCount.toString().padStart(2, "0")}</strong></div>
            </div>
            <div className="sidebar-block beat-block">
              <p className="label">FILTER BY BEAT</p>
              <div className="beat-list" role="group" aria-label="Filter stories by beat">
                {(["All", ...CATEGORIES] as const).map((item) => (
                  <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>
                    <span>{item}</span><small>{item === "All" ? stories.length : stories.filter((story) => story.category === item).length}</small>
                  </button>
                ))}
              </div>
            </div>
            <p className="sidebar-note">This desk contains five deterministic sample notes. There is no feed connection behind it.</p>
          </aside>

          <div className="desk-reading">
            <div className="reading-tools">
              <label className="search-line">
                <span>SEARCH THE EDITION</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Headline, source, or beat" />
              </label>
              <span className="result-count">{visible.length} OF {stories.length} NOTES</span>
            </div>

            {selected && (
              <article className="lead-story" aria-labelledby="story-title">
                <div className="story-kicker"><span>{selected.category}</span><span>{selected.source}</span></div>
                <h2 id="story-title">{selected.title}</h2>
                <p className="lead-summary">{selected.summary}</p>
                <div className="why-read"><span className="label">WHY READ IT</span><p>{selected.why}</p></div>
                <div className="story-actions">
                  <button type="button" className="primary-action" aria-pressed={selected.read} onClick={() => updateStory(selected.id, { read: !selected.read }, selected.read ? "Marked unread." : "Marked read for this browser.")}>{selected.read ? "Mark unread" : "Mark as read"}</button>
                  <button type="button" className="secondary-action" aria-pressed={selected.saved} onClick={() => updateStory(selected.id, { saved: !selected.saved }, selected.saved ? "Removed from saved notes." : "Saved for later in this browser.")}>{selected.saved ? "Remove saved note" : "Save for later"}</button>
                  <span className="story-time">{selected.readMinutes} MIN READ · {selected.time}</span>
                </div>
                <p className="story-notice" role="status" aria-live="polite">{notice}</p>
              </article>
            )}

            <div className="story-list-heading"><p className="label">THE REST OF THE EDITION</p><span>Select a row to change the reading</span></div>
            {visible.length > 0 ? (
              <ol className="story-list">
                {visible.map((story) => (
                  <li key={story.id}>
                    <button type="button" className={`story-row${selected?.id === story.id ? " is-selected" : ""}`} onClick={() => { setSelectedId(story.id); setNotice(""); }}>
                      <span className="story-row-index">{story.read ? "READ" : "NEW"}</span>
                      <span className="story-row-main"><strong>{story.title}</strong><span>{story.category} · {story.source}</span></span>
                      <span className="story-row-end"><span>{story.time}</span><span className={`saved-mark${story.saved ? " is-saved" : ""}`} aria-hidden="true" /></span>
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="empty-desk"><strong>No story in this cut.</strong><span>Try another beat or clear the search.</span></div>
            )}
          </div>
        </section>

        <footer className="desk-footer"><span>NEWS DESK · EDITION 01</span><span>Context before click. Sample content, plainly labelled.</span></footer>
      </div>
    </main>
  );
}
