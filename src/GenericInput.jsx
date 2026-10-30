import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ReconcileSuggest from './ReconcileSuggest';

/**
 * An input which can either have autocompletion enabled
 * (thanks to a suggest service) or be a simple,
 * blank input (without autocompletion) if that is not
 * available from the service.
 */
export default class GenericInput extends React.Component {
    constructor() {
        super();
        this.state = {
           value: undefined,
           manualEntry: false
        }
    }

    getValue() {
        if (this.props.onChange !== undefined) {
            return this.props.value;
        } else {
            return this.state.value;
        }
    }

    get manifest() {
        if (!this.props.service) {
            return null;
        } else {
            return this.props.service.manifest;
        }
    }

    get placeholder() {
        return this.props.entityClass + ' id or URI'
    }

    get isSearchingByName() {
        return this.hasAutocomplete && !this.state.manualEntry;
    }

    get currentValue() {
        if (this.props.onChange === undefined) {
           return this.state.value;
        } else {
           return this.props.value || this.state.value;
        }
    }

    get currentId() {
        let val = this.currentValue;
        return val === undefined ? undefined : val.id;
    }

    get hasAutocomplete() {
        return (this.manifest && this.manifest.suggest && this.manifest.suggest[this.props.entityClass]);
    }

    onSuggestChange = (newValue) => {
        this.setState({ value: newValue });
        if (this.props.onChange !== undefined) {
            this.props.onChange(newValue);
        }
    }

    onIdChange = (e) => {
        let newValue = {
                id: e.currentTarget.value,
                name: e.currentTarget.value
        };
        if (this.props.onChange === undefined) {
            this.setState({ value: newValue });
        } else if (this.props.explicitSubmit === undefined) {
            this.props.onChange(newValue);
        } else {
            this.setState({ value: newValue });
        }
    } 

    onSubmit = (e) => {
        this.props.onChange(this.state.value);
        e.preventDefault();
    }

    toggleManualEntry = () => {
        this.setState(prevState => ({ manualEntry: !prevState.manualEntry }));
    }

    render() {
        const searchingByName = this.isSearchingByName;
        const dynamicEntry = this.props.dynamicEntry;
        const allowNew = this.props.allowNew || dynamicEntry;
        const newSelectionPrefix = this.props.newSelectionPrefix
            || (dynamicEntry ? 'Use ID/URI: ' : undefined);
        const showToggle = this.hasAutocomplete
            && !this.props.hideManualToggle
            && !dynamicEntry;
        return (
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    {searchingByName ?
                        (<ReconcileSuggest
                            service={this.props.service}
                            entityClass={this.props.entityClass}
                            onChange={this.onSuggestChange}
                            value={this.currentValue}
                            placeholder={this.props.placeholder}
                            allowNew={allowNew}
                            newSelectionPrefix={newSelectionPrefix}
                        />)
                      : (
                            (this.props.explicitSubmit !== undefined ?
                            <InputGroup>
                               <FormControl
                                  type="text"
                                  placeholder={this.placeholder}
                                  value={this.currentId || ''}
                                  onChange={this.onIdChange} />
                                <InputGroup.Button>
                                    <Button onClick={this.onSubmit} type="submit" bsStyle="primary">Submit</Button>
                                </InputGroup.Button>
                            </InputGroup>
                            :
                               <FormControl
                                  type="text"
                                  placeholder={this.placeholder}
                                  value={this.currentId || ''}
                                  onChange={this.onIdChange} />

                         )
                    )}
                </div>
                {showToggle &&
                    <Button
                        bsStyle="link"
                        onClick={this.toggleManualEntry}
                        title={searchingByName ? 'Enter an identifier or URI directly instead of searching by name' : 'Search for an entity by name instead'}
                        style={{ marginLeft: 8, whiteSpace: 'nowrap' }}>
                        {searchingByName ? 'Enter ID/URI' : 'Search by name'}
                    </Button>
                }
            </div>
        );
    }
}
