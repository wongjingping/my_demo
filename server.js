var express = require('express');
var app = express();
var mongojs = require('mongojs');
var db = mongojs('db_demo', ['c_demo']); //db, collection
var bodyParser = require('body-parser');


app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname +'/bower_components'));
app.use('/public/static',express.static(__dirname + '/public/static'));
app.use(bodyParser.json());


// get data from db and return as json to controller
app.get('/demolist', function(req,res){
	console.log('rcv GET');
	db.c_demo.find(function(err,docs){
		console.log('rcv data');
		res.json(docs);
	})
});

// insert data from controller into db
app.post('/demolist', function(req,res){
	console.log('insert POST');
	for (var i = req.body.length - 1; i >= 0; i--) {
		console.log(req.body[i]);
	};
	db.c_demo.insert(req.body, function(err,doc){
		res.json(doc); // return data inserted into db to controller
	})
});

// update data from controller in db
app.put('/demolist/:id', function(req,res){
	var id = req.params.id;
	console.log('update POST ID: ' + id);
	console.log(req.body);
	db.c_demo.findAndModify({
		query: {_id: mongojs.ObjectId(id)}, 
		update: {$set: {
			"Vertical":req.body.Vertical,
			"TargetCustomer":req.body.TargetCustomer,
			"UseCase":req.body.UseCase,
			"Technology":req.body.Technology,
			"Creator":req.body.Creator,
			"AnalyticTechniques":req.body.AnalyticTechniques,
			"DataSource":req.body.DataSource,
			"LastUpdated":req.body.LastUpdated,
			"Location":req.body.Location,
			"Description":req.body.Description,
			"Tags":req.body.Tags}},
		new: true}, function(err,doc){
			res.json(doc);
		});
});

// delete data from db
app.delete('/demolist/:id', function(req,res){
	console.log('DELETE ID: ' + id);console.log(id);
	var id = req.params.id;
	db.c_demo.remove({_id: mongojs.ObjectId(id)}, function(err,doc){
		res.json(doc);
	})
})

app.listen(3000);
console.log('server running on port 3000');
