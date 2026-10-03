import { useState } from 'react';
import flowerIcon from './assets/famicons_flower-sharp.svg';

export default function CaseAccessPage({ onHome, onGoToRules, onSubmitCase }) {
  const [caseCode, setCaseCode] = useState('');
  const [caseKey, setCaseKey] = useState('');

  // Funkcja szybkiego opuszczenia strony (dla ikony kwiatka)
  const handleQuickExit = () => {
    window.location.replace('https://www.google.com');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Tutaj możesz obsłużyć logikę zatwierdzania i logowania do sprawy
    if (onSubmitCase) onSubmitCase(caseCode, caseKey);
  };

  return (
    <div className="layout-container-sub">
      <div className="main-content">
        <header className="header-section">
          {/* Napis "niezapominajka" prowadzi do main */}
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

            {/* Ikona kwiatka prowadzi do bezpiecznej strony */}
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

        <main className="case-access-main">
          <h2>DOSTĘP DO SPRAWY</h2>

          <form onSubmit={handleSubmit} className="case-access-form">
            <div className="input-group-row">
              <label>Kod sprawy:</label>
              <input 
                type="text" 
                className="date-input" 
                value={caseCode}
                onChange={(e) => setCaseCode(e.target.value)}
              />
            </div>

            <div className="input-group-row">
              <label>Klucz:</label>
              <input 
                type="password" 
                className="date-input" 
                value={caseKey}
                onChange={(e) => setCaseKey(e.target.value)}
              />
            </div>

            <button type="submit" className="support-button rules-btn">
              Zatwierdź
            </button>
          </form>

          {/* Przycisk prowadzący z powrotem do zasad (rules) */}
          <button className="btn-text rules-back-btn" onClick={onGoToRules}>
            chce założyć sprawę
          </button>
        </main>
      </div>
    </div>
  );
}