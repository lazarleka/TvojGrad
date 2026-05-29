import { useEffect, useState } from "react";
import { G } from "../constants";
import { API_BASE_URL, fetchUserVote, getStoredUser, getUserId, removeLegacyVote, submitVote } from "../api";

export default function DetailPage({ event: e, navigate, toast }) {
  const [currentUser] = useState(getStoredUser);
  const [isFav, setIsFav] = useState(false);
  const [myVote, setMyVote] = useState(null);
  const [event, setEvent] = useState(e);
  const [psmText, setPsmText] = useState("");
  const [psmPrijave, setPsmPrijave] = useState([]);
  const [psmLoading, setPsmLoading] = useState(false);
  const [sentPsmRequests, setSentPsmRequests] = useState({});

  const isLoggedIn = Boolean(currentUser);
  const uid = getUserId(currentUser);
  const eventId = event?.id || event?.ID;

  useEffect(() => {
    setEvent(e);
  }, [e]);

  useEffect(() => {
    if (!uid || !eventId) return;

    fetch(`${API_BASE_URL}/OmiljeniDogadjaji/${uid}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setIsFav((data || []).some((fav) => fav.ID === eventId)))
      .catch(() => {});

    fetchUserVote(eventId, uid).then(setMyVote).catch(() => {});
  }, [uid, eventId]);

  useEffect(() => {
    if (!eventId) return;
    loadPsmPrijave();
  }, [eventId]);

  useEffect(() => {
    if (!uid) {
      setSentPsmRequests({});
      return;
    }
    loadSentPsmRequests();
  }, [uid]);

  const loadPsmPrijave = async () => {
    setPsmLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/prijave/objava/${eventId}`);
      if (response.ok) {
        const data = await response.json();
        setPsmPrijave(data || []);
      }
    } catch (err) {
      setPsmPrijave([]);
    } finally {
      setPsmLoading(false);
    }
  };

  const loadSentPsmRequests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/zahtevi`);
      if (!response.ok) return;
      const data = await response.json();
      const sent = {};
      (data || []).forEach((zahtev) => {
        const senderId = getUserId(zahtev.PosloZahtev || zahtev.posloZahtev);
        const receiverId = zahtev.PrimioZahtev || zahtev.primioZahtev;
        if (String(senderId) === String(uid) && receiverId) {
          sent[String(receiverId)] = true;
        }
      });
      setSentPsmRequests(sent);
    } catch {
      setSentPsmRequests({});
    }
  };

  if (!event) {
    return (
      <div className="main">
        <div className="empty">Dogadjaj nije pronadjen.</div>
        <button className="detail-back" onClick={() => navigate("home")}>Nazad</button>
      </div>
    );
  }

  const title = event.title || event.Naslov;
  const opis = event.description || event.desc || event.Opis;
  const datum = event.date || event.Datum;
  const vreme = event.time || event.Vreme;
  const grad = event.city || event.Grad;
  const tip = event.Tip_dogadjaja || event.category;
  const organizer = event.organizer || event.Organizator;
  const emoji = event.emoji || event.Emoji || "📌";
  const coverColor = event.coverColor || "#1D9E75";
  const price = event.price ?? event.Cijena;
  const votes = event.votes || { up: event.Upvote ?? 0, down: event.Downvote ?? 0 };

  const handleVote = async (voteType) => {
    if (!isLoggedIn || !uid) {
      toast && toast("Prijavite se da biste glasali!");
      return;
    }
    if (myVote === voteType) return;

    const previousVote = myVote;
    try {
      const updated = await submitVote(eventId, uid, voteType);
      let nextEvent = updated;
      if (previousVote && previousVote !== voteType && updated.__usedLegacyVoteEndpoint) {
        nextEvent = await removeLegacyVote(eventId, previousVote).catch(() => updated);
      }
      setEvent(nextEvent);
      setMyVote(voteType);
      toast && toast(voteType === "up" ? "Glasali ste!" : "Reagovali ste");
    } catch (err) {
      console.error(err);
      toast && toast("Glas nije sacuvan.");
    }
  };

  const handleToggleFav = async () => {
    if (!isLoggedIn || !uid) {
      toast && toast("Prijavite se da biste dodali u omiljene!");
      return;
    }

    try {
      if (isFav) {
        await fetch(`${API_BASE_URL}/OmiljeniDogadjaji/${uid}/${eventId}`, { method: "DELETE" });
        setIsFav(false);
        toast && toast("Uklonjeno iz omiljenih.");
      } else {
        await fetch(`${API_BASE_URL}/OmiljeniDogadjaji/${uid}/${eventId}`, { method: "POST" });
        setIsFav(true);
        toast && toast("Dodato u omiljene!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePsmPrijava = async () => {
    if (!isLoggedIn || !uid) {
      toast && toast("Prijavite se da biste trazili drustvo.");
      return;
    }
    if (eventPsmClosed) {
      toast && toast("Prijave za ovaj dogadjaj su zatvorene.");
      return;
    }
    if (!psmText.trim()) {
      toast && toast("Unesite poruku za prijavu.");
      return;
    }

    const alreadyApplied = psmPrijave.some((p) => String(p.Korisnik_ID || p.korisnik_ID || getUserId(p.Korisnik || p.korisnik)) === String(uid));
    if (alreadyApplied) {
      toast && toast("Vec ste se prijavili za ovaj dogadjaj.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/prijave/${uid}/${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Tekst: psmText.trim(),
          Status: "otvoren",
        }),
      });

      if (!response.ok) {
        const fallbackResponse = await fetch(`${API_BASE_URL}/prijave`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Tekst: psmText.trim(),
            Status: "otvoren",
            Korisnik: { ID: uid, id: uid },
            Objava_ID: eventId,
          }),
        });
        if (!fallbackResponse.ok) {
          const errorText = await fallbackResponse.text();
          throw new Error(errorText || "Prijava nije sacuvana");
        }
      }
      setPsmText("");
      await loadPsmPrijave();
      toast && toast("Dodati ste u listu za 'Podji sa mnom'.");
    } catch (err) {
      console.error(err);
      toast && toast("Prijava nije sacuvana.");
    }
  };

  const handleSendPsmZahtev = async (targetUser, prijavaID, targetIdOverride) => {
    if (!isLoggedIn || !uid) {
      toast && toast("Prijavite se da biste poslali zahtjev.");
      return;
    }

    const targetId = targetIdOverride || getUserId(targetUser);
    if (!targetId) {
      toast && toast("Korisnik nije pronadjen.");
      return;
    }
    if (String(targetId) === String(uid)) {
      toast && toast("Ne mozete poslati zahtjev sebi.");
      return;
    }
    if (sentPsmRequests[String(targetId)]) {
      toast && toast("Zahtjev je vec poslat.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/zahtevi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "na cekanju",
          PosloZahtev: { ID: uid },
          PrimioZahtev: targetId,
        }),
      });

      if (!response.ok) throw new Error("Zahtjev nije poslat");
      const savedRequest = await response.json();
      const savedSenderId = getUserId(savedRequest.PosloZahtev || savedRequest.posloZahtev);
      const savedReceiverId = savedRequest.PrimioZahtev || savedRequest.primioZahtev;
      if (String(savedSenderId) === String(uid) && String(savedReceiverId) === String(targetId)) {
        setSentPsmRequests((prev) => ({ ...prev, [String(targetId)]: true }));
        toast && toast("Zahtjev je poslat.");
      } else {
        toast && toast("Vec postoji zahtjev od tog korisnika.");
      }
    } catch (err) {
      console.error(err);
      toast && toast("Zahtjev nije poslat.");
    }
  };

  const psmApplicants = psmPrijave.map((prijava) => ({
    prijava,
    korisnik: prijava.Korisnik || prijava.korisnik,
  }));
  const getPrijavaUserId = (prijava, korisnik) => prijava?.Korisnik_ID || prijava?.korisnik_ID || getUserId(korisnik);
  const currentUserApplied = psmApplicants.some(({ prijava, korisnik }) => String(getPrijavaUserId(prijava, korisnik)) === String(uid));
  const isClosedStatus = (status) => {
    const value = (status || "").toLowerCase();
    return ["otkazana", "otkazan", "zatvorena", "zatvoren", "popunjen", "popunjena"].some((locked) => value.includes(locked));
  };
  const eventPsmClosed = isClosedStatus(event.Status || event.status);

  return (
    <div className="main">
      <button className="detail-back" onClick={() => navigate("home")}>
        Nazad na dogadjaje
      </button>

      <div className="detail-hero">
        {event.coverImg ? (
          <img src={event.coverImg} alt={title} className="detail-hero-img" />
        ) : (
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(135deg, ${G.greenDark}, ${coverColor})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80,
          }}>
            {emoji}
          </div>
        )}
        <div className="detail-hero-overlay" />
        <div className="detail-hero-content">
          <span className="detail-cat">{tip}</span>
          <div className="detail-title">{title}</div>
          <div className="detail-hero-meta">
            <span>{datum ? new Date(datum).toLocaleDateString("sr-Latn", { day: "numeric", month: "long", year: "numeric" }) : "/"}</span>
            <span>{vreme || "/"}</span>
            <span>{grad || "/"}</span>
          </div>
          {event.promoted && (
            <span style={{
              marginTop: 8, display: "inline-block",
              background: "rgba(255,255,255,0.2)", color: "#fff",
              padding: "4px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600,
            }}>
              Promovisano
            </span>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <div>
          <div className="detail-card">
            <h3>O dogadjaju</h3>
            <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.7 }}>
              {opis || "Nema opisa za ovaj dogadjaj."}
            </p>
          </div>

          <div className="detail-card" style={{ marginTop: 16 }}>
            <h3>Podji sa mnom</h3>
            <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.6, marginTop: 0 }}>
              Prijavi se ako trazis drustvo za ovaj dogadjaj ili posalji zahtjev nekome ko se vec prijavio.
            </p>

            {isLoggedIn ? (
              <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                <textarea
                  value={psmText}
                  onChange={(ev) => setPsmText(ev.target.value)}
                disabled={currentUserApplied || eventPsmClosed}
                placeholder={
                  eventPsmClosed
                    ? "Prijave za ovaj dogadjaj su zatvorene."
                    : currentUserApplied
                      ? "Vec ste u listi za ovaj dogadjaj."
                      : "Npr. Idem iz Podgorice, trazim drustvo za koncert..."
                }
                  rows={3}
                  style={{
                    width: "100%",
                    resize: "vertical",
                    border: "1px solid #eee",
                    borderRadius: 10,
                    padding: 12,
                    fontFamily: "inherit",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
                <button
                  onClick={handleCreatePsmPrijava}
                  disabled={currentUserApplied || eventPsmClosed}
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    borderRadius: 10,
                    border: "none",
                    background: currentUserApplied || eventPsmClosed ? "#d7dedb" : G.green,
                    color: currentUserApplied || eventPsmClosed ? G.muted : "#fff",
                    cursor: currentUserApplied || eventPsmClosed ? "not-allowed" : "pointer",
                    fontWeight: 700,
                  }}
                >
                  {eventPsmClosed ? "Prijave zatvorene" : currentUserApplied ? "Vec ste prijavljeni" : "Dodaj me u listu"}
                </button>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: G.muted, marginBottom: 16 }}>
                <span style={{ color: G.green, cursor: "pointer", fontWeight: 700 }} onClick={() => navigate("auth")}>
                  Prijavite se
                </span> da biste se prijavili ili poslali zahtjev.
              </div>
            )}

            <div className="psm-table-wrap">
              <table className="psm-table">
                <thead>
                  <tr>
                    <th>Osoba</th>
                    <th>Poruka</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {psmLoading ? (
                    <tr>
                      <td colSpan="4" style={{ padding: 12, color: G.muted }}>Ucitavanje prijava...</td>
                    </tr>
                  ) : psmApplicants.length > 0 ? (
                    psmApplicants.map(({ prijava, korisnik }) => {
                      const applicantId = getPrijavaUserId(prijava, korisnik);
                      const requestSent = Boolean(sentPsmRequests[String(applicantId)]);
                      const applicantClosed = isClosedStatus(prijava.Status || prijava.status);
                      const fullName = `${korisnik?.Ime || korisnik?.ime || ""} ${korisnik?.Prezime || korisnik?.prezime || ""}`.trim() || korisnik?.Email || (applicantId ? `Korisnik #${applicantId}` : "Korisnik");
                      const canSendRequest = isLoggedIn && String(applicantId) !== String(uid) && !applicantClosed;
                      return (
                        <tr key={prijava.ID} style={{ borderBottom: "1px solid #f1f1f1" }}>
                          <td data-label="Osoba">{fullName}</td>
                          <td data-label="Poruka">{prijava.Tekst || "/"}</td>
                          <td data-label="Status">{prijava.Status || "/"}</td>
                          <td data-label="Akcija">
                            {canSendRequest ? (
                              <button
                                onClick={() => handleSendPsmZahtev(korisnik, prijava.ID, applicantId)}
                                disabled={requestSent}
                                style={{
                                  border: requestSent ? "1px solid #d7dedb" : `1px solid ${G.green}`,
                                  background: requestSent ? "#f3f6f5" : "#fff",
                                  color: requestSent ? G.muted : G.green,
                                  borderRadius: 10,
                                  padding: "8px 10px",
                                  cursor: requestSent ? "not-allowed" : "pointer",
                                  fontWeight: 700,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {requestSent ? "Zahtjev poslat" : "Posalji zahtjev"}
                              </button>
                            ) : (
                              <span style={{ color: G.muted, fontSize: 13 }}>
                                {String(applicantId) === String(uid) ? "Vi" : applicantClosed ? "Nije dostupno" : ""}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ padding: 12, color: G.muted }}>
                        Jos nema prijavljenih osoba za ovaj dogadjaj.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="detail-card">
            <h3>Detalji</h3>
            {[
              { label: "Datum", value: datum ? new Date(datum).toLocaleDateString("sr-Latn", { day: "numeric", month: "long", year: "numeric" }) : "/" },
              { label: "Vrijeme", value: vreme || "/" },
              { label: "Grad", value: grad || "/" },
              { label: "Tip dogadjaja", value: tip || "/" },
              { label: "Organizator", value: organizer || "/" },
              { label: "Cijena", value: price == null || price === 0 ? "Besplatno" : `${price} EUR` },
            ].map(({ label, value }) => (
              <div key={label} className="detail-info-row">
                <div>
                  <div className="detail-label">{label}</div>
                  <div className="detail-value">{value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="detail-card">
            <h3>Tvoja reakcija</h3>
            <div style={{ display: "flex", gap: 8, marginBottom: "0.75rem" }}>
              <button
                onClick={() => handleVote("up")}
                style={{
                  flex: 1, padding: "10px", borderRadius: 10, fontSize: 15,
                  border: myVote === "up" ? "1.5px solid #1D9E75" : "1.5px solid #eee",
                  background: myVote === "up" ? "#1D9E75" : "transparent",
                  color: myVote === "up" ? "#fff" : "inherit",
                  fontWeight: myVote === "up" ? 700 : 400,
                  cursor: isLoggedIn ? "pointer" : "not-allowed",
                  opacity: isLoggedIn ? 1 : 0.5,
                }}
              >
                👍 {votes.up}
              </button>
              <button
                onClick={() => handleVote("down")}
                style={{
                  flex: 1, padding: "10px", borderRadius: 10, fontSize: 15,
                  border: myVote === "down" ? "1.5px solid #e74c3c" : "1.5px solid #eee",
                  background: myVote === "down" ? "#e74c3c" : "transparent",
                  color: myVote === "down" ? "#fff" : "inherit",
                  fontWeight: myVote === "down" ? 700 : 400,
                  cursor: isLoggedIn ? "pointer" : "not-allowed",
                  opacity: isLoggedIn ? 1 : 0.5,
                }}
              >
                👎 {votes.down}
              </button>
            </div>
            {myVote && (
              <div
                style={{
                  marginBottom: "0.75rem",
                  color: myVote === "up" ? "#1D9E75" : "#e74c3c",
                  fontSize: 13,
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                {myVote === "up" ? "Ovaj dogadjaj ti se svidja." : "Ovaj dogadjaj ti se ne svidja."}
              </div>
            )}

            {isLoggedIn ? (
              <button
                onClick={handleToggleFav}
                style={{
                  width: "100%", padding: "10px", borderRadius: 10,
                  border: isFav ? "1.5px solid #e74c3c" : "1.5px solid #eee",
                  background: isFav ? "#fff0f0" : "transparent",
                  color: isFav ? "#e74c3c" : "inherit",
                  cursor: "pointer", fontWeight: 500, fontSize: 14,
                }}
              >
                {isFav ? "❤️ Ukloni iz omiljenih" : "🤍 Dodaj u omiljene"}
              </button>
            ) : (
              <div style={{ fontSize: 13, color: G.muted, textAlign: "center" }}>
                <span style={{ color: G.green, cursor: "pointer", fontWeight: 500 }} onClick={() => navigate("auth")}>
                  Prijavite se
                </span> da biste glasali i dodali u omiljene.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
