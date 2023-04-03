const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const sqlite3 = require('sqlite3').verbose();
//const morgan = require('morgan');

const app = express();
const port = 1337;
-
app.use(express.static('assets'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
//app.use(morgan('combined')); //for logging we can use the built in morgan middleware, turn it off when developing unless youre crazy

let sql;
//connect to db
const db = new sqlite3.Database('user.db',sqlite3.OPEN_READWRITE,(err)=>{
  if (err) return console.error(err.message);
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~make user table ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//sql = `CREATE TABLE users(id INTEGER PRIMARY KEY,first_name,last_name,username,password,email)`;
//db.run(sql);

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~dropping a table ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//db.run("DROP TABLE users");

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~inserting some user info ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//insert = `INSERT INTO users(first_name,last_name,username,password,email) VALUES (?,?,?,?,?)`;
//db.run(
//  insert,
//  ["adam","smith","asmith78","test","example@gmail.com"],
//  (err)=>{
//  if (err) return console.error(err.message);
//});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~update users ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//sql = `UPDATE users SET first_name = ? WHERE id = ?`;
//db.run(sql,['johnny',5],(err)=>{
//  if (err) return console.error(err.message);
//});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~delete users ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//sql = `DELETE FROM users WHERE id = ?`;
//db.run(sql,[3],(err)=>{
//  if (err) return console.error(err.message);
//});

//query our users
//sql = `SELECT * FROM users`;
//db.all(sql,[],(err, rows)=>{
//  if (err) return console.error(err.message);
//  rows.forEach((row)=>{
//    console.log(row)
//  });
//});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~routing below ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//home page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/src/main.html');
});

//sending a get request to register should just get the page
app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/src/register.html');
});

//sending a post to register (from entering form) should handle the json data, load it into user db
app.post('/register', (req, res) => {
  let data = req.body;
  res.send('Data recieved: ' + JSON.stringify(data));
});

//TODO: create a working login with passport
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/src/login.html');
});

//TODO: add a search functinoality that generates the correct tradingview window
//TODO: include the vader nlp functionality + grab a few news articles from yfinance
app.get('/news', (req, res) => {
  res.sendFile(__dirname + '/src/stockInf.html');
});

//TODO: we need to switch up our investing page - to -> retirement planning
app.get('/investing', (req, res) => {
  res.sendFile(__dirname + '/src/investing.html');
});

app.use(function(req, res){
  res.sendFile(__dirname + '/src/404.html');
});

//listener
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});























//https://medium.com/justinctollison/using-javascript-fetch-to-grab-yahoo-finance-api-949fd24876c9

//const encodedParams = new URLSearchParams();
//encodedParams.append("symbol", "GOOG");

//const options = {
//  method: 'POST',
//  headers: {
//    'content-type': 'application/x-www-form-urlencoded',
//    'X-RapidAPI-Key': 'f66af50666msh7c3ae7fcc636e9dp1db22cjsn66004894965b',
//    'X-RapidAPI-Host': 'yfinance-stock-market-data.p.rapidapi.com'
//  },
//  body: encodedParams
//};

//fetch('https://yfinance-stock-market-data.p.rapidapi.com/simple-info', options)
//  .then(response => response.json())
//  .then(response => console.log(response))
//  .catch(err => console.error(err));

//const vader = require('vader-sentiment');
//const input = 'VADER is very smart, handsome, and funny';
//const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(input);
//console.log(intensity);
