import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export interface LeafletMapHandle {
  recenter: (center: { lat: number; lng: number }, zoom?: number) => void;
  /** Remplace l'illustration des prestataires sur la carte (sans recharger),
   *  ex. quand l'utilisateur change de moyen de transport. */
  setProviderIcon: (uri: string) => void;
}

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWJpc2hhaXlwIiwiYSI6ImNtcXMzem50NTA0MncycnNhbmd2bXMzc3AifQ.y16QxZgfQbPsxLa6xSpwrA';

interface Marker {
  lat: number;
  lng: number;
  type: 'origin' | 'destination' | 'driver' | 'user';
  heading?: number; // degrees, 0 = up/north — only used by 'user'
}

interface RouteConfig {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  animateDuration?: number;
}

interface Props {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: Marker[];
  route?: RouteConfig;
  searchingCars?: boolean;
  mapStyle?: string;
  tintWater?: boolean;
  /** Allège la basemap (masque verdure/landuse, POIs, bâtiments, transports) pour
   *  dégager la lecture du trajet (façon Yango). */
  declutter?: boolean;
  /** Marges (px) du cadrage `fitBounds` du trajet. Renseigner `bottom` avec la
   *  hauteur de la feuille pour que le trajet soit centré dans la zone *visible*
   *  (au-dessus de la feuille) et non dans le viewport entier. */
  fitPadding?: { top?: number; bottom?: number; left?: number; right?: number };
  /** Prestataires disponibles aux alentours (façon Yango) : marqueurs illustrés
   *  qui dérivent doucement autour du départ. */
  providers?: { lat: number; lng: number }[];
  /** URI de l'illustration utilisée pour les marqueurs prestataires (moto/auto). */
  providerIcon?: string;
  /** Émis (throttlé) pendant que l'utilisateur déplace la carte — sert au
   *  choix d'un point « sur la carte » (pin fixe, carte mobile dessous). */
  onCenterChange?: (c: { lat: number; lng: number }) => void;
  style?: object;
}

const getMapHTML = (
  center: { lat: number; lng: number },
  zoom: number,
  markers: Marker[],
  route?: RouteConfig,
  searchingCars = false,
  mapStyle = 'mapbox://styles/mapbox/navigation-day-v1',
  tintWater = false,
  declutter = false,
  fitPadding: Props['fitPadding'] = undefined,
  providers: Props['providers'] = [],
  providerIcon = ''
) => {
  const markersJSON = JSON.stringify(markers);
  const routeJSON = route ? JSON.stringify(route) : 'null';
  // Marges de cadrage du trajet (asymétriques pour dégager la feuille en bas).
  const fitPad = { top: 80, bottom: 80, left: 48, right: 48, ...(fitPadding || {}) };
  const fitPadJSON = JSON.stringify(fitPad);
  const providersJSON = JSON.stringify(providers);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link href="https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.css" rel="stylesheet">
  <script src="https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; overflow: hidden; }
    .mapboxgl-ctrl-logo, .mapboxgl-ctrl-attrib { display: none !important; }
    /* Cercles « donut » (façon Yango) : anneau fin bleu marque foncé (blue-900),
       centre blanc — mêmes pour le départ et l'arrivée. */
    .dot-origin, .dot-destination {
      width: 18px; height: 18px;
      background: #FFFFFF; border: 3px solid #0D459B; border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.30);
    }
    .driver-icon {
      font-size: 26px; line-height: 1;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    }
    /* Prestataires disponibles aux alentours : illustration 3D (moto/auto).
       Calibre Yango : petit marqueur lisible sans masquer la carto. */
    .provider-icon { width: 32px; height: 32px; pointer-events: none; }
    .provider-icon img {
      width: 100%; height: 100%; display: block;
      filter: drop-shadow(0 2px 3px rgba(0,0,0,0.25));
      transition: opacity 0.2s ease;
    }
    .user-marker { position: relative; width: 18px; height: 18px; }
    .user-accuracy {
      position: absolute; top: 50%; left: 50%;
      width: 48px; height: 48px; border-radius: 50%;
      background: rgba(0,102,255,0.12);
      transform: translate(-50%, -50%);
    }
    .user-beam {
      position: absolute; top: 50%; left: 50%;
      width: 62px; height: 70px;
      transform-origin: 50% 100%;
      background: linear-gradient(to top, rgba(0,102,255,0.50), rgba(0,102,255,0));
      clip-path: polygon(50% 100%, 6% 0, 94% 0);
      pointer-events: none;
    }
    .user-dot {
      position: absolute; top: 50%; left: 50%;
      width: 16px; height: 16px; border-radius: 50%;
      background: #0066FF; border: 3px solid #fff;
      transform: translate(-50%, -50%);
      box-shadow: 0 1px 5px rgba(0,0,0,0.35);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    if (!mapboxgl.supported()) {
      document.getElementById('map').style.background = '#e8e8e8';
    } else {
      mapboxgl.accessToken = '${MAPBOX_TOKEN}';
      var map = new mapboxgl.Map({
        container: 'map',
        style: '${mapStyle}',
        center: [${center.lng}, ${center.lat}],
        zoom: ${zoom},
        attributionControl: false,
        logoPosition: 'bottom-right'
      });

      var markersData = ${markersJSON};
      var routeConfig = ${routeJSON};
      var fitPad = ${fitPadJSON};
      var providersData = ${providersJSON};
      var providerIcon = ${JSON.stringify(providerIcon)};

      markersData.forEach(function(m) {
        var el = document.createElement('div');
        if (m.type === 'driver') {
          el.className = 'driver-icon';
          el.innerText = '🚗';
          window._driverMarker = new mapboxgl.Marker({ element: el })
            .setLngLat([m.lng, m.lat]).addTo(map);
        } else if (m.type === 'origin') {
          el.className = 'dot-origin';
          new mapboxgl.Marker({ element: el }).setLngLat([m.lng, m.lat]).addTo(map);
        } else if (m.type === 'destination') {
          el.className = 'dot-destination';
          new mapboxgl.Marker({ element: el }).setLngLat([m.lng, m.lat]).addTo(map);
        } else if (m.type === 'user') {
          el.className = 'user-marker';
          var hdg = m.heading || 0;
          el.innerHTML =
            '<div class="user-accuracy"></div>' +
            '<div class="user-beam" style="transform: translate(-50%,-100%) rotate(' + hdg + 'deg)"></div>' +
            '<div class="user-dot"></div>';
          new mapboxgl.Marker({ element: el }).setLngLat([m.lng, m.lat]).addTo(map);
        }
      });

      if (${searchingCars}) {
        var SC_LAT = ${center.lat};
        var SC_LNG = ${center.lng};
        var SC_CONFIGS = [
          { dlat: 0.0030, dlng: 0.0020, ph: 0.0 },
          { dlat: -0.0022, dlng: 0.0040, ph: 1.3 },
          { dlat: 0.0012, dlng: -0.0048, ph: 2.6 },
          { dlat: -0.0038, dlng: -0.0018, ph: 3.9 },
        ];
        var scMarkers = SC_CONFIGS.map(function(c) {
          var el = document.createElement('div');
          el.className = 'driver-icon';
          el.innerText = '🚗';
          var m = new mapboxgl.Marker({ element: el })
            .setLngLat([SC_LNG + c.dlng, SC_LAT + c.dlat]).addTo(map);
          return { m: m, baseLat: SC_LAT + c.dlat, baseLng: SC_LNG + c.dlng, ph: c.ph };
        });
        var sc_t = 0;
        setInterval(function() {
          sc_t += 1;
          scMarkers.forEach(function(c) {
            var newLat = c.baseLat + Math.sin(sc_t * 0.018 + c.ph) * 0.0010;
            var newLng = c.baseLng + Math.cos(sc_t * 0.022 + c.ph) * 0.0013;
            c.m.setLngLat([newLng, newLat]);
          });
        }, 150);
      }

      // Prestataires aux alentours (façon Yango) : marqueurs illustrés qui
      // dérivent doucement. L'illustration (moto/auto) est échangeable à chaud
      // via le message 'setProviderIcon' (changement de moyen de transport).
      window._providerMarkers = [];
      function buildProviders() {
        if (!providersData || !providersData.length) return;
        window._providerMarkers = providersData.map(function(p, i) {
          var el = document.createElement('div');
          el.className = 'provider-icon';
          var img = document.createElement('img');
          if (providerIcon) img.src = providerIcon;
          el.appendChild(img);
          var m = new mapboxgl.Marker({ element: el })
            .setLngLat([p.lng, p.lat]).addTo(map);
          // Chaque véhicule roule le long d'un cap qui dérive lentement, à une
          // vitesse propre — mouvement varié et organique sur toute la carte.
          return {
            m: m, img: img, lng: p.lng, lat: p.lat,
            heading: (i * 2.39996),                       // caps initiaux dispersés
            turn: (i % 2 ? 1 : -1) * 0.00003,             // rad/ms : virage lent
            speed: 0.00000006 + (i % 3) * 0.00000002,     // deg/ms ≈ 22–30 km/h
          };
        });
        // Deplacement continu via requestAnimationFrame (~60 fps) : fluide, sans
        // les sauts d'un setInterval. dt borne pour absorber les pauses (onglet
        // inactif) sans teleportation.
        var last = null;
        function tick(ts) {
          if (last === null) last = ts;
          var dt = ts - last; last = ts;
          if (dt > 80) dt = 16;
          window._providerMarkers.forEach(function(c) {
            c.heading += c.turn * dt;
            c.lng += Math.cos(c.heading) * c.speed * dt;
            c.lat += Math.sin(c.heading) * c.speed * dt;
            c.m.setLngLat([c.lng, c.lat]);
          });
          requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }

      // Émet le centre de la carte vers RN (throttlé) pour le choix sur carte.
      function emitCenter() {
        var c = map.getCenter();
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'center', lat: c.lat, lng: c.lng }));
        }
      }
      var _lastEmit = 0;
      map.on('move', function() {
        var now = Date.now();
        if (now - _lastEmit > 100) { _lastEmit = now; emitCenter(); }
      });
      map.on('moveend', emitCenter);

      map.on('load', function() {
        if (${tintWater}) {
          // Heetch-like soft blue water on the light style. POIs/place labels are kept.
          ['water', 'water-shadow'].forEach(function(id) {
            try { map.setPaintProperty(id, 'fill-color', '#AFCBEF'); } catch(e) {}
          });
        }
        if (${declutter}) {
          // Dégage la carte : masque verdure/landuse, POIs, bâtiments, transports
          // et labels naturels — on garde routes, eau et noms de lieux. Le trajet
          // (vert) ressort ainsi nettement.
          var KILL = /landuse|landcover|national-park|park|pitch|golf|poi|transit|building|natural-|aeroway/i;
          (map.getStyle().layers || []).forEach(function(ly) {
            if (KILL.test(ly.id)) { try { map.setLayoutProperty(ly.id, 'visibility', 'none'); } catch(e) {} }
          });
        }
        if (routeConfig) fetchAndAnimateRoute(routeConfig);
        buildProviders();
      });

      function fetchAndAnimateRoute(config) {
        var url = 'https://api.mapbox.com/directions/v5/mapbox/driving/'
          + config.from.lng + ',' + config.from.lat + ';'
          + config.to.lng + ',' + config.to.lat
          + '?geometries=geojson&access_token=' + mapboxgl.accessToken;
        fetch(url)
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (!data.routes || !data.routes.length) return;
            var coords = data.routes[0].geometry.coordinates;
            map.addSource('route', {
              type: 'geojson',
              data: { type: 'Feature', geometry: { type: 'LineString', coordinates: coords } }
            });
            map.addLayer({
              id: 'route', type: 'line', source: 'route',
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: { 'line-color': '#0066FF', 'line-width': 5, 'line-opacity': 0.95 }
            });
            var bounds = coords.reduce(function(b, c) {
              return b.extend(c);
            }, new mapboxgl.LngLatBounds(coords[0], coords[0]));
            map.fitBounds(bounds, { padding: fitPad, duration: 1200 });
            if (config.animateDuration && config.animateDuration > 0 && window._driverMarker) {
              animateAlongRoute(coords, config.animateDuration);
            }
          })
          .catch(function() {});
      }

      function animateAlongRoute(coords, duration) {
        var start = null;
        var n = coords.length;
        function frame(ts) {
          if (!start) start = ts;
          var t = Math.min((ts - start) / duration, 1);
          var exact = t * (n - 1);
          var i = Math.floor(exact);
          var frac = exact - i;
          var coord = i >= n - 1 ? coords[n - 1] : [
            coords[i][0] + (coords[i + 1][0] - coords[i][0]) * frac,
            coords[i][1] + (coords[i + 1][1] - coords[i][1]) * frac
          ];
          if (window._driverMarker) window._driverMarker.setLngLat(coord);
          if (t < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      }

      window.addEventListener('message', function(e) {
        try {
          var d = JSON.parse(e.data);
          if (d.type === 'moveDriver' && window._driverMarker) {
            window._driverMarker.setLngLat([d.lng, d.lat]);
          }
          if (d.type === 'fitBounds' && d.bounds) {
            map.fitBounds(d.bounds, { padding: 60 });
          }
          if (d.type === 'flyTo') {
            map.flyTo({ center: [d.lng, d.lat], zoom: d.zoom || map.getZoom(), duration: 900, essential: true });
          }
          if (d.type === 'setProviderIcon') {
            providerIcon = d.uri || '';
            (window._providerMarkers || []).forEach(function(c) {
              if (c.img && providerIcon) c.img.src = providerIcon;
            });
          }
        } catch(err) {}
      });
      document.addEventListener('message', function(e) {
        window.dispatchEvent(new MessageEvent('message', { data: e.data }));
      });
    }
  </script>
</body>
</html>`;
};

const LeafletMap = forwardRef<LeafletMapHandle, Props>(function LeafletMap(
  { center, zoom = 14, markers = [], route, searchingCars = false, mapStyle, tintWater = false, declutter = false, fitPadding, providers = [], providerIcon = '', onCenterChange, style },
  ref
) {
  const webRef = useRef<WebView>(null);

  useImperativeHandle(ref, () => ({
    recenter: (c, z) => {
      webRef.current?.postMessage(JSON.stringify({ type: 'flyTo', lng: c.lng, lat: c.lat, zoom: z }));
    },
    setProviderIcon: (uri) => {
      webRef.current?.postMessage(JSON.stringify({ type: 'setProviderIcon', uri }));
    },
  }));

  return (
    <WebView
      ref={webRef}
      source={{ html: getMapHTML(center, zoom, markers, route, searchingCars, mapStyle, tintWater, declutter, fitPadding, providers, providerIcon) }}
      style={[styles.map, style]}
      scrollEnabled={false}
      javaScriptEnabled
      domStorageEnabled
      originWhitelist={['*']}
      mixedContentMode="always"
      onMessage={(e) => {
        if (!onCenterChange) return;
        try {
          const d = JSON.parse(e.nativeEvent.data);
          if (d.type === 'center') onCenterChange({ lat: d.lat, lng: d.lng });
        } catch {}
      }}
    />
  );
});

export default LeafletMap;

const styles = StyleSheet.create({
  map: { flex: 1 },
});
