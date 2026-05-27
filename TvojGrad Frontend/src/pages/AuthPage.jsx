import { useState } from 'react';
import { G } from '../constants';

const API_BASE_URL = "http://localhost:8080"; 

export default function AuthPage({ setUser, navigate, toast }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "visitor" });
  
  const set = k => v => setForm(f => ({ ...f, [k]: v.target?.value ?? v }));

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
        Tip: korisnik.tip || korisnik.Tip
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
          email: form.email,
          lozinka: form.password
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
    if (!form.name || !form.email || !form.password) { 
      toast("Popunite sva polja!"); 
      return; 
    }

    const nameParts = form.name.trim().split(" ");
    const ime = nameParts[0];
    const prezime = nameParts.slice(1).join(" ") || ""; 
    const dbRole = form.role === "organizer" ? "organizator" : "obicni";

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ime: ime,
          prezime: prezime,
          email: form.email,
          tip: dbRole, 
          lozinka: form.password,
          profilna: "" 
        })
      });

      if (response.status === 201) {
        const noviKorisnik = await response.json();
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
              <label className="form-label">Tip naloga</label>
              <select className="form-select" value={form.role} onChange={set("role")}>
                <option value="visitor">Posjetilac</option>
                <option value="organizer">Organizator</option>
              </select>
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