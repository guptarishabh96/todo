var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
var app = express();
var mongoose=require('mongoose');

var todo=[];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var db = mongoose.createConnection('mongodb://localhost/todolist',function(err){
    if(err){
        console.log(err);
    } else{
        console.log('Connected to todo list db!');
    }
});

var todoSchema = mongoose.Schema({
    item: String
});

var Item = db.model('Item', todoSchema);

function updateList(){
    var query = Item.find({}).select({ "item": 1, "_id": 0 });
    query.exec(function(err,data){
        if(err)throw err;
        todo=data;
    });
    return todo;
}

app.use(function(req, res, next) {
	console.log(`${req.method} request for '${req.url}' - ${JSON.stringify(req.body)}`);
	next();
});

app.use(express.static("./public"));

app.use(cors());

app.get("/todo", function(req, res) {
	var query = Item.find({}).select({ "item": 1, "_id": 0 });
    query.exec(function(err,data){
        if(err)throw err;
        todo=data;
        res.json(todo);
    });
});

app.post("/todo", function(req, res) {
    
    var newItem = new Item(req.body);
    newItem.save(function(err){
        if(err)throw err;
        console.log('Item added to db: '+req.body.item);
    });
    todo.push(req.body);
    res.json(todo);
});

app.delete("/todo/:term", function(req, res) {
    var del = req.params.term.toLowerCase();
    Item.find({ "item": del }).remove().exec(function(err, data){
        console.log(data+" n number of records deleted"); 
    });
    var query = Item.find({}).select({ "item": 1, "_id": 0 });
    query.exec(function(err,data){
        if(err)throw err;
        todo=data;
        res.json(todo);
    });
});

app.listen(3000);

console.log("Express app running on port 3000");

module.exports = app;