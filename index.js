const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const movie_routes = require("./routes/movies")
const user_routes = require("./routes/users")
const session = require("express-session")
const cors = require("cors") // security library

const config = require("./config/database");
const passport = require("passport");

// connect to database
mongoose.connect(config.database);
let db = mongoose.connection;

db.once("open", () => {
  console.log("Conected to MongoDB");
});

db.on("error", (err) => {
  console.log("Error connecting to MongoDb");
  console.log(err);
});

const app = express();

app.set("/", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(session({
  secret: config.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {}
}))

require("./config/passport")(passport)

app.use(passport.initialize())
app.use(passport.session())

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(cors())

app.get("*", function (req, res, next) {
  res.locals.user = req.user || null
  next()
})

app.use("/", movie_routes)
app.use("/users", user_routes)


PORT = 8000;
app.listen(PORT, () => console.log("Server Running..."));
