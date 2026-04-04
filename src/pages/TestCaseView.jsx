import React, { useContext, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import TestCaseTable from '../components/DataTable/TestCaseTable';
import { AppContext } from '../context/AppContext';
import * as xlsx from 'xlsx';
import { saveAs } from 'file-saver';
import { Download, Upload, FileOutput, Plus } from 'lucide-react';
import './TestCaseView.css';

function TestCaseView() {
  const { moduleName } = useParams();
  const { testCasesData, updateTestCase, addTestCase, deleteTestCase, bulkDeleteTestCases, appendTestCasesFromExcel } = useContext(AppContext);
  const fileInputRef = useRef(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTcForm, setNewTcForm] = useState({
    tc_id: '', depth1: '', depth2: '', depth3: '', depth4: '', 
    scenario: '', priority: 'P2', precondition: '', procedure: '', 
    expected: '', comment: '', result: 'N/A', tester: '', date: '', type: 'BIZ', defect_id: ''
  });

  const data = testCasesData[moduleName] || [];

  const handleUpdate = (originalId, updatedTc) => {
    updateTestCase(moduleName, originalId, updatedTc);
  };

  const handleDelete = (tcId) => {
    deleteTestCase(moduleName, tcId);
  };

  const handleBulkDelete = (tcIds) => {
    bulkDeleteTestCases(moduleName, tcIds);
  };

  const handleCopy = (tc) => {
    if (window.confirm(`[${tc.tc_id}] 케이스를 복제하시겠습니까?`)) {
      const baseId = tc.tc_id.split('_COPY')[0];
      const existingCopies = data.filter(item => item.tc_id && item.tc_id.startsWith(`${baseId}_COPY`));
      const copySuffix = existingCopies.length > 0 ? `_COPY_${existingCopies.length + 1}` : '_COPY_1';

      const copiedTc = {
        ...tc,
        tc_id: `${baseId}${copySuffix}`,
        no: data.length + 1
      };
      addTestCase(moduleName, copiedTc);
    }
  };

  const COLUMNS = [
    'NO', 'TC_ID', '1 Depth', '2 Depth', '3 Depth', '4 Depth', 'Test Scenario',
    'Priority', 'Pre-condition', 'Procedure', 'Expected Result', 'Comment',
    'Result', 'Tester', 'Test Date', 'TC Type', 'Defect ID'
  ];

  const downloadNative = async (wb, filename) => {
    try {
      if (window.showSaveFilePicker) {
        const excelBuffer = xlsx.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'Excel File',
            accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
          }]
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
        xlsx.writeFile(wb, filename);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        alert("다운로드 중 오류가 발생했습니다: " + err.message);
      }
    }
  };

  const handleDownloadSample = () => {
    const ws = xlsx.utils.aoa_to_sheet([COLUMNS]);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Sample");
    downloadNative(wb, 'QMS_Sample_Format.xlsx');
  };

  const handleExportExcel = () => {
    let ws;
    if (data && data.length > 0) {
      const exportData = data.map(tc => ({
        'NO': tc.no,
        'TC_ID': tc.tc_id,
        '1 Depth': tc.depth1,
        '2 Depth': tc.depth2,
        '3 Depth': tc.depth3,
        '4 Depth': tc.depth4,
        'Test Scenario': tc.scenario,
        'Priority': tc.priority,
        'Pre-condition': tc.precondition,
        'Procedure': tc.procedure,
        'Expected Result': tc.expected,
        'Comment': tc.comment,
        'Result': tc.result,
        'Tester': tc.tester,
        'Test Date': tc.date,
        'TC Type': tc.type,
        'Defect ID': tc.defect_id
      }));
      ws = xlsx.utils.json_to_sheet(exportData);
    } else {
      // 데이터가 없어도 헤더는 무조건 유지시켜 빈 시트가 노출되지 않도록 방어
      ws = xlsx.utils.aoa_to_sheet([COLUMNS]);
    }
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "TestCases");
    downloadNative(wb, 'QMS_TestCases_View.xlsx');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = xlsx.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const result = xlsx.utils.sheet_to_json(ws);

      if (result.length > 0) {
        const mappedData = result.map((row, idx) => ({
          no: data.length + idx + 1,
          tc_id: row['TC_ID'] || `TC-${moduleName}-${Date.now()}-${idx}`,
          depth1: row['1 Depth'] || moduleName,
          depth2: row['2 Depth'] || '',
          depth3: row['3 Depth'] || '',
          depth4: row['4 Depth'] || '',
          scenario: row['Test Scenario'] || '',
          priority: row['Priority'] || 'P2',
          precondition: row['Pre-condition'] || '',
          procedure: row['Procedure'] || '',
          expected: row['Expected Result'] || '',
          comment: row['Comment'] || '',
          result: row['Result'] || 'N/A',
          tester: row['Tester'] || '',
          date: row['Test Date'] || '',
          type: row['TC Type'] || 'BIZ',
          defect_id: row['Defect ID'] || ''
        }));
        appendTestCasesFromExcel(moduleName, mappedData);
        alert(`${mappedData.length}개의 테스트 케이스가 성공적으로 추가되었습니다.`);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const isCommon = moduleName === '공통TC' || moduleName === '공통';
    const typePrefix = isCommon ? 'COM' : 'BIZ';
    const numStr = String(data.length + 1).padStart(4, '0');
    const defaultTcId = `TC-${typePrefix}-${moduleName}-${numStr}`;

    const newTc = {
      no: data.length + 1,
      ...newTcForm,
      tc_id: isCommon ? newTcForm.tc_id : (newTcForm.tc_id || defaultTcId)
    };

    if (isCommon && !newTcForm.tc_id) {
      alert("공통TC의 경우 TC_ID를 반드시 직접 입력해야 합니다.");
      return;
    }

    addTestCase(moduleName, newTc);
    setIsModalOpen(false);
    setNewTcForm({ tc_id: '', depth1: '', depth2: '', depth3: '', depth4: '', scenario: '', priority: 'P2', precondition: '', procedure: '', expected: '', comment: '', result: 'N/A', tester: '', date: '', type: 'BIZ', defect_id: '' });
  };

  return (
    <div className="test-case-view animate-fade-in" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'var(--background)' }}>
      <div className="view-header" style={{ flexShrink: 0, paddingBottom: '16px' }}>
        <h2 className="view-title">{moduleName} 테스트 케이스</h2>
        <div className="view-actions">
          <button className="btn btn-outline" onClick={handleDownloadSample} title="샘플 양식 다운로드">
            <Download size={16} style={{marginRight: '6px'}} /> 양식 다운로드
          </button>
          <button className="btn btn-outline" onClick={handleExportExcel} title="엑셀 내보내기">
            <FileOutput size={16} style={{marginRight: '6px'}} /> 내보내기
          </button>

          <input 
            type="file" 
            accept=".xlsx, .xls" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
            id="excel-upload"
          />
          <label htmlFor="excel-upload" className="btn btn-outline btn-upload" title="엑셀 업로드">
            <Upload size={16} style={{marginRight: '6px'}} /> 업로드
          </label>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} style={{marginRight: '6px'}} /> 새 케이스 추가
          </button>
        </div>
      </div>

      <div className="card shadow-sm" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '16px' }}>
        <TestCaseTable 
          data={data} 
          onUpdate={handleUpdate} 
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          onCopy={handleCopy}
          key={moduleName} 
        />
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-lg">
            <h3 className="modal-title">새 테스트 케이스 추가</h3>
            <form onSubmit={handleAddSubmit}>
              <div className="form-grid">
                <div className="form-group"><label>TC ID</label><input type="text" value={newTcForm.tc_id} onChange={e => setNewTcForm({...newTcForm, tc_id: e.target.value})} placeholder="미입력시 자동생성" /></div>
                <div className="form-group"><label>TC Type</label>
                  <select value={newTcForm.type} onChange={e => setNewTcForm({...newTcForm, type: e.target.value})}>
                    <option value="BIZ">BIZ</option><option value="COM">COM</option>
                  </select>
                </div>
                <div className="form-group"><label>1 Depth</label><input type="text" value={newTcForm.depth1} onChange={e => setNewTcForm({...newTcForm, depth1: e.target.value})} /></div>
                <div className="form-group"><label>2 Depth</label><input type="text" value={newTcForm.depth2} onChange={e => setNewTcForm({...newTcForm, depth2: e.target.value})} /></div>
                <div className="form-group"><label>3 Depth</label><input type="text" value={newTcForm.depth3} onChange={e => setNewTcForm({...newTcForm, depth3: e.target.value})} /></div>
                <div className="form-group"><label>4 Depth</label><input type="text" value={newTcForm.depth4} onChange={e => setNewTcForm({...newTcForm, depth4: e.target.value})} /></div>
                <div className="form-group"><label>Test Scenario</label><input type="text" value={newTcForm.scenario} onChange={e => setNewTcForm({...newTcForm, scenario: e.target.value})} required /></div>
                <div className="form-group"><label>Priority</label>
                  <select value={newTcForm.priority} onChange={e => setNewTcForm({...newTcForm, priority: e.target.value})}>
                    <option value="P1">P1</option><option value="P2">P2</option><option value="P3">P3</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Pre-condition</label><textarea rows="2" value={newTcForm.precondition} onChange={e => setNewTcForm({...newTcForm, precondition: e.target.value})}></textarea></div>
              <div className="form-group"><label>Procedure</label><textarea rows="3" value={newTcForm.procedure} onChange={e => setNewTcForm({...newTcForm, procedure: e.target.value})}></textarea></div>
              <div className="form-group"><label>Expected Result</label><textarea rows="3" value={newTcForm.expected} onChange={e => setNewTcForm({...newTcForm, expected: e.target.value})} required></textarea></div>
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

export default TestCaseView;
