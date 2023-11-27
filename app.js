const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

let db = null;
const connectToDB = async () => {
  const pathName = path.join(__dirname, "covid19India.db");
  try {
    db = await open({
      filename: pathName,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
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

const updateObj = (ele) => {
  return {
    stateId: ele.state_id,
    stateName: ele.state_name,
    population: ele.population,
  };
};

app.get("/states/", async (request, response) => {
  const getMovies = `select * from state order by state_id  `;
  const result = await db.all(getMovies);
  const obj = result.map((ele) => updateObj(ele));
  console.log(obj);
  response.send(obj);
});

app.post("/districts/", async (req, res) => {
  const district = req.body;
  const { districtName, stateId, cases, cured, active, deaths } = district;
  const q1 = `insert into district(district_name,state_id,cases,cured,active,deaths)
  values ("${districtName}",${stateId},"${cases}","${cured}","${active}","${deaths}"  ) `;
  const result1 = await db.run(q1);
  console.log(result1.lastID);
  res.send("District Successfully Added");
});

const changeCaseObject = (ele) => ({
  movieId: ele.movie_id,
  directorId: ele.director_id,
  movieName: ele.movie_name,
  leadActor: ele.lead_actor,
});

app.get("/districts/:districtId/", async (req, res) => {
  const { districtId } = req.params;
  //   console.log(districtId);
  const getState = `select * from district where district_id=${districtId}`;
  const ele = await db.get(getState);
  //   console.log(ele);
  const obj = {
    districtId: ele.district_id,
    districtName: ele.district_name,
    stateId: ele.state_id,
    cases: ele.cases,
    cured: ele.cured,
    active: ele.active,
    deaths: ele.deaths,
  };
  res.send(obj);
});

app.get("/states/:stateId/", async (req, res) => {
  const { stateId } = req.params;
  //   console.log(districtId);
  const getState = `select * from state where state_id=${stateId}`;
  const ele = await db.get(getState);
  //   console.log(ele);
  const obj = {
    stateId: ele.state_id,
    stateName: ele.state_name,
    population: ele.population,
  };
  res.send(obj);
});

app.put("/districts/:districtId/", async (req, res) => {
  const { districtId } = req.params;
  const district = req.body;
  const { districtName, stateId, cases, cured, active, deaths } = district;
  const updateQuery = `update district 
                            set district_name="${districtName}",
                            state_id=${stateId},
                            cases="${cases}",
                            cured="${cured}",
                            active="${active}",
                            deaths="${deaths}"
                        where district_id=${districtId} `;
  const result = await db.run(updateQuery);
  res.send("District Details Updated");
});

app.delete("/districts/:districtId/", async (req, res) => {
  const { districtId } = req.params;
  const deleteQuery = `delete from district where district_id=${districtId}`;
  const result = await db.run(deleteQuery);
  res.send("District Removed");
});

const changeCaseDirector = (ele) => ({
  directorId: ele.director_id,
  directorName: ele.director_name,
});

app.get("/states/:stateId/stats/", async (req, res) => {
  const { stateId } = req.params;
  const getMovies = `select sum(cases) totalCases ,sum(cured) totalCured,sum(active) totalActive,sum(deaths) totalDeaths from district where state_id=${stateId} `;
  const result = await db.get(getMovies);
  console.log(result);
  res.send(result);
});

app.get("/districts/:districtId/details/", async (req, res) => {
  //   console.log("DM");
  const { districtId } = req.params;
  //   console.log(directorId);
  const directorMovie = `select state_name stateName from district natural join state where 
            district_id=${districtId} `;
  const result = await db.get(directorMovie);
  //   const obj = result.map((ele) => ({ movieName: ele.movie_name }));
  console.log(result);
  res.send(result);
});

module.exports = app;
