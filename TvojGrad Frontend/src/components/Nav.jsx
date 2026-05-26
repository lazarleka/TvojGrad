export default function Nav({ page, navigate, user, setUser, toast, unreadCount }) {
  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => navigate("home")}>
        <img src="/TvojGrad_logo.png" alt="TvojGrad" style={{ height: 28, width: "auto" }} />
      </div>
      <div className="nav-links">
        <button className={`nav-link${page === "home" ? " active" : ""}`} onClick={() => navigate("home")}>
          Događaji
        </button>
        <button className={`nav-link${page === "popular" ? " active" : ""}`} onClick={() => navigate("popular")}>
          Popularno
        </button>
        <button className={`nav-link${page === "favorites" ? " active" : ""}`} onClick={() => navigate("favorites")}>
          Omiljeni
        </button>
        {user && (
          <button className={`nav-link${page === "profile" ? " active" : ""}`} onClick={() => navigate("profile", null, { profileTab: "inbox" })}>
            Poruke {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
          </button>
        )}
        {user?.role === "organizer" && (
          <button className={`nav-link${page === "organizer" ? " active" : ""}`} onClick={() => navigate("organizer")}>
            Moji događaji
          </button>
        )}
        {user?.role === "admin" && (
          <button className={`nav-link${page === "admin" ? " active" : ""}`} onClick={() => navigate("admin")}>
            Admin
          </button>
        )}
        {user ? (
          <>
            <button className="nav-user" onClick={() => navigate("profile")}>
              {user.name.split(" ")[0]}
            </button>
            <button
              className="nav-link"
              onClick={() => {
                setUser(null);
                navigate("home");
                toast("Odjavljeni ste");
              }}
            >
              Odjava
            </button>
          </>
        ) : (
          <button className="nav-link cta" onClick={() => navigate("auth")}>
            Prijava
          </button>
        )}
      </div>
    </nav>
  );
}
