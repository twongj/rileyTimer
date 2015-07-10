var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost/rileyTimer');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.sendfile('public/rileyTimer.html');
});

var ObjectId = Schema.ObjectId;

var User = mongoose.model('User', {
    id:ObjectId,
    username:String,
    firstName:String,
    lastName:String,
    email:String,
    password:String
});

var Solve = mongoose.model('Solve', {
    id:ObjectId,
    username:String,
    result:Number,
    penalty:Number,
    scramble:String,
    comment:String,
    date:Number
});

app.get('/solves', function(req, res) {
    Solve.find({}, function(err, solves) {
        res.json(solves);
    });
});

app.post('/solves/submit', function(req, res) {
    var solve = new Solve();
    solve.result = req.body.time;
    solve.penalty = req.body.penalty;
    solve.scramble = req.body.scramble;
    solve.comment = req.body.comment;
    solve.date = req.body.date;
    solve.save(function(err) {
        if (err)
            throw err;
        Solve.find({}, function(err, solves) {
            res.json(solves);
        });
    });
});

app.delete('/solves/reset', function(req, res) {
    Solve.remove({}, function(err, solves) {
        if (err)
            throw err;
        Solve.find({}, function(err, solves) {
            res.json(solves);
        });
    });
});

app.delete('/solves/remove/:date', function(req, res) {
    Solve.remove({'date':req.params.date}, function(err, solves) {
        if (err)
            throw err;
        Solve.find({}, function(err, solves) {
            res.json(solves);
        });
    });
});

app.listen(3000);
