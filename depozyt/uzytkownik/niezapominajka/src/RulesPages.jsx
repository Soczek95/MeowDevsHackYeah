export default function RulesPage({ onAccept, onBack, onHome }) {

  // Funkcja szybkiego opuszczenia strony pod ikonką kwiatka
  const handleQuickExit = () => {
    window.location.replace('https://www.google.com');
  };

  return (
    <div className="layout-container-sub">
      <div className="main-content">
        <header className="header-section">
          
          {/* Nazwa "niezapominajka" wraca do strony głównej */}
          <div 
            onClick={onHome} 
            style={{ cursor: 'pointer', display: 'inline-block' }}
            title="Przejdź do strony głównej"
          >
            <h1 className="logo">niezapominajka</h1>
          </div>
          
          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Tekst informacyjny obok kwiatka */}
            <span style={{ fontSize: '0.85rem', fontWeight: 400, opacity: 0.9, textAlign: 'right', lineHeight: '1.2' }}>
              Kliknij kwiatek,<br />aby przejść do bezpiecznej strony
            </span>

            {/* Przycisk z ikoną kwiatka */}
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

        <main className="rules-content-custom">
          <h2>Ważna informacja o poufności</h2>
          <p className="rules-intro">
            Zależy nam na Twoim poczuciu bezpieczeństwa i prywatności. W większości przypadków to Ty decydujesz, czy i kiedy zgłosić sprawę organom ścigania. Musisz jednak wiedzieć, że polskie prawo przewiduje sytuacje, w których personel medyczny ma bezwzględny obowiązek powiadomić policję.
          </p>
          
          <p className="rules-exceptions-title">Nie możemy zagwarantować dyskrecji i zatrzymać sprawy dla siebie, jeśli:</p>
          <ul className="rules-list">
            <li>- w chwili zdarzenia osoba pokrzywdzona miała mniej niż 15 lat,</li>
            <li>- sprawców zdarzenia było kilku,</li>
            <li>- odniesione obrażenia stanowią poważne zagrożenie dla Twojego życia lub zdrowia.</li>
          </ul>

          <p className="rules-text-secondary">
            W takich sytuacjach procedury prawne zostaną uruchomione automatycznie. Personel medyczny zawsze otwarcie Cię o tym poinformuje przed podjęciem jakichkolwiek działań.
          </p>

          <p className="rules-text-minor">
            Masz mniej niż 18 lat?<br />
            Nawet jeśli nie wiesz, co teraz zrobić, nie musisz przez to przechodzić w pojedynkę. Zadzwoń pod bezpłatny i całodobowy Telefon Zaufania dla Dzieci i Młodzieży: 116 111. Czekają tam specjaliści, którzy anonimowo podpowiedzą Ci, jakie masz opcje i jak zadbać o swoje bezpieczeństwo.
          </p>

          <button className="support-button rules-btn" onClick={onAccept}>
            ROZUMIEM
          </button>

          <button className="btn-text rules-back-btn" onClick={onBack}>
            mam już sprawę
          </button>
        </main>
      </div>
    </div>
  );
}