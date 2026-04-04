import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, UserCircle, LogOut, Settings as SettingsIcon, LogIn } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import './Header.css';

function Header() {
  const { user, login, logout, notificationsData, markAsRead, markAllAsRead } = useContext(AppContext);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notificationsData ? notificationsData.filter(n => !n.read).length : 0;

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    setShowNotifications(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <header className="app-header" style={{ position: 'relative', zIndex: 2000 }}>
      <div className="header-title">
        <h1>QA Management System (QMS)</h1>
      </div>
      <div className="header-actions">
        
        {/* Notifications */}
        <div className="relative">
          <button 
            className={`icon-btn ${showNotifications ? 'active' : ''}`}
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            title="알림"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>
          
          {showNotifications && (
            <div className="dropdown-menu notifications-menu" style={{ width: '320px', maxHeight: '400px', overflowY: 'auto' }}>
              <div className="dropdown-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>알림</span>
                {unreadCount > 0 && (
                   <button onClick={markAllAsRead} style={{ fontSize: '12px', background:'none', border:'none', color:'#3182ce', cursor:'pointer', fontWeight: 500 }}>모두 읽음</button>
                )}
              </div>
              <div className="dropdown-body" style={{ padding: 0 }}>
                {notificationsData && notificationsData.length > 0 ? (
                  notificationsData.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`dropdown-item ${notif.read ? 'read' : 'unread'}`} 
                      onClick={() => handleNotificationClick(notif)}
                      style={{ 
                        flexDirection: 'column', 
                        alignItems: 'flex-start', 
                        padding: '12px 16px', 
                        borderBottom: '1px solid #edf2f7',
                        backgroundColor: notif.read ? 'transparent' : '#ebf8ff',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px', color: notif.read ? 'var(--text-main)' : '#2b6cb0' }}>
                        {notif.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        {notif.message}
                      </div>
                      <div style={{ fontSize: '11px', color: '#a0aec0', marginTop: '6px' }}>
                        {new Date(notif.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dropdown-item empty" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>새로운 알림이 없습니다.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <div 
            className="user-profile" 
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
          >
            <UserCircle size={24} />
            <span>{user ? user.name : 'Not Logged In'}</span>
          </div>
          {showUserMenu && (
            <div className="dropdown-menu user-menu">
              {user ? (
                <>
                  <div className="dropdown-item" onClick={() => { setShowUserMenu(false); navigate('/settings'); }}>
                    <SettingsIcon size={16} /> 설정
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item text-danger" onClick={() => { logout(); setShowUserMenu(false); }}>
                    <LogOut size={16} /> 로그아웃
                  </div>
                </>
              ) : (
                <div className="dropdown-item" onClick={() => { login(); setShowUserMenu(false); }}>
                  <LogIn size={16} /> 로그인
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default Header;
