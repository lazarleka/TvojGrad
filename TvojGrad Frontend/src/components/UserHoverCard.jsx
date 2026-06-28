import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { API_BASE_URL, absoluteImgSrc, getUserId } from "../api";

export default function UserHoverCard({ user, children }) {
  const userId = getUserId(user);
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(user || null);
  const [loadedId, setLoadedId] = useState(null);
  const [position, setPosition] = useState({ left: 8, top: 8 });
  const anchorRef = useRef(null);

  const show = async () => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (rect) {
      const cardWidth = Math.min(290, window.innerWidth - 16);
      const estimatedHeight = 310;
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - cardWidth - 8));
      const top = window.innerHeight - rect.bottom >= estimatedHeight + 8
        ? rect.bottom + 8
        : Math.max(8, rect.top - estimatedHeight - 8);
      setPosition({ left, top });
    }
    setOpen(true);
    if (!userId || String(loadedId) === String(userId)) return;
    try {
      const response = await fetch(`${API_BASE_URL}/korisnici/${userId}`);
      if (response.ok) setDetails(await response.json());
    } catch {
      // Osnovni podaci koji su već učitani ostaju vidljivi.
    } finally {
      setLoadedId(userId);
    }
  };

  const profile = details || user || {};
  const name = `${profile.Ime || profile.ime || ""} ${profile.Prezime || profile.prezime || ""}`.trim() || profile.Email || "Korisnik";
  const about = profile.O_meni || profile.oMeni || profile.o_meni || "Korisnik još nije dodao opis o sebi.";
  const city = profile.Grad || profile.grad || "";
  const interests = String(profile.Interesovanja || profile.interesovanja || "").split(",").map((item) => item.trim()).filter(Boolean);
  const dislikes = String(profile.Neinteresovanja || profile.neinteresovanja || "").split(",").map((item) => item.trim()).filter(Boolean);
  const image = absoluteImgSrc(profile.Profilna || profile.profilna);

  return (
    <span
      ref={anchorRef}
      style={{ display: "inline-block" }}
      onMouseEnter={show}
      onMouseLeave={() => setOpen(false)}
      onFocus={show}
      onBlur={() => setOpen(false)}
    >
      <button type="button" onClick={() => open ? setOpen(false) : show()} style={{ all: "unset", color: "inherit", font: "inherit", fontWeight: "inherit", cursor: "pointer", textDecoration: "underline dotted", textUnderlineOffset: 3 }}>
        {children}
      </button>
      {open && createPortal(
        <span style={{ position: "fixed", left: position.left, top: position.top, zIndex: 10000, width: 290, maxWidth: "calc(100vw - 16px)", padding: 14, boxSizing: "border-box", border: "1px solid #cfe1da", borderRadius: 14, background: "#fff", boxShadow: "0 12px 35px rgba(16, 66, 50, 0.18)", color: "#173f33", textAlign: "left", whiteSpace: "normal", pointerEvents: "none" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 42, height: 42, flexShrink: 0, borderRadius: "50%", overflow: "hidden", background: "#e8f5f0", display: "grid", placeItems: "center", fontWeight: 800 }}>
              {image ? <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : name.slice(0, 1).toUpperCase()}
            </span>
            <span><strong style={{ display: "block" }}>{name}</strong>{city && <small style={{ color: "#667d75" }}>{city}</small>}</span>
          </span>
          <span style={{ display: "block", marginTop: 11, fontSize: 13, lineHeight: 1.5, color: "#526a62" }}>{about}</span>
          <span style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 11 }}>
            {interests.length ? interests.map((interest) => <span key={interest} style={{ padding: "5px 9px", borderRadius: 14, background: "#e9f8f2", color: "#16784f", fontSize: 11, fontWeight: 700 }}>{interest}</span>) : <small style={{ color: "#81928c" }}>Nema dodatih interesovanja.</small>}
          </span>
          {dislikes.length > 0 && <>
            <small style={{ display: "block", marginTop: 12, color: "#81928c", fontWeight: 700 }}>Ne voli</small>
            <span style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
              {dislikes.map((item) => <span key={item} style={{ padding: "5px 9px", borderRadius: 14, background: "#fff0ee", color: "#a34a3f", fontSize: 11, fontWeight: 700 }}>{item}</span>)}
            </span>
          </>}
        </span>, document.body
      )}
    </span>
  );
}
