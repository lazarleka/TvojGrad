import { useEffect, useState } from "react";
import { fetchEvents, getEventAddress } from "../api";
import { dateLocale, translateText } from "../i18n";

export default function PopularPage({ navigate, t = (key) => key, language = "SRB" }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents()
      .then((data) => {
        setEvents([...data].sort((a, b) => (b.votes?.up || 0) - (a.votes?.up || 0)));
      })
      .catch((error) => console.error("Greska pri ucitavanju popularnih:", error))
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
      {events.map((e, i) => (
        <div key={e.id} className="popular-item" onClick={() => navigate("detail", e)}>
          <div className="popular-rank">#{i + 1}</div>
          <div className="popular-emoji">{e.emoji}</div>
          <div className="popular-info">
            <div className="popular-name">{translateText(e.title, language)}</div>
            <div className="popular-meta">
              {new Date(e.date).toLocaleDateString(dateLocale(language), { day: "numeric", month: "long" })} · {translateText(e.city, language)}
            </div>
            <div className="popular-meta">
              {getEventAddress(e) ? translateText(getEventAddress(e), language) : translateText("Lokacija nije unesena", language)}
            </div>
          </div>
          <div className="popular-votes">👍 {e.votes.up}</div>
        </div>
      ))}
    </div>
  );
}
