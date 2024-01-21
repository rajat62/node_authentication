const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI).then(()=>{
    console.log("Connected to mongodb")
}).catch(err=>{
    console.log(err.message)
})

mongoose.connection.on("connected", ()=>{
    console.log("Mongoose connected to DB");
})

mongoose.connection.on('error', (err)=>{
    console.log(err.message);
})

mongoose.connection.on("disconnected", ()=>{
    console.log("Mongoose connection disconnected");
})

process.on('SIGINT', async()=>{
    await mongoose.connection.close();
    process.exit(0);
})