import { useState } from "react";
import { CAT_COLORS, G } from "../constants";
import { formatDisplayDate } from "../api";
import { translateText } from "../i18n";

const eventStatusLabel = (status) => {
  if (status === "approved") return "Odobren";
  if (status === "na_cekanju_promovisana") return "Čeka promociju";
  if (status === "pending" || status === "na_cekanju") return "Na čekanju";
  if (status === "rejected" || status === "odbijena") return "Odbijen";
  return status || "/";
};

export default function AdminPage({ events, navigate, approveEvent, rejectEvent, deleteEvent, adminRequests = [], approveAdmin, rejectAdmin, language = "SRB" }) {
  const [tab, setTab] = useState("pending");
  const pending = events.filter((e) => ["pending", "na_cekanju", "na_cekanju_promovisana"].includes(e.status));
  const approved = events.filter((e) => e.status === "approved");
  const rejected = events.filter((e) => ["rejected", "odbijena"].includes(e.status));
  const shown = tab === "pending" ? pending : tab === "approved" ? approved : rejected;
  const openEvent = (event) => {
    if (navigate) navigate("detail", event);
  };

  return (
    <div className="main">
      <div className="page-header">
        <div className="page-title">Admin panel</div>
        <div className="page-sub">Upravljanje događajima, promocijama i zahtjevima organizatora</div>
      </div>
      <div className="admin-stats">
        {[
          { label: "Ukupno", value: events.length, icon: "#" },
          { label: "Odobreni", value: approved.length, icon: "+" },
          { label: "Na čekanju", value: pending.length, icon: "..." },
          { label: "Organizatori", value: adminRequests.length, icon: "@" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", border: `1px solid ${G.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.5rem", borderBottom: `1px solid ${G.border}` }}>
          <div className="tabs" style={{ marginBottom: 0 }}>
            {[
              ["pending", "Na čekanju", pending.length],
              ["approved", "Odobreni", approved.length],
              ["rejected", "Odbijeni", rejected.length],
              ["admins", "Organizatori", adminRequests.length],
            ].map(([t, label, cnt]) => (
              <button key={t} className={`tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
                {label} <span style={{ fontSize: 11, background: G.paper, padding: "1px 8px", borderRadius: 10, marginLeft: 4 }}>{cnt}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          {tab === "admins" ? (
            <table className="admin-table">
              <thead>
                <tr><th>Organizator</th><th>Email</th><th>Status</th><th>Akcije</th></tr>
              </thead>
              <tbody>
                {adminRequests.map((u) => (
                  <tr key={u.ID || u.id}>
                    <td><strong>{u.Ime || u.ime} {u.Prezime || u.prezime}</strong></td>
                    <td>{u.Email || u.email}</td>
                    <td>Na čekanju</td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="action-btn action-approve" onClick={() => approveAdmin(u.ID || u.id)}>Odobri organizatora</button>
                        <button className="action-btn action-reject" onClick={() => rejectAdmin(u.ID || u.id)}>Odbij</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {adminRequests.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", color: G.muted, padding: "2rem" }}>Nema zahtjeva organizatora.</td></tr>}
              </tbody>
            </table>
          ) : (
            <table className="admin-table">
              <thead>
                <tr><th>Događaj</th><th>Kategorija</th><th>Grad</th><th>Datum</th><th>Organizator</th><th>Status</th><th>Glasovi</th><th>Akcije</th></tr>
              </thead>
              <tbody>
                {shown.map((e) => (
                  <tr key={e.id} onClick={() => openEvent(e)} style={{ cursor: "pointer" }}>
                    <td>
                      <strong>{e.coverImg ? "" : e.emoji} {translateText(e.title, language)}</strong>
                      {e.status === "na_cekanju_promovisana" && <div style={{ fontSize: 11, color: G.warning, fontWeight: 700 }}>Traži promociju</div>}
                    </td>
                    <td><span style={{ color: CAT_COLORS[e.category] || G.green, fontSize: 12, fontWeight: 600 }}>{translateText(e.category, language)}</span></td>
                    <td>{translateText(e.city, language)}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDisplayDate(e.date)}</td>
                    <td>{e.organizer || "/"}</td>
                    <td>{eventStatusLabel(e.status)}</td>
                    <td>{e.votes.up} / {e.votes.down}</td>
                    <td onClick={(ev) => ev.stopPropagation()}>
                      <div style={{ display: "flex", gap: 4 }}>
                        {e.status !== "approved" && <button className="action-btn action-approve" onClick={() => approveEvent(e.id)}>Odobri</button>}
                        {!["rejected", "odbijena"].includes(e.status) && <button className="action-btn action-reject" onClick={() => rejectEvent(e.id)}>Odbij</button>}
                        <button className="action-btn action-delete" onClick={() => deleteEvent(e.id)}>Briši</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {shown.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", color: G.muted, padding: "2rem" }}>Nema događaja.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
