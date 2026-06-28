import { useState } from "react";
import { CAT_COLORS, G } from "../constants";
import { formatDisplayDate, formatDisplayTime } from "../api";
import { translateText } from "../i18n";

const eventStatusLabel = (status) => {
  if (status === "approved") return "Odobren";
  if (status === "na_cekanju_promovisana") return "Ceka promociju";
  if (status === "pending" || status === "na_cekanju") return "Na cekanju";
  if (status === "rejected" || status === "odbijena") return "Odbijen";
  if (status === "arhivirana") return "Arhiviran";
  return status || "/";
};

const userStatusLabel = (status) => {
  if (status === "aktivan") return "Aktivan";
  if (status === "na_cekanju_organizator") return "Na cekanju";
  if (status === "odbijen_organizator") return "Odbijen";
  return status || "/";
};

const userName = (user) =>
  `${user.Ime || user.ime || ""} ${user.Prezime || user.prezime || ""}`.trim() ||
  user.Email ||
  user.email ||
  "Organizator";
const userId = (user) => user.ID || user.id;
const isPendingOrganizer = (user) => (user.Status || user.status) === "na_cekanju_organizator";
const isRejectedOrganizer = (user) => (user.Status || user.status) === "odbijen_organizator";
const eventTimeValue = (event) => {
  const datePart = event?.date ? String(event.date).slice(0, 10) : "";
  const timePart = event?.time ? String(event.time).slice(0, 5) : "00:00";
  const timeValue = datePart ? new Date(`${datePart}T${timePart || "00:00"}`).getTime() : Number.NaN;
  return Number.isFinite(timeValue) ? timeValue : 0;
};
const eventDateValue = (event) => {
  const value = new Date(`${String(event?.date || "").slice(0, 10)}T00:00:00`).getTime();
  return Number.isFinite(value) ? value : 0;
};
const eventStartMinutes = (event) => {
  const [hours = 0, minutes = 0] = String(event?.time || "00:00").split(":").map(Number);
  return (hours * 60) + minutes;
};

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
  removeOrganizer,
  restoreOrganizer,
  language = "SRB",
}) {
  const [tab, setTab] = useState("pending");
  const [eventTimeTab, setEventTimeTab] = useState("active");
  const [eventSort, setEventSort] = useState({ key: null, direction: "asc" });
  const nowTime = Date.now();
  const pending = events.filter((event) => ["pending", "na_cekanju", "na_cekanju_promovisana"].includes(event.status));
  const approved = events.filter((event) => event.status === "approved");
  const rejected = events.filter((event) => ["rejected", "odbijena", "arhivirana"].includes(event.status));
  const shownByStatus = tab === "pending" ? pending : tab === "approved" ? approved : rejected;
  const activeShown = shownByStatus
    .filter((event) => eventTimeValue(event) >= nowTime)
    .sort((a, b) => eventTimeValue(a) - eventTimeValue(b));
  const pastShown = shownByStatus
    .filter((event) => eventTimeValue(event) < nowTime)
    .sort((a, b) => eventTimeValue(b) - eventTimeValue(a));
  const shown = eventTimeTab === "past" ? pastShown : activeShown;
  const dateOrder = new Map();
  shown.forEach((event) => {
    const date = String(event?.date || "").slice(0, 10);
    if (!dateOrder.has(date)) dateOrder.set(date, dateOrder.size);
  });
  const sortedShown = [...shown].sort((a, b) => {
    const direction = eventSort.direction === "desc" ? -1 : 1;
    if (eventSort.key === "date") return direction * (eventDateValue(a) - eventDateValue(b));
    if (eventSort.key === "time") {
      const aDate = String(a?.date || "").slice(0, 10);
      const bDate = String(b?.date || "").slice(0, 10);
      const dateDifference = (dateOrder.get(aDate) || 0) - (dateOrder.get(bDate) || 0);
      return dateDifference || direction * (eventStartMinutes(a) - eventStartMinutes(b));
    }
    return 0;
  });
  const toggleSort = (key) => setEventSort((current) => ({ key, direction: current.key === key && current.direction === "asc" ? "desc" : "asc" }));
  const sortArrow = (key) => eventSort.key === key ? (eventSort.direction === "asc" ? " ▲" : " ▼") : " ↕";
  const isOrganizerTab = ["admins", "rejected-admins"].includes(tab);
  const organizerList = organizers.length ? organizers : adminRequests;
  const activeOrganizerList = organizerList.filter((organizer) => !isRejectedOrganizer(organizer));
  const rejectedOrganizerList = organizerList.filter(isRejectedOrganizer);
  const shownOrganizers = tab === "admins" ? activeOrganizerList : rejectedOrganizerList;
  const organizerPendingCount = activeOrganizerList.filter(isPendingOrganizer).length;

  const openEvent = (event) => {
    if (navigate) navigate("detail", event);
  };

  return (
    <div className="main">
      <div className="page-header">
        <div className="page-title">Admin panel</div>
        <div className="page-sub">Upravljanje dogadjajima, promocijama i organizatorima</div>
      </div>

      <div className="admin-stats">
        {[
          { label: "Ukupno", value: events.length, icon: "#" },
          { label: "Odobreni", value: approved.length, icon: "+" },
          { label: "Na cekanju", value: pending.length, icon: "..." },
          { label: "Organizatori", value: activeOrganizerList.length, icon: "@" },
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
              ["pending", "Na cekanju", pending.length],
              ["approved", "Odobreni", approved.length],
              ["rejected", "Odbijeni", rejected.length],
              ["admins", "Organizatori", activeOrganizerList.length],
              ["rejected-admins", "Odbijeni organizatori", rejectedOrganizerList.length],
            ].map(([tabId, label, count]) => (
              <button key={tabId} className={`tab${tab === tabId ? " active" : ""}`} onClick={() => setTab(tabId)}>
                {label} <span style={{ fontSize: 11, background: G.paper, padding: "1px 8px", borderRadius: 10, marginLeft: 4 }}>{count}</span>
              </button>
            ))}
          </div>
          {!isOrganizerTab && (
            <div className="event-list-tabs admin-event-tabs">
              {[
                ["active", "Aktivni dogadjaji", activeShown.length],
                ["past", "Prosli dogadjaji", pastShown.length],
              ].map(([tabId, label, count]) => (
                <button
                  key={tabId}
                  className={`event-list-tab${eventTimeTab === tabId ? " active" : ""}`}
                  onClick={() => setEventTimeTab(tabId)}
                >
                  {label} <span>{count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ overflowX: "auto" }}>
          {isOrganizerTab ? (
            <table className="admin-table">
              <thead>
                <tr><th>Organizator</th><th>Email</th><th>Status</th><th>Akcije</th></tr>
              </thead>
              <tbody>
                {shownOrganizers.map((organizer) => (
                  <tr key={userId(organizer)}>
                    <td><strong>{userName(organizer)}</strong></td>
                    <td>{organizer.Email || organizer.email || "/"}</td>
                    <td>{userStatusLabel(organizer.Status || organizer.status)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {isRejectedOrganizer(organizer) ? (
                          <button className="action-btn action-approve" onClick={() => restoreOrganizer?.(organizer)}>Vrati</button>
                        ) : isPendingOrganizer(organizer) ? (
                          <button className="action-btn action-approve" onClick={() => approveAdmin(userId(organizer))}>Odobri organizatora</button>
                        ) : null}
                        {!isRejectedOrganizer(organizer) && (
                          <button className="action-btn action-delete" onClick={() => removeOrganizer?.(organizer)}>Ukloni</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {shownOrganizers.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: "center", color: G.muted, padding: "2rem" }}>Nema organizatora.</td></tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="admin-table">
              <thead>
                <tr><th>Dogadjaj</th><th>Kategorija</th><th>Grad</th><th><button type="button" onClick={() => toggleSort("date")} style={{ all: "unset", cursor: "pointer", fontWeight: 700 }}>Datum{sortArrow("date")}</button></th><th><button type="button" onClick={() => toggleSort("time")} style={{ all: "unset", cursor: "pointer", fontWeight: 700 }}>Vrijeme{sortArrow("time")}</button></th><th>Organizator</th><th>Status</th><th>Glasovi</th><th>Akcije</th></tr>
              </thead>
              <tbody>
                {sortedShown.map((event) => (
                  <tr key={event.id} onClick={() => openEvent(event)} style={{ cursor: "pointer" }}>
                    <td>
                      <strong>{event.coverImg ? "" : event.emoji} {translateText(event.title, language)}</strong>
                      {event.status === "na_cekanju_promovisana" && <div style={{ fontSize: 11, color: G.warning, fontWeight: 700 }}>Trazi promociju</div>}
                    </td>
                    <td><span style={{ color: CAT_COLORS[event.category] || G.green, fontSize: 12, fontWeight: 600 }}>{translateText(event.category, language)}</span></td>
                    <td>{translateText(event.city, language)}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDisplayDate(event.date)}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDisplayTime(event.time)}</td>
                    <td>{event.organizer || "/"}</td>
                    <td>{eventStatusLabel(event.status)}</td>
                    <td>{event.votes.up} / {event.votes.down}</td>
                    <td onClick={(ev) => ev.stopPropagation()}>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {event.status !== "approved" && <button className="action-btn action-approve" onClick={() => approveEvent(event.id)}>Odobri</button>}
                        {!["rejected", "odbijena", "arhivirana"].includes(event.status) && <button className="action-btn action-reject" onClick={() => rejectEvent(event.id)}>Odbij</button>}
                        <button className="action-btn action-delete" onClick={() => deleteEvent(event.id)}>Brisi</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {shown.length === 0 && (
                  <tr><td colSpan={9} style={{ textAlign: "center", color: G.muted, padding: "2rem" }}>Nema dogadjaja.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {tab === "admins" && organizerPendingCount > 0 && (
        <div style={{ color: G.muted, fontSize: 13, marginTop: 10 }}>
          Organizatori na cekanju: {organizerPendingCount}
        </div>
      )}
    </div>
  );
}
