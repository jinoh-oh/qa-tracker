import React, { useState, useContext } from 'react';
import './DefectTable.css';
import { FileEdit, Save, X, Trash2, Copy } from 'lucide-react';
import { AppContext } from '../../context/AppContext';

function DefectTable({ data, onUpdate, onDelete, onBulkDelete, onCopy }) {
  const { isReadOnly } = useContext(AppContext);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const handleEditClick = (df) => {
    const uid = df._uid || df.defect_id;
    setEditingId(uid);
    setEditForm({ ...df });
  };

  const handleCancelClick = () => {
    setEditingId(null);
  };

  const handleSaveClick = () => {
    if (onUpdate) onUpdate(editingId, editForm);
    setEditingId(null);
  };

  const handleChange = (e, field) => {
    setEditForm({ ...editForm, [field]: e.target.value });
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(v => v !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(data.map(df => df._uid || df.defect_id));
    else setSelectedIds([]);
  };

  const handleBulkDeleteBtn = () => {
    if (selectedIds.length === 0) return;
    setConfirmBulkDelete(true);
  };

  const executeBulkDelete = () => {
    if (onBulkDelete) onBulkDelete(selectedIds);
    setSelectedIds([]);
    setConfirmBulkDelete(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open': return <span className="df-badge df-status-open">Open</span>;
      case 'In Progress': return <span className="df-badge df-status-progress">In Progress</span>;
      case 'Resolved': return <span className="df-badge df-status-resolved">Resolved</span>;
      case 'Closed': return <span className="df-badge df-status-closed">Closed</span>;
      default: return <span className="df-badge">{status || '-'}</span>;
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'Blocker': return <span className="df-badge df-sev-blocker">Blocker</span>;
      case 'Critical': return <span className="df-badge df-sev-critical">Critical</span>;
      case 'Major': return <span className="df-badge df-sev-major">Major</span>;
      case 'Minor': return <span className="df-badge df-sev-minor">Minor</span>;
      default: return <span className="df-badge">{sev || '-'}</span>;
    }
  };

  if (!data || data.length === 0) {
    return <div className="df-no-data">등록된 결함이 없습니다.</div>;
  }

  return (
    <div className="defect-table-container">
      {selectedIds.length > 0 && (
        <div className="defect-toolbar">
          <span className="defect-count">{selectedIds.length}개 선택됨</span>
          <button className="btn btn-outline btn-danger" onClick={handleBulkDeleteBtn}>
            <Trash2 size={16} style={{marginRight:'4px'}}/> 선택 삭제
          </button>
        </div>
      )}
      <div className="defect-wrapper">
        <table className="df-table">
          <thead>
            <tr>
              {!isReadOnly && (
                <th className="df-sticky-col df-checkbox-col">
                  <input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.length === data.length && data.length > 0} />
                </th>
              )}
              <th className="df-sticky-col">NO</th>
              <th className="df-sticky-id">Defect_ID</th>
              <th>TC_ID</th>
              <th>Title</th>
              <th>Procedure</th>
              <th>AS_IS</th>
              <th>TO_BE</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Reporter</th>
              <th>Date</th>
              <th>Comment</th>
              {!isReadOnly && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((df, index) => {
              const uid = df._uid || df.defect_id;
              const isEditing = editingId === uid;
              const isSelected = selectedIds.includes(uid);
              return (
              <tr key={uid || index} className={isSelected ? 'row-selected' : ''}>
                {!isReadOnly && (
                  <td className="df-sticky-col df-checkbox-col">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(uid)} />
                  </td>
                )}
                <td className="df-sticky-col">{index + 1}</td>
                
                {isEditing ? (
                  <>
                    <td className="df-sticky-id"><input type="text" value={editForm.defect_id} onChange={e => handleChange(e, 'defect_id')} className="edit-input" /></td>
                    <td><input type="text" value={editForm.tc_id} onChange={e => handleChange(e, 'tc_id')} className="edit-input df-w-120" /></td>
                    <td><input type="text" value={editForm.title} onChange={e => handleChange(e, 'title')} className="edit-input df-min-150" /></td>
                    <td><textarea value={editForm.procedure} onChange={e => handleChange(e, 'procedure')} className="edit-input expected-text df-min-200" /></td>
                    <td><textarea value={editForm.as_is} onChange={e => handleChange(e, 'as_is')} className="edit-input expected-text df-min-200" /></td>
                    <td><textarea value={editForm.to_be} onChange={e => handleChange(e, 'to_be')} className="edit-input expected-text df-min-200" /></td>
                    <td>
                      <select value={editForm.severity} onChange={e => handleChange(e, 'severity')} className="edit-input df-w-100">
                        <option value="Blocker">Blocker</option><option value="Critical">Critical</option><option value="Major">Major</option><option value="Minor">Minor</option>
                      </select>
                    </td>
                    <td>
                      <select value={editForm.status} onChange={e => handleChange(e, 'status')} className="edit-input df-w-100">
                        <option value="Open">Open</option><option value="In Progress">In Progress</option><option value="Resolved">Resolved</option><option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td><input type="text" value={editForm.reporter} onChange={e => handleChange(e, 'reporter')} className="edit-input df-w-100" /></td>
                    <td><input type="date" value={editForm.date} onChange={e => handleChange(e, 'date')} className="edit-input" /></td>
                    <td><textarea value={editForm.comment} onChange={e => handleChange(e, 'comment')} className="edit-input expected-text df-min-150" /></td>
                    {!isReadOnly && (
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon save" onClick={handleSaveClick} title="Save"><Save size={16} /></button>
                          <button className="btn-icon cancel" onClick={handleCancelClick} title="Cancel"><X size={16} /></button>
                        </div>
                      </td>
                    )}
                  </>
                ) : (
                  <>
                    <td className="df-sticky-id">{df.defect_id}</td>
                    <td>{df.tc_id}</td>
                    <td className="df-min-150 df-pre-wrap">{df.title}</td>
                    <td className="df-min-200 df-pre-wrap">{df.procedure}</td>
                    <td className="df-min-200 df-pre-wrap">{df.as_is}</td>
                    <td className="df-min-200 df-pre-wrap">{df.to_be}</td>
                    <td>{getSeverityBadge(df.severity)}</td>
                    <td>{getStatusBadge(df.status)}</td>
                    <td>{df.reporter}</td>
                    <td>{df.date}</td>
                    <td className="df-min-150 df-pre-wrap">{df.comment}</td>
                    {!isReadOnly && (
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon edit" onClick={() => handleEditClick(df)} title="Edit"><FileEdit size={16} /></button>
                          {onCopy && <button className="btn-icon copy" style={{color: '#718096'}} onClick={() => onCopy(df)} title="Copy"><Copy size={16} /></button>}
                          <button className="btn-icon trash" onClick={() => { if(window.confirm('결함을 삭제하시겠습니까?')) onDelete(df.defect_id); }} title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    )}
                  </>
                )}
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {confirmBulkDelete && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal-content" style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
             <h3 className="modal-title" style={{ marginTop: 0 }}>선택 결함 삭제 확인</h3>
             <p>선택한 {selectedIds.length}개의 결함 항목을 완전히 지우시겠습니까?</p>
             <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
               <button className="btn btn-outline" onClick={() => setConfirmBulkDelete(false)}>취소</button>
               <button className="btn btn-primary" style={{ backgroundColor: '#e53e3e', borderColor: '#e53e3e' }} onClick={executeBulkDelete}>삭제하기</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DefectTable;
