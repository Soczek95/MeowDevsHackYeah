import { useState } from 'react';

export default function FormPage({ onBack, onCreate }) {
  const [inputValue, setInputValue] = useState('');
  const [timeElapsed, setTimeElapsed] = useState('');
  const [optionsText, setOptionsText] = useState('');
  const [isValidDate, setIsValidDate] = useState(false);

  const handleDateChange = (e) => {
    let val = e.target.value;
    
    // Maska: wyciągamy same cyfry i układamy je w pożądany format
    const raw = val.replace(/\D/g, ''); 
    let formatted = raw;

    if (raw.length > 2) formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    if (raw.length > 4) formatted = `${formatted.slice(0, 5)}/${raw.slice(4)}`;
    if (raw.length > 8) formatted = `${formatted.slice(0, 10)} ${raw.slice(8)}`;
    if (raw.length > 10) formatted = `${formatted.slice(0, 13)}:${raw.slice(10)}`;
    
    // Ucinamy przy maksymalnej długości (DD/MM/RRRR HH:MM)
    formatted = formatted.slice(0, 16); 
    setInputValue(formatted);

    // Jeśli użytkownik wpisał kompletne 12 cyfr, robimy obliczenia
    if (raw.length === 12) {
      const day = parseInt(raw.slice(0, 2), 10);
      const month = parseInt(raw.slice(2, 4), 10);
      const year = parseInt(raw.slice(4, 8), 10);
      const hour = parseInt(raw.slice(8, 10), 10);
      const minute = parseInt(raw.slice(10, 12), 10);

      // Prosta walidacja czy data w ogóle istnieje (np. czy miesiąc to nie 13)
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        const pastDate = new Date(year, month - 1, day, hour, minute);
        const now = new Date();
        const diffMs = now - pastDate;

        if (diffMs < 0) {
          setIsValidDate(true);
          setTimeElapsed("Czas z przyszłości");
          setOptionsText("Wpisana godzina jeszcze nie nadeszła. Wpisz poprawną datę z przeszłości.");
          return;
        }

        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        setIsValidDate(true);
        if (diffHours < 72) {
          setTimeElapsed(`${diffHours} godzin`);
          setOptionsText("Jesteś w oknie do 72 godzin. Możesz udać się do szpitala w celu zabezpieczenia śladów medycznych i ewentualnie zgłosić sprawę organom ścigania.");
        } else {
          setTimeElapsed(`${diffDays} dni`);
          setOptionsText("Od zdarzenia minęło ponad 72 godziny. Zabezpieczenie śladów biologicznych może być trudne, ale nadal masz prawo zgłosić sprawę i szukać wsparcia psychologicznego lub prawnego.");
        }
      } else {
        setIsValidDate(false);
      }
    } else {
      setIsValidDate(false);
    }
  };

  return (
    <div className="layout-container">
      <div className="main-content">
        <header className="header-section">
          <h1 className="logo">niezapominajka</h1>
        </header>

        <main className="form-main">
          <h2>Określ kiedy był ostatni moment, który pamiętasz?</h2>
          
          {/* Jedno, normalne pole tekstowe z maską */}
          <input 
            type="text" 
            className="date-input"
            placeholder="DD/MM/RRRR GG:MM"
            value={inputValue}
            onChange={handleDateChange}
          />

          {isValidDate && (
            <div className="dynamic-result">
              <div className="result-box">
                <p>Mineło: <strong>{timeElapsed}</strong> czasu</p>
                <p>Oznacza to, że twoimi opcjami są:</p>
                <p>{optionsText}</p>
              </div>
              
              <button className="btn-primary" onClick={onCreate}>
                UTWÓRZ SPRAWĘ
              </button>
            </div>
          )}

          <button className="btn-text" onClick={onBack}>
            powrót
          </button>
        </main>
      </div>
    </div>
  );
}