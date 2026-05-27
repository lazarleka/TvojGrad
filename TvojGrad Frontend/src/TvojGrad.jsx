import { useEffect, useState } from "react";
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
import { API_BASE_URL, fetchEventById, getStoredUser, getUserId } from "./api";
import { Client } from "@stomp/stompjs";

const PAGE_PATHS = {
  home: "/",
  popular: "/popularno",
  favorites: "/omiljeni",
  auth: "/prijava",
  profile: "/profil",
  organizer: "/organizator",
  admin: "/admin",
};

const getEventId = (event) => event?.id ?? event?.ID;

const buildPath = (page, event, opts = {}) => {
  if (page === "detail") {
    const id = getEventId(event);
    return id ? `/dogadjaj/${encodeURIComponent(id)}` : PAGE_PATHS.home;
  }

  const path = PAGE_PATHS[page] || PAGE_PATHS.home;
  if (page === "profile" && opts.profileTab) {
    return `${path}?tab=${encodeURIComponent(opts.profileTab)}`;
  }

  return path;
};

const parseRoute = () => {
  const { pathname, search } = window.location;
  const params = new URLSearchParams(search);
  const profileTab = params.get("tab") || undefined;
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  if (normalizedPath === "/dogadjaji") return { page: "home" };
  if (normalizedPath === "/popularno") return { page: "popular" };
  if (normalizedPath === "/omiljeni") return { page: "favorites" };
  if (normalizedPath === "/prijava") return { page: "auth" };
  if (normalizedPath === "/profil") return { page: "profile", profileTab };
  if (normalizedPath === "/organizator") return { page: "organizer" };
  if (normalizedPath === "/admin") return { page: "admin" };

  const detailMatch = normalizedPath.match(/^\/dogadjaj\/([^/]+)$/);
  if (detailMatch) {
    return { page: "detail", eventId: decodeURIComponent(detailMatch[1]) };
  }

  return { page: "home" };
};

export default function TvojGrad() {
  const [route, setRoute] = useState(parseRoute);
  const page = route.page;
  const [profileTab, setProfileTab] = useState("favorites");
  const [user, setUser] = useState(getStoredUser);
  const [events, setEvents] = useState(
    EVENTS_DATA.map((e) => ({ ...e, votes: { ...e.votes }, userVotes: {}, favoritesByUser: {} }))
  );
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [routeEvent, setRouteEvent] = useState(null);
  const [category, setCategory] = useState("Sve");
  const [city, setCity] = useState("Svi gradovi");
  const [search, setSearch] = useState("");
  const [psmRequests, setPsmRequests] = useState({});
  const [psmListings, setPsmListings] = useState({});
  const [conversations, setConversations] = useState({});
  const [activeThread, setActiveThread] = useState(null);
  const [backendUnreadCetIds, setBackendUnreadCetIds] = useState({});
  const { toasts, show: toast } = useToast();

  const userId = user?.email || user?.name;
  const userConversations = userId
    ? Object.fromEntries(Object.entries(conversations).filter(([, c]) => c.ownerId === userId))
    : {};
  const incomingRequests = userId
    ? Object.values(psmRequests).filter((req) => req?.status === "pending" && req.target?.id === userId)
    : [];
  const backendUnreadMessages = Object.keys(backendUnreadCetIds).length;
  const unreadCount = Object.values(userConversations).filter((c) => c.unread).length + incomingRequests.length + backendUnreadMessages;
  const backendUserId = getUserId(user);

  const navigate = (p, ev, opts) => {
    const path = buildPath(p, ev, opts);
    window.history.pushState({}, "", path);
    setRoute(parseRoute());
    if (ev) setSelectedEvent(ev);
    if (opts?.profileTab) setProfileTab(opts.profileTab);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const onPopState = () => setRoute(parseRoute());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (route.page === "profile" && route.profileTab) {
      setProfileTab(route.profileTab);
    }
  }, [route.page, route.profileTab]);

  useEffect(() => {
    if (route.page !== "detail" || !route.eventId) {
      setRouteEvent(null);
      return;
    }

    fetchEventById(route.eventId)
      .then(setRouteEvent)
      .catch(() => setRouteEvent(null));
  }, [route.page, route.eventId]);

  useEffect(() => {
    if (!backendUserId) {
      setBackendUnreadCetIds({});
      return undefined;
    }

    let client;
    let cancelled = false;
    const readStorageKey = `readCetMessages:${backendUserId}`;

    const getReadMap = () => {
      try {
        return JSON.parse(localStorage.getItem(readStorageKey) || "{}");
      } catch {
        return {};
      }
    };

    const saveReadMap = (map) => {
      localStorage.setItem(readStorageKey, JSON.stringify(map));
    };

    const loadGlobalChatNotifications = async () => {
      try {
        const cetsResponse = await fetch(`${API_BASE_URL}/cetovi/korisnik/${backendUserId}`);
        if (!cetsResponse.ok) return;
        const cets = await cetsResponse.json();
        const readMap = getReadMap();
        const nextUnread = {};

        await Promise.all((cets || []).map(async (cet) => {
          const messagesResponse = await fetch(`${API_BASE_URL}/poruke-ceta/cet/${cet.ID}`);
          if (!messagesResponse.ok) return;
          const messages = await messagesResponse.json();
          const latestMessageId = Math.max(0, ...(messages || []).map((m) => Number(m.ID || 0)));
          const latestOtherMessageId = Math.max(
            0,
            ...(messages || [])
              .filter((m) => String(m.Posiljalac_ID || m.posiljalacID) !== String(backendUserId))
              .map((m) => Number(m.ID || 0))
          );

          if (readMap[cet.ID] == null) {
            readMap[cet.ID] = latestMessageId;
          } else if (latestOtherMessageId > Number(readMap[cet.ID] || 0)) {
            nextUnread[cet.ID] = true;
          }
        }));

        saveReadMap(readMap);
        if (!cancelled) setBackendUnreadCetIds(nextUnread);

        if (!cancelled && (cets || []).length > 0) {
          window.global = window.global || window;
          const { default: SockJS } = await import("sockjs-client");
          if (cancelled) return;

          client = new Client({
            webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws-tvojgrad`),
            reconnectDelay: 3000,
            onConnect: () => {
              (cets || []).forEach((cet) => {
                client.subscribe(`/topic/cet/${cet.ID}`, (message) => {
                  const received = JSON.parse(message.body);
                  const senderId = received.Posiljalac_ID || received.posiljalacID;
                  if (String(senderId) !== String(backendUserId)) {
                    setBackendUnreadCetIds((prev) => ({ ...prev, [cet.ID]: true }));
                    toast("Stigla je nova poruka");
                  }
                });
              });
            },
          });
          client.activate();
        }
      } catch {
        // Backend chat nije dostupan; aplikacija ostaje upotrebljiva.
      }
    };

    loadGlobalChatNotifications();

    return () => {
      cancelled = true;
      if (client) client.deactivate();
    };
  }, [backendUserId]);

  const markBackendChatRead = (cetId, lastMessageId = 0) => {
    if (!backendUserId || !cetId) return;
    const readStorageKey = `readCetMessages:${backendUserId}`;
    let readMap = {};
    try {
      readMap = JSON.parse(localStorage.getItem(readStorageKey) || "{}");
    } catch {
      readMap = {};
    }
    readMap[cetId] = Math.max(Number(readMap[cetId] || 0), Number(lastMessageId || 0));
    localStorage.setItem(readStorageKey, JSON.stringify(readMap));
    setBackendUnreadCetIds((prev) => {
      const next = { ...prev };
      delete next[cetId];
      return next;
    });
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
  const detailEvent =
    page === "detail"
      ? routeEvent ||
        eventsForCurrentUser.find((e) => String(getEventId(e)) === String(route.eventId)) ||
        (String(getEventId(selectedEvent)) === String(route.eventId) ? selectedEvent : null)
      : null;
  const userRole = user?.role || user?.tip || user?.Tip;
  const userName = user?.name || user?.ime || user?.Ime;

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
        {page === "detail" && detailEvent && (
          <DetailPage
            event={detailEvent}
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
        {page === "detail" && !detailEvent && (
          <div className="main">
            <div className="empty">
              Dogadjaj nije pronadjen.
              <br />
              <button className="btn-primary" style={{ marginTop: "1rem" }} onClick={() => navigate("home")}>
                Nazad na dogadjaje
              </button>
            </div>
          </div>
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
            externalUnreadCetIds={backendUnreadCetIds}
            onMarkChatRead={markBackendChatRead}
          />
        )}
        {page === "organizer" && userRole === "organizator" && (
          <OrganizerPage
            user={user}
            events={events.filter((e) => e.organizer === userName)}
            addEvent={addEvent}
            deleteEvent={deleteEvent}
            promoteEvent={promoteEvent}
            updateEventImg={updateEventImg}
          />
        )}
        {page === "admin" && userRole === "administrator" && (
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
