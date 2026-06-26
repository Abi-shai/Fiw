import React, { useRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWJpc2hhaXlwIiwiYSI6ImNtcXMzem50NTA0MncycnNhbmd2bXMzc3AifQ.y16QxZgfQbPsxLa6xSpwrA';

interface Marker {
  lat: number;
  lng: number;
  type: 'prestataire' | 'client' | 'destination';
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
  style?: object;
}

const getMapHTML = (
  center: { lat: number; lng: number },
  zoom: number,
  markers: Marker[],
  route?: RouteConfig
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
    .dot-client {
      width: 16px; height: 16px;
      background: #0F6B3D; border: 3px solid white; border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.35);
    }
    .dot-destination {
      width: 16px; height: 16px;
      background: #EF4444; border: 3px solid white; border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.35);
    }
    .presta-icon {
      font-size: 26px; line-height: 1;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
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
        style: 'mapbox://styles/mapbox/navigation-day-v1',
        center: [${center.lng}, ${center.lat}],
        zoom: ${zoom},
        attributionControl: false,
        logoPosition: 'bottom-right'
      });

      var markersData = ${markersJSON};
      var routeConfig = ${routeJSON};

      markersData.forEach(function(m) {
        var el = document.createElement('div');
        if (m.type === 'prestataire') {
          el.className = 'presta-icon';
          el.innerText = '🛵';
          window._prestaMarker = new mapboxgl.Marker({ element: el })
            .setLngLat([m.lng, m.lat]).addTo(map);
        } else if (m.type === 'client') {
          el.className = 'dot-client';
          new mapboxgl.Marker({ element: el }).setLngLat([m.lng, m.lat]).addTo(map);
        } else if (m.type === 'destination') {
          el.className = 'dot-destination';
          new mapboxgl.Marker({ element: el }).setLngLat([m.lng, m.lat]).addTo(map);
        }
      });

      map.on('load', function() {
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
              paint: { 'line-color': '#073D23', 'line-width': 5, 'line-opacity': 0.85 }
            });
            var bounds = coords.reduce(function(b, c) {
              return b.extend(c);
            }, new mapboxgl.LngLatBounds(coords[0], coords[0]));
            map.fitBounds(bounds, { padding: 80, duration: 1200 });
            if (config.animateDuration && config.animateDuration > 0 && window._prestaMarker) {
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
          if (window._prestaMarker) window._prestaMarker.setLngLat(coord);
          if (t < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      }

      window.addEventListener('message', function(e) {
        try {
          var d = JSON.parse(e.data);
          if (d.type === 'movePresta' && window._prestaMarker) {
            window._prestaMarker.setLngLat([d.lng, d.lat]);
          }
          if (d.type === 'fitBounds' && d.bounds) {
            map.fitBounds(d.bounds, { padding: 60 });
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

export default function LeafletMap({ center, zoom = 14, markers = [], route, style }: Props) {
  const webRef = useRef<WebView>(null);
  return (
    <WebView
      ref={webRef}
      source={{ html: getMapHTML(center, zoom, markers, route) }}
      style={[styles.map, style]}
      scrollEnabled={false}
      javaScriptEnabled
      domStorageEnabled
      originWhitelist={['*']}
      mixedContentMode="always"
    />
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
