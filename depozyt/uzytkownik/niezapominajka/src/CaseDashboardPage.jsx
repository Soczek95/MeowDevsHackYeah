import flowerIcon from './assets/famicons_flower-sharp.svg';

export default function CaseDashboardPage({ caseId, serverData, onHome }) {
  const handleQuickExit = () => {
    window.location.replace('https://www.google.com');
  };

  // === WYCIĄGANIE DANYCH Z SERWERA Z FALLBACKAMI ===
  
  // ID sprawy - najpierw z serwera, potem z propsa, na końcu hardcode
  const displayCaseId = serverData?.case_id || caseId || 'DP-DEMO-01';
  
  // Klucz - z propsa (bo to co wpisał użytkownik) lub z serwera
  
  // Szpital
  const hospital = serverData?.hospital || 'Szpital Demo';
  
  // Daty - formatowanie z ISO na czytelny polski format
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('pl-PL', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };
  
  const createdAt = formatDate(serverData?.created_at) || '1 lis 2026';
  const expiresAt = formatDate(serverData?.expires_at) || '3 lis 2028';
  
  // Próbki - pusta tablica, jeśli serwer nic nie zwróci
  const samples = Array.isArray(serverData?.samples) ? serverData.samples : [];

  return (
    <div className="layout-container-sub">
      <div className="main-content">
        <header className="header-section">
          <div onClick={onHome} style={{ cursor: 'pointer', display: 'inline-block' }}>
            <h1 className="logo">niezapominajka</h1>
          </div>
          
          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'white', opacity: 0.9, textAlign: 'right', lineHeight: '1.2' }}>
              Kliknij kwiatek,<br />aby przejść do bezpiecznej strony
            </span>
            <button 
              className="login-btn" 
              onClick={handleQuickExit}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              <img src={flowerIcon} alt="Wyjście" style={{ width: '32px', height: '32px', filter: 'brightness(0) invert(1)' }} />
            </button>
          </div>
        </header>

        <main className="dashboard-main">
          
          {/* GŁÓWNY BOX Z INFORMACJAMI */}
          <div className="dashboard-info-box">
            <h2 className="dashboard-title">Twoje próbki są bezpiecznie przechowywane.</h2>
            
            <div className="dashboard-details">
              <p>Sprawa {displayCaseId} · {hospital}</p>
              <p>Przechowywane od {createdAt} do {expiresAt}</p>
            </div>

            <div className="dashboard-samples">
              <p className="samples-title">PRÓBKI</p>
              {samples.length > 0 ? (
                samples.map((sample, index) => (
                  <p key={index}>{sample.type}: {sample.status}</p>
                ))
              ) : (
                <p className="samples-empty">Brak próbek do wyświetlenia</p>
              )}
            </div>

            
          </div>

          {/* SEKCJA AKCJI */}
          <div className="dashboard-actions-section">
            <h3 className="actions-heading">CO CHCESZ ZROBIĆ?</h3>
            
            <div className="dashboard-buttons-row">
              <button className="dashboard-btn">
                Przekaż sprawę policji
              </button>
              
              <button className="dashboard-btn">
                Przedłuż<br />przechowywanie
              </button>
              
              <button className="dashboard-btn">
                Zamknij<br />sprawę
              </button>


            </div>
          </div>

        </main>

        {/* STOPKA Z LINKAMI */}
        <footer className="dashboard-footer">
          <span className="footer-link">Moja sprawa</span>
          <span className="footer-link">Moje informacje</span>
          <span className="footer-link">Pomoc</span>
        </footer>

      </div>
    </div>
  );
}