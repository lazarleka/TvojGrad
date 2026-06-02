import { useEffect, useRef, useState } from 'react';
import { G } from '../constants';

export default function InboxPanel({ conversations = {}, activeThread, setActiveThread, sendMsg, markRead, user }) {
  const [input, setInput] = useState("");
  const msgsRef = useRef();

  // Razvojni trik: Ispisujemo u konzolu šta je tačno stiglo u InboxPanel
  // Otvori F12 u browseru i pogledaj Console tab ako i dalje imaš problema!
  console.log("InboxPanel podaci:", { conversations, activeThread, user });

  // Osiguravamo da su threads uvijek niz, čak i ako conversations stigne kao null/undefined
  const threads = conversations ? Object.entries(conversations) : [];

  // Automatsko skrolovanje na dno kada se promeni čet ili stigne nova poruka
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

  // Bezbjedno izvlačenje aktivnog četa
  const active = activeThread && conversations ? conversations[activeThread] : null;

  if (threads.length === 0) return (
    <div className="empty">
      <span className="empty-icon">💬</span>Nemate ni jedan razgovor.<br />
      <span style={{fontSize:13}}>Koristite "Pođi sa mnom" na stranici događaja da povežete sa drugima.</span>
    </div>
  );

  return (
    <div className="inbox-layout">
      {/* LIJEVA STRANA: Lista svih razgovora */}
      <div className="inbox-sidebar">
        <div style={{fontSize:13,fontWeight:600,color:G.muted,marginBottom:"0.75rem",textTransform:"uppercase",letterSpacing:"0.5px"}}>
          Razgovori
        </div>
        {threads.map(([tid, conv]) => (
          <div key={tid} className={`inbox-thread${activeThread===tid?" active-thread":""}`}
            onClick={() => { setActiveThread(tid); if (markRead) markRead(tid); }}>
            <div className="avatar">{conv?.with?.initials||"?"}</div>
            <div className="inbox-thread-info">
              <div className="inbox-thread-name">{conv?.with?.name || "Nepoznat korisnik"}</div>
              <div className="inbox-thread-preview">{conv?.msgs?.[conv.msgs.length-1]?.text || ""}</div>
              <div className="inbox-thread-event">📅 {conv?.eventTitle || "Događaj"}</div>
            </div>
            {conv?.unread && <div className="inbox-unread" />}
          </div>
        ))}
      </div>

      {/* DESNA STRANA: Aktivni prozor za četovanje */}
      <div className="inbox-main">
        {active ? (
          <>
            {/* Zaglavlje aktivnog četa */}
            <div className="inbox-main-header">
              <div className="avatar avatar-lg">{active.with?.initials || "?"}</div>
              <div>
                <div style={{fontWeight:600,fontSize:15,color:G.greenDark}}>{active.with?.name}</div>
                <div style={{fontSize:12,color:G.muted}}>📅 {active.eventTitle}</div>
              </div>
            </div>

            {/* Prikaz poruka */}
            <div className="inbox-msgs" ref={msgsRef}>
              {(active.msgs||[]).map((m, i) => {
                // Pokrivamo sve varijante ID-ja (velika/mala slova sa backenda i iz localStorage)
                const trenutniUserId = user?.id || user?.ID;
                const isMe = m.fromId === trenutniUserId || m.FromId === trenutniUserId;

                return (
                  <div key={i} className={`chat-msg${isMe ? " me" : ""}`}>
                    {!isMe && <div className="chat-msg-sender">{m.from || m.From}</div>}
                    {m.text || m.Text}
                    <div style={{
                      fontSize: 10,
                      opacity: 0.6,
                      marginTop: 3,
                      textAlign: isMe ? "right" : "left"
                    }}>
                      {m.time || m.Time}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Unos nove poruke */}
            <div className="inbox-input">
              <input 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={e => e.key === "Enter" && handleSend()} 
                placeholder="Napiši poruku..." 
              />
              <button className="chat-send" onClick={handleSend}>➤ Pošalji</button>
            </div>
          </>
        ) : (
          <div className="inbox-empty">💬<span>Odaberi razgovor s lijeve strane</span></div>
        )}
      </div>
    </div>
  );
}