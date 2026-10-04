import { useState } from 'react';
import MainPage from './MainPage';
import RulesPage from './RulesPages';
import FormPage from './FormPage';
import LocationPage from './LocationPage';
import CodePage from './CodePage';
import CaseAccessPage from './CaseAccessPage';
import CaseDashboardPage from './CaseDashboardPage';
import { api } from '../../../frontend/src/shared/api';
import './App.css';

// Typ dla danych z serwera - dopasuj do rzeczywistej odpowiedzi API
export interface CaseServerData {
  case_id?: string;
  case_key?: string;
  status?: string;
  hospital?: string;
  created_at?: string;
  expires_at?: string;
  samples?: Array<{ type: string; status: string }>;
  [key: string]: any; // pozwala na dodatkowe pola
}

export default function App() {
  const [currentView, setCurrentView] = useState('main');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caseData, setCaseData] = useState<{ case_id: string, case_key: string } | null>(null);
  
  // Stan dla zalogowanej sprawy - teraz z pełnymi danymi z serwera
  const [loggedCase, setLoggedCase] = useState<{ 
    code: string; 
    key: string; 
    serverData: CaseServerData | null;
  } | null>(null);

  const handleCreateCase = async () => {
    setIsLoading(true);
    setError(null);
    setCaseData(null);

    try {
      const origin = "HOSPITAL_SOR"; 
      const response = await api.createCase(origin);
      
      const newCaseData = {
        case_id: response.case_id,
        case_key: response.case_key
      };
      
      setCaseData(newCaseData);
      return newCaseData;
    } catch (err: unknown) {
      console.error("Błąd tworzenia sprawy:", err);
      const errorMessage = err instanceof Error ? err.message : "Nieznany błąd";
      setError(errorMessage || "Nie udało się utworzyć sprawy. Sprawdź połączenie.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  if (currentView === 'main') {
    return (
      <MainPage 
        onNavigate={() => setCurrentView('rules')} 
        onOpenAccess={() => setCurrentView('case-access')}
      />
    );
  }

  if (currentView === 'case-access') {
    if (loggedCase) {
      return (
        <CaseDashboardPage 
          caseId={loggedCase.code}
          serverData={loggedCase.serverData}
          onHome={() => { setCurrentView('main'); setLoggedCase(null); }}
        />
      );
    }

    return (
      <CaseAccessPage 
        onHome={() => setCurrentView('main')}
        onGoToRules={() => setCurrentView('rules')}
        onSubmitCase={(code: string, key: string, serverResponse: CaseServerData) => {
          console.log("Logowanie do sprawy:", code, key, serverResponse);
          setLoggedCase({ 
            code, 
            key, 
            serverData: serverResponse 
          });
        }}
      />
    );
  }

  if (currentView === 'rules') {
    return (
      <RulesPage 
        onAccept={() => setCurrentView('formularz')} 
        onBack={() => setCurrentView('case-access')}
        onHome={() => setCurrentView('main')} 
      />
    );
  }

  if (currentView === 'formularz') {
    return (
      <FormPage 
        onBack={() => setCurrentView('rules')}
        onCreate={async () => {
          const result = await handleCreateCase(); 
          if (result) {
            setCurrentView('lokalizacja');
          }
        }} 
        onHome={() => setCurrentView('main')}
      />
    );
  }

  if (currentView === 'lokalizacja') {
    return (
      <LocationPage 
        onHome={() => setCurrentView('main')}
        caseData={caseData}
      />
    );
  }

  if (currentView === 'kod') {
    return (
      <CodePage onBack={() => setCurrentView('main')} />
    );
  }

  return null;
}