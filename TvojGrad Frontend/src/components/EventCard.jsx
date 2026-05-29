import { CAT_COLORS, G } from "../constants";

export default function EventCard({ event: e, onUpvote, onDownvote, toggleFav, isFav, myVote, navigate }) {
  const id = e.id || e.ID;
  const title = e.title || e.Naslov;
  const category = e.Tip_dogadjaja || e.category;
  const date = e.date || e.Datum;
  const time = e.time || e.Vreme;
  const city = e.Grad || e.city;
  const organizer = e.organizer || e.Organizator;
  const price = e.price ?? e.Cijena;
  const votes = e.votes || { up: e.Upvote ?? 0, down: e.Downvote ?? 0 };

  return (
    <div className="card" onClick={() => navigate("detail", e)}>
      <div className="card-img" style={{ background: e.coverImg ? "none" : `${e.coverColor || G.green}33` }}>
        {e.coverImg ? <img src={e.coverImg} alt={title} /> : null}
        {e.promoted && <span className="card-promo">Promovisano</span>}
        <span className="card-img-emoji" style={{ display: e.coverImg ? "none" : "block" }}>{e.emoji}</span>
        <button className="card-fav" onClick={(ev) => { ev.stopPropagation(); toggleFav(id); }}>
          {isFav ? "❤️" : "🤍"}
        </button>
      </div>
      <div className="card-body">
        <div className="card-cat" style={{ color: CAT_COLORS[category] || G.green }}>
          {category}
        </div>
        <div className="card-title">{title}</div>
        <div className="card-meta">
          <div className="card-meta-row">
            {date ? new Date(date).toLocaleDateString("sr-Latn", { day: "numeric", month: "long", year: "numeric" }) : "Datum nije dostupan"}
          </div>
          <div className="card-meta-row">
            {time || "/"} · {city || "/"}
          </div>
          {organizer && (
            <div className="card-meta-row card-organizer">
              Organizator: {organizer}
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
        {myVote && (
          <span
            className="vote-state"
            style={{
              color: myVote === "up" ? "#1D9E75" : "#e74c3c",
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {myVote === "up" ? "Svidja ti se" : "Ne svidja ti se"}
          </span>
        )}
        <span className="price-tag">
          {price == null || price === 0 ? "Besplatno" : `${price} EUR`}
        </span>
      </div>
    </div>
  );
}
