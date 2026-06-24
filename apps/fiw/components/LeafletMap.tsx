import React, { useRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface Marker {
  lat: number;
  lng: number;
  type: 'origin' | 'destination' | 'driver';
}

interface Props {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: Marker[];
  driverPosition?: { lat: number; lng: number };
  style?: object;
}

const getMapHTML = (center: { lat: number; lng: number }, zoom: number, markers: Marker[]) => {
  const markersJS = markers.map((m) => {
    let color = '#0F6B3D';
    let size = 14;
    let label = '';
    if (m.type === 'destination') { color = '#EF4444'; label = ''; }
    if (m.type === 'driver') { color = '#F59E0B'; size = 18; label = '🚗'; }

    if (m.type === 'driver') {
      return `
        var driverIcon = L.divIcon({
          html: '<div style="font-size:24px;line-height:1;">🚗</div>',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          className: ''
        });
        var driverMarker = L.marker([${m.lat}, ${m.lng}], {icon: driverIcon}).addTo(map);
        window._driverMarker = driverMarker;
      `;
    }
    const svgColor = m.type === 'origin' ? '#0F6B3D' : '#EF4444';
    return `
      var icon${m.type} = L.divIcon({
        html: '<div style="width:${size}px;height:${size}px;background:${svgColor};border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
        iconSize: [${size}, ${size}],
        iconAnchor: [${size / 2}, ${size / 2}],
        className: ''
      });
      L.marker([${m.lat}, ${m.lng}], {icon: icon${m.type}}).addTo(map);
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

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    ${markersJS}

    window.addEventListener('message', function(e) {
      try {
        var data = JSON.parse(e.data);
        if (data.type === 'moveDriver' && window._driverMarker) {
          window._driverMarker.setLatLng([data.lat, data.lng]);
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

  const moveDriver = (lat: number, lng: number) => {
    webRef.current?.injectJavaScript(`
      window.dispatchEvent(new MessageEvent('message', {
        data: JSON.stringify({ type: 'moveDriver', lat: ${lat}, lng: ${lng} })
      }));
      true;
    `);
  };

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
