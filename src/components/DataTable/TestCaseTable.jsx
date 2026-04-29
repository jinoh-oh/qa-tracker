import React, { useState, useContext } from 'react';
import './TestCaseTable.css';
import { Link } from 'react-router-dom';
import { FileEdit, Save, X, Trash2, CheckSquare, Copy } from 'lucide-react';
import { AppContext } from '../../context/AppContext';

function TestCaseTable({ data, onUpdate, onDelete, onBulkDelete, onCopy }) {
  const { depthOptions, isReadOnly } = useContext(AppContext);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'no', direction: 'desc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key || !data) return data;
    return [...data].sort((a, b) => {
      let aVal = a[sortConfig.key] ?? '';
      let bVal = b[sortConfig.key] ?? '';
      
      if (sortConfig.key === 'no') {
        const numA = Number(a.no) || 0;
        const numB = Number(b.no) || 0;
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
      }

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <span style={{opacity:0.3, fontSize:'10px', marginLeft:'4px'}}>↕</span>;
    return sortConfig.direction === 'asc' ? <span style={{fontSize:'10px', marginLeft:'4px'}}>▲</span> : <span style={{fontSize:'10px', marginLeft:'4px'}}>▼</span>;
  };

  const handleEditClick = (tc) => {
    setEditingId(tc.tc_id);
    setEditForm({ ...tc });
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
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(v => v !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(data.map(tc => tc.tc_id));
    else setSelectedIds([]);
  };

  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmBulkDelete(true);
  };

  const executeBulkDelete = () => {
    if (onBulkDelete) onBulkDelete(selectedIds);
    setSelectedIds([]);
    setConfirmBulkDelete(false);
  };

  const getPriorityBadge = (priority) => {
    if (priority === 'P1') return <span className="badge priority-p1">P1</span>;
    if (priority === 'P2') return <span className="badge priority-p2">P2</span>;
    if (priority === 'P3') return <span className="badge priority-p3">P3</span>;
    return <span className="badge">{priority}</span>;
  };

  const getResultBadge = (result) => {
    if (result === 'Pass') return <span className="badge result-pass">Pass</span>;
    if (result === 'Fail') return <span className="badge result-fail">Fail</span>;
    if (result === 'Blocked') return <span className="badge result-blocked">Blocked</span>;
    if (result === 'N/A') return <span className="badge result-na">N/A</span>;
    return <span>{result || '-'}</span>;
  };

  const allUniqueDepths = depthOptions || [];

  const DepthSelect = ({ value, onChange, name }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div style={{position:'relative'}} className="depth-combo-wrapper">
        <input 
          value={value || ''} 
          onChange={onChange}
          onClick={() => setIsOpen(true)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="edit-input w-80"
          placeholder="선택/입력"
        />
        <div 
          style={{position:'absolute', right:6, top:6, cursor:'pointer', color:'#a0aec0', fontSize:'10px'}} 
          onClick={() => setIsOpen(!isOpen)}
        >
          ▼
        </div>
        {isOpen && (
          <div style={{position:'absolute', top:'100%', left:0, width:'120%', background:'white', border:'1px solid var(--border)', zIndex:999, maxHeight:'200px', overflowY:'auto', boxShadow:'0 4px 6px rgba(0,0,0,0.1)', borderRadius:'4px', marginTop:'2px'}}>
             {allUniqueDepths.map(opt => (
               <div 
                 key={opt} 
                 style={{padding:'6px 12px', cursor:'pointer', borderBottom:'1px solid #f0f0f0', backgroundColor: opt === value ? '#ebf8ff' : 'white', fontSize:'13px'}} 
                 onMouseDown={(e) => { e.preventDefault(); onChange({target:{value: opt}}); setIsOpen(false); }}
                 onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f7fafc'}
                 onMouseLeave={e => e.currentTarget.style.backgroundColor = opt === value ? '#ebf8ff' : 'white'}
               >
                 {opt}
               </div>
             ))}
          </div>
        )}
      </div>
    );
  };

  const DepthBadge = ({ val }) => (
    val ? <span className="depth-badge">{val}</span> : <span>-</span>
  );

  if (!data || data.length === 0) {
    return <div className="no-data">해당 모듈의 등록된 TC가 없습니다.</div>;
  }

  return (
    <div className="table-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', margin: 0 }}>
      {selectedIds.length > 0 && (
        <div className="table-toolbar" style={{ flexShrink: 0 }}>
          <span className="selected-count">{selectedIds.length}개 선택됨</span>
          <button className="btn btn-outline btn-danger" onClick={handleBulkDelete}>
            <Trash2 size={16} style={{marginRight:'4px'}}/> 선택 삭제
          </button>
        </div>
      )}
      <div className={`table-wrapper ${isReadOnly ? 'is-readonly' : ''}`} style={{ flex: 1, overflow: 'auto' }}>
        <table className="tc-table">
          <thead>
            <tr>
              {!isReadOnly && (
                <th className="sticky-col checkbox-col">
                  <input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.length === data.length && data.length > 0} />
                </th>
              )}
              <th className="sticky-col no-col" onClick={() => handleSort('no')} style={{cursor:'pointer'}}>NO <SortIcon columnKey="no" /></th>
              <th className="sticky-col-tc tc-id-col" onClick={() => handleSort('tc_id')} style={{cursor:'pointer'}}>TC_ID <SortIcon columnKey="tc_id" /></th>
              <th onClick={() => handleSort('depth1')} style={{cursor:'pointer'}}>1 Depth <SortIcon columnKey="depth1" /></th>
              <th onClick={() => handleSort('depth2')} style={{cursor:'pointer'}}>2 Depth <SortIcon columnKey="depth2" /></th>
              <th onClick={() => handleSort('depth3')} style={{cursor:'pointer'}}>3 Depth <SortIcon columnKey="depth3" /></th>
              <th onClick={() => handleSort('depth4')} style={{cursor:'pointer'}}>4 Depth <SortIcon columnKey="depth4" /></th>
              <th onClick={() => handleSort('scenario')} style={{cursor:'pointer'}}>Test Scenario <SortIcon columnKey="scenario" /></th>
              <th onClick={() => handleSort('priority')} style={{cursor:'pointer'}}>Priority <SortIcon columnKey="priority" /></th>
              <th>Pre-condition</th>
              <th>Procedure</th>
              <th>Expected Result</th>
              <th onClick={() => handleSort('result')} style={{cursor:'pointer'}}>Result <SortIcon columnKey="result" /></th>
              <th>Comment</th>
              <th onClick={() => handleSort('tester')} style={{cursor:'pointer'}}>Tester <SortIcon columnKey="tester" /></th>
              <th onClick={() => handleSort('date')} style={{cursor:'pointer'}}>Test Date <SortIcon columnKey="date" /></th>
              <th onClick={() => handleSort('defect_id')} style={{cursor:'pointer'}}>Defect ID <SortIcon columnKey="defect_id" /></th>
              <th onClick={() => handleSort('type')} style={{cursor:'pointer'}}>TC Type <SortIcon columnKey="type" /></th>
              <th onClick={() => handleSort('common_tc_ref')} style={{cursor:'pointer'}}>공통TC 참조 <SortIcon columnKey="common_tc_ref" /></th>
              {!isReadOnly && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((tc, index) => (
              <tr key={tc.tc_id || index} className={selectedIds.includes(tc.tc_id) ? 'row-selected' : ''}>
                {!isReadOnly && (
                  <td className="sticky-col checkbox-col">
                    <input type="checkbox" checked={selectedIds.includes(tc.tc_id)} onChange={() => toggleSelect(tc.tc_id)} />
                  </td>
                )}
                <td className="sticky-col no-col">{tc.no}</td>
                
                {editingId === tc.tc_id ? (
                  <>
                    <td className="tc-id-col"><input type="text" value={editForm.tc_id} onChange={(e) => handleChange(e, 'tc_id')} className="edit-input" /></td>
                    <td><DepthSelect value={editForm.depth1} onChange={(e) => handleChange(e, 'depth1')} name={`d1-${tc.tc_id || ''}`} /></td>
                    <td><DepthSelect value={editForm.depth2} onChange={(e) => handleChange(e, 'depth2')} name={`d2-${tc.tc_id || ''}`} /></td>
                    <td><DepthSelect value={editForm.depth3} onChange={(e) => handleChange(e, 'depth3')} name={`d3-${tc.tc_id || ''}`} /></td>
                    <td><DepthSelect value={editForm.depth4} onChange={(e) => handleChange(e, 'depth4')} name={`d4-${tc.tc_id || ''}`} /></td>
                    <td><textarea value={editForm.scenario} onChange={(e) => handleChange(e, 'scenario')} className="edit-input expected-text" /></td>
                    <td>
                      <select value={editForm.priority} onChange={(e) => handleChange(e, 'priority')} className="edit-input w-80">
                        <option value="P1">P1</option><option value="P2">P2</option><option value="P3">P3</option>
                      </select>
                    </td>
                    <td><textarea value={editForm.precondition} onChange={(e) => handleChange(e, 'precondition')} className="edit-input expected-text" /></td>
                    <td><textarea value={editForm.procedure} onChange={(e) => handleChange(e, 'procedure')} className="edit-input expected-text" /></td>
                    <td><textarea value={editForm.expected} onChange={(e) => handleChange(e, 'expected')} className="edit-input expected-text" /></td>
                    <td>
                      <select value={editForm.result} onChange={(e) => handleChange(e, 'result')} className="edit-input w-80">
                        <option value="Pass">Pass</option><option value="Fail">Fail</option><option value="Blocked">Blocked</option><option value="N/A">N/A</option><option value="">-</option>
                      </select>
                    </td>
                    <td><textarea value={editForm.comment} onChange={(e) => handleChange(e, 'comment')} className="edit-input expected-text" /></td>
                    <td><input type="text" value={editForm.tester || ''} onChange={(e) => handleChange(e, 'tester')} className="edit-input w-80" /></td>
                    <td><input type="date" value={editForm.date || ''} onChange={(e) => handleChange(e, 'date')} className="edit-input" /></td>
                    <td><input type="text" value={editForm.defect_id || ''} onChange={(e) => handleChange(e, 'defect_id')} className="edit-input w-80" /></td>
                    <td>
                      <select value={editForm.type} onChange={(e) => handleChange(e, 'type')} className="edit-input w-80">
                        <option value="COM">COM</option><option value="BIZ">BIZ</option>
                      </select>
                    </td>
                    <td><input type="text" value={editForm.common_tc_ref || ''} onChange={(e) => handleChange(e, 'common_tc_ref')} className="edit-input w-80" /></td>
                    
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon save" onClick={handleSaveClick} title="Save"><Save size={16} /></button>
                        <button className="btn-icon cancel" onClick={handleCancelClick} title="Cancel"><X size={16} /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="tc-id-col fw-500">{tc.tc_id}</td>
                    <td><DepthBadge val={tc.depth1} /></td>
                    <td><DepthBadge val={tc.depth2} /></td>
                    <td><DepthBadge val={tc.depth3} /></td>
                    <td><DepthBadge val={tc.depth4} /></td>
                    <td className="min-w-200">{tc.scenario}</td>
                    <td>{getPriorityBadge(tc.priority)}</td>
                    <td className="pre-wrap min-w-150">{tc.precondition}</td>
                    <td className="pre-wrap min-w-250">{tc.procedure}</td>
                    <td className="pre-wrap min-w-250">{tc.expected}</td>
                    <td>{getResultBadge(tc.result)}</td>
                    <td className="pre-wrap min-w-150">{tc.comment}</td>
                    <td>{tc.tester}</td>
                    <td>{tc.date}</td>
                    <td>
                      {tc.defect_id ? (
                        <Link to={`/defects?defectId=${tc.defect_id}`} style={{ color: '#3182ce', textDecoration: 'underline', fontWeight: 500 }}>
                          {tc.defect_id}
                        </Link>
                      ) : (
                        ''
                      )}
                    </td>
                    <td>{tc.type}</td>
                    <td>{tc.common_tc_ref || '-'}</td>
                    {!isReadOnly && (
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon edit" onClick={() => handleEditClick(tc)} title="Edit"><FileEdit size={16} /></button>
                          {onCopy && <button className="btn-icon copy" style={{color: '#718096'}} onClick={() => onCopy(tc)} title="Copy"><Copy size={16} /></button>}
                          <button className="btn-icon trash" onClick={() => { if(window.confirm('삭제하시겠습니까?')) onDelete(tc.tc_id); }} title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmBulkDelete && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal-content" style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
             <h3 className="modal-title" style={{ marginTop: 0 }}>선택 삭제 확인</h3>
             <p>선택한 {selectedIds.length}개의 테스트 케이스를 영구적으로 삭제하시겠습니까?</p>
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

export default TestCaseTable;
