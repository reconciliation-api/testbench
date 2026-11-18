import React from 'react';
import Alert from 'react-bootstrap/lib/Alert';
import Tabs from 'react-bootstrap/lib/Tabs';
import Tab from 'react-bootstrap/lib/Tab';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import Radio from 'react-bootstrap/lib/Radio';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import Button from 'react-bootstrap/lib/Button';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ReconcileSuggest from './ReconcileSuggest';
import Candidate from './Candidate';
import GenericInput from './GenericInput';
import PreviewRenderer from './PreviewRenderer';
import DataExtensionTab from './DataExtensionTab';
import JSONTree from 'react-json-tree';
import { getSchema } from './JsonValidator';
import { jsonTheme } from './utils';
import PropertyMappingV2 from './PropertyMappingV2';
import PropertyPathInput from './PropertyPathInput';
import { Row } from 'react-bootstrap';

export default class TestBench extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        reconQuery: '',
        reconQueryMatchType: 'name',
        reconQueryRequired: false,
        reconType: 'no-type',
        reconCustomType: undefined,
        reconProperties: [],
        reconLimit: undefined,
        reconUserLanguage: 'en',
        reconResponseValidationErrors: [],
        previewEntityId : undefined
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps?.service?.endpoint !== this.props.service.endpoint) {
      this.formulateReconQuery();
    }
}

  onReconQueryChange = (e) => {
    this.setState({
        reconQuery: e.currentTarget.value
    });
  }

  onReconQueryMatchTypeChange = (e) => {
    this.setState({
        reconQueryMatchType: e.currentTarget.value
    });
  }

  onReconQueryRequiredChange = (e) => {
    this.setState({
        reconQueryRequired: e.currentTarget.checked
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

  onReconUserLanguageChange = (e) => {
    this.setState({
        reconUserLanguage: e.currentTarget.value
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
     let url = this.props.service.endpoint;
     url = `${url.replace(/\/$/, '')}/match`;
     fetcher({url,queries:JSON.stringify(this.formulateReconQuery()),userLanguage:this.state.reconUserLanguage})
        .then(async response => {
           let body = await response.text();
           let parsed;
           try {
              parsed = body === '' ? undefined : JSON.parse(body);
           } catch (parseError) {
              parsed = undefined;
           }
           if (!response.ok) {
              let { summary, items } = this.buildHttpError(response, parsed, body);
              let error = new Error(summary);
              error.items = items;
              throw error;
           }
           if (parsed === undefined) {
              throw new Error('The service responded successfully but sent no readable data.');
           }
           return parsed;
        })
        .then(result =>
           this.setState({
              reconResults: result?.results?.[0]?.candidates?? [],
              reconResponseValidationErrors: this.validateServiceResponse('reconciliation-result-batch', result)
        }))
        .catch(e => {
            this.setState({
              reconError: e.message,
              reconErrorItems: e.items || [],
              reconResults: 'failed',
              reconResponseValidationErrors: [],
        })});
  }

  buildHttpError(response, parsed, rawBody) {
     let messages = this.extractServiceMessages(parsed);
     if (messages.length === 0) {
        let raw = rawBody && rawBody.trim() !== '' ? rawBody.trim() : '';
        return { summary: raw || this.friendlyStatusMessage(response.status), items: [] };
     }
     if (messages.length === 1) {
        return this.humanizeMessage(messages[0]);
     }
     return {
        summary: 'The service rejected the request for the following reasons:',
        items: messages.reduce((acc, m) => {
           let humanized = this.humanizeMessage(m);
           return acc.concat(humanized.summary, humanized.items);
        }, [])
     };
  }

  extractServiceMessages(parsed) {
     if (!parsed || typeof parsed !== 'object') {
        return [];
     }
     if (Array.isArray(parsed.message)) {
        return parsed.message.filter(m => typeof m === 'string' && m.trim() !== '');
     }
     if (typeof parsed.message === 'string' && parsed.message.trim() !== '') {
        return [parsed.message.trim()];
     }
     if (typeof parsed.error === 'string' && parsed.error.trim() !== '') {
        return [parsed.error.trim()];
     }
     return [];
  }

  humanizeMessage(message) {
     let text = message.trim();
     let oneOf = text.match(/^(\S+)\s+must be one of the following values:\s*(.+)$/i);
     if (oneOf) {
        let values = oneOf[2].split(',').map(v => v.trim()).filter(Boolean);
        return {
           summary: `${this.humanizeFieldPath(oneOf[1])} is not supported by this service. Please choose one of the supported values:`,
           items: values
        };
     }
     let fieldMatch = text.match(/^([a-zA-Z_][a-zA-Z0-9_.[\]]*)\s+(.+)$/);
     if (fieldMatch && /[.[]/.test(fieldMatch[1])) {
        return { summary: `${this.humanizeFieldPath(fieldMatch[1])} ${fieldMatch[2]}.`, items: [] };
     }
     return { summary: text, items: [] };
  }

  humanizeFieldPath(path) {
     let last = path
        .split('.')
        .filter(seg => seg !== '' && !/^\d+$/.test(seg) && seg !== 'queries')
        .pop() || path;
     let labels = {
        type: 'The selected type',
        conditions: 'The conditions',
        matchType: 'The match type',
        propertyValue: 'The value',
        propertyId: 'The property',
        matchQuantifier: 'The match quantifier',
        matchQualifier: 'The match qualifier',
        limit: 'The limit',
        properties: 'The properties'
     };
     return labels[last] || (last.charAt(0).toUpperCase() + last.slice(1));
  }

  friendlyStatusMessage(status) {
     if (status === 400) {
        return 'The service could not understand the request. Please check the query values and try again.';
     }
     if (status === 401 || status === 403) {
        return 'You are not authorized to use this service.';
     }
     if (status === 404) {
        return 'The service endpoint could not be found.';
     }
     if (status === 429) {
        return 'Too many requests were sent to the service. Please wait a moment and try again.';
     }
     if (status >= 500) {
        return 'The service ran into an error. Please try again later.';
     }
     return `The service responded with an unexpected status (${status}).`;
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
        let summary = this.state.reconError || 'Something went wrong while contacting the service.';
        let items = this.state.reconErrorItems || [];
        return (
          <Alert bsStyle="danger">
             <strong>The reconciliation request could not be completed</strong>
             <p style={{ marginTop: 8, marginBottom: items.length > 0 ? 8 : 0 }}>{summary}</p>
             {items.length > 0 &&
                (<ul style={{ marginBottom: 0 }}>
                   {items.map((item, idx) => <li key={idx} style={{ wordBreak: 'break-all' }}>{item}</li>)}
                </ul>)}
          </Alert>
        );
     } else if (this.state.reconResults === undefined) {
        return (<div />);
     } else {
        if (this.state.reconResults.length === 0) {
           return (<span className="noResults">No results</span>);
        }
        return (
          <ListGroup>
            {this.state.reconResults.map((result, idx) =>
              <Candidate key={result.id || idx} candidate={result} manifest={this.props.service.manifest} />
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
    const isCustomType = this.state.reconType === "custom-type" && this.state.reconCustomType !== undefined;
    const isNotNoType = this.state.reconType !== "no-type";
    const hasReconProperties = this.state.reconProperties.length > 0;
    const reconLimit = parseInt(this.state.reconLimit);
    const isLimitValid = !isNaN(reconLimit);

    const buildConditions = () => {
      let conditions =
        this.state.reconQuery && this.state.reconQuery.trim() !== ""
          ? [
              {
                matchType: this.state.reconQueryMatchType,
                propertyValue: this.state.reconQuery,
                ...(this.state.reconQueryRequired ? { required: true } : {})
              }
            ]
          : [];

      if (hasReconProperties) {
        const properties = this.state.reconProperties
          .filter((m) => m && m.property && m.value)
          .map((m) => {
            const allValues = [m.value];

            if (m.additionalValues && m.additionalValues?.length > 0) {
              const validAdditionalValues = m.additionalValues.filter(
                (additionalValue) =>
                  additionalValue && additionalValue.trim() !== ""
              );
              allValues.push(...validAdditionalValues);
            }

            const propertyCondition = {
              matchType: "property",
              propertyId: m.property?.id || m.property,
              propertyValue: allValues?.length === 1 ? allValues[0] : allValues,
              required: m.required || false,
              matchQuantifier: m.operator || "any",
              matchQualifier:undefined
            };

            if (m?.qualifier) {
              propertyCondition.matchQualifier = m.qualifier?.id ?? m.qualifier;
            }

            return propertyCondition;
          });

        conditions = conditions.concat(properties);
      }

      return conditions;
    };
        return {
            queries: [{
                ...(isCustomType ? { type: this.state.reconCustomType.id } : isNotNoType ? { type: this.state.reconType } : {}),
                ...(isLimitValid && { limit: Number(this.state.reconLimit) }),
                conditions: buildConditions()
              }]
        };
     
  
}

  formulateQueryUrl() {
     let baseUrl = this.props.service.endpoint;
     if (!baseUrl) {
        return '#';
     }
     
    baseUrl = `${baseUrl.replace(/\/$/, '')}/match`;

     let params = {
        queries: JSON.stringify( this.formulateReconQuery())
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
        {Array.isArray(t.broader) && t.broader.length > 0 && <span className="reconTypeId">{t.broader.map(e => e.id).join(', ')} &gt; </span>}<span className="reconTypeId">{t.id}</span>
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
            <Tab eventKey="reconcile" title="Match">
                <div className="tabContent">
                <Col sm={5}>
                    <Form horizontal>
                        <FormGroup controlId={"conditions"}>
                            <Col componentClass={ControlLabel} sm={2}>{"Conditions:"}</Col>
                           <Col sm={10}>
                           <Row>
                            <Col>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <FormControl
                                        componentClass="select"
                                        value={this.state.reconQueryMatchType}
                                        onChange={this.onReconQueryMatchTypeChange}
                                        style={{ width: "80px" }}>
                                        <option value="name">name</option>
                                        <option value="id">id</option>
                                    </FormControl>
                                    <FormControl
                                        type="text"
                                        placeholder={this.state.reconQueryMatchType === "id" ? "URI / ID" : "Name"}
                                        value={this.state.reconQuery}
                                        onChange={this.onReconQueryChange}
                                        style={{ flex: 1 }} />
                                    <Checkbox
                                        checked={this.state.reconQueryRequired}
                                        onChange={this.onReconQueryRequiredChange}
                                        style={{ margin: 0, whiteSpace: "nowrap" }}>
                                        Required
                                    </Checkbox>
                                </div>

                                    
                            
                        <PropertyMappingV2
                          service={this.props.service}
                          value={this.state.reconProperties}
                          onChange={this.onReconPropertiesChange}
                        />
                            </Col>
                            </Row>
                            </Col>
                        </FormGroup>
                            
                        <FormGroup controlId="reconcileType">
                            <Col componentClass={ControlLabel} sm={2}>Type:</Col>
                            <Col sm={10}>
                                {this.renderTypeChoices()}
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
                        <FormGroup controlId="reconUserLanguage" style={{ display: "flex",alignItems: "flex-end" }}>
                            <Col sm={2} componentClass={ControlLabel}>User interface language:</Col>
                            <Col sm={10}>
                            <FormControl
                                    type="text"
                                    placeholder="Enter the language of the intended audience"
                                    value={this.state.reconUserLanguage}
                                    onChange={(v) => this.onReconUserLanguageChange(v)} />
                            </Col>
                        </FormGroup>

                     <Col sm={3} smOffset={5}> <Button onClick={this.onSubmitReconciliation} type="submit" bsStyle="primary" disabled={!this.props.service}>Reconcile</Button></Col>
                        
                    </Form>
                </Col>
                <Col sm={3}>
                    <JSONTree
                            theme={jsonTheme}
                            data={this.formulateReconQuery()}
                          getItemString={() => ''}
                          shouldExpandNode={() => true}
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
                            <PropertyPathInput service={this.props.service} id="property-suggest-test" />
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
                                <GenericInput service={this.props.service} entityClass="entity" id="entity-input-preview" explicitSubmit hideManualToggle onChange={this.onPreviewEntityChange} />
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