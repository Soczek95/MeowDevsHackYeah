export default function RulesPage({ onAccept, onBack }) {
  return (
    <div className="layout-container">
      <div className="main-content">
        <header className="header-section">
          <h1 className="logo">niezapominajka</h1>
        </header>

        <main className="rules-content">
          <div className="rules-text">
            <h3>Zasady dt. przesyłania</h3>
            <p>m dolor sit amet, consectetur adipiscing elit. Phasellus efficitur mi vitae augue posuere, id ornare sem tincidunt.</p>
            <p>→ Sed efficitur pellentesque risus et interdum. Vestibulum tristique sodales turpis. Suspendisse a sagittis diam.</p>
            <p>→ Vivamus efficitur, metus non hendrerit vestibulum, leo nibh interdum turpis, in aliquam elit arcu non sapien.</p>
          </div>

          <div className="rules-buttons">
            <button className="btn-primary" onClick={onAccept}>ZGADZAM SIĘ</button>
            <button className="btn-secondary" onClick={onBack}>powrot</button>
          </div>

          <div className="status-link">
            <a href="#status">chcę sprawdzić status mojej sprawy</a>
          </div>
        </main>
      </div>
    </div>
  );
}