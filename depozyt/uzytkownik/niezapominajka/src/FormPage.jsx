import { useState } from 'react';

export default function FormPage({ onBack, onCreate, onHome }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [timeElapsed, setTimeElapsed] = useState('');
  const [optionsText, setOptionsText] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isFuture, setIsFuture] = useState(false);

  // Funkcja szybkiego opuszczenia strony na bezpieczną witrynę
  const handleQuickExit = () => {
    window.location.replace('https://www.google.com');
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    setSelectedDate(val);

    if (!val) {
      setIsValid(false);
      setIsFuture(false);
      return;
    }

    const pastDate = new Date(val);
    const now = new Date();
    const diffMs = now - pastDate;

    // Sprawdzenie czy data jest z przyszłości
    if (diffMs < 0) {
      setIsFuture(true);
      setIsValid(false);
      setTimeElapsed("Czas z przyszłości");
      setOptionsText("Wpisana data i godzina jeszcze nie nadeszły. Wybierz poprawny moment z przeszłości.");
      return;
    }

    setIsFuture(false);
    setIsValid(true);

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 72) {
      setTimeElapsed(`${diffHours} godzin`);
      setOptionsText("Jesteś w oknie do 72 godzin. Możesz udać się do szpitala w celu zabezpieczenia śladów medycznych i ewentualnie zgłosić sprawę organom ścigania.");
    } else {
      setTimeElapsed(`${diffDays} dni`);
      setOptionsText("Od zdarzenia minęło ponad 72 godziny. Zabezpieczenie śladów biologicznych może być trudne, ale nadal masz prawo zgłosić sprawę i szukać wsparcia psychologicznego lub prawnego.");
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
            <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'white', opacity: 0.9, textAlign: 'right', lineHeight: '1.2' }}>
              Kliknij kwiatek,<br />aby przejść do bezpiecznej strony
            </span>

            <button 
              className="login-btn" 
              aria-label="Szybkie wyjście na bezpieczną stronę" 
              onClick={handleQuickExit}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512" fill="white">
                <path d="M256,0C170.8,0,102.4,68.4,102.4,153.6c0,25.6,6.4,49.6,17.6,70.4C48,243.2,0,305.6,0,377.6C0,454.4,61.6,516,138.4,516c72,0,134.4-48,153.6-120c20.8,11.2,44.8,17.6,70.4,17.6C443.6,413.6,512,345.2,512,260S443.6,106.4,358.4,106.4c-24,0-46.4,6.4-65.6,16C275.2,49.6,211.2,0,256,0z M256,358.4c-56.8,0-102.4-45.6-102.4-102.4s45.6-102.4,102.4-102.4s102.4,45.6,102.4,102.4S312.8,358.4,256,358.4z"/>
                <circle cx="256" cy="256" r="51.2" fill="#6d84fb"/>
              </svg>
            </button>
          </div>
        </header>

        <main className="form-main">
          <h2>Określ kiedy był ostatni moment, który pamiętasz?</h2>
          
          {/* Standardowy HTML input typu datetime-local */}
          <input 
            type="datetime-local" 
            className="date-input"
            value={selectedDate}
            onChange={handleDateChange}
            max={new Date().toISOString().slice(0, 16)} // Blokuje wybór przyszłości w niektórych przeglądarkach
          />

          {/* Komunikat o błędzie, jeśli wybrano datę z przyszłości */}
          {isFuture && (
            <div className="dynamic-result" style={{ color: '#ffcccc' }}>
              <p><strong>{timeElapsed}</strong></p>
              <p>{optionsText}</p>
            </div>
          )}

          {/* Wyniki i przycisk dalej pokazują się tylko, gdy data jest poprawna i z przeszłości */}
          {isValid && !isFuture && (
            <div className="dynamic-result">
              <div className="result-box">
                <p>Minęło: <strong>{timeElapsed}</strong></p>
                <p>Oznacza to, że Twoimi opcjami są:</p>
                <p>{optionsText}</p>
              </div>
              
              <button className="support-button rules-btn" onClick={onCreate}>
                UTWÓRZ SPRAWĘ
              </button>
            </div>
          )}

          <button className="btn-text rules-back-btn" onClick={onBack}>
            powrót
          </button>
        </main>
      </div>
    </div>
  );
}