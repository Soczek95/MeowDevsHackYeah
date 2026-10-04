import flowerIcon from './assets/famicons_flower-sharp.svg'; 

export default function RulesPage({ onAccept, onBack, onHome }) {

  const handleQuickExit = () => {
    window.location.replace('https://www.google.com');
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
            <span style={{ fontSize: '0.85rem', fontWeight: 400, opacity: 0.9, textAlign: 'right', lineHeight: '1.2' }}>
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

          <div className="rules-buttons-group">
            <button className="support-button rules-btn" onClick={onAccept}>
              ROZUMIEM
            </button>

            <button className="btn-text rules-back-btn" onClick={onBack}>
              Mam już sprawę
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}