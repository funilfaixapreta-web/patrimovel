import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const RIO: [number, number] = [-22.9711, -43.1822];

const icone = L.divIcon({
  className: "",
  iconSize: [34, 44],
  iconAnchor: [17, 43],
  html: `<svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg"><path d="M17 43s15-14.2 15-26A15 15 0 0 0 2 17c0 11.8 15 26 15 26Z" fill="#cb2306" stroke="#fff" stroke-width="2"/><circle cx="17" cy="17" r="5.5" fill="#fff"/></svg>`,
});

/** Mapa com pino arrastável (Leaflet + OpenStreetMap). */
export default function MapaPino({ lat, lng, aoMover }: { lat: number | null; lng: number | null; aoMover: (lat: number, lng: number) => void }) {
  const caixa = useRef<HTMLDivElement>(null);
  const mapa = useRef<L.Map | null>(null);
  const pino = useRef<L.Marker | null>(null);
  const callback = useRef(aoMover);
  callback.current = aoMover;

  useEffect(() => {
    if (!caixa.current || mapa.current) return;
    const inicio: [number, number] = lat !== null && lng !== null ? [lat, lng] : RIO;
    const m = L.map(caixa.current, { scrollWheelZoom: false }).setView(inicio, lat !== null ? 17 : 12);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(m);
    const p = L.marker(inicio, { draggable: true, icon: icone, keyboard: true, title: "Posição do imóvel" }).addTo(m);
    p.on("dragend", () => {
      const pos = p.getLatLng();
      callback.current(pos.lat, pos.lng);
    });
    m.on("click", (e: L.LeafletMouseEvent) => {
      p.setLatLng(e.latlng);
      callback.current(e.latlng.lat, e.latlng.lng);
    });
    mapa.current = m;
    pino.current = p;
    return () => {
      m.remove();
      mapa.current = null;
      pino.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (lat === null || lng === null || !mapa.current || !pino.current) return;
    const atual = pino.current.getLatLng();
    if (Math.abs(atual.lat - lat) < 1e-7 && Math.abs(atual.lng - lng) < 1e-7) return;
    pino.current.setLatLng([lat, lng]);
    mapa.current.setView([lat, lng], 17);
  }, [lat, lng]);

  return <div ref={caixa} className="relative z-0 h-[320px] w-full overflow-hidden rounded-2xl border border-sand-200 md:h-[380px]" aria-label="Mapa: arraste o pino até o imóvel" />;
}
