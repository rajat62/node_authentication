const redis  = require("redis");
const client  = redis.createClient({
    port: 6379,
    host: "my-redis-container",
    
});
client.connect().then(() => {
    console.log("connected to redis ")
  })

client.on('ready', ()=>{
    console.log("client connected to reddis and ready to use");
})

client.on('error', (err)=>{
    console.log(err.message);
})

client.on('end', ()=>{
    console.log("Client disconnected from redis");
})

process.on("exit", ()=>{
    client.quit();
})

module.exports = client;


