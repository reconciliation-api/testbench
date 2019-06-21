
import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import FeatureCell from './FeatureCell.js';
import fetchJsonp from 'fetch-jsonp';

export default class FeatureRow extends React.Component {
   constructor() {
      super();
      this.state = {
        reacheableCORS: 'checking',
        reacheableJSONP: 'maybe',
        manifest: {},
      }; 
   }

   componentDidMount() {
      fetch(this.props.endpoint, { timeout: 5000 })
        .then(response => response.json())
        .then(response => this.setState({manifest: response, reacheableCORS: true}))
        .catch(error => {
           this.setState({reacheableCORS: false});
      });
      if (this.props.jsonp) {
        this.checkJsonp();
      }
   }

   checkJsonp = () => {
      this.setState({reacheableJSONP: 'checking'});
      fetchJsonp(this.props.endpoint)
        .then(response => response.json())
        .then(response => this.setState({manifest: response, reacheableJSONP: true}))
        .catch(error => this.setState({reacheableJSONP: false}));
   }

   suggestSettings() {
      return this.state.manifest.suggest || {};
   }

   get isReacheable() {
      return this.state.reacheableCORS === true || this.state.reacheableJSONP === true;
   }
   
   hasView() {
      if (!this.isReacheable)
        return null;
      return 'url' in (this.state.manifest.view || {});
   }

   hasSuggestEntity() {
      if (!this.isReacheable)
        return null;
      return 'entity' in this.suggestSettings();
   }

   hasSuggestProperty() {
      if (!this.isReacheable)
        return null;
      return 'property' in this.suggestSettings();
   }

   hasSuggestType() {
      if (!this.isReacheable)
        return null;
      return 'type' in this.suggestSettings();
   }

   hasPreview() {
      if (!this.isReacheable)
        return null;
      return 'preview' in this.state.manifest;
   }

   hasExtend() {
      if (!this.isReacheable)
        return null;
      return 'extend' in this.state.manifest;
   }

   nameCell() {
      let parts = [
        <span key='name'>{this.props.name}</span>
      ];
      if (this.props.documentation && !this.props.source_url) {
         parts.push(<span key='docs'> (<a href={this.props.documentation} target="_blank" rel="noopener noreferrer" title="Read endpoint documentation">docs</a>)</span>);
      }
      if (this.props.documentation && this.props.source_url) {
         parts.push(<span key='docs'> (<a href={this.props.documentation} target="_blank" rel="noopener noreferrer" title="Read endpoint documentation">docs</a>, <a href={this.props.source_url} target="_blank" rel="noopener noreferrer" title="View endpoint source code">source</a>)</span>);
      }
      if (!this.props.documentation && this.props.source_url) {
         parts.push(<span key='docs'> (<a href={this.props.source_url} target="_blank" rel="noopener noreferrer" title="View endpoint source code">source</a>)</span>);
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

   triggerOnSelect = () => {
      if (this.props.onSelect) {
        this.props.onSelect(this.props.endpoint, this.state.manifest);
      }
   }

   render() {
      return (
        <tr>
            <td>{this.nameCell()}</td>
            <td><Button bsStyle="primary" bsSize="xsmall" onClick={this.triggerOnSelect} title="Use in test bench" disabled={!this.isReacheable}><span className="glyphicon glyphicon-play"></span></Button>{' '}<a href={this.props.endpoint} target="_blank" rel="noopener noreferrer">{this.props.endpoint}</a></td>
            <FeatureCell value={this.state.reacheableCORS} />
            <FeatureCell value={this.state.reacheableJSONP} onClick={this.checkJsonp} />
            <FeatureCell value={this.hasView()} />
            <FeatureCell value={this.hasSuggestEntity()} />
            <FeatureCell value={this.hasSuggestType()} />
            <FeatureCell value={this.hasSuggestProperty()} />
            <FeatureCell value={this.hasPreview()} />
            <FeatureCell value={this.hasExtend()} />
        </tr>);
   }
}

