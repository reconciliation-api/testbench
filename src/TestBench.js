import React from 'react';
import Tabs from 'react-bootstrap/lib/Tabs';
import Tab from 'react-bootstrap/lib/Tab';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import Radio from 'react-bootstrap/lib/Radio';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import ReconcileSuggest from './ReconcileSuggest.js';
import PropertyMapping from './PropertyMapping.js';

export default class TestBench extends React.Component {
  constructor() {
    super();
    this.state = {
    };
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
 
  renderTypeChoices() {
    let choices = this.defaultTypes.map(t =>
       <Radio name="reconcileType" key={'default-'+t.id}>{t.name}<br /><span className="reconTypeId">{t.id}</span></Radio>
    );
    if (this.hasTypeSuggest) {
       choices.push(<Radio name="reconcileType" key="custom-type">
           Custom:
           <div style={{display: 'inline-block'}}>{' '}
             <ReconcileSuggest manifest={this.props.manifest} entityClass="type" id="recon-custom-type-suggest" />
           </div>
        </Radio>);
    }
    choices.push(<Radio name="reconcileType" key="no-type">Reconcile against no particular type</Radio>);
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
                      <FormControl type="text" placeholder="Entity to reconcile" />
                   </Col>
                </FormGroup>
                <FormGroup controlId="reconcileType">
                   <Col componentClass={ControlLabel} sm={1}>Type:</Col>
                   <Col sm={3}>
                      {this.renderTypeChoices()}
                   </Col>
                </FormGroup>
                {(this.hasPropertySuggest ? 
                <FormGroup controlId="reconcileProperties">
                   <Col componentClass={ControlLabel} sm={1}>Properties:</Col>
                   <Col sm={4}>
                     <PropertyMapping manifest={this.props.manifest} />
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
