import React from "react";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import Checkbox from "react-bootstrap/lib/Checkbox";
import PropertyPathInput from "./PropertyPathInput.js";
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
        operator: "all",
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
      <div key={idx} className="mapping-card" style={{ marginBottom: "20px", border: "1px solid #e0e0e0", borderLeft: "3px solid #e0e0e0", padding: "15px", position: "relative" }}>
        <Button
          onClick={() => this.deleteMapping(idx)}
          bsStyle="link"
          title="Delete entire property mapping"
          style={{ position: "absolute", top: "0", right: "0", padding: "8px", color: "#9ca3af" }}
        >
          <span className="glyphicon glyphicon-remove"></span>
        </Button>

        <div style={{ marginBottom: "10px", paddingRight: "30px" }}>
          <PropertyPathInput
            service={this.props.service}
            id={"mapping-property-" + idx}
            value={mapping?.property}
            onChange={(propertyValue) =>
              this.onFieldChange(idx, "property", propertyValue)
            }
          />
        </div>

        <div style={{ marginLeft: "20px" }}>
          <div style={{ marginBottom: "8px" }}>
            <FormControl
              componentClass="select"
              value={mapping.operator || "all"}
              onChange={(e) =>
                this.onFieldChange(idx, "operator", e.target.value)
              }
              style={{ width: "80px" }}
            >
              {["any", "all", "none"].map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </FormControl>
          </div>

          <div style={{ marginBottom: "8px", paddingRight: "30px" }}>
            <FormControl
              type="text"
              placeholder="Property value"
              value={mapping.value || ""}
              onChange={(e) => this.onFieldChange(idx, "value", e.target.value)}
            />
          </div>

          {mapping.additionalValues &&
            mapping.additionalValues.map((additionalValue, valueIdx) => (
              <div key={`value-${valueIdx}`} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center", paddingRight: "30px" }}>
                <FormControl
                  type="text"
                  placeholder="Property value"
                  value={additionalValue}
                  onChange={(e) =>
                    this.onAdditionalValueChange(idx, valueIdx, e.target.value)
                  }
                  style={{ flex: 1 }}
                />
                <Button
                  onClick={() => this.deleteValue(idx, valueIdx)}
                  bsStyle="link"
                  title="Delete value"
                  style={{ padding: "8px", color: "#9ca3af", flexShrink: 0, width: "40px" }}
                >
                  <span className="glyphicon glyphicon-trash"></span>
                </Button>
              </div>
            ))}

          {/* Required checkbox and + value button */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center", paddingRight: "30px" }}>
            <div style={{ flex: 1 }}>
              <Checkbox
                checked={mapping.required || false}
                onChange={(e) =>
                  this.onFieldChange(idx, "required", e.target.checked)
                }
              >
                Required
              </Checkbox>
            </div>

            <Button
              bsStyle="link"
              onClick={() => this.addValue(idx)}
              style={{ padding: "4px 8px", fontSize: "14px", flexShrink: 0, width: "40px", textAlign: "center" }}
            >
              + value
            </Button>
          </div>

          {mapping.qualifier !== undefined && (
            <div style={{ marginTop: "8px", marginBottom: "8px" }}>
              <ControlLabel style={{ fontSize: "12px", color: "#666" }}>Qualifier:</ControlLabel>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <FormControl
                  id={`qualifier-value-${idx}`}
                  componentClass="select"
                  value={mapping.qualifier}
                  onChange={(e) =>
                    this.onFieldChange(idx, "qualifier", e.target.value)
                  }
                  style={{ flex: 1 }}
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
            </div>
          )}

          {/* + qualifier button */}
          {mapping.qualifier === undefined && mapping?.property?.matchQualifiers && (
            <div style={{ marginTop: "8px", display: "flex", gap: "8px", alignItems: "center", paddingRight: "30px" }}>
              <div style={{ flex: 1 }}></div>
              <Button
                bsStyle="link"
                onClick={() => this.onFieldChange(idx, "qualifier", "")}
                style={{ padding: "4px 8px", fontSize: "14px", flexShrink: 0, width: "40px", textAlign: "center" }}
              >
                + qualifier
              </Button>
            </div>
          )}
        </div>
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
