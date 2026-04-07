import React, { useContext } from 'react';
import DynamicTable from '../components/DataTable/DynamicTable';
import { AppContext } from '../context/AppContext';

function ScreenRuleView() {
  const { screenRulesData, updateScreenRules } = useContext(AppContext);

  const handleDataChange = (newData) => {
    updateScreenRules(newData);
  };

  return (
    <div className="animate-fade-in">
      <div className="view-header">
        <h2 className="view-title">공통 TC 수행 기준 (SCREEN_RULE)</h2>
      </div>
      <DynamicTable 
        columns={screenRulesData?.columns} 
        rows={screenRulesData?.rows} 
        onDataChange={handleDataChange}
      />
    </div>
  );
}

export default ScreenRuleView;
