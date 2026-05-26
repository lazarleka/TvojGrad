import { useState } from 'react';
import { CAT_COLORS, G } from '../constants';

export default function AdminPage({ events, approveEvent, rejectEvent, deleteEvent }) {
  const [tab, setTab] = useState("pending");
  const pending = events.filter(e=>e.status==="pending");
  const approved = events.filter(e=>e.status==="approved");
  const rejected = events.filter(e=>e.status==="rejected");
  const shown = tab==="pending"?pending:tab==="approved"?approved:rejected;

  return (
    <div className="main">
      <div className="page-header">
        <div className="page-title">⚙️ Admin panel</div>
        <div className="page-sub">Upravljanje događajima i korisnicima</div>
      </div>
      <div className="admin-stats">
        {[{label:"Ukupno",value:events.length,icon:"🗓"},{label:"Odobreni",value:approved.length,icon:"✅"},{label:"Na čekanju",value:pending.length,icon:"⏳"},{label:"Odbijeni",value:rejected.length,icon:"❌"}].map(s=>(
          <div key={s.label} className="stat-card"><div className="stat-icon">{s.icon}</div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
        ))}
      </div>
      <div style={{background:"#fff",border:`1px solid ${G.border}`,borderRadius:16,overflow:"hidden"}}>
        <div style={{padding:"1rem 1.5rem",borderBottom:`1px solid ${G.border}`}}>
          <div className="tabs" style={{marginBottom:0}}>
            {[["pending","⏳ Na čekanju",pending.length],["approved","✅ Odobreni",approved.length],["rejected","❌ Odbijeni",rejected.length]].map(([t,label,cnt])=>(
              <button key={t} className={`tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>
                {label} <span style={{fontSize:11,background:G.paper,padding:"1px 8px",borderRadius:10,marginLeft:4}}>{cnt}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{overflowX:"auto"}}>
          <table className="admin-table">
            <thead><tr><th>Događaj</th><th>Kategorija</th><th>Grad</th><th>Datum</th><th>Organizator</th><th>Glasovi</th><th>Akcije</th></tr></thead>
            <tbody>
              {shown.map(e=>(
                <tr key={e.id}>
                  <td><strong>{e.emoji} {e.title}</strong></td>
                  <td><span style={{color:CAT_COLORS[e.category]||G.green,fontSize:12,fontWeight:600}}>{e.category}</span></td>
                  <td>{e.city}</td>
                  <td style={{whiteSpace:"nowrap"}}>{e.date}</td>
                  <td>{e.organizer}</td>
                  <td>👍{e.votes.up} 👎{e.votes.down}</td>
                  <td><div style={{display:"flex",gap:4}}>
                    {e.status!=="approved"&&<button className="action-btn action-approve" onClick={()=>approveEvent(e.id)}>Odobri</button>}
                    {e.status!=="rejected"&&<button className="action-btn action-reject" onClick={()=>rejectEvent(e.id)}>Odbij</button>}
                    <button className="action-btn action-delete" onClick={()=>deleteEvent(e.id)}>Briši</button>
                  </div></td>
                </tr>
              ))}
              {shown.length===0&&<tr><td colSpan={7} style={{textAlign:"center",color:G.muted,padding:"2rem"}}>Nema događaja.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
