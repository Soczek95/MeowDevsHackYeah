import CaseDashboardPage from './CaseDashboardPage';
import './App.css'; // Upewnij się, że importujesz style

export default function TestView() {
  return (
    <CaseDashboardPage 
      caseId="DP-DEMO-01" 
      caseKey="XXXX-YYYY-ZZZZ" 
      onHome={() => alert('Powrót do domu')} 
      onLogout={() => alert('Wylogowano')} 
    />
  );
}