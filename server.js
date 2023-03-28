const express = require('express');
const path = require('path');
//const morgan = require('morgan');

const app = express();
const port = 3000;

app.use(express.static('assets'));

//app.use(morgan('combined')); //for logging we can use the built in morgan middleware, turn it off when developing unless youre crazy

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/main.html');
});

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/register.html');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

app.get('/news', (req, res) => {
  res.sendFile(__dirname + '/stockInf.html');
});

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
