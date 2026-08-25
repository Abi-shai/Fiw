import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

/** Sprite `mobility option` vu du dessus : l'URI de l'asset + son rapport
 *  largeur/longueur, pour dimensionner le marqueur sans le déformer. */
export interface Sprite {
  uri: string;
  ratio: number;
}

export interface LeafletMapHandle {
  recenter: (center: { lat: number; lng: number }, zoom?: number) => void;
  /** Remplace le sprite des prestataires sur la carte (sans recharger),
   *  ex. quand l'utilisateur change de moyen de transport. */
  setProviderSprite: (sprite: Sprite) => void;
}

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWJpc2hhaXlwIiwiYSI6ImNtcXMzem50NTA0MncycnNhbmd2bXMzc3AifQ.y16QxZgfQbPsxLa6xSpwrA';

interface Marker {
  lat: number;
  lng: number;
  type: 'origin' | 'destination' | 'prestataire' | 'user';
  heading?: number; // degrés, 0 = nord — utilisé par 'user'
}

interface RouteConfig {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  /** Durée (ms) du parcours du véhicule le long du tracé. Absent = tracé
   *  statique (écrans de configuration), aucun véhicule en mouvement. */
  animateDuration?: number;
}

interface Props {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: Marker[];
  route?: RouteConfig;
  mapStyle?: string;
  tintWater?: boolean;
  /** Allège la basemap (masque verdure/landuse, POIs, bâtiments, transports)
   *  pour dégager la lecture du trajet (façon Yango). */
  declutter?: boolean;
  /** Marges (px) du cadrage `fitBounds` du trajet. Renseigner `bottom` avec la
   *  hauteur de la feuille pour que le trajet soit centré dans la zone *visible*
   *  (au-dessus de la feuille) et non dans le viewport entier. */
  fitPadding?: { top?: number; bottom?: number; left?: number; right?: number };
  /** Prestataires disponibles aux alentours (façon Yango) : sprites vus du
   *  dessus qui roulent sur les rues réelles autour du départ. Les positions
   *  fournies sont des amorces — chacune est aimantée à la route la plus proche. */
  providers?: { lat: number; lng: number }[];
  /** Sprite (vue de dessus) des marqueurs prestataires. */
  providerSprite?: Sprite;
  /** Sprite (vue de dessus) du véhicule suivi — marqueur `prestataire`. */
  vehicleSprite?: Sprite;
  /** La caméra suit le véhicule : cadrage d'ensemble du trajet à l'ouverture,
   *  puis rapprochement et recentrages doux quand le véhicule sort du cadre. */
  followVehicle?: boolean;
  /** Zoom du suivi rapproché (défaut 15.2). */
  followZoom?: number;
  /** Émis (throttlé) pendant que l'utilisateur déplace la carte — sert au
   *  choix d'un point « sur la carte » (pin fixe, carte mobile dessous). */
  onCenterChange?: (c: { lat: number; lng: number }) => void;
  style?: object;
}

const getMapHTML = (
  center: { lat: number; lng: number },
  zoom: number,
  markers: Marker[],
  route: RouteConfig | undefined,
  mapStyle: string,
  tintWater: boolean,
  declutter: boolean,
  fitPadding: Props['fitPadding'],
  providers: NonNullable<Props['providers']>,
  providerSprite: Sprite,
  vehicleSprite: Sprite,
  followVehicle: boolean,
  followZoom: number
) => {
  // Marges de cadrage du trajet (asymétriques pour dégager la feuille en bas).
  const fitPad = { top: 80, bottom: 80, left: 48, right: 48, ...(fitPadding || {}) };

  // ATTENTION — tout ce qui suit est un template literal : AUCUN accent grave
  // dans le HTML/JS ci-dessous, pas même dans un commentaire. Un seul backtick
  // referme la chaîne et casse le fichier (erreur TS loin du vrai coupable).
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
    /* Véhicules vus du dessus (jeu « mobility option », variante top view).
       Le sprite pointe au NORD dans l'asset : la rotation appliquée est donc
       directement le cap. L'ombre est portée par l'enveloppe NON tournée, pour
       que la lumière reste fixe pendant que le véhicule pivote. */
    .veh { position: relative; pointer-events: none; }
    /* Enveloppe du LACET : porte le cap, l'inclinaison et l'échelle, et pivote
       sur le train arrière. Le train avant, lui, braque DANS ce repère — d'où
       l'imbrication, une transformation CSS n'ayant qu'un seul point d'origine. */
    .veh-yaw { position: absolute; left: 0; will-change: transform; }
    .veh-yaw img {
      position: absolute; left: 0; top: 0;
      width: 100%; height: 100%; display: block;
      object-fit: contain;
    }
    .veh-front { will-change: transform; }
    .veh-hero { filter: drop-shadow(0 4px 6px rgba(0,0,0,0.32)); }
    .veh-amb  { filter: drop-shadow(0 2px 4px rgba(0,0,0,0.22)); }
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

      var fitPad = ${JSON.stringify(fitPad)};
      var providersData = ${JSON.stringify(providers)};
      var providerSprite = ${JSON.stringify(providerSprite)};
      var vehicleSprite = ${JSON.stringify(vehicleSprite)};
      var followOn = ${followVehicle};
      var followZoom = ${followZoom};

      /* Cap : on vise un point situé en avant sur le tracé plutôt que le sommet
         suivant — sans ça le sprite tremble sur les tracés denses. La distance
         de visée est proportionnelle à la VITESSE (une durée de trajet, pas une
         distance fixe) : la simulation compresse une course de 20 min en 54 s,
         donc à distance fixe le véhicule voit le virage 0,15 s à l'avance et
         pivote d'un coup. En temps de parcours, l'entrée en virage s'amorce
         toujours au même moment, quelle que soit l'allure. */
      var LOOKAHEAD_S = 0.55;    // s de trajet visées devant le véhicule
      var LOOKAHEAD_MIN = 12;    // m
      var LOOKAHEAD_MAX = 60;    // m
      var TURN_TAU = 210;        // ms — constante de lissage du changement de cap
      var TURN_RATE_MAX = 180;   // °/s — vitesse de rotation maximale
      var LEAN_FULL = 130;       // °/s — vitesse angulaire donnant l'inclinaison max
      var STEER_WIN = 26;        // m — fenêtre sur laquelle on lit la courbure
      var STEER_FULL = 40;       // ° de courbure sur cette fenêtre = braquage maximal
      var STEER_TAU = 90;        // ms — le guidon bouge plus vite que la machine

      /* ---------------------------------------------------------------
         Géométrie — métrique plane locale (équirectangulaire). À l'échelle
         d'une course urbaine l'écart au géodésique est négligeable, et ça
         permet de tenir 60 fps sans trigonométrie sphérique par image.
      --------------------------------------------------------------- */
      var DEG = Math.PI / 180;
      function mPerLng(lat) { return 111320 * Math.cos(lat * DEG); }
      function segLen(a, b) {
        var dx = (b[0] - a[0]) * mPerLng((a[1] + b[1]) / 2);
        var dy = (b[1] - a[1]) * 110540;
        return Math.sqrt(dx * dx + dy * dy);
      }
      /** Cap en degrés, 0 = nord, sens horaire — repère des sprites. */
      function segBearing(a, b) {
        var dx = (b[0] - a[0]) * mPerLng((a[1] + b[1]) / 2);
        var dy = (b[1] - a[1]) * 110540;
        return Math.atan2(dx, dy) / DEG;
      }
      /** Pré-calcule les abscisses curvilignes : on avance ensuite en MÈTRES,
       *  donc à vitesse sol constante — et non à vitesse « un sommet par image »,
       *  qui accélère dans les virages (là où les sommets sont serrés). */
      function buildPath(coords) {
        var cum = [0];
        for (var i = 1; i < coords.length; i++) cum.push(cum[i - 1] + segLen(coords[i - 1], coords[i]));
        return { coords: coords, cum: cum, total: cum[cum.length - 1] };
      }
      function segIndexAt(path, s) {
        var cum = path.cum, lo = 0, hi = cum.length - 1;
        while (lo < hi - 1) {
          var mid = (lo + hi) >> 1;
          if (cum[mid] <= s) lo = mid; else hi = mid;
        }
        return lo;
      }
      function pointAt(path, s) {
        var c = path.coords;
        if (s <= 0) return [c[0][0], c[0][1]];
        if (s >= path.total) return [c[c.length - 1][0], c[c.length - 1][1]];
        var i = segIndexAt(path, s);
        var span = path.cum[i + 1] - path.cum[i];
        var f = span > 1e-6 ? (s - path.cum[i]) / span : 0;
        return [c[i][0] + (c[i + 1][0] - c[i][0]) * f, c[i][1] + (c[i + 1][1] - c[i][1]) * f];
      }
      /** Portion déjà parcourue — sert au dégradé « fait / reste à faire ». */
      function sliceTo(path, s) {
        if (s <= 0) return [];
        if (s >= path.total) return path.coords.slice();
        var i = segIndexAt(path, s);
        var out = path.coords.slice(0, i + 1);
        out.push(pointAt(path, s));
        return out;
      }
      /** Écart d'angle par le plus court chemin — évite le tour complet quand
       *  le cap passe de 350° à 10°. */
      function shortestDelta(target, cur) {
        var d = (target - cur) % 360;
        if (d > 180) d -= 360;
        if (d < -180) d += 360;
        return d;
      }
      function pathLength(coords) {
        var t = 0;
        for (var i = 1; i < coords.length; i++) t += segLen(coords[i - 1], coords[i]);
        return t;
      }

      /* ---------------------------------------------------------------
         Sprites véhicule
      --------------------------------------------------------------- */
      /** Les marqueurs sont en pixels écran : sans correction, une voiture de
       *  46 px couvre un pâté de maisons au zoom 12 et une portière au zoom 17.
       *  On la fait donc grossir doucement avec le zoom, comme les apps de
       *  référence, en bornant pour rester lisible aux deux extrêmes. */
      function zoomScale() {
        var z = map.getZoom();
        var k = (z - 11.5) / 4.5;
        return Math.max(0.7, Math.min(1.08, 0.7 + k * 0.38));
      }
      /** Construit un marqueur véhicule et cale son point de rotation.
       *  Le marqueur est ancré au centre par Mapbox : on décale donc l'image
       *  pour que ce soit son PIVOT (train arrière) qui tombe sur la
       *  coordonnée, et non son milieu. Le corps s'étend alors devant le point
       *  suivi — exactement comme un véhicule dont l'essieu arrière suit la
       *  trajectoire. */
      function makeVehicleEl(sprite, len, cls) {
        var el = document.createElement('div');
        el.className = 'veh ' + cls;
        var ratio = (sprite && sprite.ratio) || 0.5;
        var pivot = (sprite && sprite.pivot) || 0.5;
        var band = (sprite && sprite.steerBand) || 0;
        el.style.width = Math.round(len * ratio) + 'px';
        el.style.height = len + 'px';

        var yaw = document.createElement('div');
        yaw.className = 'veh-yaw';
        yaw.style.width = '100%';
        yaw.style.height = len + 'px';
        yaw.style.top = ((0.5 - pivot) * len).toFixed(1) + 'px';
        yaw.style.transformOrigin = '50% ' + (pivot * 100).toFixed(1) + '%';

        var body = document.createElement('img');
        if (sprite && sprite.uri) body.src = sprite.uri;
        var front = null;
        if (band > 0) {
          // Le corps perd sa bande avant, le train avant ne garde qu'elle : les
          // deux calques sont le MÊME dessin, superposé et découpé de façon
          // complémentaire — ils se rejoignent donc au pixel près.
          var pct = (band * 100).toFixed(1);
          body.style.clipPath = 'inset(' + pct + '% 0 0 0)';
          front = document.createElement('img');
          front.className = 'veh-front';
          if (sprite && sprite.uri) front.src = sprite.uri;
          front.style.clipPath = 'inset(0 0 ' + (100 - band * 100).toFixed(1) + '% 0)';
          front.style.transformOrigin = '50% ' + pct + '%';
        }
        yaw.appendChild(body);
        if (front) yaw.appendChild(front);
        el.appendChild(yaw);
        return { el: el, yaw: yaw, front: front };
      }
      /** Rotation, inclinaison et échelle vont sur l'IMAGE, jamais sur l'élément
       *  du marqueur : Mapbox en réécrit le transform à chaque image pour le
       *  positionner — tout ce qu'on y poserait serait effacé à l'image
       *  suivante.
       *
       *  L'inclinaison est simulée en resserrant la silhouette dans le sens de
       *  la largeur (scaleX, donc dans le repère du véhicule, appliqué avant la
       *  rotation) : c'est ce que donne un deux-roues penché vu du dessus. Nulle
       *  sur les voitures. */
      function applyVeh(v) {
        var t = 'rotate(' + v.heading.toFixed(1) + 'deg)';
        if (v.lean) {
          var amp = Math.min(1, Math.abs(v.omega || 0) / LEAN_FULL);
          t += ' scaleX(' + (1 - v.lean * amp).toFixed(3) + ')';
        }
        v.yaw.style.transform = t + ' scale(' + zoomScale().toFixed(3) + ')';
        if (v.front) v.front.style.transform = 'rotate(' + (v.steer || 0).toFixed(1) + 'deg)';
      }
      /** Braquage : rapprochement exponentiel du cap visé, borné en vitesse
       *  angulaire. Le véhicule « tourne le guidon » dans les virages au lieu
       *  de pivoter d'un coup — c'est ce détail qui fait lire le mouvement
       *  comme une trajectoire routière et non comme un point qui glisse. */
      function steer(v, target, dt, bend) {
        // Écart de cap qu'il reste à corriger — mesuré AVANT de tourner.
        var delta = shortestDelta(target, v.heading);
        if (!v.hasHeading) {
          v.heading = target; v.hasHeading = true; v.omega = 0; v.steer = 0;
          return;
        }
        var step = delta * (1 - Math.exp(-dt / TURN_TAU));
        var maxStep = TURN_RATE_MAX * dt / 1000;
        if (step > maxStep) step = maxStep;
        if (step < -maxStep) step = -maxStep;
        v.heading = (v.heading + step + 360) % 360;
        // Vitesse angulaire lissée — pilote l'inclinaison des deux-roues.
        var inst = dt > 0 ? step * 1000 / dt : 0;
        v.omega = (v.omega || 0) * 0.85 + inst * 0.15;
        // Braquage du train avant, commandé par la COURBURE du virage abordé —
        // donc engagé avant que la machine n'ait commencé à tourner, tenu
        // pendant toute la courbe, relâché en sortie. C'est cet ordre — braquer,
        // puis tourner — qui fait lire un virage plutôt qu'une image qui pivote.
        // Repli sur l'écart de cap quand aucune courbure n'est fournie.
        if (v.maxSteer) {
          var src = (bend === undefined || bend === null) ? delta : bend;
          var want = Math.max(-1, Math.min(1, src / STEER_FULL)) * v.maxSteer;
          v.steer = (v.steer || 0) + (want - (v.steer || 0)) * (1 - Math.exp(-dt / STEER_TAU));
        }
      }
      /** Distance de visée : une durée de trajet convertie en mètres, bornée. */
      function lookahead(speedMps) {
        var d = speedMps * LOOKAHEAD_S;
        return Math.max(LOOKAHEAD_MIN, Math.min(LOOKAHEAD_MAX, d));
      }
      /** Cap de PARCOURS en un point, dans le sens où on roule (dir = ±1).
       *  null si le tracé est dégénéré à cet endroit. */
      function courseAt(path, s, dir, d) {
        var here = pointAt(path, s);
        var to = Math.max(0, Math.min(path.total, s + dir * d));
        var ahead = pointAt(path, to);
        if (segLen(here, ahead) < 0.5) return null;
        return segBearing(here, ahead);
      }
      /** Courbure du virage abordé : de combien le cap de la route tourne sur
       *  les STEER_WIN mètres qui viennent. C'est une grandeur GÉOMÉTRIQUE —
       *  elle ne dépend pas de la vitesse. C'est ce qu'il faut pour commander
       *  le braquage : un virage serré se prend guidon braqué qu'on le passe au
       *  pas ou vite, alors que l'écart de cap instantané, lui, s'effondre dès
       *  que la simulation accélère (le cap rattrape sa cible en une image). */
      function bendAt(path, s, dir) {
        var a = courseAt(path, s, dir, 10);
        if (a === null) return 0;
        var b = courseAt(path, Math.max(0, Math.min(path.total, s + dir * STEER_WIN)), dir, 10);
        if (b === null) return 0;
        return shortestDelta(b, a);
      }
      /** Cap donné par la tangente au tracé, regardée en avant. */
      function tangentAt(path, s, fallback, ahead_m) {
        var d = ahead_m || LOOKAHEAD_MIN;
        var here = pointAt(path, s);
        var ahead = pointAt(path, Math.min(path.total, s + d));
        if (segLen(here, ahead) < 0.5) {
          var back = pointAt(path, Math.max(0, s - d));
          if (segLen(back, here) < 0.5) return fallback;
          return segBearing(back, here);
        }
        return segBearing(here, ahead);
      }

      /* ---------------------------------------------------------------
         Marqueurs (départ / arrivée / position client / véhicule suivi)
      --------------------------------------------------------------- */
      var staticMarkers = [];
      var hero = null; // véhicule suivi — survit aux changements d'étape

      function ensureHero(lngLat) {
        if (hero) return hero;
        var v = makeVehicleEl(vehicleSprite, vehicleSprite.len || 38, 'veh-hero');
        hero = {
          el: v.el, yaw: v.yaw, front: v.front,
          heading: 0, hasHeading: false, omega: 0, steer: 0,
          lean: vehicleSprite.lean || 0, maxSteer: vehicleSprite.maxSteer || 0,
          marker: new mapboxgl.Marker({ element: v.el, anchor: 'center' })
            .setLngLat(lngLat).addTo(map),
        };
        applyVeh(hero);
        return hero;
      }

      function buildMarkers(data) {
        staticMarkers.forEach(function(m) { m.remove(); });
        staticMarkers = [];
        (data || []).forEach(function(m) {
          if (m.type === 'prestataire') {
            var h = ensureHero([m.lng, m.lat]);
            h.marker.setLngLat([m.lng, m.lat]);
            return;
          }
          var el = document.createElement('div');
          if (m.type === 'origin') {
            el.className = 'dot-origin';
          } else if (m.type === 'destination') {
            el.className = 'dot-destination';
          } else if (m.type === 'user') {
            el.className = 'user-marker';
            var hdg = m.heading || 0;
            el.innerHTML =
              '<div class="user-accuracy"></div>' +
              '<div class="user-beam" style="transform: translate(-50%,-100%) rotate(' + hdg + 'deg)"></div>' +
              '<div class="user-dot"></div>';
          }
          staticMarkers.push(new mapboxgl.Marker({ element: el }).setLngLat([m.lng, m.lat]).addTo(map));
        });
      }

      /* ---------------------------------------------------------------
         Tracé + parcours du véhicule
      --------------------------------------------------------------- */
      var driveHandle = null;
      var followArmed = false;
      var lastFollow = 0;
      var introTimer = null;

      /** Décalage caméra : le véhicule doit être centré dans la zone VISIBLE
       *  (au-dessus de la feuille), pas dans le viewport entier. */
      function camOffset() {
        return [(fitPad.left - fitPad.right) / 2, (fitPad.top - fitPad.bottom) / 2];
      }

      function addRouteLayers(coords) {
        var empty = { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } };
        if (!map.getSource('route')) {
          map.addSource('route', { type: 'geojson', data: empty });
          map.addSource('route-done', { type: 'geojson', data: empty });
          // Liseré blanc sous le tracé : le trajet se détache de la voirie même
          // sur les rues claires (Grab, Gojek).
          map.addLayer({
            id: 'route-casing', type: 'line', source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#FFFFFF', 'line-width': 9, 'line-opacity': 0.95 }
          });
          map.addLayer({
            id: 'route', type: 'line', source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#0066FF', 'line-width': 5, 'line-opacity': 0.95 }
          });
          // Portion parcourue, atténuée : la progression se lit sans chiffre.
          map.addLayer({
            id: 'route-done', type: 'line', source: 'route-done',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#B9C6D8', 'line-width': 5, 'line-opacity': 0.95 }
          });
        }
        map.getSource('route').setData({
          type: 'Feature', geometry: { type: 'LineString', coordinates: coords }
        });
        map.getSource('route-done').setData(empty);
      }

      function clearRoute() {
        if (driveHandle) { cancelAnimationFrame(driveHandle); driveHandle = null; }
        if (introTimer) { clearTimeout(introTimer); introTimer = null; }
        followArmed = false;
        if (map.getSource('route')) {
          var empty = { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } };
          map.getSource('route').setData(empty);
          map.getSource('route-done').setData(empty);
        }
      }

      function followCam(p) {
        if (!followOn || !followArmed) return;
        // Ne jamais couper une animation de caméra en cours : un easeTo lancé
        // par-dessus un autre l'annule et fige le zoom à mi-course.
        if (map.isMoving()) return;
        var now = performance.now();
        if (now - lastFollow < 900) return;
        var c = map.getContainer();
        var pt = map.project(p);
        var m = 44; // marge de confort avant recentrage
        if (pt.x < fitPad.left + m || pt.x > c.clientWidth - fitPad.right - m ||
            pt.y < fitPad.top + m || pt.y > c.clientHeight - fitPad.bottom - m) {
          lastFollow = now;
          map.easeTo({ center: p, duration: 1500, offset: camOffset(), essential: true });
        }
      }

      function driveAlong(path, duration) {
        if (driveHandle) cancelAnimationFrame(driveHandle);
        var h = ensureHero(pointAt(path, 0));
        var speed = path.total / duration; // m/ms
        var ahead_m = lookahead(speed * 1000);
        var start = null, last = null, lastPaint = 0;
        function frame(ts) {
          if (start === null) { start = ts; last = ts; }
          var dt = Math.min(ts - last, 100); last = ts;
          var s = Math.min(path.total, (ts - start) * speed);
          var p = pointAt(path, s);
          h.marker.setLngLat(p);
          steer(h, tangentAt(path, s, h.heading, ahead_m), dt, bendAt(path, s, 1));
          applyVeh(h);
          // La portion parcourue n'a pas besoin des 60 fps — on la rafraîchit
          // ~8 fois par seconde pour ne pas payer un setData par image.
          if (ts - lastPaint > 120) {
            lastPaint = ts;
            if (map.getSource('route-done')) {
              map.getSource('route-done').setData({
                type: 'Feature', geometry: { type: 'LineString', coordinates: sliceTo(path, s) }
              });
            }
          }
          followCam(p);
          if (s < path.total) driveHandle = requestAnimationFrame(frame);
          else driveHandle = null;
        }
        driveHandle = requestAnimationFrame(frame);
      }

      function fetchAndDrawRoute(config) {
        var url = 'https://api.mapbox.com/directions/v5/mapbox/driving/'
          + config.from.lng + ',' + config.from.lat + ';'
          + config.to.lng + ',' + config.to.lat
          + '?geometries=geojson&overview=full&access_token=' + mapboxgl.accessToken;
        fetch(url)
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (!data.routes || !data.routes.length) return;
            var coords = data.routes[0].geometry.coordinates;
            addRouteLayers(coords);
            var bounds = coords.reduce(function(b, c) { return b.extend(c); },
              new mapboxgl.LngLatBounds(coords[0], coords[0]));
            map.fitBounds(bounds, { padding: fitPad, duration: 1200 });

            if (config.animateDuration > 0) {
              var path = buildPath(coords);
              // Cap initial aligné sur le départ du tracé : le véhicule est
              // déjà orienté « dans la rue » avant même de bouger. Un véhicule
              // qui vient d'une étape précédente garde SON cap et braque vers
              // le nouveau tracé pendant les premières images.
              var h = ensureHero(pointAt(path, 0));
              if (!h.hasHeading) {
                steer(h, tangentAt(path, 0, 0, lookahead(path.total / config.animateDuration * 1000)), 1000);
                applyVeh(h);
              }
              driveAlong(path, config.animateDuration);
              // Cadrage d'ensemble d'abord (on montre le trajet entier), puis
              // rapprochement sur le véhicule — l'ordre des apps de référence.
              if (followOn) {
                introTimer = setTimeout(function() {
                  map.easeTo({
                    center: hero.marker.getLngLat(), zoom: followZoom,
                    duration: 1600, offset: camOffset(), essential: true
                  });
                  // Le suivi ne prend la main qu'une fois le rapprochement
                  // terminé — sinon il l'interrompt dès la première image.
                  map.once('moveend', function() {
                    followArmed = true;
                    lastFollow = performance.now();
                  });
                }, 2200);
              }
            }
          })
          .catch(function() {});
      }

      /* ---------------------------------------------------------------
         Prestataires alentour — ils roulent sur les VRAIES rues
      --------------------------------------------------------------- */
      var ambient = [];
      var roadPaths = [];

      /** Récupère la voirie effectivement rendue autour du cadre courant et la
       *  convertit en tracés praticables. C'est ce qui distingue une carte
       *  vivante d'une carte décorative : les véhicules suivent le dessin des
       *  rues, donc ils pivotent aux carrefours au lieu de dériver en diagonale
       *  à travers les bâtiments. */
      function collectRoads() {
        var ids = [];
        (map.getStyle().layers || []).forEach(function(ly) {
          if (ly.type !== 'line' || ly['source-layer'] !== 'road') return;
          var vis = 'visible';
          try { vis = map.getLayoutProperty(ly.id, 'visibility') || 'visible'; } catch (e) {}
          if (vis !== 'none') ids.push(ly.id);
        });
        if (!ids.length) return [];
        var feats = [];
        try { feats = map.queryRenderedFeatures({ layers: ids }); } catch (e) { return []; }
        var out = [];
        feats.forEach(function(f) {
          var g = f.geometry;
          if (!g) return;
          var lines = g.type === 'LineString' ? [g.coordinates]
            : (g.type === 'MultiLineString' ? g.coordinates : []);
          lines.forEach(function(c) {
            if (c.length >= 2 && pathLength(c) > 120) out.push(buildPath(c));
          });
        });
        return out;
      }

      /** Aimante une amorce (lat/lng fournie par l'écran) sur la rue la plus
       *  proche : la répartition voulue par l'écran est conservée, mais le
       *  véhicule démarre sur la chaussée. */
      function snapToRoad(seed) {
        var best = null, bestD = Infinity;
        for (var i = 0; i < roadPaths.length; i++) {
          var p = roadPaths[i];
          for (var j = 0; j < p.coords.length; j++) {
            var d = segLen(seed, p.coords[j]);
            if (d < bestD) { bestD = d; best = { path: p, s: p.cum[j] }; }
          }
        }
        return best;
      }

      /** Au bout d'une rue, on cherche une rue qui commence là où celle-ci
       *  finit : le véhicule tourne au carrefour au lieu de faire demi-tour. */
      function nextRoad(c, end) {
        var cands = [];
        for (var i = 0; i < roadPaths.length; i++) {
          var p = roadPaths[i];
          if (p === c.path) continue;
          if (segLen(end, p.coords[0]) < 60) cands.push({ path: p, s: 0, dir: 1 });
          var lastC = p.coords[p.coords.length - 1];
          if (segLen(end, lastC) < 60) cands.push({ path: p, s: p.total, dir: -1 });
        }
        if (!cands.length) { c.dir *= -1; return; }
        var pick = cands[Math.floor(Math.random() * cands.length)];
        c.path = pick.path; c.s = pick.s; c.dir = pick.dir;
      }

      function buildAmbient() {
        if (!providersData || !providersData.length) return;
        roadPaths = collectRoads();
        ambient = providersData.map(function(p, i) {
          var v = makeVehicleEl(providerSprite, providerSprite.ambLen || 27, 'veh-amb');
          var c = {
            el: v.el, yaw: v.yaw, front: v.front,
            heading: 0, hasHeading: false, omega: 0, steer: 0,
            lean: providerSprite.lean || 0, maxSteer: providerSprite.maxSteer || 0,
            marker: new mapboxgl.Marker({ element: v.el, anchor: 'center' })
              .setLngLat([p.lng, p.lat]).addTo(map),
            // 5,5 à 8 m/s ≈ 20–29 km/h : allure urbaine dakaroise.
            speed: 0.0055 + (i % 4) * 0.0008,
            dir: i % 2 ? 1 : -1,
            path: null, s: 0,
            // Repli si la voirie n'a pas pu être lue (style sans couche road,
            // tuiles pas encore chargées) : dérive libre, comme avant.
            lng: p.lng, lat: p.lat, freeHeading: i * 2.39996, turn: (i % 2 ? 1 : -1) * 0.00003,
          };
          var snap = snapToRoad([p.lng, p.lat]);
          if (snap) { c.path = snap.path; c.s = snap.s; }
          applyVeh(c);
          return c;
        });

        var last = null;
        function tick(ts) {
          if (last === null) last = ts;
          var dt = ts - last; last = ts;
          if (dt > 80) dt = 16;
          ambient.forEach(function(c) {
            var p, target;
            if (c.path) {
              c.s += c.dir * c.speed * dt;
              if (c.s <= 0 || c.s >= c.path.total) {
                var end = c.s <= 0 ? c.path.coords[0] : c.path.coords[c.path.coords.length - 1];
                nextRoad(c, end);
                c.s = Math.max(0, Math.min(c.path.total, c.s));
              }
              p = pointAt(c.path, c.s);
              // Le cap suit le sens de parcours : à contresens, on regarde
              // derrière soi.
              var d = c.dir * lookahead(c.speed * 1000);
              var ahead = pointAt(c.path, Math.max(0, Math.min(c.path.total, c.s + d)));
              target = segLen(p, ahead) > 0.5 ? segBearing(p, ahead) : c.heading;
            } else {
              c.freeHeading += c.turn * dt;
              c.lng += Math.cos(c.freeHeading) * 0.00000007 * dt;
              c.lat += Math.sin(c.freeHeading) * 0.00000007 * dt;
              p = [c.lng, c.lat];
              target = 90 - c.freeHeading / DEG;
            }
            c.marker.setLngLat(p);
            steer(c, target, dt, c.path ? bendAt(c.path, c.s, c.dir) : null);
            applyVeh(c);
          });
          requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }

      /* ---------------------------------------------------------------
         Cycle de vie
      --------------------------------------------------------------- */
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
      // Les marqueurs sont en pixels : on réajuste leur échelle au zoom.
      map.on('zoom', function() {
        if (hero) applyVeh(hero);
        ambient.forEach(applyVeh);
      });

      map.on('load', function() {
        if (${tintWater}) {
          // Heetch-like soft blue water on the light style. POIs/place labels are kept.
          // water-shadow n'existe pas dans tous les styles : on teste la
          // présence de la couche, sinon Mapbox journalise une erreur.
          ['water', 'water-shadow'].forEach(function(id) {
            if (!map.getLayer(id)) return;
            try { map.setPaintProperty(id, 'fill-color', '#AFCBEF'); } catch(e) {}
          });
        }
        if (${declutter}) {
          // Dégage la carte : masque verdure/landuse, POIs, bâtiments, transports
          // et labels naturels — on garde routes, eau et noms de lieux. Le trajet
          // ressort ainsi nettement.
          var KILL = /landuse|landcover|national-park|park|pitch|golf|poi|transit|building|natural-|aeroway/i;
          (map.getStyle().layers || []).forEach(function(ly) {
            if (KILL.test(ly.id)) { try { map.setLayoutProperty(ly.id, 'visibility', 'none'); } catch(e) {} }
          });
        }
        buildMarkers(${JSON.stringify(markers)});
        var initialRoute = ${route ? JSON.stringify(route) : 'null'};
        if (initialRoute) fetchAndDrawRoute(initialRoute);
        // La voirie n'est interrogeable qu'une fois les tuiles rendues.
        map.once('idle', buildAmbient);
      });

      window.addEventListener('message', function(e) {
        try {
          var d = JSON.parse(e.data);
          if (d.type === 'flyTo') {
            map.flyTo({ center: [d.lng, d.lat], zoom: d.zoom || map.getZoom(), duration: 900, essential: true });
          }
          // Changement de gamme : chaque véhicule a SON calibre et SON pivot
          // (un vélo n'est pas une voiture raccourcie) — on rejoue donc toute
          // la géométrie du marqueur, pas seulement la source de l'image.
          if (d.type === 'setProviderSprite' && d.sprite) {
            providerSprite = d.sprite;
            var len = providerSprite.ambLen || 27;
            // La structure du marqueur dépend du véhicule (un deux-roues a un
            // train avant découpé, pas une voiture) : on la rebâtit au lieu de
            // la rapiécer. Cap, braquage et rue courante sont conservés, donc
            // aucun véhicule ne saute ni ne se remet droit.
            ambient.forEach(function(c) {
              var pos = c.marker.getLngLat();
              c.marker.remove();
              var v = makeVehicleEl(providerSprite, len, 'veh-amb');
              c.el = v.el; c.yaw = v.yaw; c.front = v.front;
              c.lean = providerSprite.lean || 0;
              c.maxSteer = providerSprite.maxSteer || 0;
              c.marker = new mapboxgl.Marker({ element: v.el, anchor: 'center' })
                .setLngLat(pos).addTo(map);
              applyVeh(c);
            });
          }
          // Changement d'étape (en route → arrivé → en course) SANS recharger la
          // carte : le véhicule garde sa position et son cap, la caméra ne
          // clignote pas. C'est la continuité qui rend le suivi crédible.
          if (d.type === 'setTrip') {
            clearRoute();
            buildMarkers(d.markers || []);
            if (d.route) fetchAndDrawRoute(d.route);
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

const NO_SPRITE: Sprite = { uri: '', ratio: 0.5 };

const LeafletMap = forwardRef<LeafletMapHandle, Props>(function LeafletMap(
  {
    center, zoom = 14, markers = [], route, mapStyle = 'mapbox://styles/mapbox/navigation-day-v1',
    tintWater = false, declutter = false, fitPadding, providers = [],
    providerSprite = NO_SPRITE, vehicleSprite = NO_SPRITE,
    followVehicle = false, followZoom = 15.2, onCenterChange, style,
  },
  ref
) {
  const webRef = useRef<WebView>(null);
  const post = (msg: object) => webRef.current?.postMessage(JSON.stringify(msg));

  // Le HTML est figé au montage : les changements d'étape passent par messages
  // (`setTrip`), sinon toute nouvelle chaîne rechargerait la WebView — carte
  // blanche, véhicule replacé au départ, caméra remise à zéro.
  const html = useRef<string | null>(null);
  if (html.current === null) {
    html.current = getMapHTML(
      center, zoom, markers, route, mapStyle, tintWater, declutter,
      fitPadding, providers, providerSprite, vehicleSprite, followVehicle, followZoom
    );
  }

  useImperativeHandle(ref, () => ({
    recenter: (c, z) => post({ type: 'flyTo', lng: c.lng, lat: c.lat, zoom: z }),
    setProviderSprite: (sprite) => post({ type: 'setProviderSprite', sprite }),
  }));

  // Marqueurs + trajet suivent leurs props, sur la carte déjà chargée.
  const tripKey = JSON.stringify({ markers, route });
  const firstTrip = useRef(true);
  useEffect(() => {
    if (firstTrip.current) { firstTrip.current = false; return; }
    post({ type: 'setTrip', markers, route: route ?? null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripKey]);

  return (
    <WebView
      ref={webRef}
      source={{ html: html.current }}
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
