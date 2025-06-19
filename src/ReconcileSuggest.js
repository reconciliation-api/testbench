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
     if (this.props.onChange !== undefined) {
        return this.props.value;
     } else {
        return this.state.value;
     }
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
      let params = {'prefix':value};
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
           placeholder={this.props.placeholder}
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
                 {Array.isArray(option.broader) && option.broader.length && <span className="suggestItemId">{option.broader.map(e => e.id).join(', ')} &gt; </span>}
                 <span className="suggestItemLabel">{option.name}</span><br />
                 <span className="suggestItemDescription">{option.description}</span>
              </>
           }
         />
      );
   }
}

