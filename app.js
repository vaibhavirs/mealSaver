const express = require("express")
const app = express();
const path = require("path");


app.get("/",(req,res)=>{
    res.send("hey");
})

app.listen(3000);
