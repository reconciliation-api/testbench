
import React from 'react';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Col from 'react-bootstrap/lib/Col';
import FormControl from 'react-bootstrap/lib/FormControl';
import Button from 'react-bootstrap/lib/Button';
import ReconcileSuggest from './ReconcileSuggest.js';

export default class PropertyMapping extends React.Component {

  state = {
     mappings: []
  }

  newMapping = () => {
     this.setState({
       mappings:
          this.state.mappings.concat([{
              property: undefined,
              value: '',
       }])
    });
  }

  deleteMapping = (idx) => {
     this.setState({
        mappings: this.state.mappings.splice(idx, 1)
     });
  }

  renderMappings() {
     return this.state.mappings.map((mapping, idx) =>
        <div style={{display: 'inline-block', marginBottom: '5px'}}>
            <div style={{display: 'inline-block', width: '45%'}}><ReconcileSuggest manifest={this.props.manifest} entityClass="property" id={'mapping-property-'+idx} /></div>
            <div style={{display: 'inline-block', width: '45%'}}><FormControl type="text" placeholder="Type a value" /></div>
          <Button bsStyle="secondary" bsSize="xsmall" onClick={() => this.deleteMapping(idx)} title="delete property"><span className="glyphicon glyphicon-trash"></span></Button>
        </div>
     );
  }
  
  render() {
     return (
        <div>
           {this.renderMappings()}<br />
           <Button onClick={this.newMapping}>Add property</Button>
        </div>
     );
  }
}
