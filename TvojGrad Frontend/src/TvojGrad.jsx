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
import { makeT } from "./i18n";
import {
  API_BASE_URL,
  approveAdminRequest,
  approveEventRequest,
  createEvent,
  deleteEventById,
  fetchAdminEvents,
  fetchAdminRequests,
  fetchCities,
  fetchEventById,
  fetchOrganizers,
  fetchOrganizerEvents,
  getStoredUser,
  getUserId,
  rejectAdminRequest,
  rejectEventRequest,
  requestEventPromotion,
  updateEvent as saveEventChanges,
  uploadEventImage,
} from "./api";
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
  const [date, setDate] = useState("");
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("language");
    return saved === "ENG" || saved === "SRB" ? saved : "SRB";
  });
  const [cities, setCities] = useState(["Svi gradovi"]);
  const [adminRequests, setAdminRequests] = useState([]);
  const [organizers, setOrganizers] = useState([]);
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
  const t = makeT(language);
  const userRole = user?.role || user?.tip || user?.Tip;
  const userName = user?.name || user?.ime || user?.Ime || `${user?.Ime || ""} ${user?.Prezime || ""}`.trim();

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
    fetchCities()
      .then(setCities)
      .catch(() => setCities(["Svi gradovi", "Podgorica", "Bar", "Budva", "Tivat", "Nikšić"]));
  }, []);

  useEffect(() => {
    if (page === "admin" && userRole === "administrator") {
      loadAdminData();
    }
    if (page === "organizer" && backendUserId) {
      loadOrganizerEvents();
    }
  }, [page, userRole, backendUserId]);

  const loadAdminData = async () => {
    try {
      const [allEvents, requests, allOrganizers] = await Promise.all([fetchAdminEvents(), fetchAdminRequests(), fetchOrganizers()]);
      setEvents(allEvents);
      setAdminRequests(requests || []);
      setOrganizers(allOrganizers || []);
    } catch (err) {
      console.error(err);
      toast("Admin podaci nisu učitani");
    }
  };

  const loadOrganizerEvents = async () => {
    try {
      const organizerEvents = await fetchOrganizerEvents(backendUserId);
      setEvents((prev) => {
        const others = prev.filter((e) => String(e.organizerId) !== String(backendUserId));
        return [...others, ...organizerEvents];
      });
    } catch (err) {
      console.error(err);
    }
  };

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

  const updateEventImg = async (id, img, file) => {
    if (!user) return;
    try {
      const updated = file ? await uploadEventImage(id, file) : { id, coverImg: img };
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated, coverImg: updated.coverImg || img } : e)));
      toast(img ? "Slika azurirana" : "Slika uklonjena");
    } catch {
      toast("Slika nije sačuvana");
    }
  };

  const updateLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    localStorage.setItem("language", nextLanguage);
  };

  const approveEvent = async (id) => {
    try {
      const updated = await approveEventRequest(id, backendUserId);
      setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
      toast("Događaj odobren");
    } catch {
      toast("Događaj nije odobren");
    }
  };
  const rejectEvent = async (id) => {
    try {
      const updated = await rejectEventRequest(id, backendUserId);
      setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
      toast("Događaj odbijen");
    } catch {
      toast("Događaj nije odbijen");
    }
  };
  const deleteEvent = async (id) => {
    const target = events.find((e) => e.id === id);
    if (!target) return;
    const canDelete = userRole === "administrator" || (userRole === "organizator" && String(target.organizerId) === String(backendUserId));
    if (!canDelete) {
      toast("Nemate dozvolu za brisanje ove objave");
      return;
    }

    try {
      await deleteEventById(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast("Događaj obrisan");
      if (userRole === "organizator") {
        loadOrganizerEvents();
      }
    } catch (err) {
      console.error(err);
      toast("Događaj nije obrisan");
    }
  };

  const promoteEvent = async (id) => {
    try {
      const updated = await requestEventPromotion(id);
      setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
      toast("Zahtjev za promociju je poslat adminu");
    } catch {
      toast("Zahtjev za promociju nije sačuvan");
    }
  };

  const addEvent = async (newEv) => {
    try {
      let saved = await createEvent(newEv, backendUserId);
      if (newEv.coverFile) {
        saved = await uploadEventImage(saved.id, newEv.coverFile);
      }
      setEvents((prev) => [saved, ...prev.filter((e) => e.id !== saved.id)]);
      toast(newEv.promoted ? "Događaj dodat - čeka odobrenje promocije" : "Događaj dodat - čeka odobrenje");
    } catch (err) {
      console.error(err);
      toast("Događaj nije sačuvan");
    }
  };

  const updateEvent = async (id, changes) => {
    try {
      let saved = await saveEventChanges(id, changes, backendUserId);
      if (changes.coverFile) {
        saved = await uploadEventImage(saved.id || id, changes.coverFile);
      }
      const normalized = { ...saved, id: saved.id || id };
      setEvents((prev) => prev.map((event) => (String(event.id) === String(id) ? normalized : event)));
      toast("Događaj je izmijenjen");
      if (userRole === "organizator") {
        loadOrganizerEvents();
      }
      return true;
    } catch (err) {
      console.error(err);
      toast("Događaj nije sačuvan");
      return false;
    }
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
    toast(isListed ? "Uklonjeni ste iz liste za ovaj događaj" : "Dodati ste na listu: tražite društvo za ovaj događaj");
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
    toast(`Zahtjev poslat korisniku ${targetUser.name}. Čeka se da ga prihvati.`);
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
        !(e.address || "").toLowerCase().includes(search.toLowerCase())
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
          language={language}
          setLanguage={updateLanguage}
          t={t}
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
            date={date}
            setDate={setDate}
            cities={cities}
            vote={vote}
            toggleFav={toggleFav}
            navigate={navigate}
            t={t}
            language={language}
          />
        )}
        {page === "popular" && <PopularPage events={popularEvents} navigate={navigate} t={t} language={language} />}
        {page === "favorites" && (
          <FavoritesPage events={favEvents} navigate={navigate} vote={vote} toggleFav={toggleFav} user={user} t={t} language={language} />
        )}
        {page === "detail" && detailEvent && (
          <DetailPage
            event={detailEvent}
            navigate={navigate}
            vote={vote}
            toggleFav={toggleFav}
            user={user}
            toast={toast}
            t={t}
            language={language}
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
              Događaj nije pronađen.
              <br />
              <button className="btn-primary" style={{ marginTop: "1rem" }} onClick={() => navigate("home")}>
                Nazad na događaje
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
            onUserUpdated={updateUser}
            t={t}
            language={language}
          />
        )}
        {page === "organizer" && userRole === "organizator" && (
          <OrganizerPage
            user={user}
            events={events.filter((e) => String(e.organizerId) === String(backendUserId) || e.organizer === userName)}
            addEvent={addEvent}
            updateEvent={updateEvent}
            deleteEvent={deleteEvent}
            promoteEvent={promoteEvent}
            updateEventImg={updateEventImg}
            cities={cities}
            language={language}
          />
        )}
        {page === "admin" && userRole === "administrator" && (
          <AdminPage
            events={events}
            approveEvent={approveEvent}
            rejectEvent={rejectEvent}
            deleteEvent={deleteEvent}
            adminRequests={adminRequests}
            organizers={organizers}
            language={language}
            approveAdmin={async (id) => {
              try {
                const updated = await approveAdminRequest(id);
                setAdminRequests((prev) => prev.filter((u) => String(u.ID || u.id) !== String(id)));
                setOrganizers((prev) => prev.map((u) => String(u.ID || u.id) === String(id) ? { ...u, ...updated } : u));
                toast("Organizator odobren");
              } catch {
                toast("Organizator nije odobren");
              }
            }}
            rejectAdmin={async (id) => {
              try {
                const updated = await rejectAdminRequest(id);
                setAdminRequests((prev) => prev.filter((u) => String(u.ID || u.id) !== String(id)));
                setOrganizers((prev) => prev.map((u) => String(u.ID || u.id) === String(id) ? { ...u, ...updated } : u));
                toast("Zahtjev organizatora odbijen");
              } catch {
                toast("Zahtjev organizatora nije odbijen");
              }
            }}
          />
        )}

        <footer className="footer">
          <strong>TvojGrad</strong> - Centralizovana platforma za događaje u gradu
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
