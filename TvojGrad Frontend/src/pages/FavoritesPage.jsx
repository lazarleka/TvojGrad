import { useEffect, useState } from "react";
import EventCard from "../components/EventCard";
import { API_BASE_URL, fetchUserVote, formatEvent, getUserId, removeLegacyVote, submitVote } from "../api";

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

export default function FavoritesPage({ navigate, user }) {
  const [favEvents, setFavEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myVotes, setMyVotes] = useState(loadVotes);

  const userId = getUserId(user);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    fetchFavorites();
  }, [userId]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/OmiljeniDogadjaji/${userId}`);
      if (response.ok) {
        const data = await response.json();
        const formattedData = (data || []).map(formatEvent);
        setFavEvents(formattedData);

        const voteEntries = await Promise.all(
          formattedData.map(async (event) => [event.id, await fetchUserVote(event.id, userId)])
        );
        const nextVotes = Object.fromEntries(voteEntries.filter(([, vote]) => vote));
        setMyVotes(nextVotes);
        saveVotes(nextVotes);
      }
    } catch (error) {
      console.error("Mrezna greska:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (eventId, voteType) => {
    if (myVotes[eventId] === voteType) return;

    const previousVote = myVotes[eventId];
    try {
      const updated = await submitVote(eventId, userId, voteType);
      let nextEvent = updated;
      if (previousVote && previousVote !== voteType) {
        nextEvent = await removeLegacyVote(eventId, previousVote).catch(() => updated);
      }
      const nextVotes = { ...myVotes, [eventId]: voteType };
      setMyVotes(nextVotes);
      saveVotes(nextVotes);
      setFavEvents((prev) => prev.map((e) => (e.id === eventId ? nextEvent : e)));
    } catch (error) {
      console.error("Greska pri glasanju:", error);
      alert("Glas nije sacuvan. Provjerite da li je backend pokrenut.");
    }
  };

  const handleToggleFav = async (eventId) => {
    try {
      await fetch(`${API_BASE_URL}/OmiljeniDogadjaji/${userId}/${eventId}`, { method: "DELETE" });
      setFavEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (error) {
      console.error("Greska pri uklanjanju iz omiljenih:", error);
    }
  };

  if (!user) {
    return (
      <div className="main">
        <div className="empty">
          <span className="empty-icon">🔒</span>
          Prijavite se da biste vidjeli omiljene dogadjaje.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="main">
        <div className="empty">Ucitavanje omiljenih dogadjaja...</div>
      </div>
    );
  }

  return (
    <div className="main">
      <div className="page-header">
        <div className="page-title">Moji omiljeni</div>
        <div className="page-sub">{favEvents.length} sacuvanih dogadjaja</div>
      </div>
      {favEvents.length > 0 ? (
        <div className="grid">
          {favEvents.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              isFav={true}
              myVote={myVotes[e.id]}
              onUpvote={(id) => handleVote(id, "up")}
              onDownvote={(id) => handleVote(id, "down")}
              toggleFav={handleToggleFav}
              navigate={navigate}
            />
          ))}
        </div>
      ) : (
        <div className="empty">
          <span className="empty-icon">♡</span>
          Niste sacuvali nijedan omiljeni dogadjaj.
        </div>
      )}
    </div>
  );
}
