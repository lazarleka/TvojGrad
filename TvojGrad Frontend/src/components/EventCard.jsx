import { CAT_COLORS, G } from '../constants';

const getCurrentUser = () => {
  try {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
};

export default function EventCard({ event: e, onUpvote, onDownvote, toggleFav, isFav, myVote, navigate }) {
  const currentUser = getCurrentUser();
  const isLoggedIn = !!currentUser;

  return (
    <div className="card" onClick={() => navigate("detail", e)}>
      <div className="card-img" style={{ background: e.coverImg ? "none" : (e.coverColor + "33") }}>
        {e.coverImg ? <img src={e.coverImg} alt={e.title} /> : null}
        {e.promoted && <span className="card-promo">⭐ Promovisano</span>}
        <span className="card-img-emoji" style={{ display: e.coverImg ? "none" : "block" }}>{e.emoji}</span>

        {/* Srce se prikazuje samo ulogovanim */}
        {isLoggedIn && (
          <button className="card-fav" onClick={ev => { ev.stopPropagation(); toggleFav(e.id); }}>
            {isFav ? "❤️" : "🤍"}
          </button>
        )}
      </div>

      <div className="card-body">
        <div className="card-cat" style={{color: CAT_COLORS[e.Tip_dogadjaja] || CAT_COLORS[e.category] || G.green}}>
          {e.Tip_dogadjaja || e.category}
        </div>
        <div className="card-title">{e.title || e.Naslov}</div>
        <div className="card-meta">
          <div className="card-meta-row">
            📅 {e.date ? new Date(e.date).toLocaleDateString("sr-Latn", {day:"numeric", month:"long", year:"numeric"}) : "Datum nije dostupan"}
          </div>
          <div className="card-meta-row">
            ⏰ {e.time || e.Vreme || "/"} &nbsp;·&nbsp; 📍 {e.Grad || e.city || "/"}
          </div>
        </div>
      </div>

      <div className="card-footer">
        {/* Vote dugmad se prikazuju samo ulogovanim */}
        {isLoggedIn ? (
          <div className="votes">
            <button
              className="vote-btn"
              style={{
                background: myVote === "up" ? "#1D9E75" : "transparent",
                color: myVote === "up" ? "#fff" : "inherit",
                border: myVote === "up" ? "1.5px solid #1D9E75" : "1.5px solid #eee",
                fontWeight: myVote === "up" ? 700 : 400,
                transition: "all 0.2s"
              }}
              onClick={ev => { ev.stopPropagation(); onUpvote(e.id); }}
            >
              👍 {e.votes?.up ?? 0}
            </button>
            <button
              className="vote-btn"
              style={{
                background: myVote === "down" ? "#e74c3c" : "transparent",
                color: myVote === "down" ? "#fff" : "inherit",
                border: myVote === "down" ? "1.5px solid #e74c3c" : "1.5px solid #eee",
                fontWeight: myVote === "down" ? 700 : 400,
                transition: "all 0.2s"
              }}
              onClick={ev => { ev.stopPropagation(); onDownvote(e.id); }}
            >
              👎 {e.votes?.down ?? 0}
            </button>
          </div>
        ) : (
          // Kad je odjavljen, samo prikazi brojeve bez dugmadi
          <div className="votes" style={{color: "#aaa", fontSize: 14}}>
            👍 {e.votes?.up ?? 0} &nbsp; 👎 {e.votes?.down ?? 0}
          </div>
        )}

        <span className="price-tag">
          {e.price == null ? "Besplatno" : e.price === 0 ? "Besplatno" : `${e.price}€`}
        </span>
      </div>
    </div>
  );
}