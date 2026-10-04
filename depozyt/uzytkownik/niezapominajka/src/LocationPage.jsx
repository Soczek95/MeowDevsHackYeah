import { useState, useEffect, useRef } from 'react';
import flowerIcon from './assets/famicons_flower-sharp.svg'; 
import QRCode from 'react-qr-code';

export default function LocationPage({ onHome, caseData }) {
  const [location, setLocation] = useState('');
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Ref do ukrytego kontenera QR – potrzebny do wygenerowania obrazka
  const qrRef = useRef(null);

  const handleQuickExit = () => {
    window.location.replace('https://www.google.com');
  };

  // Precyzyjne obliczanie odległości (wzór Haversine)
  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Promień Ziemi w km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // 1. Szukanie w Overpass API na podstawie współrzędnych
  const findNearestHospital = async (userLat, userLon, placeName = '') => {
    setLoading(true);
    try {
      // Zapytanie o szpitale z SOR w promieniu 50 km (50000 metrów)
      const query = `
        [out:json][timeout:15];
        (
          node["amenity"="hospital"]["emergency"="yes"](around:50000,${userLat},${userLon});
          way["amenity"="hospital"]["emergency"="yes"](around:50000,${userLat},${userLon});
          relation["amenity"="hospital"]["emergency"="yes"](around:50000,${userLat},${userLon});
        );
        out center;
      `;
      
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`
      });
      const data = await res.json();

      if (data.elements && data.elements.length > 0) {
        let nearest = null;
        let minDistance = Number.MAX_VALUE;

        // Znajdź fizycznie najbliższy obiekt z pobranych
        data.elements.forEach(el => {
          const lat = el.lat || el.center.lat;
          const lon = el.lon || el.center.lon;
          const dist = getDistanceKm(userLat, userLon, lat, lon);

          if (dist < minDistance) {
            minDistance = dist;
            
            // Formatowanie adresu z tagów OSM
            const street = el.tags['addr:street'] || '';
            const houseNumber = el.tags['addr:housenumber'] || '';
            const city = el.tags['addr:city'] || '';
            let fullAddress = `${street} ${houseNumber}, ${city}`.trim().replace(/^,|,$/g, '').trim();
            
            nearest = {
              name: el.tags.name || 'Szpital / SOR (brak nazwy w bazie)',
              address: fullAddress.length > 3 ? fullAddress : 'Sprawdź na mapie (brak dokładnego adresu)',
              dist: dist
            };
          }
        });

        setHospitalInfo({
          name: nearest.name,
          address: `${nearest.address} (~${nearest.dist.toFixed(1)} km stąd)`
        });
      } else {
        setHospitalInfo({
          name: 'Brak wyników',
          address: 'Nie znaleziono oddziału ratunkowego (SOR) w promieniu 50 km.'
        });
      }
      setLocation(placeName || 'Aktualna lokalizacja GPS');
    } catch (error) {
      console.error("Błąd pobierania danych OSM:", error);
      setHospitalInfo({
        name: 'Błąd połączenia',
        address: 'Nie udało się pobrać danych. Spróbuj użyć innej wyszukiwarki medycznej.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetGeoLocation = () => {
    if (!navigator.geolocation) {
      alert('Twoja przeglądarka nie wspiera geolokalizacji.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        findNearestHospital(position.coords.latitude, position.coords.longitude, 'Twoja lokalizacja GPS');
      },
      () => {
        setLoading(false);
        alert('Nie udało się pobrać lokalizacji. Sprawdź uprawnienia przeglądarki lub wpisz miasto ręcznie.');
      },
      { timeout: 10000 }
    );
  };

  // 2. Zamiana wpisanego tekstu (np. "Warszawa") na współrzędne przez Nominatim
  const handleCitySearch = async () => {
    if (location.trim().length < 3) return;
    
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=pl&q=${encodeURIComponent(location)}`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        // Gdy mamy współrzędne miasta, szukamy szpitala
        await findNearestHospital(parseFloat(lat), parseFloat(lon), display_name.split(',')[0]);
      } else {
        setHospitalInfo({ name: 'Nie znaleziono miejscowości', address: 'Sprawdź poprawność wpisanej nazwy.' });
        setLoading(false);
      }
    } catch (error) {
      console.error("Błąd wyszukiwania miejscowości:", error);
      setLoading(false);
      alert('Błąd wyszukiwania miejscowości.');
    }
  };

  // Automatyczne zapytanie o lokalizację przy wejściu
  useEffect(() => {
    const askForLocation = () => {
      const userConsent = window.confirm(
        'Czy chcesz udostępnić swoją lokalizację, aby znaleźć najbliższy punkt opieki medycznej (SOR)?'
      );
      if (userConsent) {
        handleGetGeoLocation();
      }
    };

    const timer = setTimeout(askForLocation, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCitySearch();
    }
  };

  const qrValue = caseData ? caseData.case_id : '';

  // === GENEROWANIE PLIKU HTML Z KODEM QR ===
  const handleDownloadInfo = () => {
    if (!caseData) {
      alert('Dane sprawy nie są jeszcze dostępne. Spróbuj ponownie za chwilę.');
      return;
    }

    const caseId = caseData.case_id || 'BRAK';
    const caseKey = caseData.case_key || 'BRAK';
    const generatedAt = new Date().toLocaleString('pl-PL');

    // Pobieramy SVG kodu QR z DOM (react-qr-code renderuje SVG)
    const qrSvgElement = qrRef.current?.querySelector('svg');
    const qrSvgString = qrSvgElement ? qrSvgElement.outerHTML : '';

    // Budujemy pełny dokument HTML z osadzonym kodem QR
    const htmlContent = `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>Niezapominajka - Sprawa ${caseId}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, sans-serif;
      background: linear-gradient(180deg, #4967fb 0%, #7d90fa 50%, #a799f0 100%);
      min-height: 100vh;
      margin: 0;
      padding: 40px 20px;
      color: #1a1a1a;
    }
    .container {
      max-width: 700px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
    }
    h1 {
      font-size: 1.8rem;
      color: #1a1a1a;
      margin-bottom: 10px;
      text-align: center;
    }
    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
      font-size: 0.95rem;
    }
    .data-section {
      background: #f8f9fa;
      border-left: 4px solid #6d84fb;
      padding: 20px 25px;
      border-radius: 10px;
      margin-bottom: 25px;
    }
    .data-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }
    .data-row:last-child {
      border-bottom: none;
    }
    .data-label {
      font-weight: 700;
      color: #555;
      text-transform: uppercase;
      font-size: 0.8rem;
      letter-spacing: 1px;
    }
    .data-value {
      font-family: monospace;
      font-size: 1.1rem;
      font-weight: 700;
      color: #1a1a1a;
    }
    .qr-section {
      text-align: center;
      padding: 30px;
      background: #ffffff;
      border-radius: 15px;
      margin-bottom: 25px;
      border: 2px dashed #6d84fb;
    }
    .qr-section svg {
      display: block;
      margin: 0 auto;
    }
    .qr-label {
      margin-top: 15px;
      font-size: 0.9rem;
      color: #666;
      font-style: italic;
    }
    .instructions {
      background: rgba(109, 132, 251, 0.08);
      padding: 20px 25px;
      border-radius: 10px;
      line-height: 1.6;
      font-size: 0.95rem;
    }
    .instructions h2 {
      font-size: 1.1rem;
      margin-bottom: 12px;
      color: #1a1a1a;
    }
    .instructions ol {
      padding-left: 20px;
    }
    .instructions li {
      margin-bottom: 6px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 0.8rem;
      color: #888;
    }
    .warning {
      background: rgba(220, 38, 38, 0.08);
      border-left: 4px solid #dc2626;
      padding: 15px 20px;
      border-radius: 8px;
      color: #7f1d1d;
      font-weight: 700;
      text-align: center;
      margin-bottom: 25px;
      font-size: 0.95rem;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Niezapominajka</h1>
    <p class="subtitle">Dane sprawy - zachowaj ten dokument w bezpiecznym miejscu</p>

    <div class="warning">
       NIE UDOSTĘPNIAJ TYCH DANYCH OSOBOM POSTRONNYM
    </div>

    <div class="data-section">
      <div class="data-row">
        <span class="data-label">Kod sprawy</span>
        <span class="data-value">${caseId}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Klucz sprawy</span>
        <span class="data-value">${caseKey}</span>
      </div>
    </div>

    <div class="qr-section">
      ${qrSvgString}
      <p class="qr-label">Pokaż ten kod QR personelowi medycznemu</p>
    </div>

    <div class="instructions">
      <h2>Co dalej?</h2>
      <ol>
        <li>Zabezpiecz próbkę (np. mocz) w pojemniku.</li>
        <li>Udaj się do najbliższego punktu opieki medycznej (SOR).</li>
        <li>Pokaż personelowi medycznemu powyższy kod QR lub kod sprawy.</li>
        <li>Zachowaj ten dokument - jest kluczowy do dalszego zarządzania sprawą.</li>
      </ol>
    </div>

    <div class="footer">
      Wygenerowano: ${generatedAt}<br>
      System niezapominajka &copy; 2026
    </div>
  </div>
</body>
</html>
    `.trim();

    // Tworzymy plik HTML i pobieramy go
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `niezapominajka_sprawa_${caseId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="layout-container-sub">
      <div className="main-content">
        <header className="header-section">
          <div 
            onClick={onHome} 
            style={{ cursor: 'pointer', display: 'inline-block' }}
            title="Przejdź do strony głównej"
          >
            <h1 className="logo">niezapominajka</h1>
          </div>
          
          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'white', opacity: 0.9, textAlign: 'right', lineHeight: '1.2' }}>
              Kliknij kwiatek,<br />aby przejść do bezpiecznej strony
            </span>

            <button 
              className="login-btn" 
              aria-label="Szybkie wyjście na bezpieczną stronę" 
              onClick={handleQuickExit}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              <img 
                src={flowerIcon} 
                alt="Kwiatek - szybkie wyjście" 
                style={{ width: '32px', height: '32px', filter: 'brightness(0) invert(1)' }} 
              />
            </button>
          </div>
        </header>

        {/* GŁÓWNY BOX - glassmorphism */}
        <main className="location-page-box">
          
          {/* Nagłówek wyjaśniający */}
          <div className="location-header-section">
            <h2 className="location-page-title">Po co nam Twoja lokalizacja?</h2>
            <p className="location-page-intro">
              Na podstawie Twojej lokalizacji wskażemy Ci <strong>najbliższy punkt opieki medycznej (SOR)</strong>, 
              w którym możesz bezpiecznie zabezpieczyć próbkę i uzyskać pomoc. Nie musisz wpisywać adresu ręcznie – 
              możesz użyć swojego GPS.
            </p>
          </div>

          {/* Pole lokalizacji */}
          <div className="location-input-row" style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              className="date-input location-page-input"
              placeholder="Wpisz miasto (np. Krosno) i wciśnij Enter"
              value={location}
              onChange={handleLocationChange}
              onKeyDown={handleKeyDown}
              style={{ flex: 1 }}
            />
            <button 
              onClick={handleCitySearch}
              className="location-search-btn"
              title="Szukaj po nazwie miejscowości"
              style={{ padding: '0 15px', borderRadius: '8px', border: 'none', background: '#6d84fb', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
            >
               Szukaj
            </button>
            <button 
              onClick={handleGetGeoLocation}
              className="location-gps-btn"
              title="Pobierz moją aktualną lokalizację GPS"
            >
               GPS
            </button>
          </div>

          {loading && <p className="location-loading">Szukanie najbliższego SOR-u...</p>}

          {location.length > 0 && !loading && (
            <div className="merged-results-box" style={{ marginTop: '10px' }}>
              <p className="med-info-text-highlight">
                Twój najbliższy punkt opieki medycznej to: <strong>{hospitalInfo ? hospitalInfo.name : 'Wyszukiwanie...'}</strong><br />
                Adres: <strong>{hospitalInfo ? hospitalInfo.address : ''}</strong>
              </p>
              
              <div className="med-steps-container">
                <h3 className="med-steps-title">Zabezpieczenie śladów i dalsze kroki – co robić?</h3>
                <p className="med-steps-intro">Rozumiemy, że to bardzo trudny moment. Jeśli rozważasz zgłoszenie sprawy lub chcesz po prostu zadbać o swoje zdrowie, najważniejsze jest teraz odpowiednie zabezpieczenie śladów. Postaraj się wykonać poniższe kroki.</p>

                <div className="med-step-group">
                  <h4>1. Zabezpiecz swoje ciało i ubranie</h4>
                  <ul>
                    <li><strong>Nie myj się:</strong> Nawet jeśli czujesz silną potrzebę umycia się, postaraj się nie brać prysznica, nie kąpać się, nie szczotkować zębów, nie czesać włosów i nie korzystać z toalety (chyba że musisz oddać mocz do próbki). Zabezpieczy to ewentualne ślady DNA sprawcy.</li>
                    <li><strong>Zabezpiecz ubranie:</strong> Ubrania, które miałaś/eś na sobie w trakcie zdarzenia (w tym bieliznę), zdejmij ostrożnie i włóż do papierowej torby lub owiń w czysty papier. <em>Ważne: Nie używaj plastikowych reklamówek, ponieważ wilgoć niszczy ślady biologiczne.</em></li>
                  </ul>
                </div>

                <div className="med-step-group">
                  <h4>2. Jak poprawnie zabezpieczyć próbkę moczu?</h4>
                  <p className="med-step-subtext">To kluczowe, szczególnie jeśli podejrzewasz, że mogła zostać Ci podana tzw. "pigułka gwałtu" (substancje te bardzo szybko znikają z organizmu).</p>
                  <ul>
                    <li>Oddaj mocz do czystego, szczelnego pojemnika (najlepiej sterylnego pojemnika z apteki, ale jeśli go nie masz – użyj dokładnie umytego i wyparzonego słoiczka).</li>
                    <li>Zrób to jak najszybciej to możliwe.</li>
                    <li>Jeśli nie możesz od razu udać się do lekarza, włóż szczelnie zamknięty pojemnik do lodówki.</li>
                  </ul>
                </div>

                <div className="med-step-group">
                  <h4>3. Udaj się po pomoc medyczną</h4>
                  <ul>
                    <li>Zabierz ze sobą papierową torbę z ubraniami oraz zabezpieczoną próbkę moczu.</li>
                    <li>Udaj się do wyżej wskazanego punktu medycznego (SOR) lub na izbę przyjęć oddziału ginekologicznego. Powiedz personelowi, że doświadczyłaś/eś przemocy seksualnej i potrzebujesz pomocy medycznej oraz zabezpieczenia śladów.</li>
                  </ul>
                </div>

                <div className="med-step-group">
                  <h4>4. Twoja sprawa w naszym systemie</h4>
                  <p className="med-step-subtext">Aplikacja wygenerowała dla Ciebie unikalny identyfikator, który pomoże Ci anonimowo i bezpiecznie zarządzać Twoją sprawą.</p>
                  <ul>
                    <li><strong>Pokaż kod QR:</strong> Będąc w placówce medycznej, pokaż wygenerowany kod sprawy lub kod QR odpowiedniemu personelowi. Ułatwi to szybką identyfikację Twojej sprawy w systemie.</li>
                    <li><strong>Zapisz kod:</strong> Skopiuj kod sprawy lub zrób zrzut ekranu z kodem QR (widocznym poniżej). Zapisz go w bezpiecznym miejscu, do którego tylko Ty masz dostęp. Jest on niezbędny do późniejszego zarządzania zgłoszeniem.</li>
                  </ul>
                </div>
              </div>

              <p className="warning-text">
                ZAPISZ TE DANE W BEZPIECZNYM MIEJSCU. DOSTĘP DO NICH JEST KLUCZOWY W DOSTĘPIE DO SPRAWY
              </p>

              <div className="case-card-container">
                <div className="case-card-left">
                  <p><strong>KOD SPRAWY:</strong> {caseData ? caseData.case_id : 'Tworzenie sprawy...'}</p>
                  <p><strong>KLUCZ SPRAWY:</strong> {caseData ? caseData.case_key : 'Tworzenie sprawy...'}</p>
                </div>
                
                <div 
                  className="case-card-qr" 
                  style={{ 
                    width: 'auto', 
                    height: 'auto', 
                    padding: '8px', 
                    background: '#ffffff',
                    borderRadius: '8px'
                  }}
                >
                  {caseData ? (
                    <QRCode 
                      value={qrValue} 
                      size={90} 
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                    />
                  ) : (
                    <span style={{ padding: '20px', color: '#000' }}>Ładowanie...</span>
                  )}
                </div>
              </div>

              {/* Ukryty kontener QR - potrzebny do wygenerowania obrazka do pliku */}
              <div ref={qrRef} style={{ display: 'none' }}>
                {caseData && (
                  <QRCode 
                    value={qrValue} 
                    size={300} 
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                  />
                )}
              </div>

              <button 
                className="download-info-btn"
                onClick={handleDownloadInfo}
              >
                 ⬇ POBIERZ INFORMACJE O SPRAWIE (.PDF / HTML)
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}