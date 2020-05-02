import React, { useState, useCallback } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import "../App.css";
const RecipeModal = (props) => {
  const { buttonLabel, className } = props;

  const [modal, setModal] = useState(false);

  const toggle = () => setModal(!modal);
  var ingredients = [];
  var steps = [];
  // const ingredientsToUnwrap = useCallback(() => {
  for (let i = 0; i < props.repData.ingredients.length; i++) {
    ingredients.push(<li>{props.repData.ingredients[i]}</li>);
  }
  // }, props.repData);
  for (let i = 0; i < props.repData.steps.length; i++) {
    steps.push(<li>{props.repData.steps[i]}</li>);
  }
  let returnUserEmail = props.repData.useremail;
  let returnTitle = props.repData.title;
  return (
    <div className="buttonsContainerSecond">
      <Button
        className="repListItem "
        id="repButtonOverride"
        onClick={() => {
          toggle();
        }}
      >
        {buttonLabel} {props.repData.title}
      </Button>
      <Modal isOpen={modal} fade={false} toggle={toggle} className={className}>
        <ModalHeader toggle={toggle}>{props.repData.title}</ModalHeader>
        <ModalBody>
          <div className="imageContainer">
            <img src={props.repData.imageLink}></img>
          </div>

          <div className="titleBody"> Ingredients</div>
          <ul>{ingredients}</ul>

          <div className="titleBody"> Steps</div>
          <ol>{steps}</ol>
        </ModalBody>
        <ModalFooter>
          <Button
            className="cancel"
            id="cancelButtonOverride"
            onClick={() => {
              toggle();
              props.deleteRep(returnUserEmail, returnTitle);
            }}
          >
            DELETE
          </Button>{" "}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default RecipeModal;
