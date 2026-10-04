import { useState } from 'react';
import flowerIcon from './assets/famicons_flower-sharp.svg'; 

// ==========================================
// DANE MEDYCZNE I DOWODOWE (Z JSON)
// ==========================================
const EVIDENCE_DATA = {
  intro: "Nie musisz robić wszystkiego naraz. Poniżej znajdziesz wskazówki, co możesz zrobić teraz, aby zadbać o swoje zdrowie i zabezpieczyć dowody – na wypadek, gdybyś kiedyś chciała/chciał z nich skorzystać.",
  disclaimer: "To są ogólne wskazówki, a nie porada medyczna. Na miejscu lekarz spokojnie oceni sytuację i wyjaśni, jakie badania mają największy sens.",
  buckets: [
    { id: "0-12h", fromHours: 0, toHours: 12, lead: "Jesteś w optymalnym czasie. Teraz da się zabezpieczyć najwięcej śladów medycznych, a personel krok po kroku przeprowadzi Cię przez procedury." },
    { id: "12-72h", fromHours: 12, toHours: 72, lead: "Masz jeszcze czas. Wciąż można bardzo dużo zrobić dla Twojego zdrowia i zachowania dowodów. Zrób tyle, na ile masz dziś siłę." },
    { id: "3-7d", fromHours: 72, toHours: 168, lead: "Minęło już trochę czasu i to jest całkowicie w porządku. Część śladów nadal można zabezpieczyć, a lekarz pomoże ocenić, jakie kroki podjąć." },
    { id: "7d+", fromHours: 168, toHours: null, lead: "Nawet jeśli minęło więcej czasu, masz prawo do pomocy. Badanie pod kątem dowodów może być trudniejsze, ale priorytetem jest teraz Twoje zdrowie i wsparcie psychologiczne." }
  ],
  items: [
    {
      id: "URINE", category: "evidence", label: "Mocz", bestWithinHours: 12, possibleWithinHours: 336,
      now: "Jeśli podejrzewasz, że podano Ci substancje odurzające, próbka moczu jest kluczowa. Ślady niektórych z nich znikają już po 12 godzinach, dlatego warto zebrać ją jak najszybciej. (Jeśli musisz skorzystać z toalety przed wizytą w szpitalu, oddaj mocz do czystego wyparzonego słoika, wstaw do lodówki i zabierz ze sobą).",
      later: "Próbka moczu wciąż ma ogromne znaczenie. Wybrane substancje da się w niej wykryć nawet do 14 dni po zdarzeniu.",
      after: "Na tym etapie ślady substancji w moczu zwykle już zanikają. Lekarz podpowie, czy badanie toksykologiczne ma jeszcze uzasadnienie."
    },
    {
      id: "BLOOD", category: "evidence", label: "Krew", bestWithinHours: 8, possibleWithinHours: null,
      now: "Badanie krwi wykonane w pierwszych godzinach wykazuje najwięcej. Substancje takie jak tzw. pigułka gwałtu (GHB) mogą zniknąć z krwiobiegu już po 8 godzinach.",
      later: "Z upływem czasu ważniejsza staje się próbka moczu. Lekarz oceni, czy pobranie krwi w celach dowodowych jeszcze coś wykaże.",
      after: null
    },
    {
      id: "SWAB", category: "evidence", label: "Ślady biologiczne (DNA)", bestWithinHours: 72, possibleWithinHours: 168,
      now: "Obce DNA (naskórek, nasienie, ślina) najlepiej zabezpieczyć w ciągu pierwszych 72 godzin. Pamiętaj: podczas badania możesz mieć przy sobie zaufaną osobę, a lekarz ma obowiązek wyjaśniać Ci każdy krok.",
      later: "Nawet po upływie 72 godzin nadal warto zabezpieczyć ślady. W wielu przypadkach udaje się wyizolować DNA znacznie później.",
      after: "Niezależnie od upływu czasu, opieka medyczna należy Ci się zawsze. Zapytaj lekarza o opcje – to on oceni sens kryminalistycznego badania."
    },
    {
      id: "CLOTHES", category: "evidence", label: "Ubrania", bestWithinHours: null, possibleWithinHours: null,
      now: "Nie pierz ubrań ani bielizny z tamtego dnia. Zapakuj je do czystej, papierowej torby lub zawiń w papier. Unikaj plastikowych reklamówek – wilgoć niszczy ślady DNA.",
      later: null, after: null
    },
    {
      id: "PEP", category: "health", label: "Profilaktyka zakażeń (m.in. HIV)", bestWithinHours: 24, possibleWithinHours: 72,
      now: "W szpitalu zapytaj o profilaktykę poekspozycyjną (leki chroniące np. przed HIV). Są najskuteczniejsze, gdy przyjmie się je jak najszybciej.",
      later: "Leki chroniące przed wirusem HIV można wdrożyć maksymalnie do 72 godzin od zdarzenia. Koniecznie poinformuj o tym personel medyczny.",
      after: "Czas na przyjęcie leków profilaktycznych minął, ale wciąż możesz wykonać badania kontrolne i omówić z lekarzem dalszą diagnostykę."
    },
    {
      id: "CARE", category: "health", label: "Pomoc psychologiczna", bestWithinHours: null, possibleWithinHours: null,
      now: "Pomoc medyczna i psychologiczna należy Ci się na każdym etapie. Nie musisz przez to przechodzić sama/sam.",
      later: null, after: null
    }
  ],
  beforeExam: {
    title: "Zanim wyruszysz do szpitala",
    intro: "To są tylko wskazówki, a nie bezwzględne obowiązki. Zrób to, na co masz siłę.",
    items: [
      "Jeśli dasz radę: powstrzymaj się od prysznica, mycia zębów i czesania włosów.",
      "Ubrania i bieliznę z tamtego dnia zabierz nieuprane, spakowane w papierową torbę.",
      "Jeśli musisz skorzystać z toalety, oddaj mocz do czystego pojemnika i wstaw do lodówki.",
      "Możesz poprosić zaufaną osobę, aby pojechała tam z Tobą."
    ],
    reassurance: "Jeśli zdążyłaś/zdążyłeś się już umyć lub przebrać – to absolutnie normalne. Mimo to nadal warto zgłosić się do szpitala. Decyzja należy do Ciebie."
  }
};

export default function FormPage({ onBack, onCreate, onHome }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [timeElapsed, setTimeElapsed] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isFuture, setIsFuture] = useState(false);
  
  // Przechowuje dopasowane dane na podstawie upłyniętego czasu
  const [adviceResult, setAdviceResult] = useState(null);

  const handleQuickExit = () => {
    window.location.replace('https://www.google.com');
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    setSelectedDate(val);

    if (!val) {
      setIsValid(false);
      setIsFuture(false);
      setAdviceResult(null);
      return;
    }

    const pastDate = new Date(val);
    const now = new Date();
    const diffMs = now - pastDate;

    if (diffMs < 0) {
      setIsFuture(true);
      setIsValid(false);
      setTimeElapsed("Czas z przyszłości");
      setAdviceResult(null);
      return;
    }

    setIsFuture(false);
    setIsValid(true);

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    // Formatowanie wyświetlania czasu
    if (diffHours < 48) {
      setTimeElapsed(`${diffHours} godz.`);
    } else {
      const diffDays = Math.floor(diffHours / 24);
      setTimeElapsed(`${diffDays} dni`);
    }

    // 1. Znalezienie odpowiedniego koszyka czasu (wiadomość wstępna)
    const bucket = EVIDENCE_DATA.buckets.find(b => 
      diffHours >= b.fromHours && (b.toHours === null || diffHours < b.toHours)
    );

    // 2. Przeliczenie statusu (now / later / after) dla każdego elementu
    const evaluatedItems = EVIDENCE_DATA.items.map(item => {
      let state = 'now'; // domyślnie 'now' (dla np. opcji bez limitu)
      
      if (item.bestWithinHours !== null && diffHours >= item.bestWithinHours) {
        state = 'later';
      }
      if (item.possibleWithinHours !== null && diffHours >= item.possibleWithinHours) {
        state = 'after';
      }

      return {
        label: item.label,
        text: item[state]
      };
    }).filter(item => item.text !== null); // usuwamy te, które mają wartość null dla danego etapu

    // 3. Zapis do stanu
    setAdviceResult({
      lead: bucket ? bucket.lead : '',
      items: evaluatedItems
    });
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

        <main className="form-page-box" style={{ maxWidth: '800px' }}>
          <h2 className="form-page-title">Określ, kiedy był ostatni moment, który pamiętasz?</h2>
          
          <input 
            type="datetime-local" 
            className="date-input form-date-input"
            value={selectedDate}
            onChange={handleDateChange}
            max={new Date().toISOString().slice(0, 16)}
          />

          {isFuture && (
            <div className="form-result-text form-result-error" style={{ textAlign: 'center' }}>
              <p><strong>{timeElapsed}</strong></p>
              <p>Wpisana data i godzina jeszcze nie nadeszły. Wybierz poprawny moment z przeszłości.</p>
            </div>
          )}

          {isValid && !isFuture && adviceResult && (
            <div className="merged-results-box" style={{ marginTop: '20px', textAlign: 'left', background: 'rgba(255, 255, 255, 0.9)', padding: '25px', borderRadius: '15px' }}>
              <p className="med-info-text-highlight" style={{ marginBottom: '15px', color: '#1a1a1a' }}>
                Upłynęło: <strong>{timeElapsed}</strong><br /><br />
                {adviceResult.lead}
              </p>

              <div className="med-steps-container" style={{ marginTop: '25px' }}>
                {adviceResult.items.map((item, idx) => (
                  <div className="med-step-group" key={idx} style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: '#4967fb', marginBottom: '8px', fontSize: '1.05rem' }}>{item.label}</h4>
                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5', color: '#333' }}>{item.text}</p>
                  </div>
                ))}
              </div>

              <div style={{ background: 'rgba(109, 132, 251, 0.1)', padding: '20px', borderRadius: '10px', marginTop: '30px' }}>
                <h3 className="med-steps-title" style={{ marginTop: '0' }}>{EVIDENCE_DATA.beforeExam.title}</h3>
                <p className="med-steps-intro" style={{ marginBottom: '15px' }}>{EVIDENCE_DATA.beforeExam.intro}</p>
                <ul style={{ paddingLeft: '20px', marginBottom: '15px', fontSize: '0.95rem', lineHeight: '1.5', color: '#333' }}>
                  {EVIDENCE_DATA.beforeExam.items.map((it, idx) => (
                    <li key={idx} style={{ marginBottom: '8px' }}>{it}</li>
                  ))}
                </ul>
                <p className="warning-text" style={{ margin: '0', fontSize: '0.9rem' }}>
                  {EVIDENCE_DATA.beforeExam.reassurance}
                </p>
              </div>
            </div>
          )}

          <div className="form-buttons-group" style={{ marginTop: '30px' }}>
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
              Powrót
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}