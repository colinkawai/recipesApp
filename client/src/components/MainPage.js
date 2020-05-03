import React, { Component } from "react";
import FormInput from "./FormInput";
import RecipeList from "./RecipeList";
import axios from "axios";
import Sky from "react-sky";

import watermelon from "../media/watermelon.png";
import sushi from "../media/sushi.png";
import strawberry from "../media/strawberry.png";
import slice from "../media/slice.png";
import peach from "../media/peach.png";
import egg from "../media/egg.png";
import coffee from "../media/coffee.png";
import burger from "../media/burger.png";
import apple from "../media/apple.png";
import { Link, animateScroll as scroll } from "react-scroll";

import { GoogleLogin } from "react-google-login";
import config from "../config.json";

class MainPage extends Component {
  _isMounted = false;
  constructor() {
    super();
    this.state = {
      isAuthenticated: false,
      user: null,
      useremail: "",
      token: "",
      badLink: true,
      enteredLink: false,
      userReps: "",
    };
    this.myRef = React.createRef();
    this.baseState = this.state;
    this.addLink = this.addLink.bind(this);
    this.deleteRep = this.deleteRep.bind(this);
  }

  //scrollToMyRef = () => window.scrollTo(0, this.myRef.current.offsetTop);
  scrollToMyRef = () =>
    this.myRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  logout = () => {
    this.setState({
      isAuthenticated: false,
      token: "",
      user: null,
      userReps: "",
    });
    this.setState(this.baseState);

    window.localStorage.removeItem("jwt");
    window.localStorage.removeItem("user");
    window.localStorage.removeItem("auth");
  };

  componentDidMount() {
    this._isMounted = true;
    if (window.localStorage.getItem("jwt") !== null && this._isMounted) {
      this.setState(
        {
          isAuthenticated: localStorage.getItem("auth"),
          token: localStorage.getItem("jwt"),
          user: localStorage.getItem("user"),
          useremail: localStorage.getItem("useremail"),
        },
        () => {
          this.getUserInfo();
        }
      );
    }
  }

  getUserInfo() {
    if (this.state.useremail !== "")
      axios
        .get(
          "https://fathomless-headland-87238.herokuapp.com/api/getData/" +
            this.state.useremail
        )
        .then((res) => {
          this.setState({ userReps: res.data });
        })
        .catch((err) => {
          console.log(err);
        });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.useremail != prevState.useremail) {
      console.log(prevState.useremail);
      console.log(this.state.useremail);
      this.getUserInfo();
    }
  }

  deleteRep = (useremail, title) => {
    axios
      .delete("/api/deleteData/" + useremail + "/" + title)
      .then((res) => {
        if (res.data) {
          this.getUserInfo();
        }
      })
      .catch((err) => console.log(err));
  };

  googleResponse = (res) => {
    const tokenBlob = new Blob(
      [JSON.stringify({ access_token: res.accessToken }, null, 2)],
      { type: "application/json" }
    );
    const options = {
      method: "POST",
      body: tokenBlob,
      mode: "cors",
      cache: "default",
    };
    fetch(
      "https://fathomless-headland-87238.herokuapp.com/api/v1/auth/google",
      options
    ).then((r) => {
      const token = r.headers.get("x-auth-token");
      r.json().then((user) => {
        if (token) {
          this.setState({
            isAuthenticated: true,
            user,
            token,
            useremail: user.email,
          });
          localStorage.setItem("jwt", token);
          localStorage.setItem("user", user);
          localStorage.setItem("useremail", user.email);
          localStorage.setItem("auth", true);
        }
      });
    });
    this.scrollToMyRef();
  };

  onFailure = (error) => {
    alert(error);
  };

  addLink = (titleLink) => {
    axios
      .post("https://fathomless-headland-87238.herokuapp.com/api/putData", {
        ingredients: titleLink,
        useremail: this.state.useremail,
      })
      .then((res) => {
        this.setState({ badLink: false });
        this.setState({ enteredLink: true });
        console.log(res);
      })
      .catch((err) => {
        if (err.res) {
          this.setState({ enteredLink: true });
        }
      });
  };

  render() {
    // shows error message when logged in with bad link
    const badLink = this.state.badLink;
    let badLinkNotice;
    if (badLink && this.state.isAuthenticated && this.state.enteredLink) {
      badLinkNotice = <div>Bad link or unsupported website</div>;
    }
    const userReps = this.state.user ? this.state.userReps : null;
    let content = !!this.state.isAuthenticated ? (
      <div className="auth">
        <div>
          <button onClick={this.logout} className="logOut">
            sign out
          </button>
        </div>
      </div>
    ) : (
      <div className="auth">
        <GoogleLogin
          clientId={config.GOOGLE_CLIENT_ID}
          buttonText="Login"
          onSuccess={this.googleResponse}
          onFailure={this.onFailure}
        />
      </div>
    );

    const isLogged = this.state.isAuthenticated;
    let logNotice = !isLogged ? (
      <div id="logNotice">Please log in to store your recipes</div>
    ) : null;

    return (
      <div>
        <div className="mainContainer">
          <Sky
            images={{
              0: watermelon,
              1: sushi,
              2: strawberry,
              3: slice,
              4: peach,
              5: egg,
              6: coffee,
              7: burger,
              8: apple,
            }}
            how={50}
            size={"50px"}
            background={"#fffff0"}
          />
          {content}
          <div className="titleContainer">
            <div className="title">Recipe Repo</div>
            <div className="titleHeader">store your favorite recipes </div>
          </div>

          <Link
            activeClass="mainContainer"
            to="containerTwo"
            spy={true}
            smooth={true}
            offset={50}
            duration={500}
          >
            <i className="gg-chevron-down"></i>
          </Link>
        </div>

        <div className="containerTwo" id="forJump" ref={this.myRef}>
          <div className="addTitleWithList">
            <FormInput
              addLink={this.addLink}
              isLogged={this.state.isAuthenticated}
            />
            {badLinkNotice}
            <div className="repListContainer">
              {logNotice}

              <RecipeList userReps={userReps} deleteRep={this.deleteRep} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MainPage;
