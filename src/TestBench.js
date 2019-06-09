import React from 'react';
import Tabs from 'react-bootstrap/lib/Tabs';
import Tab from 'react-bootstrap/lib/Tab';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import ReconcileSuggest from './ReconcileSuggest.js';

export default class TestBench extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
       <Tabs defaultActiveKey="reconcile" id="test-bench-tabs">
         <Tab eventKey="reconcile" title="Reconcile">
           
         </Tab>
         <Tab eventKey="suggest" title="Suggest">
            <Form horizontal>
               <FormGroup controlId="suggestEntityTestBench">
                  <Col componentClass={ControlLabel} sm={1}>Entity:</Col>
                  <Col sm={5}>
                     <ReconcileSuggest manifest={this.props.manifest} entityClass="entity" />
                  </Col>
               </FormGroup>
               <FormGroup controlId="suggestTypeTestBench">
                  <Col componentClass={ControlLabel} sm={1}>Type:</Col>
                  <Col sm={5}>
                     <ReconcileSuggest manifest={this.props.manifest} entityClass="type" />
                  </Col>
               </FormGroup>
               <FormGroup controlId="suggestPropertyTestBench">
                  <Col componentClass={ControlLabel} sm={1}>Property:</Col>
                  <Col sm={5}>
                     <ReconcileSuggest manifest={this.props.manifest} entityClass="property" />
                  </Col>
               </FormGroup>
            </Form>
         </Tab>
         <Tab eventKey="preview" title="Preview">
           <p>Coming soon</p>
         </Tab>
         <Tab eventKey="extend" title="Extend">
           <p>Coming soon</p>
         </Tab>
       </Tabs>
    );
  }
} 
