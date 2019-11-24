const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');
const nanoid = require('nanoid');

const urlBack = process.env.BACK || 'http://localhost:3000/';

// Connect to DB
mongoose.connect('mongodb://localhost/deservme');
var db = mongoose.connection;

//schema ShortUrl
var ShortUrlSchema = mongoose.Schema({
    quizz_id: {
        type : String,
    },
    short_id : {
        type : String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

var ShortUrl = module.exports = mongoose.model('ShortUrl', ShortUrlSchema);

module.exports.createShortUrl = function(newUrl, callback) {
    newUrl.save(callback);
};


module.exports.getShortUrl = function(short_id, callback){
    ShortUrl.findOne({short_id: short_id}, callback);
};


// User Schema
var UserSchema = mongoose.Schema({
    username: {
        type: String,
    },
});

var User = module.exports = mongoose.model('User', UserSchema);


module.exports.getUserByUsername = function(username, callback){
    var query = {username: username};
    User.findOne(query, callback);
}



const corsOptions = {
    origin: urlBack,
    credentials: true,
}


const app_short = express();

app_short.get('/newQuizz/:id', (req, res) => {
   var newurl = new ShortUrl({
       quizz_id: req.params.id,
       short_id: nanoid(7)
   })

    ShortUrl.createShortUrl(newurl, function(err, url){
        res.send(url).end()
    })
});

app_short.get('/q/:id', (req, res) => {
    const shortId = req.params.id;

    ShortUrl.getShortUrl(req.params.id, function(err, url) {
        if(url) {
          //  res.send(url).end();

            console.log(url);
            res.redirect('https://myquizzy.com/quizz/'+ url.quizz_id);

        }else {
            res.redirect('https://myquizzy.com/');
        }
    })

});

app_short.get('/:username', (req, res) => {
    User.getUserByUsername(req.params.username, function(err, user) {
        if(user) {
            res.redirect('https://myquizzy.com/profile/'+ user._id);
        } else {
            res.redirect('https://myquizzy.com/');

        }
    })
})

app_short.use(bodyParser.json());
app_short.use(bodyParser.urlencoded({ extended: false }));
app_short.use(cors(corsOptions));
app_short.use(bodyParser.json());

app_short.set('port', process.env.PORT || 4100);
const server = app_short.listen(app_short.get('port'), () => {
    console.log(`Express running → PORT ${server.address().port}`);
});