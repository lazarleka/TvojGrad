import { useState } from 'react';
import { G } from '../constants';

export default function AuthPage({ setUser, navigate, toast }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"visitor" });
  const set = k => v => setForm(f => ({ ...f, [k]: v.target?.value ?? v }));

  const login = () => {
    if (!form.email || !form.password) { toast("Unesite email i lozinku!"); return; }
    const demos = [
      { email:"admin@tvojgrad.me", password:"admin", name:"Admin Adminović", role:"admin" },
      { email:"org@tvojgrad.me", password:"org", name:"Organizator", role:"organizer" },
    ];
    const found = demos.find(u => u.email === form.email && u.password === form.password);
    const u = found || { name: form.email.split("@")[0], email: form.email, role: "visitor" };
    setUser(u); navigate("home"); toast(`Dobrodošli, ${u.name}!`);
  };

  const register = () => {
    if (!form.name || !form.email || !form.password) { toast("Popunite sva polja!"); return; }
    setUser({ name: form.name, email: form.email, role: form.role });
    navigate("home"); toast(`Dobrodošli, ${form.name}!`);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">📍 Tvoj<span>Grad</span></div>
        <div className="auth-sub">{tab==="login" ? "Prijavite se na vaš nalog" : "Kreirajte novi nalog"}</div>
        <div className="auth-tabs">
          <button className={`auth-tab${tab==="login"?" active":""}`} onClick={() => setTab("login")}>Prijava</button>
          <button className={`auth-tab${tab==="register"?" active":""}`} onClick={() => setTab("register")}>Registracija</button>
        </div>
        {tab === "login" ? (
          <>
            <div style={{background:G.greenLight,border:`1px solid ${G.border}`,borderRadius:10,padding:"10px 14px",fontSize:12,color:G.greenDark,marginBottom:"1rem"}}>
              <strong>Demo:</strong> admin@tvojgrad.me / admin &nbsp;·&nbsp; org@tvojgrad.me / org
            </div>
            <div className="form-group"><label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="vas@email.com" value={form.email} onChange={set("email")} /></div>
            <div className="form-group"><label className="form-label">Lozinka</label>
              <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} onKeyDown={e => e.key==="Enter" && login()} /></div>
            <button className="auth-btn" onClick={login}>Prijavi se</button>
          </>
        ) : (
          <>
            <div className="form-group"><label className="form-label">Ime i prezime</label>
              <input className="form-input" placeholder="Vaše ime" value={form.name} onChange={set("name")} /></div>
            <div className="form-group"><label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="vas@email.com" value={form.email} onChange={set("email")} /></div>
            <div className="form-group"><label className="form-label">Lozinka</label>
              <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} /></div>
            <div className="form-group"><label className="form-label">Tip naloga</label>
              <select className="form-select" value={form.role} onChange={set("role")}>
                <option value="visitor">Posjetilac</option>
                <option value="organizer">Organizator</option>
              </select></div>
            <button className="auth-btn" onClick={register}>Registruj se</button>
          </>
        )}
        <div className="auth-switch">
          {tab==="login" ? <>Nemate nalog? <span onClick={() => setTab("register")}>Registrujte se</span></>
            : <>Imate nalog? <span onClick={() => setTab("login")}>Prijavite se</span></>}
        </div>
      </div>
    </div>
  );
}
