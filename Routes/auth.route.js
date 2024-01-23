const express = require("express");
const createError = require("http-errors");
const router  = express.Router();
const User = require("../Models/user.model");
const {authSchema} = require("../Helpers/validation_schema");
const {signAccessToken, signRefreshToken, verifyRefreshToken} = require("../Helpers/jwt_helper");

router.post("/register", async(req, res, next)=>{
    try {

        const result = await authSchema.validateAsync(req.body)

        console.log(result);

            const oldUser  = await User.findOne({email: result.email});

            if(oldUser){
                throw createError.Conflict(`${result.email} is already in use`);
            }else{
                const user  = new User(result);
                const savedUser = await user.save();

                const accessToken = await signAccessToken(savedUser.id);
                const refreshToken = await signRefreshToken(savedUser.id);
                res.send( {accessToken, refreshToken});
            }
    } catch (error) {
        if(error.isJoi === true) error.status = 422;
        next(error);
    }
})
router.post("/login", async(req, res, next)=>{
    
    try {
        const result = await authSchema.validateAsync(req.body);

        const oldUser  = await User.findOne({email: result.email});

        if(!oldUser) throw createError.NotFound("User not registered");

        const isMatch = await oldUser.isValidPassword(result.password);

        if(!isMatch) throw createError.Unauthorized('Username/password are not valid');

        const accesstoken = await signAccessToken(oldUser.id);
        const refreshToken = await signRefreshToken(oldUser.id);
        res.send({accesstoken, refreshToken})

    } catch (error) {
        if(error.isJoi === true) return next(createError.BadRequest("invalid username/password"));

        next(error)
    }

})
router.post("/refresh-token", async(req, res, next)=>{

    try {
        const {refreshToken} = req.body; 
        if(!refreshToken) throw createError.BadRequest();

        const userId = await verifyRefreshToken(refreshToken);
        
        const newAccessToken = await signAccessToken(userId);
        const newRefreshToken = await signRefreshToken(userId);

        res.send({accessToken :newAccessToken,refreshToken: newRefreshToken});
    } catch (error) {
        next(error);
    }
})

router.delete("/logout", async(req, res, next)=>{
    res.send("logout route");
})

module.exports = router;
