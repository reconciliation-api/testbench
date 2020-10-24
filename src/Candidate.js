
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
          return (<span><br />{description}</span>);
        } else {
           return (<span />);
        }
     }

     renderTypes() {
        let types = this.props.candidate.type;
        if (types !== undefined) {
          return (<span><br />
              {types.map((type, idx) => [
                  idx > 0 && ", ",
                  type.name + ' (' + type.id + ')'
               ])}
          </span>);
        }
     }

     render() {
        let candidate = this.props.candidate;
        return (<ListGroupItem key={candidate.id} header={candidate.name} active={candidate.match}>
                <a href={this.url}>{candidate.id}</a>
                <Badge style={{float: 'right'}}>{this.props.candidate.score}</Badge>
                {this.renderDescription()}
                {this.renderTypes()}
            </ListGroupItem>);
     }
}
