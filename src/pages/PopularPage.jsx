export default function PopularPage({ events, navigate }) {
  return (
    <div className="main">
      <div className="page-header">
        <div className="page-title">🔥 Najpopularniji događaji</div>
        <div className="page-sub">Sortirano prema glasovima korisnika</div>
      </div>
      {events.map((e, i) => (
        <div key={e.id} className="popular-item" onClick={() => navigate("detail", e)}>
          <div className="popular-rank">#{i+1}</div>
          <div className="popular-emoji">{e.emoji}</div>
          <div className="popular-info">
            <div className="popular-name">{e.title}</div>
            <div className="popular-meta">📅 {new Date(e.date).toLocaleDateString("sr-Latn",{day:"numeric",month:"long"})} · 📍 {e.city}</div>
          </div>
          <div className="popular-votes">👍 {e.votes.up}</div>
        </div>
      ))}
    </div>
  );
}
