import { useState } from "react";

export default function Nav({ page, navigate, user, setUser, toast, unreadCount }) {
  const korisnikTip = user?.tip || user?.Tip;
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (target) => {
    navigate(target);
    setMenuOpen(false);
  };

  const logout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userAvatar");
    localStorage.removeItem("myVotes");
    setUser(null);
    go("home");
    toast("Odjavljeni ste");
    setTimeout(() => window.location.reload(), 100);
  };

  return (
    <nav className="nav">
      <div className="nav-top">
        <div className="nav-logo" onClick={() => go("home")}>
          <img src="/TvojGrad_logo.png" alt="TvojGrad" className="nav-logo-img" />
        </div>
        <button
          className={`nav-menu-btn${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Otvori meni"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <div className={`nav-links${menuOpen ? " open" : ""}`}>
        <button data-icon="⌂" className={`nav-link${page === "home" ? " active" : ""}`} onClick={() => go("home")}>
          Dogadjaji
        </button>
        <button data-icon="◎" className={`nav-link${page === "popular" ? " active" : ""}`} onClick={() => go("popular")}>
          Popularno
        </button>
        <button data-icon="♡" className={`nav-link${page === "favorites" ? " active" : ""}`} onClick={() => go("favorites")}>
          Omiljeni
        </button>

        {user && (
          <button data-icon="○" className={`nav-link${page === "profile" ? " active" : ""}`} onClick={() => go("profile")}>
            Profil {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
          </button>
        )}

        {korisnikTip === "organizator" && (
          <button data-icon="+" className={`nav-link${page === "organizer" ? " active" : ""}`} onClick={() => go("organizer")}>
            Moji dogadjaji
          </button>
        )}

        {korisnikTip === "administrator" && (
          <button data-icon="⚙" className={`nav-link${page === "admin" ? " active" : ""}`} onClick={() => go("admin")}>
            Admin
          </button>
        )}

        {user ? (
          <button data-icon="×" className="nav-link" onClick={logout}>
            Odjava
          </button>
        ) : (
          <button data-icon="↳" className="nav-link cta" onClick={() => go("auth")}>
            Prijava
          </button>
        )}
      </div>
    </nav>
  );
}
