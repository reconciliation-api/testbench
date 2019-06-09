
import React from 'react';

export default class FeatureCell extends React.Component {
   render() {
      let glyph = '';
      let text = '';
      let color = 'inherit';
      if (this.props.value === true) {
        glyph = 'glyphicon glyphicon-ok';
        text = 'available';
        color = 'green';
      } else if (this.props.value === false) {
        glyph = 'glyphicon glyphicon-remove';
        text = 'unavailable';
        color = '#c00000';
      } else if (this.props.value === 'checking') {
        glyph = 'glyphicon glyphicon-hourglass';
        text = 'fetching...';
      }
      return (
        <span className={glyph} sr-only={text} style={{color: color}}></span>
      );
   }
}
