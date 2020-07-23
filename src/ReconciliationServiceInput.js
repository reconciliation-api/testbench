
import React from 'react';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import Col from 'react-bootstrap/lib/Col';
import fetchJsonp from 'fetch-jsonp';
import ReconciliationService from './ReconciliationService.js';

export default class ReconciliationServiceInput extends React.Component {

  state = {
    service: this.props.initialService
  };

  componentWillMount() {
     this.timer = null;
  }

  setService(service) {
     this.setState({
	service: service
     });
  }

  handleChange(e) {
     clearTimeout(this.timer);

     this.setState({
	service: new ReconciliationService(e.target.value, undefined, undefined),
        error: undefined
     });
 
     this.timer = setTimeout(() => this.validateEndpoint(), 1000);
  }

  validateEndpoint() {
     let endpoint = this.state.service.endpoint;
     fetch(endpoint)
      .then(result => result.json())
      .then(result => this._setService(endpoint, result, true))
      .catch(e =>
	     fetchJsonp(endpoint)
	      .then(result => result.json())
	      .then(result => this._setService(endpoint, result, false))
	      .catch(e => this._setError(endpoint, e)));
  }

  _setService(endpoint, manifest, cors) {
    if(this.state.service.endpoint === endpoint) {
	let service = new ReconciliationService(endpoint, manifest, cors);
        this.setState({
	  service: service 
        });
        if(this.props.onChange !== undefined) {
           this.props.onChange(service);
        }
    }
  }

  _setError(endpoint, error) {
    if(this.state.service.endpoint === endpoint) {
        this.setState({manifest: undefined, error: error})
        if(this.props.onChange !== undefined) {
           this.props.onChange(undefined, undefined);
        }
    }
  }
  
  getValidationState() {
     if (this.state.service !== undefined && this.state.service.manifest !== undefined) {
        return 'success';
     } else if(this.state.error !== undefined) {
        return 'error';
     }
     return null;
  }

  getMessage() {
     if (this.getValidationState() === 'error') {
         return 'The endpoint must return a JSONP document describing the service.';
     }
  }

  handleSubmit(e) {
     clearTimeout(this.timer);
     this.validateEndpoint();
     e.preventDefault();
  }

  render() {
     return (
        <Form horizontal onSubmit={(e) => this.handleSubmit(e)}>
          <FormGroup controlId="endpointField" validationState={this.getValidationState()}>
            <Col componentClass={ControlLabel} sm={1}>Endpoint:</Col>
            <Col sm={11}>
                <FormControl type="text" value={this.state.service.endpoint} placeholder="URL of the reconciliation service endpoint" onChange={e => this.handleChange(e)}/>
                <FormControl.Feedback />
                <HelpBlock>{this.getMessage()}</HelpBlock>
            </Col>
          </FormGroup>
        </Form>
     );
  }
}
