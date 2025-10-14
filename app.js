// ===================== app.js (responsive drawer + white labels + OSRM + Kenya auto-focus) =====================

// ---- 1) DATA (puedes sustituir por tu bloque del PDF si lo prefieres) ----
const resourceData = {
  "Nigeria": { region: "West Africa", dominant:"E", resources:[
    {name:"Crude oil", stage:"E", notes:"Main FX source"},
    {name:"Liquefied natural gas", stage:"P", notes:"Limited capacity"},
    {name:"Refined products", stage:"T", notes:"Imported then re-exported"}
  ], reserves:"High (oil/gas)", production:"~1.3–1.5 Mbpd" },
  "Ghana": { region:"West Africa", dominant:"E", resources:[
    {name:"Gold", stage:"E"},{name:"Cocoa", stage:"E/P (limited)"},{name:"Crude", stage:"E"}
  ] },
  "Côte d’Ivoire": { region:"West Africa", dominant:"P", resources:[
    {name:"Cocoa", stage:"P", notes:"Largest cocoa processor in Africa"},
    {name:"Gold", stage:"E"},{name:"Crude", stage:"E"}
  ] },
  "Guinea": { region:"West Africa", dominant:"E", resources:[
    {name:"Bauxite", stage:"E", notes:">7.4 Bt reserves"}, {name:"Gold", stage:"E"}, {name:"Iron", stage:"E"}
  ] },
  "Senegal": { region:"West Africa", dominant:"E", resources:[
    {name:"Gold", stage:"E"}, {name:"Phosphates", stage:"E/P"}, {name:"Fisheries", stage:"E"}
  ] },
  "Niger": { region:"West Africa", dominant:"E", resources:[
    {name:"Uranium", stage:"E"},{name:"Gold", stage:"E"},{name:"Livestock/hides", stage:"E/T"}
  ] },
  "Cameroon": { region:"Central Africa", dominant:"E", resources:[
    {name:"Crude", stage:"E"},{name:"Gas", stage:"E"},{name:"Cocoa", stage:"E/P (limited)"},{name:"Timber", stage:"E/T"}
  ] },
  "Gabon": { region:"Central Africa", dominant:"E", resources:[
    {name:"Crude", stage:"E"},{name:"Manganese", stage:"E"},{name:"Timber", stage:"E/T"}
  ] },
  "Democratic Republic of the Congo": { region:"Central Africa", dominant:"E", resources:[
    {name:"Copper", stage:"E"},{name:"Cobalt", stage:"E/P (limited cathodes)"},{name:"Gold", stage:"E"},{name:"Coltan/tantalum", stage:"E"}
  ] },
  "Angola": { region:"Central Africa", dominant:"E", resources:[
    {name:"Crude", stage:"E"},{name:"Diamonds", stage:"E"},{name:"Gas", stage:"E/P (limited)"}
  ] },
  "South Africa": { region:"Southern Africa", dominant:"P", resources:[
    {name:"PGMs", stage:"E/P", notes:"Smelters/refineries"}, {name:"Gold", stage:"E"},
    {name:"Thermal coal", stage:"E/P"}, {name:"Automotive", stage:"P/T"}
  ] },
  "Botswana": { region:"Southern Africa", dominant:"P", resources:[
    {name:"Diamonds", stage:"E/P", notes:"Leader in cutting/polishing"},{name:"Cattle", stage:"E"}
  ] },
  "Namibia": { region:"Southern Africa", dominant:"E", resources:[
    {name:"Copper", stage:"E"},{name:"Uranium", stage:"E"},{name:"Fisheries", stage:"E/T"}
  ] },
  "Zambia": { region:"Southern Africa", dominant:"P", resources:[
    {name:"Copper", stage:"E/P", notes:"Smelters/refineries"},{name:"Cobalt", stage:"E"}
  ] },
  "Mozambique": { region:"Southern Africa", dominant:"P", resources:[
    {name:"Aluminium (Mozal)", stage:"P", notes:"Uses imported bauxite"},{name:"Coal", stage:"E"},{name:"LNG", stage:"P/T"}
  ] },
  "Zimbabwe": { region:"Southern Africa", dominant:"E", resources:[
    {name:"Gold", stage:"E"},{name:"Diamonds", stage:"E"},{name:"PGMs", stage:"E"}
  ] },
  "Ethiopia": { region:"Horn/East Africa", dominant:"E", resources:[
    {name:"Coffee", stage:"E/P (light roast)"},{name:"Gold", stage:"E"},{name:"Oilseeds", stage:"E"}
  ] },
  "Uganda": { region:"Horn/East Africa", dominant:"E", resources:[
    {name:"Gold", stage:"E"},{name:"Coffee", stage:"E/P (limited)"},{name:"Tea", stage:"E"}
  ] },
  "Kenya": { region:"Horn/East Africa", dominant:"T", resources:[
    {name:"Tea", stage:"E/P (limited)"},{name:"Cut flowers", stage:"E/T", notes:"Floriculture hub"},
    {name:"Coffee", stage:"E/P (limited)"},{name:"Mineral sands", stage:"E"}
  ] },
  "Tanzania": { region:"Horn/East Africa", dominant:"E", resources:[
    {name:"Gold", stage:"E"},{name:"Cashew", stage:"E/P (limited)"},{name:"Tobacco", stage:"E"},{name:"Coal", stage:"E"}
  ] },
  "Egypt": { region:"North Africa", dominant:"P", resources:[
    {name:"LNG", stage:"P"},{name:"Crude", stage:"E"},{name:"Gold", stage:"E"},{name:"Phosphate fertilizers", stage:"P"}
  ] },
  "Algeria": { region:"North Africa", dominant:"P", resources:[
    {name:"Natural gas", stage:"E/P", notes:"Pipelines & LNG"},{name:"Crude", stage:"E"},{name:"N/P fertilizers", stage:"P"}
  ] },
  "Libya": { region:"North Africa", dominant:"E", resources:[
    {name:"Crude", stage:"E"},{name:"Gas", stage:"E (little processing)"}
  ] },
  "Morocco": { region:"North Africa", dominant:"P", resources:[
    {name:"Phosphates", stage:"E/P", notes:"Strong downstream (acid/fertilizers)"},
    {name:"Automotive (assembly)", stage:"P (advanced)"},{name:"Fruits/vegetables", stage:"E"}
  ] }
};

const capabilities = {
  processing: new Set(["South Africa","Zambia","Morocco","Egypt","Algeria","Mozambique","Botswana"]),
  refineriesOil: new Set(["Egypt","South Africa","Morocco","Algeria"]),
  batteryChem: new Set(["Morocco","South Africa"]),
  portsStrong: new Set(["South Africa","Morocco","Mozambique","Kenya","Namibia","Egypt","Tanzania","Senegal"])
};

const presets = {
  "Metals (Cu/Co → Battery materials)": {
    resource:"Cobalt/Copper",
    from:["Democratic Republic of the Congo","Zambia"],
    process:["Zambia","Morocco"],
    export:["South Africa","Morocco"]
  },
  "Bauxite → Aluminium": {
    resource:"Bauxite/Aluminium",
    from:["Guinea"],
    process:["Mozambique"],
    export:["South Africa"]
  },
  "Crude → Refinery → Export": {
    resource:"Oil/Gas",
    from:["Nigeria","Angola","Libya"],
    process:["Egypt","South Africa"],
    export:["Morocco","South Africa"]
  },
  "Cocoa → Chocolate": {
    resource:"Cocoa/Food",
    from:["Côte d’Ivoire"],
    process:["Ghana","South Africa"],
    export:["South Africa"]
  }
};

// ---- 2) MAP INIT ----
const map = L.map('map', { zoomControl: true, minZoom: 2 }).setView([2, 20], 3.3);

// Pane para etiquetas (por encima, sin capturar clics)
map.createPane('labels');
map.getPane('labels').style.zIndex = 650;
map.getPane('labels').style.pointerEvents = 'none';

// Base oscura SIN etiquetas
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
  maxZoom: 8, attribution: '&copy; OpenStreetMap &copy; CARTO'
}).addTo(map);

// Capa SOLO etiquetas (blancas), encima
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
  maxZoom: 8, pane: 'labels', attribution: '&copy; OpenStreetMap &copy; CARTO'
}).addTo(map);

let africaLayer;
const countryLayers = new Map();
const drawn = [];

// ---- 3) UTILITIES ----
function getVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
function stageColor(stage){
  if(stage?.startsWith('E')) return getVar('--E');
  if(stage?.startsWith('P')) return getVar('--P');
  if(stage?.startsWith('T')) return getVar('--T');
  return '#64748b';
}
function regionColor(region){
  const palette = {
    'West Africa':'#7c3aed','Central Africa':'#06b6d4','Southern Africa':'#84cc16',
    'Horn/East Africa':'#f97316','North Africa':'#f43f5e'
  };
  return palette[region] || '#94a3b8';
}
function normalizeName(s){
  return String(s)
    .replace('Republic of ','')
    .replace('Democratic Republic of the Congo','Democratic Republic of the Congo')
    .replace("Cote d'Ivoire","Côte d’Ivoire")
    .replace('Cape Verde','Cabo Verde')
    .replace('Sao Tome and Principe','São Tomé and Príncipe')
    .trim();
}
function lookupCountry(name){
  const candidates = [name, normalizeName(name)];
  for(const k of Object.keys(resourceData)){
    if(candidates.includes(normalizeName(k))) return resourceData[k];
  }
  return null;
}
function layerCenter(name){
  const layer = countryLayers.get(name) || countryLayers.get(normalizeName(name));
  if(layer && layer.getBounds) return layer.getBounds().getCenter();
  const fallback = {
    'Democratic Republic of the Congo':{lat:-2.88,lng:23.65}, 'Zambia':{lat:-13.13,lng:27.84},
    'South Africa':{lat:-30.56,lng:22.94}, 'Morocco':{lat:31.8,lng:-7.09}, 'Mozambique':{lat:-18.67,lng:35.53},
    'Guinea':{lat:10.44,lng:-10.94}, 'Nigeria':{lat:9.08,lng:8.67}, 'Ghana':{lat:7.95,lng:-1.03},
    'Egypt':{lat:26.8,lng:30.8}, 'Algeria':{lat:28,lng:2.6}, 'Kenya':{lat:-0.02,lng:37.9},
    'Namibia':{lat:-22.55,lng:17.07}, 'Senegal':{lat:14.5,lng:-14.4}, 'Angola':{lat:-12.3,lng:17.5}
  };
  return fallback[name] || map.getCenter();
}
function distanceKM(a,b){
  const R=6371; const dLat=(b.lat-a.lat)*Math.PI/180; const dLng=(b.lng-a.lng)*Math.PI/180;
  const s1=Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(s1));
}
function categoryColor(resource){
  const r = resource.toLowerCase();
  if(r.includes('oil')||r.includes('gas')||r.includes('crude')) return getVar('--OIL');
  if(r.includes('baux')||r.includes('cobal')||r.includes('copper')||r.includes('plat')||r.includes('uran')||r.includes('gold')||r.includes('diam')) return getVar('--MET');
  if(r.includes('cocoa')||r.includes('coffee')||r.includes('cashew')||r.includes('agro')) return getVar('--AGR');
  if(r.includes('fert')||r.includes('phosph')) return getVar('--FERT');
  return '#94a3b8';
}
function stageLabel(s){
  const c = String(s).trim()[0];
  if(c==='E') return 'Extraction';
  if(c==='P') return 'Processing';
  if(c==='T') return 'Transport/Export';
  return s;
}
function isMobile(){ return window.matchMedia('(max-width: 900px)').matches; }

// ---- 4) PORT COORDS (representative port per export country) ----
const PORT_COORDS = {
  "South Africa": { name:"Durban Port", lat:-29.88, lng:31.05 },
  "Morocco":     { name:"Tanger Med",  lat:35.90,  lng:-5.50 },
  "Kenya":       { name:"Mombasa",     lat:-4.05,  lng:39.67 },
  "Mozambique":  { name:"Maputo",      lat:-25.97, lng:32.57 },
  "Namibia":     { name:"Walvis Bay",  lat:-22.95, lng:14.50 },
  "Egypt":       { name:"Alexandria",  lat:31.20,  lng:29.92 },
  "Tanzania":    { name:"Dar es Salaam",lat:-6.83, lng:39.28 },
  "Senegal":     { name:"Dakar",       lat:14.69,  lng:-17.44 },
  "Ghana":       { name:"Tema",        lat:5.64,   lng:-0.01 },
  "Nigeria":     { name:"Lagos/Apapa", lat:6.44,   lng:3.36 }
};

// ---- 5) OSRM ROUTING (real roads; fallback to straight line) ----
async function osrmRoute(from, to){
  const base = 'https://router.project-osrm.org/route/v1/driving';
  const url = `${base}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  try{
    const r = await fetch(url);
    if(!r.ok) throw new Error('OSRM HTTP ' + r.status);
    const data = await r.json();
    if(!data.routes || !data.routes.length) throw new Error('No route');
    const route = data.routes[0];
    const coords = route.geometry.coordinates.map(([lng,lat])=>[lat,lng]);
    return { coords, km: route.distance/1000 };
  }catch(e){
    const km = distanceKM(from, to);
    return { coords: [[from.lat,from.lng],[to.lat,to.lng]], km };
  }
}

// ---- 6) LOAD AFRICA GEOJSON ----
async function loadAfrica(){
  const url = 'https://raw.githubusercontent.com/codeforgermany/click_that_hood/master/public/data/africa.geojson';
  let gj;
  try { const res = await fetch(url); gj = await res.json(); }
  catch(e){ console.warn('GeoJSON fetch failed, marker mode', e); return fallbackMarkers(); }

  const feats = gj.features;

  africaLayer = L.geoJSON(feats,{
    style: feature=>{
      const name = feature.properties.name || feature.properties.ADMIN || feature.properties.NAME;
      const rd = lookupCountry(name);
      const fill = rd ? stageColor(rd.dominant) : '#475569';
      return { color:'#0f172a', weight:1, fillColor:fill, fillOpacity:0.8 };
    },
    onEachFeature: (feature, layer)=>{
      const name = feature.properties.name || feature.properties.ADMIN || feature.properties.NAME;
      const display = normalizeName(name);
      countryLayers.set(display, layer);
      layer.on('click',()=>{
        renderSidebar(display, layer);
        if(isMobile()) openSidebar();    // auto-abrir panel en móvil
      });
      layer.on('mouseover',()=> layer.setStyle({weight:1.4}));
      layer.on('mouseout',()=> layer.setStyle({weight:1}));
    }
  }).addTo(map);

  map.fitBounds(africaLayer.getBounds(),{padding:[20,20]});

  // Fill selectors y picker
  populateSelectors();
  const picker = document.getElementById('countryPicker');
  const names = feats.map(f=>normalizeName(f.properties.name || f.properties.ADMIN || f.properties.NAME)).sort();
  picker.innerHTML = '<option value="">Pick a country…</option>' + names.map(n=>`<option>${n}</option>`).join('');
  picker.addEventListener('change', e=>{
    const name = e.target.value; if(!name) return;
    const layer = countryLayers.get(name);
    if(layer){
      map.fitBounds(layer.getBounds(), {padding:[20,20]});
      renderSidebar(name, layer);
      if(isMobile()) openSidebar();
    }
  });

  // ✅ Auto-focus en Kenya (zoom + panel)
  const kenyaLayer = countryLayers.get('Kenya');
  if (kenyaLayer) {
    map.fitBounds(kenyaLayer.getBounds(), { padding:[20,20] });
    renderSidebar('Kenya', kenyaLayer);
    if(isMobile()) openSidebar();
  }

  // invalidateSize cuando cambia el layout
  window.addEventListener('resize', debounce(()=> map.invalidateSize(), 150));
}

function fallbackMarkers(){
  const markers = {
    'Nigeria':[9.08,8.67],'South Africa':[-30.56,22.94],
    'Democratic Republic of the Congo':[-2.88,23.65],'Morocco':[31.8,-7.09],'Egypt':[26.8,30.8]
  };
  for(const [name, latlng] of Object.entries(markers)){
    L.marker(latlng).addTo(map).bindTooltip(name).on('click',()=>{
      renderSidebar(name);
      if(isMobile()) openSidebar();
    });
  }
  populateSelectors();
}

// ---- 7) SIDEBAR ----
function renderSidebar(name, layer){
  const info = lookupCountry(name);
  const el = document.querySelector('#sidebar .panel-body');
  const center = layer? layer.getBounds().getCenter(): null;
  const resList = info? info.resources.map(r=>{
    const label = stageLabel(r.stage);
    return `<span class="chip">${r.name} <span class="subtle">(${label})</span></span>`;
  }).join('') : '';
  el.innerHTML = `
    <div class="h">${name}</div>
    ${info? `<div class="chips">${resList}</div>`: '<div class="subtle">No demo data yet — add it in <code>resourceData</code>.</div>'}
    <div class="kv">
      <div>Dominant stage</div><div><span class="pill"><span style="width:10px;height:10px;background:${info?stageColor(info.dominant):'#64748b'};display:inline-block;border-radius:3px"></span> ${info?stageLabel(info.dominant):'N/A'}</span></div>
      <div>Subregion</div><div>${info?info.region||'—':'—'}</div>
      ${info?.reserves? `<div>Reserves</div><div>${info.reserves}</div>`:''}
      ${info?.production? `<div>Production</div><div>${info.production}</div>`:''}
    </div>
    <div class="divider"></div>
    ${center? `<div class="small">Approx. geographic center: ${center.lat.toFixed(2)}, ${center.lng.toFixed(2)}</div>`:''}
  `;
}

// ---- 8) MATCH ENGINE ----
function populateSelectors(){
  const countries = Object.keys(resourceData).sort();
  const resSet = new Set();
  for(const v of Object.values(resourceData)) v.resources?.forEach(r=>resSet.add(r.name.split(' ')[0]));
  const res = Array.from(resSet).sort();
  document.getElementById('matchResource').innerHTML = res.map(x=>`<option>${x}</option>`).join('');
  document.getElementById('matchFrom').innerHTML     = countries.map(x=>`<option>${x}</option>`).join('');
  document.getElementById('matchProcess').innerHTML  = countries.map(x=>`<option>${x}</option>`).join('');
  document.getElementById('matchExport').innerHTML   = countries.map(x=>`<option>${x}</option>`).join('');
}

async function drawRouteReal(aName, bName, cCountry, resource){
  const A = layerCenter(aName);     // origin
  const B = layerCenter(bName);     // processing
  const port = PORT_COORDS[cCountry];
  const C = port ? {lat:port.lat, lng:port.lng} : layerCenter(cCountry); // export endpoint

  const color = categoryColor(resource);

  const r1 = await osrmRoute(A,B);
  const pl1 = L.polyline(r1.coords,{color,weight:4,opacity:0.9}).addTo(map);

  const r2 = await osrmRoute(B,C);
  const pl2 = L.polyline(r2.coords,{color,weight:4,opacity:0.9,dashArray:'6 6'}).addTo(map);

  drawn.push(pl1,pl2);

  const km = Math.round(r1.km + r2.km);

  const base = 0.12; // USD per t/km (heurístico)
  const processFactor = capabilities.processing.has(bName) ? 0.9 : 1.1;
  const portFactor = capabilities.portsStrong.has(cCountry) ? 0.85 : 1.05;
  const cost = Math.round((km*base*processFactor*portFactor)*100)/100;

  return { km, cost, exportPort: port?.name || cCountry };
}

function clearRoutes(){ drawn.splice(0).forEach(l=> map.removeLayer(l)); }

function showRouteCard({resource,from,process,exportTo,metrics}){
  const el = document.querySelector('#sidebar .panel-body');
  const gaps = [];
  if(!capabilities.processing.has(process)) gaps.push('⚙️ Limited processing capacity');
  if(!capabilities.portsStrong.has(exportTo)) gaps.push('⚓ Port infrastructure to reinforce');
  const html = `
    <div class="routeCard">
      <div class="h">Recommended Value Chain</div>
      <div class="small">${resource} → ${from} → ${process} → ${metrics.exportPort}</div>
      <div class="kv" style="margin-top:6px">
        <div>Logistics distance</div><div>${metrics.km.toLocaleString()} km</div>
        <div>Estimated cost</div><div>US$ ${metrics.cost.toLocaleString()} /t</div>
      </div>
      ${gaps.length? `<div class="divider"></div><div class="small">Gaps: <ul>${gaps.map(g=>`<li>${g}</li>`).join('')}</ul></div>`: ''}
    </div>`;
  el.insertAdjacentHTML('afterbegin', html);
  if(isMobile()) openSidebar(); // asegúrate de ver el resultado en móvil
}

// ---- 9) UI EVENTS + Drawer logic ----
document.getElementById('btnMatch').addEventListener('click', async ()=>{
  const btn = document.getElementById('btnMatch');
  const r = document.getElementById('matchResource').value;
  const f = document.getElementById('matchFrom').value;
  const p = document.getElementById('matchProcess').value;
  const e = document.getElementById('matchExport').value;

  btn.disabled = true; btn.textContent = 'Calculating…';
  try{
    clearRoutes();
    const metrics = await drawRouteReal(f,p,e,r);
    showRouteCard({resource:r,from:f,process:p,exportTo:e,metrics});
  } finally {
    btn.disabled = false; btn.textContent = 'Generate Match';
  }
});

document.getElementById('btnAuto').addEventListener('click', async ()=>{
  const btn = document.getElementById('btnAuto');
  btn.disabled = true; btn.textContent = 'Calculating…';
  try{
    const keys = Object.keys(presets); const pick = presets[keys[Math.floor(Math.random()*keys.length)]];
    const r = pick.resource;
    const f = pick.from[0]; const p = pick.process[0];
    const e = pick.export[0];
    clearRoutes();
    const metrics = await drawRouteReal(f,p,e,r);
    showRouteCard({resource:r,from:f,process:p,exportTo:e,metrics});
  } finally {
    btn.disabled = false; btn.textContent = 'Recommended Chain';
  }
});

document.getElementById('btnLimpiar').addEventListener('click', ()=>{
  clearRoutes(); document.querySelector('#sidebar .panel-body').innerHTML = '<div class="subtle">Click a country to view details…</div>';
});

document.getElementById('search').addEventListener('keyup', (e)=>{
  if(e.key==='Enter'){
    const q = e.target.value.trim();
    const name = [...countryLayers.keys()].find(n => n.toLowerCase().includes(q.toLowerCase()))
                 || Object.keys(resourceData).find(n => n.toLowerCase().includes(q.toLowerCase()));
    if(name){
      const layer = countryLayers.get(name);
      if(layer && layer.getBounds){
        map.fitBounds(layer.getBounds(), {padding:[20,20]});
        renderSidebar(name, layer);
        if(isMobile()) openSidebar();
      }
    }
  }
});

document.getElementById('colorMode').addEventListener('change', (e)=>{
  const mode = e.target.value;
  if(!africaLayer) return;
  africaLayer.setStyle(feat=>{
    const name = feat.properties.name || feat.properties.ADMIN || feat.properties.NAME;
    const rd = lookupCountry(name);
    const fill = rd ? (mode==='stage'? stageColor(rd.dominant) : regionColor(rd.region)) : '#475569';
    return { color:'#0f172a', weight:1, fillColor:fill, fillOpacity:0.8 };
  });
});

// Drawer controls
const drawer = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleSidebar');
toggleBtn.addEventListener('click', ()=>{
  if(drawer.classList.contains('open')) closeSidebar(); else openSidebar();
});

function openSidebar(){
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden','false');
  toggleBtn.setAttribute('aria-expanded','true');
  setTimeout(()=> map.invalidateSize(), 250);
}
function closeSidebar(){
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden','true');
  toggleBtn.setAttribute('aria-expanded','false');
  setTimeout(()=> map.invalidateSize(), 250);
}

// Util: debounce
function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; }

// ---- 10) INIT ----
loadAfrica();
