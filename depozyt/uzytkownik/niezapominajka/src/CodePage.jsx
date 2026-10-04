export default function CodePage({ onBack }) {
  return (
    <div className="layout-container">
      <div className="main-content">
        <header className="header-section">
          <h1 className="logo">niezapominajka</h1>
        </header>

        <main className="code-main">
          <div className="instructions-text">
            <p>Przetransportuj się do pobliskiego punktu opieki medycznej wraz z próbką moczu.</p>
            <br />
            <p>Na miejscu ukaż kod sprawy bądź kod QR personelowi medycznemu w celu łatwej identyfikacji sprawy</p>
            <p>Zapisz kod sprawy i kod QR aby móc zarządzać sprawą.</p>
          </div>

          <div className="code-box">
            <div className="code-content">
              <div className="text-code">
                KOD SPRAWY
              </div>
              <div className="qr-placeholder">
                KOD QR
              </div>
            </div>
            <button className="download-link">
              pobierz informacje
            </button>
          </div>

          <button className="btn-primary" onClick={onBack}>
            powrot
          </button>
        </main>
      </div>
    </div>
  );
}