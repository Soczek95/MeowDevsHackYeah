import { useState } from 'react';
import flowerIcon from './assets/famicons_flower-sharp.svg';

export default function CaseDashboardPage({ caseId, caseKey, onHome, onLogout }) {
  // Stan statusu - w przyszłości można go pobierać z API
  const [status] = useState('Aktywna (Oczekuje na wizytę w SOR)');

  const handleQuickExit = () => {
    window.location.replace('https://www.google.com');
  };

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

        <main className="merged-flow-main">
          <h2>Panel Zarządzania Sprawą</h2>
          
          {/* NOWA KARTA */}
          <div className="case-dashboard-card">
            
            {/* Sekcja 1: Status i ID */}
            <div className="card-header-section">
              <div className="status-badge">
                <span className="status-dot"></span>
                {status}
              </div>
              <div className="case-id-display">
                ID: <span>{caseId || 'DP-6WEB-94XM'}</span>
              </div>
            </div>

            {/* Sekcja 2: Klucz dostępu */}
            <div className="card-key-section">
              <label>Klucz dostępu do sprawy</label>
              <div className="key-value">
                {caseKey || '••••••••••••'}
              </div>
            </div>

            {/* Sekcja 3: Instrukcje */}
            <div className="card-instructions-section">
              <h3>Co dalej?</h3>
              <ul className="instructions-list">
                <li>
                  <span>Udaj się do najbliższego wyznaczonego SOR wraz z zabezpieczoną próbką.</span>
                </li>
                <li>
                  <span>Pokaż kod sprawy personelowi medycznemu.</span>
                </li>
                <li>

                  <span>Możesz w każdej chwili bezpiecznie wylogować się z tego panelu.</span>
                </li>
              </ul>
            </div>

            {/* Sekcja 4: Akcje */}
            <div className="card-actions-section">
              <button className="support-button rules-btn" onClick={onLogout}>
                Wyloguj / Powrót
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}