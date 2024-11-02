import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginRegister from './pages/LoginRegister';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import DisabledProducts from './pages/DisabledProducts';
import Lots from './pages/Lots';
import DisabledLots from './pages/DisabledLots';
import Usage from './pages/Usage';
import AppLayout from './pages/AppLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta para Login y Registro sin el layout */}
        <Route path="/" element={<Navigate to="/login-register" />} />
        <Route path="/login-register" element={<LoginRegister />} />
        
        {/* Rutas con el layout de AppLayout */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/disabled" element={<DisabledProducts />} />
          <Route path="/lots" element={<Lots />} />
          <Route path="/lots/disabled" element={<DisabledLots />} />
          <Route path="/usage" element={<Usage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
