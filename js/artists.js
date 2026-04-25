/* ── Artistas de Castilla y León ── */

const ARTISTS_CACHE_KEY  = 'cyl_artists_lastfm_cache';
const LASTFM_KEY_STORAGE = 'cyl_lastfm_api_key';

const GENRE_COLORS = {
  'Folk Rock':        '#27AE60',
  'Pop Rock':         '#4A90E2',
  'Pop Cómico':       '#E67E22',
  'Punk Hardcore':    '#E53935',
  'Pop':              '#8E44AD',
  'Clásica':          '#16A085',
  'Flamenco Pop':     '#C0392B',
  'Folk Tradicional': '#795548',
  'Rock Progresivo':  '#607D8B'
};

const ARTISTS = [
  {
    id: 1, name: 'Celtas Cortos',
    city: 'Valladolid', province: 'Valladolid',
    genre: 'Folk Rock', lat: 41.6523, lng: -4.7245,
    period: '1985–presente',
    bio: 'Pioneros del folk rock en España, fusionando música tradicional castellana con rock eléctrico. Sus letras en castellano y sus fusiones con ritmos celtas los convirtieron en referentes del género.'
  },
  {
    id: 2, name: 'Tam Tam Go!',
    city: 'Valladolid', province: 'Valladolid',
    genre: 'Pop Rock', lat: 41.6600, lng: -4.7200,
    period: '1988–2002',
    bio: 'Grupo de pop rock de los 90 conocido por éxitos como "Amiga mía". Combinaron melodía pop con sonidos rock que definieron una época.'
  },
  {
    id: 3, name: 'El Consorcio',
    city: 'Valladolid', province: 'Valladolid',
    genre: 'Pop Cómico', lat: 41.6450, lng: -4.7290,
    period: '1982–presente',
    bio: 'Trío vallisoletano de humor musical, reconocidos por sus versiones cómicas de canciones populares que han conectado con varias generaciones.'
  },
  {
    id: 4, name: 'Desakato',
    city: 'Valladolid', province: 'Valladolid',
    genre: 'Punk Hardcore', lat: 41.6570, lng: -4.7150,
    period: '1999–presente',
    bio: 'Referente del punk hardcore español con letras de contenido social y político combativo, uno de los nombres más importantes del género en España.'
  },
  {
    id: 5, name: 'Amistades Peligrosas',
    city: 'Burgos', province: 'Burgos',
    genre: 'Pop', lat: 42.3440, lng: -3.6970,
    period: '1990–2000',
    bio: 'Dúo pop de los 90 conocido por canciones como "Cosas que pasan" y "Si tú no vuelves", representantes del pop melódico romántico español.'
  },
  {
    id: 6, name: 'Rafael Frühbeck de Burgos',
    city: 'Burgos', province: 'Burgos',
    genre: 'Clásica', lat: 42.3380, lng: -3.7050,
    period: '1958–2014',
    bio: 'Director de orquesta de renombre internacional, director titular de las mejores orquestas del mundo. Considerado uno de los grandes directores españoles del siglo XX.'
  },
  {
    id: 7, name: 'Azúcar Moreno',
    city: 'Salamanca', province: 'Salamanca',
    genre: 'Flamenco Pop', lat: 40.9701, lng: -5.6635,
    period: '1983–presente',
    bio: 'Dúo de hermanas que fusiona flamenco y pop. Representaron a España en el Festival de Eurovisión 1990 con "Bandido".'
  },
  {
    id: 8, name: 'Nuevo Mester de Juglaría',
    city: 'Salamanca', province: 'Salamanca',
    genre: 'Folk Tradicional', lat: 40.9660, lng: -5.6700,
    period: '1969–presente',
    bio: 'Grupo pionero en la recuperación y difusión del folklore castellano y la música medieval. Símbolo del movimiento de folk castellano.'
  },
  {
    id: 9, name: 'Hamlet',
    city: 'León', province: 'León',
    genre: 'Rock Progresivo', lat: 42.5987, lng: -5.5671,
    period: '1991–presente',
    bio: 'Banda de rock progresivo con una larga trayectoria en la escena del rock español, referentes del rock alternativo en Castilla y León.'
  }
];

/* ── Estado del módulo ── */
let _map         = null;
let _markers     = {};
let _enriched    = {};
let _filtersReady = false;

/* ── Last.fm API ── */
function lfmGetKey() {
  return localStorage.getItem(LASTFM_KEY_STORAGE) || '';
}

function lfmSetKey(key) {
  localStorage.setItem(LASTFM_KEY_STORAGE, key.trim());
}

function lfmGetCache() {
  try {
    return JSON.parse(localStorage.getItem(ARTISTS_CACHE_KEY) || '{}');
  } catch { return {}; }
}

function lfmSaveCache(cache) {
  localStorage.setItem(ARTISTS_CACHE_KEY, JSON.stringify(cache));
}

async function lfmFetchArtist(name) {
  const key = lfmGetKey();
  if (!key) return null;

  const cache = lfmGetCache();
  if (cache[name]) return cache[name];

  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(name)}&api_key=${key}&format=json&lang=es`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error) return null;

    const a = data.artist;
    const result = {
      image:     (a.image || []).filter(i => i['#text']).slice(-2)[0]?.['#text'] || '',
      bio:       (a.bio?.summary || '').replace(/<a[^>]*>.*?<\/a>/gi, '').trim(),
      tags:      (a.tags?.tag || []).map(t => t.name).slice(0, 4),
      listeners: parseInt(a.stats?.listeners || 0, 10),
      url:       a.url || ''
    };

    cache[name] = result;
    lfmSaveCache(cache);
    return result;
  } catch {
    return null;
  }
}

async function lfmEnrichAll() {
  const key = lfmGetKey();
  if (!key) return;

  for (const artist of ARTISTS) {
    const data = await lfmFetchArtist(artist.name);
    if (!data) continue;
    _enriched[artist.id] = data;

    // Update popup in existing marker
    if (_markers[artist.id]) {
      _markers[artist.id].setPopupContent(buildPopupHTML(artist));
    }

    // Update card image if sidebar is visible
    const card = document.querySelector(`.artist-card[data-id="${artist.id}"]`);
    if (card && data.image) {
      const avatar = card.querySelector('.artist-card-avatar');
      const existImg = card.querySelector('.artist-card-img');
      if (!existImg) {
        const img = document.createElement('img');
        img.src = data.image;
        img.alt = artist.name;
        img.className = 'artist-card-img';
        img.onerror = () => { img.remove(); if (avatar) avatar.style.display = 'flex'; };
        if (avatar) {
          avatar.style.display = 'none';
          avatar.parentNode.insertBefore(img, avatar);
        }
      }
    }
    if (card && data.listeners) {
      const body = card.querySelector('.artist-card-body');
      if (body && !body.querySelector('.artist-card-listeners')) {
        const el = document.createElement('div');
        el.className = 'artist-card-listeners';
        el.textContent = `${data.listeners.toLocaleString('es-ES')} oyentes`;
        body.appendChild(el);
      }
    }
  }
}

/* ── Helpers ── */
function getInitials(name) {
  const words = name.replace(/[^\w\sáéíóúñ]/gi, '').split(/\s+/).filter(w => w.length > 2);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function buildPopupHTML(artist) {
  const color    = GENRE_COLORS[artist.genre] || '#4A90E2';
  const enriched = _enriched[artist.id];

  const imgHtml = enriched?.image
    ? `<img src="${enriched.image}" alt="${artist.name}" class="popup-img" onerror="this.style.display='none'">`
    : '';

  let bio = enriched?.bio || artist.bio || '';
  if (bio.length > 220) bio = bio.substring(0, 220) + '…';

  const listenersHtml = enriched?.listeners
    ? `<p class="popup-listeners">${enriched.listeners.toLocaleString('es-ES')} oyentes en Last.fm</p>`
    : '';

  const tagsHtml = enriched?.tags?.length
    ? `<div class="popup-tags">${enriched.tags.map(t => `<span>${t}</span>`).join('')}</div>`
    : '';

  const linkHtml = enriched?.url
    ? `<a href="${enriched.url}" target="_blank" rel="noopener" class="popup-link">Ver en Last.fm ↗</a>`
    : '';

  return `
    <div class="artist-popup">
      ${imgHtml}
      <div class="popup-body">
        <h3>${artist.name}</h3>
        <span class="popup-badge" style="background:${color}">${artist.genre}</span>
        <div class="popup-meta">
          <span>📍 ${artist.city}, ${artist.province}</span>
          <span>🎵 ${artist.period}</span>
        </div>
        ${listenersHtml}
        <p class="popup-bio">${bio}</p>
        ${tagsHtml}
        ${linkHtml}
      </div>
    </div>`;
}

/* ── Mapa Leaflet ── */
function initOrRefreshMap() {
  if (!_filtersReady) {
    populateFilters();
    _filtersReady = true;
  }

  renderArtistsList(filterArtists());

  if (!_map) {
    requestAnimationFrame(() => {
      _map = L.map('artists-map', { center: [41.5, -4.2], zoom: 7 });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(_map);

      ARTISTS.forEach(artist => {
        _markers[artist.id] = createMarker(artist);
        _markers[artist.id].addTo(_map);
      });

      lfmEnrichAll();
      updateApiUI();
    });
  } else {
    setTimeout(() => _map.invalidateSize(), 60);
    updateApiUI();
  }
}

function createMarker(artist) {
  const color    = GENRE_COLORS[artist.genre] || '#4A90E2';
  const initials = getInitials(artist.name);

  const icon = L.divIcon({
    className: '',
    html: `<div class="a-pin" style="background:${color}" title="${artist.name}">${initials}</div>`,
    iconSize:    [40, 40],
    iconAnchor:  [20, 20],
    popupAnchor: [0, -24]
  });

  const marker = L.marker([artist.lat, artist.lng], { icon });
  marker.bindPopup(buildPopupHTML(artist), { maxWidth: 300, className: 'a-popup' });
  marker.on('click', () => highlightCard(artist.id));
  return marker;
}

/* ── Sidebar ── */
function populateFilters() {
  const genres    = [...new Set(ARTISTS.map(a => a.genre))].sort();
  const provinces = [...new Set(ARTISTS.map(a => a.province))].sort();
  const gSel = document.getElementById('artists-genre-filter');
  const pSel = document.getElementById('artists-province-filter');

  genres.forEach(g => {
    const o = document.createElement('option'); o.value = o.textContent = g; gSel.appendChild(o);
  });
  provinces.forEach(p => {
    const o = document.createElement('option'); o.value = o.textContent = p; pSel.appendChild(o);
  });
}

function filterArtists() {
  const q  = document.getElementById('artists-search').value.toLowerCase();
  const g  = document.getElementById('artists-genre-filter').value;
  const p  = document.getElementById('artists-province-filter').value;

  return ARTISTS.filter(a => {
    if (q && !a.name.toLowerCase().includes(q) &&
             !a.city.toLowerCase().includes(q) &&
             !a.genre.toLowerCase().includes(q)) return false;
    if (g && a.genre    !== g) return false;
    if (p && a.province !== p) return false;
    return true;
  });
}

function renderArtistsList(artists) {
  const list  = document.getElementById('artists-list');
  const count = document.getElementById('artists-count');
  list.innerHTML = '';
  count.textContent = `${artists.length} artista${artists.length !== 1 ? 's' : ''}`;

  if (!artists.length) {
    list.innerHTML = '<p class="artists-empty">No se encontraron artistas.</p>';
    syncMapMarkers(artists);
    return;
  }

  artists.forEach(artist => {
    const color    = GENRE_COLORS[artist.genre] || '#4A90E2';
    const enriched = _enriched[artist.id];
    const card     = document.createElement('div');
    card.className  = 'artist-card';
    card.dataset.id = artist.id;

    const imgHtml = enriched?.image
      ? `<img src="${enriched.image}" alt="${artist.name}" class="artist-card-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';

    card.innerHTML = `
      <div class="artist-card-left">
        ${imgHtml}
        <div class="artist-card-avatar" style="background:${color};${enriched?.image ? 'display:none' : ''}">${getInitials(artist.name)}</div>
      </div>
      <div class="artist-card-body">
        <div class="artist-card-name">${artist.name}</div>
        <div class="artist-card-sub">
          <span class="artist-card-genre" style="color:${color}">${artist.genre}</span>
          <span class="sep">·</span>
          <span class="artist-card-city">${artist.city}</span>
        </div>
        <div class="artist-card-period">${artist.period}</div>
        ${enriched?.listeners ? `<div class="artist-card-listeners">${enriched.listeners.toLocaleString('es-ES')} oyentes</div>` : ''}
      </div>
      <div class="artist-card-bar" style="background:${color}"></div>`;

    card.addEventListener('click', () => focusOnMap(artist.id));
    list.appendChild(card);
  });

  syncMapMarkers(artists);
}

function syncMapMarkers(visible) {
  if (!_map) return;
  const ids = new Set(visible.map(a => a.id));
  ARTISTS.forEach(a => {
    const m = _markers[a.id];
    if (!m) return;
    ids.has(a.id) ? (!_map.hasLayer(m) && m.addTo(_map)) : (_map.hasLayer(m) && m.remove());
  });
}

function highlightCard(id) {
  document.querySelectorAll('.artist-card').forEach(c =>
    c.classList.toggle('active', +c.dataset.id === id));
  document.querySelector(`.artist-card[data-id="${id}"]`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function focusOnMap(id) {
  if (!_map) return;
  const artist = ARTISTS.find(a => a.id === id);
  if (!artist) return;
  highlightCard(id);
  _map.flyTo([artist.lat, artist.lng], 12, { duration: 0.8 });
  const m = _markers[id];
  if (m) setTimeout(() => m.openPopup(), 900);
}

/* ── API Key UI ── */
function updateApiUI() {
  const key    = lfmGetKey();
  const dot    = document.getElementById('api-status-dot');
  const input  = document.getElementById('lastfm-key-input');
  const clearB = document.getElementById('btn-clear-api-key');
  if (dot)    dot.className = `api-dot ${key ? 'api-dot--on' : 'api-dot--off'}`;
  if (input && key)  input.value = key;
  if (clearB) clearB.classList.toggle('hidden', !key);
}

function saveApiKey() {
  const key = document.getElementById('lastfm-key-input')?.value?.trim();
  if (!key) return;
  lfmSetKey(key);
  localStorage.removeItem(ARTISTS_CACHE_KEY);
  _enriched = {};
  updateApiUI();
  lfmEnrichAll();
}

function clearApiKey() {
  localStorage.removeItem(LASTFM_KEY_STORAGE);
  localStorage.removeItem(ARTISTS_CACHE_KEY);
  _enriched = {};
  updateApiUI();
  renderArtistsList(filterArtists());
  ARTISTS.forEach(a => {
    if (_markers[a.id]) _markers[a.id].setPopupContent(buildPopupHTML(a));
  });
}

/* ── Listeners del módulo ── */
function attachArtistsListeners() {
  document.getElementById('artists-search').addEventListener('input', () =>
    renderArtistsList(filterArtists()));
  document.getElementById('artists-genre-filter').addEventListener('change', () =>
    renderArtistsList(filterArtists()));
  document.getElementById('artists-province-filter').addEventListener('change', () =>
    renderArtistsList(filterArtists()));

  document.getElementById('btn-toggle-api').addEventListener('click', () =>
    document.getElementById('api-settings-panel').classList.toggle('hidden'));

  document.getElementById('btn-save-api-key').addEventListener('click', saveApiKey);
  document.getElementById('btn-clear-api-key').addEventListener('click', clearApiKey);

  document.getElementById('lastfm-key-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') saveApiKey();
  });
}
