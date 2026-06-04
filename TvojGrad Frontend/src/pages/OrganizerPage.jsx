import { useState } from "react";
import { CATEGORIES, CITIES, G } from "../constants";
import ImageUpload from "../components/ImageUpload";
import { formatDisplayDate, formatDisplayTime } from "../api";
import { translateText } from "../i18n";

export default function OrganizerPage({ user, events, addEvent, updateEvent, deleteEvent, promoteEvent, updateEventImg, cities = CITIES, toast, language = "SRB" }) {
  const emojis = ["🎷", "🎤", "🏃", "🎨", "💻", "📚", "💃", "🚀", "🎭", "🎬", "🎸", "🏋️", "🎪", "🎯", "🍕"];
  const emptyForm = {
    title: "",
    category: "Muzika",
    date: "",
    time: "20:00",
    city: "Podgorica",
    location: "",
    price: 0,
    desc: "",
    emoji: "🎉",
    coverImg: null,
    coverFile: null,
    coverColor: G.green,
    promoted: false,
  };

  const [form, setForm] = useState(emptyForm);
  const [editingEvent, setEditingEvent] = useState(null);
  const set = (key) => (value) =>
    setForm((current) => ({ ...current, [key]: value.target?.type === "checkbox" ? value.target.checked : value.target?.value ?? value }));

  const cancelEdit = () => {
    setEditingEvent(null);
    setForm(emptyForm);
  };

  const submit = async () => {
    if (!form.title || !form.date || !form.location) {
      toast && toast("Greška u unosu podataka");
      return;
    }
    if (editingEvent) {
      const saved = await updateEvent(editingEvent.id, { ...editingEvent, ...form, price: Number(form.price) });
      if (saved !== false) cancelEdit();
      return;
    }
    const saved = await addEvent({ ...form, organizer: user.name, price: Number(form.price) });
    if (saved !== false) cancelEdit();
  };

  const startEdit = (event) => {
    setEditingEvent(event);
    setForm({
      title: event.title || "",
      category: event.category || "Muzika",
      date: event.date ? String(event.date).slice(0, 10) : "",
      time: event.time ? String(event.time).slice(0, 5) : "20:00",
      city: event.city || "Podgorica",
      location: event.address || event.location || "",
      price: event.price ?? 0,
      desc: event.desc || event.description || "",
      emoji: event.emoji || "🎉",
      coverImg: event.coverImg || null,
      coverFile: null,
      coverColor: event.coverColor || G.green,
      promoted: event.status === "na_cekanju_promovisana" || event.promoted,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const statusLabel = (event) => {
    if (event.status === "approved") return "Odobren";
    if (event.status === "na_cekanju_promovisana") return "Čeka promociju";
    if (event.status === "pending" || event.status === "na_cekanju") return "Na čekanju";
    if (event.status === "rejected" || event.status === "odbijena") return "Odbijen";
    return event.status || "/";
  };

  return (
    <div className="main">
      <div className="page-header">
        <div className="page-title">Dodavanje događaja</div>
        <div className="page-sub">Dodajte i upravljajte vašim događajima</div>
      </div>
      <div className="org-grid">
        <div className="form-card">
          <h3>{editingEvent ? `Izmjena: ${translateText(editingEvent.title, language)}` : "Novi događaj"}</h3>
          <div className="form-group">
            <label className="form-label">Naziv *</label>
            <input className="form-input" placeholder="Naziv događaja" value={form.title} onChange={set("title")} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Kategorija</label>
              <select className="form-select" value={form.category} onChange={set("category")}>
                {CATEGORIES.filter((category) => category !== "Sve").map((category) => <option key={category}>{category}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Grad</label>
              <select className="form-select" value={form.city} onChange={set("city")}>
                {cities.filter((city) => city !== "Svi gradovi").map((city) => <option key={city}>{city}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Datum *</label>
              <input className="form-input" type="date" value={form.date} onChange={set("date")} />
            </div>
            <div className="form-group">
              <label className="form-label">Vrijeme</label>
              <input className="form-input" type="time" value={form.time} onChange={set("time")} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Adresa *</label>
              <input className="form-input" placeholder="Tačna adresa mjesta" value={form.location} onChange={set("location")} />
            </div>
            <div className="form-group">
              <label className="form-label">Cijena (EUR)</label>
              <input className="form-input" type="number" min="0" value={form.price} onChange={set("price")} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Opis</label>
            <textarea className="form-textarea" placeholder="Opis događaja..." value={form.desc} onChange={set("desc")} />
          </div>
          <div className="form-group">
            <label className="form-label">Emoji ikona</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setForm((current) => ({ ...current, emoji }))}
                  style={{ fontSize: 22, background: form.emoji === emoji ? G.greenLight : "none", border: `1px solid ${form.emoji === emoji ? G.green : G.border}`, borderRadius: 8, padding: "4px 8px", cursor: "pointer" }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Slika događaja</label>
            <ImageUpload current={form.coverImg} onUpload={(img, file) => setForm((current) => ({ ...current, coverImg: img, coverFile: file || null }))} />
          </div>
          <div className="promo-option">
            <label className="promo-check">
              <input type="checkbox" checked={form.promoted} onChange={set("promoted")} />
              <span>Promoviši događaj</span>
            </label>
            <div className="promo-note">
              Za promociju uplatite 5 EUR na žiro račun 000-000000-00 i u opisu plaćanja navedite naziv događaja.
              Ova opcija je priprema za plaćanje i za sada samo označava objavu kao promovisanu.
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              className="btn-primary"
              onClick={submit}
              disabled={!form.title || !form.date || !form.location}
              style={{ opacity: (!form.title || !form.date || !form.location) ? 0.5 : 1 }}
            >
              {editingEvent ? "Sačuvaj izmjene" : "Dodaj događaj"}
            </button>
            {editingEvent && (
              <button className="action-btn" onClick={cancelEdit} style={{ padding: "10px 16px" }}>
                Odustani
              </button>
            )}
          </div>
        </div>

        <div className="form-card">
          <h3>Moji događaji ({events.length})</h3>
          {events.length === 0 ? (
            <div className="empty" style={{ padding: "1.5rem" }}>
              <span className="empty-icon" style={{ fontSize: 32 }}>📭</span>Nemate dodatih događaja.
            </div>
          ) : events.map((event) => (
            <div key={event.id} className="my-event-item" style={{ borderColor: editingEvent?.id === event.id ? G.green : undefined }}>
              <div style={{ width: 50, height: 50, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: `${event.coverColor}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                {event.coverImg ? <img src={event.coverImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : event.emoji}
              </div>
              <div className="my-event-info">
                <div className="my-event-title">{translateText(event.title, language)}</div>
                <div className="my-event-meta">{formatDisplayDate(event.date)} · {formatDisplayTime(event.time)} · {translateText(event.city, language)}</div>
                <div className="form-group" style={{ marginTop: 6, marginBottom: 0 }}>
                  <label style={{ fontSize: 11, fontWeight: 500, color: G.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    <span>Zamijeni sliku</span>
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={(ev) => {
                      const file = ev.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (result) => updateEventImg(event.id, result.target.result, file);
                      reader.readAsDataURL(file);
                    }} />
                  </label>
                </div>
                {event.promoted && <span className="status-badge status-promoted">Promovisan</span>}
                <span className={`status-badge status-${event.status}`}>{statusLabel(event)}</span>
                {event.status === "approved" && !event.promoted && (
                  <div className="promo-inline-note">
                    Naknadna promocija: uplatite 5 EUR na žiro račun 000-000000-00, pa kliknite Promoviši.
                  </div>
                )}
              </div>
              <div className="my-event-actions">
                <button className="action-btn" onClick={() => startEdit(event)}>Izmijeni</button>
                {event.status === "approved" && !event.promoted && (
                  <button className="action-btn action-approve" onClick={() => promoteEvent(event.id)}>Promoviši</button>
                )}
                <button className="action-btn action-delete" onClick={() => deleteEvent(event.id)}>Obriši</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
