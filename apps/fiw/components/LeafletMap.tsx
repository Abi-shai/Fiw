import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export interface LeafletMapHandle {
  recenter: (center: { lat: number; lng: number }, zoom?: number) => void;
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
  tintWater = false
) => {
  const markersJSON = JSON.stringify(markers);
  const routeJSON = route ? JSON.stringify(route) : 'null';

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
    .dot-origin {
      width: 16px; height: 16px;
      background: #0F6B3D; border: 3px solid white; border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.35);
    }
    .dot-destination {
      width: 16px; height: 16px;
      background: #EF4444; border: 3px solid white; border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.35);
    }
    .driver-icon {
      font-size: 26px; line-height: 1;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
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
        if (routeConfig) fetchAndAnimateRoute(routeConfig);
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
              paint: { 'line-color': '#0F6B3D', 'line-width': 5, 'line-opacity': 0.85 }
            });
            var bounds = coords.reduce(function(b, c) {
              return b.extend(c);
            }, new mapboxgl.LngLatBounds(coords[0], coords[0]));
            map.fitBounds(bounds, { padding: 80, duration: 1200 });
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
  { center, zoom = 14, markers = [], route, searchingCars = false, mapStyle, tintWater = false, onCenterChange, style },
  ref
) {
  const webRef = useRef<WebView>(null);

  useImperativeHandle(ref, () => ({
    recenter: (c, z) => {
      webRef.current?.postMessage(JSON.stringify({ type: 'flyTo', lng: c.lng, lat: c.lat, zoom: z }));
    },
  }));

  return (
    <WebView
      ref={webRef}
      source={{ html: getMapHTML(center, zoom, markers, route, searchingCars, mapStyle, tintWater) }}
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
