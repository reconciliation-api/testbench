import React from 'react';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import Button from 'react-bootstrap/lib/Button';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import Modal from 'react-bootstrap/lib/Modal';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import GenericInput from './GenericInput';
import DataExtensionValue from './DataExtensionValue';
import JSONTree from 'react-json-tree';
import PropertySettingsRow from './PropertySettingsRow';
import {jsonTheme} from './utils';
import { getSchema } from './JsonValidator';

export default class DataExtensionTab extends React.Component {

  constructor() {
      super();
      this.state = {
        entity: undefined,
        properties: [{ id: undefined, settings: { content: 'literal' } }],
        extendResults: undefined,
        validationErrors: [],
        extendError: undefined,
        showProposeModal: false
      };
      this._isMounted = false;
  }

  componentDidMount() {
      this._isMounted = true;
  }

  componentWillUnmount() {
      this._isMounted = false;
  }

  componentDidUpdate(prevProps) {
      if (prevProps.service !== this.props.service && this.state.proposeType !== undefined) {
          this.setState({proposeType: undefined});
      }
  }

  onProposeTypeChange = (e) => {
      this.setState({proposeType: e.target.value});
  }

  openProposeModal = (e) => {
      e.preventDefault();
      this.setState({showProposeModal: true});
  }

  closeProposeModal = () => {
      this.setState({showProposeModal: false});
  }

  proposeTypeName(id) {
      if (/^[A-Za-z][\w.-]*:(?!\/\/)/.test(id)) {
          return id.substring(id.indexOf(':') + 1);
      }
      return id;
  }

  formulateProposeUrl() {
      if (!this.state.proposeType) {
          return null;
      }
      const extend = (this.props.service.manifest && this.props.service.manifest.extend) || {};
      let base;
      const propose = extend.propose_properties;
      if (propose && (propose.service_url || propose.service_path)) {
          base = (propose.service_url || '') + (propose.service_path || '');
      } else if (this.props.service.endpoint) {
          try {
              base = new URL(this.props.service.endpoint).origin + '/extend/propose';
          } catch (e) {
              return null;
          }
      } else {
          return null;
      }
      try {
          const url = new URL(base, this.props.service.endpoint);
          url.searchParams.set('type', this.state.proposeType);
          return url.toString();
      } catch (e) {
          return null;
      }
  }

  openProposeWindow = (e) => {
      e.preventDefault();
      const url = this.formulateProposeUrl();
      if (url) {
          window.open(url, '_blank', 'noopener,noreferrer');
      }
  }

  onEntityChange = (newValue) => {
      this.setState({
          entity: newValue,
          extendResults: undefined,
          validationErrors: [],
          extendError: undefined
      });
  }

  addProperty = () => {
      const newProperties = this.state.properties.slice();
      newProperties.push({ id: undefined, settings: { content: 'literal' } });
      this.setState({
          properties: newProperties,
          extendResults: undefined,
          validationErrors: [],
          extendError: undefined
      });
  }

  removeProperty = (index) => {
      if (this.state.properties.length <= 1) {
          return;
      }
      const newProperties = this.state.properties.slice();
      newProperties.splice(index, 1);
      this.setState({
          properties: newProperties,
          extendResults: undefined,
          validationErrors: [],
          extendError: undefined
      });
  }

  onPropertyChange = (index, field, value) => {
      const newProperties = this.state.properties.slice();
      if (field === 'id') {
          newProperties[index] = { ...newProperties[index], id: value };
      } else if (field === 'settings.content') {
          newProperties[index] = { 
              ...newProperties[index], 
              settings: { ...newProperties[index].settings, content: value } 
          };
      }
      this.setState({
          properties: newProperties,
          extendResults: undefined,
          validationErrors: [],
          extendError: undefined
      });
  }

  hasValidProperties() {
      return this.state.properties.some(p => p.id && (p.id.id || p.id));
  }

  normalizeEntityId(id) {
      if (typeof id !== 'string') {
          return id;
      }
      const value = id.trim();
      // Only trim full http(s) URIs down to their local identifier
      // (the last path or fragment segment), e.g.
      // http://kg.artsdata.ca/resource/K10-496 -> K10-496
      if (!/^https?:\/\//i.test(value)) {
          return id;
      }
      const withoutTrailing = value.replace(/[/#]+$/, '');
      const lastSep = Math.max(withoutTrailing.lastIndexOf('/'), withoutTrailing.lastIndexOf('#'));
      if (lastSep === -1 || lastSep === withoutTrailing.length - 1) {
          return id;
      }
      return withoutTrailing.substring(lastSep + 1);
  }

  formulateQuery() {
      if (this.state.entity !== undefined && this.hasValidProperties()) {
          return {
            ids: [this.normalizeEntityId(this.state.entity.id)],
            properties: this.state.properties
              .filter(p => p.id && (p.id.id || p.id))
              .map(p => ({
                id: p.id.id || p.id,
                settings: { content: p.settings?.content || 'literal' }
              }))
          };
      } else {
          return {};
      }
  }

  formulateQueryUrl() {
      let baseUrl = this.props.service.endpoint;
      if (!baseUrl) {
         return '#';
      }
      baseUrl = `${baseUrl.replace(/\/$/, '')}/extend`;
      let params = {
        extend: JSON.stringify(this.formulateQuery())
      };
      let url = new URL(baseUrl);
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
      return url.toString();
  }

  resetQuery = (e) => {
        e.preventDefault();
        this.setState({
                entity: undefined,
                properties: [{ id: undefined, settings: { content: 'literal' } }],
                extendResults: undefined,
                validationErrors: undefined,
                extendError: undefined
        });
  }

  submitQuery = (e) => {
        e.preventDefault();
        if (!this.state.entity || !this.hasValidProperties()) {
            return;
        }
        this.setState({extendResults: 'fetching', extendError: undefined});
        let fetcher = this.props.service.postFetcher();
        let url = `${this.props.service.endpoint.replace(/\/$/, '')}/extend`;
        fetcher({url, queries: JSON.stringify(this.formulateQuery())})
           .then(result => result.json())
           .then(result => {
               if (!this._isMounted) {
                   return;
               }
               this.setState({
                  extendResults: result,
                  validationErrors: this.validateServiceResponse(result),
                  extendError: undefined
               });
           })
           .catch(e => {
              if (!this._isMounted) {
                  return;
              }
              this.setState({
                  extendResults: 'failed',
                  extendError: e.message
              });
           });
  }

  renderResponseValidationErrors() {
        return <div/>;
  }

  getExtendedValuesMap() {
        const results = this.state.extendResults;
        const entityId = this.normalizeEntityId(this.state.entity.id);
        if (!results || results.rows === undefined) {
             return {};
        }
        const map = {};
        // 1.0-draft: rows is an array of { id, properties: [{ id, values }] }
        if (Array.isArray(results.rows)) {
             const row = results.rows.find(r => r && r.id === entityId);
             if (!row || !Array.isArray(row.properties)) {
                  return map;
             }
             const requestedProperties = this.state.properties.filter(p => p.id && (p.id.id || p.id));
             const requestedIds = new Set(requestedProperties.map(p => p.id.id || p.id));
             row.properties.forEach((prop, idx) => {
                 if (prop && prop.values) {
                     const requestedProp = requestedProperties[idx];
                     const requestedId = requestedProp && (requestedProp.id.id || requestedProp.id);
                     const matchKey = requestedIds.has(prop.id)
                         ? prop.id
                         : (requestedId || prop.id);
                     map[matchKey] = prop.values;
                 }
             });
        } else {
             // Legacy: rows is an object map rows[entityId][propertyId]
             if (results.rows[entityId] !== undefined) {
                 Object.keys(results.rows[entityId]).forEach(propId => {
                     map[propId] = results.rows[entityId][propId];
                 });
             }
        }
        return map;
  }

  renderQueryResults() {
        if (this.state.extendResults === 'fetching') {
             return (<div className="resultsPlaceholder">Querying the service...</div>);
        } else if (this.state.extendResults === 'failed') {
             return (<div className="resultsPlaceholder">Error: {this.state.extendError}</div>);
        } else if (this.state.extendResults === undefined || this.state.entity === undefined || !this.hasValidProperties()) {
             return (<div />);
        } else {
             if (this.state.extendResults.rows === undefined) {
                  return (<span className="resultsPlaceholder">No <code>rows</code> attribute in the response.</span>);
             }
             const valuesMap = this.getExtendedValuesMap();
             const requestedProperties = this.state.properties.filter(p => p.id && (p.id.id || p.id));
             
             if (requestedProperties.length === 0) {
                  return (<span className="noResults">No properties requested</span>);
             }

             const propertyResults = requestedProperties.map(prop => {
                 const propId = prop.id.id || prop.id;
                 const values = valuesMap[propId];
                 const propertyName = prop.id?.name || propId;
                 return { propertyName, propId, values: values || [] };
             });

             const hasAnyValues = propertyResults.some(pr => pr.values.length > 0);
             if (!hasAnyValues) {
                  return (<span className="noResults">No results</span>);
             }

             return (
                <div>
                   {propertyResults.map((propResult, propIdx) => (
                       <div key={propIdx} style={{ marginBottom: '20px' }}>
                           <h5 style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                               {propResult.propertyName} <small style={{ color: '#666' }}>({propResult.propId})</small>
                           </h5>
                           {propResult.values.length === 0 ? (
                               <span className="noResults">No values</span>
                           ) : (
                               <ListGroup>
                                   {propResult.values.map((value, valIdx) =>
                                       <DataExtensionValue value={value} key={"data-extension-result-" + propIdx + "-" + valIdx} />
                                   )}
                               </ListGroup>
                           )}
                       </div>
                   ))}
                </div>
             );
        }
  }

  validateServiceResponse(response) {
	let schema = getSchema(this.props.service.latestCompatibleVersion, 'data-extension-response'); 
        let valid = schema(response);
        if (!valid) {
             return schema.errors.map(error => error.dataPath+' '+error.message);
        } else {
             return [];
        }
  }

  render() {
    return (
     <div>
        <Col sm={5}>
            <Form horizontal>
                <FormGroup controlId="dataExtensionEntity">
                    <Col componentClass={ControlLabel} sm={2}>Entity:</Col>
                    <Col sm={10}>
                        <GenericInput
                            service={this.props.service}
                            placeholder="Search by name, or enter an ID/URI"
                            value={this.state.entity}
                            entityClass="entity"
                            dynamicEntry
                            onChange={this.onEntityChange} />
                    </Col>
                </FormGroup>
                
                <FormGroup controlId="dataExtensionProperties">
                    <Col componentClass={ControlLabel} sm={2}>Properties:</Col>
                    <Col sm={10}>
                        <div className="property-mapping-container">
                            <Col>
                                {this.state.properties.map((property, index) => (
                                    <PropertySettingsRow
                                        key={index}
                                        index={index}
                                        property={property}
                                        service={this.props.service}
                                        onChange={this.onPropertyChange}
                                        onDelete={this.removeProperty}
                                    />
                                ))}
                            </Col>
                            <Col>
                                <Button
                                    onClick={this.addProperty}
                                    className="add-button"
                                    disabled={!this.state.entity}
                                >
                                    Add Property
                                </Button>
                            </Col>
                        </div>
                        <HelpBlock>
                            Not sure which properties to use?{' '}
                            <a href="#" onClick={this.openProposeModal}>Proposed properties</a>
                        </HelpBlock>
                    </Col>
                </FormGroup>
                
                <FormGroup controlId="submitGroup">
                        <Col sm={10} />
                        <Col sm={2}>
                            <InputGroup>
                                <InputGroup.Button><Button onClick={this.resetQuery} type="button" bsStyle="default">Reset</Button></InputGroup.Button>
                                <InputGroup.Button><Button onClick={this.submitQuery} type="button" bsStyle="primary" disabled={!this.state.entity || !this.hasValidProperties()}>Submit</Button></InputGroup.Button>
                            </InputGroup>
                        </Col>
                </FormGroup>
            </Form>
        </Col>
        <Col sm={3}>
            <JSONTree
                    theme={jsonTheme}
                    data={this.formulateQuery()}
                    getItemString={() => ''}
                    shouldExpandNode={() => true}
                    hideRoot={true} />
            <br />
            <a href={this.formulateQueryUrl()} title="See query results on the service" target="_blank" rel="noopener noreferrer">View query results on the service</a>
            {this.renderResponseValidationErrors()}
        </Col>
        <Col sm={4}>
            {this.renderQueryResults()}
        </Col>

        <Modal show={this.state.showProposeModal} onHide={this.closeProposeModal}>
            <Modal.Header closeButton>
                <Modal.Title>Browse proposed properties for a class</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Pick a class to view the properties.
                </p>
                <FormGroup controlId="dataExtensionProposeType">
                    <ControlLabel>Class:</ControlLabel>
                    <FormControl
                        componentClass="select"
                        value={this.state.proposeType || ''}
                        onChange={this.onProposeTypeChange}>
                        <option value="" disabled>Select a class…</option>
                        {((this.props.service.manifest && this.props.service.manifest.defaultTypes) || []).map(t =>
                            <option key={t.id} value={this.proposeTypeName(t.id)}>{t.name || t.id}</option>)}
                    </FormControl>
                </FormGroup>
            </Modal.Body>
            <Modal.Footer>
                <Button bsStyle="default" onClick={this.closeProposeModal}>Close</Button>
                <Button
                    bsStyle="primary"
                    disabled={!this.formulateProposeUrl()}
                    onClick={this.openProposeWindow}>View proposed properties</Button>
            </Modal.Footer>
        </Modal>

     </div>
    );
  }
}