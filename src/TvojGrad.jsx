import { useState } from "react";
import { EVENTS_DATA } from "./constants";
import { css } from "./styles";
import { useToast } from "./hooks/useToast";
import Nav from "./components/Nav";
import HomePage from "./pages/HomePage";
import PopularPage from "./pages/PopularPage";
import FavoritesPage from "./pages/FavoritesPage";
import DetailPage from "./pages/DetailPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import OrganizerPage from "./pages/OrganizerPage";
import AdminPage from "./pages/AdminPage";

export default function TvojGrad() {
  const [page, setPage] = useState("home");
  const [profileTab, setProfileTab] = useState("favorites");
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState(
    EVENTS_DATA.map((e) => ({ ...e, votes: { ...e.votes }, userVotes: {}, favoritesByUser: {} }))
  );
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [category, setCategory] = useState("Sve");
  const [city, setCity] = useState("Svi gradovi");
  const [search, setSearch] = useState("");
  const [psmRequests, setPsmRequests] = useState({});
  const [psmListings, setPsmListings] = useState({});
  const [conversations, setConversations] = useState({});
  const [activeThread, setActiveThread] = useState(null);
  const { toasts, show: toast } = useToast();

  const userId = user?.email || user?.name;
  const userConversations = userId
    ? Object.fromEntries(Object.entries(conversations).filter(([, c]) => c.ownerId === userId))
    : {};
  const incomingRequests = userId
    ? Object.values(psmRequests).filter((req) => req?.status === "pending" && req.target?.id === userId)
    : [];
  const unreadCount = Object.values(userConversations).filter((c) => c.unread).length + incomingRequests.length;

  const navigate = (p, ev, opts) => {
    setPage(p);
    if (ev) setSelectedEvent(ev);
    if (opts?.profileTab) setProfileTab(opts.profileTab);
    window.scrollTo(0, 0);
  };

  const updateUser = (nextUser) => {
    setUser(nextUser);
    setActiveThread(null);
  };

  const vote = (id, type) => {
    if (!userId) {
      toast("Prijavite se prvo!");
      return;
    }
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const myVote = e.userVotes?.[userId] || null;
        if (myVote === type) {
          toast("Vec ste glasali!");
          return e;
        }
        const votes = { ...e.votes };
        if (myVote) votes[myVote]--;
        votes[type]++;
        return { ...e, votes, userVotes: { ...(e.userVotes || {}), [userId]: type } };
      })
    );
    toast(type === "up" ? "Glasali ste!" : "Reagovali ste");
  };

  const toggleFav = (id) => {
    if (!userId) {
      toast("Prijavite se prvo!");
      return;
    }
    const ev = events.find((e) => e.id === id);
    const isFav = Boolean(ev?.favoritesByUser?.[userId]);
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, favoritesByUser: { ...(e.favoritesByUser || {}), [userId]: !isFav } } : e
      )
    );
    toast(isFav ? "Uklonjeno iz omiljenih" : "Dodato u omiljene");
  };

  const updateEventImg = (id, img) => {
    if (!user) return;
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        if (e.organizer !== user.name) return e;
        return { ...e, coverImg: img };
      })
    );
    toast(img ? "Slika azurirana" : "Slika uklonjena");
  };

  const approveEvent = (id) => {
    setEvents((prev) => {
      const approvedAt = Date.now();
      return prev
        .map((e) =>
          e.id === id
            ? { ...e, status: "approved", approvedAt, votes: { up: 0, down: 0 }, userVotes: {} }
            : e
        )
        .sort((a, b) => (b.approvedAt || 0) - (a.approvedAt || 0));
    });
    toast("Dogadjaj odobren");
  };
  const rejectEvent = (id) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: "rejected" } : e)));
    toast("Dogadjaj odbijen");
  };
  const deleteEvent = (id) => {
    setEvents((prev) => {
      const target = prev.find((e) => e.id === id);
      if (!target) return prev;
      const canDelete = user?.role === "admin" || (user?.role === "organizer" && target.organizer === user.name);
      if (!canDelete) {
        toast("Nemate dozvolu za brisanje ove objave");
        return prev;
      }
      toast("Dogadjaj obrisan");
      return prev.filter((e) => e.id !== id);
    });
  };

  const promoteEvent = (id) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const canPromote = user?.role === "admin" || (user?.role === "organizer" && e.organizer === user.name);
        if (!canPromote) {
          toast("Nemate dozvolu za promociju ove objave");
          return e;
        }
        if (e.status !== "approved") {
          toast("Dogadjaj mora biti odobren prije promocije");
          return e;
        }
        if (e.promoted) {
          toast("Dogadjaj je vec promovisan");
          return e;
        }
        toast("Dogadjaj oznacen za promociju");
        return { ...e, promoted: true };
      })
    );
  };

  const addEvent = (newEv) => {
    setEvents((prev) => [
      ...prev,
      { ...newEv, id: Date.now(), votes: { up: 0, down: 0 }, userVotes: {}, favoritesByUser: {}, status: "pending" },
    ]);
    toast("Dogadjaj dodat - ceka odobrenje");
  };

  const currentPsmUser = () => ({
    id: user?.email || user?.name,
    name: user?.name || "Ja",
    initials: (user?.name || "Ja")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase(),
  });

  const toggleLookingForCompany = (eventId) => {
    if (!user) {
      toast("Prijavite se da biste koristili ovu funkciju!");
      return;
    }
    const me = currentPsmUser();
    setPsmListings((prev) => {
      const list = prev[eventId] || [];
      const alreadyListed = list.some((u) => u.id === me.id);
      return {
        ...prev,
        [eventId]: alreadyListed ? list.filter((u) => u.id !== me.id) : [me, ...list],
      };
    });
    const isListed = (psmListings[eventId] || []).some((u) => u.id === me.id);
    toast(isListed ? "Uklonjeni ste iz liste za ovaj dogadjaj" : "Dodati ste na listu: trazite drustvo za ovaj dogadjaj");
  };

  const sendPsmRequest = (eventId, targetUser) => {
    if (!user) {
      toast("Prijavite se prvo!");
      return;
    }
    const requesterId = user.email || user.name;
    const key = `${eventId}_${requesterId}_${targetUser.id}`;
    if (psmRequests[key]) {
      toast("Zahtjev vec poslan");
      return;
    }
    if (targetUser.id === requesterId) {
      toast("Ne mozete poslati zahtjev sebi");
      return;
    }
    const ev = events.find((event) => event.id === eventId);
    setPsmRequests((prev) => ({
      ...prev,
      [key]: {
        id: key,
        eventId,
        eventTitle: ev?.title || "",
        requester: currentPsmUser(),
        target: targetUser,
        status: "pending",
        createdAt: Date.now(),
      },
    }));
    toast(`Zahtjev poslan korisniku ${targetUser.name}. Ceka se da ga prihvati.`);
  };

  const acceptPsmRequest = (requestId) => {
    const req = psmRequests[requestId];
    if (!req || req.status !== "pending" || req.target?.id !== userId) return;
    const acceptedAt = Date.now();
    const time = new Date().toLocaleTimeString("sr-Latn", { hour: "2-digit", minute: "2-digit" });
    const targetThreadId = `${req.eventId}_${req.target.id}_${req.requester.id}`;
    const requesterThreadId = `${req.eventId}_${req.requester.id}_${req.target.id}`;
    const targetMsg = {
      from: req.target.name,
      text: `Prihvatio/la sam zahtjev za "${req.eventTitle}". Mozemo da se dogovorimo.`,
      time,
    };
    const requesterMsg = { ...targetMsg };

    setPsmRequests((prev) => ({
      ...prev,
      [requestId]: { ...prev[requestId], status: "accepted", acceptedAt },
      [targetThreadId]: {
        id: targetThreadId,
        eventId: req.eventId,
        eventTitle: req.eventTitle,
        requester: req.target,
        target: req.requester,
        status: "accepted",
        acceptedAt,
      },
    }));
    setConversations((prev) => ({
      ...prev,
      [targetThreadId]: {
        ownerId: req.target.id,
        with: req.requester,
        eventTitle: req.eventTitle,
        eventId: req.eventId,
        msgs: [...(prev[targetThreadId]?.msgs || []), targetMsg],
        unread: false,
      },
      [requesterThreadId]: {
        ownerId: req.requester.id,
        with: req.target,
        eventTitle: req.eventTitle,
        eventId: req.eventId,
        msgs: [...(prev[requesterThreadId]?.msgs || []), requesterMsg],
        unread: true,
      },
    }));
    setActiveThread(targetThreadId);
    setProfileTab("inbox");
    toast("Zahtjev prihvacen - chat je otvoren");
  };

  const rejectPsmRequest = (requestId) => {
    const req = psmRequests[requestId];
    if (!req || req.status !== "pending" || req.target?.id !== userId) return;
    setPsmRequests((prev) => ({
      ...prev,
      [requestId]: { ...prev[requestId], status: "rejected", rejectedAt: Date.now() },
    }));
    toast("Zahtjev odbijen");
  };

  const sendMsg = (threadId, text) => {
    if (!text.trim()) return;
    const newMsg = {
      from: user?.name || "Ja",
      text: text.trim(),
      time: new Date().toLocaleTimeString("sr-Latn", { hour: "2-digit", minute: "2-digit" }),
    };
    setConversations((prev) => {
      const current = prev[threadId];
      if (!current) {
        return {
          ...prev,
          [threadId]: { ownerId: userId, msgs: [newMsg], unread: false },
        };
      }
      const otherId = current.with?.id;
      const mirrorThreadId = otherId ? `${current.eventId}_${otherId}_${userId}` : null;
      const mirror = mirrorThreadId ? prev[mirrorThreadId] : null;
      return {
        ...prev,
        [threadId]: { ...current, msgs: [...(current.msgs || []), newMsg], unread: false },
        ...(mirrorThreadId && mirror
          ? {
              [mirrorThreadId]: {
                ...mirror,
                msgs: [...(mirror.msgs || []), newMsg],
                unread: true,
              },
            }
          : {}),
      };
    });
  };

  const markRead = (threadId) => {
    setConversations((prev) => {
      if (!prev[threadId]) return prev;
      return { ...prev, [threadId]: { ...prev[threadId], unread: false } };
    });
  };

  const eventsForCurrentUser = events.map((e) => ({
    ...e,
    myVote: userId ? e.userVotes?.[userId] || null : null,
    fav: userId ? Boolean(e.favoritesByUser?.[userId]) : false,
  }));

  const filteredEvents = eventsForCurrentUser
    .filter((e) => {
      if (e.status !== "approved") return false;
      if (category !== "Sve" && e.category !== category) return false;
      if (city !== "Svi gradovi" && e.city !== city) return false;
      if (
        search &&
        !e.title.toLowerCase().includes(search.toLowerCase()) &&
        !e.location.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => (b.approvedAt || 0) - (a.approvedAt || 0));

  const popularEvents = [...eventsForCurrentUser].filter((e) => e.status === "approved").sort((a, b) => b.votes.up - a.votes.up);
  const favEvents = eventsForCurrentUser.filter((e) => e.fav);

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <Nav
          page={page}
          navigate={navigate}
          user={user}
          setUser={updateUser}
          toast={toast}
          unreadCount={unreadCount}
        />

        {page === "home" && (
          <HomePage
            events={filteredEvents}
            allEvents={popularEvents}
            category={category}
            setCategory={setCategory}
            city={city}
            setCity={setCity}
            search={search}
            setSearch={setSearch}
            vote={vote}
            toggleFav={toggleFav}
            navigate={navigate}
          />
        )}
        {page === "popular" && <PopularPage events={popularEvents} navigate={navigate} />}
        {page === "favorites" && (
          <FavoritesPage events={favEvents} navigate={navigate} vote={vote} toggleFav={toggleFav} user={user} />
        )}
        {page === "detail" && selectedEvent && (
          <DetailPage
            event={eventsForCurrentUser.find((e) => e.id === selectedEvent.id) || selectedEvent}
            navigate={navigate}
            vote={vote}
            toggleFav={toggleFav}
            user={user}
            toast={toast}
            psmRequests={psmRequests}
            psmListings={psmListings}
            toggleLookingForCompany={toggleLookingForCompany}
            sendPsmRequest={sendPsmRequest}
            conversations={userConversations}
            sendMsg={sendMsg}
            markRead={markRead}
          />
        )}
        {page === "auth" && <AuthPage setUser={updateUser} navigate={navigate} toast={toast} />}
        {page === "profile" && user && (
          <ProfilePage
            user={user}
            events={eventsForCurrentUser}
            favEvents={favEvents}
            navigate={navigate}
            profileTab={profileTab}
            setProfileTab={setProfileTab}
            conversations={userConversations}
            activeThread={activeThread}
            setActiveThread={setActiveThread}
            sendMsg={sendMsg}
            markRead={markRead}
            unreadCount={unreadCount}
            incomingRequests={incomingRequests}
            acceptPsmRequest={acceptPsmRequest}
            rejectPsmRequest={rejectPsmRequest}
          />
        )}
        {page === "organizer" && user?.role === "organizer" && (
          <OrganizerPage
            user={user}
            events={events.filter((e) => e.organizer === user.name)}
            addEvent={addEvent}
            deleteEvent={deleteEvent}
            promoteEvent={promoteEvent}
            updateEventImg={updateEventImg}
          />
        )}
        {page === "admin" && user?.role === "admin" && (
          <AdminPage events={events} approveEvent={approveEvent} rejectEvent={rejectEvent} deleteEvent={deleteEvent} />
        )}

        <footer className="footer">
          <strong>TvojGrad</strong> - Centralizovana platforma za dogadjaje u gradu
        </footer>
      </div>
      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            {t.msg}
          </div>
        ))}
      </div>
    </>
  );
}
