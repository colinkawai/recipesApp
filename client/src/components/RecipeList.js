import React, { Component } from "react";
import { render } from "jade";
import RecipeModal from "./RecipeModal";

class RecipeList extends Component {
  constructor(props) {
    super(props);
    this.deleteRep = this.deleteRep.bind(this);
  }
  deleteRep = (useremail, title) => {
    this.props.deleteRep(useremail, title);
  };

  createList = () => {
    let userReps = this.props.userReps;

    let titleArray = [];
    if (userReps) {
      for (let i = 0; i < userReps.data.length; i++) {
        titleArray.push(
          <RecipeModal repData={userReps.data[i]} deleteRep={this.deleteRep} />
        );
      }

      return titleArray;
    }
  };

  render() {
    return <div className="buttonsContainer">{this.createList()}</div>;
  }
}
export default RecipeList;
