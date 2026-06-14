import { useEffect, useRef, useState } from "react";
import { G } from "../constants";

export default function InboxPanel({ conversations = {}, activeThread, setActiveThread, sendMsg, markRead, user }) {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const msgsRef = useRef();

  const threads = conversations ? Object.entries(conversations) : [];
  const normalizedSearch = search.trim().toLowerCase();
  const filteredThreads = threads.filter(([, conv]) => {
    if (!normalizedSearch) return true;
    return `${conv?.with?.name || ""} ${conv?.with?.email || ""} ${conv?.with?.Email || ""}`
      .toLowerCase()
      .includes(normalizedSearch);
  });

  useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
    }
  }, [activeThread, conversations]);

  const handleSend = () => {
    if (!activeThread || !input.trim()) return;
    sendMsg(activeThread, input.trim());
    setInput("");
  };

  const active = activeThread && conversations ? conversations[activeThread] : null;

  if (threads.length === 0) return (
    <div className="empty">
      <span className="empty-icon">💬</span>Nemate ni jedan razgovor.<br />
      <span style={{ fontSize: 13 }}>Koristite "Podji sa mnom" na stranici dogadjaja da se povezete sa drugima.</span>
    </div>
  );

  return (
    <div className="inbox-layout">
      <div className="inbox-sidebar">
        <div style={{ fontSize: 13, fontWeight: 600, color: G.muted, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Razgovori
        </div>
        <input
          className="inbox-search"
          value={search}
          onChange={(ev) => setSearch(ev.target.value)}
          placeholder="Pretrazi osobe"
        />
        {filteredThreads.map(([tid, conv]) => (
          <div
            key={tid}
            className={`inbox-thread${activeThread === tid ? " active-thread" : ""}`}
            onClick={() => {
              setActiveThread(tid);
              if (markRead) markRead(tid);
            }}
          >
            <div className="avatar">{conv?.with?.initials || "?"}</div>
            <div className="inbox-thread-info">
              <div className="inbox-thread-name">{conv?.with?.name || "Nepoznat korisnik"}</div>
              <div className="inbox-thread-preview">{conv?.msgs?.[conv.msgs.length - 1]?.text || ""}</div>
              <div className="inbox-thread-event">📅 {conv?.eventTitle || "Dogadjaj"}</div>
            </div>
            {conv?.unread && <div className="inbox-unread" />}
          </div>
        ))}
        {filteredThreads.length === 0 && (
          <div className="inbox-empty-list">Nema razgovora za ovu pretragu.</div>
        )}
      </div>

      <div className="inbox-main">
        {active ? (
          <>
            <div className="inbox-main-header">
              <div className="avatar avatar-lg">{active.with?.initials || "?"}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, color: G.greenDark }}>{active.with?.name}</div>
                <div style={{ fontSize: 12, color: G.muted }}>📅 {active.eventTitle}</div>
              </div>
            </div>

            <div className="inbox-msgs" ref={msgsRef}>
              {(active.msgs || []).map((m, i) => {
                const currentUserId = user?.id || user?.ID;
                const isMe = m.fromId === currentUserId || m.FromId === currentUserId;

                return (
                  <div key={i} className={`chat-msg${isMe ? " me" : ""}`}>
                    {!isMe && <div className="chat-msg-sender">{m.from || m.From}</div>}
                    {m.text || m.Text}
                    <div style={{ fontSize: 10, opacity: 0.6, marginTop: 3, textAlign: isMe ? "right" : "left" }}>
                      {m.time || m.Time}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="inbox-input">
              <input
                value={input}
                onChange={(ev) => setInput(ev.target.value)}
                onKeyDown={(ev) => ev.key === "Enter" && handleSend()}
                placeholder="Napisi poruku..."
              />
              <button className="chat-send" onClick={handleSend}>Posalji</button>
            </div>
          </>
        ) : (
          <div className="inbox-empty">💬<span>Odaberi razgovor s lijeve strane</span></div>
        )}
      </div>
    </div>
  );
}
