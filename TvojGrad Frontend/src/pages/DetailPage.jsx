import { useEffect, useRef, useState } from "react";
import { G } from "../constants";

export default function DetailPage({
  event: e,
  navigate,
  vote,
  toggleFav,
  user,
  toast,
  psmRequests,
  psmListings,
  toggleLookingForCompany,
  sendPsmRequest,
  conversations,
  sendMsg,
  markRead,
}) {
  const [psmOpen, setPsmOpen] = useState(false);
  const [openThreadId, setOpenThreadId] = useState(null);
  const [msgInput, setMsgInput] = useState("");
  const msgsRef = useRef();

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [openThreadId, conversations]);

  const currentUserId = user?.email || user?.name;
  const getKey = (u) => `${e.id}_${currentUserId || "guest"}_${u.id}`;
  const getStatus = (u) => {
    const request = psmRequests[getKey(u)];
    return request?.status || request;
  };
  const listedUsers = psmListings[e.id] || [];
  const isLookingForCompany = Boolean(currentUserId && (psmListings[e.id] || []).some((u) => u.id === currentUserId));
  const acceptedUsers = listedUsers.filter((u) => getStatus(u) === "accepted");

  const handleSend = () => {
    if (!openThreadId || !msgInput.trim()) return;
    sendMsg(openThreadId, msgInput);
    setMsgInput("");
  };

  return (
    <div className="main">
      <button className="detail-back" onClick={() => navigate("home")}>
        Nazad na dogadjaje
      </button>

      <div className="detail-hero">
        {e.coverImg ? (
          <img src={e.coverImg} alt={e.title} className="detail-hero-img" />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(135deg,${G.greenDark},${e.coverColor || G.green})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 80,
            }}
          >
            {e.emoji}
          </div>
        )}
        <div className="detail-hero-overlay" />
        <div className="detail-hero-content">
          <span className="detail-cat">{e.category}</span>
          <div className="detail-title">{e.title}</div>
          <div className="detail-hero-meta">
            <span>{new Date(e.date).toLocaleDateString("sr-Latn", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span>{e.time}</span>
            <span>{e.location}, {e.city}</span>
          </div>
          {e.promoted && (
            <span
              style={{
                marginTop: 8,
                display: "inline-block",
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                padding: "4px 14px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Promovisano
            </span>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <div>
          <div className="detail-card">
            <h3>O dogadjaju</h3>
            <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.7 }}>{e.desc}</p>
          </div>

          <div className="detail-card psm-card">
            <div className="detail-card-head">
              <div>
                <h3>Podji sa mnom</h3>
                <p>
                  Objavite da trazite drustvo ili posaljite zahtjev ljudima koji su zainteresovani. Chat se otvara tek
                  kada druga osoba prihvati zahtjev.
                </p>
              </div>
              <span className="psm-count">{listedUsers.length}</span>
            </div>
            <button
              className={isLookingForCompany ? "btn-outline" : "btn-primary"}
              onClick={() => toggleLookingForCompany(e.id)}
            >
              {isLookingForCompany ? "Ukloni me iz liste" : "Trazim nekoga da ide sa mnom"}
            </button>
            <button
              className="btn-outline"
              onClick={() => {
                if (!user) {
                  toast("Prijavite se da biste koristili ovu funkciju!");
                  return;
                }
                setPsmOpen((o) => !o);
              }}
            >
              {psmOpen ? "Sakrij zainteresovane" : "Vidi zainteresovane"}
            </button>

            {psmOpen && (
              <div style={{ marginTop: "1rem" }}>
                {listedUsers.length === 0 && (
                  <div className="psm-empty">Jos niko nije objavio da trazi drustvo za ovaj dogadjaj.</div>
                )}
                {listedUsers.map((u) => {
                  const status = getStatus(u);
                  const threadId = getKey(u);
                  const isOpen = openThreadId === threadId;
                  const isMe = Boolean(currentUserId && u.id === currentUserId);
                  return (
                    <div key={u.id}>
                      <div className="psm-user">
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div className="avatar">{u.initials}</div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</div>
                            <div style={{ fontSize: 11, color: G.muted }}>
                              {isMe ? "Vi trazite drustvo za ovaj dogadjaj" : "Zainteresovan/a za ovaj dogadjaj"}
                            </div>
                          </div>
                        </div>
                        {isMe && <span className="psm-status-accepted">Na listi</span>}
                        {!isMe && !status && (
                          <button className="btn-primary btn-sm" onClick={() => sendPsmRequest(e.id, u)}>
                            Posalji zahtjev
                          </button>
                        )}
                        {status === "pending" && <span className="psm-status-sent">Zahtjev poslan - ceka se odgovor</span>}
                        {status === "rejected" && <span className="psm-status-rejected">Zahtjev odbijen</span>}
                        {status === "accepted" && (
                          <button
                            className="btn-outline btn-sm"
                            onClick={() => {
                              setOpenThreadId(isOpen ? null : threadId);
                              if (!isOpen) markRead(threadId);
                            }}
                          >
                            {isOpen ? "Zatvori chat" : "Otvori chat"}
                          </button>
                        )}
                      </div>
                      {status === "accepted" && isOpen && (
                        <div className="chat-box" style={{ marginBottom: 8 }}>
                          <div className="chat-header">
                            <span className="chat-header-name">{u.name} je prihvatio/la zahtjev</span>
                          </div>
                          <div className="chat-msgs" ref={msgsRef}>
                            {(conversations[threadId]?.msgs || []).map((m, i) => (
                              <div key={i} className={`chat-msg${m.from === user?.name ? " me" : ""}`}>
                                {m.from !== user?.name && <div className="chat-msg-sender">{m.from}</div>}
                                {m.text}
                              </div>
                            ))}
                          </div>
                          <div className="chat-input-row">
                            <input
                              value={msgInput}
                              onChange={(ev) => setMsgInput(ev.target.value)}
                              onKeyDown={(ev) => ev.key === "Enter" && handleSend()}
                              placeholder="Napisi poruku..."
                            />
                            <button className="chat-send" onClick={handleSend}>
                              Posalji
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {acceptedUsers.length > 0 && !psmOpen && (
              <p style={{ fontSize: 12, color: G.green, marginTop: "0.5rem", fontWeight: 500 }}>
                Imate {acceptedUsers.length} prihvacen/ih zahtjev/a -{" "}
                <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => setPsmOpen(true)}>
                  vidi razgovore
                </span>
              </p>
            )}
          </div>
        </div>

        <div>
          <div className="detail-card">
            <h3>Detalji</h3>
            {[
              {
                label: "Datum",
                value: new Date(e.date).toLocaleDateString("sr-Latn", { day: "numeric", month: "long", year: "numeric" }),
              },
              { label: "Vrijeme", value: e.time },
              { label: "Lokacija", value: `${e.location}, ${e.city}` },
              { label: "Cijena", value: e.price === 0 ? "Besplatno" : `${e.price} EUR` },
              { label: "Organizator", value: e.organizer },
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
                className={`vote-btn${e.myVote === "up" ? " up-active" : ""}`}
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => vote(e.id, "up")}
              >
                + {e.votes.up}
              </button>
              <button
                className={`vote-btn${e.myVote === "down" ? " down-active" : ""}`}
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => vote(e.id, "down")}
              >
                - {e.votes.down}
              </button>
            </div>
            <button className="btn-outline" onClick={() => toggleFav(e.id)}>
              {e.fav ? "Ukloni iz omiljenih" : "Dodaj u omiljene"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
