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

  const krakowHospitals = [
    { name: 'Szpital Uniwersytecki w Krakowie (SOR)', address: 'ul. Jakubowskiego 2, Kraków', lat: 50.0121, lon: 19.9856 },
    { name: 'Szpital Specjalistyczny im. G. Narutowicza (SOR)', address: 'ul. Prądnicka 35-37, Kraków', lat: 50.0812, lon: 19.9431 },
    { name: 'Szpital Specjalistyczny im. S. Żeromskiego (SOR)', address: 'os. Na Skarpie 66, Kraków', lat: 50.0784, lon: 20.0332 },
    { name: 'Wojskowy Szpital Kliniczny z Polikliniką (SOR)', address: 'ul. Wrocławska 1-3, Kraków', lat: 50.0765, lon: 19.9287 },
  ];

  const findNearestHospital = (userLat, userLon, placeName = '') => {
    setLoading(true);

    setTimeout(() => {
      let nearest = krakowHospitals[0];
      let minDistance = Number.MAX_VALUE;

      krakowHospitals.forEach((hosp) => {
        const dist = Math.sqrt(Math.pow(hosp.lat - userLat, 2) + Math.pow(hosp.lon - userLon, 2));
        if (dist < minDistance) {
          minDistance = dist;
          nearest = hosp;
        }
      });

      setHospitalInfo({
        name: nearest.name,
        address: nearest.address
      });

      setLocation(placeName || `Kraków (współrzędne GPS)`);
      setLoading(false);
    }, 400);
  };

  const handleGetGeoLocation = () => {
    if (!navigator.geolocation) {
      alert('Twoja przeglądarka nie wspiera geolokalizacji.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        findNearestHospital(lat, lon, 'Twoja lokalizacja GPS (Kraków i okolice)');
      },
      () => {
        setLoading(false);
        alert('Nie udało się pobrać lokalizacji. Sprawdź uprawnienia przeglądarki.');
      },
      { timeout: 10000 }
    );
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
    const val = e.target.value;
    setLocation(val);

    if (val.toLowerCase().includes('kraków') || val.toLowerCase().includes('krakow')) {
      setHospitalInfo({
        name: 'Szpital Uniwersytecki w Krakowie (SOR)',
        address: 'ul. Jakubowskiego 2, Kraków'
      });
    } else if (val.trim().length > 2) {
      setHospitalInfo({
        name: 'Szpital Rejonowy / SOR',
        address: `Najbliższy oddział ratunkowy dla lokalizacji: ${val}`
      });
    } else {
      setHospitalInfo(null);
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
          <div className="location-input-row">
            <input 
              type="text" 
              className="date-input location-page-input"
              placeholder="np. Kraków lub użyj GPS"
              value={location}
              onChange={handleLocationChange}
            />
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