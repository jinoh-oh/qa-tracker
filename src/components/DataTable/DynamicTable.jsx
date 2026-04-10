import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import './DynamicTable.css';

const DEFAULT_COLS = [
  '업무영역', '리스트 입력창수', '리스트 선택버튼수', '리스트 선택항목수',
  '리스트 검색방식', '초기화버튼', '상세검색 날짜필드수', '상세 INFO 사용', '비고'
];

function DynamicTable({ columns: initialColumns, rows: initialRows, onDataChange, isReadOnly }) {
  // Use props if provided, otherwise fallback to defaults or empty
  const [columns, setColumns] = useState(() => (initialColumns && initialColumns.length > 0) ? initialColumns : DEFAULT_COLS);
  const [rows, setRows] = useState(() => (initialRows && initialRows.length > 0) ? initialRows : []);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Update internal state if props change (e.g. initial load from server)
  useEffect(() => {
    if (initialColumns && initialColumns.length > 0) {
      setColumns(initialColumns);
    }
    if (initialRows) {
      setRows(initialRows);
    }
  }, [initialColumns, initialRows]);

  // Trigger parent update whenever local data changes
  const notifyChange = (newCols, newRows) => {
    if (onDataChange) {
      onDataChange({ columns: newCols, rows: newRows });
    }
  };

  const addColumn = () => {
    const newColName = '새 항목 ' + (columns.length + 1);
    if (!columns.includes(newColName)) {
      const newCols = [...columns, newColName];
      setColumns(newCols);
      notifyChange(newCols, rows);
    }
  };

  const removeColumn = (colName) => {
    const newCols = columns.filter(c => c !== colName);
    setColumns(newCols);
    notifyChange(newCols, rows);
  };

  const addRow = () => {
    const newRows = [...rows, { id: Date.now().toString(), data: {} }];
    setRows(newRows);
    notifyChange(columns, newRows);
  };

  const removeRow = (id) => {
    const newRows = rows.filter(r => r.id !== id);
    setRows(newRows);
    notifyChange(columns, newRows);
  };

  const startEdit = (rowId, colName, value) => {
    setEditingCell({ rowId, colName });
    setEditValue(value || '');
  };

  const saveEdit = () => {
    if (editingCell) {
      const newRows = rows.map(r => {
        if (r.id === editingCell.rowId) {
          return { ...r, data: { ...r.data, [editingCell.colName]: editValue } };
        }
        return r;
      });
      setRows(newRows);
      notifyChange(columns, newRows);
      setEditingCell(null);
    }
  };

  const handleRenameColumn = (col) => {
    const newName = window.prompt('항목 이름 수정:', col);
    if (newName && newName !== col && !columns.includes(newName)) {
      const newCols = columns.map(c => c === col ? newName : c);
      const newRows = rows.map(r => {
        const newData = { ...r.data };
        newData[newName] = newData[col];
        delete newData[col];
        return { ...r, data: newData };
      });
      setColumns(newCols);
      setRows(newRows);
      notifyChange(newCols, newRows);
    }
  };

  return (
    <div className="dynamic-table-container">
      {!isReadOnly && (
        <div className="dt-actions">
          <button className="btn btn-outline" onClick={addColumn}><Plus size={16}/> 열 추가</button>
          <button className="btn btn-primary" onClick={addRow}><Plus size={16}/> 행 추가</button>
        </div>
      )}
      <div className="dt-wrapper">
        <table className="dt-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col}>
                  <div className="th-content">
                    <span 
                      style={{cursor: isReadOnly ? 'default' : 'text'}}
                      onClick={() => !isReadOnly && handleRenameColumn(col)}
                    >
                      {col}
                    </span>
                    {!isReadOnly && <button className="btn-icon danger-icon" onClick={() => removeColumn(col)} title="열 삭제"><Trash2 size={12}/></button>}
                  </div>
                </th>
              ))}
              {!isReadOnly && <th style={{ width: '50px' }}>삭제</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {columns.map(col => {
                  const isEditing = editingCell?.rowId === row.id && editingCell?.colName === col;
                  return (
                    <td key={col} 
                        onClick={() => { if(!isReadOnly && !isEditing) startEdit(row.id, col, row.data[col]); }}
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
                {!isReadOnly && (
                  <td className="action-td">
                    <button className="btn-icon danger-icon" onClick={() => removeRow(row.id)}><Trash2 size={14}/></button>
                  </td>
                )}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + (isReadOnly ? 0 : 1)} className="text-center text-muted" style={{padding: '30px'}}>데이터가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DynamicTable;
