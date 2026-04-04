import React, { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import './DynamicTable.css';

const DEFAULT_COLS = [
  '업무영역', '리스트 입력창수', '리스트 선택버튼수', '리스트 선택항목수',
  '리스트 검색방식', '초기화버튼', '상세검색 날짜필드수', '상세 INFO 사용', '비고'
];

const DEFAULT_ROWS = [
  { id: '1', data: { '업무영역': 'JEONSE', '리스트 입력창수': '3', '리스트 선택버튼수': '3' } },
  { id: '2', data: { '업무영역': 'IJEONSE', '리스트 입력창수': '1' } }
];

function DynamicTable() {
  const [columns, setColumns] = useState(DEFAULT_COLS);
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');

  const addColumn = () => {
    const newColName = '새 항목 ' + (columns.length + 1);
    if (!columns.includes(newColName)) {
      setColumns([...columns, newColName]);
    }
  };

  const removeColumn = (colName) => {
    setColumns(columns.filter(c => c !== colName));
  };

  const addRow = () => {
    setRows([...rows, { id: Date.now().toString(), data: {} }]);
  };

  const removeRow = (id) => {
    setRows(rows.filter(r => r.id !== id));
  };

  const startEdit = (rowId, colName, value) => {
    setEditingCell({ rowId, colName });
    setEditValue(value || '');
  };

  const saveEdit = () => {
    if (editingCell) {
      setRows(rows.map(r => {
        if (r.id === editingCell.rowId) {
          return { ...r, data: { ...r.data, [editingCell.colName]: editValue } };
        }
        return r;
      }));
      setEditingCell(null);
    }
  };

  return (
    <div className="dynamic-table-container">
      <div className="dt-actions">
        <button className="btn btn-outline" onClick={addColumn}><Plus size={16}/> 열 추가</button>
        <button className="btn btn-primary" onClick={addRow}><Plus size={16}/> 행 추가</button>
      </div>
      <div className="dt-wrapper">
        <table className="dt-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col}>
                  <div className="th-content">
                    <span 
                      style={{cursor: 'text'}}
                      onClick={(e) => {
                        const newName = window.prompt('항목 이름 수정:', col);
                        if (newName && newName !== col && !columns.includes(newName)) {
                          setColumns(columns.map(c => c === col ? newName : c));
                          // Rename in all rows
                          setRows(rows.map(r => {
                            const newData = { ...r.data };
                            newData[newName] = newData[col];
                            delete newData[col];
                            return { ...r, data: newData };
                          }));
                        }
                      }}
                    >
                      {col}
                    </span>
                    <button className="btn-icon danger-icon" onClick={() => removeColumn(col)} title="열 삭제"><Trash2 size={12}/></button>
                  </div>
                </th>
              ))}
              <th style={{ width: '50px' }}>삭제</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {columns.map(col => {
                  const isEditing = editingCell?.rowId === row.id && editingCell?.colName === col;
                  return (
                    <td key={col} 
                        onClick={() => { if(!isEditing) startEdit(row.id, col, row.data[col]); }}
                        className={isEditing ? 'editing-td' : ''}>
                      {isEditing ? (
                        <div className="edit-cell-wrapper">
                          <input 
                            autoFocus
                            value={editValue} 
                            onChange={e => setEditValue(e.target.value)} 
                            onBlur={saveEdit}
                            onKeyDown={e => { if (e.key === 'Enter') saveEdit(); }}
                          />
                        </div>
                      ) : (
                        <span>{row.data[col] || ''}</span>
                      )}
                    </td>
                  );
                })}
                <td className="action-td">
                  <button className="btn-icon danger-icon" onClick={() => removeRow(row.id)}><Trash2 size={14}/></button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="text-center text-muted" style={{padding: '30px'}}>데이터가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DynamicTable;
