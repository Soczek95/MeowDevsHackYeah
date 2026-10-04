import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Scanner } from '@yudiel/react-qr-scanner'; 
import { api } from '../../../../../frontend/src/shared/api';

export default function HospitalList() {
  const defaultStaffId = "ST-A41";
  const defaultHospitalId = "szpital-centralny";
  
  // Stan główny
  const [step, setStep] = useState('ENTER_CASE'); // 'ENTER_CASE' | 'ADD_SAMPLE' | 'SAMPLE_CREATED' | 'SAMPLE_DETAILS' | 'SAMPLE_LIST'
  const [currentCaseId, setCurrentCaseId] = useState('');
  const [caseInput, setCaseInput] = useState('');
  
  // Stan dla skanera QR
  const [isScanning, setIsScanning] = useState(false);
  
  const [sampleType, setSampleType] = useState('WYMAZ');
  const [currentSampleId, setCurrentSampleId] = useState('');
  
  const [sampleDetails, setSampleDetails] = useState({
    status: 'Ładowanie...',
    type: '-',
    createdAt: '-',
    updatedAt: '-'
  });
  
  // Stan dla listy wszystkich próbek
  const [allSamples, setAllSamples] = useState([]);
  
  const [selectedEvent, setSelectedEvent] = useState('ZAPLOMBOWANA');
  const [actionLoading, setActionLoading] = useState(false);

  // Funkcja pobierająca listę wszystkich próbek przy użyciu api.getAllSamples()
  const fetchAllSamples = async () => {
    try {
      setActionLoading(true);
      const response = await api.getAllSamples();
      setAllSamples(Array.isArray(response) ? response : []);
      setStep('SAMPLE_LIST');
    } catch (err) {
      alert("Nie udało się pobrać listy próbek: " + (err.message || JSON.stringify(err)));
    } finally {
      setActionLoading(false);
    }
  };

  // Wspólna funkcja przetwarzająca wprowadzony numer (z palca lub ze skanera)
  const processInput = async (inputVal) => {
    if (!inputVal) {
      alert("Wpisz numer sprawy lub próbki.");
      return;
    }

    if (inputVal.toUpperCase().startsWith('S')) {
      setCurrentSampleId(inputVal);
      setStep('SAMPLE_DETAILS');
      setCaseInput('');
      
      try {
        setActionLoading(true);
        const response = await api.getSampleStatus(inputVal);
        setSampleDetails({
          status: response?.state || 'Nieznany',
          type: response?.type || 'Nieznany',
          createdAt: response?.created_at ? new Date(response.created_at).toLocaleString() : '-',
          updatedAt: response?.updated_at ? new Date(response.updated_at).toLocaleString() : '-'
        });
      } catch (err) {
        alert("Nie znaleziono próbki o takim numerze.");
        setStep('ENTER_CASE');
      } finally {
        setActionLoading(false);
      }
      return;
    }

    try {
      setActionLoading(true);
      await api.admitCase(inputVal, defaultStaffId, defaultHospitalId);
      setCurrentCaseId(inputVal);
      setStep('ADD_SAMPLE');
      setCaseInput('');
    } catch (err) {
      alert("Błąd podczas przyjmowania sprawy: " + (err.message || JSON.stringify(err)));
    } finally {
      setActionLoading(false);
    }
  };

  const handleMainSubmit = () => {
    processInput(caseInput.trim());
  };

  const handleScan = (result) => {
    if (!result) return;

    let scannedValue = null;
    if (Array.isArray(result) && result.length > 0) {
      scannedValue = result[0].rawValue || result[0].text;
    } else if (result.rawValue) {
      scannedValue = result.rawValue;
    } else if (result.text) {
      scannedValue = result.text;
    } else if (typeof result === 'string') {
      scannedValue = result;
    }

    if (scannedValue) {
      if (scannedValue.includes('/samples/')) {
        const parts = scannedValue.split('/samples/');
        scannedValue = parts[parts.length - 1];
      }

      setIsScanning(false); 
      processInput(scannedValue.trim()); 
    }
  };

  const handleAddSample = async () => {
    try {
      setActionLoading(true);
      const response = await api.addSample(currentCaseId, sampleType, defaultStaffId);
      const generatedSampleId = response?.sample_id || "S-UNKNOWN";
      
      setCurrentSampleId(generatedSampleId);
      setStep('SAMPLE_CREATED');
    } catch (err) {
      alert("Błąd podczas dodawania próbki: " + (err.message || JSON.stringify(err)));
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddSampleEvent = async () => {
    try {
      setActionLoading(true);
      const defaultLocation = "Szpital Centralny";
      await api.addSampleEvent(currentSampleId, selectedEvent, defaultLocation, defaultStaffId);
      alert(`Pomyślnie zmieniono status próbki ${currentSampleId} na: ${selectedEvent}`);
      setStep('ENTER_CASE');
      setCurrentSampleId('');
    } catch (err) {
      alert("Błąd podczas aktualizacji statusu próbki: " + (err.message || JSON.stringify(err)));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#F7F6F2', 
      fontFamily: '"Outfit", "Montserrat", system-ui, -apple-system, sans-serif',
      color: '#101010',
      padding: '40px 60px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '60px' 
      }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '1.2rem', cursor: 'pointer' }} 
          onClick={() => setStep('ENTER_CASE')}
        >
          <span style={{ fontSize: '1.5rem' }}>✿</span> niezapominajkaCare
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button 
            onClick={fetchAllSamples}
            disabled={actionLoading}
            style={{ 
              background: 'transparent', border: '1px solid #101010', padding: '10px 24px', 
              borderRadius: '30px', fontSize: '0.9rem', fontWeight: '600', 
              cursor: 'pointer', color: '#101010'
            }}
          >
            Lista próbek
          </button>
          
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #101010', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>
      </header>

      {step === 'ENTER_CASE' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '600', letterSpacing: '-1.5px', marginBottom: '50px', marginTop: 0 }}>
            Zabezpieczenie materiałów
          </h1>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>
            
            {/* Lewa kolumna */}
            <div>
              <div style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: '400' }}>Otwórz sprawę</div>
              
              {!isScanning ? (
                <button 
                  onClick={() => setIsScanning(true)}
                  style={{ background: '#000', color: '#fff', border: 'none', padding: '18px 36px', borderRadius: '40px', fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.5px', cursor: 'pointer', textTransform: 'uppercase' }}
                >
                  ZESKANUJ KOD QR
                </button>
              ) : (
                <div style={{ background: '#fff', padding: '16px', borderRadius: '24px', border: '1px solid #e2ddd6', maxWidth: '350px' }}>
                  <button 
                    onClick={() => setIsScanning(false)}
                    style={{ marginBottom: '16px', padding: '10px 20px', background: '#f5f5f0', color: '#000', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                  >
                    Anuluj skanowanie
                  </button>
                  <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2ddd6' }}>
                    <Scanner 
                      onScan={handleScan}
                      onResult={handleScan}
                      formats={['qr_code']}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Prawa kolumna */}
            <div>
              <div style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: '400' }}>Wpisz numer sprawy</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}>
                <input 
                  type="text"
                  value={caseInput}
                  onChange={(e) => setCaseInput(e.target.value)}
                  style={{ 
                    background: '#D8D5CC', 
                    border: 'none', 
                    height: '80px', 
                    borderRadius: '24px', 
                    fontSize: '1.5rem', 
                    padding: '0 24px',
                    outline: 'none', 
                    color: '#101010',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={handleMainSubmit}
                    disabled={actionLoading}
                    style={{ background: '#000', color: '#fff', border: 'none', padding: '18px 36px', borderRadius: '40px', fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.5px', cursor: 'pointer', textTransform: 'uppercase' }}
                  >
                    {actionLoading ? "PRZETWARZANIE..." : "ZAREJESTRUJ PRÓBKĘ"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WIDOK: LISTA WSZYSTKICH PRÓBEK */}
      {step === 'SAMPLE_LIST' && (
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '600', letterSpacing: '-1px', margin: 0 }}>
              Zarejestrowane próbki
            </h1>
            <button 
              onClick={() => setStep('ENTER_CASE')}
              style={{ background: '#000', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '30px', cursor: 'pointer', fontWeight: '600' }}
            >
              Powrót do startu
            </button>
          </div>

          {allSamples.length === 0 ? (
            <div style={{ padding: '60px', background: '#D8D5CC', borderRadius: '24px', textAlign: 'center', color: '#101010', fontSize: '1.2rem' }}>
              Brak zarejestrowanych próbek w bazie.
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2ddd6', overflow: 'hidden', marginBottom: '60px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F7F6F2', borderBottom: '1px solid #e2ddd6', fontSize: '0.9rem', color: '#444' }}>
                    <th style={{ padding: '20px 24px', fontWeight: '600' }}>ID Próbki</th>
                    <th style={{ padding: '20px 24px', fontWeight: '600' }}>Sprawa</th>
                    <th style={{ padding: '20px 24px', fontWeight: '600' }}>Typ</th>
                    <th style={{ padding: '20px 24px', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '20px 24px', fontWeight: '600' }}>Data utworzenia</th>
                    <th style={{ padding: '20px 24px', textAlign: 'right', fontWeight: '600' }}>Akcja</th>
                  </tr>
                </thead>
                <tbody>
                  {allSamples.map((sample, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F7F6F2', fontSize: '1rem' }}>
                      <td style={{ padding: '20px 24px', fontWeight: '600' }}>{sample.id}</td>
                      <td style={{ padding: '20px 24px' }}>{sample.case_id}</td>
                      <td style={{ padding: '20px 24px' }}>{sample.type}</td>
                      <td style={{ padding: '20px 24px', fontWeight: '500' }}>{sample.state}</td>
                      <td style={{ padding: '20px 24px', color: '#666' }}>{sample.created_at ? new Date(sample.created_at).toLocaleString() : '-'}</td>
                      <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                        <button 
                          onClick={() => processInput(sample.id)}
                          style={{ background: '#101010', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                        >
                          Zarządzaj
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* POZOSTAŁE WIDOKI DOSTOSOWANE WIZUALNIE DO NOWEGO STYLU */}
      {step === 'ADD_SAMPLE' && (
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '600', letterSpacing: '-1.5px', marginBottom: '20px', marginTop: 0 }}>
            Rejestracja próbki
          </h1>
          <p style={{ color: '#101010', marginBottom: '40px', fontSize: '1.2rem' }}>
            Sprawa: <strong>{currentCaseId}</strong> została przyjęta. Wybierz typ materiału dowodowego.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px', margin: '0 auto', marginBottom: '80px'}}>
            <div>
              <label style={{ display: 'block', fontSize: '1.2rem', marginBottom: '16px', fontWeight: '400'}}>Typ próbki</label>
              <select 
                value={sampleType}
                onChange={(e) => setSampleType(e.target.value)}
                style={{ width: '100%', background: '#D8D5CC', border: 'none', padding: '0 24px', height: '80px', borderRadius: '24px', fontSize: '1.2rem', outline: 'none', color: '#101010', boxSizing: 'border-box' }}
              >
                <option value="WYMAZ">Wymaz</option>
                <option value="KREW">Krew</option>
                <option value="MOCZ">Mocz</option>
                <option value="ODZIEZ">Odzież</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
              <button onClick={() => setStep('ENTER_CASE')} style={{ background: 'transparent', color: '#101010', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: '600', textDecoration: 'underline' }}>Wróć</button>
              <button 
                onClick={handleAddSample}
                disabled={actionLoading}
                style={{ background: '#000', color: '#fff', border: 'none', padding: '18px 36px', borderRadius: '40px', fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.5px', cursor: 'pointer', textTransform: 'uppercase' }}
              >
                {actionLoading ? "ZAPISYWANIE..." : "ZAREJESTRUJ I WYGENERUJ QR"}
              </button>
            </div>
          </div>
        </div>
      )}

{step === 'SAMPLE_CREATED' && (
        <div style={{ 
          flex: 1, 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', /* Dwie równe kolumny */
          gap: '20px', 
          alignItems: 'center', /* Środkuje zawartość w pionie */
          maxWidth: '1000px', 
          margin: '0 auto' /* Środkuje cały kontener na ekranie */
        }}>
          
          {/* LEWA STRONA: Komunikat i ID */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', lineHeight: '1.2', marginTop: 0, color: '#101010' }}>
              Próbka zarejestrowana pomyślnie!
            </h1>
            <p style={{ fontSize: '1.5rem', margin: 0, color: '#444' }}>
              ID Próbki: <strong style={{ color: '#101010' }}>{currentSampleId}</strong>
            </p>
          </div>

          {/* PRAWA STRONA: Kod QR i Przyciski */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ background: '#fff', padding: '40px', borderRadius: '32px', border: '2px solid #e2ddd6', display: 'inline-block', marginBottom: '40px', textAlign: 'center' }}>
              <div style={{ marginBottom: '20px', fontSize: '0.9rem', fontWeight: '700', color: '#101010', letterSpacing: '1px' }}>
                NIEZAPOMINAJKACARE
              </div>
              
              <div style={{ background: 'white', padding: '16px', display: 'inline-block', border: '1px solid #f0f0f0', borderRadius: '16px' }}>
                <QRCode 
                  value={`${window.location.origin}/samples/${currentSampleId}`} 
                  size={200}
                  level="M"
                />
              </div>

              <div style={{ marginTop: '24px', fontSize: '1.5rem', fontWeight: '700', color: '#101010' }}>
                {currentSampleId}
              </div>
              <div style={{ fontSize: '1rem', color: '#666', marginTop: '8px' }}>
                Typ: {sampleType}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={handlePrint}
                style={{ background: '#000', color: '#fff', border: 'none', padding: '18px 36px', borderRadius: '40px', fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.5px', cursor: 'pointer', textTransform: 'uppercase' }}
              >
                WYDRUKUJ ETYKIETĘ
              </button>
              <button 
                onClick={() => setStep('ENTER_CASE')}
                style={{ background: 'transparent', color: '#101010', border: '1px solid #101010', padding: '18px 36px', borderRadius: '40px', fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.5px', cursor: 'pointer', textTransform: 'uppercase' }}
              >
                ZAKOŃCZ
              </button>
            </div>
          </div>

        </div>
      )}

      {step === 'SAMPLE_DETAILS' && (
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' /* <-- TO WYŚRODKUJE CAŁĄ ZAWARTOŚĆ W POZIOMIE */
        }}>
          <h1 style={{ fontSize: '2.0rem', fontWeight: '600', letterSpacing: '-1.5px', marginBottom: '40px', marginTop: 0,color: '#101010', textAlign: 'center'  }}>
            Zarządzanie próbką
          </h1>
          <div style={{ background: '#D8D5CC', padding: '32px', borderRadius: '24px',width: '100%', maxWidth: '500px', marginBottom: '40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '1rem', color: '#444', marginBottom: '4px' }}>Numer próbki</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#101010' }}>{currentSampleId}</div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '1rem', color: '#444', marginBottom: '4px' }}>Rodzaj próbki</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '500', color: '#101010' }}>{sampleDetails.type}</div>
              </div>
              <div>
                <div style={{ fontSize: '1rem', color: '#444', marginBottom: '4px' }}>Aktualny status</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#101010' }}>{sampleDetails.status}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#555', marginBottom: '4px' }}>Data utworzenia</div>
                <div style={{ fontSize: '1rem', color: '#101010' }}>{sampleDetails.createdAt}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#555', marginBottom: '4px' }}>Ostatnia modyfikacja</div>
                <div style={{ fontSize: '1rem', color: '#101010' }}>{sampleDetails.updatedAt}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px', marginBottom: '80px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '1.2rem', marginBottom: '16px', fontWeight: '400' }}>Zmień status / Zdarzenie</label>
              <select 
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                style={{ width: '100%', background: '#D8D5CC', border: 'none', padding: '0 24px', height: '80px', borderRadius: '24px', fontSize: '1.1rem', outline: 'none', color: '#101010', boxSizing: 'border-box' }}
              >
                <option value="ZAPLOMBOWANO">Zaplombowano</option>
                <option value="ZMAGAZYNOWANA">Zmagazynowane</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
              <button onClick={() => setStep('ENTER_CASE')} style={{ background: 'transparent', color: '#101010', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: '600', textDecoration: 'underline' }}>Wróć</button>
              <button 
                onClick={handleAddSampleEvent}
                disabled={actionLoading}
                style={{ background: '#000', color: '#fff', border: 'none', padding: '18px 36px', borderRadius: '40px', fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.5px', cursor: 'pointer', textTransform: 'uppercase' }}
              >
                {actionLoading ? "AKTUALIZOWANIE..." : "ZAPISZ NOWY STATUS"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}