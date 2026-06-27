import { useEffect, useState } from "react";
import { G } from "../constants";
import EventMap from "../components/EventMap";
import { API_BASE_URL, fetchUserVote, formatDisplayDate, formatDisplayTime, getEventAddress, getStoredUser, getUserId, removeLegacyVote, submitVote } from "../api";
import { translateText } from "../i18n";

const newestFirst = (items) => [...(items || [])].sort((a, b) => Number(b?.ID || b?.id || 0) - Number(a?.ID || a?.id || 0));

export default function DetailPage({ event: e, navigate, toast, t = (key) => key, language = "SRB" }) {
  const [currentUser] = useState(getStoredUser);
  const [isFav, setIsFav] = useState(false);
  const [myVote, setMyVote] = useState(null);
  const [event, setEvent] = useState(e);
  const [psmText, setPsmText] = useState("");
  const [psmPrijave, setPsmPrijave] = useState([]);
  const [psmLoading, setPsmLoading] = useState(false);
  const [sentPsmRequests, setSentPsmRequests] = useState({});
  const [justSentPsmRequests, setJustSentPsmRequests] = useState({});
  const [cetsByUser, setCetsByUser] = useState({});
  const [sendingPsmRequests, setSendingPsmRequests] = useState({});

  const isLoggedIn = Boolean(currentUser);
  const uid = getUserId(currentUser);
  const eventId = event?.id || event?.ID;

  useEffect(() => {
    setEvent(e);
  }, [e]);

  useEffect(() => {
    setIsFav(false);
    setMyVote(null);
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
      setJustSentPsmRequests({});
      setCetsByUser({});
      return;
    }
    loadPsmRelations();
  }, [uid]);

  const loadPsmPrijave = async () => {
    setPsmLoading(true);
    try {
      const query = uid ? `?korisnikId=${encodeURIComponent(uid)}` : "";
      const response = await fetch(`${API_BASE_URL}/prijave/objava/${eventId}${query}`);
      if (response.ok) {
        const data = await response.json();
        setPsmPrijave(newestFirst(data));
      }
    } catch (err) {
      setPsmPrijave([]);
    } finally {
      setPsmLoading(false);
    }
  };

  const loadPsmRelations = async () => {
    try {
      const [requestsResponse, cetsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/zahtevi`),
        fetch(`${API_BASE_URL}/cetovi/korisnik/${uid}`),
      ]);

      const sent = {};
      if (requestsResponse.ok) {
        const requests = await requestsResponse.json();
        (requests || []).forEach((zahtev) => {
          const senderId = getUserId(zahtev.PosloZahtev || zahtev.posloZahtev);
          const receiverId = zahtev.PrimioZahtev || zahtev.primioZahtev;
          if (String(senderId) === String(uid) && receiverId) {
            sent[String(receiverId)] = zahtev;
          }
        });
      }

      const cets = {};
      if (cetsResponse.ok) {
        const data = await cetsResponse.json();
        (data || []).forEach((cet) => {
          const senderId = getUserId(cet.Posiljalac || cet.posiljalac);
          const receiverId = cet.Primalac_ID || cet.primalac_ID || getUserId(cet.Primalac || cet.primalac);
          const otherId = String(senderId) === String(uid) ? receiverId : senderId;
          if (otherId) cets[String(otherId)] = cet;
        });
      }
      setSentPsmRequests(sent);
      setCetsByUser(cets);
    } catch {
      setSentPsmRequests({});
      setCetsByUser({});
    }
  };

  if (!event) {
    return (
      <div className="main">
        <div className="empty">Događaj nije pronađen.</div>
        <button className="detail-back" onClick={() => navigate("home")}>Nazad</button>
      </div>
    );
  }

  const title = event.title || event.Naslov;
  const opis = event.description || event.desc || event.Opis;
  const datum = event.date || event.Datum;
  const vreme = event.time || event.Vreme;
  const grad = event.city || event.Grad;
  const address = getEventAddress(event);
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
    const previousEvent = event;
    const optimisticVotes = {
      up: votes.up + (voteType === "up" ? 1 : 0) - (previousVote === "up" ? 1 : 0),
      down: votes.down + (voteType === "down" ? 1 : 0) - (previousVote === "down" ? 1 : 0),
    };
    setMyVote(voteType);
    setEvent((current) => ({
      ...current,
      votes: optimisticVotes,
      Upvote: optimisticVotes.up,
      Downvote: optimisticVotes.down,
    }));

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
      setEvent(previousEvent);
      setMyVote(previousVote);
      toast && toast("Glas nije sačuvan.");
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
      toast && toast("Prijavite se da biste tražili društvo.");
      return;
    }
    if (eventPsmClosed) {
      toast && toast("Prijave za ovaj događaj su zatvorene.");
      return;
    }
    if (!psmText.trim()) {
      toast && toast("Unesite poruku za prijavu.");
      return;
    }

    const alreadyApplied = psmPrijave.some((p) => String(p.Korisnik_ID || p.korisnik_ID || getUserId(p.Korisnik || p.korisnik)) === String(uid));
    if (alreadyApplied) {
      toast && toast("Već ste se prijavili za ovaj događaj.");
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
          throw new Error(errorText || "Prijava nije sačuvana");
        }
      }
      setPsmText("");
      await loadPsmPrijave();
      toast && toast("Dodati ste u listu za 'Pođi sa mnom'.");
    } catch (err) {
      console.error(err);
      toast && toast("Prijava nije sačuvana.");
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
    if (cetsByUser[String(targetId)]?.ID) {
      openExistingCet(cetsByUser[String(targetId)]);
      return;
    }
    if (sentPsmRequests[String(targetId)]) {
      toast && toast("Vec imate zahtjev ka ovoj osobi.");
      return;
    }
    if (justSentPsmRequests[String(targetId)]) {
      toast && toast("Zahtjev je poslat.");
      return;
    }
    if (sendingPsmRequests[String(targetId)]) return;

    try {
      setSendingPsmRequests((prev) => ({ ...prev, [String(targetId)]: true }));
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
        setSentPsmRequests((prev) => ({ ...prev, [String(targetId)]: savedRequest }));
        setJustSentPsmRequests((prev) => ({ ...prev, [String(targetId)]: true }));
        toast && toast("Zahtjev je poslat.");
      } else {
        setSentPsmRequests((prev) => ({ ...prev, [String(targetId)]: savedRequest }));
        setJustSentPsmRequests((prev) => ({ ...prev, [String(targetId)]: true }));
        toast && toast("Zahtjev je poslat.");
      }
      await loadPsmRelations();
    } catch (err) {
      console.error(err);
      toast && toast("Zahtjev nije poslat.");
    } finally {
      setSendingPsmRequests((prev) => {
        const next = { ...prev };
        delete next[String(targetId)];
        return next;
      });
    }
  };

  const openExistingCet = (cet) => {
    if (!cet?.ID || !uid) return;
    localStorage.setItem(`openCetId:${uid}`, String(cet.ID));
    navigate("profile", null, { profileTab: "inbox" });
  };

  const getPrijavaUserId = (prijava, korisnik) => prijava?.Korisnik_ID || prijava?.korisnik_ID || getUserId(korisnik);
  const isClosedStatus = (status) => {
    const value = (status || "").toLowerCase();
    return ["arhiv", "otkazana", "otkazan", "zatvorena", "zatvoren", "popunjen", "popunjena"].some((locked) => value.includes(locked));
  };
  const visiblePsmPrijave = psmPrijave.filter((prijava) => !isClosedStatus(prijava.Status || prijava.status));
  const psmApplicants = visiblePsmPrijave.map((prijava) => ({
    prijava,
    korisnik: prijava.Korisnik || prijava.korisnik,
  }));
  const currentUserApplied = psmPrijave.some((prijava) => {
    const korisnik = prijava.Korisnik || prijava.korisnik;
    return String(getPrijavaUserId(prijava, korisnik)) === String(uid);
  });
  const eventPsmClosed = isClosedStatus(event.Status || event.status);

  return (
    <div className="main">
      <button className="detail-back" onClick={() => navigate("home")}>
        {t("backToEvents")}
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
          <span className="detail-cat">{translateText(tip, language)}</span>
          <div className="detail-title">{translateText(title, language)}</div>
          <div className="detail-hero-meta">
            <span>{formatDisplayDate(datum)}</span>
            <span>{formatDisplayTime(vreme)}</span>
            <span>{translateText(grad, language) || "/"}</span>
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
            <h3>{t("aboutEvent")}</h3>
            <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.7 }}>
              {translateText(opis, language) || "Nema opisa za ovaj događaj."}
            </p>
          </div>

          <div className="detail-card" style={{ marginTop: 16 }}>
            <h3>{t("psm")}</h3>
            <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.6, marginTop: 0 }}>
              Prijavi se ako tražiš društvo za ovaj događaj ili pošalji zahtjev nekome ko se već prijavio.
            </p>

            {isLoggedIn ? (
              <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                <textarea
                  value={psmText}
                  onChange={(ev) => setPsmText(ev.target.value)}
                disabled={currentUserApplied || eventPsmClosed}
                placeholder={
                  eventPsmClosed
                    ? "Prijave za ovaj događaj su zatvorene."
                    : currentUserApplied
                      ? "Već ste u listi za ovaj događaj."
                      : "Npr. Idem iz Podgorice, tražim društvo za koncert..."
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
                    <th>Podudaranje</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {psmLoading ? (
                    <tr>
                      <td colSpan="4" style={{ padding: 12, color: G.muted }}>Učitavanje prijava...</td>
                    </tr>
                  ) : psmApplicants.length > 0 ? (
                    psmApplicants.map(({ prijava, korisnik }) => {
                      const applicantId = getPrijavaUserId(prijava, korisnik);
                      const existingCet = cetsByUser[String(applicantId)];
                      const requestSent = Boolean(sentPsmRequests[String(applicantId)]);
                      const requestJustSent = Boolean(justSentPsmRequests[String(applicantId)]);
                      const requestSending = Boolean(sendingPsmRequests[String(applicantId)]);
                      const applicantClosed = isClosedStatus(prijava.Status || prijava.status);
                      const fullName = `${korisnik?.Ime || korisnik?.ime || ""} ${korisnik?.Prezime || korisnik?.prezime || ""}`.trim() || korisnik?.Email || "Korisnik";
                      const canSendRequest = isLoggedIn && String(applicantId) !== String(uid) && !applicantClosed;
                      const matchScore = prijava.Podudaranje ?? prijava.podudaranje;
                      const matchLabel = prijava.Kategorija_podudaranja || prijava.kategorija_podudaranja;
                      const matchColor = matchScore >= 75 ? "#16784f" : matchScore >= 50 ? "#39721d" : matchScore >= 25 ? "#a16609" : "#9b3c3c";
                      return (
                        <tr key={prijava.ID} style={{ borderBottom: "1px solid #f1f1f1" }}>
                          <td data-label="Osoba">{fullName}</td>
                          <td data-label="Poruka">{prijava.Tekst || "/"}</td>
                          <td data-label="Status">{prijava.Status || "/"}</td>
                          <td data-label="Podudaranje">
                            {matchScore == null ? "" : (
                              <div title={(prijava.Razlozi_podudaranja || []).join(" · ")}>
                                <strong style={{ color: matchColor }}>{matchScore}%</strong>
                                <div style={{ color: matchColor, fontSize: 11, whiteSpace: "nowrap" }}>{matchLabel}</div>
                              </div>
                            )}
                          </td>
                          <td data-label="Akcija">
                            {existingCet?.ID ? (
                              <button
                                onClick={() => openExistingCet(existingCet)}
                                style={{
                                  border: `1px solid ${G.green}`,
                                  background: "#fff",
                                  color: G.green,
                                  borderRadius: 10,
                                  padding: "5px 8px",
                                  width: "100%",
                                  boxSizing: "border-box",
                                  minHeight: 34,
                                  fontSize: 13,
                                  cursor: "pointer",
                                  fontWeight: 700,
                                  whiteSpace: "normal",
                                  overflowWrap: "anywhere",
                                  lineHeight: 1.2,
                                }}
                              >
                                Otvori chat
                              </button>
                            ) : canSendRequest ? (
                              <button
                                onClick={() => handleSendPsmZahtev(korisnik, prijava.ID, applicantId)}
                                disabled={requestSent || requestJustSent || requestSending}
                                style={{
                                  border: requestSent || requestJustSent || requestSending ? "1px solid #d7dedb" : `1px solid ${G.green}`,
                                  background: requestSent || requestJustSent || requestSending ? "#f3f6f5" : "#fff",
                                  color: requestSent || requestJustSent || requestSending ? G.muted : G.green,
                                  borderRadius: 10,
                                  padding: "5px 8px",
                                  width: "100%",
                                  boxSizing: "border-box",
                                  minHeight: 34,
                                  fontSize: 13,
                                  cursor: requestSent || requestJustSent || requestSending ? "not-allowed" : "pointer",
                                  fontWeight: 700,
                                  whiteSpace: "normal",
                                  overflowWrap: "anywhere",
                                  lineHeight: 1.2,
                                }}
                              >
                                {requestJustSent || requestSent ? "Zahtjev poslat" : requestSending ? "Slanje..." : "Pošalji zahtjev"}
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
                        Još nema prijavljenih osoba za ovaj događaj.
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
            <h3>{t("details")}</h3>
            {[
              { label: t("date"), value: formatDisplayDate(datum) },
              { label: language === "ENG" ? "Time" : "Vrijeme", value: formatDisplayTime(vreme) },
              { label: language === "ENG" ? "City" : "Grad", value: translateText(grad, language) || "/" },
              { label: language === "ENG" ? "Address" : "Adresa", value: translateText(address, language) || "/" },
              { label: language === "ENG" ? "Event type" : "Tip događaja", value: translateText(tip, language) || "/" },
              { label: t("organizer"), value: organizer || "/" },
              { label: language === "ENG" ? "Price" : "Cijena", value: price == null || price === 0 ? t("free") : `${price} EUR` },
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
            <h3>{t("yourReaction")}</h3>
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
                {myVote === "up" ? "Ovaj događaj ti se sviđa." : "Ovaj događaj ti se ne sviđa."}
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
      <EventMap event={event} title={t("eventLocation")} language={language} showList={false} />
    </div>
  );
}
