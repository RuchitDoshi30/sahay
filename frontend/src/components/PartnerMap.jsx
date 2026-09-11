import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./PartnerLocator.css";

const DEFAULT_CENTER = { latitude: 22.3039, longitude: 70.8022 };

const FILTERS = [
  { id: "all", label: "All partners", icon: "grid" },
  { id: "micro", label: "Micro Finance", icon: "wallet" },
  { id: "term", label: "Term Loan", icon: "briefcase" },
  { id: "education", label: "Education", icon: "education" },
  { id: "bank", label: "Banks", icon: "bank" },
];

const SORT_OPTIONS = [
  { value: "nearest", label: "Nearest first" },
  { value: "match", label: "Best match" },
  { value: "name", label: "Name A–Z" },
];

function Icon({ name, size = 18, strokeWidth = 2, className = "" }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": true,
  };

  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></>,
    close: <><path d="m18 6-12 12" /><path d="m6 6 12 12" /></>,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    target: <><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></>,
    route: <><circle cx="6" cy="19" r="2" /><circle cx="18" cy="5" r="2" /><path d="M6 17c0-6 12-4 12-10" /></>,
    phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.7 19.7 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.7 19.7 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    verified: <><path d="m9 12 2 2 4-4" /><path d="M12 3 9.7 4.4 7 4.2 5.8 6.7 3.5 8 4 10.7 3 13l2 1.8.3 2.7 2.7.6L10 20l2-1.2 2 1.2 2-1.9 2.7-.6.3-2.7 2-1.8-1-2.3.5-2.7-2.3-1.3L17 4.2l-2.7.2Z" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    wallet: <><path d="M4 6h14a2 2 0 0 1 2 2v10H4a2 2 0 0 1-2-2V6a3 3 0 0 1 3-3h12" /><path d="M16 11h6v4h-6a2 2 0 0 1 0-4Z" /></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></>,
    education: <><path d="m2 10 10-5 10 5-10 5Z" /><path d="M6 12v5c3 2 9 2 12 0v-5M22 10v6" /></>,
    bank: <><path d="m3 9 9-6 9 6M5 10h14M6 10v8M10 10v8M14 10v8M18 10v8M3 21h18" /></>,
    tune: <><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="3" cy="6" r="1" fill="currentColor" stroke="none" /><circle cx="3" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="3" cy="18" r="1" fill="currentColor" stroke="none" /></>,
    arrow: <path d="m5 12 14 0m-5-5 5 5-5 5" />,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  };

  return <svg {...common}>{paths[name] || paths.info}</svg>;
}

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (value == null || value === "") return [];
  return String(value).split(/[,|]/).map((item) => item.trim()).filter(Boolean);
}

function normalizePartner(partner, index) {
  const latitude = Number(partner.latitude ?? partner.lat);
  const longitude = Number(partner.longitude ?? partner.lng ?? partner.lon);
  const schemes = toArray(partner.schemes ?? partner.scheme);
  const services = toArray(partner.services);

  return {
    ...partner,
    id: String(partner.id ?? partner.ID ?? `partner-${index + 1}`),
    name: partner.name || partner.partner_name || "Channel Partner",
    type: partner.type || partner.partner_type || "Authorized partner",
    latitude,
    longitude,
    schemes,
    services,
    district: partner.district || "",
    state: partner.state || "",
    address: partner.address || "",
    pincode: partner.pincode || partner.pin_code || "",
    phone: partner.phone || partner.contact_number || "",
    email: partner.email || "",
    website: partner.website || "",
    hours: partner.hours || partner.office_hours || "",
    reason: partner.reason || partner.match_reason || "",
    verified: Boolean(partner.verified ?? partner.is_verified),
    matchScore: Number(partner.matchScore ?? partner.match_score ?? 0),
    providedDistance: Number(partner.distance_km ?? partner.distance),
  };
}

function isValidCoordinate(partner) {
  return Number.isFinite(partner.latitude)
    && Number.isFinite(partner.longitude)
    && Math.abs(partner.latitude) <= 90
    && Math.abs(partner.longitude) <= 180;
}

function distanceInKm(from, to) {
  const radius = 6371;
  const rad = (degrees) => (degrees * Math.PI) / 180;
  const lat = rad(to.latitude - from.latitude);
  const lng = rad(to.longitude - from.longitude);
  const a = Math.sin(lat / 2) ** 2
    + Math.cos(rad(from.latitude)) * Math.cos(rad(to.latitude)) * Math.sin(lng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function partnerMatchesFilter(partner, filter) {
  if (filter === "all") return true;
  const searchable = [partner.type, ...partner.schemes, ...partner.services].join(" ").toLowerCase();
  if (filter === "micro") return /micro|shg|self.help|livelihood/.test(searchable);
  if (filter === "term") return /term|business|enterprise|msme|project/.test(searchable);
  if (filter === "education") return /education|student|study/.test(searchable);
  if (filter === "bank") return /bank|rrb|psb|scheduled commercial/.test(searchable);
  return true;
}

function makeMarkerIcon(number, selected = false) {
  return L.divIcon({
    className: "pl-marker-wrap",
    html: `<div class="pl-marker${selected ? " is-selected" : ""}"><span>${number}</span></div>`,
    iconSize: selected ? [52, 60] : [44, 52],
    iconAnchor: selected ? [26, 58] : [22, 50],
    popupAnchor: [0, selected ? -55 : -48],
  });
}

function ViewportController({ selectedPartner, visiblePartners, markerRefs, fitRequest }) {
  const map = useMap();
  const lastFitRequest = useRef(-1);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") {
      map.invalidateSize({ pan: false });
      return undefined;
    }
    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);

  useEffect(() => {
    if (!selectedPartner) return;
    map.flyTo([selectedPartner.latitude, selectedPartner.longitude], Math.max(map.getZoom(), 14), {
      animate: true,
      duration: 0.65,
    });
    const timer = window.setTimeout(() => markerRefs.current.get(selectedPartner.id)?.openPopup(), 320);
    return () => window.clearTimeout(timer);
  }, [map, markerRefs, selectedPartner]);

  useEffect(() => {
    if (fitRequest === lastFitRequest.current || visiblePartners.length === 0) return;
    lastFitRequest.current = fitRequest;
    const bounds = L.latLngBounds(visiblePartners.map((p) => [p.latitude, p.longitude]));
    map.fitBounds(bounds, { padding: [70, 70], maxZoom: 13, animate: true });
  }, [fitRequest, map, visiblePartners]);

  return null;
}

function LocationButton({ location, locationStatus, onLocate }) {
  const map = useMap();
  const locate = () => {
    if (location) {
      map.flyTo([location.latitude, location.longitude], 14, { duration: 0.65 });
    } else {
      onLocate();
    }
  };

  return (
    <button
      className={`pl-map-action ${locationStatus === "loading" ? "is-loading" : ""}`}
      type="button"
      onClick={locate}
      disabled={locationStatus === "loading"}
      aria-label={location ? "Center map on my location" : "Use my current location"}
      title={location ? "Center on my location" : "Use my location"}
    >
      <Icon name="target" size={20} />
    </button>
  );
}

function PartnerPopup({ partner, onViewDetails }) {
  return (
    <div className="pl-popup">
      <div className="pl-popup__eyebrow">
        {partner.verified && <span><Icon name="verified" size={14} /> Verified</span>}
        {partner.distance != null && <strong>{partner.distance.toFixed(1)} km</strong>}
      </div>
      <h3>{partner.name}</h3>
      <p>{[partner.type, partner.district].filter(Boolean).join(" · ")}</p>
      {partner.schemes[0] && <span className="pl-scheme-chip">{partner.schemes[0]}</span>}
      <button type="button" onClick={() => onViewDetails(partner)}>
        View partner details <Icon name="arrow" size={15} />
      </button>
    </div>
  );
}

function PartnerCard({ partner, number, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`pl-card ${selected ? "is-selected" : ""}`}
      onClick={() => onSelect(partner)}
      aria-pressed={selected}
    >
      <span className="pl-card__number">{number}</span>
      <span className="pl-card__content">
        <span className="pl-card__topline">
          <span className="pl-card__name">{partner.name}</span>
          {partner.distance != null && <span className="pl-card__distance">{partner.distance.toFixed(1)} km</span>}
        </span>
        <span className="pl-card__meta">
          {partner.verified && <span className="pl-verified"><Icon name="verified" size={14} /> Authorized</span>}
          <span>{[partner.type, partner.district].filter(Boolean).join(" · ")}</span>
        </span>
        <span className="pl-card__schemes">
          {partner.schemes.slice(0, 2).map((scheme) => <span key={scheme}>{scheme}</span>)}
          {partner.schemes.length > 2 && <span>+{partner.schemes.length - 2}</span>}
        </span>
        {partner.reason && <span className="pl-card__reason">Why matched: {partner.reason}</span>}
      </span>
      <span className="pl-card__chevron"><Icon name="chevron" size={18} /></span>
    </button>
  );
}

function DetailPanel({ partner, onClose, onViewDetails }) {
  if (!partner) return null;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${partner.latitude},${partner.longitude}`;

  return (
    <section className="pl-detail" aria-label={`${partner.name} details`}>
      <div className="pl-detail__header">
        <div>
          <div className="pl-detail__badges">
            {partner.verified && <span className="pl-detail__verified"><Icon name="verified" size={14} /> Verified channel partner</span>}
            {partner.distance != null && <span>{partner.distance.toFixed(1)} km away</span>}
          </div>
          <h2>{partner.name}</h2>
          <p>{partner.type}</p>
        </div>
        <button className="pl-icon-button" type="button" onClick={onClose} aria-label="Close partner details">
          <Icon name="close" />
        </button>
      </div>

      <div className="pl-detail__body">
        {(partner.address || partner.district) && (
          <div className="pl-detail__row">
            <span className="pl-detail__row-icon"><Icon name="location" size={18} /></span>
            <div><strong>Office address</strong><span>{partner.address || [partner.district, partner.state, partner.pincode].filter(Boolean).join(", ")}</span></div>
          </div>
        )}
        {partner.hours && (
          <div className="pl-detail__row">
            <span className="pl-detail__row-icon"><Icon name="clock" size={18} /></span>
            <div><strong>Working hours</strong><span>{partner.hours}</span></div>
          </div>
        )}
        {partner.schemes.length > 0 && (
          <div className="pl-detail__section">
            <strong>Schemes handled</strong>
            <div className="pl-detail__chips">{partner.schemes.map((scheme) => <span key={scheme}>{scheme}</span>)}</div>
          </div>
        )}
        {partner.reason && (
          <div className="pl-match-note"><Icon name="info" size={18} /><p><strong>Why this partner is recommended</strong><span>{partner.reason}</span></p></div>
        )}
      </div>

      <div className="pl-detail__actions">
        <a className="pl-button pl-button--primary" href={directions} target="_blank" rel="noreferrer">
          <Icon name="route" /> Get directions
        </a>
        {partner.phone && <a className="pl-button pl-button--secondary" href={`tel:${partner.phone}`}><Icon name="phone" /> Call office</a>}
        {onViewDetails && <button className="pl-button pl-button--ghost" type="button" onClick={() => onViewDetails(partner)}>Full details <Icon name="arrow" /></button>}
      </div>
    </section>
  );
}

/**
 * Drop-in map for discovering authorized scheme/channel partners.
 * See README.md for the supported partner fields and integration example.
 */
export default function PartnerMap({
  partners = [],
  height = "760px",
  defaultCenter = DEFAULT_CENTER,
  defaultZoom = 12,
  autoLocate = true,
  title = "Find the right partner near you.",
  subtitle = "Your recommended scheme, verified offices, and the clearest next step—all in one place.",
  onPartnerSelect,
  onViewDetails,
  className = "",
}) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("nearest");
  const [selectedId, setSelectedId] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");
  const [locationMessage, setLocationMessage] = useState("Map centered on your selected district");
  const [fitRequest, setFitRequest] = useState(0);
  const [mobileListOpen, setMobileListOpen] = useState(false);
  const markerRefs = useRef(new Map());
  const requestedOnMount = useRef(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      setLocationMessage("Location is not supported by this browser");
      return;
    }
    setLocationStatus("loading");
    setLocationMessage("Finding your current location…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy });
        setLocationStatus("ready");
        setLocationMessage("Using your current location");
      },
      (error) => {
        setLocationStatus(error.code === 1 ? "denied" : "error");
        setLocationMessage(error.code === 1
          ? "Location access is off — results use the selected district"
          : "Could not detect location — showing district results");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 120000 },
    );
  }, []);

  useEffect(() => {
    if (autoLocate && !requestedOnMount.current) {
      requestedOnMount.current = true;
      requestLocation();
    }
  }, [autoLocate, requestLocation]);

  const normalized = useMemo(() => partners.map(normalizePartner).filter(isValidCoordinate), [partners]);

  const enriched = useMemo(() => normalized.map((partner) => ({
    ...partner,
    distance: location
      ? distanceInKm(location, partner)
      : (Number.isFinite(partner.providedDistance) ? partner.providedDistance : null),
  })), [location, normalized]);

  const visiblePartners = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    const result = enriched.filter((partner) => {
      const haystack = [
        partner.name, partner.type, partner.district, partner.state, partner.address,
        partner.pincode, ...partner.schemes, ...partner.services,
      ].join(" ").toLocaleLowerCase();
      return (!search || haystack.includes(search)) && partnerMatchesFilter(partner, activeFilter);
    });

    return [...result].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "match") return b.matchScore - a.matchScore || (a.distance ?? Infinity) - (b.distance ?? Infinity);
      return (a.distance ?? Infinity) - (b.distance ?? Infinity) || b.matchScore - a.matchScore;
    });
  }, [activeFilter, enriched, query, sortBy]);

  const visibleIds = useMemo(() => new Set(visiblePartners.map((partner) => partner.id)), [visiblePartners]);
  const selectedPartner = visibleIds.has(selectedId)
    ? enriched.find((partner) => partner.id === selectedId) || null
    : null;

  const selectPartner = (partner) => {
    setSelectedId(partner.id);
    setMobileListOpen(false);
    onPartnerSelect?.(partner);
  };

  const clearFilters = () => {
    setQuery("");
    setActiveFilter("all");
    setSortBy("nearest");
    setSelectedId(null);
  };

  const validLocation = location && Number.isFinite(location.latitude) && Number.isFinite(location.longitude);
  const center = validLocation ? [location.latitude, location.longitude] : [defaultCenter.latitude, defaultCenter.longitude];

  return (
    <section className={`pl-root ${className}`} style={{ "--pl-height": height }} aria-label="Authorized channel partner locator">
      <header className="pl-hero">
        <div className="pl-hero__copy">
          <span className="pl-kicker"><span className="pl-live-dot" /> Authorized partner network</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="pl-hero__trust">
          <div><strong>{normalized.length}</strong><span>Mapped offices</span></div>
          <i />
          <div><strong>{normalized.filter((partner) => partner.verified).length}</strong><span>Verified partners</span></div>
        </div>
      </header>

      <div className="pl-workspace">
        <aside className={`pl-sidebar ${mobileListOpen ? "is-mobile-open" : ""}`}>
          <div className="pl-mobile-handle" aria-hidden="true" />
          <button className="pl-mobile-close" type="button" onClick={() => setMobileListOpen(false)} aria-label="Close results list">
            <Icon name="close" size={18} />
          </button>
          <div className="pl-search-wrap">
            <Icon name="search" size={20} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search district, partner, PIN or scheme"
              aria-label="Search channel partners"
            />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><Icon name="close" size={17} /></button>}
          </div>

          <div className="pl-filters" aria-label="Filter by partner service">
            {FILTERS.map((filter) => (
              <button
                type="button"
                key={filter.id}
                className={activeFilter === filter.id ? "is-active" : ""}
                onClick={() => setActiveFilter(filter.id)}
                aria-pressed={activeFilter === filter.id}
              >
                <Icon name={filter.icon} size={15} /> {filter.label}
              </button>
            ))}
          </div>

          <div className="pl-results-toolbar">
            <div><strong>{visiblePartners.length} partners found</strong><span>{location ? "Sorted around your location" : "Near the selected district"}</span></div>
            <label className="pl-sort">
              <Icon name="tune" size={15} />
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort partners">
                {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>

          <div className="pl-results" role="list" aria-live="polite">
            {visiblePartners.length > 0 ? visiblePartners.map((partner, index) => (
              <PartnerCard
                key={partner.id}
                partner={partner}
                number={index + 1}
                selected={partner.id === selectedId}
                onSelect={selectPartner}
              />
            )) : (
              <div className="pl-empty">
                <span><Icon name="search" size={24} /></span>
                <strong>No matching partner found</strong>
                <p>Try another district, PIN code, partner name, or scheme.</p>
                <button type="button" onClick={clearFilters}>Clear all filters</button>
              </div>
            )}
          </div>

          <div className="pl-sidebar__footer">
            <Icon name="verified" size={17} />
            Partner information should be confirmed before visiting.
          </div>
        </aside>

        <div className="pl-map-wrap">
          <MapContainer center={center} zoom={defaultZoom} zoomControl={false} attributionControl className="pl-map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ZoomControl position="topright" />
            <ViewportController
              selectedPartner={selectedPartner}
              visiblePartners={visiblePartners}
              markerRefs={markerRefs}
              fitRequest={fitRequest}
            />
            <LocationButton location={location} locationStatus={locationStatus} onLocate={requestLocation} />

            {validLocation && (
              <>
                <Circle
                  center={[location.latitude, location.longitude]}
                  radius={Math.max(location.accuracy || 80, 50)}
                  pathOptions={{ color: "#2563eb", fillColor: "#3b82f6", fillOpacity: 0.08, weight: 1 }}
                />
                <CircleMarker
                  center={[location.latitude, location.longitude]}
                  radius={8}
                  pathOptions={{ color: "#ffffff", fillColor: "#2563eb", fillOpacity: 1, weight: 4 }}
                >
                  <Popup><strong>Your current location</strong></Popup>
                </CircleMarker>
              </>
            )}

            {visiblePartners.map((partner, index) => (
              <Marker
                key={partner.id}
                position={[partner.latitude, partner.longitude]}
                icon={makeMarkerIcon(index + 1, selectedId === partner.id)}
                ref={(marker) => {
                  if (marker) markerRefs.current.set(partner.id, marker);
                  else markerRefs.current.delete(partner.id);
                }}
                eventHandlers={{ click: () => selectPartner(partner) }}
                zIndexOffset={selectedId === partner.id ? 1000 : 0}
              >
                <Popup><PartnerPopup partner={partner} onViewDetails={selectPartner} /></Popup>
              </Marker>
            ))}
          </MapContainer>

          <div className={`pl-location-status is-${locationStatus}`} role="status">
            {locationStatus === "loading" ? <span className="pl-spinner" /> : <Icon name={location ? "location" : "info"} size={16} />}
            <span>{locationMessage}</span>
            {(locationStatus === "denied" || locationStatus === "error") && <button type="button" onClick={requestLocation}>Try again</button>}
          </div>

          <button className="pl-fit-button" type="button" onClick={() => setFitRequest((value) => value + 1)} disabled={!visiblePartners.length}>
            <Icon name="grid" size={16} /> Show all {visiblePartners.length || ""}
          </button>

          <button className="pl-mobile-results-button" type="button" onClick={() => setMobileListOpen((open) => !open)}>
            <Icon name="list" size={18} /> {visiblePartners.length} results
          </button>

          <DetailPanel
            partner={selectedPartner}
            onClose={() => setSelectedId(null)}
            onViewDetails={onViewDetails}
          />
        </div>
      </div>
    </section>
  );
}
