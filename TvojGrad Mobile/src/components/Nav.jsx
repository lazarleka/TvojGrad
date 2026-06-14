import { useState } from "react";
import { stopMobileBackgroundNotifications } from "../mobileNotifications";

export default function Nav({ page, navigate, user, setUser, toast, unreadCount, language = "SRB", setLanguage, t = (key) => key }) {
  const korisnikTip = user?.tip || user?.Tip;
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (target) => {
    navigate(target);
    setMenuOpen(false);
  };

  const logout = () => {
    void stopMobileBackgroundNotifications();
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
        <button className={`nav-link${page === "home" ? " active" : ""}`} onClick={() => go("home")}>
          {t("events")}
        </button>
        <button className={`nav-link${page === "popular" ? " active" : ""}`} onClick={() => go("popular")}>
          {t("popular")}
        </button>
        <button className={`nav-link${page === "favorites" ? " active" : ""}`} onClick={() => go("favorites")}>
          {t("favorites")}
        </button>

        {user && (
          <button className={`nav-link${page === "profile" ? " active" : ""}`} onClick={() => go("profile")}>
            {t("profile")} {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
          </button>
        )}

        {korisnikTip === "organizator" && (
          <button className={`nav-link${page === "organizer" ? " active" : ""}`} onClick={() => go("organizer")}>
            {t("myEvents")}
          </button>
        )}

        {korisnikTip === "administrator" && (
          <button className={`nav-link${page === "admin" ? " active" : ""}`} onClick={() => go("admin")}>
            {t("admin")}
          </button>
        )}

        <div className="language-tabs" aria-label="Language">
          {["SRB", "ENG"].map((code) => (
            <button
              key={code}
              className={`language-tab${language === code ? " active" : ""}`}
              onClick={() => setLanguage && setLanguage(code)}
              type="button"
            >
              {code}
            </button>
          ))}
        </div>

        {user ? (
          <button className="nav-link" onClick={logout}>
            {t("logout")}
          </button>
        ) : (
          <button className="nav-link cta" onClick={() => go("auth")}>
            {t("login")}
          </button>
        )}
      </div>
    </nav>
  );
}
