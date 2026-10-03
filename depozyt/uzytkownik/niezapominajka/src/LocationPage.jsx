import { useState } from 'react';

export default function LocationPage({ onShowCode }) {
  const [location, setLocation] = useState('');

  return (
    <div className="layout-container-sub">
      <div className="main-content">
        <header className="header-section">
          <h1 className="logo">niezapominajka</h1>
        </header>

        <main className="location-main">
          <h2>Podaj swoją lokalizację w celu ukazania najbliższego szpitala</h2>
          
          <input 
            type="text" 
            className="location-input"
            placeholder="lokalizacja"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          {/* Wyniki pojawiają się warunkowo po wpisaniu lokalizacji */}
          {location.length > 0 && (
            <div className="results-container">
              <div className="info-box">
                <p>Twój najbliższy punkt opieki medycznej to:</p>
                <p>Adres:</p>
              </div>

              <div className="info-box">
                <p>Oto jak poprawnie zabezpieczyć próbkę moczu:</p>
                <p>blah</p>
              </div>

              <div className="info-box">
                <p>Pamiętaj aby zabezpieczyć ubrania itp.</p>
              </div>

              <button className="btn-primary" onClick={onShowCode}>
                POKAZ KOD
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}