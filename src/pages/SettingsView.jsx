import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { ArrowUp, ArrowDown, Plus, Trash2 } from 'lucide-react';
import './SettingsView.css';

function SettingsView() {
  const { user, accounts, modules, updateModules, addModule, deleteModule, addAccount, deleteAccount, updateAccountPw, depthOptions, addDepthOption, deleteDepthOption, updateDepthOptions, isReadOnly } = useContext(AppContext);
  const [newModId, setNewModId] = useState('');
  const [newModName, setNewModName] = useState('');
  
  const [newUserId, setNewUserId] = useState('');
  const [newUserPw, setNewUserPw] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');

  const [newDepthName, setNewDepthName] = useState('');

  const isAdmin = user?.role === 'admin';

  if (!isAdmin && !isReadOnly && user?.role !== 'user') {
    return <div className="p-4 text-center">접근 권한이 없습니다.</div>;
  }

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newMods = [...modules];
    const temp = newMods[index - 1];
    newMods[index - 1] = newMods[index];
    newMods[index] = temp;
    updateModules(newMods);
  };

  const handleMoveDown = (index) => {
    if (index === modules.length - 1) return;
    const newMods = [...modules];
    const temp = newMods[index + 1];
    newMods[index + 1] = newMods[index];
    newMods[index] = temp;
    updateModules(newMods);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (newModId.trim()) {
      addModule(newModId.trim().toUpperCase(), newModName.trim() || newModId.trim().toUpperCase());
      setNewModId('');
      setNewModName('');
    }
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (newUserId.trim() && newUserPw.trim()) {
      addAccount({
        id: newUserId.trim(),
        pw: newUserPw.trim(),
        role: newUserRole,
        name: newUserId.trim()
      });
      setNewUserId('');
      setNewUserPw('');
    }
  };

  const handleAddDepth = (e) => {
    e.preventDefault();
    if (newDepthName.trim()) {
      addDepthOption(newDepthName.trim());
      setNewDepthName('');
    }
  };

  const handleMoveUpDepth = (index) => {
    if (index === 0) return;
    const newList = [...depthOptions];
    const temp = newList[index - 1];
    newList[index - 1] = newList[index];
    newList[index] = temp;
    updateDepthOptions(newList);
  };

  const handleMoveDownDepth = (index) => {
    if (index === depthOptions.length - 1) return;
    const newList = [...depthOptions];
    const temp = newList[index + 1];
    newList[index + 1] = newList[index];
    newList[index] = temp;
    updateDepthOptions(newList);
  };

  return (
    <div className="settings-view animate-fade-in">
      <h2 className="page-title">환경설정</h2>
      
      <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card shadow-sm" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--primary)' }}>업무영역 메뉴 관리</h3>
        
        {!isReadOnly && isAdmin && (
          <form onSubmit={handleAdd} className="add-module-form-settings">
            <input 
              placeholder="모듈 ID (예: LOGIN)" 
              value={newModId} 
              onChange={e => setNewModId(e.target.value)} 
              required 
            />
            <input 
              placeholder="노출 이름 (예: 로그인)" 
              value={newModName} 
              onChange={e => setNewModName(e.target.value)} 
            />
            <button type="submit" className="btn btn-primary"><Plus size={16}/> 추가</button>
          </form>
        )}

        <ul className="module-sort-list">
          {modules.filter(mod => mod.id !== '공통TC' && mod.id !== 'ADMIN').map((mod) => {
            const realIdx = modules.findIndex(m => m.id === mod.id);
            return (
              <li key={mod.id} className="module-sort-item">
                <div className="module-info">
                  <strong>{mod.label}</strong> <span className="text-muted text-sm">({mod.id})</span>
                </div>
                <div className="module-actions">
                  {!isReadOnly && isAdmin && (
                    <>
                      <button className="btn-icon" onClick={() => handleMoveUp(realIdx)} disabled={realIdx <= 1}><ArrowUp size={16}/></button>
                      <button className="btn-icon" onClick={() => handleMoveDown(realIdx)} disabled={realIdx === modules.length - 1}><ArrowDown size={16}/></button>
                      <button className="btn-icon text-danger" onClick={() => deleteModule(mod.id)}>
                        <Trash2 size={16}/>
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {isAdmin && (
        <div className="card shadow-sm" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--primary)' }}>사용자 계정 관리</h3>
          {!isReadOnly && (
            <form onSubmit={handleAddUser} className="add-module-form-settings" style={{flexWrap: 'wrap'}}>
              <input 
                placeholder="아이디" 
                value={newUserId} 
                onChange={e => setNewUserId(e.target.value)} 
                required 
                style={{minWidth: '120px'}}
              />
              <input 
                placeholder="비밀번호" 
                type="password"
                value={newUserPw} 
                onChange={e => setNewUserPw(e.target.value)} 
                required 
                style={{minWidth: '120px'}}
              />
              <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} style={{padding: '8px', border: '1px solid var(--border)', borderRadius: '4px'}}>
                <option value="user">일반 사용자</option>
                <option value="admin">관리자</option>
                <option value="guest">게스트</option>
              </select>
              <button type="submit" className="btn btn-primary"><Plus size={16}/> 추가</button>
            </form>
          )}

          <ul className="module-sort-list">
            {accounts.map((acc) => (
              <li key={acc.id} className="module-sort-item" style={{flexDirection: 'column', alignItems: 'flex-start'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '8px'}}>
                  <div className="module-info">
                    <strong>{acc.id}</strong> <span className="text-muted text-sm">({acc.role === 'admin' ? '관리자' : acc.role === 'guest' ? '게스트' : '일반'})</span>
                  </div>
                  <div className="module-actions">
                    {!isReadOnly && acc.id !== 'admin' && (
                      <button className="btn-icon text-danger" onClick={() => deleteAccount(acc.id)}>
                        <Trash2 size={16}/>
                      </button>
                    )}
                  </div>
                </div>
                <div style={{display: 'flex', gap: '8px', width: '100%'}}>
                  {isAdmin && !isReadOnly ? (
                    <input 
                      type="text" 
                      value={acc.pw}
                      onChange={(e) => updateAccountPw(acc.id, e.target.value)}
                      style={{padding: '4px 8px', border: '1px solid var(--border)', fontSize: '12px'}}
                      placeholder="비밀번호 변경"
                    />
                  ) : (
                    <span className="text-muted text-sm">PW: ****</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card shadow-sm" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--primary)' }}>Depth 콤보박스 추천항목 관리</h3>
        <p className="text-muted text-sm" style={{marginBottom: '16px'}}>테스트 케이스 작성 시 Depth 입력란에 기본 제공되는 자동완성 목록입니다.</p>
        {!isReadOnly && (isAdmin || user?.role === 'user') && (
          <form onSubmit={handleAddDepth} className="add-module-form-settings" style={{flexWrap: 'wrap'}}>
            <input 
              placeholder="추가할 Depth 이름 (예: 리스트)" 
              value={newDepthName} 
              onChange={e => setNewDepthName(e.target.value)} 
              required 
              style={{flex: 1, minWidth: '200px'}}
            />
            <button type="submit" className="btn btn-primary"><Plus size={16}/> 항목 추가</button>
          </form>
        )}

        <ul className="module-sort-list" style={{ marginTop: '16px' }}>
          {depthOptions.map((opt, idx) => (
            <li key={opt} className="module-sort-item" style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
              <div className="module-info">
                <strong>{opt}</strong>
              </div>
              <div className="module-actions">
                {!isReadOnly && (isAdmin || user?.role === 'user') && (
                  <>
                    <button className="btn-icon" onClick={() => handleMoveUpDepth(idx)} disabled={idx === 0}><ArrowUp size={16}/></button>
                    <button className="btn-icon" onClick={() => handleMoveDownDepth(idx)} disabled={idx === depthOptions.length - 1}><ArrowDown size={16}/></button>
                    <button className="btn-icon text-danger" onClick={() => deleteDepthOption(opt)} title="삭제">
                      <Trash2 size={16}/>
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      </div>
    </div>
  );
}

export default SettingsView;
