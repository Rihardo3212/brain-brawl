<script>
  // World map (Leaflet, loaded only when needed).
  // mode 'pick': tap to place your pin (phone). mode 'show': everyone's pins + the answer (big screen).
  import { onMount, onDestroy } from 'svelte';

  let {
    mode = 'pick',
    color = '#ff8a1f',
    value = null, // pick: current pin {lat, lng}
    onPick = () => {},
    locked = false,
    pins = [], // show: [{ id, lat, lng, color, avatar, name, best }]
    answer = null, // show: {lat, lng}
    height = '100%'
  } = $props();

  let el;
  let L;
  let map;
  let mine; // pick marker
  let layer; // show layer
  let timers = [];
  let ready = $state(false);

  // Free OpenStreetMap tiles (no key; light use + attribution required).
  const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  const pinIcon = (c, inner = '') => L.divIcon({
    className: 'bb-pin',
    html: `<div class="bb-pin-body" style="--pc:${c}">${inner}</div>`,
    iconSize: [36, 46],
    iconAnchor: [18, 44]
  });
  const avatarIcon = (p) => L.divIcon({
    className: 'bb-pin',
    html: `<div class="bb-pin-body av" style="--pc:${p.color}">${p.avatar ? `<img src="${p.avatar}" alt="">` : ''}</div>`,
    iconSize: [52, 64],
    iconAnchor: [26, 62]
  });
  const goalIcon = () => L.divIcon({ className: 'bb-goal', html: '<div class="bb-goal-body">⭐</div>', iconSize: [60, 60], iconAnchor: [30, 30] });

  onMount(async () => {
    const mod = await import('leaflet');
    await import('leaflet/dist/leaflet.css');
    L = mod.default || mod;
    if (!el) return;
    map = L.map(el, {
      worldCopyJump: true,
      minZoom: 1,
      maxZoom: 18,
      zoomSnap: 0.25,
      zoomControl: mode === 'pick',
      attributionControl: true,
      maxBounds: [[-88, -400], [88, 400]],
      maxBoundsViscosity: 0.8
    });
    L.tileLayer(TILES, { attribution: ATTR, maxZoom: 19 }).addTo(map);
    map.fitBounds([[-50, -150], [70, 160]]);
    if (mode === 'pick') {
      map.on('click', (e) => {
        if (locked) return;
        const ll = e.latlng.wrap();
        onPick({ lat: ll.lat, lng: ll.lng });
      });
    } else {
      layer = L.layerGroup().addTo(map);
    }
    ready = true;
  });

  onDestroy(() => {
    timers.forEach(clearTimeout);
    map?.remove();
  });

  // Phone: keep the marker in sync with the chosen spot.
  $effect(() => {
    if (!ready || mode !== 'pick') return;
    if (value) {
      if (!mine) mine = L.marker([value.lat, value.lng], { icon: pinIcon(color), interactive: false }).addTo(map);
      else mine.setLatLng([value.lat, value.lng]);
    } else if (mine) {
      mine.remove();
      mine = null;
    }
  });

  // Big screen: show pins first, then the answer with lines, then zoom to fit.
  let shownKey = '';
  $effect(() => {
    if (!ready || mode !== 'show') return;
    const key = JSON.stringify([pins.map((p) => [p.id, p.lat, p.lng]), answer]);
    if (key === shownKey) return;
    shownKey = key;
    timers.forEach(clearTimeout);
    timers = [];
    layer.clearLayers();
    map.fitBounds([[-50, -150], [70, 160]]);

    pins.forEach((p, i) => {
      timers.push(setTimeout(() => {
        L.marker([p.lat, p.lng], { icon: avatarIcon(p), zIndexOffset: p.best ? 500 : 0 }).addTo(layer);
      }, 200 + i * 150));
    });
    if (!answer) return;
    const t0 = 700 + pins.length * 150;
    timers.push(setTimeout(() => {
      // Draw each line on the shorter way around the globe.
      for (const p of pins) {
        let lng = p.lng;
        while (lng - answer.lng > 180) lng -= 360;
        while (answer.lng - lng > 180) lng += 360;
        L.polyline([[p.lat, lng], [answer.lat, answer.lng]], {
          color: p.color, weight: p.best ? 5 : 3, opacity: p.best ? 0.95 : 0.55, dashArray: '2 10', lineCap: 'round', className: 'bb-line'
        }).addTo(layer);
      }
      L.marker([answer.lat, answer.lng], { icon: goalIcon(), zIndexOffset: 1000 }).addTo(layer);
    }, t0));
    timers.push(setTimeout(() => {
      const pts = [[answer.lat, answer.lng]];
      for (const p of pins) {
        let lng = p.lng;
        while (lng - answer.lng > 180) lng -= 360;
        while (answer.lng - lng > 180) lng += 360;
        pts.push([p.lat, lng]);
      }
      const b = L.latLngBounds(pts);
      if (pts.length === 1 || b.getNorthEast().distanceTo(b.getSouthWest()) < 30000) map.flyTo([answer.lat, answer.lng], 9, { duration: 2.2 });
      else map.flyToBounds(b, { padding: [70, 70], maxZoom: 11, duration: 2.2 });
    }, t0 + 900));
  });
</script>

<div class="pinmap" style="height:{height}" bind:this={el}></div>

<style>
  .pinmap { width: 100%; border-radius: 22px; overflow: hidden; background: #aad3df; z-index: 0; }
  :global(.bb-pin) { background: none; border: none; }
  :global(.bb-pin-body) {
    width: 100%; height: calc(100% - 10px); border-radius: 50% 50% 50% 0; transform: rotate(-45deg) translate(4px, -4px);
    background: var(--pc); border: 3px solid #fff; box-shadow: 0 6px 14px rgba(0, 0, 0, 0.35);
    display: grid; place-items: center; overflow: hidden;
    animation: bb-drop 0.45s cubic-bezier(0.2, 1.6, 0.4, 1);
  }
  :global(.bb-pin-body img) { width: 78%; height: 78%; border-radius: 50%; transform: rotate(45deg); background: #fff; object-fit: cover; }
  :global(.bb-goal) { background: none; border: none; }
  :global(.bb-goal-body) {
    width: 60px; height: 60px; border-radius: 50%; display: grid; place-items: center; font-size: 34px;
    background: #fff; box-shadow: 0 0 0 6px rgba(255, 196, 0, 0.6), 0 0 40px rgba(255, 196, 0, 0.9);
    animation: bb-goal 0.6s cubic-bezier(0.2, 1.6, 0.4, 1);
  }
  :global(.bb-line) { animation: bb-dash 1.2s linear infinite; }
  @keyframes -global-bb-drop { from { transform: rotate(-45deg) translate(30px, -30px); opacity: 0; } }
  @keyframes -global-bb-goal { from { transform: scale(0); } }
  @keyframes -global-bb-dash { to { stroke-dashoffset: -24; } }
</style>
