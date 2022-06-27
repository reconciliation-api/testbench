
import React from 'react';
import Badge from 'react-bootstrap/lib/Badge';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';

export default class Candidate extends React.Component {

     get url() {
        let view = null;
        let manifest = this.props.manifest;
        if ('view' in manifest && 'url' in this.props.manifest.view && 'id' in this.props.candidate) {
            view = this.props.manifest.view.url.replace('{{id}}', this.props.candidate.id);
        }
        return view;
     }

     renderDescription() {
        let description = this.props.candidate.description;
        if (description !== undefined) {
          return (<div><div className="candidateField">Description</div><div className="candidateValue">{description}</div></div>);
        }
     }

     renderTypes() {
        let types = this.props.candidate.type;
        if (types !== undefined) {
          return (<div><div className="candidateField">Types</div><div className="candidateValue">
              {types.map((type, idx) => [
                  idx > 0 && ", ",
                  type.name + ' (' + type.id + ')'
               ])}
          </div></div>);
        }
     }

     renderFeatures() {
        let features = this.props.candidate.features;
        if (features !== undefined) {
          return (<div>
                {features.map((feature, idx) => 
                   (<div key={idx}><div className="candidateField">Feature {feature.id}</div><div className="candidateValue">{feature.value}</div></div>)
                )}
             </div>);
        }
     }

     render() {
        let candidate = this.props.candidate;
        return (<ListGroupItem key={candidate.id} header={candidate.name} active={candidate.match}>
                <Badge style={{float: 'right'}}>{this.props.candidate.score}</Badge>
                <div>
                  <div><div className="candidateField">ID</div><div className="candidateValue">
                <a href={this.url}>{candidate.id}</a></div></div>
                {this.renderDescription()}
                {this.renderTypes()}
                {this.renderFeatures()}
                </div>
            </ListGroupItem>);
     }
}
