import React from 'react';
import {AsyncTypeahead} from 'react-bootstrap-typeahead';

const suggestPathMap = {
  entity: '/suggest/entity',
  property: '/suggest/property',
  type: '/suggest/type',
};

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
     let value = this.props.onChange !== undefined ? this.props.value : this.state.value;

     if (value && !value.name && value.id) {
        return { ...value, name: value.id };
     }

     return value;
   }

   get manifest() {
      if (!this.props.service) {
	 return null;
      } else {
	 return this.props.service.manifest;
      }
   }

   getUrl() {
     if (!this.manifest || !this.manifest.suggest) {
        return null;
     }
     let configuration = this.manifest.suggest[this.props.entityClass];
     if (!configuration) {
        return null;
     }
        const path = suggestPathMap[this.props.entityClass];
        return `${this.props.service.endpoint.replace(/\/$/, '')}${path}`;
   }

   onSuggestionsFetchRequested = (value) => {
      let url = this.getUrl();

      // If building a nested path (contains /), only search for text after last /
      let searchPrefix = value;
      if (value && value.includes('/')) {
        const lastSlashIndex = value.lastIndexOf('/');
        searchPrefix = value.substring(lastSlashIndex + 1);
      }

      let params = {'prefix': searchPrefix};

      if (url === null) {
         return;
      }
      this.setState({isLoading: true});
      let fetcher = this.props.service.getFetcher();
      fetcher(url, params)
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
     let selectedValue = newValue[0];

     if (selectedValue && selectedValue.customOption) {
       selectedValue = {
         id: selectedValue.name,
         name: selectedValue.name,
         customOption: false
       };
     }

     if (selectedValue && !selectedValue.name && selectedValue.id) {
       selectedValue = {
         ...selectedValue,
         name: selectedValue.id
       };
     }

     if (this.props.onChange === undefined) {
       this.setState({
         value: selectedValue
       });
     } else {
        this.props.onChange(selectedValue);
     }
   };

   onInputChange = (text, e) => {
     if (this.props.onInputChange) {
       this.props.onInputChange(text, e);
     }
   };

   render() {
      return (
        <AsyncTypeahead id={this.props.id}
           placeholder={this.props.placeholder}
           disabled={this.getUrl() === null}
           isLoading={this.state.isLoading}
           onSearch={this.onSuggestionsFetchRequested}
           onInputChange={this.onInputChange}
           options={this.state.suggestions}
           labelKey="name"
           filterBy={(option,props) => true}
           selected={this.getValue() ? [this.getValue()] : []}
           onChange={this.onChange}
           allowNew={this.props.allowNew}
           newSelectionPrefix={this.props.allowNew ? "Use custom path: " : undefined}
           renderMenuItemChildren={(option, props, index) => {
              if (option.customOption) {
                return (
                  <>
                    <span className="suggestItemLabel">{option.label}</span>
                  </>
                );
              }
              return (
                <>
                  <span className="suggestItemId">{option.id}</span>
                  {Array.isArray(option.broader) && option.broader.length && <span className="suggestItemId">{option.broader.map(e => e.id).join(', ')} &gt; </span>}
                  <span className="suggestItemLabel">{option.name}</span><br />
                  <span className="suggestItemDescription">{option.description}</span>
                </>
              );
           }}
         />
      );
   }
}

