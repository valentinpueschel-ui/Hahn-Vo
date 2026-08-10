/* HAHN & VO — Referenz-Checker: curated reference database + lookup.
   Sources of truth, in order:
   1. live inventory (data.js) — exact matches surface the actual watch for sale
   2. curated static entries below (years given as ranges, "ca." where approximate)
   3. brand pattern recognition as fallback
   Angaben ohne Gewähr — the UI says so too. */
(function () {
  'use strict';
  var HV = (window.HV = window.HV || {});

  /* ---------- curated reference entries ---------- */
  /* fields: ref, brand, model, years, size, caliber, note */
  var DB = [
    /* ROLEX */
    { ref: '126610LN', brand: 'Rolex', model: 'Submariner Date 41', years: '2020–heute', size: '41 mm', caliber: '3235', note: 'Schwarze Cerachrom-Lünette' },
    { ref: '126610LV', brand: 'Rolex', model: 'Submariner Date 41 „Starbucks“', years: '2020–heute', size: '41 mm', caliber: '3235', note: 'Grüne Lünette, schwarzes Blatt' },
    { ref: '124060', brand: 'Rolex', model: 'Submariner 41 (ohne Datum)', years: '2020–heute', size: '41 mm', caliber: '3230' },
    { ref: '116610LN', brand: 'Rolex', model: 'Submariner Date', years: '2010–2020', size: '40 mm', caliber: '3135', note: 'Erste Keramik-Lünette der Date' },
    { ref: '116610LV', brand: 'Rolex', model: 'Submariner Date „Hulk“', years: '2010–2020', size: '40 mm', caliber: '3135', note: 'Grünes Blatt, grüne Lünette — gesuchtes Sammlerstück' },
    { ref: '114060', brand: 'Rolex', model: 'Submariner (ohne Datum)', years: '2012–2020', size: '40 mm', caliber: '3130' },
    { ref: '16610', brand: 'Rolex', model: 'Submariner Date', years: '1988–2010', size: '40 mm', caliber: '3135', note: 'Aluminium-Lünette, Bohrlöcher bis ca. 2003' },
    { ref: '16610LV', brand: 'Rolex', model: 'Submariner Date „Kermit“', years: '2003–2010', size: '40 mm', caliber: '3135', note: '50-Jahre-Jubiläumsmodell' },
    { ref: '14060', brand: 'Rolex', model: 'Submariner (ohne Datum)', years: '1990–2001', size: '40 mm', caliber: '3000' },
    { ref: '14060M', brand: 'Rolex', model: 'Submariner (ohne Datum)', years: '2001–2012', size: '40 mm', caliber: '3130' },
    { ref: '126710BLRO', brand: 'Rolex', model: 'GMT-Master II „Pepsi“', years: '2018–heute', size: '40 mm', caliber: '3285', note: 'Blau-rote Cerachrom-Lünette' },
    { ref: '126710BLNR', brand: 'Rolex', model: 'GMT-Master II „Batman“', years: '2019–heute', size: '40 mm', caliber: '3285' },
    { ref: '116710LN', brand: 'Rolex', model: 'GMT-Master II', years: '2007–2019', size: '40 mm', caliber: '3186' },
    { ref: '16710', brand: 'Rolex', model: 'GMT-Master II', years: '1989–2007', size: '40 mm', caliber: '3185/3186', note: 'Pepsi-, Coke- oder schwarze Lünette' },
    { ref: '126500LN', brand: 'Rolex', model: 'Cosmograph Daytona', years: '2023–heute', size: '40 mm', caliber: '4131' },
    { ref: '116500LN', brand: 'Rolex', model: 'Cosmograph Daytona', years: '2016–2023', size: '40 mm', caliber: '4130', note: 'Keramik-Lünette' },
    { ref: '116520', brand: 'Rolex', model: 'Cosmograph Daytona', years: '2000–2016', size: '40 mm', caliber: '4130', note: 'Stahl-Lünette' },
    { ref: '126334', brand: 'Rolex', model: 'Datejust 41', years: '2017–heute', size: '41 mm', caliber: '3235', note: 'Weißgold-Riffellünette' },
    { ref: '126300', brand: 'Rolex', model: 'Datejust 41', years: '2017–heute', size: '41 mm', caliber: '3235', note: 'Glatte Lünette' },
    { ref: '116334', brand: 'Rolex', model: 'Datejust II', years: 'ca. 2009–2016', size: '41 mm', caliber: '3136' },
    { ref: '126200', brand: 'Rolex', model: 'Datejust 36', years: '2018–heute', size: '36 mm', caliber: '3235' },
    { ref: '126201', brand: 'Rolex', model: 'Datejust 36 Edelstahl/Everose', years: '2018–heute', size: '36 mm', caliber: '3235' },
    { ref: '116200', brand: 'Rolex', model: 'Datejust 36', years: 'ca. 2006–2019', size: '36 mm', caliber: '3135' },
    { ref: '16234', brand: 'Rolex', model: 'Datejust 36', years: '1988–ca. 2006', size: '36 mm', caliber: '3135', note: 'Weißgold-Riffellünette, Saphirglas' },
    { ref: '16014', brand: 'Rolex', model: 'Datejust 36', years: 'ca. 1977–1988', size: '36 mm', caliber: '3035', note: 'Übergangsreferenz mit Schnellschaltung' },
    { ref: '1601', brand: 'Rolex', model: 'Datejust', years: 'ca. 1959–1977', size: '36 mm', caliber: '1560/1570', note: 'Plexiglas, Pie-Pan-Zifferblätter' },
    { ref: '124200', brand: 'Rolex', model: 'Oyster Perpetual 34', years: '2020–heute', size: '34 mm', caliber: '2232' },
    { ref: '124300', brand: 'Rolex', model: 'Oyster Perpetual 41', years: '2020–heute', size: '41 mm', caliber: '3230' },
    { ref: '126000', brand: 'Rolex', model: 'Oyster Perpetual 36', years: '2020–heute', size: '36 mm', caliber: '3230' },
    { ref: '126600', brand: 'Rolex', model: 'Sea-Dweller 43', years: '2017–heute', size: '43 mm', caliber: '3235', note: 'Rote Schrift, Zyklop — 50-Jahre-Modell' },
    { ref: '126900', brand: 'Rolex', model: 'Air-King', years: '2022–heute', size: '40 mm', caliber: '3230' },
    { ref: '116900', brand: 'Rolex', model: 'Air-King', years: '2016–2022', size: '40 mm', caliber: '3131' },
    { ref: '226570', brand: 'Rolex', model: 'Explorer II', years: '2021–heute', size: '42 mm', caliber: '3285' },
    { ref: '216570', brand: 'Rolex', model: 'Explorer II', years: '2011–2021', size: '42 mm', caliber: '3187' },
    { ref: '124270', brand: 'Rolex', model: 'Explorer 36', years: '2021–heute', size: '36 mm', caliber: '3230' },
    { ref: '114270', brand: 'Rolex', model: 'Explorer', years: '2001–2010', size: '36 mm', caliber: '3130' },
    { ref: '116200', brand: 'Rolex', model: 'Datejust 36', years: 'ca. 2006–2019', size: '36 mm', caliber: '3135' },

    /* OMEGA */
    { ref: '210.30.42.20.01.001', brand: 'Omega', model: 'Seamaster Diver 300M', years: '2018–heute', size: '42 mm', caliber: '8800', note: 'Keramik-Zifferblatt mit Wellendekor' },
    { ref: '210.92.42.20.01.001', brand: 'Omega', model: 'Seamaster Diver 300M „007 Edition“', years: '2019–heute', size: '42 mm', caliber: '8806', note: 'Titan, No-Time-to-Die-Modell' },
    { ref: '310.30.42.50.01.001', brand: 'Omega', model: 'Speedmaster Moonwatch Professional', years: '2021–heute', size: '42 mm', caliber: '3861', note: 'Saphirglas-Version, Co-Axial Master Chronometer' },
    { ref: '310.30.42.50.01.002', brand: 'Omega', model: 'Speedmaster Moonwatch Professional', years: '2021–heute', size: '42 mm', caliber: '3861', note: 'Hesalit-Version' },
    { ref: '311.30.42.30.01.005', brand: 'Omega', model: 'Speedmaster Professional Moonwatch', years: 'ca. 2014–2021', size: '42 mm', caliber: '1863', note: 'Saphir-Sandwich' },
    { ref: '311.30.42.30.01.006', brand: 'Omega', model: 'Speedmaster Professional Moonwatch', years: 'ca. 2014–2021', size: '42 mm', caliber: '1861', note: 'Hesalit' },
    { ref: '2201.51.00', brand: 'Omega', model: 'Seamaster Planet Ocean 42', years: 'ca. 2005–2012', size: '42 mm', caliber: '2500 Co-Axial' },
    { ref: '2200.50.00', brand: 'Omega', model: 'Seamaster Planet Ocean 45,5', years: 'ca. 2005–2012', size: '45,5 mm', caliber: '2500 Co-Axial' },
    { ref: '215.30.44.21.03.001', brand: 'Omega', model: 'Seamaster Planet Ocean 600M', years: '2016–heute', size: '43,5 mm', caliber: '8900' },
    { ref: '215.30.40.20.03.001', brand: 'Omega', model: 'Seamaster Planet Ocean 600M', years: '2016–heute', size: '39,5 mm', caliber: '8800' },
    { ref: '231.10.42.21.01.003', brand: 'Omega', model: 'Seamaster Aqua Terra', years: 'ca. 2012–2017', size: '41,5 mm', caliber: '8500' },
    { ref: '231.10.43.22.03.001', brand: 'Omega', model: 'Seamaster Aqua Terra GMT', years: 'ca. 2012–2017', size: '43 mm', caliber: '8605' },
    { ref: '220.10.41.21.10.001', brand: 'Omega', model: 'Seamaster Aqua Terra', years: '2017–heute', size: '41 mm', caliber: '8900' },
    { ref: '130.23.39.21.03.001', brand: 'Omega', model: 'Constellation Globemaster', years: '2015–heute', size: '39 mm', caliber: '8900/8901', note: 'Erster Master Chronometer' },
    { ref: '324.30.38.50.06.001', brand: 'Omega', model: 'Speedmaster 38', years: 'ca. 2017–heute', size: '38 mm', caliber: '3330' },
    { ref: '329.33.43.51.02.001', brand: 'Omega', model: 'Speedmaster Chronoscope', years: '2021–heute', size: '43 mm', caliber: '9908' },
    { ref: '2501.81', brand: 'Omega', model: 'Seamaster Aqua Terra (Vintage-Reihe)', years: 'ca. 2003–2008', size: '36 mm', caliber: '2500' },

    /* IWC */
    { ref: 'IW377709', brand: 'IWC', model: 'Pilot’s Watch Chronograph', years: 'ca. 2016–2021', size: '43 mm', caliber: '79320' },
    { ref: 'IW377701', brand: 'IWC', model: 'Fliegerchronograph', years: 'ca. 2007–2016', size: '43 mm', caliber: '79320' },
    { ref: 'IW377719', brand: 'IWC', model: 'Pilot’s Watch Spitfire Chronograph', years: 'ca. 2016–2019', size: '43 mm', caliber: '79320' },
    { ref: 'IW388102', brand: 'IWC', model: 'Pilot’s Watch Chronograph 41', years: '2019–heute', size: '41 mm', caliber: '69385', note: 'Manufakturkaliber, Wechselband-System' },
    { ref: 'IW327001', brand: 'IWC', model: 'Pilot’s Watch Mark XVIII', years: '2016–ca. 2022', size: '40 mm', caliber: '35111' },
    { ref: 'IW371445', brand: 'IWC', model: 'Portugieser Chronograph', years: 'ca. 1998–2020', size: '41 mm', caliber: '79350', note: 'Der Klassiker unter den Portugieser-Chronos' },
    { ref: 'IW371605', brand: 'IWC', model: 'Portugieser Chronograph', years: '2020–heute', size: '41 mm', caliber: '69355', note: 'Manufakturkaliber, Glasboden' },
    { ref: 'IW500712', brand: 'IWC', model: 'Portugieser Automatic 7 Days', years: 'ca. 2015–2020', size: '42,3 mm', caliber: '52010' },
    { ref: 'IW358305', brand: 'IWC', model: 'Portugieser Automatic 40', years: '2020–heute', size: '40,4 mm', caliber: '82200' },
    { ref: 'IW510106', brand: 'IWC', model: 'Portofino Hand-Wound Eight Days', years: 'ca. 2015–2021', size: '45 mm', caliber: '59210' },
    { ref: 'IW458101', brand: 'IWC', model: 'Portofino Automatic 37', years: 'ca. 2014–2021', size: '37 mm', caliber: '35100' },
    { ref: 'IW545405', brand: 'IWC', model: 'Portugieser Handaufzug', years: 'ca. 2003–2010', size: '44 mm', caliber: '98295', note: 'Jones-Kaliber mit langem Rücker' },
    { ref: 'IW370703', brand: 'IWC', model: 'GST Chronograph Titan', years: 'ca. 1997–2003', size: '40 mm', caliber: '79320' },
    { ref: 'IW502001', brand: 'IWC', model: 'Big Pilot Top Gun Keramik', years: 'ca. 2007–2012', size: '46 mm', caliber: '51111' },

    /* BREITLING */
    { ref: 'AB0121211C1A1', brand: 'Breitling', model: 'Navitimer B01 Chronograph 43', years: 'ca. 2018–heute', size: '43 mm', caliber: 'B01', note: 'Blaues Zifferblatt, Manufakturkaliber' },
    { ref: 'AB0138241C1P1', brand: 'Breitling', model: 'Navitimer B01 Chronograph 43', years: '2022–heute', size: '43 mm', caliber: 'B01' },
    { ref: 'A17318101C1A1', brand: 'Breitling', model: 'Avenger Automatic 42', years: '2019–heute', size: '42 mm', caliber: '17' },
    { ref: 'A32390', brand: 'Breitling', model: 'Avenger II GMT', years: 'ca. 2013–2019', size: '43 mm', caliber: '32' },
    { ref: 'E1338310', brand: 'Breitling', model: 'Avenger Bandit Chronograph Titan', years: 'ca. 2016–2019', size: '45 mm', caliber: '13' },
    { ref: 'A1732024', brand: 'Breitling', model: 'Superocean Héritage 46', years: 'ca. 2007–2017', size: '46 mm', caliber: '17' },
    { ref: 'B13047', brand: 'Breitling', model: 'Chronomat (Vintage)', years: 'ca. 1990er', size: '40 mm', caliber: '13 (Valjoux-Basis)' },
    { ref: 'A17376', brand: 'Breitling', model: 'Superocean 44', years: 'ca. 2010–2019', size: '44 mm', caliber: '17' },

    /* TUDOR */
    { ref: '79230R', brand: 'Tudor', model: 'Black Bay 41, rote Lünette', years: '2016–ca. 2023', size: '41 mm', caliber: 'MT5602', note: 'Manufakturkaliber, Snowflake-Zeiger' },
    { ref: '79230N', brand: 'Tudor', model: 'Black Bay 41, schwarze Lünette', years: '2016–ca. 2023', size: '41 mm', caliber: 'MT5602' },
    { ref: '79030N', brand: 'Tudor', model: 'Black Bay Fifty-Eight', years: '2018–heute', size: '39 mm', caliber: 'MT5402' },
    { ref: '79030B', brand: 'Tudor', model: 'Black Bay Fifty-Eight „Navy Blue“', years: '2020–heute', size: '39 mm', caliber: 'MT5402' },
    { ref: '28400', brand: 'Tudor', model: 'Royal 34', years: '2020–heute', size: '34 mm', caliber: 'T201 (Automatik)' },
    { ref: '79503', brand: 'Tudor', model: 'Black Bay 36 Stahl/Gelbgold', years: 'ca. 2019–heute', size: '36 mm', caliber: 'T600' },

    /* TAG HEUER */
    { ref: 'CV2010', brand: 'TAG Heuer', model: 'Carrera Calibre 16 Chronograph', years: 'ca. 2005–2015', size: '41 mm', caliber: '16 (ETA 7750-Basis)' },
    { ref: 'CBM2110', brand: 'TAG Heuer', model: 'Carrera Calibre 16 Chronograph', years: 'ca. 2018–2022', size: '41 mm', caliber: '16' },
    { ref: 'WAR201Z', brand: 'TAG Heuer', model: 'Carrera Calibre 7 GMT Big Date', years: 'ca. 2015–2019', size: '41 mm', caliber: '7' },
    { ref: 'CJF2111', brand: 'TAG Heuer', model: 'Link Chronograph Automatik', years: 'ca. 2004–2010', size: '42 mm', caliber: '16' },

    /* CARTIER */
    { ref: 'WSCL0006', brand: 'Cartier', model: 'Clé de Cartier 40', years: 'ca. 2015–2021', size: '40 mm', caliber: '1847 MC' },
    { ref: '2716', brand: 'Cartier', model: 'Tank Solo (Quarz)', years: 'ca. 2004–2012', size: '24 × 31 mm', caliber: 'Quarz' },
    { ref: 'WSTA0028', brand: 'Cartier', model: 'Tank Must Large', years: '2021–heute', size: '25,5 × 33,7 mm', caliber: 'Quarz' },
    { ref: 'W69011Z4', brand: 'Cartier', model: 'Ballon Bleu 42 Automatik', years: 'ca. 2007–2019', size: '42 mm', caliber: '049' },

    /* PANERAI */
    { ref: 'PAM00632', brand: 'Panerai', model: 'Luminor Marina 8 Days', years: 'ca. 2015–2019', size: '44 mm', caliber: 'P.5000 (Handaufzug)' },
    { ref: 'PAM00111', brand: 'Panerai', model: 'Luminor Base', years: 'ca. 2002–2015', size: '44 mm', caliber: 'OP XI (Handaufzug)' },
    { ref: 'PAM01312', brand: 'Panerai', model: 'Luminor Marina Automatik', years: 'ca. 2014–heute', size: '44 mm', caliber: 'P.9010' },

    /* WEITERE MARKEN */
    { ref: '1-90-02-42-32-05', brand: 'Glashütte Original', model: 'PanoMaticLunar', years: 'ca. 2011–heute', size: '40 mm', caliber: '90-02', note: 'Dezentrale Anzeige, Mondphase' },
    { ref: '04.TR.LB', brand: 'MB&F', model: 'Legacy Machine Split Escapement EVO', years: '2022–heute', size: '44 mm', caliber: 'Manufaktur (McDonnell)', note: 'Fliegende Unruh über dem Zifferblatt, Titan' },
    { ref: 'L2.752.4.72.6', brand: 'Longines', model: 'Saint-Imier Chronograph', years: 'ca. 2012–2019', size: '41 mm', caliber: 'L688 (Säulenrad)' },
    { ref: '103068', brand: 'Bvlgari', model: 'Octo Finissimo Chronograph GMT', years: '2019–heute', size: '43 mm', caliber: 'BVL 318', note: 'Flachster Automatik-Chronograph seiner Zeit' },
    { ref: '205', brand: 'Nomos', model: 'Ludwig Handaufzug', years: 'ca. 1992–heute', size: '35 mm', caliber: 'Alpha' },
    { ref: '103', brand: 'Sinn', model: '103 Chronograph', years: 'seit den 1990ern', size: '41 mm', caliber: 'Valjoux/Sellita 7750-Basis', note: 'Fliegerchronograph-Klassiker' },
    { ref: 'MV045226', brand: 'Baume & Mercier', model: 'Hampton 18 K Weißgold', years: 'ca. 2000er', size: '—', caliber: 'Quarz/Automatik je nach Ausführung' },
  ];

  /* ---------- brand recognition patterns (fallback) ---------- */
  var PATTERNS = [
    { re: /^IW\d{6}/, brand: 'IWC' },
    { re: /^PAM\d{4,5}/, brand: 'Panerai' },
    { re: /^L\d\.\d{3}\./, brand: 'Longines' },
    { re: /^(CV|CBM|WAR|CJF|CBN|WAY|CAZ|WBN)/, brand: 'TAG Heuer' },
    { re: /^(AB|A\d|E\d|U\d|IB|RB)/, brand: 'Breitling' },
    { re: /^(WS|WG|W6|WJ|CRW)/, brand: 'Cartier' },
    { re: /^\d{3}\.\d{2}\.\d{2}/, brand: 'Omega' },
    { re: /^\d{4}\.\d{2}\.\d{2}$/, brand: 'Omega' },
    { re: /^M?79\d{3}/, brand: 'Tudor' },
    { re: /^1-\d{2}-\d{2}/, brand: 'Glashütte Original' },
    { re: /^(1[12][0-9]\d{3}|2[0-9]{5})(?:[A-Z]{2,4})?$/, brand: 'Rolex (wahrscheinlich)' },
    { re: /^16\d{3}$/, brand: 'Rolex (wahrscheinlich)' },
  ];

  /* ---------- rolex serial → year (letter prefixes; ab 2010 randomisiert) ---------- */
  var ROLEX_SERIALS = [
    ['R', 'ca. 1987–1988'], ['L', 'ca. 1988–1990'], ['E', 'ca. 1990–1991'],
    ['X', 'ca. 1991'], ['N', 'ca. 1991–1992'], ['C', 'ca. 1992–1993'],
    ['S', 'ca. 1993–1994'], ['W', 'ca. 1994–1996'], ['T', 'ca. 1996–1997'],
    ['U', 'ca. 1997–1998'], ['A', 'ca. 1998–2000'], ['P', 'ca. 2000–2001'],
    ['K', 'ca. 2001–2002'], ['Y', 'ca. 2002–2003'], ['F', 'ca. 2003–2005'],
    ['D', 'ca. 2005–2006'], ['Z', 'ca. 2006–2008'], ['M', 'ca. 2007–2008'],
    ['V', 'ca. 2008–2010'], ['G', 'ca. 2010–2011'],
  ];

  function norm(s) {
    return (s || '').toUpperCase().replace(/[\s]/g, '').replace(/[–—]/g, '-');
  }
  function normLoose(s) {
    return norm(s).replace(/[.\-\/]/g, '');
  }

  HV.refLookup = function (query) {
    var q = norm(query);
    var ql = normLoose(query);
    if (ql.length < 3) return { state: 'short' };

    /* 1) live inventory — exact or loose ref match */
    var stock = (window.PRODUCTS || []).filter(function (p) {
      if (!p.ref) return false;
      var pr = normLoose(p.ref);
      return pr === ql || (ql.length >= 4 && (pr.indexOf(ql) === 0 || ql.indexOf(pr) === 0));
    });

    /* 2) curated DB — exact first, then prefix */
    var exact = DB.filter(function (e) { return normLoose(e.ref) === ql; });
    var prefix = exact.length ? [] : DB.filter(function (e) {
      var er = normLoose(e.ref);
      return ql.length >= 4 && (er.indexOf(ql) === 0 || ql.indexOf(er) === 0);
    }).slice(0, 3);
    var entry = exact[0] || null;

    if (entry || stock.length || prefix.length) {
      return { state: 'hit', query: q, entry: entry, near: prefix, stock: stock };
    }

    /* 3) brand recognition */
    for (var i = 0; i < PATTERNS.length; i++) {
      if (PATTERNS[i].re.test(q)) {
        return { state: 'brand', query: q, brand: PATTERNS[i].brand };
      }
    }
    return { state: 'miss', query: q };
  };

  HV.serialLookup = function (query) {
    var q = norm(query);
    if (q.length < 2) return { state: 'short' };
    var first = q.charAt(0);
    if (/^\d+$/.test(q)) {
      var n = parseInt(q, 10);
      var era = null;
      if (q.length >= 6) {
        if (n < 1000000) era = 'ca. vor 1964';
        else if (n < 2000000) era = 'ca. 1964–1968';
        else if (n < 3000000) era = 'ca. 1969–1971';
        else if (n < 4000000) era = 'ca. 1972–1974';
        else if (n < 5000000) era = 'ca. 1975–1977';
        else if (n < 6000000) era = 'ca. 1978–1979';
        else if (n < 7000000) era = 'ca. 1980–1981';
        else if (n < 9000000) era = 'ca. 1982–1986';
        else era = 'ca. 1986–1987';
      }
      return era ? { state: 'hit', year: era, note: 'Numerische Seriennummer (vor Buchstaben-Ära).' }
                 : { state: 'miss' };
    }
    if (/^[A-Z]/.test(first)) {
      var row = ROLEX_SERIALS.find(function (r) { return r[0] === first; });
      if (row && /^\d+$/.test(q.slice(1)) && q.length >= 6) {
        return { state: 'hit', year: row[1], note: 'Buchstaben-Präfix „' + first + '“.' };
      }
      if (q.length >= 8 && /^[A-Z0-9]+$/.test(q)) {
        return { state: 'random', note: 'Ab ca. 2010 vergibt Rolex zufällige Seriennummern — eine Datierung ist darüber nicht mehr möglich. Verlässlich ist dann nur die Garantiekarte.' };
      }
      if (row) return { state: 'hit', year: row[1], note: 'Buchstaben-Präfix „' + first + '“.' };
    }
    return { state: 'miss' };
  };

  HV.REFDB_SIZE = DB.length;
})();
