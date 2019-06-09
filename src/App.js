import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-theme.min.css';
import FeatureTable from './FeatureTable.js';
import FeatureRow from './FeatureRow.js';

function App() {
  return (
    <div className="App">
        <FeatureTable> 
           <FeatureRow name="OpenCorporates" endpoint="https://opencorporates.com/reconcile" documentation="https://api.opencorporates.com/documentation/Open-Refine-Reconciliation-API" />
        </FeatureTable>
    </div>
  );
}

export default App;
