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

const userStatusLabel = (status) => {
  if (status === "aktivan") return "Aktivan";
  if (status === "na_cekanju_organizator") return "Na čekanju";
  if (status === "odbijen_organizator") return "Odbijen";
  return status || "/";
};

const userName = (user) => `${user.Ime || user.ime || ""} ${user.Prezime || user.prezime || ""}`.trim() || user.Email || user.email || "Organizator";
const userId = (user) => user.ID || user.id;
const isPendingOrganizer = (user) => (user.Status || user.status) === "na_cekanju_organizator";

export default function AdminPage({
  events,
  navigate,
  approveEvent,
  rejectEvent,
  deleteEvent,
  adminRequests = [],
  organizers = [],
  approveAdmin,
  rejectAdmin,
  language = "SRB",
}) {
  const [tab, setTab] = useState("pending");
  const pending = events.filter((event) => ["pending", "na_cekanju", "na_cekanju_promovisana"].includes(event.status));
  const approved = events.filter((event) => event.status === "approved");
  const rejected = events.filter((event) => ["rejected", "odbijena"].includes(event.status));
  const shown = tab === "pending" ? pending : tab === "approved" ? approved : rejected;
  const organizerList = organizers.length ? organizers : adminRequests;
  const organizerPendingCount = organizerList.filter(isPendingOrganizer).length;
  const openEvent = (event) => {
    if (navigate) navigate("detail", event);
  };

  return (
    <div className="main">
      <div className="page-header">
        <div className="page-title">Admin panel</div>
        <div className="page-sub">Upravljanje događajima, promocijama i organizatorima</div>
      </div>
      <div className="admin-stats">
        {[
          { label: "Ukupno", value: events.length, icon: "#" },
          { label: "Odobreni", value: approved.length, icon: "+" },
          { label: "Na čekanju", value: pending.length, icon: "..." },
          { label: "Organizatori", value: organizerList.length, icon: "@" },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
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
              ["admins", "Organizatori", organizerList.length],
            ].map(([tabId, label, count]) => (
              <button key={tabId} className={`tab${tab === tabId ? " active" : ""}`} onClick={() => setTab(tabId)}>
                {label} <span style={{ fontSize: 11, background: G.paper, padding: "1px 8px", borderRadius: 10, marginLeft: 4 }}>{count}</span>
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
                {organizerList.map((organizer) => (
                  <tr key={userId(organizer)}>
                    <td><strong>{userName(organizer)}</strong></td>
                    <td>{organizer.Email || organizer.email || "/"}</td>
                    <td>{userStatusLabel(organizer.Status || organizer.status)}</td>
                    <td>
                      {isPendingOrganizer(organizer) ? (
                        <div style={{ display: "flex", gap: 4 }}>
                          <button className="action-btn action-approve" onClick={() => approveAdmin(userId(organizer))}>Odobri organizatora</button>
                          <button className="action-btn action-reject" onClick={() => rejectAdmin(userId(organizer))}>Odbij</button>
                        </div>
                      ) : (
                        <span style={{ color: G.muted, fontSize: 13 }}>Nema akcija</span>
                      )}
                    </td>
                  </tr>
                ))}
                {organizerList.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: "center", color: G.muted, padding: "2rem" }}>Nema organizatora.</td></tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="admin-table">
              <thead>
                <tr><th>Događaj</th><th>Kategorija</th><th>Grad</th><th>Datum</th><th>Organizator</th><th>Status</th><th>Glasovi</th><th>Akcije</th></tr>
              </thead>
              <tbody>
                {shown.map((event) => (
                  <tr key={event.id} onClick={() => openEvent(event)} style={{ cursor: "pointer" }}>
                    <td>
                      <strong>{event.coverImg ? "" : event.emoji} {translateText(event.title, language)}</strong>
                      {event.status === "na_cekanju_promovisana" && <div style={{ fontSize: 11, color: G.warning, fontWeight: 700 }}>Traži promociju</div>}
                    </td>
                    <td><span style={{ color: CAT_COLORS[event.category] || G.green, fontSize: 12, fontWeight: 600 }}>{translateText(event.category, language)}</span></td>
                    <td>{translateText(event.city, language)}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDisplayDate(event.date)}</td>
                    <td>{event.organizer || "/"}</td>
                    <td>{eventStatusLabel(event.status)}</td>
                    <td>{event.votes.up} / {event.votes.down}</td>
                    <td onClick={(ev) => ev.stopPropagation()}>
                      <div style={{ display: "flex", gap: 4 }}>
                        {event.status !== "approved" && <button className="action-btn action-approve" onClick={() => approveEvent(event.id)}>Odobri</button>}
                        {!["rejected", "odbijena"].includes(event.status) && <button className="action-btn action-reject" onClick={() => rejectEvent(event.id)}>Odbij</button>}
                        <button className="action-btn action-delete" onClick={() => deleteEvent(event.id)}>Briši</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {shown.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: "center", color: G.muted, padding: "2rem" }}>Nema događaja.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {tab === "admins" && organizerPendingCount > 0 && (
        <div style={{ color: G.muted, fontSize: 13, marginTop: 10 }}>
          Organizatori na čekanju: {organizerPendingCount}
        </div>
      )}
    </div>
  );
}
