import React from 'react';
import {AsyncTypeahead} from 'react-bootstrap-typeahead';
import fetchJsonpParams from './utils.js';

export default class ReconcileSuggest extends React.Component {
   constructor() {
     super();
     this.state = {
        value: undefined,
        suggestions: [],
        isLoading: false,
     };
   }

   getValue() {
     if (this.props.onChange !== undefined) {
        return this.props.value;
     } else {
        return this.state.value;
     }
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
           this.setState({suggestions: result.result, isLoading: false})})
        .catch(e => {
           console.log(e);
           this.setState({isLoading: false});
        });
   };

   onSuggestionsClearRequested = () => {
      this.setState({suggestions:[]});
   };

   onChange = (newValue) => {
     if (this.props.onChange === undefined) {
       this.setState({
         value: newValue[0]
       });
     } else {
        this.props.onChange(newValue[0]);
     }
   };

   render() {
      return (
        <AsyncTypeahead id={this.props.id}
           disabled={this.getUrl() === null}
           isLoading={this.state.isLoading}
           onSearch={this.onSuggestionsFetchRequested}
           options={this.state.suggestions}
           labelKey="name"
           filterBy={(option,props) => true}
           selected={this.getValue() ? [this.getValue()] : []}
           onChange={this.onChange}
           renderMenuItemChildren={(option, props, index) => 
              <>
                 <span className="suggestItemId">{option.id}</span>
                 <span className="suggestItemLabel">{option.name}</span><br />
                 <span className="suggestItemDescription">{option.description}</span>
              </>
           }
         />
      );
   }
}

