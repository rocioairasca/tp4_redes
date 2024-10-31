import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import DisabledProducts from './pages/DisabledProducts';
import Lots from './pages/Lots';
import DisabledLots from './pages/DisabledLots';
import Usage from './pages/Usage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />}/>
        <Route path="/register" element={<Register />} />
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/products' element={<Products/>}/>
        <Route path="/products/disabled" element={<DisabledProducts />} />
        <Route path='/lots' element={<Lots/>}/>
        <Route path='/lots/disabled' element={<DisabledLots/>}/>
        <Route path='/usage' element={<Usage/>}/>
      </Routes>
    </Router>
  );
}

export default App;
