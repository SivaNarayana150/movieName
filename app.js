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

const convertObjectDatabaseAndServer = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};
//API to get movie names
app.get("/movies/", async (request, response) => {
  const getMovieNameQuerry = `SELECT movie_name FROM movie;`;
  const getMovieName = await db.all(getMovieNameQuerry);
  response.send(
    getMovieName.map((eachMovieName) =>
      convertObjectDatabaseAndServer(eachMovieName)
    )
  );
});
