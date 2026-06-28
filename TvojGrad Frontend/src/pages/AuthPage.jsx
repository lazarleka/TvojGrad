import { useState } from 'react';
import { G } from '../constants';

const API_BASE_URL = "http://localhost:8080"; 

export default function AuthPage({ setUser, navigate, toast }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "visitor" });
  
  const set = k => v => setForm(f => ({ ...f, [k]: v.target?.value ?? v }));
  const selectedUserType = form.role === "organizer" ? "organizator" : "obicni";

  // KLJUČNA PROMJENA JE OVDJE
  const handleAuthSuccess = (korisnik) => {
    setUser(korisnik); 

    if (korisnik) {
      // 1. Zadržavamo tvoj stari userId ključ ako ti zatreba negdje u kodu
      const id = korisnik.id || korisnik.ID;
      if (id) {
        localStorage.setItem("userId", String(id));
      }

      // 2. Čuvamo kompletan objekat (ID, Ime, Prezime, Email, Profilna, Tip...) u jedan ključ
      // Koristimo i velika i mala slova za ključna polja kako bismo osigurali kompatibilnost sa backendom
      const userZaSkladistenje = {
        id: id,
        ID: id,
        ime: korisnik.ime || korisnik.Ime,
        Ime: korisnik.ime || korisnik.Ime,
        prezime: korisnik.prezime || korisnik.Prezime,
        Prezime: korisnik.prezime || korisnik.Prezime,
        email: korisnik.email || korisnik.Email,
        Email: korisnik.email || korisnik.Email,
        profilna: korisnik.profilna || korisnik.Profilna || "",
        Profilna: korisnik.profilna || korisnik.Profilna || "",
        tip: korisnik.tip || korisnik.Tip,
        Tip: korisnik.tip || korisnik.Tip,
        O_meni: korisnik.O_meni || korisnik.oMeni || korisnik.o_meni || "",
        Interesovanja: korisnik.Interesovanja || korisnik.interesovanja || "",
        Neinteresovanja: korisnik.Neinteresovanja || korisnik.neinteresovanja || "",
        Grad: korisnik.Grad || korisnik.grad || ""
      };

      localStorage.setItem("user", JSON.stringify(userZaSkladistenje));
    }

    navigate("home");
  };

  const login = async () => {
    if (!form.email || !form.password) { 
      toast("Unesite email i lozinku!"); 
      return; 
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Email: form.email.trim(),
          Lozinka: form.password
        })
      });

      if (response.ok) {
        const korisnik = await response.json();
        handleAuthSuccess(korisnik);
        const imePrikaz = korisnik.ime || korisnik.Ime;
        toast(`Dobrodošli nazad, ${imePrikaz}!`);
      } else {
        const errorText = await response.text();
        toast(errorText || "Pogrešan email ili lozinka!");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast("Greška prilikom povezivanja sa serverom.");
    }
  };

  const register = async () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) { 
      toast("Popunite sva polja!"); 
      return; 
    }
    if (form.password !== form.confirmPassword) {
      toast("Lozinke se ne poklapaju!");
      return;
    }

    const nameParts = form.name.trim().split(" ");
    const ime = nameParts[0];
    const prezime = nameParts.slice(1).join(" ") || ""; 

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Ime: ime,
          Prezime: prezime,
          Email: form.email.trim(),
          Tip: selectedUserType,
          Lozinka: form.password,
          Profilna: ""
        })
      });

      if (response.status === 201) {
        const noviKorisnik = await response.json();
        if ((noviKorisnik.Status || noviKorisnik.status) === "na_cekanju_organizator") {
          toast("Registracija organizatora je poslata. Možete se prijaviti tek kada vas admin odobri.");
          setTab("login");
          return;
        }
        handleAuthSuccess(noviKorisnik);
        const imePrikaz = noviKorisnik.ime || noviKorisnik.Ime;
        toast(`Uspješna registracija! Dobrodošli, ${imePrikaz}!`);
      } else {
        const errorText = await response.text();
        toast(errorText || "Registracija nije uspjela.");
      }
    } catch (error) {
      console.error("Register error:", error);
      toast("Greška prilikom povezivanja sa serverom.");
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">📍 Tvoj<span>Grad</span></div>
        <div className="auth-sub">{tab === "login" ? "Prijavite se na vaš nalog" : "Kreirajte novi nalog"}</div>
        <div className="auth-tabs">
          <button className={`auth-tab${tab === "login" ? " active" : ""}`} onClick={() => setTab("login")}>Prijava</button>
          <button className={`auth-tab${tab === "register" ? " active" : ""}`} onClick={() => setTab("register")}>Registracija</button>
        </div>
        
        {tab === "login" ? (
          <>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="vas@email.com" value={form.email} onChange={set("email")} />
            </div>
            <div className="form-group">
              <label className="form-label">Lozinka</label>
              <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} onKeyDown={e => e.key === "Enter" && login()} />
            </div>
            <button className="auth-btn" onClick={login}>Prijavi se</button>
          </>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">Ime i prezime</label>
              <input className="form-input" placeholder="Vaše ime" value={form.name} onChange={set("name")} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="vas@email.com" value={form.email} onChange={set("email")} />
            </div>
            <div className="form-group">
              <label className="form-label">Lozinka</label>
              <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} />
            </div>
            <div className="form-group">
              <label className="form-label">Potvrdi lozinku</label>
              <input className="form-input" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={set("confirmPassword")} onKeyDown={e => e.key === "Enter" && register()} />
            </div>
            <div className="form-group">
              <label className="form-label">Tip naloga</label>
              <select className="form-select" value={form.role} onChange={set("role")}>
                <option value="visitor">Posjetilac</option>
                <option value="organizer">Organizator</option>
              </select>
              {form.role === "organizer" && (
                <div style={{ fontSize: 12, color: G.muted, marginTop: 6 }}>
                  Organizatorski nalog mora da odobri administrator.
                </div>
              )}
            </div>
            <button className="auth-btn" onClick={register}>Registruj se</button>
          </>
        )}
        
        <div className="auth-switch">
          {tab === "login" ? (
            <>Nemate nalog? <span onClick={() => setTab("register")}>Registrujte se</span></>
          ) : (
            <>Imate nalog? <span onClick={() => setTab("login")}>Prijavite se</span></>
          )}
        </div>
      </div>
    </div>
  );
}
