import { useState } from 'react';
import flowerIcon from './assets/famicons_flower-sharp.svg';
import { api } from '../../../frontend/src/shared/api';

export default function CaseAccessPage({ onHome, onGoToRules, onSubmitCase }) {
  const [caseCode, setCaseCode] = useState('');
  const [caseKey, setCaseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleQuickExit = () => {
    window.location.replace('https://www.google.com');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await api.getCaseStatus(caseCode.trim(), caseKey.trim());
      
      console.log("Sukces logowania do sprawy:", response);
      
      if (onSubmitCase) {
        // Przekazujemy pełną odpowiedź serwera
        onSubmitCase(caseCode, caseKey, response);
      }
    } catch (err) {
      console.error("Błąd autoryzacji sprawy:", err);
      setErrorMessage('Nie udało się uzyskać dostępu. Sprawdź poprawność kodu sprawy oraz klucza.');
    } finally {
      setLoading(false);
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
                required
              />
            </div>

            <div className="input-group-row">
              <label>Klucz:</label>
              <input 
                type="password" 
                className="date-input" 
                value={caseKey}
                onChange={(e) => setCaseKey(e.target.value)}
                required
              />
            </div>

            {errorMessage && (
              <p style={{ color: '#ffd1d1', fontSize: '0.9rem', textAlign: 'center', margin: '5px 0' }}>
                {errorMessage}
              </p>
            )}

            <button type="submit" className="support-button rules-btn" disabled={loading}>
              {loading ? 'Sprawdzanie...' : 'Zatwierdź'}
            </button>
          </form>

          <button className="btn-text rules-back-btn" onClick={onGoToRules}>
            chce założyć sprawę
          </button>
        </main>
      </div>
    </div>
  );
}