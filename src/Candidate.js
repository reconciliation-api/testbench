
import React from 'react';
import Badge from 'react-bootstrap/lib/Badge';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';

export default class Candidate extends React.Component {

     get url() {
        let view = null;
        let manifest = this.props.manifest;
        if ('view' in manifest && 'url' in this.props.manifest.view && 'id' in this.props.candidate) {
            view = this.props.manifest.view.url.replace('{{id}}', this.props.candidate.id);
        }
        return view;
     }

     renderDescription() {
      const description = this.props.candidate?.description;
  
      if (description) {
        return (
          <div>
            <div className="candidateField">Description</div>
            <div className='candidate-description-wrapper'>
              {description?.values?.length > 0 &&
              Array.isArray(description?.values)
                ? description.values.map((value, index) => (
                    <span key={index} className="candidate-main-title">
                      <span className="candidate-main-title-str">
                        {value.str}
                      </span>
                      <span className="candidate-main-title-lang">
                        {value.lang}
                      </span>
                    </span>
                  ))
                : typeof description === "string" && (
                    <span className="candidate-main-title-str">
                      {description}
                    </span>
                  )}
            </div>
          </div>
        );
      }
  
      return null;
    }

     renderTypes() {
        let types = this.props.candidate.type;
        if (types !== undefined) {
          return (<div><div className="candidateField">Types</div><div className="candidateValue">
              {types.map((type, idx) => [
                  idx > 0 && ", ",
                  type.name + ' (' + type.id + ')'
               ])}
          </div></div>);
        }
     }

     renderFeatures() {
        let features = this.props.candidate.features;
        if (features !== undefined) {
          return (<div>
                {features.map((feature, idx) => 
                   (<div key={idx}><div className="candidateField">Feature {feature.id}</div><div className="candidateValue">{feature.value}</div></div>)
                )}
             </div>);
        }
     }

     render() {
      let candidate = this.props.candidate;
       const nameValues = candidate?.name?.values;
       const hasValues = nameValues?.length > 0;
       const mainTitle = hasValues ? nameValues[0]?.str : candidate?.name;
       const lang = hasValues ? nameValues[0]?.lang : "";
        return (<ListGroupItem
         key={candidate.id}
         header={
           <span className="candidate-main-title">
             <span className="candidate-main-title-str-bold">{mainTitle}</span>
             {hasValues && (
               <span className="candidate-main-title-lang-bold">{lang}</span>
             )}
           </span>
         }
         active={candidate.match}
       >
              
                <div className="candidateMultilingualNames">{candidate?.name?.values?.slice(1)?.map(value=>{
                  return <span className='candidate-main-title'><span className='candidate-main-title-str'>{value?.str}</span><span className='candidate-main-title-lang'>{value?.lang}</span></span>
                })}</div>
                <div>   
                <Badge style={{float: 'right'}}>{this.props.candidate.score}</Badge>
                  <div><div className="candidateField">ID</div><div className="candidateValue">
                <a href={this.url}>{candidate.id}</a></div></div>
                {this.renderDescription()}
                {this.renderTypes()}
                {this.renderFeatures()}
                </div>
            </ListGroupItem>);
     }
}
