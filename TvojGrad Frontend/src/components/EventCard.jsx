import { CAT_COLORS, G } from '../constants';

export default function EventCard({ event: e, vote, toggleFav, navigate }) {
  return (
    <div className="card" onClick={() => navigate("detail", e)}>
      <div className="card-img" style={{ background: e.coverImg ? "none" : (e.coverColor + "33") }}>
        {e.coverImg ? <img src={e.coverImg} alt={e.title} /> : null}
        {e.promoted && <span className="card-promo">⭐ Promovisano</span>}
        <span className="card-img-emoji" style={{ display: e.coverImg ? "none" : "block" }}>{e.emoji}</span>
        <button className="card-fav" onClick={ev => { ev.stopPropagation(); toggleFav(e.id); }}>
          {e.fav ? "❤️" : "🤍"}
        </button>
      </div>
      <div className="card-body">
        <div className="card-cat" style={{color: CAT_COLORS[e.category] || G.green}}>{e.category}</div>
        <div className="card-title">{e.title}</div>
        <div className="card-meta">
          <div className="card-meta-row">📅 {new Date(e.date).toLocaleDateString("sr-Latn",{day:"numeric",month:"long",year:"numeric"})}</div>
          <div className="card-meta-row">⏰ {e.time} &nbsp;·&nbsp; 📍 {e.location}, {e.city}</div>
        </div>
      </div>
      <div className="card-footer">
        <div className="votes">
          <button className={`vote-btn${e.myVote==="up"?" up-active":""}`} onClick={ev => { ev.stopPropagation(); vote(e.id,"up"); }}>👍 {e.votes.up}</button>
          <button className={`vote-btn${e.myVote==="down"?" down-active":""}`} onClick={ev => { ev.stopPropagation(); vote(e.id,"down"); }}>👎 {e.votes.down}</button>
        </div>
        <span className="price-tag">{e.price === 0 ? "Besplatno" : `${e.price}€`}</span>
      </div>
    </div>
  );
}
