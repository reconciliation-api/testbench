import React from 'react';
import Table from 'react-bootstrap/lib/Table';
import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import FeatureRow from './FeatureRow';

class Row {
    constructor(endpoint, name, documentation, source_url, wd_uri) {
       this.endpoint = endpoint;
       this.name = name;
       this.documentation = documentation;
       this.source_url = source_url;
       this.wd_uri = wd_uri;
    }
}


export default class FeatureTable extends React.Component {
    constructor() {
      super();
       this.state = {
         services: [],
         showAddServiceDialog: false,
         refreshing: false,
         serviceVersions: {},
         showTables: false,
       };

       this.sparql_query = (
        "SELECT ?service ?serviceLabel ?endpoint ?documentation ?source WHERE {\n" +
        "  ?service p:P6269 ?statement.\n"+
        "  ?statement ps:P6269 ?endpoint ;\n"+
        "     pq:P2700 wd:Q64490175.\n"+
        "  OPTIONAL { ?statement (pq:P973 | pq:P2078) ?documentation }\n" +
        "  OPTIONAL { ?statement pq:P1324 ?source }\n" +
        "  FILTER NOT EXISTS { ?statement wikibase:rank wikibase:DeprecatedRank }\n" +
        "  SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }\n" +
        "}\n" +
        "ORDER BY DESC(?endpoint)\n");
    }

    refreshServicesFromWD = (method) => {
       this.setState({
         refreshing: true,
         showTables: false,
         serviceVersions: {}
       });
       let url = new URL("https://query.wikidata.org/sparql");
       let params = {query:this.sparql_query, format: 'json'};
       let promise = null;
       if (method === 'GET') {
         Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
         promise = fetch(url);
       } else {
         var urlParams = new URLSearchParams();
         Object.keys(params).forEach(key => urlParams.append(key, params[key]));
         promise = fetch(url, {
           method: 'POST',
           mode: 'cors',
           cache: 'no-cache',
           headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
           body: urlParams,
         });
       }

       promise
        .then(result => result.json())
        .then(result => {
            this.setState({
              services: result.results.bindings.map(entry =>
                new Row(entry.endpoint.value, entry.serviceLabel.value,
                    'documentation' in entry ? entry.documentation.value : undefined,
                    'source' in entry ? entry.source.value : undefined,
                    entry.service.value)),
              refreshing: false
           });

           setTimeout(() => {
             this.setState({ showTables: true });
           }, 1500);
        })
        .catch(error => {
           console.log(error);
           this.setState({
             refreshing: false,
             showTables: true
           });
        });
    }

    componentDidMount() {
       this.refreshServicesFromWD('GET');

       setTimeout(() => {
         this.setState({ showTables: true });
       }, 1500);
    }

    handleVersionDetected = (endpoint, version) => {
       this.setState(prevState => ({
         serviceVersions: {
           ...prevState.serviceVersions,
           [endpoint]: version
         }
       }));
    }

    isVersion1x = (version) => {
       if (!version) return false;
       return version.startsWith('1.');
    }

    classifyServices = () => {
       const confirmed = [];
       const pending = [];

       this.state.services.forEach(row => {
         const version = this.state.serviceVersions[row.endpoint];

         if (version === undefined) {
           pending.push(row);
         } else if (version === 'timeout') {
           pending.push({ ...row, timedOut: true });
         } else if (version === null || !this.isVersion1x(version)) {
           // Intentionally exclude services that do not have a confirmed 1.x version.
         } else {
           confirmed.push(row);
         }
       });

       confirmed.sort((a, b) => a.name.localeCompare(b.name));

       return { confirmed, pending };
    }

    renderTableHeader = () => {
       return (
         <thead>
           <tr>
             <th scope="col">Name</th>
             <th scope="col">Endpoint</th>
             <th scope="col">API version</th>
             <th scope="col">CORS</th>
             <th scope="col">View entities</th>
             <th scope="col">Suggest entities</th>
             <th scope="col">Suggest types</th>
             <th scope="col">Suggest properties</th>
             <th scope="col">Preview entities</th>
             <th scope="col">Extend data</th>
           </tr>
         </thead>
       );
    }

    renderFeatureRow = (row) => {
       return (
         <FeatureRow
           endpoint={row.endpoint}
           name={row.name}
           documentation={row.documentation}
           source_url={row.source_url}
           wd_uri={row.wd_uri}
           onSelect={this.props.onSelect}
           onVersionDetected={this.handleVersionDetected}
           timedOut={row.timedOut}
           key={row.wd_uri + ' ' + row.endpoint}
         />
       );
    }

    openAddServiceDialog = () => {
        this.setState({
           showAddServiceDialog: true
        });
    }

    closeAddServiceDialog = () => {
        this.setState({
           showAddServiceDialog: false
        });
    }

    get sparqlQueryUrl() {
        return 'https://query.wikidata.org/#'+encodeURIComponent(this.sparql_query);
    }

    render() {
      const { confirmed, pending } = this.classifyServices();

      return (
        <>
          {!this.state.showTables ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <span className="glyphicon glyphicon-hourglass" style={{ fontSize: '24px' }}></span>
              <p>Loading endpoints...</p>
            </div>
          ) : (
            <>
              {confirmed.length > 0 && (
                <>
                  <h3>Version 1.x Endpoints ({confirmed.length})</h3>
                  <Table striped bordered hover>
                    {this.renderTableHeader()}
                    <tbody>
                      {confirmed.map(row => this.renderFeatureRow(row))}
                    </tbody>
                  </Table>
                </>
              )}

              {pending.length > 0 && (
                <>
                  <h3>Pending Endpoints ({pending.length})</h3>
                  <p style={{ fontSize: '0.9em', color: '#666' }}>
                    These endpoints are still being checked or have timed out.
                  </p>
                  <Table striped bordered hover>
                    {this.renderTableHeader()}
                    <tbody>
                      {pending.map(row => this.renderFeatureRow(row))}
                    </tbody>
                  </Table>
                </>
              )}

              {confirmed.length === 0 && pending.length === 0 && this.state.services.length > 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <p>No version 1.x endpoints available at this time.</p>
                </div>
              )}
            </>
          )}

        <Button onClick={this.openAddServiceDialog}><span className="glyphicon glyphicon-plus"></span> Add a service</Button>&nbsp;&nbsp;&nbsp;
        <Button onClick={() => this.refreshServicesFromWD('POST')} disabled={this.state.refreshing}><span className="glyphicon glyphicon-refresh"></span> {this.state.refreshing ? 'Refreshing…' : 'Refresh table'}</Button>

        <Modal show={this.state.showAddServiceDialog} onHide={this.closeAddServiceDialog}>
          <Modal.Header closeButton>
            <Modal.Title>How to add a service to this list</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
               This list is generated by <a href={this.sparqlQueryUrl}>a SPARQL query on Wikidata</a>.
               To add your service to it, follow these steps:
            </p>
            <ul>
                <li>Make sure your service is publicly accessible - local endpoints (such as those with <code>localhost</code> or <code>127.0.0.1</code> in their address) should not be added to this table (but you can still test them in the <a href="#/client/">Test bench</a> tab).</li>
                <li>Find out if there is already a Wikidata item about your service, your database or your identifier. You can use <a href="https://www.wikidata.org/wiki/Special:Search?ns0=1">Wikidata's search interface</a> for that. If there is not, you can <a href="https://www.wikidata.org/wiki/Special:NewItem">create a new one</a>.</li>
                <li>Add a statement on that item, using the <a href="https://www.wikidata.org/wiki/Property:P6269">API endpoint (P6269)</a> property, adding the <a href="https://www.wikidata.org/wiki/Q64490175">OpenRefine reconciliation service API (Q64490175)</a> as <a href="https://www.wikidata.org/wiki/Property:P2700">protocol (P2700)</a> in a qualifier. You can also add a link to the documentation for the endpoint by adding a <a href="https://www.wikidata.org/wiki/Property:P2078">user manual link (P2078)</a> or <a href="https://www.wikidata.org/wiki/Property:P973">described at URL (P973)</a> qualifier. See <a href="https://www.wikidata.org/wiki/Q922063#P6269">this example for how it is done</a>.</li>
                <li>Refresh this table - it might take a few minutes before your service appears in the table.</li>
            </ul>
          </Modal.Body>
        </Modal>
        </>
      );
   }
}
