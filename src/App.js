import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import FeatureTable from './FeatureTable.js';
import FeatureRow from './FeatureRow.js';
import Tabs from 'react-bootstrap/lib/Tabs';
import Tab from 'react-bootstrap/lib/Tab';
import ReconciliationServiceInput from './ReconciliationServiceInput.js';
import TestBench from './TestBench.js';

export default class App extends React.Component {
  render() {
    return (
      <div className="App" style={{margin: '20px'}}>
        <h1>Reconciliation service test bench</h1>
        <Tabs defaultActiveKey="servicesList" id="main-tabs">
          <Tab eventKey="servicesList" title="Services">
            <div style={{marginTop: '10px'}}>
                <p>This table lists reconciliation services known to <a href="https://www.wikidata.org/">Wikidata</a> and
                    indicates which features of the <a href="https://github.com/OpenRefine/OpenRefine/wiki/Reconciliation-Service-API">reconciliation API</a> they support.
                </p>
                <FeatureTable> 
                    <FeatureRow name="OpenCorporates" endpoint="https://opencorporates.com/reconcile" documentation="https://api.opencorporates.com/documentation/Open-Refine-Reconciliation-API" />
                </FeatureTable>
            </div>
          </Tab>
          <Tab eventKey="testBench" title="Test bench">
            <div style={{marginTop: '10px'}}>
              <p>This form lets you test a reconciliation endpoint interactively.</p>
              <ReconciliationServiceInput />
              <TestBench />
            </div>
          </Tab>
        </Tabs>
      </div>
    );
  }
}

