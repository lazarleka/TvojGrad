import { useRef } from 'react';
import { G } from '../constants';

export default function ImageUpload({ current, onUpload, label = "Dodaj sliku" }) {
  const ref = useRef();
  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onUpload(e.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div>
      {current ? (
        <div style={{ position: "relative", marginBottom: 8 }}>
          <img src={current} alt="preview" className="img-upload-preview" />
          <button onClick={() => onUpload(null)}
            style={{ position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.6)",color:"#fff",border:"none",borderRadius:8,padding:"4px 10px",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>
            Ukloni
          </button>
        </div>
      ) : null}
      <div className="img-upload-zone" onClick={() => ref.current?.click()}
        onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("dragover"); }}
        onDragLeave={e => e.currentTarget.classList.remove("dragover")}
        onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove("dragover"); handleFile(e.dataTransfer.files[0]); }}>
        <input ref={ref} type="file" accept="image/*" style={{ display:"none" }}
          onChange={e => handleFile(e.target.files[0])} />
        <div style={{ fontSize:28, marginBottom:8 }}>📷</div>
        <div style={{ fontSize:14, fontWeight:500, color:G.ink }}>{current ? "Zamijeni sliku" : label}</div>
        <div style={{ fontSize:12, color:G.muted, marginTop:4 }}>Klikni ili prevuci sliku ovdje</div>
      </div>
    </div>
  );
}
