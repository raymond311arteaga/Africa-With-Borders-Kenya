// ===================== app.js (Auto-Match + dataset ampliado + responsive drawer + OSRM + Kenya auto-focus) =====================

// ---- 1) DATA (ampliado con tus ejemplos) ----
// Stages: E=Extraction, P=Processing, T=Transport/Export
const resourceData = {
  "Democratic Republic of the Congo": { region:"Central Africa", dominant:"E", resources:[
    {name:"Cobalt", stage:"E/P (limited)", notes:"~68.8% of world cobalt (2019, USGS)"},
    {name:"Copper", stage:"E"},
    {name:"Gold", stage:"E"},
    {name:"Coltan/Tantalum", stage:"E"}
  ]},
  "South Africa": { region:"Southern Africa", dominant:"P", resources:[
    {name:"Chromium", stage:"E/P", notes:"~39.6% of world chromium (2019, USGS)"},
    {name:"PGMs", stage:"E/P"},
    {name:"Gold", stage:"E"},
    {name:"Thermal coal", stage:"E/P"},
    {name:"Automotive", stage:"P/T"}
  ]},
  "Namibia": { region:"Southern Africa", dominant:"E", resources:[
    {name:"Uranium", stage:"E", notes:"~10% world share (2019 region, USGS)"},
    {name:"Copper", stage:"E"},
    {name:"Fisheries", stage:"E/T"}
  ]},
  "Niger": { region:"West Africa", dominant:"E", resources:[
    {name:"Uranium", stage:"E", notes:"~5.5% world share (2019 region, USGS)"},
    {name:"Gold", stage:"E"},
    {name:"Livestock/hides", stage:"E/T"}
  ]},
  "Mozambique": { region:"Southern Africa", dominant:"P", resources:[
    {name:"Graphite", stage:"E/P (emerging)", notes:"Battery supply chain projects"},
    {name:"Aluminium (Mozal)", stage:"P"},
    {name:"Coal", stage:"E"},
    {name:"LNG", stage:"P/T"}
  ]},
  "Zimbabwe": { region:"Southern Africa", dominant:"E", resources:[
    {name:"Lithium", stage:"E/P (emerging)", notes:"Battery chain potential"},
    {name:"Gold", stage:"E"},
    {name:"Diamonds", stage:"E"},
    {name:"PGMs", stage:"E"}
  ]},
  "Tanzania": { region:"Horn/East Africa", dominant:"E", resources:[
    {name:"Rare earths", stage:"E (emerging)"},
    {name:"Gold", stage:"E"},
    {name:"Cashew", stage:"E/P (limited)"},
    {name:"Tobacco", stage:"E"},
    {name:"Coal", stage:"E"}
  ]},
  "Zambia": { region:"Southern Africa", dominant:"P", resources:[
    {name:"Copper", stage:"E/P", notes:"~763k t (2022); ~70% exports from mining"},
    {name:"Cobalt", stage:"E"}
  ]},
  "Ghana": { region:"West Africa", dominant:"E", resources:[
    {name:"Gold", stage:"E"},
    {name:"Cocoa", stage:"E/P (limited)"},
    {name:"Crude", stage:"E"}
  ]},
  "Côte d’Ivoire": { region:"West Africa", dominant:"P", resources:[
    {name:"Cocoa", stage:"P", notes:"Largest cocoa processor in Africa"},
    {name:"Gold", stage:"E"},
    {name:"Crude", stage:"E"}
  ]},
  "Guinea": { region:"West Africa", dominant:"E", resources:[
    {name:"Bauxite", stage:"E", notes:">7.4 Bt reserves"},
    {name:"Gold", stage:"E"},
    {name:"Iron", stage:"E"}
  ]},
  "Senegal": { region:"West Africa", dominant:"E", resources:[
    {name:"Gold", stage:"E"},
    {name:"Phosphates", stage:"E/P"},
    {name:"Fisheries", stage:"E"}
  ]},
  "Cameroon": { region:"Central Africa", dominant:"E", resources:[
    {name:"Crude", stage:"E"},
    {name:"Gas", stage:"E"},
    {name:"Cocoa", stage:"E/P (limited)"},
    {name:"Timber", stage:"E/T"}
  ]},
  "Gabon": { region:"Central Africa", dominant:"E", resources:[
    {name:"Crude", stage:"E"},
    {name:"Manganese", stage:"E"},
    {name:"Timber", stage:"E/T"}
  ]},
  "Angola": { region:"Central Africa", dominant:"E", resources:[
    {name:"Crude", stage:"E"},
    {name:"Diamonds", stage:"E"},
    {name:"Gas", stage:"E/P (limited)"}
  ]},
  "Egypt": { region:"North Africa", dominant:"P", resources:[
    {name:"LNG", stage:"P"},
    {name:"Crude", stage:"E"},
    {name:"Gold", stage:"E"},
    {name:"Phosphate fertilizers", stage:"P"}
  ]},
  "Algeria": { region:"North Africa", dominant:"P", resources:[
    {name:"Natural gas", stage:"E/P"},
    {name:"Crude", stage:"E"},
    {name:"N/P fertilizers", stage:"P"}
  ]},
  "Libya": { region:"North Africa", dominant:"E", resources:[
    {name:"Crude", stage:"E"},
    {name:"Gas", stage:"E (little processing)"}
  ]},
  "Morocco": { region:"North Africa", dominant:"P", resources:[
    {name:"Phosphates", stage:"E/P", notes:"Downstream (acid/fertilizers)"},
    {name:"Automotive (assembly)", stage:"P (advanced)"},
    {name:"Fruits/vegetables", stage:"E"}
  ]},
  "Nigeria": { region: "West Africa", dominant:"E", resources:[
    {name:"Crude oil", stage:"E"},
    {name:"Liquefied natural gas", stage:"P (limited)"},
    {name:"Refined products", stage:"T"}
  ], reserves:"High (oil/gas)"},
  "Ethiopia": { region:"Horn/East Africa", dominant:"E", resources:[
    {name:"Coffee", stage:"E/P (light roast)"},
    {name:"Gold", stage:"E"},
    {name:"Oilseeds", stage:"E"}
  ]},
  "Uganda": { region:"Horn/East Africa", dominant:"E", resources:[
    {name:"Gold", stage:"E"},
    {name:"Coffee", stage:"E/P (limited)"},
    {name:"Tea", stage:"E"}
  ]},
  "Kenya": { region:"Horn/East Africa", dominant:"T", resources:[
    {name:"Tea", stage:"E/P (limited)"},
    {name:"Cut flowers", stage:"E/T", notes:"Floriculture hub"},
    {name:"Coffee", stage:"E/P (limited)"},
    {name:"Mineral sands", stage:"E"}
  ]},
  // Añadidos del PDF que faltaban en el dataset previo:
  "Mali": { region:"West Africa", dominant:"E", resources:[
    {name:"Gold", stage:"E", notes:"Top export earner"},
    {name:"Cotton", stage:"E"},
    {name:"Salt", stage:"E"}
  ]},
  "Sudan": { region:"North/East Africa", dominant:"E", resources:[
    {name:"Gold", stage:"E", notes:"Often refined/exported via SA/Egypt in example chains"}
  ]}
};

// Capacidades (heurísticas)
const capabilities = {
  // Países con industria de procesamiento diversificada
  processing: new Set(["South Africa","Zambia","Morocco","Egypt","Algeria","Mozambique","Botswana","Côte d’Ivoire","Ghana"]),
  // Refinerías de petróleo/derivados destacables
  refineriesOil: new Set(["Egypt","South Africa","Morocco","Algeria","Nigeria"]),
  // Químicos de baterías / materiales avanzados (prioridad para Co/Li/Graphite/RE)
  batteryChem: new Set(["Morocco","South Africa","Mozambique","Zimbabwe","Zambia"]),
  // Puertos fuertes
  portsStrong: new Set(["South Africa","Morocco","Mozambique","Kenya","Namibia","Egypt","Tanzania","Senegal","Ghana","Nigeria"])
};

// Cadenas “preset” de ejemplo (para el botón Recommended Chain)
const presets = {
  "Metals (Cu/Co → Battery materials)": {
    resource:"Cobalt/Copper",
    from:["Democratic Republic of the Congo","Zambia"],
    process:["Zambia","Morocco","South Africa"],
    export:["South Africa","Morocco"]
  },
  "Bauxite → Aluminium": {
    resource:"Bauxite/Aluminium",
    from:["Guinea"],
    process:["Mozambique","South Africa"],
    export:["South Africa"]
  },
  "Crude → Refinery → Export": {
    resource:"Oil/Gas",
    from:["Nigeria","Angola","Libya"],
    process:["Egypt","South Africa","Morocco","Algeria"],
    export:["Morocco","South Africa","Egypt"]
  },
  "Cocoa → Chocolate": {
    resource:"Cocoa/Food",
    from:["Côte d’Ivoire","Ghana"],
    process:["Côte d’Ivoire","Ghana","South Africa"],
    export:["South Africa","Morocco"]
  }
};

// ---- 2) MAP INIT + labels blancas ----
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
    'Namibia':{lat:-22.55,lng:17.07}, 'Senegal':{lat:14.5,lng:-14.4}, 'Angola':{lat:-12.3,lng:17.5},
    'Morocco':{lat:31.8,lng:-7.09}, 'Zimbabwe':{lat:-19.0,lng:30.0}, 'Tanzania':{lat:-6.37,lng:34.89},
    'Mali':{lat:17.6,lng:-3.99}, 'Sudan':{lat:15.6,lng:30.2}
  };
  return fallback[name] || map.getCenter();
}
function distanceKM(a,b){
  const R=6371; const dLat=(b.lat-a.lat)*Math.PI/180; const dLng=(b.lng-a.lng)*Math.PI/180;
  const s1=Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(s1));
}
function categoryColor(resource){
  const r = (resource||'').toLowerCase();
  if(r.includes('oil')||r.includes('gas')||r.includes('crude')) return getVar('--OIL');
  if(r.includes('baux')||r.includes('cobal')||r.includes('copper')||r.includes('chrom')||r.includes('uran')||r.includes('graph')||r.includes('lith')||r.includes('rare')||r.includes('gold')||r.includes('diam')) return getVar('--MET');
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

// ---- 4) PORT COORDS (representative export port per country) ----
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
        if(isMobile()) openSidebar();
      });
      layer.on('mouseover',()=> layer.setStyle({weight:1.4}));
      layer.on('mouseout',()=> layer.setStyle({weight:1}));
    }
  }).addTo(map);

  map.fitBounds(africaLayer.getBounds(),{padding:[20,20]});

  // Fill selectors & picker
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

  // ✅ Auto-focus en Kenya
  const kenyaLayer = countryLayers.get('Kenya');
  if (kenyaLayer) {
    map.fitBounds(kenyaLayer.getBounds(), { padding:[20,20] });
    renderSidebar('Kenya', kenyaLayer);
    if(isMobile()) openSidebar();
  }

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

// ---- 7) SIDEBAR RENDER ----
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

// ---- 8) MATCH ENGINE 2.0 (Auto-Match si dejas Processing y Export en auto) ----
function populateSelectors(){
  // Recursos base a partir del dataset + transición energética
  const resSet = new Set(["Cobalt","Copper","Chromium","Uranium","Graphite","Lithium","Rare earths","Bauxite","Phosphates","Crude oil","Cocoa","Coffee","Gold","Diamonds"]);
  for(const v of Object.values(resourceData)) v.resources?.forEach(r=>resSet.add(r.name.split(' ')[0]));
  const resources = Array.from(resSet).sort();

  const countries = Object.keys(resourceData).sort();

  document.getElementById('matchResource').innerHTML = resources.map(x=>`<option>${x}</option>`).join('');
  document.getElementById('matchFrom').innerHTML     = countries.map(x=>`<option>${x}</option>`).join('');
  document.getElementById('matchProcess').innerHTML  = `<option value="">(auto)</option>` + countries.map(x=>`<option>${x}</option>`).join('');
  document.getElementById('matchExport').innerHTML   = `<option value="">(auto)</option>` + countries.map(x=>`<option>${x}</option>`).join('');
}

function resourceKeyword(r){
  const s = (r||'').toLowerCase();
  if(s.includes('cobalt')) return 'cobalt';
  if(s.includes('lith')) return 'lithium';
  if(s.includes('graph')) return 'graphite';
  if(s.includes('rare')) return 'rare';
  if(s.includes('chrom')) return 'chromium';
  if(s.includes('uran')) return 'uranium';
  if(s.includes('baux')) return 'bauxite';
  if(s.includes('phosph')) return 'phosphates';
  if(s.includes('crude')||s.includes('oil')||s.includes('gas')) return 'oil';
  if(s.includes('cocoa')) return 'cocoa';
  if(s.includes('coffee')) return 'coffee';
  if(s.includes('gold')) return 'gold';
  if(s.includes('diamond')) return 'diamonds';
  if(s.includes('copper')) return 'copper';
  return 'generic';
}

function candidatesFor(resourceKey){
  const all = Object.keys(resourceData);
  let procPref = all;
  let portPref = all.filter(c=>capabilities.portsStrong.has(c));
  // Prioridades por tipo
  if(['cobalt','lithium','graphite','rare'].includes(resourceKey)){
    procPref = all.filter(c=>capabilities.batteryChem.has(c) || capabilities.processing.has(c));
  } else if(resourceKey==='oil'){
    procPref = all.filter(c=>capabilities.refineriesOil.has(c) || capabilities.processing.has(c));
  } else {
    procPref = all.filter(c=>capabilities.processing.has(c));
  }
  if(portPref.length===0) portPref = all; // fallback
  return {procPref, portPref};
}

async function bestMatch(fromCountry, resourceName){
  const A = layerCenter(fromCountry);
  // Si no se especifica recurso, toma el primero con etapa E
  let r = resourceName;
  if(!r){
    const info = resourceData[fromCountry];
    r = info?.resources?.find(x=>String(x.stage).startsWith('E'))?.name || info?.resources?.[0]?.name || 'Metals';
  }
  const key = resourceKeyword(r);
  const { procPref, portPref } = candidatesFor(key);

  let best = null;

  for(const p of procPref){
    if(p===fromCountry) continue;
    const B = layerCenter(p);
    for(const e of portPref){
      const port = PORT_COORDS[e];
      const C = port ? {lat:port.lat, lng:port.lng} : layerCenter(e);

      // Distancia estimada (rápido). Para decidir score uso gran-N, y luego OSRM al final.
      const kmEst = distanceKM(A,B) + distanceKM(B,C);

      // Bonos por capacidad
      let bonus = 0;
      if(capabilities.processing.has(p)) bonus += 200;
      if(capabilities.portsStrong.has(e)) bonus += 150;
      if(key==='oil' && capabilities.refineriesOil.has(p)) bonus += 500;
      if(['cobalt','lithium','graphite','rare'].includes(key) && capabilities.batteryChem.has(p)) bonus += 500;

      // Score final a minimizar (distancia penaliza; capacidades restan)
      const score = kmEst*1.0 - bonus;

      if(!best || score < best.score){
        best = { p, e, score, kmEst };
      }
    }
  }

  // Si nada salió (muy raro), fallback obvio
  if(!best){
    const fallbackP = procPref[0] || fromCountry;
    const fallbackE = portPref[0] || fromCountry;
    best = { p: fallbackP, e: fallbackE, score: 1e12, kmEst: 99999 };
  }

  // Ahora sí, trazamos con OSRM y devolvemos métricas reales
  const metrics = await drawRouteReal(fromCountry, best.p, best.e, r);
  return { resource:r, process: best.p, exportTo: best.e, metrics };
}

function clearRoutes(){ drawn.splice(0).forEach(l=> map.removeLayer(l)); }

function showRouteCard({resource,from,process,exportTo,metrics}){
  const el = document.querySelector('#sidebar .panel-body');
  const gaps = [];
  // Diagnósticos / brechas
  if(resourceKeyword(resource)==='oil' && !capabilities.refineriesOil.has(process)) gaps.push('🛢️ Limited refinery capacity for oil');
  if(['cobalt','lithium','graphite','rare'].includes(resourceKeyword(resource)) && !capabilities.batteryChem.has(process)) gaps.push('🔋 Limited battery-chem capacity');
  if(!capabilities.processing.has(process)) gaps.push('⚙️ Limited general processing capacity');
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
  if(isMobile()) openSidebar();
}

// ---- 9) UI EVENTS + Drawer logic ----
document.getElementById('btnMatch').addEventListener('click', async ()=>{
  const btn = document.getElementById('btnMatch');
  const r = document.getElementById('matchResource').value || '';
  const f = document.getElementById('matchFrom').value || '';
  let p = document.getElementById('matchProcess').value || '';
  let e = document.getElementById('matchExport').value || '';

  if(!f){
    alert('Pick at least a "From country" to generate a match.');
    return;
  }

  btn.disabled = true; btn.textContent = 'Calculating…';
  try{
    clearRoutes();
    let result;
    // Si process/export están en "(auto)" o vacíos -> calcular mejor combinación
    if(!p || !e){
      result = await bestMatch(f, r);
    } else {
      // Usuario fijó todo: usarlo tal cual
      const metrics = await drawRouteReal(f,p,e,r || (resourceData[f]?.resources?.[0]?.name || 'Metals'));
      result = { resource: r || 'Metals', process:p, exportTo:e, metrics };
    }
    showRouteCard({resource:result.resource, from:f, process:result.process, exportTo:result.exportTo, metrics:result.metrics});
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

// Drawer controls (definidos en index/styles responsivos)
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

// ---- 11) drawRouteReal (usa OSRM + costo heurístico) ----
async function drawRouteReal(aName, bName, cCountry, resource){
  const A = layerCenter(aName);     // origin
  const B = layerCenter(bName);     // processing
  const port = PORT_COORDS[cCountry];
  const C = port ? {lat:port.lat, lng:port.lng} : layerCenter(cCountry); // export endpoint

  const color = categoryColor(resource);

  // Segmento 1: A -> B via OSRM (fallback recta)
  const r1 = await osrmRoute(A,B);
  const pl1 = L.polyline(r1.coords,{color,weight:4,opacity:0.9}).addTo(map);

  // Segmento 2: B -> C via OSRM (fallback recta, dashed)
  const r2 = await osrmRoute(B,C);
  const pl2 = L.polyline(r2.coords,{color,weight:4,opacity:0.9,dashArray:'6 6'}).addTo(map);

  drawn.push(pl1,pl2);

  const km = Math.round(r1.km + r2.km);

  // Cost model (heurístico simple)
  const base = 0.12; // USD per t/km
  const key = resourceKeyword(resource);
  const processBonus = (key==='oil' && capabilities.refineriesOil.has(bName)) || (['cobalt','lithium','graphite','rare'].includes(key) && capabilities.batteryChem.has(bName));
  const processFactor = processBonus ? 0.85 : (capabilities.processing.has(bName) ? 0.9 : 1.1);
  const portFactor = capabilities.portsStrong.has(cCountry) ? 0.85 : 1.05;
  const cost = Math.round((km*base*processFactor*portFactor)*100)/100;

  return { km, cost, exportPort: port?.name || cCountry };
}
