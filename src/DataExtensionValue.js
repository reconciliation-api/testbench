

import React from 'react';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';

/**
 * Renders a value returned by a data extension service
 * to a list item.
 */
export default class DataExtensionValue extends React.Component {

        get renderedValue() {
            const val = this.props.value;
            if (val.date !== undefined) {
                return val.date;
            } else if (val.id !== undefined && val.name !== undefined) {
                return val.name;
            } else if (val.str !== undefined) {
                return val.str;
            } else if (val.float !== undefined) {
                return val.float;
            } else if (val.int !== undefined) {
                return val.int;
            } else {
                return 'Singleton';
            }
        }

        get datatype() {
            const val = this.props.value;
            if (val.date !== undefined) {
                return 'date';
            } else if (val.id !== undefined && val.name !== undefined) {
                return val.id;
            } else if (val.str !== undefined) {
                return 'string';
            } else if (val.float !== undefined) {
                return 'floating-point number';
            } else if (val.int !== undefined) {
                return 'integer';
            } else {
                return 'empty';
            }
        }

        render() {
            return (<ListGroupItem key={this.props.key} header={this.renderedValue}>
                        {this.datatype}
                </ListGroupItem>);
        }
}
