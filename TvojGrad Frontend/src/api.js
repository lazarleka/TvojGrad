export const API_BASE_URL = "http://localhost:8080";

export const getStoredUser = () => {
  try {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const getUserId = (user = getStoredUser()) => user?.ID || user?.id || null;

export const absoluteImgSrc = (src) => {
  if (!src) return null;
  if (src.startsWith("data:") || src.startsWith("http://") || src.startsWith("https://")) return src;
  return `${API_BASE_URL}${src.startsWith("/") ? "" : "/"}${src}`;
};

export const getEmojiByCategory = (type) => {
  switch (type?.toLowerCase()) {
    case "koncert": return "🎵";
    case "festival": return "🎪";
    case "sportski dogadjaj": return "⚽";
    case "sport": return "⚽";
    case "izlozba": return "🎨";
    case "kultura": return "🎨";
    case "pozoriste": return "🎭";
    case "humanitarna akcija": return "❤️";
    case "edukacija": return "📚";
    case "sajam": return "🛍️";
    case "proslava": return "🎉";
    case "muzika": return "🎷";
    case "zabava": return "🎤";
    default: return "📌";
  }
};

export const getColorByCategory = (type) => {
  switch (type?.toLowerCase()) {
    case "koncert":
    case "muzika":
      return "#1D9E75";
    case "sportski dogadjaj":
    case "sport":
      return "#3B6D11";
    case "izlozba":
    case "kultura":
      return "#533AB7";
    case "edukacija":
      return "#185FA5";
    case "festival":
    case "zabava":
      return "#BA7517";
    default:
      return "#993556";
  }
};

export const getEventAddress = (event) =>
  event?.Adresa ||
  event?.adresa ||
  event?.ADRESA ||
  event?.Lokacija ||
  event?.lokacija ||
  event?.location ||
  event?.Grad ||
  event?.grad ||
  "";

export const formatEvent = (event) => ({
  ...event,
  id: event.ID,
  title: event.Naslov,
  description: event.Opis,
  desc: event.Opis,
  date: event.Datum,
  time: event.Vreme,
  city: event.Grad,
  address: getEventAddress(event),
  location: getEventAddress(event),
  category: event.Tip_dogadjaja,
  coverColor: getColorByCategory(event.Tip_dogadjaja),
  coverImg: absoluteImgSrc(event.slika_1 || event.Slika_1 || null),
  emoji: event.slika_1 ? null : (event.Emoji || getEmojiByCategory(event.Tip_dogadjaja)),
  promoted: event.Status === "promovisana",
  price: event.Cijena,
  status: event.Status === "odobrena" || event.Status === "promovisana" ? "approved" : event.Status,
  organizer: event.Organizator || event.organizator || (event.Organizator_ID ? `Korisnik #${event.Organizator_ID}` : ""),
  organizerId: event.Organizator_ID,
  votes: {
    up: event.Upvote ?? 0,
    down: event.Downvote ?? 0,
  },
});

export const fetchEvents = async () => {
  const response = await fetch(`${API_BASE_URL}/dogadjaji`);
  if (!response.ok) throw new Error("Dogadjaji nisu dostupni");
  const data = await response.json();
  return (data || []).map(formatEvent);
};

export const fetchAdminEvents = async () => {
  const response = await fetch(`${API_BASE_URL}/dogadjaji/admin/svi`);
  if (!response.ok) throw new Error("Dogadjaji nisu dostupni");
  const data = await response.json();
  return (data || []).map(formatEvent);
};

export const fetchOrganizerEvents = async (organizerId) => {
  if (!organizerId) return [];
  const response = await fetch(`${API_BASE_URL}/dogadjaji/organizator/${organizerId}`);
  if (!response.ok) throw new Error("Dogadjaji organizatora nisu dostupni");
  const data = await response.json();
  return (data || []).map(formatEvent);
};

export const fetchCities = async () => {
  const response = await fetch(`${API_BASE_URL}/gradovi`);
  if (!response.ok) throw new Error("Gradovi nisu dostupni");
  const data = await response.json();
  return ["Svi gradovi", ...(data || []).map((g) => g.Ime || g.ime).filter(Boolean)];
};

export const fetchEventById = async (eventId) => {
  const response = await fetch(`${API_BASE_URL}/dogadjaji/${eventId}`);
  if (!response.ok) throw new Error("Dogadjaj nije dostupan");
  const data = await response.json();
  return data?.ID ? formatEvent(data) : null;
};

export const fetchUserVote = async (eventId, userId) => {
  if (!eventId || !userId) return null;
  const response = await fetch(`${API_BASE_URL}/dogadjaji/${eventId}/vote/${userId}`);
  if (!response.ok) return null;
  const data = await response.json();
  return data?.vote || null;
};

export const submitVote = async (eventId, userId, voteType) => {
  const endpoint = voteType === "up" ? "upvote" : "downvote";
  const response = await fetch(`${API_BASE_URL}/dogadjaji/${eventId}/${endpoint}/${userId}`, {
    method: "PUT",
  });
  if (!response.ok) {
    const legacyResponse = await fetch(`${API_BASE_URL}/dogadjaji/${eventId}/${endpoint}`, {
      method: "PUT",
    });
    if (!legacyResponse.ok) throw new Error("Glas nije sacuvan");
    const legacyEvent = formatEvent(await legacyResponse.json());
    Object.defineProperty(legacyEvent, "__usedLegacyVoteEndpoint", {
      value: true,
      enumerable: false,
    });
    return legacyEvent;
  }
  return formatEvent(await response.json());
};

export const removeLegacyVote = async (eventId, voteType) => {
  const endpoint = voteType === "up" ? "removeupvote" : "removedownvote";
  const response = await fetch(`${API_BASE_URL}/dogadjaji/${eventId}/${endpoint}`, {
    method: "PUT",
  });
  if (!response.ok) throw new Error("Glas nije uklonjen");
  return formatEvent(await response.json());
};

export const removeVote = async (eventId, userId) => {
  const response = await fetch(`${API_BASE_URL}/dogadjaji/${eventId}/vote/${userId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Glas nije uklonjen");
  return formatEvent(await response.json());
};

export const createEvent = async (event, userId) => {
  const response = await fetch(`${API_BASE_URL}/dogadjaji`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Naslov: event.title,
      Opis: event.desc,
      Datum: event.date,
      Vreme: event.time,
      Upvote: 0,
      Downvote: 0,
      Status: event.promoted ? "na_cekanju_promovisana" : "na_cekanju",
      Grad: event.city,
      Adresa: event.address || event.location,
      Organizator_ID: userId,
      Administrator_ID: null,
      Tip_dogadjaja: event.category,
      slika_1: null,
      Emoji: event.emoji,
      Cijena: Number(event.price || 0),
    }),
  });
  if (!response.ok) throw new Error("Dogadjaj nije sacuvan");
  return formatEvent(await response.json());
};

export const uploadEventImage = async (eventId, file) => {
  if (!eventId || !file) return null;
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE_URL}/uploads/dogadjaji/${eventId}/slika`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Slika dogadjaja nije sacuvana");
  return formatEvent(await response.json());
};

export const uploadProfileImage = async (userId, file) => {
  if (!userId || !file) return null;
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE_URL}/uploads/korisnici/${userId}/profilna`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Profilna slika nije sacuvana");
  return response.json();
};

export const approveEventRequest = async (eventId, adminId) => {
  const qs = adminId ? `?administratorID=${encodeURIComponent(adminId)}` : "";
  const response = await fetch(`${API_BASE_URL}/dogadjaji/${eventId}/odobri${qs}`, { method: "PUT" });
  if (!response.ok) throw new Error("Dogadjaj nije odobren");
  return formatEvent(await response.json());
};

export const rejectEventRequest = async (eventId, adminId) => {
  const qs = adminId ? `?administratorID=${encodeURIComponent(adminId)}` : "";
  const response = await fetch(`${API_BASE_URL}/dogadjaji/${eventId}/odbij${qs}`, { method: "PUT" });
  if (!response.ok) throw new Error("Dogadjaj nije odbijen");
  return formatEvent(await response.json());
};

export const requestEventPromotion = async (eventId) => {
  const response = await fetch(`${API_BASE_URL}/dogadjaji/${eventId}/zahtjev-promocija`, { method: "PUT" });
  if (!response.ok) throw new Error("Zahtjev za promociju nije sacuvan");
  return formatEvent(await response.json());
};

export const deleteEventById = async (eventId) => {
  const response = await fetch(`${API_BASE_URL}/dogadjaji/${eventId}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Dogadjaj nije obrisan");
};

export const fetchAdminRequests = async () => {
  const response = await fetch(`${API_BASE_URL}/korisnici/organizator-zahtjevi`);
  if (!response.ok) throw new Error("Organizator zahtjevi nisu dostupni");
  return response.json();
};

export const approveAdminRequest = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/korisnici/${userId}/odobri-organizatora`, { method: "PUT" });
  if (!response.ok) throw new Error("Organizator nije odobren");
  return response.json();
};

export const rejectAdminRequest = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/korisnici/${userId}/odbij-organizatora`, { method: "PUT" });
  if (!response.ok) throw new Error("Organizator nije odbijen");
  return response.json();
};
