// Indicatifs & formats téléphone — couverture mondiale.
//
// Logique produit : le Client peut renseigner un numéro de N'IMPORTE quel pays.
// Le prestataire n'appelle jamais le numéro en direct — le contact passe par
// l'APPEL IN-APP MASQUÉ (cf. Transport « Appel masqué »). Un numéro étranger ne
// pose donc pas de problème de joignabilité.
//
// `groups` = tailles des blocs de chiffres pour l'espacement automatique ; `len`
// = nb exact de chiffres locaux. Renseignés pour les pays prioritaires (Afrique
// de l'Ouest + quelques repères) ; ailleurs → format générique par blocs de 3 et
// longueur libre (6–15 chiffres).

export type Country = { code: string; name: string; dial: string; groups?: number[]; len?: number };

export const COUNTRIES: Country[] = [
  // — Afrique —
  { code: 'DZ', name: 'Algérie', dial: '+213' },
  { code: 'AO', name: 'Angola', dial: '+244' },
  { code: 'BJ', name: 'Bénin', dial: '+229' },
  { code: 'BW', name: 'Botswana', dial: '+267' },
  { code: 'BF', name: 'Burkina Faso', dial: '+226' },
  { code: 'BI', name: 'Burundi', dial: '+257' },
  { code: 'CM', name: 'Cameroun', dial: '+237' },
  { code: 'CV', name: 'Cap-Vert', dial: '+238' },
  { code: 'CF', name: 'Centrafrique', dial: '+236' },
  { code: 'KM', name: 'Comores', dial: '+269' },
  { code: 'CG', name: 'Congo-Brazzaville', dial: '+242' },
  { code: 'CD', name: 'Congo (RDC)', dial: '+243' },
  { code: 'CI', name: "Côte d'Ivoire", dial: '+225', groups: [2, 2, 2, 2, 2], len: 10 },
  { code: 'DJ', name: 'Djibouti', dial: '+253' },
  { code: 'EG', name: 'Égypte', dial: '+20' },
  { code: 'ER', name: 'Érythrée', dial: '+291' },
  { code: 'SZ', name: 'Eswatini', dial: '+268' },
  { code: 'ET', name: 'Éthiopie', dial: '+251' },
  { code: 'GA', name: 'Gabon', dial: '+241' },
  { code: 'GM', name: 'Gambie', dial: '+220' },
  { code: 'GH', name: 'Ghana', dial: '+233' },
  { code: 'GN', name: 'Guinée', dial: '+224', groups: [3, 2, 2, 2], len: 9 },
  { code: 'GW', name: 'Guinée-Bissau', dial: '+245' },
  { code: 'GQ', name: 'Guinée équatoriale', dial: '+240' },
  { code: 'KE', name: 'Kenya', dial: '+254' },
  { code: 'LS', name: 'Lesotho', dial: '+266' },
  { code: 'LR', name: 'Liberia', dial: '+231' },
  { code: 'LY', name: 'Libye', dial: '+218' },
  { code: 'MG', name: 'Madagascar', dial: '+261' },
  { code: 'MW', name: 'Malawi', dial: '+265' },
  { code: 'ML', name: 'Mali', dial: '+223', groups: [2, 2, 2, 2], len: 8 },
  { code: 'MA', name: 'Maroc', dial: '+212' },
  { code: 'MU', name: 'Maurice', dial: '+230' },
  { code: 'MR', name: 'Mauritanie', dial: '+222', groups: [2, 2, 2, 2], len: 8 },
  { code: 'MZ', name: 'Mozambique', dial: '+258' },
  { code: 'NA', name: 'Namibie', dial: '+264' },
  { code: 'NE', name: 'Niger', dial: '+227' },
  { code: 'NG', name: 'Nigéria', dial: '+234' },
  { code: 'UG', name: 'Ouganda', dial: '+256' },
  { code: 'RW', name: 'Rwanda', dial: '+250' },
  { code: 'ST', name: 'Sao Tomé-et-Principe', dial: '+239' },
  { code: 'SN', name: 'Sénégal', dial: '+221', groups: [2, 3, 2, 2], len: 9 },
  { code: 'SC', name: 'Seychelles', dial: '+248' },
  { code: 'SL', name: 'Sierra Leone', dial: '+232' },
  { code: 'SO', name: 'Somalie', dial: '+252' },
  { code: 'SD', name: 'Soudan', dial: '+249' },
  { code: 'SS', name: 'Soudan du Sud', dial: '+211' },
  { code: 'TZ', name: 'Tanzanie', dial: '+255' },
  { code: 'TD', name: 'Tchad', dial: '+235' },
  { code: 'TG', name: 'Togo', dial: '+228' },
  { code: 'TN', name: 'Tunisie', dial: '+216' },
  { code: 'ZM', name: 'Zambie', dial: '+260' },
  { code: 'ZW', name: 'Zimbabwe', dial: '+263' },

  // — Europe —
  { code: 'AL', name: 'Albanie', dial: '+355' },
  { code: 'DE', name: 'Allemagne', dial: '+49' },
  { code: 'AT', name: 'Autriche', dial: '+43' },
  { code: 'BE', name: 'Belgique', dial: '+32' },
  { code: 'BY', name: 'Biélorussie', dial: '+375' },
  { code: 'BA', name: 'Bosnie-Herzégovine', dial: '+387' },
  { code: 'BG', name: 'Bulgarie', dial: '+359' },
  { code: 'CY', name: 'Chypre', dial: '+357' },
  { code: 'HR', name: 'Croatie', dial: '+385' },
  { code: 'DK', name: 'Danemark', dial: '+45' },
  { code: 'ES', name: 'Espagne', dial: '+34' },
  { code: 'EE', name: 'Estonie', dial: '+372' },
  { code: 'FI', name: 'Finlande', dial: '+358' },
  { code: 'FR', name: 'France', dial: '+33', groups: [1, 2, 2, 2, 2], len: 9 },
  { code: 'GR', name: 'Grèce', dial: '+30' },
  { code: 'HU', name: 'Hongrie', dial: '+36' },
  { code: 'IE', name: 'Irlande', dial: '+353' },
  { code: 'IS', name: 'Islande', dial: '+354' },
  { code: 'IT', name: 'Italie', dial: '+39' },
  { code: 'XK', name: 'Kosovo', dial: '+383' },
  { code: 'LV', name: 'Lettonie', dial: '+371' },
  { code: 'LI', name: 'Liechtenstein', dial: '+423' },
  { code: 'LT', name: 'Lituanie', dial: '+370' },
  { code: 'LU', name: 'Luxembourg', dial: '+352' },
  { code: 'MK', name: 'Macédoine du Nord', dial: '+389' },
  { code: 'MT', name: 'Malte', dial: '+356' },
  { code: 'MD', name: 'Moldavie', dial: '+373' },
  { code: 'MC', name: 'Monaco', dial: '+377' },
  { code: 'ME', name: 'Monténégro', dial: '+382' },
  { code: 'NO', name: 'Norvège', dial: '+47' },
  { code: 'NL', name: 'Pays-Bas', dial: '+31' },
  { code: 'PL', name: 'Pologne', dial: '+48' },
  { code: 'PT', name: 'Portugal', dial: '+351' },
  { code: 'RO', name: 'Roumanie', dial: '+40' },
  { code: 'GB', name: 'Royaume-Uni', dial: '+44' },
  { code: 'RU', name: 'Russie', dial: '+7' },
  { code: 'SM', name: 'Saint-Marin', dial: '+378' },
  { code: 'RS', name: 'Serbie', dial: '+381' },
  { code: 'SK', name: 'Slovaquie', dial: '+421' },
  { code: 'SI', name: 'Slovénie', dial: '+386' },
  { code: 'SE', name: 'Suède', dial: '+46' },
  { code: 'CH', name: 'Suisse', dial: '+41' },
  { code: 'CZ', name: 'Tchéquie', dial: '+420' },
  { code: 'UA', name: 'Ukraine', dial: '+380' },

  // — Amériques —
  { code: 'AR', name: 'Argentine', dial: '+54' },
  { code: 'BO', name: 'Bolivie', dial: '+591' },
  { code: 'BR', name: 'Brésil', dial: '+55' },
  { code: 'CA', name: 'Canada', dial: '+1' },
  { code: 'CL', name: 'Chili', dial: '+56' },
  { code: 'CO', name: 'Colombie', dial: '+57' },
  { code: 'CR', name: 'Costa Rica', dial: '+506' },
  { code: 'CU', name: 'Cuba', dial: '+53' },
  { code: 'EC', name: 'Équateur', dial: '+593' },
  { code: 'US', name: 'États-Unis', dial: '+1', groups: [3, 3, 4], len: 10 },
  { code: 'GT', name: 'Guatemala', dial: '+502' },
  { code: 'GY', name: 'Guyana', dial: '+592' },
  { code: 'HT', name: 'Haïti', dial: '+509' },
  { code: 'HN', name: 'Honduras', dial: '+504' },
  { code: 'JM', name: 'Jamaïque', dial: '+1' },
  { code: 'MX', name: 'Mexique', dial: '+52' },
  { code: 'NI', name: 'Nicaragua', dial: '+505' },
  { code: 'PA', name: 'Panama', dial: '+507' },
  { code: 'PY', name: 'Paraguay', dial: '+595' },
  { code: 'PE', name: 'Pérou', dial: '+51' },
  { code: 'DO', name: 'République dominicaine', dial: '+1' },
  { code: 'SV', name: 'Salvador', dial: '+503' },
  { code: 'SR', name: 'Suriname', dial: '+597' },
  { code: 'TT', name: 'Trinité-et-Tobago', dial: '+1' },
  { code: 'UY', name: 'Uruguay', dial: '+598' },
  { code: 'VE', name: 'Venezuela', dial: '+58' },

  // — Asie —
  { code: 'AF', name: 'Afghanistan', dial: '+93' },
  { code: 'SA', name: 'Arabie saoudite', dial: '+966' },
  { code: 'AM', name: 'Arménie', dial: '+374' },
  { code: 'AZ', name: 'Azerbaïdjan', dial: '+994' },
  { code: 'BH', name: 'Bahreïn', dial: '+973' },
  { code: 'BD', name: 'Bangladesh', dial: '+880' },
  { code: 'BT', name: 'Bhoutan', dial: '+975' },
  { code: 'MM', name: 'Birmanie (Myanmar)', dial: '+95' },
  { code: 'BN', name: 'Brunei', dial: '+673' },
  { code: 'KH', name: 'Cambodge', dial: '+855' },
  { code: 'CN', name: 'Chine', dial: '+86' },
  { code: 'KP', name: 'Corée du Nord', dial: '+850' },
  { code: 'KR', name: 'Corée du Sud', dial: '+82' },
  { code: 'AE', name: 'Émirats arabes unis', dial: '+971' },
  { code: 'GE', name: 'Géorgie', dial: '+995' },
  { code: 'IN', name: 'Inde', dial: '+91', groups: [5, 5], len: 10 },
  { code: 'ID', name: 'Indonésie', dial: '+62' },
  { code: 'IQ', name: 'Irak', dial: '+964' },
  { code: 'IR', name: 'Iran', dial: '+98' },
  { code: 'IL', name: 'Israël', dial: '+972' },
  { code: 'JP', name: 'Japon', dial: '+81' },
  { code: 'JO', name: 'Jordanie', dial: '+962' },
  { code: 'KZ', name: 'Kazakhstan', dial: '+7' },
  { code: 'KG', name: 'Kirghizistan', dial: '+996' },
  { code: 'KW', name: 'Koweït', dial: '+965' },
  { code: 'LA', name: 'Laos', dial: '+856' },
  { code: 'LB', name: 'Liban', dial: '+961' },
  { code: 'MY', name: 'Malaisie', dial: '+60' },
  { code: 'MV', name: 'Maldives', dial: '+960' },
  { code: 'MN', name: 'Mongolie', dial: '+976' },
  { code: 'NP', name: 'Népal', dial: '+977' },
  { code: 'OM', name: 'Oman', dial: '+968' },
  { code: 'UZ', name: 'Ouzbékistan', dial: '+998' },
  { code: 'PK', name: 'Pakistan', dial: '+92' },
  { code: 'PS', name: 'Palestine', dial: '+970' },
  { code: 'PH', name: 'Philippines', dial: '+63' },
  { code: 'QA', name: 'Qatar', dial: '+974' },
  { code: 'SG', name: 'Singapour', dial: '+65' },
  { code: 'LK', name: 'Sri Lanka', dial: '+94' },
  { code: 'SY', name: 'Syrie', dial: '+963' },
  { code: 'TJ', name: 'Tadjikistan', dial: '+992' },
  { code: 'TW', name: 'Taïwan', dial: '+886' },
  { code: 'TH', name: 'Thaïlande', dial: '+66' },
  { code: 'TL', name: 'Timor oriental', dial: '+670' },
  { code: 'TM', name: 'Turkménistan', dial: '+993' },
  { code: 'TR', name: 'Turquie', dial: '+90' },
  { code: 'VN', name: 'Vietnam', dial: '+84' },
  { code: 'YE', name: 'Yémen', dial: '+967' },

  // — Océanie —
  { code: 'AU', name: 'Australie', dial: '+61' },
  { code: 'FJ', name: 'Fidji', dial: '+679' },
  { code: 'NZ', name: 'Nouvelle-Zélande', dial: '+64' },
  { code: 'PG', name: 'Papouasie-Nouvelle-Guinée', dial: '+675' },
  { code: 'WS', name: 'Samoa', dial: '+685' },
  { code: 'SB', name: 'Îles Salomon', dial: '+677' },
  { code: 'TO', name: 'Tonga', dial: '+676' },
  { code: 'VU', name: 'Vanuatu', dial: '+678' },
];

/** Emoji drapeau dérivé du code ISO-2 (indicateurs régionaux Unicode).
 *  Rendu natif sur iOS/Android ; peut ne pas s'afficher sur certains desktops. */
export function flagEmoji(code: string): string {
  return code.toUpperCase().replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));
}

/** Groupe les chiffres locaux : pattern du pays si connu, sinon blocs de 3. */
export function formatLocal(digits: string, country: Country): string {
  if (country.groups) {
    const out: string[] = [];
    let i = 0;
    for (const g of country.groups) {
      if (i >= digits.length) break;
      out.push(digits.slice(i, i + g));
      i += g;
    }
    return out.join(' ');
  }
  return digits.match(/.{1,3}/g)?.join(' ') ?? '';
}

/** Numéro complet lisible : « +221 77 000 00 00 » (dial seul si aucun chiffre). */
export function fullNumber(country: Country, digits: string): string {
  const loc = formatLocal(digits, country);
  return loc ? `${country.dial} ${loc}` : country.dial;
}

/** Nb max de chiffres saisissables (longueur exacte si connue, sinon E.164 = 15). */
export function inputMax(country: Country): number {
  return country.len ?? 15;
}

/** Numéro « complet » : longueur exacte si connue, sinon 6–15 chiffres. */
export function isComplete(country: Country, digits: string): boolean {
  return country.len ? digits.length === country.len : digits.length >= 6 && digits.length <= 15;
}

// Gabarits de PLACEHOLDER par pays (regroupement usuel des chiffres). Sert
// uniquement à suggérer le format « 0 0 0 » — n'affecte NI la saisie NI la
// validation (input reste flexible). Best-effort ; pour l'exactitude totale sur
// tous les pays, brancher libphonenumber-js. Les pays déjà typés dans COUNTRIES
// (groups/len) priment sur cette table.
export const PHONE_FMT: Record<string, number[]> = {
  // Afrique
  DZ: [3, 2, 2, 2], AO: [3, 3, 3], BJ: [2, 2, 2, 2], BW: [2, 3, 3], BF: [2, 2, 2, 2],
  BI: [2, 2, 2, 2], CM: [3, 3, 3], CV: [3, 2, 2], CF: [2, 2, 2, 2], KM: [3, 4],
  CG: [2, 3, 4], CD: [2, 3, 4], DJ: [2, 2, 2, 2], EG: [3, 3, 4], ER: [1, 3, 3],
  SZ: [4, 4], ET: [2, 3, 4], GA: [2, 2, 2, 2], GM: [3, 4], GH: [2, 3, 4],
  GW: [3, 4], GQ: [3, 3, 3], KE: [3, 3, 3], LS: [4, 4], LR: [2, 3, 3],
  LY: [2, 3, 4], MG: [3, 2, 2, 2], MW: [3, 3, 3], MA: [3, 3, 3], MU: [4, 4],
  MZ: [2, 3, 4], NA: [2, 3, 4], NE: [2, 2, 2, 2], NG: [3, 3, 4], UG: [3, 3, 3],
  RW: [3, 3, 3], ST: [3, 4], SC: [1, 3, 3], SL: [2, 3, 3], SO: [2, 3, 3],
  SD: [2, 3, 4], SS: [2, 3, 4], TZ: [3, 3, 3], TD: [2, 2, 2, 2], TG: [2, 2, 2, 2],
  TN: [2, 3, 3], ZM: [3, 3, 3], ZW: [2, 3, 4],
  // Europe
  AL: [3, 3, 3], DE: [3, 4, 4], AT: [3, 3, 4], BE: [3, 2, 2, 2], BY: [2, 3, 2, 2],
  BA: [2, 3, 3], BG: [2, 3, 3], CY: [2, 3, 3], HR: [2, 3, 3], DK: [2, 2, 2, 2],
  ES: [3, 3, 3], EE: [3, 4], FI: [2, 3, 3], GR: [3, 3, 4], HU: [2, 3, 3],
  IE: [2, 3, 4], IS: [3, 4], IT: [3, 3, 4], XK: [2, 3, 3], LV: [3, 3, 2],
  LI: [3, 2, 2], LT: [3, 2, 3], LU: [3, 3, 3], MK: [2, 3, 3], MT: [4, 4],
  MD: [2, 3, 3], MC: [2, 2, 2, 2], ME: [2, 3, 3], NO: [3, 2, 3], NL: [1, 4, 4],
  PL: [3, 3, 3], PT: [3, 3, 3], RO: [3, 3, 3], GB: [4, 6], RU: [3, 3, 2, 2],
  RS: [2, 3, 3], SK: [3, 3, 3], SI: [2, 3, 3], SE: [2, 3, 2, 2], CH: [2, 3, 2, 2],
  CZ: [3, 3, 3], UA: [2, 3, 2, 2],
  // Amériques
  AR: [2, 4, 4], BO: [3, 3, 2], BR: [2, 5, 4], CA: [3, 3, 4], CL: [1, 4, 4],
  CO: [3, 3, 4], CR: [4, 4], CU: [1, 3, 4], EC: [2, 3, 4], GT: [4, 4],
  GY: [3, 4], HT: [2, 2, 2, 2], HN: [4, 4], JM: [3, 3, 4], MX: [2, 4, 4],
  NI: [4, 4], PA: [4, 4], PY: [3, 3, 3], PE: [3, 3, 3], DO: [3, 3, 4],
  SV: [4, 4], SR: [3, 4], TT: [3, 3, 4], UY: [3, 3, 3], VE: [3, 3, 4],
  // Asie
  AF: [2, 3, 4], SA: [2, 3, 4], AM: [2, 3, 3], AZ: [2, 3, 2, 2], BH: [4, 4],
  BD: [4, 3, 3], BT: [2, 3, 3], MM: [3, 3, 3], BN: [3, 4], KH: [3, 3, 3],
  CN: [3, 4, 4], KP: [3, 3, 3], KR: [2, 4, 4], AE: [2, 3, 4], GE: [3, 2, 2, 2],
  ID: [3, 4, 3], IQ: [3, 3, 4], IR: [3, 3, 4], IL: [2, 3, 4], JP: [2, 4, 4],
  JO: [2, 3, 4], KZ: [3, 3, 2, 2], KG: [3, 3, 3], KW: [4, 4], LA: [2, 3, 4],
  LB: [2, 3, 3], MY: [2, 3, 4], MV: [3, 4], MN: [4, 4], NP: [3, 3, 4],
  OM: [4, 4], UZ: [2, 3, 2, 2], PK: [3, 3, 4], PS: [2, 3, 4], PH: [3, 3, 4],
  QA: [4, 4], SG: [4, 4], LK: [2, 3, 4], SY: [3, 3, 3], TJ: [3, 3, 3],
  TW: [3, 3, 3], TH: [2, 3, 4], TL: [3, 4], TM: [2, 3, 3], TR: [3, 3, 2, 2],
  VN: [2, 3, 4], YE: [3, 3, 3],
  // Océanie
  AU: [3, 3, 3], FJ: [3, 4], NZ: [2, 3, 4], PG: [4, 4], WS: [3, 4],
  SB: [3, 4], TO: [3, 4], VU: [3, 4],
};

/** Suite de 0 suggérée dans le placeholder, au gabarit du pays (nb de chiffres +
 *  espaces). Priorité au pattern strict de COUNTRIES, sinon PHONE_FMT, sinon 3×3. */
export function placeholderDigits(country: Country): string {
  const groups = country.groups ?? PHONE_FMT[country.code] ?? [3, 3, 3];
  return groups.map((g) => '0'.repeat(g)).join(' ');
}
