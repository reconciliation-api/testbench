
import React from 'react';
import Button from 'react-bootstrap/lib/Button';
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
      fetch(this.props.endpoint, { timeout: 5000 })
        .then(response => response.json())
        .then(response => this.setState({manifest: response, reacheable: true}))
        .catch(error => {
           if (this.props.jsonp) {
              this.checkJsonp();
           } else {
              this.setState({reacheable: 'maybe'})
           }});
   }

   checkJsonp = () => {
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

   triggerOnSelect = () => {
      if (this.props.onSelect) {
        this.props.onSelect(this.props.endpoint, this.state.manifest);
      }
   }

   render() {
      return (
        <tr>
            <td>{this.nameCell()}</td>
            <td><Button bsStyle="primary" bsSize="xsmall" onClick={this.triggerOnSelect} title="Use in test bench"><span className="glyphicon glyphicon-play"></span></Button>{' '}<a href={this.props.endpoint} target="_blank" rel="noopener noreferrer">{this.props.endpoint}</a></td>
            <FeatureCell value={this.state.reacheable} onClick={this.checkJsonp} />
            <FeatureCell value={this.hasView()} />
            <FeatureCell value={this.hasSuggestEntity()} />
            <FeatureCell value={this.hasSuggestType()} />
            <FeatureCell value={this.hasSuggestProperty()} />
            <FeatureCell value={this.hasPreview()} />
            <FeatureCell value={this.hasExtend()} />
        </tr>);
   }
}

