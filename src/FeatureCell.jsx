
import React from 'react';
import Button from 'react-bootstrap/lib/Button';

export default class FeatureCell extends React.Component {
   render() {
      let glyph = '';
      let text = '';
      let color = 'inherit';
      let cellClass = 'featureCell-default';
      if (this.props.value === true) {
        glyph = 'glyphicon glyphicon-ok';
        text = 'available';
        color = 'green';
        cellClass = 'featureCell-green';
      } else if (this.props.value === false) {
        glyph = 'glyphicon glyphicon-remove';
        text = 'unavailable';
        color = '#c00000';
        cellClass = 'featureCell-red';
      } else if (this.props.value === 'checking') {
        glyph = 'glyphicon glyphicon-hourglass';
        text = 'fetching...';
      } else if (this.props.value === 'maybe') {
        glyph = 'glyphicon glyphicon-search';
        text = 'Not reachable via CORS, click to check via JSONP';
        cellClass = 'featureCell-yellow';
      }
      let span = <span className={glyph} sr-only={text} style={{color: color}}></span>;
      let link = span;
      if (this.props.onClick && this.props.value === 'maybe') {
         link = <Button onClick={this.props.onClick} bsStyle="warning" bsSize="xsmall" title="Check with JSONP">{span}</Button>
      }
      return (
        <td className={'featureCell '+cellClass}>
           {link}
        </td>
      );
   }
}
