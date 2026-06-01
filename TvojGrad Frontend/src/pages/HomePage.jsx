import { useEffect, useState } from "react";
import { CATEGORIES, CITIES } from "../constants";
import EventCard from "../components/EventCard";
import EventMap from "../components/EventMap";
import { API_BASE_URL, fetchEvents, fetchUserVote, getStoredUser, getUserId, removeLegacyVote, submitVote } from "../api";
import { dateLocale, translateText } from "../i18n";

const loadVotes = () => {
  try {
    const saved = localStorage.getItem("myVotes");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const saveVotes = (votes) => {
  localStorage.setItem("myVotes", JSON.stringify(votes));
};

export default function HomePage({ category, setCategory, city, setCity, search, setSearch, date, setDate, cities = CITIES, navigate, t = (key) => key, language = "SRB" }) {
  const [currentUser] = useState(getStoredUser);
  const [dbEvents, setDbEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [myVotes, setMyVotes] = useState(loadVotes);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (getUserId(currentUser)) {
      fetchFavorites();
    }
  }, [currentUser]);

  const loadEvents = async () => {
    try {
      const formattedData = await fetchEvents();
      setDbEvents(formattedData);

      const uid = getUserId(currentUser);
      if (uid) {
        const voteEntries = await Promise.all(
          formattedData.map(async (event) => [event.id, await fetchUserVote(event.id, uid)])
        );
        const nextVotes = Object.fromEntries(voteEntries.filter(([, vote]) => vote));
        setMyVotes(nextVotes);
        saveVotes(nextVotes);
      }
    } catch (error) {
      console.error("Greska pri ucitavanju dogadjaja:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const uid = getUserId(currentUser);
      const response = await fetch(`${API_BASE_URL}/OmiljeniDogadjaji/${uid}`);
      if (response.ok) {
        const data = await response.json();
        setFavorites((data || []).map((e) => e.ID));
      }
    } catch (error) {
      console.error("Greska pri ucitavanju omiljenih:", error);
    }
  };

  const handleVote = async (eventId, voteType) => {
    const uid = getUserId(currentUser);
    if (!uid) {
      alert("Morate biti ulogovani da biste glasali!");
      return;
    }
    if (myVotes[eventId] === voteType) return;

    const previousVote = myVotes[eventId];
    try {
      const updated = await submitVote(eventId, uid, voteType);
      let nextEvent = updated;
      if (previousVote && previousVote !== voteType && updated.__usedLegacyVoteEndpoint) {
        nextEvent = await removeLegacyVote(eventId, previousVote).catch(() => updated);
      }
      const nextVotes = { ...myVotes, [eventId]: voteType };
      setMyVotes(nextVotes);
      saveVotes(nextVotes);
      setDbEvents((prev) => prev.map((e) => (e.id === eventId ? nextEvent : e)));
    } catch (error) {
      console.error("Greska pri glasanju:", error);
      alert("Glas nije sacuvan. Provjerite da li je backend pokrenut.");
    }
  };

  const handleToggleFav = async (eventId) => {
    if (!currentUser) {
      alert("Morate biti ulogovani da biste dodali u omiljene!");
      return;
    }
    const uid = getUserId(currentUser);
    const isFav = favorites.includes(eventId);

    try {
      if (isFav) {
        await fetch(`${API_BASE_URL}/OmiljeniDogadjaji/${uid}/${eventId}`, { method: "DELETE" });
        setFavorites((prev) => prev.filter((id) => id !== eventId));
      } else {
        await fetch(`${API_BASE_URL}/OmiljeniDogadjaji/${uid}/${eventId}`, { method: "POST" });
        setFavorites((prev) => [...prev, eventId]);
      }
    } catch (error) {
      console.error("Greska pri izmjeni omiljenih:", error);
    }
  };

  const filteredEvents = dbEvents.filter((e) => {
    const matchesSearch = !search ||
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCity = !city || city === "Svi gradovi" || e.city === city;
    const matchesCategory = !category || category === "Sve" || e.Tip_dogadjaja === category || e.category === category;
    const eventDate = e.date ? String(e.date).slice(0, 10) : "";
    const matchesDate = !date || eventDate === date;
    return matchesSearch && matchesCity && matchesCategory && matchesDate;
  });

  const promotedEvents = dbEvents.filter((e) => e.promoted);

  if (loading) {
    return (
      <div className="main">
        <div className="empty">Ucitavanje dogadjaja...</div>
      </div>
    );
  }

  return (
    <>
      <div className="hero">
        <h1 className="hero-title">{t("heroTitleA")}<br /><em>{t("heroTitleB")}</em></h1>
        <p className="hero-sub">{t("heroSub")}</p>
        <div className="search-wrap">
          <input
            className="search-field search-text"
            placeholder={t("searchEvents")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="search-field search-select"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            {cities.map((c) => <option key={c} value={c}>{translateText(c, language)}</option>)}
          </select>
          <label className={`search-date${date ? " has-value" : ""}`}>
            <span>{date ? new Date(date).toLocaleDateString(dateLocale(language), { day: "numeric", month: "short" }) : t("date")}</span>
            <input
              type="date"
              aria-label="Datum dogadjaja"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
        </div>
        <div className="filter-chips">
          {CATEGORIES.map((c) => (
            <span key={c} className={`chip${category === c ? " active" : ""}`} onClick={() => setCategory(c)}>{translateText(c, language)}</span>
          ))}
        </div>
      </div>

      <div className="main">
        {promotedEvents.length > 0 && (
          <>
            <div className="section-header">
              <span className="section-title">{t("promoted")}</span>
            </div>
            <div className="grid">
              {promotedEvents.slice(0, 3).map((e) => (
                <EventCard
                  key={e.id}
                  event={e}
                  isFav={favorites.includes(e.id)}
                  myVote={myVotes[e.id]}
                  onUpvote={(id) => handleVote(id, "up")}
                  onDownvote={(id) => handleVote(id, "down")}
                  toggleFav={handleToggleFav}
                  navigate={navigate}
                  t={t}
                  language={language}
                />
              ))}
            </div>
            <div className="divider" />
          </>
        )}

        <div className="section-header">
          <span className="section-title">{t("allEvents")}</span>
          <span className="section-sub">{filteredEvents.length} {t("eventCount")}</span>
        </div>
        {filteredEvents.length > 0 ? (
          <div className="grid">
            {filteredEvents.map((e) => (
              <EventCard
                key={e.id}
                event={e}
                isFav={favorites.includes(e.id)}
                myVote={myVotes[e.id]}
                onUpvote={(id) => handleVote(id, "up")}
                onDownvote={(id) => handleVote(id, "down")}
                toggleFav={handleToggleFav}
                navigate={navigate}
                t={t}
                language={language}
              />
            ))}
          </div>
        ) : (
          <div className="empty">
            <span className="empty-icon">:(</span>
            {t("noEvents")}
          </div>
        )}
        <EventMap events={filteredEvents} title={t("eventsOnMap")} language={language} />
      </div>
    </>
  );
}
