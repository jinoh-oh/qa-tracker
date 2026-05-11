import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { FileOutput } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as xlsx from 'xlsx';
import { Link } from 'react-router-dom';
import '../components/DataTable/TestCaseTable.css';
import './TestCaseView.css';

function RoundComparisonView() {
  const { testCasesData, modules } = useContext(AppContext);
  const EXCLUDED_MODULES = ['SCREEN_RULE', 'Reference'];
  const validModules = modules.filter(m => !EXCLUDED_MODULES.includes(m.id));
  
  const [selectedModule, setSelectedModule] = useState(validModules.length > 0 ? validModules[0].id : '');
  const [selectedDepth, setSelectedDepth] = useState('전체');

  // Extract all rounds, unique TCs, and unique Depths for the selected module
  const { availableRounds, allTCs, availableDepths } = useMemo(() => {
    if (!selectedModule || !testCasesData[selectedModule]) {
      return { availableRounds: [], allTCs: [], availableDepths: [] };
    }

    const moduleData = testCasesData[selectedModule];
    const rounds = Object.keys(moduleData).map(Number).sort((a, b) => a - b);
    
    const tcMap = new Map();
    const depths = new Set(['전체']);
    
    rounds.forEach(round => {
      const tcs = moduleData[round] || [];
      tcs.forEach(tc => {
        if (tc.depth1) depths.add(tc.depth1);
        if (!tcMap.has(tc.tc_id)) {
          tcMap.set(tc.tc_id, {
            tc_id: tc.tc_id,
            depth1: tc.depth1,
            scenario: tc.scenario,
            resultsByRound: {}
          });
        }
        const entry = tcMap.get(tc.tc_id);
        entry.resultsByRound[round] = {
          result: tc.result,
          defect_id: tc.defect_id,
          comment: tc.comment
        };
      });
    });

    return { 
      availableRounds: rounds, 
      allTCs: Array.from(tcMap.values()),
      availableDepths: Array.from(depths).sort((a, b) => {
        if (a === '전체') return -1;
        if (b === '전체') return 1;
        return a.localeCompare(b);
      })
    };
  }, [selectedModule, testCasesData]);

  const uniqueTCs = useMemo(() => {
    if (selectedDepth === '전체') return allTCs;
    return allTCs.filter(tc => tc.depth1 === selectedDepth);
  }, [allTCs, selectedDepth]);

  const chartData = useMemo(() => {
    return availableRounds.map(round => {
      let pass = 0, fail = 0, na = 0, blocked = 0, defects = 0;
      uniqueTCs.forEach(tc => {
        const rData = tc.resultsByRound[round];
        if (rData) {
          if (rData.result === 'Pass') pass++;
          else if (rData.result === 'Fail') fail++;
          else if (rData.result === 'N/A') na++;
          else if (rData.result === 'Blocked') blocked++;
          
          if (rData.defect_id) defects++;
        }
      });
      const total = pass + fail + na + blocked;
      const passRate = total > 0 ? ((pass / total) * 100).toFixed(1) : 0;
      return {
        name: `${round}차`,
        Pass: pass,
        Fail: fail,
        'N/A': na,
        Blocked: blocked,
        Defects: defects,
        PassRate: Number(passRate)
      };
    });
  }, [availableRounds, uniqueTCs]);

  // Badge helpers
  const getResultBadge = (result) => {
    switch (result) {
      case 'Pass': return <span className="tc-badge tc-status-pass">Pass</span>;
      case 'Fail': return <span className="tc-badge tc-status-fail">Fail</span>;
      case 'N/A': return <span className="tc-badge tc-status-na">N/A</span>;
      case 'Blocked': return <span className="tc-badge tc-status-blocked">Blocked</span>;
      default: return <span className="tc-badge tc-status-na">{result || 'N/A'}</span>;
    }
  };

  const handleExportExcel = () => {
    if (uniqueTCs.length === 0) return;

    // Build Headers
    const headers = ['TC_ID', '1 Depth', 'Scenario'];
    availableRounds.forEach(r => {
      headers.push(`${r}차 Result`);
      headers.push(`${r}차 Defect`);
      headers.push(`${r}차 Comment`);
    });

    // Build Data
    const exportData = uniqueTCs.map(tc => {
      const row = {
        'TC_ID': tc.tc_id,
        '1 Depth': tc.depth1,
        'Scenario': tc.scenario
      };
      availableRounds.forEach(r => {
        const rData = tc.resultsByRound[r];
        row[`${r}차 Result`] = rData ? rData.result : '-';
        row[`${r}차 Defect`] = rData ? rData.defect_id : '';
        row[`${r}차 Comment`] = rData ? rData.comment : '';
      });
      return row;
    });

    const ws = xlsx.utils.json_to_sheet(exportData, { header: headers });
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Comparison");
    
    // Trigger download
    try {
      if (window.showSaveFilePicker) {
        // Native Download logic similar to TestCaseView
        const excelBuffer = xlsx.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        window.showSaveFilePicker({
          suggestedName: `QMS_Comparison_${selectedModule}.xlsx`,
          types: [{ description: 'Excel File', accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] } }]
        }).then(handle => handle.createWritable()).then(writable => {
          writable.write(blob).then(() => writable.close());
        }).catch(e => { if(e.name !== 'AbortError') console.error(e) });
      } else {
        xlsx.writeFile(wb, `QMS_Comparison_${selectedModule}.xlsx`);
      }
    } catch (e) {
      console.error(e);
      xlsx.writeFile(wb, `QMS_Comparison_${selectedModule}.xlsx`);
    }
  };

  return (
    <div className="test-case-view animate-fade-in" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'var(--background)' }}>
      <div className="view-header" style={{ flexShrink: 0, paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 className="view-title" style={{ margin: 0 }}>차수별 결과 비교</h2>
          <select 
            value={selectedModule} 
            onChange={(e) => {
              setSelectedModule(e.target.value);
              setSelectedDepth('전체');
            }}
            className="select-module"
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '15px', fontWeight: 'bold', outline: 'none', cursor: 'pointer', backgroundColor: '#fff', minWidth: '150px' }}
          >
            {validModules.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>

          <select 
            value={selectedDepth} 
            onChange={(e) => setSelectedDepth(e.target.value)}
            className="select-depth"
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', cursor: 'pointer', backgroundColor: '#fff', minWidth: '150px' }}
          >
            {availableDepths.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        
        <button className="btn btn-outline" onClick={handleExportExcel}>
          <FileOutput size={16} style={{marginRight: '6px'}} /> 엑셀 내보내기
        </button>
      </div>

      {uniqueTCs.length > 0 && (
        <div className="charts-container" style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexShrink: 0 }}>
          <div className="card shadow-sm" style={{ flex: 1, padding: '16px', minHeight: '300px' }}>
            <h3 style={{ fontSize: '15px', color: '#2d3748', marginBottom: '16px', fontWeight: 'bold' }}>차수별 Pass Rate 추이 (%)</h3>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{top: 5, right: 20, left: -20, bottom: 5}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#718096', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#718096', fontSize: 12}} domain={[0, 100]} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} />
                  <Line type="monotone" dataKey="PassRate" stroke="#3182ce" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card shadow-sm" style={{ flex: 1, padding: '16px', minHeight: '300px' }}>
            <h3 style={{ fontSize: '15px', color: '#2d3748', marginBottom: '16px', fontWeight: 'bold' }}>차수별 테스트 결과 분포</h3>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{top: 5, right: 20, left: -20, bottom: 5}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#718096', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#718096', fontSize: 12}} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} />
                  <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                  <Bar dataKey="Pass" stackId="a" fill="#48bb78" barSize={30} />
                  <Bar dataKey="Fail" stackId="a" fill="#f56565" />
                  <Bar dataKey="Blocked" stackId="a" fill="#ed8936" />
                  <Bar dataKey="N/A" stackId="a" fill="#a0aec0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="card shadow-sm" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '16px' }}>
        {uniqueTCs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>데이터가 없습니다.</div>
        ) : (
          <div className="table-wrapper" style={{ overflow: 'auto', flex: 1 }}>
            <table className="tc-table">
              <thead>
                <tr>
                  <th className="sticky-col" style={{ width: '180px', zIndex: 3 }}>TC_ID</th>
                  <th style={{ minWidth: '120px' }}>1 Depth</th>
                  <th style={{ minWidth: '250px' }}>Scenario</th>
                  {availableRounds.map(r => (
                    <th key={r} style={{ textAlign: 'center', minWidth: '180px', backgroundColor: '#edf2f7', color: '#2d3748', borderLeft: '2px solid #cbd5e0' }}>
                      {r}차 결과
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {uniqueTCs.map((tc, idx) => (
                  <tr key={tc.tc_id}>
                    <td className="sticky-col fw-500" style={{ zIndex: 1 }}>{tc.tc_id}</td>
                    <td>{tc.depth1}</td>
                    <td className="min-w-200">{tc.scenario}</td>
                    {availableRounds.map(r => {
                      const rData = tc.resultsByRound[r];
                      if (!rData) {
                        return <td key={r} style={{ textAlign: 'center', borderLeft: '2px solid #e2e8f0', color: '#a0aec0' }}>-</td>;
                      }
                      return (
                        <td key={r} style={{ borderLeft: '2px solid #e2e8f0', verticalAlign: 'top' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            {getResultBadge(rData.result)}
                            {rData.defect_id && (
                              <Link to={`/defects?defectId=${rData.defect_id}`} style={{ fontSize: '12px', color: '#e53e3e', textDecoration: 'underline', fontWeight: 'bold' }}>
                                {rData.defect_id}
                              </Link>
                            )}
                          </div>
                          {rData.comment && (
                            <div style={{ fontSize: '12px', color: '#4a5568', backgroundColor: '#f7fafc', padding: '6px', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
                              {rData.comment}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default RoundComparisonView;
