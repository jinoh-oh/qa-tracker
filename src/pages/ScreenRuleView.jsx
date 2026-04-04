import React from 'react';
import DynamicTable from '../components/DataTable/DynamicTable';

function ScreenRuleView() {
  return (
    <div className="animate-fade-in">
      <div className="view-header">
        <h2 className="view-title">공통 TC 수행 기준 (SCREEN_RULE)</h2>
      </div>
      <DynamicTable />
    </div>
  );
}

export default ScreenRuleView;
