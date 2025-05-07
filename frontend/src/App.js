import React from 'react';
import Home from './pages/Home';
import HospitalMap from './pages/Map';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Aplicación de Salud</h1>
      </header>
      <main>
        {/* Aquí puedes agregar un enrutador para navegar entre las páginas */}
        <Home />
        <HospitalMap />
      </main>
    </div>
  );
}

export default App;