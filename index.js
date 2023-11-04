const mongoose =require("mongoose");
const express=require("express");
const app=express();
const cors = require("cors");
const bodyparser =require("body-parser");
const application_routes = require("./controllers/AppRouters")
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
app.use(cors());
app.use("/app",application_routes);
app.listen(4000,()=>{
    console.log("Server connected to port:4000")
})