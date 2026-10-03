// src/App.jsx
import { useState } from 'react';
import MainPage from './MainPage';
import RulesPage from './RulesPages';
import './App.css';

export default function App() {
  // Stan przechowujący nazwę aktualnego widoku
  const [currentView, setCurrentView] = useState('main');

  // Warunkowe renderowanie komponentów
  if (currentView === 'main') {
    // Przekazujemy funkcję zmieniającą ekran jako props (onNavigate)
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

  // Tymczasowy ekran dla formularza
  if (currentView === 'formularz') {
    return (
      <div style={{ padding: '50px', color: 'white', textAlign: 'center' }}>
        <h2>Tu będzie formularz</h2>
        <button onClick={() => setCurrentView('main')} style={{ padding: '10px' }}>
          Wróć na główną
        </button>
      </div>
    );
  }
}