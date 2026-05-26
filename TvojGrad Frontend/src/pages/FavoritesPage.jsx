import EventCard from '../components/EventCard';

export default function FavoritesPage({ events, navigate, vote, toggleFav, user }) {
  if (!user) return (
    <div className="main">
      <div className="empty"><span className="empty-icon">🔒</span>Prijavite se da biste vidjeli omiljene događaje.<br /><br />
        <button className="btn-primary btn-sm" onClick={() => navigate("auth")}>Prijava</button>
      </div>
    </div>
  );
  return (
    <div className="main">
      <div className="page-header">
        <div className="page-title">❤️ Moji omiljeni</div>
        <div className="page-sub">{events.length} sačuvanih događaja</div>
      </div>
      {events.length > 0
        ? <div className="grid">{events.map(e => <EventCard key={e.id} event={e} vote={vote} toggleFav={toggleFav} navigate={navigate} />)}</div>
        : <div className="empty"><span className="empty-icon">💔</span>Niste sačuvali nijedan omiljeni događaj.</div>}
    </div>
  );
}
