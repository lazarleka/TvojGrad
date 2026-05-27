import { G } from '../constants';

export default function Nav({ page, navigate, user, setUser, toast, unreadCount }) {
  
  // Izvlačimo ulogu i ime na siguran način (pokrivamo i velika i mala slova iz baze/JSON-a)
  const korisnikTip = user?.tip || user?.Tip;
  const korisnikIme = user?.ime || user?.Ime;

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
          <button className={`nav-link${page === "obican" ? " active" : ""}`} onClick={() => navigate("profile", null, { profileTab: "inbox" })}>
            Poruke {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
          </button>
        )}
        
        {/* Provjera uloge: organizator */}
        {korisnikTip === "organizator" && (
          <button className={`nav-link${page === "organizer" ? " active" : ""}`} onClick={() => navigate("organizer")}>
            Moji događaji
          </button>
        )}
        
        {/* Provjera uloge: administrator */}
        {korisnikTip === "administrator" && (
          <button className={`nav-link${page === "admin" ? " active" : ""}`} onClick={() => navigate("admin")}>
            Admin
          </button>
        )}
        
        {user ? (
          <>
            <button className="nav-user" onClick={() => navigate("profile")}>
              {/* Dinamički prikaz profilne slike ako postoji, u suprotnom ime */}
              {user?.profilna || user?.Profilna ? (
                <img 
                  src={user.profilna || user.Profilna} 
                  alt="Profil" 
                  style={{ width: 24, height: 24, borderRadius: "50%", marginRight: 8, verticalAlign: "middle", objectFit: "cover" }} 
                />
              ) : null}
              {korisnikIme ? korisnikIme : "Profil"}
            </button>
           <button
              className="nav-link"
              onClick={() => {
                // Brišemo sve tragove korisnika iz browsera
                localStorage.removeItem("userId");
                localStorage.removeItem("user");
                
                // Opciono: ako čuvaš ime, mail i profilnu kao zasebne ključeve, obriši i njih
                localStorage.removeItem("userName");
                localStorage.removeItem("userEmail");
                localStorage.removeItem("userAvatar");
                
                setUser(null);
                navigate("home");
                toast("Odjavljeni ste");

                // OSVJEŽAVANJE STRANICE: Dodato grubo osvježavanje nakon kraćeg timeout-a 
                // kako bi toast poruka stigla da se prikaže prije nego što se state obriše reload-om
                setTimeout(() => {
                  window.location.reload();
                }, 100);
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