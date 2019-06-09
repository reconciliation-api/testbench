import React from 'react';
import Autosuggest from 'react-autosuggest';
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
        suggestions: []
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
      let params = {'prefix':value.value};
      fetchJsonpParams(this.getUrl(), params)
        .then(result => result.json())
        .then(result => {
           console.log('got suggestions');
           console.log(result);
           this.setState({suggestions: result.result})})
        .catch(e => console.log(e));
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
      const { value, suggestions } = this.state;
      const inputProps = {
        value: value,
        onChange: this.onChange,
        placeholder: this.props.entityClass === 'entity' ? 'Type an entity' : 'Type a '+this.props.entityClass
      };
      if (!this.getUrl()) {
        inputProps.disabled = true;
      }

      return (
        <Autosuggest
           inputProps={inputProps}
           suggestions={suggestions}
           onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
           onSuggestionsClearRequested={this.onSuggestionsClearRequested}
           getSuggestionValue={getSuggestionValue}
           renderSuggestion={renderSuggestion}
         />
      );
   }
}

