import React from "react";
import ReconcileSuggest from "./ReconcileSuggest.js";

/**
 * Component for building nested property paths like schema:address/schema:postalCode
 * User types property, selects it, types "/", then types next property in the SAME field
 * The autocomplete suggestions update based on what comes after the last "/"
 */
export default class PropertyPathInput extends React.Component {
  constructor(props) {
    super(props);

    const initialPath = this.props.value?.id || this.props.value || "";
    const isNestedPath = this.isNestedPropertyPath(initialPath);
    const initialDisplayName = isNestedPath
      ? initialPath
      : (this.props.value?.name || initialPath);

    this.state = {
      builtPath: initialPath, 
      displayName: initialDisplayName,
      lastInputText: "",
      isBuilding: false,
    };
  }

  isNestedPropertyPath(path) {
    if (!path || !path.includes("/")) {
      return false;
    }
    if (path.includes(">/<")) {
      return true;
    }
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return false;
    }
    return true;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      const newPath = this.props.value?.id || this.props.value || "";
      const isNestedPath = this.isNestedPropertyPath(newPath);
      const newName = isNestedPath
        ? newPath
        : (this.props.value?.name || newPath);

      if (newPath !== this.state.builtPath) {
        this.setState({ builtPath: newPath, displayName: newName });
      }
    }
  }

  handleInputChange = (text, e) => {
    const isClearing =
      this.state.displayName &&
      (!text || text.length < this.state.displayName.length);

    const hasBuiltPath =
      this.state.builtPath && this.state.builtPath.length > 0;
    const isExtendingPath =
      hasBuiltPath &&
      text &&
      text.startsWith(this.state.displayName) &&
      text.length > this.state.displayName.length &&
      text.includes("/");

    if (isClearing) {
      this.setState({
        lastInputText: text,
        isBuilding: false,
        builtPath: "",
        displayName: "",
      });
      if (this.props.onChange) {
        this.props.onChange(text ? { id: text, name: text } : undefined);
      }
    } else {
      this.setState({
        lastInputText: text,
        isBuilding: isExtendingPath,
      });
    }
  };

  handleChange = (selectedValue) => {
    if (!selectedValue || !selectedValue.id) {
      return;
    }

    const selectedId = selectedValue.id;
    const selectedName = selectedValue.name || selectedId;
    const currentText = this.state.lastInputText;

    let newPath;
    let newDisplayName;
    let valueToEmit;
    const wrapUrl = (url) => {
      if (!url) return url;
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return `<${url}>`;
      }
      return url;
    };

    const isWrapped = (str) => str && str.startsWith("<") && str.includes(">");

    if (this.state.isBuilding && this.state.builtPath) {
      const firstPart = isWrapped(this.state.builtPath)
        ? this.state.builtPath
        : wrapUrl(this.state.builtPath);
      const secondPart = wrapUrl(selectedId);

      newPath = firstPart + "/" + secondPart;
      newDisplayName = newPath;
      // For nested paths, preserve matchQualifiers from the last selected property
      valueToEmit = {
        id: newPath,
        name: newPath,
        matchQualifiers: selectedValue.matchQualifiers
      };
    } else {
      if (this.isNestedPropertyPath(selectedId)) {
        const parts = selectedId.split("/");
        newPath = parts
          .map((part) => {
            const trimmed = part.trim();
            const unWrapped =
              trimmed.startsWith("<") && trimmed.endsWith(">")
                ? trimmed.slice(1, -1)
                : trimmed;
            return wrapUrl(unWrapped);
          })
          .join("/");
        newDisplayName = newPath;
        valueToEmit = { id: newPath, name: newPath };
      } else {
        newPath = selectedId;
        newDisplayName = selectedName;
        valueToEmit = selectedValue;
      }
    }

    this.setState({
      builtPath: newPath,
      displayName: newDisplayName,
      lastInputText: newDisplayName,
      isBuilding: false,
    });

    if (this.props.onChange) {
      this.props.onChange(valueToEmit);
    }
  };

  render() {
    const displayValue =
      !this.state.isBuilding && this.state.builtPath
        ? { id: this.state.builtPath, name: this.state.displayName }
        : undefined;

    return (
      <div className="property-path-input">
        <ReconcileSuggest
          service={this.props.service}
          entityClass="property"
          id={this.props.id}
          placeholder="Property id"
          value={displayValue}
          onChange={this.handleChange}
          onInputChange={this.handleInputChange}
          allowNew={true}
        />
      </div>
    );
  }
}
