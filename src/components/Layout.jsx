import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, Plus, Wallet, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

const Layout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app-container">
      <nav className="nav-container">
        {!isMobile && (
          <div className="logo-container">
            <Wallet className="logo-icon" size={28} />
            <span>Finanzas</span>
          </div>
        )}
        
        <div className={isMobile ? "nav-links-mobile" : "nav-links"}>
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={24} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/historial" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Receipt size={24} />
            <span>Historial</span>
          </NavLink>
          
          <NavLink to="/configuracion" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <SettingsIcon size={24} />
            <span>Ajustes</span>
          </NavLink>

          <button onClick={handleLogout} className="nav-item" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <LogOut size={24} />
            <span>Salir</span>
          </button>
          
          <NavLink to="/nueva-transaccion" className="nav-item fab">
            <Plus size={isMobile ? 28 : 20} strokeWidth={3} />
            {!isMobile && <span>Nuevo</span>}
          </NavLink>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
