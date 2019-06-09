
import React from 'react';
import FeatureCell from './FeatureCell.js';
import fetchJsonp from 'fetch-jsonp';

export default class FeatureRow extends React.Component {
   constructor() {
      super();
      this.state = {
        reacheable: 'checking',
        manifest: {},
      }; 
   }

   componentDidMount() {
      fetchJsonp(this.props.endpoint)
        .then(response => response.json())
        .then(response => this.setState({manifest: response, reacheable: true}))
        .catch(error => this.setState({reacheable: false}));
   }

   suggestSettings() {
      return this.state.manifest.suggest || {};
   }
   
   hasView() {
      if (this.state.reacheable !== true)
        return null;
      return 'url' in (this.state.manifest.view || {});
   }

   hasSuggestEntity() {
      if (this.state.reacheable !== true)
        return null;
      return 'entity' in this.suggestSettings();
   }

   hasSuggestProperty() {
      if (this.state.reacheable !== true)
        return null;
      return 'property' in this.suggestSettings();
   }

   hasSuggestType() {
      if (this.state.reacheable !== true)
        return null;
      return 'type' in this.suggestSettings();
   }

   hasPreview() {
      if (this.state.reacheable !== true)
        return null;
      return 'preview' in this.state.manifest;
   }

   hasExtend() {
      if (this.state.reacheable !== true)
        return null;
      return 'extend' in this.state.manifest;
   }

   nameCell() {
      let parts = [
        <span key='name'>{this.props.name}</span>
      ];
      if (this.props.documentation) {
         parts.push(<span key='docs'> (<a href={this.props.documentation} target="_blank" rel="noopener noreferrer" title="Read endpoint documentation">docs</a>)</span>);
      }
      if (this.props.wd_uri) {
         parts.push(<span key="wd" style={{float: 'right'}}>
           <a href={this.props.wd_uri+'#P6269'} target="_blank" rel="noopener noreferrer" title="Edit on Wikidata">
            <span className="glyphicon glyphicon-pencil"></span>
           </a>
        </span>);
      }
      return parts;
   }

   render() {
      return (
        <tr>
            <td>{this.nameCell()}</td>
            <td><a href={this.props.endpoint} target="_blank" rel="noopener noreferrer">{this.props.endpoint}</a></td>
            <td><FeatureCell value={this.state.reacheable} /></td>
            <td><FeatureCell value={this.hasView()} /></td>
            <td><FeatureCell value={this.hasSuggestEntity()} /></td>
            <td><FeatureCell value={this.hasSuggestType()} /></td>
            <td><FeatureCell value={this.hasSuggestProperty()} /></td>
            <td><FeatureCell value={this.hasPreview()} /></td>
            <td><FeatureCell value={this.hasExtend()} /></td>
        </tr>);
   }
}

