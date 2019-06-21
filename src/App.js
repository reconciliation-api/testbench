import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';
import FeatureTable from './FeatureTable.js';
import FeatureRow from './FeatureRow.js';
import Tabs from 'react-bootstrap/lib/Tabs';
import Tab from 'react-bootstrap/lib/Tab';
import ReconciliationServiceInput from './ReconciliationServiceInput.js';
import TestBench from './TestBench.js';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      endpoint: '',
      selectedEndpoint: '',
      openTab: 'servicesList',
    };
  }

  onEndpointSelect = (endpoint, manifest) => {
    this.setState({
      endpoint: endpoint,
      selectedEndpoint: endpoint,
      manifest: manifest,
      openTab: 'testBench',
   });
  }

  onEndpointChange = (endpoint, manifest) => {
    this.setState({
      endpoint: endpoint,
      manifest: manifest
    });
  };

  handleTabSelect = (key) => {
     this.setState({ openTab: key });
  };

  render() {
    let testBench = <div />;
    if (this.state.endpoint) {
        testBench = <TestBench endpoint={this.state.endpoint} manifest={this.state.manifest} />;
    }
    return (
      <div className="App" style={{margin: '20px'}}>
        <h1>Reconciliation service test bench</h1>
        <Tabs activeKey={this.state.openTab} onSelect={this.handleTabSelect} animation={false} id="main-tabs">
          <Tab eventKey="servicesList" title="Services">
            <div className="tabContent">
                <p>This table lists reconciliation services known to <a href="https://www.wikidata.org/">Wikidata</a> and
                    indicates which features of the <a href="https://github.com/OpenRefine/OpenRefine/wiki/Reconciliation-Service-API">reconciliation API</a> they support.
                </p>
                <FeatureTable onSelect={this.onEndpointSelect}> 
                    <FeatureRow name="OpenCorporates" endpoint="https://opencorporates.com/reconcile" documentation="https://api.opencorporates.com/documentation/Open-Refine-Reconciliation-API" />
                </FeatureTable>
            </div>
          </Tab>
          <Tab eventKey="testBench" title="Test bench">
            <div className="tabContent">
              <p>This form lets you test a reconciliation endpoint interactively.</p>
              <ReconciliationServiceInput
                 onChange={this.onEndpointChange}
                 initialEndpoint={this.state.selectedEndpoint}
                 initialManifest={this.state.manifest} 
                 key={this.state.selectedEndpoint} />
              {testBench}
            </div>
          </Tab>
        </Tabs>
      </div>
    );
  }
}

