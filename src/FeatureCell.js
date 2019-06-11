
import React from 'react';

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
      }
      return (
        <td className={'featureCell '+cellClass}><span className={glyph} sr-only={text} style={{color: color}}></span></td>
      );
   }
}
