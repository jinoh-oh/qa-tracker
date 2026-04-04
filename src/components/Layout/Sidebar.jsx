import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Search, BookOpen, Settings, Database } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import './Sidebar.css';

function Sidebar() {
  const { modules } = useContext(AppContext);

  const getIcon = (id) => {
    if (id === '공통TC') return <CheckSquare size={18} />;
    if (id === 'SEARCH') return <Search size={18} />;
    if (id === 'ADMIN') return <Settings size={18} />;
    if (id === 'DATA') return <Database size={18} />;
    return <BookOpen size={18} />;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <BookOpen className="logo-icon" />
        <h2>QMS</h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>DASHBOARD</span>
        </NavLink>
        
        {modules.map((mod) => (
          <NavLink to={`/module/${mod.id}`} key={mod.id} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            {getIcon(mod.id)}
            <span>{mod.label}</span>
          </NavLink>
        ))}

        <div className="nav-divider"></div>
        <NavLink to="/defects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Database size={18} />
          <span>Defect Tracker</span>
        </NavLink>
        <NavLink to="/module/SCREEN_RULE" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BookOpen size={18} />
          <span>SCREEN_RULE</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={18} />
          <span>설정</span>
        </NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;
