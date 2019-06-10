
import React from 'react';
import FormControl from 'react-bootstrap/lib/FormControl';
import Button from 'react-bootstrap/lib/Button';
import ReconcileSuggest from './ReconcileSuggest.js';

export default class PropertyMapping extends React.Component {

  newMapping = () => {
     this.emitChange(
          this.props.value.concat([{
              property: undefined,
              value: '',
       }])
    );
  }

  deleteMapping = (idx) => {
     let newArray = this.props.value.slice();
     newArray.splice(idx, 1);
     this.emitChange(newArray);
  }

  onValueChange = (idx, e) => {
     let newArray = this.props.value.slice();
     let {property} = newArray[idx];
     newArray[idx] = {property, value: e.currentTarget.value};
     this.emitChange(newArray);
  }

  onPropertyChange = (idx, propertyValue) => {
     console.log('new property value');
     console.log(idx);
     console.log(propertyValue);
     let newArray = this.props.value.slice();
     let {value} = newArray[idx];
     newArray[idx] = {property:propertyValue, value};
     console.log(newArray);
     this.emitChange(newArray);
  }

  emitChange(newValue) {
     if (this.props.onChange) {
        this.props.onChange(newValue);
     }
  }

  renderMappings() {
     return this.props.value.map((mapping, idx) =>
        <div style={{display: 'inline-block', marginBottom: '5px'}} key={idx}>
            <div style={{display: 'inline-block', width: '45%'}}>
                <ReconcileSuggest
                   manifest={this.props.manifest}
                   entityClass="property"
                   id={'mapping-property-'+idx}
                   value={mapping.property}
                   onChange={v => this.onPropertyChange(idx, v)} />
            </div>
            <div style={{display: 'inline-block', width: '45%'}}>
                <FormControl
                   type="text"
                   placeholder="Type a value"
                   value={mapping.value || ''}
                   onChange={e => this.onValueChange(idx, e)} /></div>
          <Button bsStyle="primary" bsSize="xsmall" onClick={() => this.deleteMapping(idx)} title="delete property"><span className="glyphicon glyphicon-trash"></span></Button>
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
