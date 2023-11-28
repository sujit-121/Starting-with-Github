const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

let db = null;
const connectToDB = async () => {
  const pathName = path.join(__dirname, "moviesData.db");
  try {
    db = await open({
      filename: pathName,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server at: http://localhost:3000");
    });
  } catch (e) {
    console.log(e.message);
    process.exit();
  }
};

connectToDB();

const changeCase = (ele) => ({
  movieName: ele.movie_name,
});

app.get("/movies/", async (request, response) => {
  const getMovies = `select movie_name from movie  `;
  const result = await db.all(getMovies);
  const obj = result.map((ele) => ({ movieName: ele.movie_name }));
  console.log(obj);
  response.send(obj);
});

app.post("/movies/", async (req, res) => {
  const movie = req.body;
  const { directorId, movieName, leadActor } = movie;
  const q1 = `insert into movie(director_id,movie_name,lead_actor)
  values (${directorId},"${movieName}","${leadActor}"  ) `;
  const result1 = await db.run(q1);
  console.log(result1.lastID);
  res.send("Movie Successfully Added");
});

const changeCaseObject = (ele) => ({
  movieId: ele.movie_id,
  directorId: ele.director_id,
  movieName: ele.movie_name,
  leadActor: ele.lead_actor,
});

app.get("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  console.log(movieId);
  const getMovie = `select * from movie where movie_id=${movieId}`;
  const result = await db.get(getMovie);

  res.send(changeCaseObject(result));
});

app.put("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const movie = req.body;
  const { directorId, movieName, leadActor } = movie;
  const updateQuery = `update movie 
                            set director_id=${directorId},
                            movie_name="${movieName}",
                            lead_actor="${leadActor}"
                        where movie_id=${movieId} `;
  const result = await db.run(updateQuery);
  res.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const deleteQuery = `delete from movie where movie_id=${movieId}`;
  const result = await db.run(deleteQuery);
  res.send("Movie Removed");
});

const changeCaseDirector = (ele) => ({
  directorId: ele.director_id,
  directorName: ele.director_name,
});

app.get("/directors/", async (req, res) => {
  const getMovies = `select * from director`;
  const result = await db.all(getMovies);
  res.send(result.map((ele) => changeCaseDirector(ele)));
});

app.get("/directors/:directorId/movies/", async (req, res) => {
  console.log("DM");
  const { directorId } = req.params;
  //   console.log(directorId);
  const directorMovie = `select movie_name from movie where 
            director_id=${directorId} `;
  const result = await db.all(directorMovie);
  const obj = result.map((ele) => ({ movieName: ele.movie_name }));
  res.send(obj);
});

module.exports = app;
