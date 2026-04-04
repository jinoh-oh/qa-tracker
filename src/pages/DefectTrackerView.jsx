import React, { useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DefectTable from '../components/DataTable/DefectTable';
import { AppContext } from '../context/AppContext';
import { Plus, Search } from 'lucide-react';
// Reusing some base CSS from TestCaseView if applicable, or inline styling.

function DefectTrackerView() {
  const { defectsData, addDefect, updateDefect, deleteDefect, bulkDeleteDefects } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const searchId = searchParams.get('defectId');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDfForm, setNewDfForm] = useState({
    defect_id: '', tc_id: '', title: '', procedure: '', as_is: '', to_be: '', 
    severity: 'Major', status: 'Open', reporter: '', date: '', comment: ''
  });

  const [filterText, setFilterText] = useState(searchId || '');

  useEffect(() => {
    if (searchId) {
      setFilterText(searchId);
    }
  }, [searchId]);

  const handleUpdate = (originalId, updatedDf) => {
    updateDefect(originalId, updatedDf);
  };

  const handleDelete = (dfId) => {
    deleteDefect(dfId);
  };

  const handleBulkDelete = (dfIds) => {
    bulkDeleteDefects(dfIds);
  };

  const handleCopy = (df) => {
    if (window.confirm(`[${df.defect_id}] 결함을 복제하시겠습니까?`)) {
      const baseId = df.defect_id.split('_COPY')[0];
      const existingCopies = defectsData.filter(item => item.defect_id && item.defect_id.startsWith(`${baseId}_COPY`));
      const copySuffix = existingCopies.length > 0 ? `_COPY_${existingCopies.length + 1}` : '_COPY_1';

      const copiedDf = {
        ...df,
        _uid: `UID-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        defect_id: `${baseId}${copySuffix}`,
        no: defectsData.length + 1,
        status: 'Open'
      };
      addDefect(copiedDf);
    }
  };

  const filteredData = defectsData.filter(df => 
    (df.defect_id && df.defect_id.toLowerCase().includes(filterText.toLowerCase())) ||
    (df.tc_id && df.tc_id.toLowerCase().includes(filterText.toLowerCase())) ||
    (df.title && df.title.toLowerCase().includes(filterText.toLowerCase()))
  );

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const defaultDfId = `DEF-NEW-${String(defectsData.length + 1).padStart(4, '0')}`;
    
    const newDf = {
      _uid: `UID-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      no: defectsData.length + 1,
      ...newDfForm,
      defect_id: newDfForm.defect_id || defaultDfId
    };

    addDefect(newDf);
    setIsModalOpen(false);
    setNewDfForm({ defect_id: '', tc_id: '', title: '', procedure: '', as_is: '', to_be: '', severity: 'Major', status: 'Open', reporter: '', date: '', comment: '' });
  };

  return (
    <div className="test-case-view animate-fade-in" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'var(--background)' }}>
      <div className="view-header" style={{ flexShrink: 0, paddingBottom: '16px' }}>
        <h2 className="view-title">Defect Tracker (결함 현황)</h2>
        <div className="view-actions">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', color: '#a0aec0' }} />
            <input 
              type="text" 
              placeholder="Defect ID, TC ID, Title 검색" 
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              style={{ padding: '8px 12px 8px 32px', borderRadius: '4px', border: '1px solid #cbd5e0', fontSize: '13px', width: '250px' }}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} style={{marginRight: '6px'}} /> 결함 신규 등록
          </button>
        </div>
      </div>

      <div className="card shadow-sm" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '16px' }}>
        <DefectTable 
          data={filteredData} 
          onUpdate={handleUpdate} 
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          onCopy={handleCopy}
        />
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-lg">
            <h3 className="modal-title">결함 잇슈 등록</h3>
            <form onSubmit={handleAddSubmit}>
              <div className="form-grid">
                <div className="form-group"><label>Defect ID</label><input type="text" value={newDfForm.defect_id} onChange={e => setNewDfForm({...newDfForm, defect_id: e.target.value})} placeholder="DEF-모듈-0001 (미입력시 자동생성)" /></div>
                <div className="form-group"><label>TC ID (연관)</label><input type="text" value={newDfForm.tc_id} onChange={e => setNewDfForm({...newDfForm, tc_id: e.target.value})} /></div>
                <div className="form-group"><label>발견자 (Reporter)</label><input type="text" value={newDfForm.reporter} onChange={e => setNewDfForm({...newDfForm, reporter: e.target.value})} /></div>
                <div className="form-group"><label>발견일 (Date)</label><input type="date" value={newDfForm.date} onChange={e => setNewDfForm({...newDfForm, date: e.target.value})} /></div>
                <div className="form-group"><label>Severity (심각도)</label>
                  <select value={newDfForm.severity} onChange={e => setNewDfForm({...newDfForm, severity: e.target.value})}>
                    <option value="Blocker">Blocker</option><option value="Critical">Critical</option><option value="Major">Major</option><option value="Minor">Minor</option>
                  </select>
                </div>
                <div className="form-group"><label>Status (상태)</label>
                  <select value={newDfForm.status} onChange={e => setNewDfForm({...newDfForm, status: e.target.value})}>
                    <option value="Open">Open</option><option value="In Progress">In Progress</option><option value="Resolved">Resolved</option><option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label>결함 제목 (Title)</label><input type="text" value={newDfForm.title} onChange={e => setNewDfForm({...newDfForm, title: e.target.value})} required /></div>
              <div className="form-group"><label>재현 절차 (Procedure)</label><textarea rows="3" value={newDfForm.procedure} onChange={e => setNewDfForm({...newDfForm, procedure: e.target.value})} required></textarea></div>
              <div className="form-group"><label>현재 현상 (AS_IS)</label><textarea rows="3" value={newDfForm.as_is} onChange={e => setNewDfForm({...newDfForm, as_is: e.target.value})} required></textarea></div>
              <div className="form-group"><label>기대 결과 (TO_BE)</label><textarea rows="3" value={newDfForm.to_be} onChange={e => setNewDfForm({...newDfForm, to_be: e.target.value})} required></textarea></div>
              <div className="form-group"><label>코멘트 (Comment)</label><textarea rows="2" value={newDfForm.comment} onChange={e => setNewDfForm({...newDfForm, comment: e.target.value})}></textarea></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>취소</button>
                <button type="submit" className="btn btn-primary">등록하기</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DefectTrackerView;
