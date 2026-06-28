import { useEffect, useState } from "react";
import { fetchEvents, formatDisplayDate, getEventAddress } from "../api";
import { translateText } from "../i18n";

const eventDateTime = (event) => {
  const date = String(event?.date || event?.Datum || "").slice(0, 10);
  if (!date) return 0;
  const time = String(event?.time || event?.Vreme || "23:59").slice(0, 5);
  const value = new Date(`${date}T${time || "23:59"}:00`).getTime();
  return Number.isFinite(value) ? value : 0;
};

export default function PopularPage({ navigate, t = (key) => key, language = "SRB" }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents()
      .then((data) => {
        const now = Date.now();
        setEvents([...data]
          .filter((event) => eventDateTime(event) >= now)
          .sort((a, b) => (b.votes?.up || 0) - (a.votes?.up || 0)));
      })
      .catch((error) => console.error("Greška pri učitavanju popularnih:", error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="main">
        <div className="empty">{t("loadingPopular")}</div>
      </div>
    );
  }

  return (
    <div className="main">
      <div className="page-header">
        <div className="page-title">{t("mostPopular")}</div>
        <div className="page-sub">{t("sortedByVotes")}</div>
      </div>
      {events.map((event, index) => (
        <div key={event.id} className="popular-item" onClick={() => navigate("detail", event)}>
          <div className="popular-rank">#{index + 1}</div>
          <div className="popular-emoji">{event.emoji}</div>
          <div className="popular-info">
            <div className="popular-name">{translateText(event.title, language)}</div>
            <div className="popular-meta">
              {formatDisplayDate(event.date)} · {translateText(event.city, language)}
            </div>
            <div className="popular-meta">
              {getEventAddress(event) ? translateText(getEventAddress(event), language) : translateText("Lokacija nije unesena", language)}
            </div>
          </div>
          <div className="popular-votes">👍 {event.votes.up}</div>
        </div>
      ))}
    </div>
  );
}
