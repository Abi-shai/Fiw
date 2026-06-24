import React, { useRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface Marker {
  lat: number;
  lng: number;
  type: 'prestataire' | 'client' | 'destination';
}

interface Props {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: Marker[];
  style?: object;
}

const getMapHTML = (center: { lat: number; lng: number }, zoom: number, markers: Marker[]) => {
  const markersJS = markers.map((m) => {
    if (m.type === 'prestataire') {
      return `
        var prestaIcon = L.divIcon({
          html: '<div style="font-size:24px;line-height:1;">🚗</div>',
          iconSize: [32, 32], iconAnchor: [16, 16], className: ''
        });
        var prestaMarker = L.marker([${m.lat}, ${m.lng}], {icon: prestaIcon}).addTo(map);
        window._prestaMarker = prestaMarker;
      `;
    }
    if (m.type === 'client') {
      return `
        var clientIcon = L.divIcon({
          html: '<div style="width:14px;height:14px;background:#073D23;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
          iconSize: [14, 14], iconAnchor: [7, 7], className: ''
        });
        L.marker([${m.lat}, ${m.lng}], {icon: clientIcon}).addTo(map);
      `;
    }
    return `
      var destIcon = L.divIcon({
        html: '<div style="width:14px;height:14px;background:#EF4444;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
        iconSize: [14, 14], iconAnchor: [7, 7], className: ''
      });
      L.marker([${m.lat}, ${m.lng}], {icon: destIcon}).addTo(map);
    `;
  }).join('\n');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
    .leaflet-control-zoom { display: none; }
    .leaflet-control-attribution { display: none; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false, attributionControl: false })
      .setView([${center.lat}, ${center.lng}], ${zoom});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    ${markersJS}
    window.addEventListener('message', function(e) {
      try {
        var data = JSON.parse(e.data);
        if (data.type === 'movePresta' && window._prestaMarker) {
          window._prestaMarker.setLatLng([data.lat, data.lng]);
          map.panTo([data.lat, data.lng], { animate: true, duration: 1.0 });
        }
        if (data.type === 'fitBounds' && data.bounds) {
          map.fitBounds(data.bounds, { padding: [40, 40] });
        }
      } catch(err) {}
    });
    document.addEventListener('message', function(e) {
      window.dispatchEvent(new MessageEvent('message', { data: e.data }));
    });
  </script>
</body>
</html>
  `;
};

export default function LeafletMap({ center, zoom = 14, markers = [], style }: Props) {
  const webRef = useRef<WebView>(null);

  return (
    <WebView
      ref={webRef}
      source={{ html: getMapHTML(center, zoom, markers) }}
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
