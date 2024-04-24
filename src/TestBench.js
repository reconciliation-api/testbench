import React from 'react';
import Alert from 'react-bootstrap/lib/Alert';
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
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ReconcileSuggest from './ReconcileSuggest.js';
import PropertyMapping from './PropertyMapping.js';
import Candidate from './Candidate.js';
import GenericInput from './GenericInput.js';
import PreviewRenderer from './PreviewRenderer.js';
import DataExtensionTab from './DataExtensionTab.js';
import JSONTree from 'react-json-tree';
import { getSchema } from './JsonValidator.js';
import { jsonTheme } from './utils.js';

export default class TestBench extends React.Component {
  constructor() {
    super();

    this.state = {
        reconQuery: '',
        reconType: 'no-type',
        reconCustomType: undefined,
        reconProperties: [],
        reconLimit: undefined,
        reconResponseValidationErrors: [],
        previewEntityId : undefined
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

  onReconLimitChange = (e) => {
    this.setState({
        reconLimit: e.currentTarget.value
    });
  }

  onPreviewEntityChange = (value) => {
    this.setState({
        previewEntityId: value !== undefined ? value.id : undefined
    });
  };

  get defaultTypes() {
     if (this.props.service && this.props.service.manifest) {
        return this.props.service.manifest.defaultTypes || [];
    } else {
        return [];
    }
  }

  get hasTypeSuggest() {
     return (this.props.service &&
	     this.props.service.manifest &&
	     this.props.service.manifest.suggest &&
	     this.props.service.manifest.suggest.type);
  }

  get hasPropertySuggest() {
     return (this.props.service &&
	     this.props.service.manifest &&
	     this.props.service.manifest.suggest &&
	     this.props.service.manifest.suggest.property);
  }

  get hasPreviewService() {
     return (this.props.service &&
             this.props.service.manifest &&
             this.props.service.manifest.preview);
  } 

  get hasDataExtension() {
     return (this.props.service &&
             this.props.service.manifest &&
             this.props.service.manifest.extend);
  }

  onSubmitReconciliation = (e) => {
     e.preventDefault();
     if (!this.props.service || !this.props.service.endpoint) {
        return;
     }
     this.setState({reconResults: 'fetching'});
     let fetcher = this.props.service.postFetcher();
     fetcher({url:this.props.service.endpoint,queries:JSON.stringify({q0: this.formulateReconQuery()})})
        .then(result => result.json())
        .then(result =>
           this.setState({
              reconResults: result.q0.result,
              reconResponseValidationErrors: this.validateServiceResponse('reconciliation-result-batch', result)
        }))
        .catch(e => {
            this.setState({
              reconError: e.message,
              reconResults: 'failed',
        })});
  }

  validateServiceResponse(schemaName, response) {
     let schema = getSchema(this.props.service.latestCompatibleVersion, schemaName);
     let valid = schema(response);
     if (!valid) {
        return schema.errors.map(error => error.dataPath+' '+error.message);
     } else {
        return [];
     }
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
          <ListGroup>
            {this.state.reconResults.map(result =>
              <Candidate candidate={result} manifest={this.props.service.manifest} />
            )}
          </ListGroup>
        );
     }
  }

  renderReconResponseValidationErrors() {
    if (this.state.reconResponseValidationErrors.length === 0) {
        return (<div />);
    } else {
        return (<Alert bsStyle="warning">
           <strong>Validations error for reconcilation response</strong>
           <ul>
           {this.state.reconResponseValidationErrors.map((error, idx) => 
              <li key={idx}>{error}</li>
           )}
          </ul>
        </Alert>);
    }
  }

  renderManifestValidationErrors() {
     let manifest = this.props.service.manifest;
     let errors = this.validateServiceResponse('manifest', manifest);
     if (errors.length === 0) {
        return (<div />);
     } else {
        return (<Alert bsStyle="warning">
           <strong>Validation errors for service manifest</strong>
           <ul>
                {errors.map((error, idx) =>
                  (<li key={idx}>{error}</li>))}
           </ul>
        </Alert>);
     }
  }

  formulateReconQuery() {
     let query = {
        query: this.state.reconQuery,
     };
     if (this.state.reconType === 'custom-type' && this.state.reconCustomType !== undefined) {
        query.type = this.state.reconCustomType.id;
     } else if (this.state.reconType !== 'no-type') {
        query.type = this.state.reconType;
     }
     if (this.state.reconProperties.length > 0) {
        query.properties = this.state.reconProperties
           .filter(m => m !== undefined && m.property && m.value)
           .map(m => {return {pid: m.property.id, v: m.value}})
     }
     if (!isNaN(parseInt(this.state.reconLimit))) {
        query.limit = parseInt(this.state.reconLimit);
     }
     return query;
  }

  formulateQueryUrl() {
     let baseUrl = this.props.service.endpoint;
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
          key={"key_"+t.id}
          value={t.id}
          checked={current === t.id}
          onChange={this.onReconTypeChange}>
        {t.name}<br />
        {Array.isArray(t.broader) && t.broader.length && <span className="reconTypeId">{t.broader.map(e => e.id).join(', ')} &gt; </span>}<span className="reconTypeId">{t.id}</span>
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
           <div>
             <ReconcileSuggest
                service={this.props.service}
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
    return (
       <div>
        {this.renderManifestValidationErrors()}
        <Tabs defaultActiveKey="reconcile" animation={false} id="test-bench-tabs">
            <Tab eventKey="reconcile" title="Reconcile">
                <div className="tabContent">
                <Col sm={5}>
                    <Form horizontal>
                        <FormGroup controlId="reconcileName">
                            <Col componentClass={ControlLabel} sm={2}>Name:</Col>
                            <Col sm={10}>
                                <InputGroup>
                                <FormControl
                                    type="text"
                                    placeholder="Entity to reconcile"
                                    value={this.state.reconQuery}
                                    onChange={this.onReconQueryChange} />
                                    <InputGroup.Button><Button onClick={this.onSubmitReconciliation} type="submit" bsStyle="primary" disabled={!this.props.service}>Reconcile</Button></InputGroup.Button>
                                </InputGroup>
                            </Col>
                        </FormGroup>
                        <FormGroup controlId="reconcileType">
                            <Col componentClass={ControlLabel} sm={2}>Type:</Col>
                            <Col sm={10}>
                                {this.renderTypeChoices()}
                            </Col>
                        </FormGroup>
                        <FormGroup controlId="reconcileProperties">
                            <Col componentClass={ControlLabel} sm={2}>Properties:</Col>
                            <Col sm={10}>
                                <PropertyMapping service={this.props.service} value={this.state.reconProperties} onChange={this.onReconPropertiesChange} />
                            </Col>
                        </FormGroup>
                        <FormGroup controlId="reconcileLimit">
                            <Col componentClass={ControlLabel} sm={2}>Limit:</Col>
                            <Col sm={10}>
                            <FormControl
                                    type="number"
                                    placeholder="Maximum number of candidates"
                                    value={this.state.reconLimit}
                                    onChange={(v) => this.onReconLimitChange(v)} />
                            </Col>
                        </FormGroup>
                    </Form>
                </Col>
                <Col sm={3}>
                    <JSONTree
                            theme={jsonTheme}
                            data={this.formulateReconQuery()}
                            getItemString={(type, data, itemType, itemString) => ''}
                            shouldExpandNode={(keyName, data, level) => true}
                            hideRoot={true} />
                    <br />
                    <a href={this.formulateQueryUrl()} title="See query results on the service" target="_blank" rel="noopener noreferrer">View query results on the service</a>
                    {this.renderReconResponseValidationErrors()}
                </Col>
                <Col sm={4}>
                    {this.renderQueryResults()}
                </Col>
                </div>
            </Tab>
            <Tab eventKey="suggest" title="Suggest">
                <div className="tabContent">
                <Form horizontal>
                    <FormGroup controlId="suggestEntityTestBench">
                        <Col componentClass={ControlLabel} sm={1}>Entity:</Col>
                        <Col sm={11}>
                            <ReconcileSuggest service={this.props.service} entityClass="entity" id="entity-suggest-test" />
                        </Col>
                    </FormGroup>
                    <FormGroup controlId="suggestTypeTestBench">
                        <Col componentClass={ControlLabel} sm={1}>Type:</Col>
                        <Col sm={11}>
                            <ReconcileSuggest service={this.props.service} entityClass="type" id="type-suggest-test" />
                        </Col>
                    </FormGroup>
                    <FormGroup controlId="suggestPropertyTestBench">
                        <Col componentClass={ControlLabel} sm={1}>Property:</Col>
                        <Col sm={11}>
                            <ReconcileSuggest service={this.props.service} entityClass="property" id="property-suggest-test" />
                        </Col>
                    </FormGroup>
                </Form>
                </div>
            </Tab>
            <Tab eventKey="preview" title="Preview" disabled={!this.hasPreviewService}>
            <div className="tabContent">
                {(this.hasPreviewService ?
                  <div>
                    <Form horizontal>
                        <FormGroup controlId="suggestEntityTestBench">
                            <Col componentClass={ControlLabel} sm={1}>Entity:</Col>
                            <Col sm={11}>
                                <GenericInput service={this.props.service} entityClass="entity" id="entity-input-preview" explicitSubmit onChange={this.onPreviewEntityChange} />
                            </Col>
                        </FormGroup>
                    </Form>
                    <PreviewRenderer id={this.state.previewEntityId} settings={this.props.service.manifest.preview} />
                 </div>
                 : <p>Previewing is not supported by the service.</p>)}
            </div>
            </Tab>
            <Tab eventKey="extend" title="Extend" disabled={!this.hasDataExtension}>
            <div className="tabContent">
                {(this.hasDataExtension ?
                    <DataExtensionTab service={this.props.service} />
                 : <p>Data extension is not supported by the service.</p>)}
            </div>
            </Tab>
        </Tabs>
       </div>
    );
  }
}
