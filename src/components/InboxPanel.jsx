import { useEffect, useRef, useState } from 'react';
import { G } from '../constants';

export default function InboxPanel({ conversations, activeThread, setActiveThread, sendMsg, markRead, user }) {
  const [input, setInput] = useState("");
  const msgsRef = useRef();
  const threads = Object.entries(conversations);

  useEffect(() => { if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight; }, [activeThread, conversations]);

  const handleSend = () => {
    if (!activeThread || !input.trim()) return;
    sendMsg(activeThread, input);
    setInput("");
  };

  const active = activeThread ? conversations[activeThread] : null;

  if (threads.length === 0) return (
    <div className="empty"><span className="empty-icon">💬</span>Nemate ni jedan razgovor.<br /><span style={{fontSize:13}}>Koristite "Pođi sa mnom" na stranici događaja da povežete sa drugima.</span></div>
  );

  return (
    <div className="inbox-layout">
      <div className="inbox-sidebar">
        <div style={{fontSize:13,fontWeight:600,color:G.muted,marginBottom:"0.75rem",textTransform:"uppercase",letterSpacing:"0.5px"}}>Razgovori</div>
        {threads.map(([tid, conv]) => (
          <div key={tid} className={`inbox-thread${activeThread===tid?" active-thread":""}`}
            onClick={() => { setActiveThread(tid); markRead(tid); }}>
            <div className="avatar">{conv.with?.initials||"?"}</div>
            <div className="inbox-thread-info">
              <div className="inbox-thread-name">{conv.with?.name}</div>
              <div className="inbox-thread-preview">{conv.msgs?.[conv.msgs.length-1]?.text || ""}</div>
              <div className="inbox-thread-event">📅 {conv.eventTitle}</div>
            </div>
            {conv.unread && <div className="inbox-unread" />}
          </div>
        ))}
      </div>
      <div className="inbox-main">
        {active ? (
          <>
            <div className="inbox-main-header">
              <div className="avatar avatar-lg">{active.with?.initials}</div>
              <div>
                <div style={{fontWeight:600,fontSize:15,color:G.greenDark}}>{active.with?.name}</div>
                <div style={{fontSize:12,color:G.muted}}>📅 {active.eventTitle}</div>
              </div>
            </div>
            <div className="inbox-msgs" ref={msgsRef}>
              {(active.msgs||[]).map((m,i)=>(
                <div key={i} className={`chat-msg${m.from===user?.name?" me":""}`}>
                  {m.from!==user?.name&&<div className="chat-msg-sender">{m.from}</div>}
                  {m.text}
                  <div style={{fontSize:10,opacity:0.6,marginTop:3,textAlign:m.from===user?.name?"right":"left"}}>{m.time}</div>
                </div>
              ))}
            </div>
            <div className="inbox-input">
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSend()} placeholder="Napiši poruku..." />
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
