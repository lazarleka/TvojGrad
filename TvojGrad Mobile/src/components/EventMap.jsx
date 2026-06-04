import { useEffect, useMemo, useRef, useState } from "react";
import { translateText } from "../i18n";
import { getEventAddress as readEventAddress } from "../api";

const LEAFLET_CSS_ID = "leaflet-css";
const LEAFLET_SCRIPT_ID = "leaflet-script";

const CITY_COORDS = {
  Podgorica: [42.4304, 19.2594],
  Bar: [42.0931, 19.1003],
  Budva: [42.2864, 18.84],
  Tivat: [42.4364, 18.6961],
  Niksic: [42.7731, 18.9445],
  "Nikšić": [42.7731, 18.9445],
  Cetinje: [42.3906, 18.9142],
  Kotor: [42.4247, 18.7712],
  "Herceg Novi": [42.4531, 18.5375],
  Ulcinj: [41.9287, 19.2064],
  Pljevlja: [43.3567, 19.3584],
  "Bijelo Polje": [43.0383, 19.7476],
  Berane: [42.8425, 19.8733],
  Rozaje: [42.8325, 20.1675],
  "Rožaje": [42.8325, 20.1675],
  Plav: [42.5969, 19.9456],
  Danilovgrad: [42.5538, 19.1461],
  Kolasin: [42.8242, 19.5225],
  "Kolašin": [42.8242, 19.5225],
  Mojkovac: [42.9604, 19.5833],
  Zabljak: [43.1556, 19.1225],
  "Žabljak": [43.1556, 19.1225],
};

const MONTENEGRO_BOUNDS = [
  [41.75, 18.35],
  [43.65, 20.55],
];

const CACHE_VERSION = "v4";
const MONTENEGRO_VIEWBOX = "18.35,43.65,20.55,41.75";

const ADDRESS_COORDS = {
  "pine|tivat": [42.4297905, 18.6955641],
  "porto montenegro|tivat": [42.4349, 18.6935],
  "gorica, podgorica|podgorica": [42.4496, 19.2608],
  "gorica|podgorica": [42.4496, 19.2608],
  "novaka miloseva bb|podgorica": [42.4403739, 19.2645851],
  "novaka miloseva|podgorica": [42.4403739, 19.2645851],
  "novaka miloševa bb|podgorica": [42.4403739, 19.2645851],
  "rimski trg|podgorica": [42.4423944, 19.2464902],
  "trg republike|podgorica": [42.4413, 19.2629],
  "trg nezavisnosti|podgorica": [42.4413, 19.2629],
  "vladimira rolovica|bar": [42.0966276, 19.0900824],
  "jovana tomasevica bb|bar": [42.0982, 19.0961],
  "jovana tomasevica|bar": [42.0982, 19.0961],
  "dom kulture|bar": [42.1002, 19.0954],
  "restoran galeb|bar": [42.0957, 19.0915],
  "vladimira rolovića|bar": [42.0966276, 19.0900824],
  "stari grad|budva": [42.2789, 18.8379],
  "trg pjesnika, stari grad|budva": [42.2779296, 18.8374703],
  "gradska biblioteka|budva": [42.2862, 18.8406],
  "msuv|podgorica": [42.4477, 19.2488],
  "montenegro business center|podgorica": [42.447458, 19.2351152],
  "hub 387|podgorica": [42.4423944, 19.2464902],
  "bulevar mihaila lalica bb|podgorica": [42.447458, 19.2351152],
  "bulevar mihaila lalica|podgorica": [42.447458, 19.2351152],
  "bulevar mihaila lalića bb|podgorica": [42.447458, 19.2351152],
  "njegosev park|podgorica": [42.4421331, 19.2591079],
  "njegošev park|podgorica": [42.4421331, 19.2591079],
};

const geocodeCache = new Map();
let leafletPromise = null;

const getEventId = (event) => event?.id || event?.ID;
const getEventTitle = (event) => event?.title || event?.Naslov || "Događaj";
const getEventCity = (event) => event?.city || event?.Grad || "";
const getEventAddress = (event) => readEventAddress(event);
const getRawEventAddress = (event) =>
  event?.Adresa ||
  event?.adresa ||
  event?.ADRESA ||
  event?.Lokacija ||
  event?.lokacija ||
  event?.location ||
  "";
const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
const hashText = (value) =>
  String(value || "").split("").reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0);

const fallbackCoordsFor = (event) => {
  const city = getEventCity(event);
  const base = CITY_COORDS[city] || CITY_COORDS[normalizeText(city)] || [42.7087, 19.3744];
  const rawAddress = normalizeText(getRawEventAddress(event));
  const normalizedCity = normalizeText(city);
  if (!rawAddress || rawAddress === normalizedCity) return base;

  const hash = Math.abs(hashText(`${rawAddress}|${normalizedCity}|${getEventTitle(event)}`));
  const angle = (hash % 360) * (Math.PI / 180);
  const radius = 0.0015 + ((hash % 500) / 100000);
  const coords = [
    base[0] + Math.sin(angle) * radius,
    base[1] + Math.cos(angle) * radius,
  ];
  return isInMontenegro(coords) ? coords : base;
};
const normalizeLookup = normalizeText;
const storageKeyFor = (query) => `mapCoords:${CACHE_VERSION}:${query}`;

const getExplicitCoords = (event) => {
  const lat = Number(event?.lat ?? event?.latitude ?? event?.Lat ?? event?.Latitude ?? event?.LAT ?? event?.Sirina);
  const lon = Number(event?.lng ?? event?.lon ?? event?.longitude ?? event?.Lng ?? event?.Lon ?? event?.Longitude ?? event?.LON ?? event?.Duzina);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < MONTENEGRO_BOUNDS[0][0] || lat > MONTENEGRO_BOUNDS[1][0]) return null;
  if (lon < MONTENEGRO_BOUNDS[0][1] || lon > MONTENEGRO_BOUNDS[1][1]) return null;
  return [lat, lon];
};

const isInMontenegro = ([lat, lon]) =>
  lat >= MONTENEGRO_BOUNDS[0][0] &&
  lat <= MONTENEGRO_BOUNDS[1][0] &&
  lon >= MONTENEGRO_BOUNDS[0][1] &&
  lon <= MONTENEGRO_BOUNDS[1][1];

const buildGeocodeQueries = (event) => {
  const city = getEventCity(event);
  const address = getRawEventAddress(event) || getEventAddress(event);
  const compactAddress = String(address || "").replace(/\bbb\b/gi, "").replace(/\s+/g, " ").trim();
  const candidates = [
    [address, city, "Montenegro"].filter(Boolean).join(", "),
    [address, city, "Crna Gora"].filter(Boolean).join(", "),
    compactAddress && compactAddress !== address ? [compactAddress, city, "Montenegro"].filter(Boolean).join(", ") : "",
    [address, "Montenegro"].filter(Boolean).join(", "),
  ];
  return [...new Set(candidates.map((item) => item.trim()).filter(Boolean))];
};

const readStoredCoords = (query) => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKeyFor(query)) || "null");
    if (Array.isArray(saved) && saved.length === 2 && saved.every(Number.isFinite)) return saved;
  } catch {
    // Ignore corrupt cache entries.
  }
  return null;
};

const saveStoredCoords = (query, coords) => {
  try {
    localStorage.setItem(storageKeyFor(query), JSON.stringify(coords));
  } catch {
    // Cache is optional.
  }
};

const loadLeaflet = () => {
  if (window.L) return Promise.resolve(window.L);
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise((resolve, reject) => {
    if (!document.getElementById(LEAFLET_CSS_ID)) {
      const link = document.createElement("link");
      link.id = LEAFLET_CSS_ID;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const existingScript = document.getElementById(LEAFLET_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.L), { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = LEAFLET_SCRIPT_ID;
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.body.appendChild(script);
  });

  return leafletPromise;
};

const geocodeEvent = async (event) => {
  const explicitCoords = getExplicitCoords(event);
  if (explicitCoords) return explicitCoords;

  const city = getEventCity(event);
  const address = getRawEventAddress(event) || getEventAddress(event);
  const fallback = fallbackCoordsFor(event);
  if (!address) return fallback;

  const knownCoords = ADDRESS_COORDS[`${normalizeLookup(address)}|${normalizeLookup(city)}`];
  if (knownCoords) return knownCoords;

  const query = buildGeocodeQueries(event).join("|");
  if (geocodeCache.has(query)) return geocodeCache.get(query);
  const stored = readStoredCoords(query);
  if (stored) {
    geocodeCache.set(query, stored);
    return stored;
  }

  try {
    for (const candidate of buildGeocodeQueries(event)) {
      const params = new URLSearchParams({
        format: "jsonv2",
        limit: "3",
        addressdetails: "1",
        countrycodes: "me",
        bounded: "1",
        viewbox: MONTENEGRO_VIEWBOX,
        q: candidate,
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
      if (!response.ok) continue;
      const data = await response.json();
      const match = (data || [])
        .map((item) => [Number(item.lat), Number(item.lon)])
        .find((coords) => Number.isFinite(coords[0]) && Number.isFinite(coords[1]) && isInMontenegro(coords));
      if (match) {
        geocodeCache.set(query, match);
        saveStoredCoords(query, match);
        return match;
      }
    }
    return fallback;
  } catch {
    return fallback;
  }
};

const spreadOverlappingPoints = (points) => {
  const groups = new Map();
  points.forEach((point) => {
    const key = point.coords.map((value) => value.toFixed(4)).join(",");
    groups.set(key, [...(groups.get(key) || []), point]);
  });

  groups.forEach((group) => {
    if (group.length < 2) return;
    const radius = 0.00006 + group.length * 0.00001;
    group.forEach((point, index) => {
      const angle = (Math.PI * 2 * index) / group.length;
      point.coords = [
        point.coords[0] + Math.sin(angle) * radius,
        point.coords[1] + Math.cos(angle) * radius,
      ];
    });
  });

  return points;
};

export default function EventMap({ events = [], event = null, title = "Mapa događaja", language = "SRB", showList = true }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const layerRef = useRef(null);
  const eventKeysRef = useRef("");
  const userFocusedRef = useRef(false);
  const [selectedId, setSelectedId] = useState(() => getEventId(event || events[0]));
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  const mapEvents = useMemo(() => (event ? [event] : events).filter(Boolean), [event, events]);
  const mapEventsKey = useMemo(
    () => mapEvents.map((item) => [
      getEventId(item) || getEventTitle(item),
      getEventCity(item),
      getRawEventAddress(item),
    ].join(":")).join("|"),
    [mapEvents]
  );
  const selected = event || mapEvents.find((item) => String(getEventId(item)) === String(selectedId)) || mapEvents[0];

  useEffect(() => {
    let cancelled = false;

    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
          center: [42.7087, 19.3744],
          zoom: 8,
          minZoom: 7,
          scrollWheelZoom: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap",
          maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;
        layerRef.current = L.layerGroup().addTo(map);
        map.fitBounds(MONTENEGRO_BOUNDS, { padding: [12, 12] });
        window.setTimeout(() => {
          if (mapRef.current !== map) return;
          map.on("dragstart zoomstart", () => {
            userFocusedRef.current = true;
          });
        }, 0);
        setMapReady(true);
      })
      .catch(() => setMapError(true));

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerRef.current = null;
        markersRef.current = {};
      }
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !layerRef.current || !window.L) return;

    let cancelled = false;
    const L = window.L;

    const renderMarkers = async () => {
      layerRef.current.clearLayers();
      markersRef.current = {};

      const icon = L.divIcon({
        className: "event-leaflet-pin",
        html: "<span></span>",
        iconSize: [30, 38],
        iconAnchor: [15, 36],
        popupAnchor: [0, -34],
      });

      const fallbackPoints = spreadOverlappingPoints(mapEvents.map((item) => ({ item, coords: fallbackCoordsFor(item) })));

      const drawPoints = (points) => {
        layerRef.current.clearLayers();
        markersRef.current = {};

        points.forEach(({ item, coords }) => {
          const id = String(getEventId(item) || getEventTitle(item));
          const address = getEventAddress(item);
          const city = getEventCity(item);
          const marker = L.marker(coords, { icon }).addTo(layerRef.current);
          marker.bindPopup(`
            <strong>${translateText(getEventTitle(item), language)}</strong>
            <div>${translateText(address || city || "Crna Gora", language)}</div>
          `);
          marker.on("click", () => {
            userFocusedRef.current = true;
            setSelectedId(getEventId(item));
          });
          markersRef.current[id] = marker;
        });
      };

      const focusSinglePoint = (points) => {
        if (showList || points.length !== 1 || !mapRef.current) return;
        const point = points[0];
        const id = String(getEventId(point.item) || getEventTitle(point.item));
        const marker = markersRef.current[id];
        mapRef.current.setView(point.coords, 16);
        if (marker) marker.openPopup();
      };

      if (cancelled) return;
      drawPoints(fallbackPoints);
      const nextEventKeys = mapEvents.map((item) => String(getEventId(item) || getEventTitle(item))).join("|");
      const shouldResetView = eventKeysRef.current !== nextEventKeys && !userFocusedRef.current;
      eventKeysRef.current = nextEventKeys;
      if (shouldResetView) {
        mapRef.current.fitBounds(MONTENEGRO_BOUNDS, { padding: [12, 12] });
      }

      window.setTimeout(async () => {
        const geocodedPoints = spreadOverlappingPoints(await Promise.all(mapEvents.map(async (item) => ({
          item,
          coords: await geocodeEvent(item),
        }))));
        if (!cancelled) {
          drawPoints(geocodedPoints);
          focusSinglePoint(geocodedPoints);
          const activeId = String(selectedId || "");
          const activeMarker = markersRef.current[activeId];
          if (userFocusedRef.current && activeMarker && mapRef.current) {
            mapRef.current.setView(activeMarker.getLatLng(), 15, { animate: false });
            activeMarker.openPopup();
          }
        }
      }, 250);
    };

    renderMarkers();
    return () => {
      cancelled = true;
    };
  }, [mapReady, mapEventsKey, language, showList]);

  const focusEvent = async (item) => {
    const id = String(getEventId(item) || getEventTitle(item));
    userFocusedRef.current = true;
    setSelectedId(getEventId(item));
    const marker = markersRef.current[id];
    if (marker && mapRef.current) {
      mapRef.current.flyTo(marker.getLatLng(), 15, { duration: 0.7 });
      marker.openPopup();
      return;
    }

    if (mapRef.current) {
      const coords = await geocodeEvent(item);
      if (!mapRef.current) return;
      mapRef.current.flyTo(coords, 15, { duration: 0.7 });
    }
  };

  if (!mapEvents.length) return null;

  return (
    <section className="event-map-section">
      <div className="section-header">
        <span className="section-title">{title}</span>
        <span className="section-sub">{mapEvents.length === 1 ? "1 lokacija" : `${mapEvents.length} lokacija`}</span>
      </div>
      <div className={`event-map-layout${showList ? "" : " map-only"}`}>
        <div className="event-map-frame">
          <div ref={containerRef} className="event-map-canvas" />
          {!mapReady && !mapError ? <div className="event-map-loading">Učitavanje mape...</div> : null}
          {mapError ? <div className="event-map-loading">Mapa trenutno nije dostupna.</div> : null}
        </div>
        {showList && <div className="event-map-list">
          {mapEvents.map((item) => {
            const id = getEventId(item);
            const active = String(id) === String(getEventId(selected));
            const city = getEventCity(item);
            const address = getEventAddress(item);
            return (
              <button
                key={id || getEventTitle(item)}
                className={`event-map-item${active ? " active" : ""}`}
                onClick={() => focusEvent(item)}
                type="button"
              >
                <span className="event-map-name">{translateText(getEventTitle(item), language)}</span>
                <span className="event-map-address">{address ? translateText(address, language) : translateText("Lokacija nije unesena", language)}</span>
                {city ? <span className="event-map-city">{translateText(city, language)}</span> : null}
              </button>
            );
          })}
        </div>}
      </div>
    </section>
  );
}
