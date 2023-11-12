const mongoose =require("mongoose");
const express=require("express");
const session = require('express-session');
const cors = require("cors");
const bodyparser =require("body-parser");
const application_routes = require("./controllers/AppRouters")
const post_routes = require("./controllers/PostRouters");
const app=express()

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
app.use(cors({origin: "http://localhost:3000",
methods: "GET,POST,PUT,DELETE",
credentials: true,}));

// app.use(session({
//   secret: '6211eb3e330b634779d6cdc24db7b0e90a17d9ee79c27f189a2af70c116aa03eb85bc71598d2bbcfb03932808bfcdb850eb902b67b688ea033e020a162b61d86',
//   resave: false,
//   saveUninitialized: true
// }));

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