export default function Nav({ page, navigate, user, setUser, toast, unreadCount }) {
  const korisnikTip = user?.tip || user?.Tip;

  const logout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userAvatar");
    localStorage.removeItem("myVotes");
    setUser(null);
    navigate("home");
    toast("Odjavljeni ste");
    setTimeout(() => window.location.reload(), 100);
  };

  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => navigate("home")}>
        <img src="/TvojGrad_logo.png" alt="TvojGrad" style={{ height: 28, width: "auto" }} />
      </div>
      <div className="nav-links">
        <button className={`nav-link${page === "home" ? " active" : ""}`} onClick={() => navigate("home")}>
          Dogadjaji
        </button>
        <button className={`nav-link${page === "popular" ? " active" : ""}`} onClick={() => navigate("popular")}>
          Popularno
        </button>
        <button className={`nav-link${page === "favorites" ? " active" : ""}`} onClick={() => navigate("favorites")}>
          Omiljeni
        </button>

        {user && (
          <button className={`nav-link${page === "profile" ? " active" : ""}`} onClick={() => navigate("profile")}>
            Profil {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
          </button>
        )}

        {korisnikTip === "organizator" && (
          <button className={`nav-link${page === "organizer" ? " active" : ""}`} onClick={() => navigate("organizer")}>
            Moji dogadjaji
          </button>
        )}

        {korisnikTip === "administrator" && (
          <button className={`nav-link${page === "admin" ? " active" : ""}`} onClick={() => navigate("admin")}>
            Admin
          </button>
        )}

        {user ? (
          <button className="nav-link" onClick={logout}>
            Odjava
          </button>
        ) : (
          <button className="nav-link cta" onClick={() => navigate("auth")}>
            Prijava
          </button>
        )}
      </div>
    </nav>
  );
}
