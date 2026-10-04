import { useState } from 'react';
import flowerIcon from './assets/famicons_flower-sharp.svg';
import { api } from '../../../frontend/src/shared/api';

// Nazwy decyzji i statusów MUSZĄ być identyczne jak w backendzie (app/cases.py)
const DECISION_EXTEND = 'EXTEND';
const DECISION_CLOSE = 'REQUEST_CLOSURE';
const FINAL_STATUSES = ['CLOSED', 'RELEASED', 'ZAMKNIETA', 'WYDANA'];

// Tłumaczenia wartości z bazy na polski
const SAMPLE_TYPES = { 
  URINE: 'Mocz', SWAB: 'Wymaz', BLOOD: 'Krew',
  MOCZ: 'Mocz', WYMAZ: 'Wymaz', KREW: 'Krew' 
};

const SAMPLE_STATES = { 
  COLLECTED: 'pobrana', SEALED: 'zabezpieczona', STORED: 'w depozycie',
  ZMAGAZYNOWANA: 'w depozycie', ZAPLOMBOWANA: 'zabezpieczona (zaplombowana)', POBRANA: 'pobrana'
};

const TITLES = {
  CREATED: 'Sprawa utworzona. Udaj się do szpitala, aby zabezpieczyć próbki.',
  ADMITTED: 'Szpital przyjął Twoją sprawę.',
  IN_DEPOSIT: 'Twoje próbki są bezpiecznie przechowywane.',
  RELEASED: 'Twoja sprawa została przekazana policji.',
  CLOSED: 'Twoja sprawa została zamknięta.',
  W_DEPOZYCIE: 'Twoje próbki są bezpiecznie przechowywane.',
};

export default function CaseDashboardPage({ caseId, caseKey, serverData, onHome }) {
  // Lokalna kopia danych, żeby po decyzji od razu pokazać nowy status / datę
  const [data, setData] = useState(serverData);
  const [pending, setPending] = useState(null); // nazwa decyzji w trakcie wysyłania
  const [message, setMessage] = useState(null); // { type: 'ok' | 'error', text }

  const handleQuickExit = () => {
    window.location.replace('https://www.google.com');
  };

  // === DANE Z SERWERA Z FALLBACKAMI ===
  const displayCaseId = data?.case_id || caseId || 'DP-DEMO-01';
  // Obecny backend nie zwraca szpitala w /status – pokazujemy go tylko, jeśli jest
  const hospital = data?.hospital || (data?.status === 'CREATED' ? 'oczekuje na przyjęcie w szpitalu' : null);
  const status = data?.status;
  const isFinal = FINAL_STATUSES.includes(status);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    // Baza trzyma daty w dwóch formatach: '2027-09-03T14:00:00Z' i '2027-09-03 14:00:00' (UTC)
    const iso = dateString.includes('T') ? dateString : `${dateString.replace(' ', 'T')}Z`;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const createdAt = formatDate(data?.created_at) || '1 lis 2026';
  const expiresAt = formatDate(data?.expires_at) || '3 lis 2028';
  const samples = Array.isArray(data?.samples) ? data.samples : [];

  // === WYSYŁANIE DECYZJI ===
  const handleDecision = async (decision, confirmText, getSuccessText) => {
    if (!caseKey) {
      setMessage({ type: 'error', text: 'Brak klucza sprawy. Zaloguj się ponownie.' });
      return;
    }
    if (!window.confirm(confirmText)) return;

    setPending(decision);
    setMessage(null);

    try {
      await api.makeDecision(caseId, caseKey, decision);

      // Odświeżamy dane sprawy, żeby widok pokazał aktualny stan
      let fresh = null;
      try {
        fresh = await api.getCaseStatus(caseId, caseKey);
        setData(fresh);
      } catch {
        // Decyzja przeszła – nieudane odświeżenie nie jest krytyczne
      }

      setMessage({ type: 'ok', text: getSuccessText(fresh) });
    } catch (err) {
      const raw = err?.message || '';
      // Obecny backend odpowiada 400 na decyzje, których jeszcze nie obsługuje (EXTEND, CLOSE)
      const text = raw.includes('400')
        ? 'Ta opcja nie jest jeszcze dostępna. Spróbuj ponownie później.'
        : raw || 'Nie udało się wykonać operacji. Spróbuj ponownie.';
      setMessage({ type: 'error', text });
    } finally {
      setPending(null);
    }
  };

  const handleExtend = () =>
    handleDecision(
      DECISION_EXTEND,
      'Czy chcesz przedłużyć przechowywanie próbek?',
      (fresh) => {
        const newDate = formatDate(fresh?.expires_at);
        return newDate
          ? `Przechowywanie zostało przedłużone do ${newDate}.`
          : 'Przechowywanie zostało przedłużone.';
      }
    );

  const handleClose = () =>
    handleDecision(
      DECISION_CLOSE,
      'Zamknięcie sprawy jest nieodwracalne. Czy na pewno chcesz zamknąć sprawę?',
      () => 'Sprawa została zamknięta.'
    );

  const buttonsDisabled = pending !== null || isFinal;
  const disabledStyle = buttonsDisabled ? { opacity: 0.55, cursor: 'not-allowed', transform: 'none' } : undefined;

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
            <h2 className="dashboard-title">
              {TITLES[status] || TITLES.IN_DEPOSIT}
            </h2>

            <div className="dashboard-details">
              <p>Sprawa {displayCaseId}{hospital ? ` · ${hospital}` : ''}</p>
              <p>Przechowywane od {createdAt} do {expiresAt}</p>
            </div>

            <div className="dashboard-samples">
              <p className="samples-title">PRÓBKI</p>
              {samples.length > 0 ? (
                samples.map((sample, index) => (
                  <p key={index}>
                    {SAMPLE_TYPES[sample.type] || sample.type}: {SAMPLE_STATES[sample.state] || sample.state}
                  </p>
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
              <button className="dashboard-btn" disabled={buttonsDisabled} style={disabledStyle}>
                Przekaż sprawę policji
              </button>

              <button
                className="dashboard-btn"
                onClick={handleExtend}
                disabled={buttonsDisabled}
                style={disabledStyle}
              >
                {pending === DECISION_EXTEND ? 'Przedłużanie...' : <>Przedłuż<br />przechowywanie</>}
              </button>

              <button
                className="dashboard-btn"
                onClick={handleClose}
                disabled={buttonsDisabled}
                style={disabledStyle}
              >
                {pending === DECISION_CLOSE ? 'Zamykanie...' : <>Zamknij<br />sprawę</>}
              </button>
            </div>

            {message && (
              <p
                role="status"
                style={{
                  marginTop: '18px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  display: 'inline-block',
                  color: '#fff',
                  background: message.type === 'ok' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(220, 38, 38, 0.45)',
                }}
              >
                {message.text}
              </p>
            )}
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