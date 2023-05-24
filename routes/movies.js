const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
let Movie = require("../models/movies");
let User = require("../models/user");

let genres = [
  "action",
  "crime",
  "comedy",
  "drama",
  "fantasy",
  "mystery",
  "thriller",
  "animation",
  "documentary",
  "history",
  "war",
];

router.get("/", async function (req, res) {
  let movies = await Movie.find({});
  if (!movies) {
    console.log("Not movies found");
  } else {
    res.render("index", {
      movies: movies,
    });
  }
});

router
  .route("/movies/add")
  .get(ensureAuthenticated, (req, res) => {
    res.render("add_movie", {
      genres: genres,
    });
  })

  .post(ensureAuthenticated, async function (req, res) {
    await check("name", "Name is required").notEmpty().run(req);
    await check("description", "Description is required").notEmpty().run(req);
    await check("year", "Year is required").notEmpty().run(req);
    await check("genres", "Genres is required").notEmpty().run(req);
    await check("rating", "Rating is required").notEmpty().run(req);

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      let movie = new Movie();

      movie.name = req.body.name;
      movie.description = req.body.description;
      movie.year = req.body.year;
      movie.genres = req.body.genres;
      movie.rating = req.body.rating;
      movie.posted_by = req.user.id;

      try {
        await movie.save();
        res.redirect("/");
      } catch {
        console.log("Error saving movie");
        return;
      }
    } else {
      res.render("add_movie", {
        genres: genres,
        errors: errors.array(),
      });
    }
  });

router.get("/movie/:id", async function (req, res) {
  let movie;
  try {
    movie = await Movie.findById(req.params.id);
  } catch {}
  let user = await User.findById(movie.posted_by);
  if (!movie) {
    res.send("No Movie Found");
  }
  if (user == null) {
    res.send("No User Found");
  }

  res.render("movie", {
    movie: movie,
    posted_by: user.name
  });
});

router.delete("/movie/:id", async (req, res) => {
  // Restrict delete if user not logged in
  if (!req.user._id) {
    res.status(500).send();
  }

  let query = { _id: req.params.id };

  let movie = await Movie.findById(req.params.id);
  if (!movie) {
    res.send("Could not find movie");
    return;
  }

  if (movie.posted_by != req.user._id) {
    res.status(500).send();
    return;
  }

  try {
    let result = await Movie.deleteOne(query);
    if (result.deletedCount === 0) {
      res.send("No Movie Found");
    } else {
      res.send("Movie Deleted");
    }
  } catch (error) {
    res.status(500).send();
  }
});

router
  .route("/movie/edit/:id")
  .get(ensureAuthenticated, async (req, res) => {
    let movie;
    try {
      movie = await Movie.findById(req.params.id);
    } catch {}

    if (!movie) {
      res.send("No Movie Found");
    } else {
      if (movie.posted_by != req.user.id) {
        res.redirect("/")
      } else {
        res.render("edit_movie", {
          movie: movie,
          genres: genres,
        });
      }
    }
  })

  .post(ensureAuthenticated, async function (req, res) {
    let movie = {};
    name = req.body.name;
    movie.description = req.body.description;
    movie.year = req.body.year;
    movie.genres = req.body.genres;
    movie.rating = req.body.rating;

    let query = { _id: req.params.id };

    let movie_db = await Movie.findById(req.params.id)
    if(!movie_db){
      res.send("Could not find movie")
    }

    // Restrict to only allowing user that posted to make updates
    if (movie_db.posted_by != req.user._id) {
      res.send("Only user who posted movie can edit")
    } else {
      // Update movie in MongoDB
      let result = await Movie.updateOne(query, movie)
        if (!result) {
          res.send("Could not update movie")
        } else {
          res.redirect("/");
        }
    }
  });

router
  .route("/search")
  .get((req, res) => {
    res.render("search")
  })
  .post(async function (req, res) {
    await check("name", "Name is required").notEmpty().run(req);

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      let movie;
      try {
        movie = await Movie.findOne({ name: req.body.name });
        console.log(movie)
      } catch { }
      
      if (!movie) {
        res.send("Movie not found")
      };

      res.render("movie", {
        movie: movie
      });
    }
    else {
      res.render("add_movie", {
        genres: genres,
        errors: errors.array(),
      });
    }
  });


// Function to protect routes from unauthenticated users
function ensureAuthenticated(req, res, next) {
  // If logged in proceed to next middleware
  if (req.isAuthenticated()) {
    return next();
    // Otherwise redirect to login page
  } else {
    res.redirect("/users/login");
  }
}

module.exports = router;
