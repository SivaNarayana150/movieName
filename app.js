const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running At http://localhost:3001/movies");
    });
  } catch (e) {
    console.log(`Error running ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertObjectDatabaseAndServer = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};
//API to get movie names
app.get("/movies/", async (request, response) => {
  const getMovieNameQuery = `SELECT movie_name FROM movie;`;
  const getMovieName = await db.all(getMovieNameQuery);
  response.send(
    getMovieName.map((eachMovieName) =>
      convertObjectDatabaseAndServer(eachMovieName)
    )
  );
});

// creating a new movie using post command
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const queryToCreateNewMovie = `INSERT INTO 
    movie 
    (director_id,movie_name,lead_actor)
    VALUES ('${directorId}','${movieName}','${leadActor}');`;
  const dbResponse = await db.run(queryToCreateNewMovie);
  response.send("Movie Successfully Added");
});

// getting a particular movie
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const queryToGet = `SELECT * FROM movie WHERE movie_id=${movieId};`;
  const movie = await db.get(queryToGet);
  response.send(convertObject(movie));
});

// updating new movie
app.put("/movies/:movieId/", async (request, response) => {
  const movieDetails = request.body;
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = movieDetails;
  const movieUpdateQuery = `UPDATE movie 
    SET director_id='${directorId}',movie_name='${movieName}',
    lead_actor='${leadActor}' WHERE movie_id=${movieId};

    `;

  await db.run(movieUpdateQuery);
  response.send("Movie Details Updated");
});

// Deleting a movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `DELETE FROM movie 
    WHERE movie_id=${movieId};`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

const convertObjectDatabaseAndServerDirector = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//getting all directors details

app.get("/directors/", async (request, response) => {
  const getDirectorDetailsQuery = `SELECT * FROM director;`;
  const getDirectorName = await db.all(getDirectorDetailsQuery);
  response.send(
    getDirectorName.map((directors) =>
      convertObjectDatabaseAndServerDirector(directors)
    )
  );
});

const convertObjectSpecifiedObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

// get specified director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const queryToGetSpecifiedMovieName = `SELECT movie_name FROM movie WHERE director_id=${directorId};`;
  const movieNames = await db.get(queryToGetSpecifiedMovieName);
  response.send(convertObjectSpecifiedObject(movieNames));
});

module.exports = app;
