export const DICTIONARY = {
  SRB: {
    events: "Događaji",
    popular: "Popularno",
    favorites: "Omiljeni",
    profile: "Profil",
    myEvents: "Moji događaji",
    admin: "Admin",
    logout: "Odjava",
    login: "Prijava",
    heroTitleA: "Tvoj grad,",
    heroTitleB: "tvoja dešavanja",
    heroSub: "Svi događaji na jednom mjestu. Pronađi, prati i pođi zajedno!",
    searchEvents: "Pretraži događaje...",
    date: "Datum",
    promoted: "Promovisano",
    allEvents: "Svi događaji",
    noEvents: "Nema događaja koji odgovaraju filterima.",
    eventsOnMap: "Događaji na mapi",
    eventLocation: "Lokacija događaja",
    aboutEvent: "O događaju",
    psm: "Pođi sa mnom",
    details: "Detalji",
    yourReaction: "Tvoja reakcija",
    backToEvents: "Nazad na događaje",
    psmApplications: "Pođi sa mnom zahtjevi",
    archive: "Arhiviraj",
    reopen: "Ponovo otvori",
    cancel: "Otkaži",
    organizer: "Organizator",
    free: "Besplatno",
    dateUnavailable: "Datum nije dostupan",
    liked: "Sviđa ti se",
    disliked: "Ne sviđa ti se",
    loadingPopular: "Učitavanje popularnih događaja...",
    mostPopular: "Najpopularniji događaji",
    sortedByVotes: "Sortirano prema glasovima korisnika",
    myFavorites: "Moji omiljeni",
    savedEvents: "sačuvanih događaja",
    loginForFavorites: "Prijavite se da biste vidjeli omiljene događaje.",
    loadingFavorites: "Učitavanje omiljenih događaja...",
    noFavorites: "Niste sačuvali nijedan omiljeni događaj.",
    eventCount: "događaja",
  },
  ENG: {
    events: "Events",
    popular: "Popular",
    favorites: "Favorites",
    profile: "Profile",
    myEvents: "My events",
    admin: "Admin",
    logout: "Log out",
    login: "Log in",
    heroTitleA: "Your city,",
    heroTitleB: "your events",
    heroSub: "All events in one place. Find, follow, and go together!",
    searchEvents: "Search events...",
    date: "Date",
    promoted: "Promoted",
    allEvents: "All events",
    noEvents: "No events match the filters.",
    eventsOnMap: "Events on map",
    eventLocation: "Event location",
    aboutEvent: "About event",
    psm: "Go with me",
    details: "Details",
    yourReaction: "Your reaction",
    backToEvents: "Back to events",
    psmApplications: "Go with me requests",
    archive: "Archive",
    reopen: "Reopen",
    cancel: "Cancel",
    organizer: "Organizer",
    free: "Free",
    dateUnavailable: "Date unavailable",
    liked: "You like this",
    disliked: "You dislike this",
    loadingPopular: "Loading popular events...",
    mostPopular: "Most popular events",
    sortedByVotes: "Sorted by user votes",
    myFavorites: "My favorites",
    savedEvents: "saved events",
    loginForFavorites: "Log in to view your favorite events.",
    loadingFavorites: "Loading favorite events...",
    noFavorites: "You have not saved any favorite events.",
    eventCount: "events",
  },
};

export const makeT = (language) => (key) => DICTIONARY[language]?.[key] || DICTIONARY.SRB[key] || key;

export const normalizeSerbianText = (value) => {
  if (value == null) return value;
  return String(value)
    .replace(/\bNiksic\b/g, "Nikšić")
    .replace(/\bRozaje\b/g, "Rožaje")
    .replace(/\bKolasin\b/g, "Kolašin")
    .replace(/\bZabljak\b/g, "Žabljak")
    .replace(/Dogadj/g, "Događ")
    .replace(/dogadj/g, "događ")
    .replace(/Podji/g, "Pođi")
    .replace(/podji/g, "pođi")
    .replace(/Svidja/g, "Sviđa")
    .replace(/svidja/g, "sviđa")
    .replace(/Ceka/g, "Čeka")
    .replace(/ceka/g, "čeka")
    .replace(/Ucit/g, "Učit")
    .replace(/ucit/g, "učit")
    .replace(/Sacuv/g, "Sačuv")
    .replace(/sacuv/g, "sačuv")
    .replace(/Traz/g, "Traž")
    .replace(/traz/g, "traž")
    .replace(/Drust/g, "Društ")
    .replace(/drust/g, "društ")
    .replace(/Posalji/g, "Pošalji")
    .replace(/posalji/g, "pošalji")
    .replace(/Izloz/g, "Izlož")
    .replace(/izloz/g, "izlož")
    .replace(/Pozorist/g, "Pozorišt")
    .replace(/pozorist/g, "pozorišt")
    .replace(/Dj/g, "Đ")
    .replace(/dj/g, "đ");
};

const TEXT_TRANSLATIONS = {
  ENG: {
    "Sve": "All",
    "Muzika": "Music",
    "Sport": "Sports",
    "Kultura": "Culture",
    "Edukacija": "Education",
    "Zabava": "Entertainment",
    "Koncert": "Concert",
    "Festival": "Festival",
    "Sportski događaj": "Sports event",
    "Izložba": "Exhibition",
    "Pozorište": "Theater",
    "Humanitarna akcija": "Charity event",
    "Sajam": "Fair",
    "Proslava": "Celebration",
    "Svi gradovi": "All cities",
    "odobrena": "Approved",
    "promovisana": "Promoted",
    "na_cekanju": "Pending",
    "na čekanju": "Pending",
    "na_cekanju_promovisana": "Pending promotion",
    "odbijena": "Rejected",
    "Otvoren": "Open",
    "otvoren": "Open",
    "Zatvoren": "Closed",
    "zatvoren": "Closed",
    "Otkazan": "Canceled",
    "otkazan": "Canceled",
    "Lokacija nije unesena": "Location not entered",
    "Crna Gora": "Montenegro",
    "Događaj": "Event",
    "Događaji": "Events",
    "Koncert u parku": "Concert in the Park",
    "Jazz večer u Tivtu": "Jazz Evening in Tivat",
    "Maraton zdrave hrane": "Healthy Food Marathon",
    "Izložba savremene umjetnosti": "Contemporary Art Exhibition",
    "Tech Meetup Podgorica": "Tech Meetup Podgorica",
    "Stand-up komedija veče": "Stand-up Comedy Night",
    "Književna večer": "Literary Evening",
    "Večer flamenka": "Flamenco Night",
    "Startup vikend": "Startup Weekend",
    "Ljetnji koncert": "Summer Concert",
    "Opustite se uz živi jazz program na otvorenom. Nastupaju lokalni i gostujući muzičari u čarobnom ambijentu marine.": "Relax with a live outdoor jazz program. Local and guest musicians perform in the magical marina atmosphere.",
    "Pridružite se trčanju za zdravlje i upoznajte fitnes zajednicu Podgorice.": "Join a health run and meet Podgorica's fitness community.",
    "Grupna izložba mladih crnogorskih umjetnika. Djela koja istražuju identitet, prirodu i urbani prostor.": "A group exhibition of young Montenegrin artists exploring identity, nature, and urban space.",
    "Predavanja o AI, startap ekosistemu i karijerama u tehnologiji. Networking sa programerima i preduzetnicima.": "Talks about AI, the startup ecosystem, and tech careers. Networking with developers and entrepreneurs.",
    "Smijte se do suza uz nastupe vodećih stand-up komičara regiona.": "Laugh out loud with performances by leading stand-up comedians from the region.",
    "Čitanje ulomaka iz novih romana crnogorskih autora uz razgovor i potpisivanje knjiga.": "Readings from new novels by Montenegrin authors, followed by discussion and book signing.",
    "Strastveni plesači i gitaristi iz Španije donose autentični flamenco na pozornicu Budve.": "Passionate dancers and guitarists from Spain bring authentic flamenco to Budva.",
    "48 sati intenzivnog rada na startup idejama uz mentorstvo iskusnih preduzetnika.": "48 hours of intensive work on startup ideas with mentorship from experienced entrepreneurs.",
    "Pine": "Pine promenade",
    "Gorica, Podgorica": "Gorica Hill, Podgorica",
    "Novaka Miloševa bb": "Novaka Miloseva bb",
    "Rimski trg": "Roman Square",
    "Vladimira Rolovića": "Vladimira Rolovica Street",
    "Trg pjesnika, Stari grad": "Poets' Square, Old Town",
    "Bulevar Mihaila Lalića bb": "Mihaila Lalica Boulevard bb",
    "Njegošev park": "Njegos Park",
    "Podgorica": "Podgorica",
    "Bar": "Bar",
    "Budva": "Budva",
    "Tivat": "Tivat",
    "Nikšić": "Niksic",
  },
};

const ENGLISH_WORD_REPLACEMENTS = [
  ["savremene umjetnosti", "contemporary art"],
  ["zdrave hrane", "healthy food"],
  ["književna večer", "literary evening"],
  ["veče", "night"],
  ["večer", "evening"],
  ["izložba", "exhibition"],
  ["koncert", "concert"],
  ["komedija", "comedy"],
  ["događaj", "event"],
  ["događaji", "events"],
  ["muzika", "music"],
  ["sport", "sports"],
  ["kultura", "culture"],
  ["edukacija", "education"],
  ["zabava", "entertainment"],
  ["maraton", "marathon"],
  ["startup", "startup"],
  ["vikend", "weekend"],
  ["ljetnji", "summer"],
  ["sajam", "fair"],
  ["proslava", "celebration"],
  ["humanitarna akcija", "charity event"],
  ["u parku", "in the park"],
  ["u", "in"],
];

const titleCase = (value) => value.replace(/\S+/g, (word) => (
  word.length <= 2 ? word : word.charAt(0).toUpperCase() + word.slice(1)
));

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const translateLooseToEnglish = (value) => {
  let result = normalizeSerbianText(value);
  for (const [source, target] of ENGLISH_WORD_REPLACEMENTS) {
    if (source.length <= 2) {
      result = result.replace(new RegExp(`(^|\\s)${escapeRegExp(source)}(?=\\s|$)`, "gi"), (match, prefix = "") => `${prefix}${target}`);
    } else {
      result = result.replace(new RegExp(escapeRegExp(source), "gi"), target);
    }
  }
  result = result.replace(/Događaj\s*#?(\d+)/gi, "Event #$1");
  return titleCase(result);
};

export const translateText = (value, language) => {
  if (value == null) return value;
  if (language === "SRB") return normalizeSerbianText(value);
  const text = normalizeSerbianText(value);
  return TEXT_TRANSLATIONS[language]?.[text] || translateLooseToEnglish(text);
};

export const dateLocale = (language) => (language === "ENG" ? "en-US" : "sr-Latn");
