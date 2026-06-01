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

const ADDRESS_COORDS = {
  "pine|tivat": [42.4297905, 18.6955641],
  "gorica, podgorica|podgorica": [42.4496, 19.2608],
  "novaka miloseva bb|podgorica": [42.4403739, 19.2645851],
  "novaka miloševa bb|podgorica": [42.4403739, 19.2645851],
  "rimski trg|podgorica": [42.4423944, 19.2464902],
  "vladimira rolovica|bar": [42.0966276, 19.0900824],
  "vladimira rolovića|bar": [42.0966276, 19.0900824],
  "trg pjesnika, stari grad|budva": [42.2779296, 18.8374703],
  "bulevar mihaila lalica bb|podgorica": [42.447458, 19.2351152],
  "bulevar mihaila lalića bb|podgorica": [42.447458, 19.2351152],
  "njegosev park|podgorica": [42.4421331, 19.2591079],
  "njegošev park|podgorica": [42.4421331, 19.2591079],
};

const geocodeCache = new Map();
let leafletPromise = null;

const getEventId = (event) => event?.id || event?.ID;
const getEventTitle = (event) => event?.title || event?.Naslov || "Dogadjaj";
const getEventCity = (event) => event?.city || event?.Grad || "";
const getEventAddress = (event) => readEventAddress(event);
const fallbackCoordsFor = (event) => CITY_COORDS[getEventCity(event)] || [42.7087, 19.3744];
const normalizeLookup = (value) => String(value || "").trim().toLowerCase();
const storageKeyFor = (query) => `mapCoords:${query}`;

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
  const city = getEventCity(event);
  const address = getEventAddress(event);
  const fallback = fallbackCoordsFor(event);
  if (!address) return fallback;

  const knownCoords = ADDRESS_COORDS[`${normalizeLookup(address)}|${normalizeLookup(city)}`];
  if (knownCoords) return knownCoords;

  const query = [address, city, "Montenegro"].filter(Boolean).join(", ");
  if (geocodeCache.has(query)) return geocodeCache.get(query);
  const stored = readStoredCoords(query);
  if (stored) {
    geocodeCache.set(query, stored);
    return stored;
  }

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`);
    if (!response.ok) return fallback;
    const data = await response.json();
    const first = data?.[0];
    if (!first) return fallback;
    const coords = [Number(first.lat), Number(first.lon)];
    if (!Number.isFinite(coords[0]) || !Number.isFinite(coords[1])) return fallback;
    geocodeCache.set(query, coords);
    saveStoredCoords(query, coords);
    return coords;
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
    const radius = 0.0028 + group.length * 0.00035;
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

export default function EventMap({ events = [], event = null, title = "Mapa dogadjaja", language = "SRB", showList = true }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const layerRef = useRef(null);
  const [selectedId, setSelectedId] = useState(() => getEventId(event || events[0]));
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  const mapEvents = useMemo(() => (event ? [event] : events).filter(Boolean), [event, events]);
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
          marker.on("click", () => setSelectedId(getEventId(item)));
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
      mapRef.current.fitBounds(MONTENEGRO_BOUNDS, { padding: [12, 12] });

      window.setTimeout(async () => {
        const geocodedPoints = spreadOverlappingPoints(await Promise.all(mapEvents.map(async (item) => ({
          item,
          coords: await geocodeEvent(item),
        }))));
        if (!cancelled) {
          drawPoints(geocodedPoints);
          focusSinglePoint(geocodedPoints);
        }
      }, 250);
    };

    renderMarkers();
    return () => {
      cancelled = true;
    };
  }, [mapReady, mapEvents, language]);

  const focusEvent = (item) => {
    const id = String(getEventId(item) || getEventTitle(item));
    setSelectedId(getEventId(item));
    const marker = markersRef.current[id];
    if (marker && mapRef.current) {
      mapRef.current.flyTo(marker.getLatLng(), 15, { duration: 0.7 });
      marker.openPopup();
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
          {!mapReady && !mapError ? <div className="event-map-loading">Ucitavanje mape...</div> : null}
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
