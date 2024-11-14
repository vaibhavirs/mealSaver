const express = require("express")
const app = express();
const path = require("path");
const userModel = require("./models/useregistration");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname , 'public')));
app.use(cookieParser())

app.get("/",(req,res)=>{
    res.render("index");
});

app.get("/register", (req,res)=>{
    res.render("register");
});

app.post("/register", async (req,res)=>{
    let {registrationid , name , email , mobile , password , year , branch } = req.body ;

    let user =  await userModel.findOne({email : email});
    if(user){
        res.render("login");
    }
    else{
        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(password , salt , async (err,hash)=>{
                let user = await userModel.create({
                    registrationid,
                    name,
                    email ,
                    mobile ,
                    password : hash ,
                    year ,
                    branch 
                });
                let token = jwt.sign({email : email , userid : user._id } , "sahil");
                res.cookie("token", token);
                res.render("login");
            })
        })
    }
});


app.get("/login", (req,res)=>{
    res.render("login");
});

app.get("/profile" ,isLoggedin,(req,res)=>{
    res.render("profile", { user: req.user });
})

app.post("/login", async (req,res)=>{
    let {registrationid , password} = req.body ;

    let user = await userModel.findOne({registrationid}) ;
    if(!user) return res.status(500).send("User doesn't exist") ;

    bcrypt.compare(password,user.password , function(err, result) {
        if(result){
            let token = jwt.sign({registrationid : registrationid , userid: user._id , name : user.name },"sahil");
            res.cookie("token", token);
            res.redirect("/profile");            
        }
        else {
            res.redirect("/login");
        }
    });
});

app.get("/logout" , (req,res)=>{
    res.cookie("token","");
    res.redirect("/login");
});

function isLoggedin(req, res, next){
    const token = req.cookies.token;
    if(!token) {
        return res.redirect("/login");
    }
    else {
        let data = jwt.verify(req.cookies.token , "sahil");  //compare kiya ki kon hai using verify tokens 
        req.user = data ;
        next();
    }
}

app.listen(3000);
