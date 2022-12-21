const express = require('express');
const PORT = 8012;
const app = express()
const session = require('express-session')
const path = require('path')
const passport = require('passport')
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const bodyParser= require('body-parser');
const flash = require('express-flash');

app.use(bodyParser.urlencoded({extended:true}))
app.use(flash())
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

});
const UserDetailSchema = new mongoose.Schema({
  firstName:{
    type:String,
    required:true
  },
  lastName:{
    type:String,
    required:true,
  },
  farmSize:{
    type:Number,
    required:true
  },
  email:{
    type:String,
    required:true
  },
  phoneNumber:{
    type:Number,
    required:true,
  },
  typeOfCrop:{
    type:String,
    required:true,
  }


})

var cropDataSchema = new mongoose.Schema({
     name:{type: String},
     description:{type: String},
     temperature:{type: String},
     moisture: {type: String},
     rain:{type: String},

  },{collection:'cropData'});


// adding passport local mongoose plugin to our Schema

userSchema.plugin(passportLocalMongoose);

var Schema = mongoose.Schema;
// creating the User model
const User = new mongoose.model('User',userSchema); // for email and password
const UserDetails = new mongoose.model('cropdatas',UserDetailSchema);// for farmer details
const cropModel = mongoose.model('cropData',cropDataSchema);// connection to the existing data in the database


passport.use(User.createStrategy());

// serializing and deserializing form data

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// handling  get request on the home route

app.get("/login",(req,res)=>{
    if(req.isAuthenticated()){
        console.log("user already logged in and there is no need to login again");
        var username = req.body.username;
        UserDetails.find({email:username},{_id:0,typeOfCrop:1},(err,data)=>{
            console.log(data);
            if(err)throw err;
            console.log(data[0]);
            var into = data[0].typeOfCrop;
            console.log(into)
           cropModel.find({name:into},{_id:0,temperature:1,moisture:1,rain:1,name:1},(err,data)=>{
                if(err){
                    return err;
                }else{
                    console.log(data[0]);
                    res.render('home',{data:data[0]});
                }
           })
        
        })
        //res.render('home');
        
    }else{
        // is user is new and there is no session is running already
        console.log("whenever one is not authenticated")
        res.render("login",req.flash("message"));
    }
})


app.get('/', async(req,res)=>{ 
    if(req.isAuthenticated()){
        console.log("user already logged in");

        res.render('home');   
        
    }else{
        console.log("user not sign up");           
        res.render('login');
    }

});

app.get('/register',(req,res)=>{
    res.render('register')
})

app.post('/register',async (req,res)=>{
    console.log(req.body);
    var userDetail = await new UserDetails({
         email :req.body.username,
         firstName :req.body.firstName,
         lastName :req.body.lastName,
         farmSize :req.body.farmSize,
         typeOfCrop:req.body.typeOfCrop,
         phoneNumber: req.body.phoneNo
    })
    userDetail.save()
    .then(()=>{
        console.log("user details saved successfully");
    })
    .catch(err => {
        throw err;
    });


        var email = req.body.username;
    
    User.register({username:email},req.body.password,(err,user)=>{
        if(err){
            console.log(err);
            throw err;
        }else{
            passport.authenticate('local')
            (req,res,function(){
                req.flash("registration Successful");
                res.render('login');
            })
        }
    })



});

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
            req.flash("message","Incorrect details");
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

                        var username = req.body.username;
                        console.log(username)
UserDetails.find({email:req.user.username},{_id:0,typeOfCrop:1},(err,data)=>{
    if(err)throw err;
    console.log(data[0]);
    var into = data[0].typeOfCrop;
    console.log(into)
   cropModel.find({name:into},{_id:0,temperature:1,moisture:1,rain:1,name:1},(err,data)=>{
        if(err){
            return err;
        }else{
            console.log(data[0]);
            res.render('home',{data:data[0]});
        }
   })

})
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

