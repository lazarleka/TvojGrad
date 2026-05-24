import { CATEGORIES, CITIES, G } from '../constants';
import EventCard from '../components/EventCard';

export default function HomePage({ events, allEvents, category, setCategory, city, setCity, search, setSearch, vote, toggleFav, navigate }) {
  const promoted = allEvents.filter(e => e.promoted).sort((a, b) => (b.approvedAt || 0) - (a.approvedAt || 0));
  return (
    <>
      <div className="hero">
        <h1 className="hero-title">Tvoj grad,<br /><em>tvoja dešavanja</em></h1>
        <p className="hero-sub">Svi događaji u jednom mjestu. Pronađi, prati i pođi zajedno!</p>
        <div className="search-wrap">
          <span style={{fontSize:18}}>🔍</span>
          <input style={{flex:1,border:"none",outline:"none",fontSize:15,fontFamily:"'DM Sans',sans-serif",background:"transparent"}}
            placeholder="Pretraži događaje..." value={search} onChange={e => setSearch(e.target.value)} />
          <select style={{border:"none",outline:"none",fontSize:13,fontFamily:"'DM Sans',sans-serif",color:G.muted,background:"transparent",cursor:"pointer"}}
            value={city} onChange={e => setCity(e.target.value)}>
            {CITIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <button style={{background:G.green,color:"#fff",border:"none",borderRadius:10,padding:"10px 20px",fontSize:14,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",fontWeight:500}}>Pretraži</button>
        </div>
        <div className="filter-chips">
          {CATEGORIES.map(c => (
            <span key={c} className={`chip${category===c?" active":""}`} onClick={() => setCategory(c)}>{c}</span>
          ))}
        </div>
      </div>
      <div className="main">
        {promoted.length > 0 && (
          <>
            <div className="section-header">
              <span className="section-title">⭐ Promovisano</span>
            </div>
            <div className="grid">
              {promoted.slice(0,3).map(e => <EventCard key={e.id} event={e} vote={vote} toggleFav={toggleFav} navigate={navigate} />)}
            </div>
            <div className="divider" />
          </>
        )}
        <div className="section-header">
          <span className="section-title">🗓 Svi događaji</span>
          <span className="section-sub">{events.length} događaja</span>
        </div>
        {events.length > 0 ? (
          <div className="grid">{events.map(e => <EventCard key={e.id} event={e} vote={vote} toggleFav={toggleFav} navigate={navigate} />)}</div>
        ) : (
          <div className="empty"><span className="empty-icon">😕</span>Nema događaja koji odgovaraju filterima.</div>
        )}
      </div>
    </>
  );
}
