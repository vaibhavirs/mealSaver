const express = require("express");
const app = express();
const path = require("path");
const userModel = require("./models/useregistration");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const MealCount = require('./models/mealcount');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname , 'public')));
app.use(cookieParser());

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

app.get("/logout" , (req,res)=>{
    res.cookie("token","");
    res.redirect("/");
});

app.get("/login", (req,res)=>{
    res.render("login");
});

app.get("/profile" ,isLoggedin,(req,res)=>{
    res.render("profile", { user: req.user });
})

app.post("/login", async (req,res)=>{
    let {registrationid , password} = req.body ;

    // Check for admin login
    if (registrationid === 'admin' && password === 'admin') {
        let token = jwt.sign({role: 'admin'}, "sahil");
        res.cookie("token", token);
        return res.redirect("/admin");
    }

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

app.get("/admin", isAdmin, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const mealCount = await MealCount.findOne({ date: today });

        res.render("admin", {
            breakfastCount: mealCount ? mealCount.breakfast.length : 0,
            lunchCount: mealCount ? mealCount.lunch.length : 0,
            dinnerCount: mealCount ? mealCount.dinner.length : 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching meal counts');
    }
});

app.post("/profile/update-meals", isLoggedin, async (req, res) => {
    try {
        const { breakfast, lunch, dinner } = req.body;
        const userId = req.user.userid;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let mealCount = await MealCount.findOne({ date: today });

        if (!mealCount) {
            mealCount = new MealCount({ date: today });
        }

        if (breakfast === 'yes' && !mealCount.breakfast.includes(userId)) {
            mealCount.breakfast.push(userId);
        } else if (breakfast === 'no') {
            mealCount.breakfast = mealCount.breakfast.filter(id => !id.equals(userId));
        }

        if (lunch === 'yes' && !mealCount.lunch.includes(userId)) {
            mealCount.lunch.push(userId);
        } else if (lunch === 'no') {
            mealCount.lunch = mealCount.lunch.filter(id => !id.equals(userId));
        }

        if (dinner === 'yes' && !mealCount.dinner.includes(userId)) {
            mealCount.dinner.push(userId);
        } else if (dinner === 'no') {
            mealCount.dinner = mealCount.dinner.filter(id => !id.equals(userId));
        }

        await mealCount.save();

        res.redirect("/profile");
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while updating meal selections');
    }
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

function isAdmin(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect("/login");
    }
    try {
        const decoded = jwt.verify(token, "sahil");
        if (decoded.role === 'admin') {
            next();
        } else {
            res.status(403).send("Access denied");
        }
    } catch (error) {
        res.status(400).send("Invalid token");
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));