import React, { createContext, useState, useEffect } from 'react';
import { mockTestCases as initialData } from '../data/mockData';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [testCasesData, setTestCasesData] = useState({});
  const [modules, setModules] = useState([]);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('qms_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [accounts, setAccounts] = useState([]);
  const [defectsData, setDefectsData] = useState([]);
  const [notificationsData, setNotificationsData] = useState([]);
  const [depthOptions, setDepthOptions] = useState([]);
  const [screenRulesData, setScreenRulesData] = useState({ columns: [], rows: [] });
  const [isLoaded, setIsLoaded] = useState(false);

  // Determine API Base: relative path for same-origin production, or localhost for cross-origin dev
  const API_BASE = '/api'; 

  // Initial Load with Fallback
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE}/all`);
        if (!response.ok) throw new Error('Server response not ok');
        const data = await response.json();
        
        // Ensure we have at least default accounts if server returns empty
        const finalAccounts = (data.accounts && data.accounts.length > 0) ? data.accounts : [
          { id: 'admin', pw: '1234', role: 'admin', name: 'System Admin' },
          { id: 'user', pw: '1234', role: 'user', name: 'Test User' }
        ];

        setTestCasesData(data.testCasesData || {});
        setModules(data.modules || []);
        setAccounts(finalAccounts);
        setDefectsData(data.defectsData || []);
        setNotificationsData(data.notificationsData || []);
        setDepthOptions(data.depthOptions || []);
        setScreenRulesData(data.screenRulesData && data.screenRulesData.columns ? data.screenRulesData : { columns: [], rows: [] });
      } catch (err) {
        console.warn('Backend server not connected. Falling back to local storage...', err);
        const getLocal = (key, def) => {
          try {
            const item = localStorage.getItem(key);
            if (!item || item === '[]' || item === '{}') return def;
            const parsed = JSON.parse(item);
            return (Array.isArray(parsed) && parsed.length === 0) ? def : parsed;
          } catch (e) { return def; }
        };
        
        const defaultAccounts = [
          { id: 'admin', pw: '1234', role: 'admin', name: 'System Admin' },
          { id: 'user', pw: '1234', role: 'user', name: 'Test User' }
        ];
        const defaultModules = [
          { id: '공통TC', label: '공통 TC' },
          { id: 'JEONSE', label: 'JEONSE' },
          { id: 'IJEONSE', label: 'IJEONSE' },
          { id: 'MORT', label: 'MORT' },
          { id: 'IMORT', label: 'IMORT' },
          { id: 'SEARCH', label: '통합업무검색' }
        ];

        setTestCasesData(getLocal('qms_testCasesData', {})); 
        setModules(getLocal('qms_modules', defaultModules));
        setAccounts(getLocal('qms_accounts', defaultAccounts));
        setDefectsData(getLocal('qms_defects', []));
        setNotificationsData(getLocal('qms_notifications', []));
        setDepthOptions(getLocal('qms_depth_options', ['공통', '로그인', '로그인화면', '전세', '리스트', '기본검색', '상세검색', '등록', '조회', '저장']));
        setScreenRulesData(getLocal('qms_screen_rules', { columns: [], rows: [] }));
      } finally {
        setIsLoaded(true);
      }
    };
    fetchData();
  }, [API_BASE]);

  // Sync to Server (Whenever major data changes)
  useEffect(() => {
    if (!isLoaded) return;

    const sync = async () => {
      try {
        const response = await fetch(`${API_BASE}/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            testCasesData,
            modules,
            accounts,
            defectsData,
            notificationsData,
            depthOptions,
            screenRulesData
          })
        });
        
        // If sync succeeds, also update local storage as a secondary backup
        if (response.ok) {
           localStorage.setItem('qms_testCasesData', JSON.stringify(testCasesData));
           localStorage.setItem('qms_modules', JSON.stringify(modules));
           localStorage.setItem('qms_accounts', JSON.stringify(accounts));
           localStorage.setItem('qms_defects', JSON.stringify(defectsData));
           localStorage.setItem('qms_notifications', JSON.stringify(notificationsData));
           localStorage.setItem('qms_depth_options', JSON.stringify(depthOptions));
           localStorage.setItem('qms_screen_rules', JSON.stringify(screenRulesData));
        }
      } catch (err) {
        // If sync fails (server down), keep using local storage as backup
        localStorage.setItem('qms_testCasesData', JSON.stringify(testCasesData));
        localStorage.setItem('qms_modules', JSON.stringify(modules));
        localStorage.setItem('qms_accounts', JSON.stringify(accounts));
        localStorage.setItem('qms_defects', JSON.stringify(defectsData));
        localStorage.setItem('qms_notifications', JSON.stringify(notificationsData));
        localStorage.setItem('qms_depth_options', JSON.stringify(depthOptions));
        localStorage.setItem('qms_screen_rules', JSON.stringify(screenRulesData));
      }
    };

    const timer = setTimeout(sync, 1000); 
    return () => clearTimeout(timer);
  }, [testCasesData, modules, accounts, defectsData, notificationsData, depthOptions, screenRulesData, isLoaded]);

  // Persist current user in local storage only (not shared)
  useEffect(() => {
    if (user) localStorage.setItem('qms_user', JSON.stringify(user));
    else localStorage.removeItem('qms_user');
  }, [user]);

  const addDepthOption = (option) => {
    if (!depthOptions.includes(option)) {
      setDepthOptions([...depthOptions, option]);
    }
  };

  const deleteDepthOption = (option) => {
    setDepthOptions(depthOptions.filter(d => d !== option));
  };
  
  const updateDepthOptions = (newList) => {
    setDepthOptions(newList);
  };

  const addNotification = (notif) => {
    setNotificationsData(prev => [{
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...notif
    }, ...prev]);
  };

  const markAsRead = (id) => {
    setNotificationsData(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotificationsData(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addModule = (newModuleId, newModuleLabel) => {
    if (!modules.find(m => m.id === newModuleId)) {
      setModules([...modules, { id: newModuleId, label: newModuleLabel || newModuleId }]);
    }
  };

  const updateModules = (newModulesArray) => {
    setModules(newModulesArray);
  };

  const deleteModule = (moduleId) => {
    setModules(modules.filter(m => m.id !== moduleId));
  };

  const addAccount = (newAcc) => {
    if (accounts.find(a => a.id === newAcc.id)) {
      alert('이미 존재하는 계정 아이디입니다.');
      return;
    }
    setAccounts([...accounts, { ...newAcc }]);
  };

  const updateAccountPw = (accId, newPw) => {
    setAccounts(accounts.map(a => a.id === accId ? { ...a, pw: newPw } : a));
  };

  const deleteAccount = (accId) => {
    if (user && accId === user.id) {
      alert('현재 접속 중인 계정은 삭제할 수 없습니다.');
      return;
    }
    if (accId === 'admin') {
      alert('시스템 최고 관리자(admin)는 삭제할 수 없습니다.');
      return;
    }
    setAccounts(accounts.filter(a => a.id !== accId));
  };

  const login = (id, pw) => {
    const acc = accounts.find(a => a.id === id && a.pw === pw);
    if (acc) {
      setUser(acc);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const isOtherUser = (targetName) => {
    return user && targetName && String(targetName).trim() !== String(user.name).trim();
  };

  const updateScreenRules = (newData) => {
    setScreenRulesData(newData);
  };

  const addTestCase = (moduleName, newTc) => {
    setTestCasesData(prev => {
      const moduleData = prev[moduleName] || [];
      return { ...prev, [moduleName]: [...moduleData, newTc] };
    });
  };

  const updateTestCase = (moduleName, originalId, updatedTc) => {
    setTestCasesData(prev => {
      const moduleData = prev[moduleName] || [];
      const originalTc = moduleData.find(tc => tc.tc_id === originalId);
      
      if (originalTc && isOtherUser(originalTc.tester)) {
        addNotification({
          type: 'tc_updated',
          title: '테스트 케이스 수정됨',
          message: `${user.name}님이 ${originalTc.tester}님의 TC(${originalId})를 수정했습니다.`,
          link: `/module/${moduleName}?tcId=${originalId}`
        });
      }

      return {
        ...prev,
        [moduleName]: moduleData.map(tc => tc.tc_id === originalId ? updatedTc : tc)
      };
    });
  };

  const deleteTestCase = (moduleName, tcIdToDelete) => {
    setTestCasesData(prev => {
      const moduleData = prev[moduleName] || [];
      const tcToDelete = moduleData.find(tc => tc.tc_id === tcIdToDelete);
      
      if (tcToDelete && isOtherUser(tcToDelete.tester)) {
        addNotification({
          type: 'tc_deleted',
          title: '테스트 케이스 삭제됨',
          message: `${user.name}님이 ${tcToDelete.tester}님의 TC(${tcIdToDelete})를 삭제했습니다.`,
          link: `/module/${moduleName}`
        });
      }

      return {
        ...prev,
        [moduleName]: moduleData.filter(tc => tc.tc_id !== tcIdToDelete)
      };
    });
  };

  const bulkDeleteTestCases = (moduleName, tcIdsToDelete) => {
    setTestCasesData(prev => {
      const moduleData = prev[moduleName] || [];
      const toDelete = moduleData.filter(tc => tcIdsToDelete.includes(tc.tc_id));
      const othersDeleted = toDelete.filter(tc => isOtherUser(tc.tester));
      
      if (othersDeleted.length > 0) {
        addNotification({
          type: 'tc_deleted',
          title: '테스트 케이스 일괄 삭제됨',
          message: `${user.name}님이 다른 사용자의 TC ${othersDeleted.length}건을 포함하여 삭제했습니다.`,
          link: `/module/${moduleName}`
        });
      }

      return {
        ...prev,
        [moduleName]: moduleData.filter(tc => !tcIdsToDelete.includes(tc.tc_id))
      };
    });
  };

  const appendTestCasesFromExcel = (moduleName, newTcs) => {
    setTestCasesData(prev => {
      const moduleData = prev[moduleName] || [];
      return { ...prev, [moduleName]: [...moduleData, ...newTcs] };
    });
  };

  // Defects Helpers
  const addDefect = (newDefect) => {
    setDefectsData(prev => [...prev, newDefect]);
    addNotification({
      type: 'defect_added',
      title: '새로운 결함 등록',
      message: `[${newDefect.severity}] ${newDefect.defect_id} - ${newDefect.title}`,
      link: `/defects?defectId=${newDefect.defect_id}`
    });
  };

  const updateDefect = (uid, updatedDefect) => {
    setDefectsData(prev => {
      const originalDf = prev.find(d => (d._uid || d.defect_id) === uid);
      if (originalDf && originalDf.status !== updatedDefect.status) {
        addNotification({
          type: 'defect_status_changed',
          title: '결함 상태 변경',
          message: `${updatedDefect.defect_id}의 상태가 ${updatedDefect.status}(으)로 변경되었습니다.`,
          link: `/defects?defectId=${updatedDefect.defect_id}`
        });
      }
      return prev.map(d => (d._uid || d.defect_id) === uid ? updatedDefect : d);
    });
  };

  const deleteDefect = (uid) => {
    setDefectsData(prev => {
      const dfToDelete = prev.find(d => (d._uid || d.defect_id) === uid);
      if (dfToDelete && isOtherUser(dfToDelete.reporter)) {
        addNotification({
          type: 'defect_deleted',
          title: '결함 삭제됨',
          message: `${user.name}님이 ${dfToDelete.reporter}님의 결함(${dfToDelete.defect_id})을 삭제했습니다.`,
          link: '/defects'
        });
      }
      return prev.filter(d => (d._uid || d.defect_id) !== uid);
    });
  };

  const bulkDeleteDefects = (uids) => {
    setDefectsData(prev => {
      const toDelete = prev.filter(d => uids.includes(d._uid || d.defect_id));
      const othersDeleted = toDelete.filter(d => isOtherUser(d.reporter));
      if (othersDeleted.length > 0) {
        addNotification({
          type: 'defect_deleted',
          title: '결함 일괄 삭제됨',
          message: `${user.name}님이 다른 사용자의 결함 ${othersDeleted.length}건을 포함하여 삭제했습니다.`,
          link: '/defects'
        });
      }
      return prev.filter(d => !uids.includes(d._uid || d.defect_id));
    });
  };

  return (
    <AppContext.Provider value={{
      testCasesData,
      modules,
      user,
      accounts,
      defectsData,
      notificationsData,
      depthOptions,
      addDepthOption,
      deleteDepthOption,
      updateDepthOptions,
      addModule,
      updateModules,
      deleteModule,
      addAccount,
      updateAccountPw,
      deleteAccount,
      login,
      logout,
      addTestCase,
      updateTestCase,
      deleteTestCase,
      bulkDeleteTestCases,
      appendTestCasesFromExcel,
      addDefect,
      updateDefect,
      deleteDefect,
      bulkDeleteDefects,
      screenRulesData,
      updateScreenRules,
      markAsRead,
      markAllAsRead,
      isLoaded
    }}>
      {children}
    </AppContext.Provider>
  );
};
