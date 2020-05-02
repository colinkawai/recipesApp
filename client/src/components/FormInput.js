import React, { Component } from "react";

class FormInput extends Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit = (e) => {
    const input = this.input.value;

    this.props.addLink(input);
  };

  render() {
    return (
      <div className="formInput">
        <form onSubmit={this.onSubmit}>
          <input
            type="text"
            placeholder="enter recipe link"
            ref={(element) => {
              this.input = element;
            }}
          />
          <button className="formButton">+</button>
        </form>
      </div>
    );
  }
}

export default FormInput;
