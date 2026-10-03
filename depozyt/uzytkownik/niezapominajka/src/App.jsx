import { useState } from 'react';
import MainPage from './MainPage';
import RulesPage from './RulesPages';
import FormPage from './FormPage';
import LocationPage from './LocationPage';
import CodePage from './CodePage';
import CaseAccessPage from './CaseAccessPage'; // <-- Import nowej strony dostępu do sprawy
import './App.css';

export default function App() {
  const [currentView, setCurrentView] = useState('main');

  if (currentView === 'main') {
    return (
      <MainPage 
        onNavigate={() => setCurrentView('rules')} 
        onOpenAccess={() => setCurrentView('case-access')} // <-- Przejście z ikonki profilu w main do logowania sprawy
      />
    );
  }

  if (currentView === 'case-access') {
    return (
      <CaseAccessPage 
        onHome={() => setCurrentView('main')}             // Napis "niezapominajka" wraca do main
        onGoToRules={() => setCurrentView('rules')}        // "chce założyć sprawę" prowadzi do rules
        onSubmitCase={(code, key) => {
          console.log("Logowanie do sprawy:", code, key);
          // Tutaj możesz dodać widok podglądu sprawy po zalogowaniu
        }}
      />
    );
  }

  if (currentView === 'rules') {
    return (
      <RulesPage 
        onAccept={() => setCurrentView('formularz')} 
        onBack={() => setCurrentView('case-access')}     // Kliknięcie "mam już sprawę" w rules prowadzi do access
        onHome={() => setCurrentView('main')} 
      />
    );
  }

  if (currentView === 'formularz') {
    return (
      <FormPage 
        onBack={() => setCurrentView('rules')}
        onCreate={() => setCurrentView('lokalizacja')} 
        onHome={() => setCurrentView('main')}
      />
    );
  }

  if (currentView === 'lokalizacja') {
    return (
      <LocationPage 
        onShowCode={() => setCurrentView('kod')} 
        onHome={() => setCurrentView('main')}
      />
    );
  }

  if (currentView === 'kod') {
    return (
      <CodePage onBack={() => setCurrentView('main')} />
    );
  }
}