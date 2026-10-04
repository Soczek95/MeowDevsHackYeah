import { useState } from 'react';
import flowerIcon from './assets/famicons_flower-sharp.svg'; 

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

        <main className="form-main">
          <h2>Określ kiedy był ostatni moment, który pamiętasz?</h2>
          
          <input 
            type="datetime-local" 
            className="date-input"
            value={selectedDate}
            onChange={handleDateChange}
            max={new Date().toISOString().slice(0, 16)}
          />

          {isFuture && (
            <div className="form-result-text" style={{ color: '#ffd1d1' }}>
              <p><strong>{timeElapsed}</strong></p>
              <p>{optionsText}</p>
            </div>
          )}

          {isValid && !isFuture && (
            <div className="form-result-text">
              <p>Minęło: <strong>{timeElapsed}</strong></p>
              <p>Oznacza to, że Twoimi opcjami są:</p>
              <p>{optionsText}</p>
            </div>
          )}

          <div className="form-buttons-group">
            {isValid && !isFuture && (
              <button 
                className="support-button rules-btn" 
                onClick={async () => {
                  if (typeof onCreate === 'function') {
                    await onCreate();
                  }
                }}
>
  UTWÓRZ SPRAWĘ
</button>
            )}

            <button className="btn-text rules-back-btn" onClick={onBack}>
              powrót
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}