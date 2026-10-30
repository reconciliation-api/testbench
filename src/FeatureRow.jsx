
import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import FeatureCell from './FeatureCell';
import ReconciliationService from './ReconciliationService';

export default class FeatureRow extends React.Component {
   suggestSettings() {
      return (this.props.manifest || {}).suggest || {};
   }

   get isReacheable() {
      return this.props.reacheableCORS === true;
   }
   
   hasView() {
      if (!this.isReacheable)
        return null;
      return 'url' in ((this.props.manifest || {}).view || {});
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
      return 'preview' in (this.props.manifest || {});
   }

   hasExtend() {
      if (!this.isReacheable)
        return null;
      return 'extend' in (this.props.manifest || {});
   }

   reconciliationService() {
      return new ReconciliationService(this.props.endpoint, this.props.manifest || {});
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
        this.props.onSelect(this.reconciliationService());
      }
   }

   render() {
      const showTimeoutWarning = this.props.corsTimeout || this.props.timedOut;

      return (
        <tr style={showTimeoutWarning ? { backgroundColor: '#fff3cd' } : {}}>
            <td>
              {this.nameCell()}
              {showTimeoutWarning && (
                <div style={{ fontSize: '0.85em', color: '#856404' }}>
                  <span className="glyphicon glyphicon-time"></span> Connection timeout
                </div>
              )}
            </td>
            <td><Button bsStyle="primary" bsSize="xsmall" onClick={this.triggerOnSelect} title="Use in test bench" disabled={!this.isReacheable}><span className="glyphicon glyphicon-play"></span></Button>{' '}<a href={this.props.endpoint} target="_blank" rel="noopener noreferrer">{this.props.endpoint}</a></td>
            <td className={'featureCell'}>{this.reconciliationService().latestCompatibleVersion || '?'}</td>
            <FeatureCell value={this.props.reacheableCORS} />
            <FeatureCell value={this.hasView()} />
            <FeatureCell value={this.hasSuggestEntity()} />
            <FeatureCell value={this.hasSuggestType()} />
            <FeatureCell value={this.hasSuggestProperty()} />
            <FeatureCell value={this.hasPreview()} />
            <FeatureCell value={this.hasExtend()} />
        </tr>);
   }
}

