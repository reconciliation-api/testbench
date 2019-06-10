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

  onSubmitReconciliation(e) {
     e.preventDefault();
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
    return (
       <Tabs defaultActiveKey="reconcile" id="test-bench-tabs">
         <Tab eventKey="reconcile" title="Reconcile">
            <div className="tabContent">
              <Form horizontal>
                <FormGroup controlId="reconcileName">
                   <Col componentClass={ControlLabel} sm={1}>Name:</Col>
                   <Col sm={3}>
                      <InputGroup>
                      <FormControl
                         type="text"
                         placeholder="Entity to reconcile"
                         value={this.state.reconQuery}
                         onChange={this.onReconQueryChange} />
                        <InputGroup.Button><Button onClick={this.onSubmitReconciliation} type="submit" bsStyle="primary">Reconcile</Button></InputGroup.Button>
                      </InputGroup>
                   </Col>
                </FormGroup>
                <FormGroup controlId="reconcileType">
                   <Col componentClass={ControlLabel} sm={1}>Type:</Col>
                   <Col sm={4}>
                      {this.renderTypeChoices()}
                   </Col>
                </FormGroup>
                {(this.hasPropertySuggest ? 
                <FormGroup controlId="reconcileProperties">
                   <Col componentClass={ControlLabel} sm={1}>Properties:</Col>
                   <Col sm={4}>
                     <PropertyMapping manifest={this.props.manifest} value={this.state.reconProperties} onChange={this.onReconPropertiesChange} />
                   </Col>
                </FormGroup> : <div/>)}
              </Form>
              
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
