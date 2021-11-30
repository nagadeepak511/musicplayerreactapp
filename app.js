var express = require('express');
var cors  = require('cors');
var app = express();
app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use(express.json());
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
let db;
var mongoUrl = 'mongodb://localhost:27017';
var port = process.env.PORT || 8080;
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var secretKey = 'iameeshwarandidevelopgoodwebapplications'

// home
app.get('/',(req, res)=>{
    res.send('welcome to authapi')
})

// get all users
app.get('/users',(req, res)=>{
    db.collection('users').find({}).toArray((err, result)=>{
        res.send(result)
    })
})

// register
app.post('/register',(req, res)=>{
    if(req.body.name && req.body.email && req.body.password && req.body.phone) {
        db.collection('users').find({
            name:req.body.name,
            email:req.body.email
        }).toArray((err, result)=>{
            if(err) throw err
            if(result.length<1){
                db.collection('users').insertOne({
                    name:req.body.name,
                    email:req.body.email,
                    password:bcrypt.hashSync(req.body.password,8),
                    phone:req.body.phone
                },(err)=>{
                    if(err) throw err
                    res.send({
                        status:true,
                        message:"registration successful"
                    })
                })
            } else {
                res.send({
                    status:false,
                    message:"name or username already exist"
                })
            }
        })
    } else{
        res.send({
            status:false,
            message:"Insufficient details"
        })
    }
})

// login
app.post('/login',(req,res)=>{
    if(req.body.email && req.body.password){
        db.collection('users').find({email:req.body.email}).toArray((err,result)=>{
            if(err) throw err
            if(result.length<1){
                res.send({
                    auth:false,
                    message:"No user found"
                })
            } else {
                var isMatched = bcrypt.compareSync(req.body.password,result[0].password)
                if(isMatched){
                    var token = jwt.sign({id:result[0].id},secretKey)
                    res.send({
                        auth:true,
                        token:token,
                        message:"Login successful"
                    })
                } else {
                    res.send({
                        auth:false,
                        message:"password and email didn't matched"
                    })
                }
            }
        })
    } else {
        res.send({
            auth:false,
            message:"Please provide complete details"
        })
    }
})

MongoClient.connect(mongoUrl, (err, client)=>{
    if(err) console.log("error while connecting")
    else{
        db = client.db('musicplayer')
        app.listen(port,()=>{console.log('listening to ',port)})
    }
})