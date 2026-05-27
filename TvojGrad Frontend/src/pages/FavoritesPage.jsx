import { useState, useEffect } from 'react';
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

const loadVotes = () => {
  try {
    const saved = localStorage.getItem("myVotes");
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
};

const saveVotes = (votes) => {
  localStorage.setItem("myVotes", JSON.stringify(votes));
};

export default function FavoritesPage({ navigate, user }) {
  const [favEvents, setFavEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myVotes, setMyVotes] = useState(loadVotes);

  const userId = user?.id || user?.ID;

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    fetchFavorites();
  }, [userId]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/OmiljeniDogadjaji/${userId}`);
      if (response.ok) {
        const data = await response.json();
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
          price: null,
          votes: {
            up: e.Upvote ?? 0,
            down: e.Downvote ?? 0
          }
        }));
        setFavEvents(formattedData);
      }
    } catch (error) {
      console.error("Mrežna greška:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (eventId) => {
    const currentVote = myVotes[eventId];
    if (currentVote === "up") return;

    try {
      const response = await fetch(`${API_BASE_URL}/dogadjaji/${eventId}/upvote`, { method: 'PUT' });
      if (response.ok) {
        const updated = await response.json();
        if (currentVote === "down") {
          await fetch(`${API_BASE_URL}/dogadjaji/${eventId}/removedownvote`, { method: 'PUT' });
        }
        const newVotes = { ...myVotes, [eventId]: "up" };
        setMyVotes(newVotes);
        saveVotes(newVotes);
        setFavEvents(prev => prev.map(e =>
          e.id === eventId
            ? { ...e, votes: { up: updated.Upvote, down: currentVote === "down" ? (updated.Downvote - 1) : updated.Downvote } }
            : e
        ));
      }
    } catch (error) { console.error("Greška pri upvote:", error); }
  };

  const handleDownvote = async (eventId) => {
    const currentVote = myVotes[eventId];
    if (currentVote === "down") return;

    try {
      const response = await fetch(`${API_BASE_URL}/dogadjaji/${eventId}/downvote`, { method: 'PUT' });
      if (response.ok) {
        const updated = await response.json();
        if (currentVote === "up") {
          await fetch(`${API_BASE_URL}/dogadjaji/${eventId}/removeupvote`, { method: 'PUT' });
        }
        const newVotes = { ...myVotes, [eventId]: "down" };
        setMyVotes(newVotes);
        saveVotes(newVotes);
        setFavEvents(prev => prev.map(e =>
          e.id === eventId
            ? { ...e, votes: { up: currentVote === "up" ? (updated.Upvote - 1) : updated.Upvote, down: updated.Downvote } }
            : e
        ));
      }
    } catch (error) { console.error("Greška pri downvote:", error); }
  };

  const handleToggleFav = async (eventId) => {
    try {
      await fetch(`${API_BASE_URL}/OmiljeniDogadjaji/${userId}/${eventId}`, { method: 'DELETE' });
      // Ukloni iz liste odmah
      setFavEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (error) {
      console.error("Greška pri uklanjanju iz omiljenih:", error);
    }
  };

  if (!user) {
    return (
      <div className="main">
        <div className="empty">
          <span className="empty-icon">🔒</span>
          Prijavite se da biste vidjeli omiljene događaje.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="main">
        <div className="empty">Učitavanje omiljenih događaja...</div>
      </div>
    );
  }

  return (
    <div className="main">
      <div className="page-header">
        <div className="page-title">❤️ Moji omiljeni</div>
        <div className="page-sub">{favEvents.length} sačuvanih događaja</div>
      </div>
      {favEvents.length > 0 ? (
        <div className="grid">
          {favEvents.map(e => (
            <EventCard
              key={e.id}
              event={e}
              isFav={true}
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
          <span className="empty-icon">💔</span>
          Niste sačuvali nijedan omiljeni događaj.
        </div>
      )}
    </div>
  );
}