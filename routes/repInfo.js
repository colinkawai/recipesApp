const cheerio = require("cheerio");
const axios = require("axios");
const url = require("url");
const mongoose = require("mongoose");
const express = require("express");
var cors = require("cors");
const bodyParser = require("body-parser");
const logger = require("morgan");
const Data = require("../data");
const path = require("path");
var http = require("http");

// this used to be 3001
//const API_PORT = 3001;

//const app = express();
//app.use(cors());
const router = express.Router();

//const mongodb =
//("mongodb+srv://Colin_Kawai:Twinturbo123@cluster0-p8ar4.mongodb.net/recipe?retryWrites=true");
// connects our back end code with the database
//mongoose.connect(mongodb, { useNewUrlParser: true });

//let db = mongoose.connection;

//db.once("open", () => console.log("connected to the database recipe"));

// checks if connection with the database is successful
//db.on("error", console.error.bind(console, "MongoDB connection error:"));

// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());
//app.use(logger("dev"));

router.get("/", function (req, res) {
  res.send("Hello World");
});

router.post("/putData", async (req, res) => {
  let data = new Data();

  const ingredients = req.body.ingredients;
  const useremail = req.body.useremail;
  console.log(ingredients);

  if (typeof ingredients === "undefined") {
    return res.json({
      success: false,
      error: "INVALID INPUTS",
    });
  }

  let returnScrape = await getInfo(ingredients);

  data.ingredients = returnScrape.ingredients;
  data.steps = returnScrape.steps;
  data.title = returnScrape.title;
  data.imageLink = returnScrape.imageLink;
  data.useremail = useremail;

  data.save((err) => {
    if (err) return res.json({ success: false, error: err });

    return res.json({ success: true });
  });
  console.log(data);
});
/*
router.get("/getData/:useremail", (req, res) => {
  Data.aggregate(
    [
      {
        $match: {
          useremail: req.params.useremail,
        },
      },
    ],
    function (err, data) {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    }
  );
});

router.get("/getData", (req, res, next) => {
  Data.find({}, "useremail")
    .then((data) => res.json(data))
    .catch(next);
});
*/

router.get("/getData/:useremail", (req, res) => {
  Data.find({ useremail: req.params.useremail }, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

router.delete("/deleteData/:useremail/:title", (req, res, next) => {
  Data.findOneAndDelete(
    { useremail: req.params.useremail },
    { title: req.params.title }
  )
    .then((data) => res.json(data))
    .catch(next);
});

async function getInfo(urlInput) {
  let inputUrl = "https://www.bonappetit.com/recipe/digestive-cookies";
  let returnInfo;
  inputUrl = urlInput;
  let domainUrl = url.parse(inputUrl).hostname;
  if (domainUrl === "www.allrecipes.com") {
    returnInfo = await getRecipeInfoAllRep(inputUrl);
  }
  if (domainUrl === "www.bonappetit.com") {
    returnInfo = await getRecipeInfoBon(inputUrl);
  }
  if (domainUrl === "www.foodnetwork.com") {
    returnInfo = await getRecipeInfoFoodNet(inputUrl);
  }
  return returnInfo;
}
function getRecipeInfoFoodNet(inputUrl) {
  return new Promise((resolve, reject) => {
    axios
      .get(inputUrl)
      .then((res) => {
        if (res.status === 200) {
          const html = res.data;
          const $ = cheerio.load(html);
          let ingredients = [];
          let steps = [];

          var returnItem = {
            ingredients: [],
            steps: [],
            title: "",
            imageLink: "",
          };

          $(".o-Ingredients__a-Ingredient").each(function (i, elem) {
            ingredients[i] = $(this).text();
            returnItem.ingredients.push(ingredients[i]);
          });

          $(".o-Method__m-Step").each(function (i, elem) {
            steps[i] = $(this).text().trim();

            stepCut = steps[i].substring(0, steps[i].indexOf("\n"));
            returnItem.steps.push(steps[i]);
          });

          title = $(".o-AssetTitle__a-Headline")
            .find(".o-AssetTitle__a-HeadlineText")
            .text();
          if (title) {
            returnItem.title = title;
          }

          image = $(".m-MediaBlock__a-Image").attr("src");
          if (image) {
            stringeConcat = "https";
            image = stringeConcat + image;
            returnItem.imageLink = image;
          }

          resolve(returnItem);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
}

function getRecipeInfoAllRep(inputUrl) {
  return new Promise((resolve, reject) => {
    axios
      .get(inputUrl)
      .then((res) => {
        if (res.status === 200) {
          const html = res.data;
          const $ = cheerio.load(html);
          let ingredients = [];
          let steps = [];

          var returnItem = {
            ingredients: [],
            steps: [],
            title: "",
            imageLink: "",
          };

          $(".list-ingredients-1").each(function (i, elem) {
            $(".checkList__line").each(function (j, elem) {
              ingredients[j] = $(this).find("label").find("span").text();
              if (ingredients[j] !== "Add all ingredients to list") {
                if (ingredients[j] !== "") {
                  returnItem.ingredients.push(ingredients[j]);
                }
              }
            });
          });

          $(".step").each(function (i, elem) {
            steps[i] = $(this).find("span").text();
            //stepCut = steps[i].substring(0, steps[i].indexOf("'"));
            console.log(steps[i]);
            if (stepCut !== "") {
              returnItem.steps.push(stepCut);
            }
          });

          title = $("#recipe-main-content").text();
          if (title) {
            returnItem.title = title;
          }

          image = $(".rec-photo").attr("src");
          if (image) {
            returnItem.imageLink = image;
          }

          resolve(returnItem);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
}

function getRecipeInfoBon(inputUrl) {
  return new Promise((resolve, reject) => {
    axios
      .get(inputUrl)
      .then((res) => {
        if (res.status === 200) {
          const html = res.data;
          const $ = cheerio.load(html);
          let ingredients = [];
          let steps = [];

          var returnItem = {
            ingredients: [],
            steps: [],
            title: "",
            imageLink: "",
          };

          $(".ingredient").each(function (i, elem) {
            var noLabel = $(this).find(".ingredients__text").text();
            var yesLabel = $(this)
              .find("label")
              .children(".ingredients__text")
              .text();
            if (noLabel) {
              ingredients[i] = noLabel;
            } else {
              ingredients[i] = yesLabel;
            }
            returnItem.ingredients.push(ingredients[i]);
          });

          $(".step").each(function (i, elem) {
            steps[i] = $(this).find("p").text();
            returnItem.steps.push(steps[i]);
          });

          title = $(".post__header__hed").find("a").text();
          if (title) {
            returnItem.title = title;
          }

          image = $(".expand-to-parent").find("img").attr("srcset");
          if (image) {
            imageLink = image.substring(0, image.indexOf(","));
            //imageLink = { imageLink: imageLink };
            returnItem.imageLink = imageLink;
          }

          resolve(returnItem);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
}

module.exports = router;
