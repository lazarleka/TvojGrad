import { useEffect, useMemo, useState } from "react";
import { G } from "../constants";
import InboxPanel from "../components/InboxPanel";
import { API_BASE_URL, absoluteImgSrc, fetchEvents, fetchUserVote, formatDisplayDate, formatDisplayTime, formatEvent, getUserId, uploadProfileImage } from "../api";
import { Client } from "@stomp/stompjs";
import { translateText } from "../i18n";

const normalizeRole = (role) => {
  if (role === "organizator") return "organizer";
  if (role === "administrator") return "admin";
  if (role === "obicni") return "visitor";
  return role || "visitor";
};

const userName = (user) => {
  const full = `${user?.Ime || user?.ime || ""} ${user?.Prezime || user?.prezime || ""}`.trim();
  return user?.name || full || user?.Email || user?.email || "Korisnik";
};

const initialsFor = (name) => name
  .split(" ")
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0])
  .join("")
  .toUpperCase() || "?";

const avatarFor = (person, fallbackName, extraClass = "") => {
  const image = absoluteImgSrc(person?.Profilna || person?.profilna);
  return (
    <div className={`avatar avatar-img ${extraClass}`}>
      {image ? <img src={image} alt={fallbackName} /> : initialsFor(fallbackName)}
    </div>
  );
};

const statusLabel = (status) => {
  const value = (status || "").toLowerCase();
  if (value.includes("prihvac") || value.includes("prihvać")) return "Prihvaćen";
  if (value.includes("odbij")) return "Odbijen";
  if (value.includes("cek")) return "Na čekanju";
  return status || "Na čekanju";
};

const requestReceiver = (request, usersById = {}) => {
  const receiverId = request.PrimioZahtev || request.primioZahtev;
  return request.PrimioZahtevKorisnik || request.primioZahtevKorisnik || usersById[String(receiverId)] || null;
};

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
  onUnreadMessagesChange,
  externalUnreadCetIds = {},
  onMarkChatRead,
  onUserUpdated,
  t = (key) => key,
  language = "SRB",
}) {
  const uid = getUserId(user);
  const name = userName(user);
  const email = user?.Email || user?.email || "";
  const role = normalizeRole(user?.Tip || user?.tip || user?.role);
  const roleLabels = { visitor: "Posjetilac", organizer: "Organizator", admin: "Administrator" };
  const roleClasses = { visitor: "role-visitor", organizer: "role-organizer", admin: "role-admin" };
  const profileImage = absoluteImgSrc(user?.Profilna || user?.profilna);

  const [backendFavorites, setBackendFavorites] = useState([]);
  const [backendVotedEvents, setBackendVotedEvents] = useState([]);
  const [dbRequests, setDbRequests] = useState([]);
  const [dbCets, setDbCets] = useState([]);
  const [dbPrijave, setDbPrijave] = useState([]);
  const [psmStatusSaving, setPsmStatusSaving] = useState({});
  const [activeCetId, setActiveCetId] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [chatInput, setChatInput] = useState("");
  const [stompClient, setStompClient] = useState(null);
  const [unreadCetIds, setUnreadCetIds] = useState({});
  const [usersById, setUsersById] = useState({});

  useEffect(() => {
    if (!uid) return;
    loadProfileData();
  }, [uid]);

  useEffect(() => {
    if (onUnreadMessagesChange) {
      onUnreadMessagesChange(Object.keys(unreadCetIds).length);
    }
  }, [unreadCetIds, onUnreadMessagesChange]);

  useEffect(() => {
    if (!uid || dbCets.length === 0) return;
    const storageKey = `openCetId:${uid}`;
    const requestedCetId = localStorage.getItem(storageKey);
    if (!requestedCetId) return;

    const targetCet = dbCets.find((cet) => String(cet.ID) === String(requestedCetId));
    if (!targetCet) return;

    setProfileTab("inbox");
    setActiveCetId(targetCet.ID);
    setUnreadCetIds((prev) => {
      const next = { ...prev };
      delete next[targetCet.ID];
      return next;
    });
    if (onMarkChatRead) {
      onMarkChatRead(targetCet.ID, latestMessageIdForCet(targetCet.ID));
    }
    localStorage.removeItem(storageKey);
  }, [uid, dbCets, setProfileTab, onMarkChatRead]);

  const loadProfileData = async () => {
    await Promise.all([loadFavorites(), loadVotes(), loadRequests(), loadCets(), loadPrijave()]);
  };

  const loadFavorites = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/OmiljeniDogadjaji/${uid}`);
      if (!response.ok) return;
      const data = await response.json();
      setBackendFavorites((data || []).map(formatEvent));
    } catch {
      setBackendFavorites([]);
    }
  };

  const loadVotes = async () => {
    try {
      const allEvents = await fetchEvents();
      const voteEntries = await Promise.all(
        allEvents.map(async (event) => [event, await fetchUserVote(event.id, uid)])
      );
      setBackendVotedEvents(
        voteEntries
          .filter(([, vote]) => vote)
          .map(([event, vote]) => ({ ...event, myVote: vote }))
      );
    } catch {
      setBackendVotedEvents(events.filter((event) => event.myVote));
    }
  };

  const loadRequests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/zahtevi`);
      if (!response.ok) return;
      const data = await response.json();
      setDbRequests(data || []);
      const nextUsers = {};
      (data || []).forEach((request) => {
        const sender = request.PosloZahtev || request.posloZahtev;
        const senderId = getUserId(sender);
        const receiver = request.PrimioZahtevKorisnik || request.primioZahtevKorisnik;
        const receiverId = request.PrimioZahtev || request.primioZahtev || getUserId(receiver);
        if (senderId && sender) nextUsers[String(senderId)] = sender;
        if (receiverId && receiver) nextUsers[String(receiverId)] = receiver;
      });
      if (Object.keys(nextUsers).length > 0) {
        setUsersById((prev) => ({ ...prev, ...nextUsers }));
      }
      const missingIds = [...new Set((data || []).flatMap((request) => [
        getUserId(request.PosloZahtev || request.posloZahtev),
        request.PrimioZahtev || request.primioZahtev,
      ]).filter((id) => id && String(id) !== String(uid) && !nextUsers[String(id)] && !usersById[String(id)]))];
      await Promise.all(missingIds.map(async (id) => {
        try {
          const userResponse = await fetch(`${API_BASE_URL}/korisnici/${id}`);
          if (!userResponse.ok) return;
          const userData = await userResponse.json();
          if (userData?.ID || userData?.id) {
            setUsersById((prev) => ({ ...prev, [String(id)]: userData }));
          }
        } catch {
          // Neutralan fallback ostaje bez prikaza internog ID-a.
        }
      }));
    } catch {
      setDbRequests([]);
    }
  };

  const loadCets = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cetovi/korisnik/${uid}`);
      if (!response.ok) return;
      const data = await response.json();
      setDbCets(data || []);
      await loadMissingChatUsers(data || []);
      await Promise.all((data || []).map((cet) => loadMessages(cet.ID)));
    } catch {
      setDbCets([]);
    }
  };

  const loadMissingChatUsers = async (cets) => {
    const ids = new Set();
    cets.forEach((cet) => {
      const sender = cet.Posiljalac || cet.posiljalac;
      const senderId = getUserId(sender);
      const receiver = cet.Primalac || cet.primalac;
      const receiverId = cet.Primalac_ID || cet.primalac_ID;
      if (senderId) ids.add(String(senderId));
      if (receiverId) ids.add(String(receiverId));
      if (receiverId && receiver) {
        setUsersById((prev) => ({ ...prev, [String(receiverId)]: receiver }));
      }
    });

    await Promise.all([...ids].map(async (id) => {
      if (String(id) === String(uid) || usersById[id]) return;
      try {
        const response = await fetch(`${API_BASE_URL}/korisnici/${id}`);
        if (!response.ok) return;
        const data = await response.json();
        if (data?.ID) {
          setUsersById((prev) => ({ ...prev, [String(id)]: data }));
        }
      } catch {
        // Ostaje fallback ako backend nije dostupan.
      }
    }));
  };

  const loadPrijave = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/prijave`);
      if (!response.ok) return;
      const data = await response.json();
      setDbPrijave(data || []);
      const nextUsers = {};
      (data || []).forEach((prijava) => {
        const prijavaUser = prijava.Korisnik || prijava.korisnik;
        const prijavaUserId = getUserId(prijavaUser);
        if (prijavaUserId && prijavaUser) {
          nextUsers[String(prijavaUserId)] = prijavaUser;
        }
      });
      if (Object.keys(nextUsers).length > 0) {
        setUsersById((prev) => ({ ...prev, ...nextUsers }));
      }
    } catch {
      setDbPrijave([]);
    }
  };

  const loadMessages = async (cetID) => {
    try {
      const response = await fetch(`${API_BASE_URL}/poruke-ceta/cet/${cetID}`);
      if (!response.ok) return;
      const data = await response.json();
      setChatMessages((prev) => ({ ...prev, [cetID]: data || [] }));
      const messageUsers = {};
      (data || []).forEach((message) => {
        const messageSender = message.Posiljalac || message.posiljalac;
        const messageSenderId = getUserId(messageSender);
        if (messageSenderId && messageSender) {
          messageUsers[String(messageSenderId)] = messageSender;
        }
      });
      if (Object.keys(messageUsers).length > 0) {
        setUsersById((prev) => ({ ...prev, ...messageUsers }));
      }
      const senderIds = [...new Set((data || [])
        .map((message) => message.Posiljalac_ID || message.posiljalacID)
        .filter((id) => id && String(id) !== String(uid) && !usersById[String(id)]))];
      await Promise.all(senderIds.map(async (id) => {
        try {
          const userResponse = await fetch(`${API_BASE_URL}/korisnici/${id}`);
          if (!userResponse.ok) return;
          const userData = await userResponse.json();
          if (userData?.ID) {
            setUsersById((prev) => ({ ...prev, [String(id)]: userData }));
          }
        } catch {
          // Ime ostaje neutralan fallback ako korisnik ne može da se učita.
        }
      }));
    } catch {
      setChatMessages((prev) => ({ ...prev, [cetID]: [] }));
    }
  };

  useEffect(() => {
    if (!uid || dbCets.length === 0) return undefined;
    let client;
    let cancelled = false;

    const connect = async () => {
      window.global = window.global || window;
      const { default: SockJS } = await import("sockjs-client");
      if (cancelled) return;

      client = new Client({
        webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws-tvojgrad`),
        reconnectDelay: 3000,
        onConnect: () => {
          dbCets.forEach((cet) => {
          client.subscribe(`/topic/cet/${cet.ID}`, (message) => {
            const received = JSON.parse(message.body);
            const senderId = received.Posiljalac_ID || received.posiljalacID;
            const sender = received.Posiljalac || received.posiljalac;
            if (senderId && sender) {
              setUsersById((prev) => ({ ...prev, [String(senderId)]: sender }));
            }
            setChatMessages((prev) => ({
              ...prev,
              [cet.ID]: [...(prev[cet.ID] || []), received],
            }));
            if (String(senderId) !== String(uid) && String(activeCetId) !== String(cet.ID)) {
              setUnreadCetIds((prev) => ({ ...prev, [cet.ID]: true }));
            }
          });
          });
        },
      });

      client.activate();
      setStompClient(client);
    };

    connect();
    return () => {
      cancelled = true;
      if (client) client.deactivate();
      setStompClient(null);
    };
  }, [uid, activeCetId, dbCets.map((cet) => cet.ID).join(",")]);

  const ensureCetForRequest = async (request) => {
    const sender = request.PosloZahtev || request.posloZahtev;
    const senderId = getUserId(sender);
    const receiverId = request.PrimioZahtev || request.primioZahtev;
    const prijavaOwnerId = String(uid) === String(receiverId) ? receiverId : receiverId;
    const targetPrijava = dbPrijave.find((prijava) => String(getUserId(prijava.Korisnik || prijava.korisnik)) === String(prijavaOwnerId));
    if (!senderId || !receiverId || !targetPrijava?.ID) return null;

    const existing = dbCets.find((cet) => {
      const cetSenderId = getUserId(cet.Posiljalac || cet.posiljalac);
      return String(cet.Prijava_ID || cet.prijava_ID) === String(targetPrijava.ID) &&
        ((String(cetSenderId) === String(senderId) && String(cet.Primalac_ID || cet.primalac_ID) === String(receiverId)) ||
          (String(cetSenderId) === String(receiverId) && String(cet.Primalac_ID || cet.primalac_ID) === String(senderId)));
    });
    if (existing) return existing;

    const response = await fetch(`${API_BASE_URL}/cetovi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Prijava_ID: targetPrijava.ID,
        Posiljalac: { ID: senderId },
        Primalac_ID: receiverId,
        Rejting_1: null,
        Rejting_2: null,
      }),
    });
    if (!response.ok) return null;
    const created = await response.json();
    await loadCets();
    return created;
  };

  const openChatForRequest = async (request) => {
    const cet = await ensureCetForRequest(request);
    if (cet?.ID) {
      await loadMessages(cet.ID);
      await loadCets();
      setActiveCetId(cet.ID);
      setUnreadCetIds((prev) => {
        const next = { ...prev };
        delete next[cet.ID];
        return next;
      });
      setProfileTab("inbox");
    }
  };

  const updateRequestStatus = async (request, nextStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/zahtevi/${request.ID}/status/${encodeURIComponent(nextStatus)}`, {
        method: "PUT",
      });
      if (!response.ok) throw new Error("Status nije sačuvan");
      if (nextStatus === "prihvacen") {
        const cet = await ensureCetForRequest(request);
        if (cet?.ID) {
          await loadMessages(cet.ID);
          setActiveCetId(cet.ID);
        }
      }
      await loadRequests();
      await loadCets();
    } catch (err) {
      console.error(err);
    }
  };

  const favoriteList = backendFavorites.length ? backendFavorites : favEvents;
  const votedEvents = backendVotedEvents.length ? backendVotedEvents : events.filter((event) => event.myVote);
  const receivedRequests = useMemo(
    () => dbRequests.filter((request) => String(request.PrimioZahtev || request.primioZahtev) === String(uid)),
    [dbRequests, uid]
  );
  const sentRequests = useMemo(
    () => dbRequests.filter((request) => String(getUserId(request.PosloZahtev || request.posloZahtev)) === String(uid)),
    [dbRequests, uid]
  );
  const acceptedPairs = useMemo(() => {
    const pairs = new Set();
    dbRequests.forEach((request) => {
      if (!statusLabel(request.status).toLowerCase().startsWith("prihva")) return;
      const senderId = getUserId(request.PosloZahtev || request.posloZahtev);
      const receiverId = request.PrimioZahtev || request.primioZahtev;
      if (senderId && receiverId) {
        pairs.add([String(senderId), String(receiverId)].sort().join(":"));
      }
    });
    return pairs;
  }, [dbRequests]);
  const acceptedCets = useMemo(
    () => dbCets.filter((cet) => {
      const senderId = getUserId(cet.Posiljalac || cet.posiljalac);
      const receiverId = cet.Primalac_ID || cet.primalac_ID;
      return senderId && receiverId && acceptedPairs.has([String(senderId), String(receiverId)].sort().join(":"));
    }),
    [dbCets, acceptedPairs]
  );

  const pendingReceived = receivedRequests.filter((request) => statusLabel(request.status).toLowerCase() === "na čekanju");
  const localThreadCount = Object.keys(conversations || {}).length;
  const conversationCount = acceptedCets.length || localThreadCount;
  const totalUnread = unreadCount + pendingReceived.length;
  const myPsmPrijave = dbPrijave.filter((prijava) => String(getUserId(prijava.Korisnik || prijava.korisnik)) === String(uid));

  const tabs = [
    { id: "favorites", label: "❤️ Omiljeni", count: favoriteList.length },
    { id: "inbox", label: "💬 Poruke i zahtjevi", count: totalUnread, badge: totalUnread > 0 },
    { id: "sent-requests", label: "📨 Poslati zahtjevi", count: sentRequests.length },
    { id: "psm-applications", label: `🚶 ${t("psmApplications")}`, count: myPsmPrijave.length },
    { id: "votes", label: "👍 Glasovi", count: votedEvents.length },
    ...(role === "organizer" ? [{ id: "organizer", label: "➕ Moji događaji" }] : []),
    ...(role === "admin" ? [{ id: "admin-link", label: "⚙️ Admin panel" }] : []),
  ];

  const handleTabClick = (tab) => {
    if (tab.id === "organizer") { navigate("organizer"); return; }
    if (tab.id === "admin-link") { navigate("admin"); return; }
    setProfileTab(tab.id);
  };

  const formatDate = (value) => formatDisplayDate(value);

  const handleProfileImage = async (file) => {
    if (!file || !uid) return;
    try {
      const updated = await uploadProfileImage(uid, file);
      const merged = { ...user, ...updated };
      localStorage.setItem("user", JSON.stringify(merged));
      if (onUserUpdated) onUserUpdated(merged);
    } catch (err) {
      console.error(err);
    }
  };

  const eventTitleForPrijava = (prijava) => {
    const objavaId = prijava.Objava_ID || prijava.objava_ID;
    const related = events.find((event) => String(event.id || event.ID) === String(objavaId));
    return translateText(related?.title || related?.Naslov || (objavaId ? `Događaj #${objavaId}` : "Događaj"), language);
  };

  const updatePsmPrijavaStatus = async (prijava, status) => {
    const prijavaId = prijava.ID || prijava.id;
    if (!prijavaId) return;
    setPsmStatusSaving((prev) => ({ ...prev, [prijavaId]: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/prijave/${prijavaId}/status/${encodeURIComponent(status)}`, {
        method: "PUT",
      });
      if (!response.ok) throw new Error("Status nije sačuvan");
      const updated = await response.json();
      setDbPrijave((prev) => prev.map((item) => String(item.ID || item.id) === String(prijavaId) ? updated : item));
    } catch (err) {
      console.error(err);
    } finally {
      setPsmStatusSaving((prev) => {
        const next = { ...prev };
        delete next[prijavaId];
        return next;
      });
    }
  };

  const renderEventList = (list, emptyText, metaFor) => (
    list.length > 0 ? list.map((event) => (
      <div key={event.id || event.ID} className="my-event-item profile-event-item" style={{ cursor: "pointer" }} onClick={() => navigate("detail", event)}>
        <div className="my-event-emoji">{event.emoji || "📌"}</div>
        <div className="my-event-info">
          <div className="my-event-title">{translateText(event.title || event.Naslov, language)}</div>
          <div className="profile-event-meta">{metaFor(event)}</div>
        </div>
      </div>
    )) : <div style={{ color: G.muted, fontSize: 14, textAlign: "center", padding: "1.5rem" }}>{emptyText}</div>
  );

  const renderRequest = (request, mode) => {
    const sender = request.PosloZahtev || request.posloZahtev;
    const receiver = requestReceiver(request, usersById);
    const displayUser = mode === "sent" ? receiver : sender;
    const fallbackName = "Korisnik";
    const displayName = displayUser ? userName(displayUser) : fallbackName;
    const displayEmail = displayUser?.Email || displayUser?.email || "";
    const currentStatus = statusLabel(request.status);
    const isPending = currentStatus.toLowerCase() === "na čekanju";
    const isAccepted = currentStatus.toLowerCase().startsWith("prihva");

    return (
      <div key={request.ID} className="request-card">
        {avatarFor(displayUser, displayName)}
        <div className="request-info">
          <div className="request-name">{displayName}</div>
          <div className="request-meta">
            {displayEmail ? `${displayEmail} · ` : ""}Status: {currentStatus}
          </div>
        </div>
        {mode === "received" && isPending && (
          <div className="request-actions">
            <button className="action-btn action-approve" onClick={() => updateRequestStatus(request, "prihvacen")}>
              Prihvati
            </button>
            <button className="action-btn action-reject" onClick={() => updateRequestStatus(request, "odbijen")}>
              Odbij
            </button>
          </div>
        )}
        {isAccepted && (
          <div className="request-actions">
            <button className="action-btn action-approve" onClick={() => openChatForRequest(request)}>
              Otvori chat
            </button>
          </div>
        )}
      </div>
    );
  };

  const sendBackendMessage = () => {
    if (!activeCetId || !chatInput.trim()) return;
    const payload = {
      Cet_ID: activeCetId,
      Posiljalac_ID: uid,
      Tekst: chatInput.trim(),
    };
    if (stompClient?.connected) {
      stompClient.publish({ destination: "/app/chat.posalji", body: JSON.stringify(payload) });
    }
    setChatInput("");
  };

  const activeCet = acceptedCets.find((cet) => String(cet.ID) === String(activeCetId));
  const backendChatMessages = activeCetId ? chatMessages[activeCetId] || [] : [];
  const latestMessageIdForCet = (cetId) => Math.max(0, ...((chatMessages[cetId] || []).map((message) => Number(message.ID || 0))));

  useEffect(() => {
    if (activeCetId && onMarkChatRead) {
      onMarkChatRead(activeCetId, latestMessageIdForCet(activeCetId));
    }
  }, [activeCetId, backendChatMessages.length]);
  const getOtherUser = (cet) => {
    const sender = cet.Posiljalac || cet.posiljalac;
    const senderId = getUserId(sender);
    const receiver = cet.Primalac || cet.primalac;
    const receiverId = cet.Primalac_ID || cet.primalac_ID;
    const prijava = dbPrijave.find((p) => String(p.ID) === String(cet.Prijava_ID || cet.prijava_ID));
    const prijavaUser = prijava?.Korisnik || prijava?.korisnik;
    const messageOtherId = (chatMessages[cet.ID] || [])
      .map((message) => message.Posiljalac_ID || message.posiljalacID)
      .find((id) => id && String(id) !== String(uid));
    const messageOtherUser = (chatMessages[cet.ID] || [])
      .map((message) => message.Posiljalac || message.posiljalac)
      .find((messageSender) => messageSender && String(getUserId(messageSender)) !== String(uid)) ||
      (messageOtherId ? usersById[String(messageOtherId)] : null);

    if (messageOtherUser) return messageOtherUser;
    if (senderId && String(senderId) !== String(uid)) return sender || usersById[String(senderId)] || null;
    if (receiverId && String(receiverId) !== String(uid)) return receiver || usersById[String(receiverId)] || null;

    const matchingRequest = dbRequests.find((request) => {
      if (!statusLabel(request.status).toLowerCase().startsWith("prihva")) return false;
      const requestSenderId = getUserId(request.PosloZahtev || request.posloZahtev);
      const requestReceiverId = request.PrimioZahtev || request.primioZahtev;
      return [String(requestSenderId), String(requestReceiverId)].sort().join(":") ===
        [String(senderId), String(receiverId)].sort().join(":");
    });

    if (matchingRequest) {
      const requestSender = matchingRequest.PosloZahtev || matchingRequest.posloZahtev;
      const requestSenderId = getUserId(requestSender);
      if (String(requestSenderId) !== String(uid)) return requestSender;
      return usersById[String(matchingRequest.PrimioZahtev || matchingRequest.primioZahtev)] || prijavaUser || null;
    }

    if (String(senderId) === String(uid)) {
      return receiver || usersById[String(receiverId)] || prijavaUser || null;
    }
    return sender || usersById[String(senderId)] || null;
  };
  const activeOtherUser = activeCet ? getOtherUser(activeCet) : null;
  const activeOtherName = activeOtherUser ? userName(activeOtherUser) : "Chat";

  return (
    <div className="main">
      <div className="profile-grid">
        <div>
          <div className="profile-card">
            <div className="profile-avatar profile-avatar-img">
              {profileImage ? <img src={profileImage} alt={name} /> : initialsFor(name)}
            </div>
            <label className="profile-photo-btn">
              Promijeni sliku
              <input type="file" accept="image/*" onChange={(ev) => handleProfileImage(ev.target.files?.[0])} />
            </label>
            <div className="profile-name">{name}</div>
            <div className="profile-email">{email}</div>
            <span className={`role-badge ${roleClasses[role]}`}>{roleLabels[role]}</span>
            <div className="profile-stats">
              <div className="profile-stat"><div className="profile-stat-val">{favoriteList.length}</div><div className="profile-stat-label">Omiljeni</div></div>
              <div className="profile-stat"><div className="profile-stat-val">{votedEvents.length}</div><div className="profile-stat-label">Glasovi</div></div>
              <div className="profile-stat"><div className="profile-stat-val">{conversationCount}</div><div className="profile-stat-label">Razgovori</div></div>
            </div>
            <div className="profile-nav">
              {tabs.map((tab) => (
                <button key={tab.id} className={`profile-nav-btn${profileTab === tab.id ? " active" : ""}`} onClick={() => handleTabClick(tab)}>
                  {tab.label}
                  {tab.badge && <span className="nav-badge" style={{ marginLeft: "auto" }}>{tab.count}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          {profileTab === "favorites" && (
            <div className="form-card">
              <h3>❤️ Omiljeni događaji ({favoriteList.length})</h3>
              {renderEventList(
                favoriteList,
                "Niste sačuvali nijedan omiljeni događaj.",
                (event) => (
                  <>
                    <span>{formatDate(event.date || event.Datum)}</span>
                    <span>{event.city || event.Grad || "/"}</span>
                  </>
                )
              )}
            </div>
          )}

          {profileTab === "inbox" && (
            <div className="form-card">
              <h3>💬 Poruke i zahtjevi {totalUnread > 0 && <span className="nav-badge" style={{ fontSize: 11, padding: "2px 7px", width: "auto", height: "auto", borderRadius: 10 }}>{totalUnread} nova</span>}</h3>

              {(receivedRequests.length > 0 || incomingRequests.length > 0) && (
                <div className="request-list">
                  <div className="request-title">Primljeni zahtjevi za "Pođi sa mnom"</div>
                  {receivedRequests.map((request) => renderRequest(request, "received"))}
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

              {acceptedCets.length > 0 ? (
                <div className="inbox-layout">
                  <div className="inbox-sidebar">
                    <div style={{ fontSize: 13, fontWeight: 600, color: G.muted, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Razgovori
                    </div>
                    {acceptedCets.map((cet) => {
                      const otherUser = getOtherUser(cet);
                      const otherName = otherUser ? userName(otherUser) : "Korisnik";
                      const otherEmail = otherUser?.Email || otherUser?.email || "";
                      const isUnread = Boolean(unreadCetIds[cet.ID] || externalUnreadCetIds[cet.ID]);
                      return (
                        <div
                          key={cet.ID}
                          className={`inbox-thread${String(activeCetId) === String(cet.ID) ? " active-thread" : ""}${isUnread ? " unread-thread" : ""}`}
                          onClick={() => {
                            setActiveCetId(cet.ID);
                            setUnreadCetIds((prev) => {
                              const next = { ...prev };
                              delete next[cet.ID];
                              return next;
                            });
                            if (onMarkChatRead) {
                              onMarkChatRead(cet.ID, latestMessageIdForCet(cet.ID));
                            }
                          }}
                        >
                          {avatarFor(otherUser, otherName)}
                          <div className="inbox-thread-info">
                            <div className="inbox-thread-name">{otherName}</div>
                            <div className="inbox-thread-preview">{isUnread ? "Nova poruka" : (otherEmail || "Chat je aktivan")}</div>
                          </div>
                          {isUnread && <div className="inbox-unread" />}
                        </div>
                      );
                    })}
                  </div>
                  <div className="inbox-main">
                    {activeCet ? (
                      <>
                        <div className="inbox-main-header">
                          {avatarFor(activeOtherUser, activeOtherName, "avatar-lg")}
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 15, color: G.greenDark }}>{activeOtherName}</div>
                            <div style={{ fontSize: 12, color: G.muted }}>Pođi sa mnom chat</div>
                          </div>
                        </div>
                        <div className="inbox-msgs">
                          {backendChatMessages.map((message) => {
                            const mine = String(message.Posiljalac_ID || message.posiljalacID) === String(uid);
                            return (
                              <div key={message.ID || `${message.Vrijeme}-${message.Tekst}`} className={`chat-msg${mine ? " me" : ""}`}>
                                {message.Tekst || message.tekst}
                                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 3, textAlign: mine ? "right" : "left" }}>
                                  {formatDisplayTime(message.Vrijeme || message.vrijeme)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="inbox-input">
                          <input
                            value={chatInput}
                            onChange={(ev) => setChatInput(ev.target.value)}
                            onKeyDown={(ev) => ev.key === "Enter" && sendBackendMessage()}
                            placeholder="Napiši poruku..."
                          />
                          <button className="chat-send" onClick={sendBackendMessage}>Pošalji</button>
                        </div>
                      </>
                    ) : (
                      <div className="inbox-empty">💬<span>Odaberi razgovor s lijeve strane</span></div>
                    )}
                  </div>
                </div>
              ) : (
                <InboxPanel conversations={conversations} activeThread={activeThread} setActiveThread={setActiveThread} sendMsg={sendMsg} markRead={markRead} user={user} />
              )}
            </div>
          )}

          {profileTab === "sent-requests" && (
            <div className="form-card">
              <h3>📨 Poslati zahtjevi ({sentRequests.length})</h3>
              {sentRequests.length > 0 ? (
                <div className="request-list" style={{ marginBottom: 0 }}>
                  {sentRequests.map((request) => renderRequest(request, "sent"))}
                </div>
              ) : (
                <div style={{ color: G.muted, fontSize: 14, textAlign: "center", padding: "1.5rem" }}>
                  Nemate poslatih zahtjeva.
                </div>
              )}
            </div>
          )}

          {profileTab === "psm-applications" && (
            <div className="form-card">
              <h3>{t("psmApplications")} ({myPsmPrijave.length})</h3>
              {myPsmPrijave.length > 0 ? (
                <div className="request-list" style={{ marginBottom: 0 }}>
                  {myPsmPrijave.map((prijava) => {
                    const prijavaId = prijava.ID || prijava.id;
                    const status = prijava.Status || prijava.status || "Otvoren";
                    const saving = Boolean(psmStatusSaving[prijavaId]);
                    const isOpen = status.toLowerCase().startsWith("otvoren");
                    return (
                      <div key={prijavaId} className="request-card">
                        <div className="request-info">
                          <div className="request-name">{eventTitleForPrijava(prijava)}</div>
                          <div className="request-meta">Status: {status} · {prijava.Tekst || prijava.tekst || "/"}</div>
                        </div>
                        <div className="request-actions">
                          {isOpen ? (
                            <button className="action-btn action-delete" disabled={saving} onClick={() => updatePsmPrijavaStatus(prijava, "Zatvoren")}>
                              {t("archive")}
                            </button>
                          ) : (
                            <button className="action-btn action-approve" disabled={saving} onClick={() => updatePsmPrijavaStatus(prijava, "Otvoren")}>
                              {t("reopen")}
                            </button>
                          )}
                          <button className="action-btn action-reject" disabled={saving} onClick={() => updatePsmPrijavaStatus(prijava, "Otkazan")}>
                            {t("cancel")}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ color: G.muted, fontSize: 14, textAlign: "center", padding: "1.5rem" }}>
                  Nemate prijava za "Pođi sa mnom".
                </div>
              )}
            </div>
          )}

          {profileTab === "votes" && (
            <div className="form-card">
              <h3>👍 Glasali ste za ({votedEvents.length})</h3>
              {renderEventList(
                votedEvents,
                "Niste glasali ni za jedan događaj.",
                (event) => event.myVote === "up" ? "👍 Sviđa mi se" : "👎 Ne sviđa mi se"
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
