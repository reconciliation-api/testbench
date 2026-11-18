import React from 'react';
import {AsyncTypeahead} from 'react-bootstrap-typeahead';

const suggestPathMap = {
  entity: '/suggest/entity',
  property: '/suggest/property',
  type: '/suggest/type',
};

let nextReconcileSuggestId = 0;

export default class ReconcileSuggest extends React.Component {
   constructor() {
     super();
     this.state = {
        value: undefined,
        suggestions: [],
        isLoading: false,
     };
     this._isMounted = false;
     this._instanceId = ++nextReconcileSuggestId;
   }

   componentDidMount() {
     this._isMounted = true;
   }

   componentWillUnmount() {
     this._isMounted = false;
   }

   safeSetState = (...args) => {
     if (this._isMounted) {
       this.setState(...args);
     }
   }

   get componentId() {
     return this.props.id || `reconcile-suggest-${this._instanceId}`;
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

      // Only when building a nested property path (handled by PropertyPathInput)
      // should we search for the text after the last "/". For entity/type search,
      // a complete id or URI legitimately contains "/", so it must be sent as-is.
      let searchPrefix = value;
      if (this.props.nestedPathSearch && value && value.includes('/')) {
        const lastSlashIndex = value.lastIndexOf('/');
        searchPrefix = value.substring(lastSlashIndex + 1);
      }

      let params = {'prefix': searchPrefix};

      if (url === null) {
         return;
      }
      this.safeSetState({isLoading: true});
      let fetcher = this.props.service.getFetcher();
      fetcher(url, params)
        .then(result => result.json())
        .then(result => {
           const suggestions = (Array.isArray(result.result) ? result.result : []).map(option => ({
              ...option,
              name: (option.name != null ? option.name : option.id) || ''
           }));
           this.safeSetState({suggestions, isLoading: false});
        })
          .catch(() => {
           this.safeSetState({isLoading: false});
        });
   };

   onSuggestionsClearRequested = () => {
      this.safeSetState({suggestions:[]});
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

   onInputChange = (text) => {
     if (this.props.onInputChange) {
       this.props.onInputChange(text);
     }
   };

   render() {
      return (
        <AsyncTypeahead id={this.componentId}
           placeholder={this.props.placeholder}
           disabled={this.getUrl() === null}
           isLoading={this.state.isLoading}
           onSearch={this.onSuggestionsFetchRequested}
           onInputChange={this.onInputChange}
           options={this.state.suggestions}
           labelKey="name"
           filterBy={() => true}
           selected={this.getValue() ? [this.getValue()] : []}
           onChange={this.onChange}
           allowNew={this.props.allowNew}
           newSelectionPrefix={this.props.allowNew ? (this.props.newSelectionPrefix || "Use custom path: ") : undefined}
           renderMenuItemChildren={(option) => {
              if (option.customOption) {
                return (
                  <>
                    <span className="suggestItemLabel">{option.name}</span>
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

