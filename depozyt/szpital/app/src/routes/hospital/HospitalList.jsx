import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import content from "../../shared/content/staff.json";

export function HospitalList() {
  const navigate = useNavigate();
  const [staffId, setStaffId] = useState("ST-A41"); // Domyślny personel
  const [caseInput, setCaseInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Przykładowe lokalne dane (mocki do widoków placeholderowych)
  const [todos] = useState([
    { sample_id: "S-0195", type: "URINE", case_id: "DP-7K2M-4Q", state: "COLLECTED", updated_at: new Date(Date.now() - 25 * 60000).toISOString() },
    { sample_id: "S-0196", type: "BLOOD", case_id: "DP-7K2M-4Q", state: "SEALED", updated_at: new Date(Date.now() - 65 * 60000).toISOString() }, // Ponad 60 min (pomarańczowy)
  ]);

  const handleOpenCase = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = caseInput.trim().toUpperCase();
    const regex = /^DP-[A-Z0-9]{4}-[A-Z0-9]{2}$/;

    if (!regex.test(cleaned)) {
      setErrorMessage(content.error_case_not_found);
      return;
    }

    setErrorMessage(null);
    // Sprawdzamy stan sprawy (tutaj uproszczenie placeholderowe: jeśli DP-DEMO-01 lub inne, kierujemy dalej)
    if (cleaned === "DP-DEMO-01" || cleaned === "DP-7K2M-4Q") {
      navigate(`/szpital/sprawa/${cleaned}`);
    } else {
      // Symulacja nowej sprawy w stanie CREATED -> przejdź do przyjęcia (P1)
      navigate(`/szpital/przyjecie/${cleaned}`);
    }
  };

  const handleScanClick = () => {
    // Symulacja działania skanera (np. wpisanie przykładowego kodu sprawy lub naklejki)
    const scanned = prompt("Symulacja skanera QR. Wpisz kod sprawy (np. DP-7K2M-4Q) lub naklejki (np. S-0195):");
    if (!scanned) return;

    const upper = scanned.trim().toUpperCase();
    if (upper.startsWith("DP-")) {
      navigate(`/szpital/sprawa/${upper}`);
    } else if (upper.startsWith("S-")) {
      alert(`Zeskanowano próbkę ${upper}. Otwieranie okienka próbki...`);
      // Tutaj w przyszłości otwarcie modala próbki
    } else {
      setErrorMessage(content.error_sticker_unknown);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto", fontFamily: "sans-serif" }}>
      {/* Nagłówek wspólnego tabletu */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ccc", paddingBottom: "10px", marginBottom: "20px" }}>
        <div>
          <strong>Niezapominajka</strong> | Szpital Demo
        </div>
        <div>
          <span>Pielęgniarka #{staffId.replace("ST-", "")}</span>{" "}
          <button onClick={() => setStaffId(staffId === "ST-A41" ? "ST-B07" : "ST-A41")} style={{ marginLeft: "8px", padding: "4px 8px" }}>
            Zmień
          </button>
        </div>
      </header>

      {/* Hasło główne */}
      <h2 style={{ fontSize: "1.2rem", color: "#2c3e50" }}>{content.screen_home_hero}</h2>

      {/* Formularz wpisania numeru sprawy */}
      <form onSubmit={handleOpenCase} style={{ display: "flex", gap: "10px", margin: "20px 0" }}>
        <input
          type="text"
          placeholder={content.input_case_placeholder}
          value={caseInput}
          onChange={(e) => setCaseInput(e.target.value)}
          style={{ flex: 1, padding: "12px", fontSize: "1rem", textTransform: "uppercase" }}
        />
        <button type="submit" style={{ padding: "12px 20px", fontSize: "1rem", cursor: "pointer" }}>
          {content.btn_open_case}
        </button>
      </form>

      {/* Przycisk skanera */}
      <button onClick={handleScanClick} style={{ width: "100%", padding: "14px", fontSize: "1.1rem", background: "#f0f0f0", border: "1px solid #ccc", cursor: "pointer", marginBottom: "20px" }}>
        📷 {content.btn_scan}
      </button>

      {/* Komunikat błędu */}
      {errorMessage && (
        <div style={{ background: "#ffebee", color: "#c62828", padding: "12px", borderRadius: "4px", marginBottom: "20px" }}>
          {errorMessage}
        </div>
      )}

      {/* Tekst na dole */}
      <p style={{ fontSize: "0.85rem", color: "#666", fontStyle: "italic", marginBottom: "30px" }}>
        {content.screen_home_footer}
      </p>

      {/* Lista "Do dokończenia" (P1) */}
      {todos.length > 0 && (
        <section style={{ background: "#fafafa", border: "1px solid #e0e0e0", borderRadius: "6px", padding: "15px" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "1rem" }}>{content.list_header_todos}</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {todos.map((item) => {
              const minutesAgo = Math.floor((Date.now() - new Date(item.updated_at).getTime()) / 60000);
              const isOverdue = minutesAgo > 60;

              return (
                <li
                  key={item.sample_id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px",
                    marginBottom: "8px",
                    background: isOverdue ? "#fff3e0" : "#fff",
                    border: `1px solid ${isOverdue ? "#ffb74d" : "#ddd"}`,
                    borderRadius: "4px"
                  }}
                >
                  <div>
                    <strong>{item.sample_id}</strong> ({item.type}) | Sprawa: {item.case_id}
                    <div style={{ fontSize: "0.8rem", color: isOverdue ? "#e65100" : "#666" }}>
                      od {minutesAgo} min {isOverdue && `— ${content.list_warning_overdue}`}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/szpital/sprawa/${item.case_id}`)}
                    style={{ padding: "6px 12px", background: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                  >
                    {item.state === "COLLECTED" ? "Zaplombuj" : "Przekaż do depozytu"}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}