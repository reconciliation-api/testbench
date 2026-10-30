

import React from 'react';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import ListGroup from 'react-bootstrap/lib/ListGroup';

/**
 * Renders a value returned by a data extension service
 * to a list item.
 */
export default class DataExtensionValue extends React.Component {

        get nestedName() {
            const val = this.props.value;
            if (!Array.isArray(val.properties)) {
                return undefined;
            }
            const nameProp = val.properties.find(p => p && p.id === 'name');
            if (!nameProp || !Array.isArray(nameProp.values)) {
                return undefined;
            }
            const first = nameProp.values.find(v => v && v.str !== undefined);
            return first ? first.str : undefined;
        }

        get isExpanded() {
            return Array.isArray(this.props.value.properties);
        }

        get renderedValue() {
            const val = this.props.value;
            if (val.date !== undefined) {
                return val.date;
            } else if (val.id !== undefined && val.name !== undefined) {
                return val.name;
            } else if (val.id !== undefined) {
                return this.nestedName || val.id;
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

        renderNestedProperties() {
            const val = this.props.value;
            return (
                <div style={{ marginTop: '8px' }}>
                    {val.properties.map((prop, propIdx) => (
                        <div key={"nested-prop-" + propIdx} style={{ marginBottom: '6px' }}>
                            <strong style={{ fontSize: '0.9em' }}>{prop.id}</strong>
                            {Array.isArray(prop.values) && prop.values.length > 0 ? (
                                <ListGroup style={{ marginTop: '4px', marginBottom: 0 }}>
                                    {prop.values.map((nestedValue, nestedIdx) =>
                                        <DataExtensionValue
                                            value={nestedValue}
                                            key={"nested-value-" + propIdx + "-" + nestedIdx} />
                                    )}
                                </ListGroup>
                            ) : null}
                        </div>
                    ))}
                </div>
            );
        }

        render() {
            return (<ListGroupItem key={this.props.key} header={this.renderedValue}>
                        {this.props.value.lang !== undefined ? this.props.value.lang : null}
                        {this.isExpanded ? this.renderNestedProperties() : null}
                </ListGroupItem>);
        }
}
