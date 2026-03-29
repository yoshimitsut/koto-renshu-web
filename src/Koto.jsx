import { useRef, useState, useCallback } from "react";

const CORDAS = [
  { id: 13, nota: "Bb", arquivo: "/sounds/linha_13.mp3" },
  { id: 12, nota: "Eb", arquivo: "/sounds/linha_12.mp3" },
  { id: 11, nota: "F",  arquivo: "/sounds/linha_6.mp3" },
  { id: 10, nota: "F#", arquivo: "/sounds/linha_6.mp3" },
  { id: 9,  nota: "Bb", arquivo: "/sounds/linha_6.mp3" },
  { id: 8,  nota: "B",  arquivo: "/sounds/linha_6.mp3" },
  { id: 7,  nota: "Eb", arquivo: "/sounds/linha_6.mp3" },
  { id: 6,  nota: "F",  arquivo: "/sounds/linha_6.mp3" },
  { id: 5,  nota: "F#", arquivo: "/sounds/linha_5.mp3" },
  { id: 4,  nota: "Bb", arquivo: "/sounds/linha_4.mp3" },
  { id: 3,  nota: "B",  arquivo: "/sounds/linha_3.mp3" },
  { id: 2,  nota: "Eb", arquivo: "/sounds/linha_2.mp3" },
  { id: 1,  nota: "F",  arquivo: "/sounds/linha_1.mp3" },
];

export default function Koto() {
  const [active, setActive] = useState(null);
  const [ripples, setRipples] = useState({});
  const lastTouched = useRef(null);
  const stringRefs = useRef([]);

  const tocarCorda = useCallback((corda) => {
    if (lastTouched.current === corda.id) return;
    lastTouched.current = corda.id;

    setActive(corda.id);
    setRipples(r => ({ ...r, [corda.id]: Date.now() }));
    setTimeout(() => setActive(a => a === corda.id ? null : a), 300);

    // new Audio() a cada toque permite sobreposição de sons
    const audio = new Audio(corda.arquivo);
    audio.volume = 1;
    audio.play().catch(err => console.warn("Erro ao tocar:", err));
  }, []);

  const detectarCordaPorY = useCallback((clientY) => {
    stringRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      if (Math.abs(clientY - center) < rect.height * 0.9) {
        tocarCorda(CORDAS[i]);
      }
    });
  }, [tocarCorda]);

  const handleMouseDown  = (e) => { lastTouched.current = null; detectarCordaPorY(e.clientY); };
  const handleMouseMove  = (e) => { if (e.buttons !== 1) return; detectarCordaPorY(e.clientY); };
  const handleMouseUp    = ()  => { lastTouched.current = null; };
  const handleTouchStart = (e) => { e.preventDefault(); lastTouched.current = null; detectarCordaPorY(e.touches[0].clientY); };
  const handleTouchMove  = (e) => { e.preventDefault(); detectarCordaPorY(e.touches[0].clientY); };
  const handleTouchEnd   = ()  => { lastTouched.current = null; };

  return (
    <div style={styles.page}>
      <style>{css}</style>

      <header style={styles.header}>
        <div style={styles.kanjiBg}>琴</div>
        <h1 style={styles.title}>KOTO</h1>
        <p style={styles.subtitle}>Clique e arraste pelas cordas</p>
      </header>

      <div
        style={styles.body}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div style={styles.grain} />
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ ...styles.woodGrain, top: `${10 + i * 12}%` }} />
        ))}
        <div style={styles.bridgeLeft} />
        <div style={styles.bridgeRight} />

        <div style={styles.stringsArea}>
          {CORDAS.map((corda, i) => {
            const isActive = active === corda.id;
            const rippleKey = ripples[corda.id];
            return (
              <div key={corda.id} style={styles.stringRow} ref={el => stringRefs.current[i] = el}>
                <span style={styles.label}>{corda.id}</span>
                <div style={styles.stringTrack}>
                  <div style={{ ...styles.stringShadow, opacity: isActive ? 0.6 : 0.2 }} />
                  <div style={{
                    ...styles.string,
                    backgroundColor: isActive ? "#ffe49a" : getStringColor(i),
                    boxShadow: isActive
                      ? "0 0 12px 3px #f5c84288, 0 0 30px 8px #f5c84222"
                      : "0 1px 2px rgba(0,0,0,0.5)",
                    height: getStringThickness(i),
                    transform: isActive ? "scaleY(2.5)" : "scaleY(1)",
                    transition: "transform 0.12s, background-color 0.15s, box-shadow 0.15s",
                  }} />
                  {rippleKey && <div key={rippleKey} style={styles.ripple} className="string-ripple" />}
                  <div style={styles.ji} />
                </div>
                <span style={styles.nota}>{corda.nota}</span>
              </div>
            );
          })}
        </div>
      </div>

      <footer style={styles.footer}>
        <div style={styles.footerDot} />
        <span style={styles.footerText}>13弦 · Treze Cordas</span>
        <div style={styles.footerDot} />
      </footer>
    </div>
  );
}

function getStringColor(i) {
  return ["#c8902a","#bf8424","#b5791e","#c8902a","#d4a035","#c8902a","#bf8424","#b5791e","#c8902a","#d4a035","#c8902a","#bf8424","#b5791e"][i] || "#c8902a";
}
function getStringThickness(i) {
  return `${[5,4.5,4,4,3.5,3.5,3,3,2.5,2.5,2,2,1.5][i] || 2}px`;
}

const styles = {
  page: { minHeight:"100vh", background:"radial-gradient(ellipse at 30% 20%, #2a0e00 0%, #0f0500 60%, #000 100%)", display:"flex", flexDirection:"column", alignItems:"center", fontFamily:"'Georgia', serif", userSelect:"none", WebkitUserSelect:"none", overflow:"hidden" },
  header: { textAlign:"center", padding:"40px 0 24px", position:"relative" },
  kanjiBg: { position:"absolute", top:"50%", left:"50%", transform:"translate(-50%, -50%)", fontSize:"120px", color:"rgba(245,200,66,0.04)", fontWeight:"bold", pointerEvents:"none", lineHeight:1 },
  title: { fontSize:"clamp(28px, 5vw, 48px)", color:"#f5c842", fontWeight:"normal", letterSpacing:"0.4em", margin:0, textShadow:"0 0 40px rgba(245,200,66,0.4)" },
  subtitle: { color:"#7a5a30", fontSize:"13px", letterSpacing:"0.2em", margin:"8px 0 0", textTransform:"uppercase" },
  body: { position:"relative", width:"min(92vw, 720px)", flex:1, background:"linear-gradient(160deg, #3d1f08 0%, #2c1505 50%, #3a1c07 100%)", borderRadius:"20px", border:"2px solid #5a2e0e", boxShadow:"0 0 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,200,80,0.08)", cursor:"crosshair", overflow:"hidden", marginBottom:"16px", touchAction:"none" },
  grain: { position:"absolute", inset:0, backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`, pointerEvents:"none", zIndex:10, borderRadius:"18px" },
  woodGrain: { position:"absolute", left:0, right:0, height:"1px", background:"linear-gradient(90deg, transparent, rgba(180,100,20,0.15) 20%, rgba(180,100,20,0.15) 80%, transparent)", pointerEvents:"none" },
  bridgeLeft: { position:"absolute", left:"60px", top:"5%", bottom:"5%", width:"6px", background:"linear-gradient(180deg, #8b5e2a, #5a3510, #8b5e2a)", borderRadius:"3px", boxShadow:"2px 0 8px rgba(0,0,0,0.5)", zIndex:5 },
  bridgeRight: { position:"absolute", right:"60px", top:"5%", bottom:"5%", width:"6px", background:"linear-gradient(180deg, #8b5e2a, #5a3510, #8b5e2a)", borderRadius:"3px", boxShadow:"-2px 0 8px rgba(0,0,0,0.5)", zIndex:5 },
  stringsArea: { display:"flex", flexDirection:"column", gap:"clamp(10px, 2vh, 22px)", padding:"clamp(16px, 3vh, 32px) 16px" },
  stringRow: { display:"flex", alignItems:"center", gap:"12px", position:"relative", zIndex:2 },
  label: { color:"#f5c842", fontSize:"12px", width:"22px", textAlign:"right", fontWeight:"bold", opacity:0.7, flexShrink:0 },
  stringTrack: { flex:1, position:"relative", height:"20px", display:"flex", alignItems:"center" },
  stringShadow: { position:"absolute", left:0, right:0, height:"2px", bottom:"6px", background:"rgba(0,0,0,0.6)", filter:"blur(3px)", pointerEvents:"none", transition:"opacity 0.15s" },
  string: { position:"absolute", left:0, right:0, borderRadius:"2px", transformOrigin:"center", pointerEvents:"none", zIndex:2 },
  ripple: { position:"absolute", left:"50%", top:"50%", transform:"translate(-50%, -50%)", width:"4px", height:"4px", borderRadius:"50%", background:"rgba(245,200,66,0.6)", pointerEvents:"none", zIndex:3 },
  ji: { position:"absolute", right:"30%", width:"8px", height:"16px", background:"linear-gradient(180deg, #d4a035, #8b5e2a)", borderRadius:"1px 1px 3px 3px", bottom:"2px", boxShadow:"1px 1px 4px rgba(0,0,0,0.6)", zIndex:4 },
  nota: { color:"#f5c842", fontSize:"11px", width:"28px", textAlign:"left", fontWeight:"bold", opacity:0.7, flexShrink:0 },
  footer: { display:"flex", alignItems:"center", gap:"12px", paddingBottom:"24px" },
  footerDot: { width:"4px", height:"4px", borderRadius:"50%", background:"#5a3510" },
  footerText: { color:"#5a3510", fontSize:"11px", letterSpacing:"0.3em", textTransform:"uppercase" },
};

const css = `
  @keyframes string-ripple {
    0%   { width: 4px; height: 4px; opacity: 0.8; }
    100% { width: 200px; height: 200px; opacity: 0; }
  }
  .string-ripple { animation: string-ripple 0.6s ease-out forwards; }
  * { box-sizing: border-box; }
  body { margin: 0; }
`;