import React from "react";
import Badge from "react-bootstrap/lib/Badge";
import ListGroupItem from "react-bootstrap/lib/ListGroupItem";
import { SPEC_VERSIONS } from "./utils";

export default class Candidate extends React.Component {
  get url() {
    let view = null;
    let manifest = this.props.manifest;
    if (
      "view" in manifest &&
      "url" in this.props.manifest.view &&
      "id" in this.props.candidate
    ) {
      view = this.props.manifest.view.url.replace(
        "{{id}}",
        this.props.candidate.id
      );
    }
    return view;
  }

  renderDescription() {
    const { candidate, version } = this.props;
    const description = candidate?.description;

    if (!description) return null;

    if (version === SPEC_VERSIONS.DRAFT_1_0) {
      return (
        <div>
          <div className="candidateField">Description</div>
          <div className="candidate-description-wrapper">
            <span className="candidate-main-title-str">{description}</span>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="candidateField">Description</div>
        <div className="candidateValue">{description}</div>
      </div>
    );
  }

  renderTypes() {
    const types = this.props.candidate?.type;
    if (!types) return null;

    return (
      <div>
        <div className="candidateField">Types</div>
        <div className="candidateValue">
          {types.map((type, idx) => [
            idx > 0 && ", ",
            `${type.name} (${type.id})`,
          ])}
        </div>
      </div>
    );
  }

  renderFeatures() {
    const features = this.props.candidate?.features;
    if (!features) return null;

    return (
      <div>
        {features.map((feature, idx) => (
          <div key={idx}>
            <div className="candidateField">Feature {feature.id}</div>
            <div className="candidateValue">{feature.value}</div>
          </div>
        ))}
      </div>
    );
  }

  render() {
    const { candidate, version } = this.props;
    const header =
      version === SPEC_VERSIONS.DRAFT_1_0 ? (
        <span className="candidate-main-title">
          <span className="candidate-main-title-str-bold">
            {candidate?.name}
          </span>
        </span>
      ) : (
        candidate?.name
      );

    return (
      <ListGroupItem
        key={candidate.id}
        header={header}
        active={candidate.match}
      >
        <Badge style={{ float: "right" }}>{candidate.score}</Badge>
        <div>
          <div className="candidateField">ID</div>
          <div className="candidateValue">
            <a href={this.url}>{candidate.id}</a>
          </div>
          {this.renderDescription()}
          {this.renderTypes()}
          {this.renderFeatures()}
        </div>
      </ListGroupItem>
    );
  }
}
