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

export const formatDisplayDate = (value) => {
  if (!value) return "/";
  const raw = String(value);
  const datePart = raw.includes("T") ? raw.split("T")[0] : raw;
  const isoMatch = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return raw;
  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatDisplayTime = (value) => {
  if (!value) return "/";
  const raw = String(value).trim();
  const timeMatch = raw.match(/(\d{1,2})[:/](\d{2})/);
  if (!timeMatch) return raw;
  return `${String(timeMatch[1]).padStart(2, "0")}:${timeMatch[2]}`;
};

export const absoluteImgSrc = (src) => {
  if (!src) return null;
  if (src.startsWith("data:") || src.startsWith("http://") || src.startsWith("https://")) return src;
  return `${API_BASE_URL}${src.startsWith("/") ? "" : "/"}${src}`;
};

export const getEmojiByCategory = (type) => {
  switch (type?.toLowerCase()) {
    case "koncert": return "🎵";
    case "festival": return "🎪";
    case "sportski događaj":
    case "sportski dogadjaj": return "⚽";
    case "sport": return "⚽";
    case "izložba":
    case "izlozba": return "🎨";
    case "kultura": return "🎨";
    case "pozorište":
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
    case "sportski događaj":
    case "sportski dogadjaj":
    case "sport":
      return "#3B6D11";
    case "izložba":
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
  imagePath: event.slika_1 || event.Slika_1 || event.imagePath || null,
  coverImg: absoluteImgSrc(event.slika_1 || event.Slika_1 || null),
  emoji: event.Emoji || getEmojiByCategory(event.Tip_dogadjaja),
  promoted: event.Status === "promovisana",
  price: event.Cijena,
  statusRaw: event.Status,
  status: event.Status === "odobrena" || event.Status === "promovisana" ? "approved" : event.Status,
  organizer: event.Organizator || event.organizator || "",
  organizerId: event.Organizator_ID,
  votes: {
    up: event.Upvote ?? 0,
    down: event.Downvote ?? 0,
  },
});

export const fetchEvents = async () => {
  const response = await fetch(`${API_BASE_URL}/dogadjaji`);
  if (!response.ok) throw new Error("Događaji nisu dostupni");
  const data = await response.json();
  return (data || []).map(formatEvent);
};

export const fetchAdminEvents = async () => {
  const response = await fetch(`${API_BASE_URL}/dogadjaji/admin/svi`);
  if (!response.ok) throw new Error("Događaji nisu dostupni");
  const data = await response.json();
  return (data || []).map(formatEvent);
};

export const fetchOrganizerEvents = async (organizerId) => {
  if (!organizerId) return [];
  const response = await fetch(`${API_BASE_URL}/dogadjaji/organizator/${organizerId}`);
  if (!response.ok) throw new Error("Događaji organizatora nisu dostupni");
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
  if (!response.ok) throw new Error("Događaj nije dostupan");
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
    if (!legacyResponse.ok) throw new Error("Glas nije sačuvan");
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
  if (!response.ok) throw new Error("Događaj nije sačuvan");
  return formatEvent(await response.json());
};

export const updateEvent = async (eventId, event, userId) => {
  const response = await fetch(`${API_BASE_URL}/dogadjaji/${eventId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Naslov: event.title,
      Opis: event.desc,
      Datum: event.date,
      Vreme: event.time,
      Upvote: event.votes?.up ?? event.Upvote ?? 0,
      Downvote: event.votes?.down ?? event.Downvote ?? 0,
      Status: event.statusRaw || event.Status || (event.promoted ? "na_cekanju_promovisana" : "na_cekanju"),
      Grad: event.city,
      Adresa: event.address || event.location,
      Organizator_ID: event.organizerId || event.Organizator_ID || userId,
      Administrator_ID: event.Administrator_ID || null,
      Tip_dogadjaja: event.category,
      slika_1: event.imagePath || event.slika_1 || event.Slika_1 || null,
      Emoji: event.emoji,
      Cijena: Number(event.price || 0),
    }),
  });
  if (!response.ok) throw new Error("Događaj nije sačuvan");
  const data = await response.json();
  return formatEvent({
    ...event,
    ...data,
    ID: data.ID || data.id || eventId,
    Organizator_ID: data.Organizator_ID || event.organizerId || event.Organizator_ID || userId,
    slika_1: data.slika_1 || data.Slika_1 || event.imagePath || event.slika_1 || event.Slika_1 || null,
  });
};

export const uploadEventImage = async (eventId, file) => {
  if (!eventId || !file) return null;
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE_URL}/uploads/dogadjaji/${eventId}/slika`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Slika događaja nije sačuvana");
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
  if (!response.ok) throw new Error("Profilna slika nije sačuvana");
  return response.json();
};

export const approveEventRequest = async (eventId, adminId) => {
  const qs = adminId ? `?administratorID=${encodeURIComponent(adminId)}` : "";
  const response = await fetch(`${API_BASE_URL}/dogadjaji/${eventId}/odobri${qs}`, { method: "PUT" });
  if (!response.ok) throw new Error("Događaj nije odobren");
  return formatEvent(await response.json());
};

export const rejectEventRequest = async (eventId, adminId) => {
  const qs = adminId ? `?administratorID=${encodeURIComponent(adminId)}` : "";
  const response = await fetch(`${API_BASE_URL}/dogadjaji/${eventId}/odbij${qs}`, { method: "PUT" });
  if (!response.ok) throw new Error("Događaj nije odbijen");
  return formatEvent(await response.json());
};

export const requestEventPromotion = async (eventId) => {
  const response = await fetch(`${API_BASE_URL}/dogadjaji/${eventId}/zahtjev-promocija`, { method: "PUT" });
  if (!response.ok) throw new Error("Zahtjev za promociju nije sačuvan");
  return formatEvent(await response.json());
};

export const deleteEventById = async (eventId) => {
  const response = await fetch(`${API_BASE_URL}/dogadjaji/${eventId}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Događaj nije obrisan");
};

export const fetchAdminRequests = async () => {
  const response = await fetch(`${API_BASE_URL}/korisnici/organizator-zahtjevi`);
  if (!response.ok) throw new Error("Organizator zahtjevi nisu dostupni");
  return response.json();
};

export const fetchOrganizers = async () => {
  const response = await fetch(`${API_BASE_URL}/korisnici`);
  if (!response.ok) throw new Error("Organizatori nisu dostupni");
  const users = await response.json();
  return (users || []).filter((user) => (user.Tip || user.tip) === "organizator");
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
