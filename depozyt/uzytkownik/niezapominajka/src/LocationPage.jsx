import { useState } from 'react';
import flowerIcon from './assets/famicons_flower-sharp.svg'; // Dopasuj ścieżkę względną, jeśli plik jest w innym folderze

export default function LocationPage({ onHome }) {
  const [location, setLocation] = useState('');
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [caseCode] = useState(() => Math.random().toString(36).substring(2, 10).toUpperCase());
  const [caseKey] = useState(() => Math.random().toString(36).substring(2, 10).toUpperCase());

  const handleQuickExit = () => {
    window.location.replace('https://www.google.com');
  };

  // Baza głównych szpitali z SOR w Krakowie (pewne i sprawdzone adresy)
  const krakowHospitals = [
    { name: 'Szpital Uniwersytecki w Krakowie (SOR)', address: 'ul. Jakubowskiego 2, Kraków', lat: 50.0121, lon: 19.9856 },
    { name: 'Szpital Specjalistyczny im. G. Narutowicza (SOR)', address: 'ul. Prądnicka 35-37, Kraków', lat: 50.0812, lon: 19.9431 },
    { name: 'Szpital Specjalistyczny im. S. Żeromskiego (SOR)', address: 'os. Na Skarpie 66, Kraków', lat: 50.0784, lon: 20.0332 },
    { name: 'Wojskowy Szpital Kliniczny z Polikliniką (SOR)', address: 'ul. Wrocławska 1-3, Kraków', lat: 50.0765, lon: 19.9287 },
  ];

  // Funkcja obliczająca najbliższy szpital na podstawie współrzędnych GPS
  const findNearestHospital = (userLat, userLon, placeName = '') => {
    setLoading(true);

    setTimeout(() => {
      // Proste obliczenie odległości (twierdza Pitagorasa w przybliżeniu dla km)
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

  // Obsługa GPS HTML5
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
        // Domyślnie dla Krakowa lub okolic szukamy z naszej zweryfikowanej listy SOR-ów
        findNearestHospital(lat, lon, 'Twoja lokalizacja GPS (Kraków i okolice)');
      },
      () => {
        setLoading(false);
        alert('Nie udało się pobrać lokalizacji. Sprawdź uprawnienia przeglądarki.');
      },
      { timeout: 10000 }
    );
  };

  // Wyszukiwanie tekstowe (np. wpisanie "Kraków")
  const handleLocationChange = (e) => {
    const val = e.target.value;
    setLocation(val);

    if (val.toLowerCase().includes('kraków') || val.toLowerCase().includes('krakow')) {
      // Jeśli użytkownik wpisze Kraków, domyślnie podajemy Szpital Uniwersytecki jako główny SOR
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

        <main className="merged-flow-main">
          <h2>Podaj swoją lokalizację w celu ukazania najbliższego szpitala</h2>
          
          <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '500px', justifyContent: 'center' }}>
            <input 
              type="text" 
              className="date-input"
              placeholder="np. Kraków lub użyj GPS"
              value={location}
              onChange={handleLocationChange}
              style={{ maxWidth: '340px', margin: 0 }}
            />
            <button 
              onClick={handleGetGeoLocation}
              style={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0 15px',
                cursor: 'pointer',
                fontWeight: 'bold',
                color: '#6b83fe',
                fontSize: '0.9rem',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
              }}
              title="Pobierz moją aktualną lokalizację GPS"
            >
              📍 GPS
            </button>
          </div>

          {loading && <p style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '5px' }}>Szukanie najbliższego SOR-u...</p>}

          {location.length > 0 && !loading && (
            <div className="merged-results-box" style={{ marginTop: '10px' }}>
              <p className="med-info-text">
                Twój najbliższy punkt opieki medycznej to: <strong>{hospitalInfo ? hospitalInfo.name : 'Wyszukiwanie...'}</strong><br />
                Adres: <strong>{hospitalInfo ? hospitalInfo.address : ''}</strong><br />
                Aby poprawnie zabezpieczyć próbkę moczu należy... Pamiętaj aby zabezpieczyć ubrania itp.<br />
                Przetransportuj się do pobliskiego punktu opieki medycznej wraz z próbką moczu.<br />
                Na miejscu ukaż kod sprawy bądź kod QR personelowi medycznemu w celu łatwej identyfikacji sprawy.<br />
                Zapisz kod sprawy i kod QR aby móc zarządzać sprawą.<br />
                Pamiętaj aby pobrać informację dt. sprawy to pozwoli Ci na dalsze podążanie za statusem.
              </p>

              <p className="warning-text">
                ZAPISZ TE DANE W BEZPIECZNYM MIEJSCU. DOSTĘP DO NICH JEST KLUCZOWY W DOSTĘPIE DO SPRAWY
              </p>

              <div className="case-card-container">
                <div className="case-card-left">
                  <p><strong>KOD SPRAWY:</strong> {caseCode}</p>
                  <p><strong>KLUCZ SPRAWY:</strong> {caseKey}</p>
                </div>
                <div className="case-card-qr">
                  <span>KOD QR</span>
                </div>
              </div>

              <div className="download-info-link">
                pobierz informacje
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}