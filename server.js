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
  secret: 'secretsessionpass',
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
// had to reference a few resources to make this work:
// https://www.passportjs.org/packages/passport-local/
// https://stackoverflow.com/questions/23481817/node-js-passport-autentification-with-sqlite
passport.use(new LocalStrategy({
    usernameField: 'email', // we're using email / pass combo rather than username
    passwordField: 'password'
  },
  async (email, password, done) => {
    const sql = 'SELECT * FROM users WHERE email = ?';  //first we need to check if email exists in db
    db.get(sql, [email], async (err, row) => {
      if (err) {
        return done(err);
      }
      if (!row) {
        return done(null, false); //we aren't using any express-flash messages, i'd like to include that later if possible
      }
      const passwordMatch = await bcrypt.compare(password, row.password);   //compare the password entered to pass in db using bcrypts compare()
      if (!passwordMatch) {
        return done(null, false);
      }
      return done(null, row);   //return the users row if it passes the password compare
    });
  }
));

//serializeUser and deserializeUser are used to persist user data after login into a session, and deserialize
//is used to perform user-operations
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

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~routing below ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// home page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/src/main.html');
});

// registration page
app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/src/register.html');
});

// sending a post to register (from entering form) puts data into database
app.post('/register', async (req, res) => {
  var errors=[]
  if (!req.body.password){
      errors.push("You'll probably want a password");
  }
  if (!req.body.email){
      errors.push("Need an email");
  }
  if (errors.length){ 
      res.status(400).json({"error":errors.join(",")});
      return;     //if there's any error in email / pass, return here
  }
  try{
    var data = {
      username: req.body.name,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10)  //using bcrypt to hash users passwords
    }
    //console.log(data);
    sql ='INSERT INTO users (username, email, password) VALUES (?,?,?)' //hopefully secure from SQLi
    var params =[data.username, data.email, data.password]
    db.run(sql, params, function (err, result) {
      if (err){
          res.status(400).json({"error": err.message})
          return;
      }
    });
    return res.redirect('/login');
  } catch {
    return res.redirect('/register');
  }
});

//login page
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/src/login.html');
});

//we're using passport local strategy as defined above
app.post('/login', passport.authenticate('local', {
  successRedirect: '/news',
  failureRedirect: '/login'
}));

//TODO: now we just need to find a way to display login/logout appropriately
app.get('/logout', function(req,res){
  req.session.destroy(function() {
      res.clearCookie('connect.sid');
      res.redirect('/');
  });
});

//TODO: add a search functinoality that generates the correct tradingview window
//TODO: from the search given, provide each of the respective tradingview widgets
//TODO: consolidate the functionality into a dashboard page where user can do all the things
app.get('/news', (req, res) => {
  res.sendFile(__dirname + '/src/stockInf.html');
});

app.get('/stocks', (req, res) => {
  res.sendFile(__dirname + '/src/stockmarket.html');
});

app.get('/options', (req, res) => {
  res.sendFile(__dirname + '/src/options.html');
});

app.get('/options/basics', (req, res) => {
  res.sendFile(__dirname + '/src/basics.html');
});

app.get('/options/strategy', (req, res) => {
  res.sendFile(__dirname + '/src/strategy.html');
});

app.get('/options/risks', (req, res) => {
  res.sendFile(__dirname + '/src/risks.html');
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

//helpful databse operations below

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