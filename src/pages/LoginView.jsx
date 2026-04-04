import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { BookOpen } from 'lucide-react';
import './LoginView.css';

function LoginView() {
  const { login } = useContext(AppContext);
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const success = login(id, pw);
    if (!success) {
      setErrorMsg('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card animate-fade-in">
        <div className="login-header">
          <BookOpen className="login-logo" size={32} />
          <h2>QA Management System</h2>
          <p>시스템에 로그인하세요</p>
        </div>
        <form onSubmit={handleLogin} className="login-form">
          {errorMsg && <div className="error-message" style={{color: '#e53e3e', background: '#fed7d7', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px', textAlign: 'center'}}>{errorMsg}</div>}
          <div className="form-group">
            <label>아이디</label>
            <input 
              type="text" 
              value={id} 
              onChange={e => setId(e.target.value)} 
              placeholder="아이디 입력" 
              required 
            />
          </div>
          <div className="form-group">
            <label>비밀번호</label>
            <input 
              type="password" 
              value={pw} 
              onChange={e => setPw(e.target.value)} 
              placeholder="비밀번호 입력" 
              required 
            />
          </div>
          <button type="submit" className="login-btn">로그인</button>
        </form>
      </div>
    </div>
  );
}

export default LoginView;
