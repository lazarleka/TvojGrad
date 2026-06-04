import { CAT_COLORS, G } from "../constants";
import { translateText } from "../i18n";
import { formatDisplayDate, formatDisplayTime, getEventAddress } from "../api";

export default function EventCard({ event: e, onUpvote, onDownvote, toggleFav, isFav, myVote, navigate, t = (key) => key, language = "SRB" }) {
  const id = e.id || e.ID;
  const title = e.title || e.Naslov;
  const category = e.Tip_dogadjaja || e.category;
  const date = e.date || e.Datum;
  const time = e.time || e.Vreme;
  const city = e.Grad || e.city;
  const address = getEventAddress(e);
  const organizer = e.organizer || e.Organizator;
  const price = e.price ?? e.Cijena;
  const votes = e.votes || { up: e.Upvote ?? 0, down: e.Downvote ?? 0 };
  const displayTime = formatDisplayTime(time);

  return (
    <div className="card" onClick={() => navigate("detail", e)}>
      <div className="card-img" style={{ background: e.coverImg ? "none" : `${e.coverColor || G.green}33` }}>
        {e.coverImg ? <img src={e.coverImg} alt={translateText(title, language)} /> : null}
        {e.promoted && <span className="card-promo">{t("promoted")}</span>}
        <span className="card-img-emoji" style={{ display: e.coverImg ? "none" : "block" }}>{e.emoji}</span>
        <button className="card-fav" onClick={(ev) => { ev.stopPropagation(); toggleFav(id); }}>
          {isFav ? "♥" : "♡"}
        </button>
      </div>
      <div className="card-body">
        <div className="card-cat" style={{ color: CAT_COLORS[category] || G.green }}>
          {translateText(category, language)}
        </div>
        <div className="card-title">{translateText(title, language)}</div>
        <div className="card-meta">
          <div className="card-meta-row">
            {date ? formatDisplayDate(date) : t("dateUnavailable")}
          </div>
          <div className="card-meta-row">
            {displayTime} · {translateText(city, language) || "/"}
          </div>
          <div className="card-meta-row">
            {address ? translateText(address, language) : translateText("Lokacija nije unesena", language)}
          </div>
          {organizer && (
            <div className="card-meta-row card-organizer">
              {t("organizer")}: {organizer}
            </div>
          )}
        </div>
      </div>
      <div className="card-footer">
        <div className="votes">
          <button
            className="vote-btn"
            style={{
              background: myVote === "up" ? "#1D9E75" : "transparent",
              color: myVote === "up" ? "#fff" : "inherit",
              border: myVote === "up" ? "1.5px solid #1D9E75" : "1.5px solid #eee",
              fontWeight: myVote === "up" ? 700 : 400,
            }}
            onClick={(ev) => { ev.stopPropagation(); onUpvote(id); }}
          >
            👍 {votes.up}
          </button>
          <button
            className="vote-btn"
            style={{
              background: myVote === "down" ? "#e74c3c" : "transparent",
              color: myVote === "down" ? "#fff" : "inherit",
              border: myVote === "down" ? "1.5px solid #e74c3c" : "1.5px solid #eee",
              fontWeight: myVote === "down" ? 700 : 400,
            }}
            onClick={(ev) => { ev.stopPropagation(); onDownvote(id); }}
          >
            👎 {votes.down}
          </button>
        </div>
        <span
          className={`vote-state ${myVote ? "" : "vote-state-placeholder"}`}
          style={{
            color: myVote === "up" ? "#1D9E75" : "#e74c3c",
            fontSize: 12,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {myVote === "up" ? t("liked") : myVote === "down" ? t("disliked") : "Rezervisano"}
        </span>
        <span className="price-tag">
          {price == null || price === 0 ? t("free") : `${price} EUR`}
        </span>
      </div>
    </div>
  );
}
