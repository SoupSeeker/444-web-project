const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
//const morgan = require('morgan');

const app = express();
const port = 1337;

app.use(express.static('assets'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
//app.use(morgan('combined')); //for logging we can use the built in morgan middleware

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~connect to db~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
let sql;
const db = new sqlite3.Database('user.db',sqlite3.OPEN_READWRITE,(err)=>{
  if (err) return console.error(err.message);
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ passport config ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ for login/logout ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
passport.use(new LocalStrategy({
    usernameField: 'email', // Use email as the username field
    passwordField: 'password' // Use password as the password field
  },
  async (email, password, done) => {
    // Find the user by email
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.get(sql, [email], async (err, row) => {
      if (err) {
        return done(err);
      }
      if (!row) {
        return done(null, false, { message: 'Invalid email or password.' });
      }
      // Compare the password
      const passwordMatch = await bcrypt.compare(password, row.password);
      if (!passwordMatch) {
        return done(null, false, { message: 'Invalid email or password.' });
      }
      // Successful authentication
      return done(null, row);
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const sql = 'SELECT * FROM users WHERE id = ?';
  db.get(sql, [id], (err, row) => {
    if (err) {
      return done(err);
    }
    done(null, row);
  });
});


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~make user table ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//sql = `CREATE TABLE users(id INTEGER PRIMARY KEY,username,password,email)`;
//db.run(sql);

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~dropping a table ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//db.run("DROP TABLE users");

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~inserting some user info ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//insert = `INSERT INTO users(username,password,email) VALUES (?,?,?)`;
//db.run(
//  insert,
//  ["adam","smith","asmith78","test","example@gmail.com"],
//  (err)=>{
//  if (err) return console.error(err.message);
//});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~update users ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//sql = `UPDATE users SET email = ? WHERE id = ?`;
//db.run(sql,['john@example.com',5],(err)=>{
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

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/src/register.html');
});

//sending a post to register (from entering form) puts data into database
app.post('/register', async (req, res) => {
  var errors=[]
  if (!req.body.password){
      errors.push("You'll probably want a password");
  }
  if (!req.body.email){
      errors.push("Need an email bruhv");
  }
  //TODO: users should never see sql errors, but for our project it might not matter
  if (errors.length){
      res.status(400).json({"error":errors.join(",")});
      return;
  }
  try{
    var data = {
      username: req.body.name,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10)
    }
    //console.log(data);
    sql ='INSERT INTO users (username, email, password) VALUES (?,?,?)'
    var params =[data.username, data.email, data.password]
    db.run(sql, params, function (err, result) {
      if (err){
          res.status(400).json({"error": err.message})
          return;
      }
      //TODO: change the response to direct the user to the login page
      //res.json({
      //    "message": "success",
      //    "data": data,
      //    "id" : this.lastID
      //})
    });
    return res.redirect('/login');
  } catch {
    return res.redirect('/register');
  }
});

//TODO: create a working login with passport
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/src/login.html');
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/news',
    failureRedirect: '/login',
}));


//TODO: add a search functinoality that generates the correct tradingview window
//TODO: from the search given, provide each of the respective tradingview widgets
//TODO: consolidate the functionality into a dashboard page where user can do all the things
app.get('/news', (req, res) => {
  res.sendFile(__dirname + '/src/stockInf.html');
});

app.get('/options', (req, res) => {
  res.sendFile(__dirname + '/src/options.html');
});

app.get('/options/basics', (req, res) => {
  res.sendFile(__dirname + '/src/basics.html');
});

app.get('/options/strategy', (req, res) => {
  res.sendFile(__dirname + '/src/options.html');
});

app.get('/options/risk', (req, res) => {
  res.sendFile(__dirname + '/src/options.html');
});

app.get('/retirement', (req, res) => {
  res.sendFile(__dirname + '/src/retirement.html');
});

app.get('/retirement/401k', (req, res) => {
  res.sendFile(__dirname + '/src/401k.html');
});

app.get('/retirement/roth', (req, res) => {
  res.sendFile(__dirname + '/src/roth.html');
});

app.get('/retirement/trad', (req, res) => {
  res.sendFile(__dirname + '/src/trad.html');
});

//if a route is not found, page defaults to 404
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
