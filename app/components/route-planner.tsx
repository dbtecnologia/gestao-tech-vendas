"use client";

import { FormEvent, useMemo, useState } from "react";

type RouteMode = "fastest" | "balanced" | "economical";

function mapsSearch(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function openExternal(url: string) {
  const popup = window.open(url, "_blank", "noopener,noreferrer");
  if (!popup) window.location.assign(url);
}

export default function RoutePlanner() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [stops, setStops] = useState("");
  const [distance, setDistance] = useState("");
  const [consumption, setConsumption] = useState("10");
  const [fuelPrice, setFuelPrice] = useState("6,19");
  const [mode, setMode] = useState<RouteMode>("balanced");
  const [planned, setPlanned] = useState(false);

  const stopList = useMemo(() => stops.split("\n").map((item) => item.trim()).filter(Boolean), [stops]);
  const distanceNumber = Number(distance.replace(",", ".")) || 0;
  const consumptionNumber = Number(consumption.replace(",", ".")) || 0;
  const priceNumber = Number(fuelPrice.replace(",", ".")) || 0;
  const liters = consumptionNumber ? distanceNumber / consumptionNumber : 0;
  const fuelCost = liters * priceNumber;
  const canPlan = Boolean(origin.trim() && destination.trim());
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&waypoints=${encodeURIComponent(stopList.join("|"))}&travelmode=driving`;
  const searchBase = destination.trim() || origin.trim();

  function planRoute(event: FormEvent) {
    event.preventDefault();
    setPlanned(true);
  }

  function openMaps() {
    if (!canPlan) {
      setPlanned(true);
      return;
    }
    openExternal(mapsUrl);
  }

  return (
    <div className="route-page">
      <div className="route-intro">
        <div>
          <span className="eyebrow">PLANEJAMENTO DE CAMPO</span>
          <h2>Rotas comerciais</h2>
          <p>Monte o trajeto, estime o custo da viagem e encontre o que precisa pelo caminho.</p>
        </div>
        <button className="secondary route-help" type="button" onClick={() => openExternal("https://www.google.com/maps")}>Abrir Google Maps ↗</button>
      </div>

      <div className="route-layout">
        <form className="panel route-form" onSubmit={planRoute}>
          <div className="panel-title-row"><div><h3>Nova rota</h3><p>Informe os pontos da viagem comercial.</p></div><span className="route-step">01</span></div>
          <div className="route-fields">
            <label>Saída<input value={origin} onChange={(event) => setOrigin(event.target.value)} placeholder="Ex.: São Paulo, SP" required /></label>
            <label>Destino<input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Ex.: Campinas, SP" required /></label>
            <label className="full-field">Paradas no caminho <span className="field-hint">uma por linha</span><textarea value={stops} onChange={(event) => setStops(event.target.value)} placeholder={"Ex.: Cliente ABC, Jundiaí\nHotel próximo ao destino"} rows={3} /></label>
          </div>
          <div className="route-divider" />
          <div className="panel-title-row route-subtitle"><div><h3>Estimativa de viagem</h3><p>Você pode ajustar os dados do seu veículo.</p></div><span className="route-step">02</span></div>
          <div className="route-fields route-numbers">
            <label>Distância estimada (km)<input inputMode="decimal" value={distance} onChange={(event) => setDistance(event.target.value)} placeholder="Ex.: 120" /></label>
            <label>Consumo do veículo (km/L)<input inputMode="decimal" value={consumption} onChange={(event) => setConsumption(event.target.value)} /></label>
            <label>Preço da gasolina (R$/L)<input inputMode="decimal" value={fuelPrice} onChange={(event) => setFuelPrice(event.target.value)} /></label>
            <label>Preferência<select value={mode} onChange={(event) => setMode(event.target.value as RouteMode)}><option value="balanced">Equilibrada</option><option value="fastest">Mais rápida</option><option value="economical">Mais econômica</option></select></label>
          </div>
          <div className="form-actions route-actions"><button className="primary" type="submit">Calcular rota</button><button className="secondary" type="button" onClick={openMaps}>Abrir no Google Maps ↗</button></div>
          {planned && !canPlan && <p className="route-error">Informe saída e destino para calcular a rota.</p>}
          <small className="route-footnote">O Google Maps calcula o trajeto e o trânsito em tempo real. O valor abaixo é uma estimativa baseada nos dados informados.</small>
        </form>

        <div className="route-results">
          <div className="panel route-summary">
            <div className="panel-title-row"><div><span className="eyebrow">RESUMO</span><h3>{canPlan ? `${origin} → ${destination}` : "Sua rota aparecerá aqui"}</h3></div><span className="route-status">{canPlan ? "Pronta para planejar" : "Aguardando dados"}</span></div>
            <div className="route-metrics"><div><span>Distância</span><strong>{distanceNumber ? `${distanceNumber.toLocaleString("pt-BR")} km` : "—"}</strong></div><div><span>Combustível</span><strong>{liters ? `${liters.toFixed(1).replace(".", ",")} L` : "—"}</strong></div><div><span>Custo estimado</span><strong>{fuelCost ? fuelCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—"}</strong></div></div>
            <div className="route-visual"><div className="route-line"><span className="route-pin start" /><span className="route-track" /><span className="route-pin end" /></div><div className="route-labels"><span>{origin || "Saída"}</span><span>{destination || "Destino"}</span></div></div>
            {stopList.length > 0 && <div className="stops-list"><strong>{stopList.length} parada(s)</strong>{stopList.map((stop, index) => <span key={`${stop}-${index}`}>{index + 1}. {stop}</span>)}</div>}
          </div>
          <div className="panel route-discover"><div className="panel-title-row"><div><h3>Explore o destino</h3><p>Atalhos para organizar a visita.</p></div><span className="route-step">03</span></div><div className="discover-grid"><a href={searchBase ? mapsSearch(`hotéis em ${searchBase}`) : "https://www.google.com/maps"} target="_self"><span className="discover-icon hotel">⌂</span><span><strong>Hotéis</strong><small>Encontrar hospedagem</small></span><b>↗</b></a><a href={searchBase ? mapsSearch(`restaurantes em ${searchBase}`) : "https://www.google.com/maps"} target="_self"><span className="discover-icon food">✦</span><span><strong>Restaurantes</strong><small>Almoçar no caminho</small></span><b>↗</b></a><a href={searchBase ? mapsSearch(`postos de gasolina em ${searchBase}`) : "https://www.google.com/maps"} target="_self"><span className="discover-icon fuel">⌁</span><span><strong>Postos</strong><small>Abastecer na rota</small></span><b>↗</b></a><a href={searchBase ? mapsSearch(`clientes e empresas em ${searchBase}`) : "https://www.google.com/maps"} target="_self"><span className="discover-icon company">◈</span><span><strong>Empresas</strong><small>Pesquisar oportunidades</small></span><b>↗</b></a></div></div>
        </div>
      </div>
      <div className="route-tip"><span>✦</span><div><strong>Dica para sua equipe</strong><p>Adicione cada cliente como uma parada. Depois abra no Google Maps para reorganizar a sequência e conferir o trânsito antes de sair.</p></div></div>
    </div>
  );
}
