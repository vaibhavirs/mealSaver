const express = require("express")
const app = express();
const path = require("path");

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname , 'public')));


app.get("/",(req,res)=>{
    res.render("index");
});

app.get("/register", (req,res)=>{
    res.render("register");
})

app.get("/login", (req,res)=>{
    res.render("login");
})


app.listen(3000);
