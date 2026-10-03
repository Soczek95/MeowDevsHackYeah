import { useState } from 'react';
import MainPage from './MainPage';
import RulesPage from './RulesPages';
import FormPage from './FormPage';
import LocationPage from './LocationPage';
import CodePage from './CodePage'; // <-- Dodany import nowej strony
import './App.css';

export default function App() {
  const [currentView, setCurrentView] = useState('main');

  if (currentView === 'main') {
    return <MainPage onNavigate={() => setCurrentView('rules')} />;
  }

  if (currentView === 'rules') {
    return (
      <RulesPage 
        onAccept={() => setCurrentView('formularz')} 
        onBack={() => setCurrentView('main')} 
      />
    );
  }

  if (currentView === 'formularz') {
    return (
      <FormPage 
        onBack={() => setCurrentView('rules')}
        onCreate={() => setCurrentView('lokalizacja')} 
      />
    );
  }

  if (currentView === 'lokalizacja') {
    return (
      <LocationPage 
        onShowCode={() => setCurrentView('kod')} 
      />
    );
  }

  if (currentView === 'kod') {
    return (
      <CodePage onBack={() => setCurrentView('main')} />
    );
  }
}