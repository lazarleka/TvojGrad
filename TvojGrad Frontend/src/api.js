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

export const formatEvent = (event) => ({
  ...event,
  id: event.ID,
  title: event.Naslov,
  description: event.Opis,
  desc: event.Opis,
  date: event.Datum,
  time: event.Vreme,
  city: event.Grad,
  category: event.Tip_dogadjaja,
  coverColor: getColorByCategory(event.Tip_dogadjaja),
  coverImg: event.slika_1 || null,
  emoji: event.slika_1 ? null : (event.Emoji || getEmojiByCategory(event.Tip_dogadjaja)),
  promoted: event.Status === "promovisana",
  price: event.Cijena,
  status: event.Status === "odobrena" || event.Status === "promovisana" ? "approved" : event.Status,
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
    return formatEvent(await legacyResponse.json());
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
