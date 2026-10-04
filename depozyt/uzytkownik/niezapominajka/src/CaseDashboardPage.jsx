import { useState } from 'react';
import flowerIcon from './assets/famicons_flower-sharp.svg';

export default function CaseDashboardPage({ caseId, caseKey, onHome, onLogout }) {
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
          
          <div className="merged-results-box" style={{ marginTop: '10px', textAlign: 'left' }}>
            <p><strong>ID Sprawy:</strong> {caseId || 'DP-6WEB-94XM'}</p>
            <p><strong>Klucz dostępu:</strong> {caseKey || '••••••••••••'}</p>
            <p><strong>Status sprawy:</strong> <span style={{ color: '#a3e635' }}>{status}</span></p>
            
            <hr style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '15px 0' }} />

            <p className="med-info-text">
              • Udaj się do najbliższego wyznaczonego SOR wraz z zabezpieczoną próbką.<br />
              • Pokaż kod sprawy personelowi medycznemu.<br />
              • Możesz w każdej chwili bezpiecznie wylogować się z tego panelu.
            </p>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="support-button rules-btn" onClick={onLogout} style={{ flex: 1 }}>
                Wyloguj / Powrót
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}