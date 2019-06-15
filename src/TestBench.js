import React from 'react';
import Tabs from 'react-bootstrap/lib/Tabs';
import Tab from 'react-bootstrap/lib/Tab';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import Radio from 'react-bootstrap/lib/Radio';
import Button from 'react-bootstrap/lib/Button';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import ReconcileSuggest from './ReconcileSuggest.js';
import PropertyMapping from './PropertyMapping.js';
import JSONTree from 'react-json-tree';
import fetchJsonp from 'fetch-jsonp';

export default class TestBench extends React.Component {
  constructor() {
    super();

    this.state = {
        reconQuery: '',
        reconType: 'no-type',
        reconCustomType: undefined,
        reconProperties: []
    };
  }

  onReconQueryChange = (e) => {
    this.setState({
        reconQuery: e.currentTarget.value
    });
  }

  onReconTypeChange = (e) => {
    this.setState({
        reconType: e.currentTarget.value
    });
  }

  onCustomTypeChange = (v) => {
    this.setState({
        reconCustomType: v
    });
  }

  onReconPropertiesChange = (values) => {
    this.setState({
        reconProperties: values
    });
  }

  get defaultTypes() {
     if (this.props.manifest) {
        return this.props.manifest.defaultTypes || [];
    } else {
        return [];
    }
  }

  get hasTypeSuggest() {
     return this.props.manifest && this.props.manifest.suggest && this.props.manifest.suggest.type;
  }

  get hasPropertySuggest() {
     return this.props.manifest && this.props.manifest.suggest && this.props.manifest.suggest.property;
  }

  onSubmitReconciliation = (e) => {
     e.preventDefault();
     if (!this.props.endpoint) {
        return;
     }
     this.setState({reconResults: 'fetching'});
     fetchJsonp(this.formulateQueryUrl(), {timeout: 20000})
        .then(result => result.json())
        .then(result =>
           this.setState({
              reconResults: result.q0.result
        }))
        .catch(e => {
            this.setState({
              reconError: e.message,
              reconResults: 'failed',
        })});
  }
 
  renderQueryResults() {
     if (this.state.reconResults === 'fetching') {
        return (<div className="resultsPlaceholder">Querying the service...</div>);
     } else if (this.state.reconResults === 'failed') {
        return (<div className="resultsPlaceholder">Error: {this.state.reconError}</div>);
     } else if (this.state.reconResults === undefined) {
        return (<div />);
     } else {
        if (this.state.reconResults.length === 0) {
           return (<span className="noResults">No results</span>);
        }
        return (
          <ul>
            {this.state.reconResults.map(result =>
              <li key={result.id}>
                <span className="reconResultName">{result.name}</span> (<span className="reconResultId">{result.id}</span>)
              </li>
            )}
          </ul>
        );
     }
  }  

  formulateReconQuery() {
     let query = {
        query: this.state.reconQuery,
     };
     if (this.state.reconType === 'custom-type' && this.state.reconCustomType !== undefined) {
        query.type = this.state.reconCustomType.id;
     }
     if (this.state.reconProperties.length > 0) {
        query.properties = this.state.reconProperties
           .filter(m => m !== undefined && m.property && m.value)
           .map(m => {return {pid: m.property.id, v: m.value}})
     }
     return query;
  }

  formulateQueryUrl() {
     let baseUrl = this.props.endpoint;
     if (!baseUrl) {
        return '#';
     }
     let params = {
        queries: JSON.stringify({q0: this.formulateReconQuery()})
     };
     let url = new URL(baseUrl);
     Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
     return url.toString();
  }
 
  renderTypeChoices() {
    let current = this.state.reconType;
    let choices = this.defaultTypes.map(t =>
       <Radio
          name="reconcileType"
          key={'default-'+t.id}
          value={'default-'+t.id}
          checked={current === 'default-'+t.id}
          onChange={this.onReconTypeChange}>
        {t.name}<br /><span className="reconTypeId">{t.id}</span>
      </Radio>
    );
    if (this.hasTypeSuggest) {
       choices.push(<Radio
         name="reconcileType"
         key="custom-type"
         value="custom-type"
         checked={current === 'custom-type'}
         onChange={this.onReconTypeChange}>
           Custom:
           <div style={{display: 'inline-block'}}>{' '}
             <ReconcileSuggest
                manifest={this.props.manifest}
                entityClass="type"
                id="recon-custom-type-suggest"
                value={this.state.reconCustomType} 
                onChange={this.onCustomTypeChange} />
           </div>
        </Radio>);
    }
    choices.push(<Radio
        name="reconcileType"
        key="no-type"
        value="no-type"
        checked={current === 'no-type'}
        onChange={this.onReconTypeChange}>Reconcile against no particular type</Radio>);
    return choices;
  }

  render() {
    const theme = {
       scheme: 'monokai',
        author: 'wimer hazenberg (http://www.monokai.nl)',
        base00: '#000000', // '#272822',
        base01: '#383830',
        base02: '#49483e',
        base03: '#75715e',
        base04: '#a59f85',
        base05: '#00ff00', //'#f8f8f2',
        base06: '#f5f4f1',
        base07: '#f9f8f5',
        base08: '#f92672',
        base09: '#fd971f',
        base0A: '#f4bf75',
        base0B: '#a6e22e',
        base0C: '#a1efe4',
        base0D: '#66d9ef',
        base0E: '#ae81ff',
        base0F: '#cc6633'
        };
        
    return (
       <Tabs defaultActiveKey="reconcile" id="test-bench-tabs">
         <Tab eventKey="reconcile" title="Reconcile">
            <div className="tabContent">
              <Col sm={3}>
                <Form horizontal>
                    <FormGroup controlId="reconcileName">
                    <Col componentClass={ControlLabel} sm={2}>Name:</Col>
                    <Col sm={8}>
                        <InputGroup>
                        <FormControl
                            type="text"
                            placeholder="Entity to reconcile"
                            value={this.state.reconQuery}
                            onChange={this.onReconQueryChange} />
                            <InputGroup.Button><Button onClick={this.onSubmitReconciliation} type="submit" bsStyle="primary" disabled={!this.props.endpoint}>Reconcile</Button></InputGroup.Button>
                        </InputGroup>
                    </Col>
                    </FormGroup>
                    <FormGroup controlId="reconcileType">
                    <Col componentClass={ControlLabel} sm={2}>Type:</Col>
                    <Col sm={8}>
                        {this.renderTypeChoices()}
                    </Col>
                    </FormGroup>
                    {(this.hasPropertySuggest ? 
                    <FormGroup controlId="reconcileProperties">
                    <Col componentClass={ControlLabel} sm={2}>Properties:</Col>
                    <Col sm={8}>
                        <PropertyMapping manifest={this.props.manifest} value={this.state.reconProperties} onChange={this.onReconPropertiesChange} />
                    </Col>
                    </FormGroup> : <div/>)}
                </Form>
              </Col>
              <Col sm={2}>
                 <JSONTree
                        theme={theme}
                        data={this.formulateReconQuery()}
                        getItemString={(type, data, itemType, itemString) => ''}
                        shouldExpandNode={(keyName, data, level) => true}
                        hideRoot={true} />
                 <br />
                 <a href={this.formulateQueryUrl()} title="See query results on the service" target="_blank" rel="noopener noreferrer">View query results on the service</a>
              </Col>
              <Col sm={2}>
                 {this.renderQueryResults()}
              </Col>
            </div>
         </Tab>
         <Tab eventKey="suggest" title="Suggest">
            <div className="tabContent">
              <Form horizontal>
                <FormGroup controlId="suggestEntityTestBench">
                    <Col componentClass={ControlLabel} sm={1}>Entity:</Col>
                    <Col sm={3}>
                        <ReconcileSuggest manifest={this.props.manifest} entityClass="entity" id="entity-suggest-test" />
                    </Col>
                </FormGroup>
                <FormGroup controlId="suggestTypeTestBench">
                    <Col componentClass={ControlLabel} sm={1}>Type:</Col>
                    <Col sm={3}>
                        <ReconcileSuggest manifest={this.props.manifest} entityClass="type" id="type-suggest-test" />
                    </Col>
                </FormGroup>
                <FormGroup controlId="suggestPropertyTestBench">
                    <Col componentClass={ControlLabel} sm={1}>Property:</Col>
                    <Col sm={3}>
                        <ReconcileSuggest manifest={this.props.manifest} entityClass="property" id="property-suggest-test" />
                    </Col>
                </FormGroup>
              </Form>
            </div>
         </Tab>
         <Tab eventKey="preview" title="Preview">
           <div className="tabContent">
                <p>Coming soon</p>
           </div>
         </Tab>
         <Tab eventKey="extend" title="Extend">
           <div className="tabContent">
                <p>Coming soon</p>
           </div>
         </Tab>
       </Tabs>
    );
  }
} 
