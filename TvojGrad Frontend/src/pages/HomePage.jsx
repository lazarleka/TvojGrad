import { useState, useEffect } from 'react';
import { CATEGORIES, CITIES, G } from '../constants';
import EventCard from '../components/EventCard';

const API_BASE_URL = "http://localhost:8080";

const getEmojiByCategory = (type) => {
  switch(type?.toLowerCase()) {
    case 'koncert': return '🎵';
    case 'festival': return '🎪';
    case 'sportski dogadjaj': return '⚽';
    case 'izlozba': return '🎨';
    case 'pozoriste': return '🎭';
    case 'humanitarna akcija': return '❤️';
    case 'edukacija': return '📚';
    case 'sajam': return '🛍️';
    case 'proslava': return '🎉';
    default: return '📌';
  }
};

const getColorByCategory = (type) => {
  switch(type?.toLowerCase()) {
    case 'koncert': return '#1D9E75';
    case 'sportski dogadjaj': return '#3B6D11';
    case 'izlozba': return '#533AB7';
    case 'edukacija': return '#185FA5';
    case 'festival': return '#BA7517';
    default: return '#993556';
  }
};

// Glasovi se cuvaju u localStorage kao { eventId: "up" | "down" }
const loadVotes = () => {
  try {
    const saved = localStorage.getItem("myVotes");
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
};

const saveVotes = (votes) => {
  localStorage.setItem("myVotes", JSON.stringify(votes));
};

export default function HomePage({ category, setCategory, city, setCity, search, setSearch, navigate }) {

  const [currentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [dbEvents, setDbEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  // myVotes = { "123": "up", "456": "down" }
  const [myVotes, setMyVotes] = useState(loadVotes);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (currentUser?.ID || currentUser?.id) {
      fetchFavorites();
    }
  }, [currentUser]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dogadjaji`);
      if (response.ok) {
        const text = await response.text();
        if (!text) { setDbEvents([]); return; }
        const data = JSON.parse(text);
        const formattedData = (data || []).map(e => ({
          ...e,
          id: e.ID,
          title: e.Naslov,
          description: e.Opis,
          date: e.Datum,
          time: e.Vreme,
          city: e.Grad,
          coverColor: getColorByCategory(e.Tip_dogadjaja),
          emoji: e.slika_1 ? null : (e.Emoji || getEmojiByCategory(e.Tip_dogadjaja)),
          // ISPRAVKA: status je 'promovisana' ne 'promovisan'
          promoted: e.Status === "promovisana",
          price: e.Cijena ,
          votes: {
            up: e.Upvote ?? 0,
            down: e.Downvote ?? 0
          }
        }));
        setDbEvents(formattedData);
      }
    } catch (error) {
      console.error("Greška pri učitavanju događaja:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const uid = currentUser?.ID || currentUser?.id;
      const response = await fetch(`${API_BASE_URL}/OmiljeniDogadjaji/${uid}`);
      if (response.ok) {
        const data = await response.json();
        setFavorites((data || []).map(e => e.ID));
      }
    } catch (error) {
      console.error("Greška pri učitavanju omiljenih:", error);
    }
  };

  const handleUpvote = async (eventId) => {
    const currentVote = myVotes[eventId];

    // Ako je vec upvotovao, ne radi nista
    if (currentVote === "up") return;

    try {
      const response = await fetch(`${API_BASE_URL}/dogadjaji/${eventId}/upvote`, {
        method: 'PUT'
      });

      if (response.ok) {
        const updated = await response.json();

        // Ako je bio downvote, ponisti ga na backendu
        if (currentVote === "down") {
          await fetch(`${API_BASE_URL}/dogadjaji/${eventId}/removedownvote`, {
            method: 'PUT'
          });
        }

        // Azuriraj lokalni state
        const newVotes = { ...myVotes, [eventId]: "up" };
        setMyVotes(newVotes);
        saveVotes(newVotes);

        setDbEvents(prev => prev.map(e =>
          e.id === eventId
            ? {
                ...e,
                votes: {
                  up: updated.Upvote,
                  // Ako je bio downvote, smanji i downvote lokalno
                  down: currentVote === "down" ? (updated.Downvote - 1) : updated.Downvote
                }
              }
            : e
        ));
      }
    } catch (error) {
      console.error("Greška pri upvote:", error);
    }
  };

  const handleDownvote = async (eventId) => {
    const currentVote = myVotes[eventId];

    // Ako je vec downvotovao, ne radi nista
    if (currentVote === "down") return;

    try {
      const response = await fetch(`${API_BASE_URL}/dogadjaji/${eventId}/downvote`, {
        method: 'PUT'
      });

      if (response.ok) {
        const updated = await response.json();

        // Ako je bio upvote, ponisti ga na backendu
        if (currentVote === "up") {
          await fetch(`${API_BASE_URL}/dogadjaji/${eventId}/removeupvote`, {
            method: 'PUT'
          });
        }

        const newVotes = { ...myVotes, [eventId]: "down" };
        setMyVotes(newVotes);
        saveVotes(newVotes);

        setDbEvents(prev => prev.map(e =>
          e.id === eventId
            ? {
                ...e,
                votes: {
                  // Ako je bio upvote, smanji i upvote lokalno
                  up: currentVote === "up" ? (updated.Upvote - 1) : updated.Upvote,
                  down: updated.Downvote
                }
              }
            : e
        ));
      }
    } catch (error) {
      console.error("Greška pri downvote:", error);
    }
  };

  const handleToggleFav = async (eventId) => {
    if (!currentUser) {
      alert("Morate biti ulogovani da biste dodali u omiljene!");
      return;
    }
    const uid = currentUser?.ID || currentUser?.id;
    const isFav = favorites.includes(eventId);

    try {
      if (isFav) {
        await fetch(`${API_BASE_URL}/OmiljeniDogadjaji/${uid}/${eventId}`, { method: 'DELETE' });
        setFavorites(prev => prev.filter(id => id !== eventId));
      } else {
        await fetch(`${API_BASE_URL}/OmiljeniDogadjaji/${uid}/${eventId}`, { method: 'POST' });
        setFavorites(prev => [...prev, eventId]);
      }
    } catch (error) {
      console.error("Greška pri izmjeni omiljenih:", error);
    }
  };

  const filteredEvents = dbEvents.filter(e => {
    const meceSearch = !search ||
      (e.title && e.title.toLowerCase().includes(search.toLowerCase())) ||
      (e.description && e.description.toLowerCase().includes(search.toLowerCase()));
    const meceCity = !city || city === "Svi gradovi" || e.city === city;
    const meceCategory = !category || category === "Sve" || e.Tip_dogadjaja === category;
    return meceSearch && meceCity && meceCategory;
  });

  const promotedEvents = dbEvents.filter(e => e.promoted);

  if (loading) {
    return (
      <div className="main">
        <div className="empty">Učitavanje događaja...</div>
      </div>
    );
  }

  return (
    <>
      <div className="hero">
        <h1 className="hero-title">Tvoj grad,<br /><em>tvoja dešavanja</em></h1>
        <p className="hero-sub">Svi događaji u jednom mjestu. Pronađi, prati i pođi zajedno!</p>
        <div className="search-wrap">
          <input
            style={{flex:1,border:"none",outline:"none",fontSize:15,fontFamily:"'DM Sans',sans-serif",background:"transparent"}}
            placeholder="Pretraži događaje..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            style={{border:"none",outline:"none",fontSize:13,fontFamily:"'DM Sans',sans-serif",color:G.muted,background:"transparent",cursor:"pointer"}}
            value={city}
            onChange={e => setCity(e.target.value)}
          >
            {CITIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <button style={{background:G.green,color:"#fff",border:"none",borderRadius:10,padding:"10px 20px",fontSize:14,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",fontWeight:500}}>
            Pretraži
          </button>
        </div>
        <div className="filter-chips">
          {CATEGORIES.map(c => (
            <span key={c} className={`chip${category===c?" active":""}`} onClick={() => setCategory(c)}>{c}</span>
          ))}
        </div>
      </div>

      <div className="main">
        {promotedEvents.length > 0 && (
          <>
            <div className="section-header">
              <span className="section-title">⭐ Promovisano</span>
            </div>
            <div className="grid">
              {promotedEvents.slice(0, 3).map(e => (
                <EventCard
                  key={e.id}
                  event={e}
                  isFav={favorites.includes(e.id)}
                  myVote={myVotes[e.id]}
                  onUpvote={handleUpvote}
                  onDownvote={handleDownvote}
                  toggleFav={handleToggleFav}
                  navigate={navigate}
                />
              ))}
            </div>
            <div className="divider" />
          </>
        )}

        <div className="section-header">
          <span className="section-title">🗓 Svi događaji</span>
          <span className="section-sub">{filteredEvents.length} događaja</span>
        </div>
        {filteredEvents.length > 0 ? (
          <div className="grid">
            {filteredEvents.map(e => (
              <EventCard
                key={e.id}
                event={e}
                isFav={favorites.includes(e.id)}
                myVote={myVotes[e.id]}
                onUpvote={handleUpvote}
                onDownvote={handleDownvote}
                toggleFav={handleToggleFav}
                navigate={navigate}
              />
            ))}
          </div>
        ) : (
          <div className="empty">
            <span className="empty-icon">😕</span>
            Nema događaja koji odgovaraju filterima.
          </div>
        )}
      </div>
    </>
  );
}