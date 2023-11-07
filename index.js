const mongoose =require("mongoose");
const express=require("express");
const session = require('express-session');
const cors = require("cors");
const bodyparser =require("body-parser");
const application_routes = require("./controllers/AppRouters")
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UserOauth = require('./schema/UserOauth'); 
const post_routes = require("./controllers/PostRouters");
const app=express()

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
app.use(cors({origin: "http://localhost:3000",
methods: "GET,POST,PUT,DELETE",
credentials: true,}));

app.use(session({
  secret: '6211eb3e330b634779d6cdc24db7b0e90a17d9ee79c27f189a2af70c116aa03eb85bc71598d2bbcfb03932808bfcdb850eb902b67b688ea033e020a162b61d86',
  resave: true,
  saveUninitialized: true
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: '1011172205462-bot4q5a7poad35depeo26nac6eqlmh2q.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:4000/app/auth/google/callback',//update this url after the deployment 
  }, (accessToken, refreshToken, profile, done) => {
    UserOauth.findOne({ email: profile.emails[0].value }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        // Create a new user with profile information
        const newUser = new UserOauth({
          name: profile.displayName,
          email: profile.emails[0].value,
        });
        newUser.save((err) => {
          if (err) return done(err);
          return done(null, newUser);
        });
      } else {
        return done(null, user);
      }
    });
  }));
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  
  passport.deserializeUser((id, done) => {
    UserOauth.findById(id, (err, user) => {
      done(err, user);
    });
  });
  
mongoose.set("strictQuery",true);
mongoose.connect("mongodb+srv://sriganesan06:gt1XSZH4EHtf6ayd@mental-health-support-d.wpi0fnk.mongodb.net/mental-health-support-databse",{ useNewUrlParser: true, useUnifiedTopology: true });
var db=mongoose.connection;
db.on("open",()=>console.log("Connected established to the database!!!!"));
db.on("error",()=>console.log("Error in connection establishment to the database!!"));

app.use("/app",application_routes);
app.use("/post",post_routes);

app.listen(4000,()=>{
    console.log("Server connected to port:4000")
})