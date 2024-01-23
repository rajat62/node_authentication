const createError = require("http-errors");
const User = require("../Models/user.model");
const {authSchema} = require("../Helpers/validation_schema");
const {signAccessToken, signRefreshToken, verifyRefreshToken} = require("../Helpers/jwt_helper");
const client = require("../Helpers/int_redis")

const register = async(req, res, next)=>{
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
}
const login = async(req, res, next)=>{
    
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

}
const refreshToken = async(req, res, next)=>{

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
}
const logout = async(req, res, next)=>{
    try {
        const {refreshToken}  = req.body;
        if(!refreshToken) throw createError.BadRequest();

        const userId = await verifyRefreshToken(refreshToken);
        await client.DEL(userId, (err, val)=>{
            if(err){
                console.log(err.message);
                throw createError.InternalServerError();
            }
            console.log(val);
        })
        res.status(204).send("logout successfully");
    } catch (error) {
        next(error)   
    }
}
module.exports = {
    register,
    login,
    refreshToken,
    logout
}