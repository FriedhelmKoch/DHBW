import React, { Component } from 'react';
import "./Button.css";

class Button extends Component {
  render() {
    return (
      <div className="Button">
        <fieldset><legend className="Button-heading"> Hier ist ein Button eingeschlossen </legend>
        <button className="Button-form">
            <strong>{this.props.label}</strong>
        </button>
        </fieldset>

      </div>
    )
  }
}

export default Button;