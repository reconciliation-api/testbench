import React from 'react';
import Table from 'react-bootstrap/lib/Table';
import FeatureRow from './FeatureRow.js';

export default class FeatureTable extends React.Component {
    constructor() {
      super();
       this.state = {
         services: []
       };

       this.sparql_query = (
        "SELECT ?service ?serviceLabel ?endpoint ?documentation WHERE {" +
        " ?service p:P6269 ?statement."+
        " ?statement ps:P6269 ?endpoint ;"+
        "     pq:P2700 wd:Q64490175. "+
        " OPTIONAL { ?statement pq:P973 ?documentation }" +
        "  SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". } " +
        "}");
    }

    refreshServicesFromWD() {
       let url = new URL("https://query.wikidata.org/sparql");
       let params = {query:this.sparql_query, format: 'json'};
       Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
       fetch(url)
        .then(result => result.json())
        .then(result =>
            this.setState({
              services: result.results.bindings.map(entry =>
                <FeatureRow endpoint={entry.endpoint.value} name={entry.serviceLabel.value} documentation={'documentation' in entry ? entry.documentation.value : undefined} wd_uri={entry.service.value} key={entry.endpoint.value} />
              )
           })
        )
        .catch(error => console.log(error));
    }

    componentDidMount() {
       this.refreshServicesFromWD();
    }

    render() {
      return (
        <Table striped bordered hover>
           <thead>
             <tr>
               <td>Name</td>
               <td>Endpoint</td>
               <td>Reacheable</td>
               <td>View entities</td>
               <td>Suggest entities</td>
               <td>Suggest types</td>
               <td>Suggest properties</td>
               <td>Preview entities</td>
               <td>Extend data</td>
             </tr>
           </thead>
           <tbody>
              {this.state.services}
           </tbody>
        </Table>
      );
   }
}
