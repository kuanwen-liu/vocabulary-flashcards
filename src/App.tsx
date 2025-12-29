/**
 * App Component - Main Application Entry Point
 *
 * Renders the StudyView component as the primary interface.
 * Future phases will add navigation between StudyView and CardLibrary.
 *
 * Phase 3 (Current): Study Mode only
 * Phase 4+: Add navigation, card management, bulk import
 */

import { StudyView } from './components/StudyView';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <StudyView />
    </div>
  );
}

export default App;
