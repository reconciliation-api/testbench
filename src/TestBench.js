import React from 'react';
import Tabs from 'react-bootstrap/lib/Tabs';
import Tab from 'react-bootstrap/lib/Tab';

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
