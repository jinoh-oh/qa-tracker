import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { CheckCircle, XCircle, AlertTriangle, ListTodo, Activity, Bug } from 'lucide-react';
import './Dashboard.css';

function Dashboard() {
  const { testCasesData, defectsData, modules } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('tc');

  const { dashboardStats, moduleStats, defectTotals, defectStatsByModule, defectSeverityData, defectStatusData, defectTrendData } = useMemo(() => {
    const EXCLUDED_MODULES = ['SCREEN_RULE', 'Reference'];
    let totalTC = 0;
    let excludedTC = 0; // This means "공통 제외 TC"
    let pass = 0;
    let fail = 0;
    let na = 0;
    let blocked = 0;
    
    const mStats = [];

    const activeModuleIds = modules.map(m => m.id);
    const validModules = modules.map(m => m.id).filter(mod => testCasesData[mod]);

    validModules.forEach(moduleName => {
      if (EXCLUDED_MODULES.includes(moduleName)) return;

      const tcs = testCasesData[moduleName];
      let mTotal = tcs.length;
      let mExcluded = 0;
      let mPass = 0;
      let mFail = 0;
      let mNa = 0;
      let mBlocked = 0;

      tcs.forEach(tc => {
        totalTC++;
        // TC Type check
        const isExcluded = (moduleName === '공통TC' || moduleName === '공통') ? true : tc.type === 'BIZ';
        if (isExcluded) {
          mExcluded++;
          excludedTC++;
        }

        if (tc.result === 'Pass') { pass++; mPass++; }
        else if (tc.result === 'Fail') { fail++; mFail++; }
        else if (tc.result === 'N/A') { na++; mNa++; }
        else if (tc.result === 'Blocked') { blocked++; mBlocked++; }
      });

      const processedTC = mPass + mFail;
      const validTotal = mTotal; 
      const mProgress = validTotal > 0 ? Math.round((processedTC / validTotal) * 100) : 0;

      const moduleLabel = modules.find(m => m.id === moduleName)?.label || moduleName;

      mStats.push({
        moduleId: moduleName,
        module: moduleLabel,
        total: mTotal,
        excluded: mExcluded,
        pass: mPass,
        fail: mFail,
        na: mNa,
        blocked: mBlocked,
        progress: mProgress
      });
    });

    const totalProcessed = pass + fail;
    const progress = totalTC > 0 ? Math.round((totalProcessed / totalTC) * 100) : 0;

    // Defect Metrics
    const tcToModule = {};
    Object.keys(testCasesData).forEach(mod => {
      testCasesData[mod].forEach(tc => {
        if (tc.tc_id) tcToModule[tc.tc_id] = mod;
      });
    });

    const defectStats = {};
    validModules.forEach(mod => {
      if (!EXCLUDED_MODULES.includes(mod)) {
        const modLabel = modules.find(m => m.id === mod)?.label || mod;
        defectStats[mod] = { moduleId: mod, module: modLabel, total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0, unresolved: 0 };
      }
    });
    // Add default "기타" for unmapped defects
    defectStats['기타'] = { module: '기타 (미매핑)', total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0, unresolved: 0 };

    const severityStats = { Blocker: 0, Critical: 0, Major: 0, Minor: 0 };
    const statusStats = { Open: 0, 'In Progress': 0, Resolved: 0, Closed: 0 };
    const trendStatsMap = {};

    let totalDefects = 0;
    let totalUnresolved = 0;
    let totalBlockers = 0;

    (defectsData || []).forEach(df => {
      let assignedMod = tcToModule[df.tc_id];
      if (!assignedMod && df.defect_id) {
        const parts = df.defect_id.split('-');
        if (parts.length >= 3 && defectStats[parts[1]]) {
          assignedMod = parts[1];
        }
      }
      if (!assignedMod || !defectStats[assignedMod]) {
        assignedMod = '기타';
      }

      defectStats[assignedMod].total++;
      totalDefects++;

      // Severity stats
      if (severityStats[df.severity] !== undefined) severityStats[df.severity]++;
      if (df.severity === 'Blocker') totalBlockers++;

      // Status stats
      if (statusStats[df.status] !== undefined) statusStats[df.status]++;

      // Trend stats (group by date)
      if (df.date) {
        trendStatsMap[df.date] = (trendStatsMap[df.date] || 0) + 1;
      }

      if (df.status === 'Open') defectStats[assignedMod].open++;
      else if (df.status === 'In Progress') defectStats[assignedMod].in_progress++;
      else if (df.status === 'Resolved') defectStats[assignedMod].resolved++;
      else if (df.status === 'Closed') defectStats[assignedMod].closed++;

      if (df.status === 'Open' || df.status === 'In Progress') {
        defectStats[assignedMod].unresolved++;
        totalUnresolved++;
      }
    });

    // Format trend data for chart
    const trendData = Object.keys(trendStatsMap)
      .sort()
      .map(date => ({ date, count: trendStatsMap[date] }));

    // Format stats for charts
    const severityData = Object.keys(severityStats).map(key => ({ name: key, value: severityStats[key] }));
    const statusData = Object.keys(statusStats).map(key => ({ name: key, value: statusStats[key] }));

    // Remove empty "기타"
    if (defectStats['기타'] && defectStats['기타'].total === 0) {
      delete defectStats['기타'];
    }

    return {
      dashboardStats: { totalTC, excludedTC, pass, fail, na, blocked, progress },
      moduleStats: mStats,
      defectTotals: { total: totalDefects, unresolved: totalUnresolved, blockers: totalBlockers },
      defectStatsByModule: Object.values(defectStats),
      defectSeverityData: severityData,
      defectStatusData: statusData,
      defectTrendData: trendData
    };
  }, [testCasesData, defectsData, modules]);

  return (
    <div className="dashboard animate-fade-in">
      <h2 className="page-title">QMS 통합 검증 대시보드</h2>

      <div className="dashboard-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
        <button 
          onClick={() => setActiveTab('tc')} 
          style={{ padding: '12px 24px', border: 'none', background: 'transparent', borderBottom: activeTab === 'tc' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'tc' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'tc' ? '600' : '500', cursor: 'pointer', fontSize: '15px', transition: 'all 0.2s' }}>
          TC 진행 현황
        </button>
        <button 
          onClick={() => setActiveTab('defect')} 
          style={{ padding: '12px 24px', border: 'none', background: 'transparent', borderBottom: activeTab === 'defect' ? '2px solid #e53e3e' : '2px solid transparent', color: activeTab === 'defect' ? '#e53e3e' : 'var(--text-muted)', fontWeight: activeTab === 'defect' ? '600' : '500', cursor: 'pointer', fontSize: '15px', transition: 'all 0.2s' }}>
          결함 현황 지표
        </button>
      </div>
      
      {activeTab === 'tc' && (
        <>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon total"><ListTodo /></div>
              <div className="kpi-info">
                <span className="kpi-label">총 대상 TC</span>
                <span className="kpi-value">{dashboardStats.totalTC} <small>(공통제외: {dashboardStats.excludedTC})</small></span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon pass"><CheckCircle /></div>
              <div className="kpi-info">
                <span className="kpi-label">Pass</span>
                <span className="kpi-value text-pass">{dashboardStats.pass}</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon fail"><XCircle /></div>
              <div className="kpi-info">
                <span className="kpi-label">Fail</span>
                <span className="kpi-value text-fail">{dashboardStats.fail}</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon progress"><Activity /></div>
              <div className="kpi-info">
                <span className="kpi-label">진행률</span>
                <span className="kpi-value text-primary">{dashboardStats.progress}%</span>
              </div>
            </div>
          </div>

          <div className="chart-card" style={{marginTop: '24px', marginBottom: '24px'}}>
            <h3>업무영역별 진행 현황</h3>
            <div className="table-responsive">
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>업무영역</th>
                    <th style={{textAlign: 'center'}}>총 TC</th>
                    <th style={{textAlign: 'center'}}>공통 제외 TC</th>
                    <th style={{textAlign: 'center'}}>Pass</th>
                    <th style={{textAlign: 'center'}}>Fail</th>
                    <th style={{textAlign: 'center'}}>N/A</th>
                    <th style={{textAlign: 'center'}}>Blocked</th>
                    <th style={{textAlign: 'center', width: '230px'}}>진행률</th>
                  </tr>
                </thead>
                <tbody>
                  {moduleStats.length > 0 ? (
                    moduleStats.map((row, idx) => (
                      <tr key={idx}>
                        <td><strong>{row.module}</strong></td>
                        <td style={{textAlign: 'center'}}>{row.total}</td>
                        <td style={{textAlign: 'center'}}>{row.excluded}</td>
                        <td className="text-pass fw-bold" style={{textAlign: 'center'}}>{row.pass}</td>
                        <td className="text-fail fw-bold" style={{textAlign: 'center'}}>{row.fail}</td>
                        <td className="text-muted" style={{textAlign: 'center'}}>{row.na}</td>
                        <td className="text-warning fw-bold" style={{textAlign: 'center'}}>{row.blocked}</td>
                        <td style={{textAlign: 'center'}}>
                          <div className="progress-bar-container">
                            <div className="progress-track">
                              <div className="progress-bar" style={{ width: `${row.progress}%` }}></div>
                            </div>
                            <span className="progress-text">{row.progress}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{textAlign: 'center', padding: '20px', color: 'var(--text-muted)'}}>
                        등록된 업무영역 TC가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="charts-grid-2col">
            <div className="chart-card">
              <h3>진행률 현황</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={moduleStats} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="module" angle={-45} textAnchor="end" height={60} interval={0} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="progress" name="진행률" fill="#3182ce" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="chart-card">
              <h3>Pass / Fail 현황</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={moduleStats} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="module" angle={-45} textAnchor="end" height={60} interval={0} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="pass" name="Pass" fill="#38a169" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="fail" name="Fail" fill="#e53e3e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'defect' && (
        <>
          <div className="kpi-grid">
            <div className="kpi-card" style={{borderLeft: '4px solid #c53030'}}>
              <div className="kpi-icon total" style={{background: '#fed7d7', color: '#c53030'}}><Bug /></div>
              <div className="kpi-info">
                <span className="kpi-label">총 발견 결함</span>
                <span className="kpi-value text-fail">{defectTotals.total} <small>건</small></span>
              </div>
            </div>
            <div className="kpi-card" style={{borderLeft: '4px solid #dd6b20'}}>
              <div className="kpi-icon total" style={{background: '#feebc8', color: '#dd6b20'}}><AlertTriangle /></div>
              <div className="kpi-info">
                <span className="kpi-label">미조치 결함 (Open/In Progress)</span>
                <span className="kpi-value" style={{color: '#dd6b20'}}>{defectTotals.unresolved} <small>건</small></span>
              </div>
            </div>
            <div className="kpi-card" style={{borderLeft: '4px solid #742a2a'}}>
              <div className="kpi-icon total" style={{background: '#fff5f5', color: '#742a2a'}}><XCircle /></div>
              <div className="kpi-info">
                <span className="kpi-label">Blocker 결함</span>
                <span className="kpi-value" style={{color: '#742a2a'}}>{defectTotals.blockers} <small>건</small></span>
              </div>
            </div>
          </div>

          <div className="chart-card" style={{marginTop: '24px', marginBottom: '24px'}}>
            <h3>업무영역별 결함 현황</h3>
            <div className="table-responsive">
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>업무영역</th>
                    <th style={{textAlign: 'center'}}>총 결함 발견</th>
                    <th style={{textAlign: 'center'}}>미조치 (Open/In Progress)</th>
                    <th style={{textAlign: 'center'}}>Open</th>
                    <th style={{textAlign: 'center'}}>In Progress</th>
                    <th style={{textAlign: 'center'}}>Resolved</th>
                    <th style={{textAlign: 'center'}}>Closed</th>
                  </tr>
                </thead>
                <tbody>
                  {defectStatsByModule && defectStatsByModule.length > 0 ? (
                    defectStatsByModule.map((row, idx) => (
                      <tr key={idx}>
                        <td><strong>{row.module}</strong></td>
                        <td className="fw-bold" style={{textAlign: 'center'}}>{row.total}</td>
                        <td className="fw-bold" style={{color: row.unresolved > 0 ? '#dd6b20' : '#4a5568', textAlign: 'center'}}>{row.unresolved}</td>
                        <td style={{color: row.open > 0 ? '#c53030' : 'inherit', textAlign: 'center'}}>{row.open}</td>
                        <td style={{color: row.in_progress > 0 ? '#dd6b20' : 'inherit', textAlign: 'center'}}>{row.in_progress}</td>
                        <td style={{color: row.resolved > 0 ? '#319795' : 'inherit', textAlign: 'center'}}>{row.resolved}</td>
                        <td style={{color: row.closed > 0 ? '#38a169' : 'inherit', textAlign: 'center'}}>{row.closed}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{textAlign: 'center', padding: '20px', color: 'var(--text-muted)'}}>
                        등록된 결함 내역이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="charts-grid-2col" style={{marginTop: '24px'}}>
            <div className="chart-card">
              <h3>심각도(Severity) 분포</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={defectSeverityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: 'Blocker', color: '#742a2a' },
                        { name: 'Critical', color: '#c53030' },
                        { name: 'Major', color: '#dd6b20' },
                        { name: 'Minor', color: '#3182ce' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <h3>처리 상태(Status) 현황</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={defectStatusData} layout="vertical" margin={{ left: 20, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="value" name="건수" fill="#4a5568" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="chart-card" style={{marginTop: '24px'}}>
            <h3>결함 발생 추이 (Trend)</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={defectTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" name="발견 건수" stroke="#e53e3e" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card" style={{marginTop: '24px'}}>
            <h3>업무영역별 결함 상세 지표</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={defectStatsByModule} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="module" angle={-45} textAnchor="end" height={60} interval={0} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" name="총 결함 발견" fill="#c53030" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="unresolved" name="미조치 상태 (Open + In Progress)" fill="#dd6b20" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
