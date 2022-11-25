const express = require('express');
const PORT = 8010;
const app = express()
const session = require('express-session')
const path = require('path')
const passport = require('passport')
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const bodyParser= require('body-parser');

app.use(bodyParser.urlencoded({extended:true}))
app.use(session({
    secret:'secret',
    resave:false,
    saveUninitialized:false,
    cookie: {maxAge: 1000*60*60*60}
}))

// Initializing passport
app.use(passport.initialize());
// Starting the session
app.use(passport.session());


// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/autoDB",
    { useNewUrlParser: true ,useUnifiedTopology: true}
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));


app.set('view engine','ejs');
app.set('views',__dirname +'/views');
// json and encoded use to extract form data from login.html
app.use(express.json())

app.use(express.static( path.join(__dirname ,'/public')))

const userSchema = new mongoose.Schema({
email:String,
password:String
    // firstName: {
    //     type: String,
    //     required: true
    //   },
    //   lastName: {
    //     type: String,
    //     required: true
    //   },
    //   farmSize: {
    //     type: Number,
    //     required: true
    //   },
    //   email: {
    //     type: String,
    //     required: true
    //   },
    //   password: {
    //     type: String,
    //     required: true
    //   },
    //   typeOfCrop: {
    //     type: String,
    //     required:false
    //   }
})

// adding passport local mongoose plugin to our Schema

userSchema.plugin(passportLocalMongoose);

// creating the User model

const User = new mongoose.model('User',userSchema);

passport.use(User.createStrategy());

// serializing and deserializing form data

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// handling  get request on the home route

app.get("/login",(req,res)=>{
    if(req.isAuthenticated()){
        console.log("user already logged in and there is no need to login again");
        res.render('home');
    }else{
        // is user is new and there is no session is running already
        
        res.render("login");
    }
})

app.get('/',(req,res)=>{
    if(req.isAuthenticated()){
        console.log("user already logged in");
        res.render('home');
    }else{
        console.log("user not sign up");
        res.redirect('/login')
    }
})

app.get('/register',(req,res)=>{
    res.render('register')
})
app.post('/register',(req,res)=>{
    console.log(req.body);
    var email = req.body.username;
    var password = req.body.password;


    User.register({username:email},req.body.password,(err,user)=>{
        if(err){
            console.log(err);
            throw err;
        }else{
            passport.authenticate('local')
            (req,res,function(){
                res.render('home');
            })
        }
    })
})

// Handling the post request on /login routes

app.post("/login",(req,res)=>{
    console.log(req.body);

    const userToBeChecked = new User({
        username:req.body.username,
        password:req.body.password
    });

    // Checking if user is correct or nothing
    req.login(userToBeChecked,(err)=>{
        if(err){
            console.log(err);
            res.redirect('/');
        }else{
            passport.authenticate("local")
            (req,res,()=>{
                User.find({email:req.user.username},
                  function(err,docs){
                    if(err){
                        console.log(err);
                        throw err;
                    }else{
                        // login is successful
                        console.log('credentials are correct');
                        res.render('home');
                    }
                  });
            });
        }
    })
})




app.get('/logout',(req,res,next)=>{
     req.logout((error)=>{
        if(error) throw error
        
     });
     res.redirect('/login');
})



app.listen(PORT,()=>{
    console.log(`listening at ${PORT}........`)
})

