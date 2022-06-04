import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';
import FeatureTable from './FeatureTable.js';
import FeatureRow from './FeatureRow.js';
import TabLink from './TabLink.js';
import ReconciliationServiceInput from './ReconciliationServiceInput.js';
import TestBench from './TestBench.js';
import { HashRouter, Switch, Route, useParams, useHistory } from "react-router-dom";


function TestbenchTab({ servicesMap, onEndpointChange }) {

   var { endpoint } = useParams();
   endpoint = endpoint ? decodeURIComponent(endpoint) : undefined;
   let service = servicesMap[endpoint];
   let testBench = <div />;
   if (endpoint && service) {
      testBench = (<TestBench service={service} key={`testbench-{endpoint}`}/>);
   }

   let history = useHistory();
   let handleChange = function (service) {
      onEndpointChange(service);
      if (service) {
        history.push(`/client/${encodeURIComponent(service.endpoint)}`);
      }
   };

   return (
    <div className="tabContent">
        <p>This form lets you test a reconciliation endpoint interactively.</p>
        <ReconciliationServiceInput
            onChange={handleChange}
            initialService={service || { endpoint } }
            key={endpoint} />
        {testBench}
    </div>);
}

function TableTab({ onEndpointSelect, style }) {

   let history = useHistory();
   
   let handleSelect = function (service) {
      onEndpointSelect(service);
      history.push(`/client/${encodeURIComponent(service.endpoint)}`);
   };

   return (<div className="tabContent" style={style}>
        <p>This table lists reconciliation services known to <a href="https://www.wikidata.org/">Wikidata</a> and
            indicates which features of the <a href="https://reconciliation-api.github.io/specs/latest/">reconciliation API</a> they support.
        </p>
        <p>If you are viewing this app over HTTPS it is likely that reconciliation services using HTTP are blocked as "mixed content". You can disable this protection in your browser to load HTTP reconciliation services.</p>
        <FeatureTable onSelect={handleSelect}> 
            <FeatureRow name="OpenCorporates" endpoint="https://opencorporates.com/reconcile" documentation="https://api.opencorporates.com/documentation/Open-Refine-Reconciliation-API" />
        </FeatureTable>
    </div>);
}

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      selectedEndpoint: '',
      servicesMap: {},
      openTab: 'servicesList',
      refreshing: false,
      servicesList: []
    };
  }

  onEndpointSelect = (service) => {
    let newServicesMap = Object.assign(this.state.servicesMap);
    if (service) {
      newServicesMap[service.endpoint] = service;
    }
    this.setState({
      selectedEndpoint: service ? service.endpoint : undefined,
      servicesMap: newServicesMap,
      openTab: 'testBench',
   });
  }

  handleTabSelect = (key) => {
     this.setState({ openTab: key });
  };

  render() {
    return (
    <HashRouter>
      <div className="App" style={{margin: '20px'}}>
        <h1>Reconciliation service test bench</h1>
        <p style={{float: 'right'}}><a href="https://github.com/reconciliation-api/testbench">Source repository</a></p>
        <ul className="nav nav-tabs">
            <TabLink to="/" title="Services" exact="true" />
            <TabLink to="/client/" title="Test bench" />
        </ul>
        <Switch>
           <Route path="/client/:endpoint">
             <TestbenchTab servicesMap={this.state.servicesMap} onEndpointChange={this.onEndpointSelect} />
           </Route>
           <Route path="/client/">
             <TestbenchTab servicesMap={this.state.servicesMap} onEndpointChange={this.onEndpointSelect} />
           </Route>
        </Switch>
        <Route exact path="/" children={({ match }) =>
          <TableTab onEndpointSelect={this.onEndpointSelect}  style={{display: match ? 'block' : 'none'}} />} />
      </div>
    </HashRouter>
    );
  }
}

