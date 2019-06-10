import React from 'react';
import {AsyncTypeahead, MenuItem} from 'react-bootstrap-typeahead';
import fetchJsonpParams from './utils.js';

let getSuggestionValue = (item) => {
   return item.id;
}

let renderSuggestion = (item) => {
   return (
        <div>{item.name}</div>
  );
}

export default class ReconcileSuggest extends React.Component {
   constructor() {
     super();
     this.state = {
        value: '',
        suggestions: [],
        isLoading: false,
     };
   }

   getUrl() {
     if (!this.props.manifest || !this.props.manifest.suggest) {
        return null;
     }
     let configuration = this.props.manifest.suggest[this.props.entityClass];
     if (!configuration) {
        return null;
     }
     return configuration.service_url + configuration.service_path;
   }

   onSuggestionsFetchRequested = (value) => {
      let url = this.getUrl();
      let params = {'prefix':value};
      if (url === null) {
         return;
      }
      this.setState({isLoading: true});
      fetchJsonpParams(url, params)
        .then(result => result.json())
        .then(result => {
           console.log('got suggestions');
           console.log(result);
           this.setState({suggestions: result.result, isLoading: false})})
        .catch(e => {
           console.log(e);
           this.setState({isLoading: false});
        });
   };

   onSuggestionsClearRequested = () => {
      this.setState({suggestions:[]});
   };

   onChange = (event, { newValue }) => {
     this.setState({
       value: newValue
     });
   };

/*
   renderInputComponent() {
      return (
        
      );
   }
*/

   render() {
/*      const { value, suggestions } = this.state;
      const inputProps = {
        value: value,
        onChange: this.onChange,
        placeholder: this.props.entityClass === 'entity' ? 'Type an entity' : 'Type a '+this.props.entityClass
      };
      if (!this.getUrl()) {
        inputProps.disabled = true;
      }
*/
      return (
        <AsyncTypeahead id={this.props.id}
           disabled={this.getUrl() === null}
           isLoading={this.state.isLoading}
           onSearch={this.onSuggestionsFetchRequested}
           options={this.state.suggestions}
           labelKey="name"
           filterBy={(option,props) => true}
           renderMenuItemChildren={(option, props, index) => 
              <MenuItem option={option} position={index}>
                 <span class="suggestItemId">{option.id}</span>
                 <span class="suggestItemLabel">{option.name}</span><br />
                 <span class="suggestItemDescription">{option.description}</span>
              </MenuItem>
           }
         />
      );
   }
}

