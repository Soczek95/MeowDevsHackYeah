import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Scanner } from '@yudiel/react-qr-scanner'; 
import { api } from '../../../../../frontend/src/shared/api';
import staffData from '../../shared/content/staff.json';

export default function HospitalList() {
  const defaultStaffId = staffData?.staff?.[0]?.id || "ST-A41";
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
  
  const [selectedEvent, setSelectedEvent] = useState('SEALED');
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
      background: '#fcfbfa', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#1a1a1a',
      padding: '24px 48px',
      boxSizing: 'border-box'
    }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '60px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }} onClick={() => setStep('ENTER_CASE')}>
          <span style={{ fontSize: '1.3rem' }}>🌸</span> niezapominajkaCare
        </div>
        
        {/* Prawy górny róg: Przycisk "Lista próbek" obok ikonki profilu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={fetchAllSamples}
            disabled={actionLoading}
            style={{ 
              background: '#e4e2dd', border: 'none', padding: '10px 20px', 
              borderRadius: '20px', fontSize: '0.9rem', fontWeight: '600', 
              cursor: 'pointer', color: '#333'
            }}
          >
            📋 Lista próbek
          </button>
          
          <div style={{ 
            width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid #1a1a1a', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }}>
            👤
          </div>
        </div>
      </header>

      {step === 'ENTER_CASE' && (
        <>
          <h1 style={{ fontSize: '3rem', fontWeight: '500', letterSpacing: '-1px', marginBottom: '50px', marginTop: 0, color: '#111' }}>
            Zabezpieczenie materiałów
          </h1>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start', marginBottom: '80px' }}>
            
            <div>
              <div style={{ fontSize: '1.05rem', color: '#333', marginBottom: '20px' }}>Otwórz sprawę za pomocą aparatu</div>
              
              {!isScanning ? (
                <button 
                  onClick={() => setIsScanning(true)}
                  style={{ background: '#111', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: '30px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  📷 ZESKANUJ KOD QR
                </button>
              ) : (
                <div style={{ background: '#fff', padding: '16px', borderRadius: '20px', border: '1px solid #ddd', maxWidth: '350px' }}>
                  <button 
                    onClick={() => setIsScanning(false)}
                    style={{ marginBottom: '12px', padding: '8px 16px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '15px', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    ❌ Anuluj
                  </button>
                  <div style={{ borderRadius: '12px', overflow: 'hidden', border: '2px dashed #ccc' }}>
                    <Scanner 
                      onScan={handleScan}
                      onResult={handleScan}
                      formats={['qr_code']}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: '1.05rem', color: '#333', marginBottom: '20px' }}>Wpisz numer sprawy lub próbki</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '450px' }}>
                <input 
                  type="text"
                  placeholder="np. CASE-2026-001 lub S-AB12-CD34"
                  value={caseInput}
                  onChange={(e) => setCaseInput(e.target.value)}
                  style={{ background: '#e4e2dd', border: 'none', padding: '18px 24px', borderRadius: '16px', fontSize: '1rem', outline: 'none', color: '#333' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={handleMainSubmit}
                    disabled={actionLoading}
                    style={{ background: '#111', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: '30px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' }}
                  >
                    {actionLoading ? "PRZETWARZANIE..." : "DALEJ"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* WIDOK: LISTA WSZYSTKICH PRÓBEK */}
      {step === 'SAMPLE_LIST' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '500', letterSpacing: '-1px', margin: 0, color: '#111' }}>
              Wszystkie zarejestrowane próbki
            </h1>
            <button 
              onClick={() => setStep('ENTER_CASE')}
              style={{ background: '#111', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600' }}
            >
              ← Powrót
            </button>
          </div>

          {allSamples.length === 0 ? (
            <div style={{ padding: '40px', background: '#f0ede6', borderRadius: '16px', textAlign: 'center', color: '#666' }}>
              Brak zarejestrowanych próbek w bazie.
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2ddd6', overflow: 'hidden', marginBottom: '60px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f0ede6', borderBottom: '1px solid #e2ddd6', fontSize: '0.9rem', color: '#444' }}>
                    <th style={{ padding: '16px 20px' }}>ID Próbki</th>
                    <th style={{ padding: '16px 20px' }}>Sprawa</th>
                    <th style={{ padding: '16px 20px' }}>Typ</th>
                    <th style={{ padding: '16px 20px' }}>Status</th>
                    <th style={{ padding: '16px 20px' }}>Data utworzenia</th>
                    <th style={{ padding: '16px 20px', textAlign: 'right' }}>Akcja</th>
                  </tr>
                </thead>
                <tbody>
                  {allSamples.map((sample, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f0ede6', fontSize: '0.95rem' }}>
                      <td style={{ padding: '16px 20px', fontFamily: 'monospace', fontWeight: '600' }}>{sample.id}</td>
                      <td style={{ padding: '16px 20px', fontFamily: 'monospace' }}>{sample.case_id}</td>
                      <td style={{ padding: '16px 20px' }}>{sample.type}</td>
                      <td style={{ padding: '16px 20px', color: '#2a6f43', fontWeight: '500' }}>{sample.state}</td>
                      <td style={{ padding: '16px 20px', color: '#666' }}>{sample.created_at ? new Date(sample.created_at).toLocaleString() : '-'}</td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <button 
                          onClick={() => processInput(sample.id)}
                          style={{ background: '#111', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
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
        </>
      )}

      {step === 'ADD_SAMPLE' && (
        <>
          <h1 style={{ fontSize: '3rem', fontWeight: '500', letterSpacing: '-1px', marginBottom: '20px', marginTop: 0, color: '#111' }}>
            Rejestracja próbki
          </h1>
          <p style={{ color: '#666', marginBottom: '40px', fontSize: '1rem' }}>
            Sprawa: <strong style={{ color: '#111' }}>{currentCaseId}</strong> została przyjęta. Wybierz typ materiału dowodowego.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '450px', marginBottom: '80px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.95rem', color: '#333', marginBottom: '8px', fontWeight: '500' }}>Typ próbki</label>
              <select 
                value={sampleType}
                onChange={(e) => setSampleType(e.target.value)}
                style={{ width: '100%', background: '#e4e2dd', border: 'none', padding: '18px 24px', borderRadius: '16px', fontSize: '1rem', outline: 'none', color: '#333', boxSizing: 'border-box' }}
              >
                <option value="SWAB">Wymaz (SWAB)</option>
                <option value="BLOOD">Krew (BLOOD)</option>
                <option value="URINE">Mocz (URINE)</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <button onClick={() => setStep('ENTER_CASE')} style={{ background: 'transparent', color: '#666', border: 'none', cursor: 'pointer', fontSize: '0.95rem' }}>← Wróć</button>
              <button 
                onClick={handleAddSample}
                disabled={actionLoading}
                style={{ background: '#111', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: '30px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' }}
              >
                {actionLoading ? "ZAPISYWANIE..." : "ZAREJESTRUJ I WYGENERUJ QR"}
              </button>
            </div>
          </div>
        </>
      )}

      {step === 'SAMPLE_CREATED' && (
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '500', marginBottom: '10px', color: '#111' }}>
            Próbka zarejestrowana pomyślnie!
          </h1>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            ID Próbki: <strong style={{ color: '#111', fontFamily: 'monospace' }}>{currentSampleId}</strong>
          </p>

          <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', border: '2px dashed #ccc', display: 'inline-block', marginBottom: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ marginBottom: '15px', fontSize: '0.85rem', fontWeight: '600', color: '#444', letterSpacing: '1px' }}>
              NIEZAPOMINAJKACARE - ETYKIETA PRÓBKI
            </div>
            
            <div style={{ background: 'white', padding: '10px', display: 'inline-block' }}>
              <QRCode 
                value={`${window.location.origin}/samples/${currentSampleId}`} 
                size={180}
                level="M"
              />
            </div>

            <div style={{ marginTop: '12px', fontSize: '1.1rem', fontWeight: 'bold', color: '#111', fontFamily: 'monospace' }}>
              {currentSampleId}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
              Typ: {sampleType}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button 
              onClick={handlePrint}
              style={{ background: '#2a6f43', color: '#fff', border: 'none', padding: '16px 28px', borderRadius: '30px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            >
              🖨️ WYDRUKUJ ETYKIETĘ
            </button>
            <button 
              onClick={() => setStep('ENTER_CASE')}
              style={{ background: '#111', color: '#fff', border: 'none', padding: '16px 28px', borderRadius: '30px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' }}
            >
              ZAKOŃCZ / KOLEJNA
            </button>
          </div>
        </div>
      )}

      {step === 'SAMPLE_DETAILS' && (
        <>
          <h1 style={{ fontSize: '3rem', fontWeight: '500', letterSpacing: '-1px', marginBottom: '20px', marginTop: 0, color: '#111' }}>
            Zarządzanie próbką
          </h1>
          <div style={{ background: '#f0ede6', padding: '24px', borderRadius: '16px', maxWidth: '480px', marginBottom: '30px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '2px' }}>Numer próbki</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '600', color: '#111' }}>{currentSampleId}</div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '2px' }}>Rodzaj próbki</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '500', color: '#111' }}>{sampleDetails.type}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '2px' }}>Aktualny status</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '500', color: '#2a6f43' }}>{sampleDetails.status}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e2ddd6', paddingTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#777', marginBottom: '2px' }}>Data utworzenia</div>
                <div style={{ fontSize: '0.85rem', color: '#333' }}>{sampleDetails.createdAt}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#777', marginBottom: '2px' }}>Ostatnia modyfikacja</div>
                <div style={{ fontSize: '0.85rem', color: '#333' }}>{sampleDetails.updatedAt}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '480px', marginBottom: '80px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.95rem', color: '#333', marginBottom: '8px', fontWeight: '500' }}>Zmień status / Zdarzenie</label>
              <select 
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                style={{ width: '100%', background: '#e4e2dd', border: 'none', padding: '18px 24px', borderRadius: '16px', fontSize: '1rem', outline: 'none', color: '#333', boxSizing: 'border-box' }}
              >
                <option value="SEALED">Zabezpieczono / Opięczętowane (SEALED)</option>
                <option value="STORED">Zmagazynowano w depozycie (STORED)</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <button onClick={() => setStep('ENTER_CASE')} style={{ background: 'transparent', color: '#666', border: 'none', cursor: 'pointer', fontSize: '0.95rem' }}>← Wróć</button>
              <button 
                onClick={handleAddSampleEvent}
                disabled={actionLoading}
                style={{ background: '#111', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: '30px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' }}
              >
                {actionLoading ? "AKTUALIZOWANIE..." : "ZAPISZ NOWY STATUS"}
              </button>
            </div>
          </div>
        </>
      )}

      <div style={{ 
        marginTop: '80px', fontSize: '0.9rem', color: '#555', lineHeight: '1.5',
        borderTop: '1px solid #eae5e0', paddingTop: '20px', maxWidth: '600px'
      }}>
        Próbki dowodowe nie są badane, dopóki pacjentka nie zdecyduje.<br />
        Nie zlecaj ich badania.
      </div>
    </div>
  );
}