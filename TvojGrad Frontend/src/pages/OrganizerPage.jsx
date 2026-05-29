import { useState } from 'react';
import { CATEGORIES, CITIES, G } from '../constants';
import ImageUpload from '../components/ImageUpload';

export default function OrganizerPage({ user, events, addEvent, deleteEvent, promoteEvent, updateEventImg, cities = CITIES }) {
  const emojis = ["🎷","🎤","🏃","🎨","💻","📚","💃","🚀","🎭","🎬","🎸","🏋️","🎪","🎯","🍕"];
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
  const set = (k) => (v) =>
    setForm((f) => ({ ...f, [k]: v.target?.type === "checkbox" ? v.target.checked : v.target?.value ?? v }));

  const submit = async () => {
    if (!form.title || !form.date || !form.location) return;
    await addEvent({ ...form, organizer: user.name, price: Number(form.price) });
    setForm(emptyForm);
  };

  return (
    <div className="main">
      <div className="page-header">
        <div className="page-title">Dodavanje dogadjaja</div>
        <div className="page-sub">Dodajte i upravljajte vasim dogadjajima</div>
      </div>
      <div className="org-grid">
        <div className="form-card">
          <h3>Novi dogadjaj</h3>
          <div className="form-group">
            <label className="form-label">Naziv *</label>
            <input className="form-input" placeholder="Naziv dogadjaja" value={form.title} onChange={set("title")} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Kategorija</label>
              <select className="form-select" value={form.category} onChange={set("category")}>
                {CATEGORIES.filter((c) => c !== "Sve").map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Grad</label>
              <select className="form-select" value={form.city} onChange={set("city")}>
                {cities.filter((c) => c !== "Svi gradovi").map((c) => <option key={c}>{c}</option>)}
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
              <label className="form-label">Lokacija *</label>
              <input className="form-input" placeholder="Naziv mjesta" value={form.location} onChange={set("location")} />
            </div>
            <div className="form-group">
              <label className="form-label">Cijena (EUR)</label>
              <input className="form-input" type="number" min="0" value={form.price} onChange={set("price")} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Opis</label>
            <textarea className="form-textarea" placeholder="Opis dogadjaja..." value={form.desc} onChange={set("desc")} />
          </div>
          <div className="form-group">
            <label className="form-label">Emoji ikona</label>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4}}>
              {emojis.map((em) => (
                <button
                  key={em}
                  onClick={() => setForm((f) => ({ ...f, emoji: em }))}
                  style={{fontSize:22,background:form.emoji===em?G.greenLight:"none",border:`1px solid ${form.emoji===em?G.green:G.border}`,borderRadius:8,padding:"4px 8px",cursor:"pointer"}}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Slika dogadjaja</label>
            <ImageUpload current={form.coverImg} onUpload={(img, file) => setForm((f) => ({ ...f, coverImg: img, coverFile: file || null }))} />
          </div>
          <div className="promo-option">
            <label className="promo-check">
              <input type="checkbox" checked={form.promoted} onChange={set("promoted")} />
              <span>Promovisi dogadjaj</span>
            </label>
            <div className="promo-note">
              Za promociju uplatite 5 EUR na ziro racun 000-000000-00 i u opisu placanja navedite naziv dogadjaja.
              Ova opcija je priprema za placanje i za sada samo oznacava objavu kao promovisanu.
            </div>
          </div>
          <button
            className="btn-primary"
            onClick={submit}
            disabled={!form.title || !form.date || !form.location}
            style={{opacity:(!form.title || !form.date || !form.location) ? 0.5 : 1}}
          >
            Dodaj dogadjaj
          </button>
        </div>

        <div className="form-card">
          <h3>Moji dogadjaji ({events.length})</h3>
          {events.length === 0 ? (
            <div className="empty" style={{padding:"1.5rem"}}>
              <span className="empty-icon" style={{fontSize:32}}>📭</span>Nemate dodanih dogadjaja.
            </div>
          ) : events.map((e) => (
            <div key={e.id} className="my-event-item">
              <div style={{width:50,height:50,borderRadius:10,overflow:"hidden",flexShrink:0,background:e.coverColor+"33",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>
                {e.coverImg ? <img src={e.coverImg} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} /> : e.emoji}
              </div>
              <div className="my-event-info">
                <div className="my-event-title">{e.title}</div>
                <div className="my-event-meta">{e.date} · {e.city}</div>
                <div className="form-group" style={{marginTop:6,marginBottom:0}}>
                  <label style={{fontSize:11,fontWeight:500,color:G.muted,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                    <span>Zamijeni sliku</span>
                    <input type="file" accept="image/*" style={{display:"none"}} onChange={(ev) => {
                      const file = ev.target.files[0]; if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (r) => updateEventImg(e.id, r.target.result, file);
                      reader.readAsDataURL(file);
                    }} />
                  </label>
                </div>
                {e.promoted && <span className="status-badge status-promoted">Promovisan</span>}
                <span className={`status-badge status-${e.status}`}>
                  {e.status === "approved" ? "Odobren" : e.status === "na_cekanju_promovisana" ? "Ceka promociju" : e.status === "pending" || e.status === "na_cekanju" ? "Na cekanju" : "Odbijen"}
                </span>
                {e.status === "approved" && !e.promoted && (
                  <div className="promo-inline-note">
                    Naknadna promocija: uplatite 5 EUR na ziro racun 000-000000-00, pa kliknite Promovisi.
                  </div>
                )}
              </div>
              <div className="my-event-actions">
                {e.status === "approved" && !e.promoted && (
                  <button className="action-btn action-approve" onClick={() => promoteEvent(e.id)}>Promovisi</button>
                )}
                <button className="action-btn action-delete" onClick={() => deleteEvent(e.id)}>Obrisi</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
