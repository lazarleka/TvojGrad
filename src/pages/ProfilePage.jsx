import { G } from '../constants';
import InboxPanel from '../components/InboxPanel';

export default function ProfilePage({
  user,
  events,
  favEvents,
  navigate,
  profileTab,
  setProfileTab,
  conversations,
  activeThread,
  setActiveThread,
  sendMsg,
  markRead,
  unreadCount,
  incomingRequests = [],
  acceptPsmRequest,
  rejectPsmRequest,
}) {
  const initials = user.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const roleLabels = { visitor:"Posjetilac", organizer:"Organizator", admin:"Administrator" };
  const roleClasses = { visitor:"role-visitor", organizer:"role-organizer", admin:"role-admin" };
  const myVotedEvents = events.filter(e=>e.myVote);
  const threadCount = Object.keys(conversations).length;

  const tabs = [
    { id:"favorites", label:"❤️ Omiljeni", count: favEvents.length },
    { id:"inbox", label:"💬 Poruke", count: unreadCount, badge: unreadCount > 0 },
    { id:"votes", label:"👍 Glasovi", count: myVotedEvents.length },
    ...(user.role==="organizer" ? [{ id:"organizer", label:"➕ Moji događaji" }] : []),
    ...(user.role==="admin" ? [{ id:"admin-link", label:"⚙️ Admin panel" }] : []),
  ];

  const handleTabClick = (t) => {
    if (t.id === "organizer") { navigate("organizer"); return; }
    if (t.id === "admin-link") { navigate("admin"); return; }
    setProfileTab(t.id);
  };

  return (
    <div className="main">
      <div className="profile-grid">
        {/* Left: profile card */}
        <div>
          <div className="profile-card">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-name">{user.name}</div>
            <div className="profile-email">{user.email}</div>
            <span className={`role-badge ${roleClasses[user.role]}`}>{roleLabels[user.role]}</span>
            <div className="profile-stats">
              <div className="profile-stat"><div className="profile-stat-val">{favEvents.length}</div><div className="profile-stat-label">Omiljeni</div></div>
              <div className="profile-stat"><div className="profile-stat-val">{myVotedEvents.length}</div><div className="profile-stat-label">Glasovi</div></div>
              <div className="profile-stat"><div className="profile-stat-val">{threadCount}</div><div className="profile-stat-label">Razgovori</div></div>
            </div>
            <div className="profile-nav">
              {tabs.map(t => (
                <button key={t.id} className={`profile-nav-btn${profileTab===t.id?" active":""}`} onClick={() => handleTabClick(t)}>
                  {t.label}
                  {t.badge && <span className="nav-badge" style={{marginLeft:"auto"}}>{t.count}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: content */}
        <div>
          {profileTab === "favorites" && (
            <div className="form-card">
              <h3>❤️ Omiljeni događaji ({favEvents.length})</h3>
              {favEvents.length > 0 ? favEvents.map(e=>(
                <div key={e.id} className="my-event-item" style={{cursor:"pointer"}} onClick={()=>navigate("detail",e)}>
                  <div style={{fontSize:28}}>{e.emoji}</div>
                  <div className="my-event-info">
                    <div className="my-event-title">{e.title}</div>
                    <div className="my-event-meta">📅 {e.date} · 📍 {e.city}</div>
                  </div>
                </div>
              )) : <div style={{color:G.muted,fontSize:14,textAlign:"center",padding:"1.5rem"}}>Niste sačuvali nijedan omiljeni događaj.</div>}
            </div>
          )}

          {profileTab === "inbox" && (
            <div className="form-card">
              <h3>💬 Moje poruke {unreadCount > 0 && <span className="nav-badge" style={{fontSize:11,padding:"2px 7px",width:"auto",height:"auto",borderRadius:10}}>{unreadCount} nova</span>}</h3>
              {incomingRequests.length > 0 && (
                <div className="request-list">
                  <div className="request-title">Zahtjevi za "Podji sa mnom"</div>
                  {incomingRequests.map((req) => (
                    <div key={req.id} className="request-card">
                      <div className="avatar">{req.requester.initials}</div>
                      <div className="request-info">
                        <div className="request-name">{req.requester.name}</div>
                        <div className="request-meta">Zeli da ide sa vama na: {req.eventTitle}</div>
                      </div>
                      <div className="request-actions">
                        <button className="action-btn action-approve" onClick={() => acceptPsmRequest(req.id)}>Prihvati</button>
                        <button className="action-btn action-reject" onClick={() => rejectPsmRequest(req.id)}>Odbij</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <InboxPanel conversations={conversations} activeThread={activeThread} setActiveThread={setActiveThread} sendMsg={sendMsg} markRead={markRead} user={user} />
            </div>
          )}

          {profileTab === "votes" && (
            <div className="form-card">
              <h3>👍 Glasali ste za ({myVotedEvents.length})</h3>
              {myVotedEvents.length > 0 ? myVotedEvents.map(e=>(
                <div key={e.id} className="my-event-item" style={{cursor:"pointer"}} onClick={()=>navigate("detail",e)}>
                  <div style={{fontSize:28}}>{e.emoji}</div>
                  <div className="my-event-info">
                    <div className="my-event-title">{e.title}</div>
                    <div className="my-event-meta">{e.myVote==="up"?"👍 Sviđa mi se":"👎 Ne sviđa mi se"}</div>
                  </div>
                </div>
              )) : <div style={{color:G.muted,fontSize:14,textAlign:"center",padding:"1.5rem"}}>Niste glasali ni za jedan događaj.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
