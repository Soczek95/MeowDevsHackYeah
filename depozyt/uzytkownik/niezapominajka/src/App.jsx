import './App.css';

export default function MainPage() {
  return (
    <div className="layout-container">

      <div className="main-content">
        <header className="header-section">
          <h1 className="logo">niezapominajka</h1>
          
          {/* Kontener grupujący menu i przycisk logowania po prawej stronie */}
          <div className="header-right">
            <nav className="nav-menu">
              <ul>
                <li><a href="#o-nas">o nas</a></li>
                <li><a href="#uzyskaj-pomoc">uzyskaj pomoc</a></li>
                <li><a href="#kontakt">kontakt</a></li>
                <li><a href="#co-robimy">co robimy</a></li>
              </ul>
            </nav>
            
            {/* Przycisk logowania z ikoną SVG wbudowaną w kod */}
            <button className="login-btn" aria-label="Logowanie">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
          </div>
        </header>

        <main>
          <section className="hero-section">
            <h2>ANONIMOWA STRONA DO ZGŁASZANIA INCYDENTÓW</h2>
            <button type="button" className="action-button">PRZEJDŹ DO FORMULARZA</button>
            <p>
              <small>Jeżeli masz mniej niż 18 lat to zgłoś się do blah blah</small>
            </p>
          </section>

          <section>
            <h2>NIE jesteś sam/a są miejsca do których można się zwrócić:</h2>
            <ul>
              <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}