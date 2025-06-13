import React from "react";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import Checkbox from "react-bootstrap/lib/Checkbox";
import GenericInput from "./GenericInput.js";
import { Col } from "react-bootstrap";


//Support for version 1.0-draft of the reconcile spec
export default class PropertyMappingV2 extends React.Component {
  emitChange = (newValue) => {
    if (this.props.onChange) {
      this.props.onChange(newValue);
    }
  };

  newMapping = () => {
    this.emitChange([
      ...this.props.value,
      {
        property: "",
        operator: "any",
        value: "",
        required: false,
      },
    ]);
  };

  deleteMapping = (idx) => {
    const newArray = this.props.value.slice();
    newArray.splice(idx, 1);
    this.emitChange(newArray);
  };

  onFieldChange = (idx, field, fieldValue) => {
    const newArray = this.props.value.slice();
    newArray[idx] = { ...newArray[idx], [field]: fieldValue };
    this.emitChange(newArray);
  };

  addValue = (idx) => {
    const newArray = this.props.value.slice();
    if (!newArray[idx].additionalValues) {
      newArray[idx].additionalValues = [];
    }
    newArray[idx].additionalValues.push("");
    this.emitChange(newArray);
  };

  deleteValue = (idx, valueIdx) => {
    const newArray = this.props.value.slice();
    newArray[idx].additionalValues.splice(valueIdx, 1);
    this.emitChange(newArray);
  };

  onAdditionalValueChange = (idx, valueIdx, fieldValue) => {
    const newArray = this.props.value.slice();
    newArray[idx].additionalValues[valueIdx] = fieldValue;
    this.emitChange(newArray);
  };

  renderMappings() {
    return this.props.value.map((mapping, idx) => (
      <div key={idx} className="mapping-card">
        <div className="mapping-row">
          <GenericInput
            service={this.props.service}
            entityClass="property"
            id={"mapping-property-" + idx}
            type="text"
            placeholder="Property id"
            value={mapping?.property}
            onChange={(propertyValue) =>
              this.onFieldChange(idx, "property", propertyValue)
            }
          />

          <FormControl
            componentClass="select"
            value={mapping.operator || "any"}
            onChange={(e) =>
              this.onFieldChange(idx, "operator", e.target.value)
            }
            style={{ minWidth: "60px" }}
          >
            {["any", "all", "none"].map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </FormControl>

          <FormControl
            type="text"
            placeholder="Property value"
            value={mapping.value || ""}
            onChange={(e) => this.onFieldChange(idx, "value", e.target.value)}
          />

          <Button
            onClick={() => this.deleteMapping(idx)}
            bsStyle="link"
            title="Delete property"
            style={{ padding: "8px", color: "#9ca3af" }}
          >
            <span className="glyphicon glyphicon-trash"></span>
          </Button>
        </div>

        <div className="mapping-footer">
          <Checkbox
            checked={mapping.required || false}
            onChange={(e) =>
              this.onFieldChange(idx, "required", e.target.checked)
            }
          >
            Required
          </Checkbox>

          <div className="action-buttons">
            <Button
              bsStyle="link"
              onClick={() => this.addValue(idx)}
              style={{ padding: "4px 0", fontSize: "14px" }}
            >
              + value
            </Button>

            {mapping.qualifier === undefined && mapping?.property?.matchQualifiers && (
              <Button
                bsStyle="link"
                onClick={() => this.onFieldChange(idx, "qualifier", "")}
                style={{ padding: "4px 0", fontSize: "14px" }}
              >
                + qualifier
              </Button>
            )}
          </div>
        </div>

        {mapping.additionalValues &&
          mapping.additionalValues.map((additionalValue, valueIdx) => (
            <div key={`value-${valueIdx}`} className="additional-row">
              <FormControl
                type="text"
                placeholder="Property value"
                value={additionalValue}
                onChange={(e) =>
                  this.onAdditionalValueChange(idx, valueIdx, e.target.value)
                }
              />
              <Button
                onClick={() => this.deleteValue(idx, valueIdx)}
                bsStyle="link"
                title="Delete value"
                style={{ padding: "8px", color: "#9ca3af" }}
              >
                <span className="glyphicon glyphicon-trash"></span>
              </Button>
            </div>
          ))}

        {mapping.qualifier !== undefined && (
          <div className="qualifier-section">
            {/* <FormGroup> */}
              <ControlLabel>Qualifier:</ControlLabel>
              <div className="qualifier-row">
                <FormControl
                  id={`qualifier-value-${idx}`}
                  componentClass="select"
                  value={mapping.qualifier || "any"}
                  onChange={(e) =>
                    this.onFieldChange(idx, "qualifier", e.target.value)
                  }
                  style={{ minWidth: "60px" }}
                >
                  {mapping?.property?.matchQualifiers?.map((qualifier) => (
                    <option key={qualifier?.id} value={qualifier?.id}>
                      {qualifier?.name}
                    </option>
                  ))}
                </FormControl>
                <Button
                  onClick={() =>
                    this.onFieldChange(idx, "qualifier", undefined)
                  }
                  bsStyle="link"
                  title="Remove qualifier"
                  style={{ padding: "8px", color: "#9ca3af" }}
                >
                  <span className="glyphicon glyphicon-trash"></span>
                </Button>
              </div>
            {/* </FormGroup> */}
          </div>
        )}
      </div>
    ));
  }

  render() {
    return (
      <div className="property-mapping-container">
        <Col>{this.renderMappings()}</Col>
        <Col>
          <Button onClick={this.newMapping} className="add-button">
            Add Property
          </Button>
        </Col>
      </div>
    );
  }
}
