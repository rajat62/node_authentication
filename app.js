const express= require("express");
const morgan = require("morgan");
const createError = require("http-errors");
const mongoose = require("mongoose");
require("dotenv").config();
require("./Helpers/init_mogodb")

const AuthRoute = require("./Routes/auth.route"); 
const {verifyAccessToken} = require("./Helpers/jwt_helper");

// Declarations
const PORT = process.env.PORT || 8000;
const app = express();
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.get("/",verifyAccessToken, async(req, res, next)=>{
    

    res.json({message: "hello world"})
})
app.use("/auth/", AuthRoute);

app.use(async(req, res, next)=>{
    next(createError.NotFound("This route does not exist"));
})
app.use((error, req, res, next)=>{
    res.status(error.status || 500);
    res.send({
        error:{
            status: error.status || 500,
            message: error.message
        }
    })
})


app.listen(PORT, ()=>{
    console.log(`Connected to express sevrer on port: ${PORT}`)
})