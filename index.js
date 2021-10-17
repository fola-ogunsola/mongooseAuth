const express = require('express');
const uuid = require('uuid').v4
const session = require('express-session')
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
var mongoose = require('./config/config');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const axios = require('axios');
const bcrypt = require('bcrypt-nodejs');


const  User = require('./model/user');

// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json())
// const user = [
//     {id: '1', email: 'test@test.com', password: 'password'}
//   ]


// passport.use(new LocalStrategy(
//     { usernameField: 'email' },
//     (email, password, done) => {
//         console.log('here-here')
//       User.findOne({email : email}, function(err, user){
//         if (err) { return done(err); }
//         if (!user) {
//             return done(null, false, { message: 'User not found' });
//           }
//           if (!bcrypt.compareSync(password, user.password)) {
//             return done(null, false, { message: 'Invalid credentials.\n' });
//           }
//           return done(null, user);
//       })
//     }
//   ));
  
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    (email, password, done) => {
    User.findOne({email : email})
      .then(function(user){
        if (!user) {
          return done(null, false, { message: 'User not found' });
        }
        if (password != user.password) {
          return done(null, false, { message: 'Invalid credentials.\n' });
        }
        return done(null, user);
      })
      .catch(error => done(error));
    }
  ));

  // tell passport how to serialize the user
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
  
  // create the server
  const app = express();
  
  // add & configure middleware
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())
  app.use(session({
    genid: (req) => {
      return uuid() // use UUIDs for session IDs
    },
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  }))
  app.use(passport.initialize());
  app.use(passport.session());
  
  // create the homepage route at '/'
  app.get('/', (req, res) => {
    res.send(`You got home page!\n`)
  })
  // create the login get and post routes
  app.get('/login', (req, res) => {
    res.send(`You got the login page!\n`)
  })
  
  app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if(info) {return res.send(info.message)}
      if (err) { return next(err); }
      if (!user) { return res.redirect('/login'); }
      req.login(user, (err) => {
        if (err) { return next(err); }
        return res.redirect('/authrequired');
      })
    })(req, res, next);
  })

  app.post('/register', createStudent);
  function createStudent(req,res,next){
      User.create(req.body).then(function(user){
          res.send(user)
      }).catch(next);
  }

  app.get('/authrequired', (req, res) => {
    if(req.isAuthenticated()) {
      res.send('you hit the authentication endpoint\n')
    } else {
      res.redirect('/')
    }
  })
  
  // tell the server what port to listen on
  app.listen(3500, () => {
    console.log('Listening on localhost:3500')
  })
    