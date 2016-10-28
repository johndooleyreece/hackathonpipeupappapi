var rethinkdb = require('rethinkdb');
var Model=require('../models/path');

function endpoint(){
	
	var endpointURL='/paths';
	var myService;
	
	function getById(req, res, next){
		var id=req.params.Id;
		
		var result=new Model();
		
		result.getById(id).then(function(result){
			
			res.send(result.getProperties());
			return next();
			
		}).error(handleError)
		.finally(next);
		
	}
	
	function findByLocation(req, res, next){
		var startLocation=req.params.startLocation;
		var minTime=req.params.minTime;
		var maxTime=req.params.maxTime;
		var maxDistance=req.params.maxDistance;
		
		console.log('Find by location');


		var result=new Model();
		
		result.findByLocation(startLocation, minTime, maxTime, maxDistance).then(function(results){
			
			console.log(results);
			
			var resultsOutput=[];
			
			for(var i in results){
				resultsOutput.push(results[i].getProperties());
			}
			
			res.send(resultsOutput);
			return next();
			
		}).error(handleError)
		.finally(next);
	}
	
	function find(req, res, next){
		var id=req.params.Id;
		

		
		var result=new Model();
		
		result.find(id).then(function(results){
			
			var resultsOutput=[];
			
			for(var i in results){
				resultsOutput.push(results[i].getProperties());
			}
			
			res.send(resultsOutput);
			return next();
			
		}).error(handleError)
		.finally(next);
	}
	
	function get(req, res, next){
		var id=req.params.Id;
		
		if(id){
			getById(req, res, next);
		}
		else {
			find(req, res, next);
		}
	}

	function create(req, res, next){
		var driverId=req.params.driverId;
		var startTime=req.params.startTime;
		var maxPassengers=req.params.maxPassengers;
		var startLocation=req.params.startLocation;
		var endLocation=req.params.endLocation;
		
		console.log(req.params);
						
		var model=new Model();	
		model.insert(driverId, maxPassengers, startTime, startLocation,endLocation).then(function(result){
			
			res.send(result.getProperties());
			return next();
			
		}).error(handleError)
		.finally(next);
	}

	function update(req, res, next){

		var id=req.params.Id;
		var properties=req.params;
		
		var model=new Model();	
		model.update(userId, properties).then(function(result){
			
			res.send(result.getProperties());
			return next();
			
		}).error(handleError)
		.finally(next);
	}

	function remove(req, res, next){
		var id=req.params.Id;
				
		var model=new Model();	
		model.remove(id).then(function(result){
			
			res.send({message:id});
			return next();
			
		}).error(handleError)
		.finally(next);
		
	}
	
	
	function createPassenger(req, res, next){
		var id=req.params.Id;
		var passengerId=req.params.passengerId;
		
		var result=new Model();
		
		result.getById(id).then(function(result){
			console.log(result.getProperty('passengers'));
			var passengers=result.getProperty('passengers');
			
			passengers.push(passengerId);
			
			result.update(id, {'passengers':passengers}).then(function(result){
				res.send(result.getProperties());
				return next();
			});
			
		}).error(handleError)
		.finally(next);
	}
	
	function removePassenger(req, res, next){
		var id=req.params.Id;
		var passengerId=req.params.passengerId;
		
		var result=new Model();
		
		result.getById(id).then(function(result){
			console.log(result.getProperty('passengers'));
			var passengers=result.getProperty('passengers');
			
			for(var i in passengers){
				if(passengers[i]==passengerId){
					passengers.splice(i,1);
				}
			}
						
			result.update(id, {'passengers':passengers}).then(function(result){
				res.send(result.getProperties());
				return next();
			});
			
		}).error(handleError)
		.finally(next);
	}
	
	function getPassenger(req, res, next){
		var id=req.params.Id;
		var passengerId=req.params.passengerId;
		
		var result=new Model();
		
		result.getById(id).then(function(result){
			console.log(result.getProperty('passengers'));
			var passengers=result.getProperty('passengers');
			
			for(var i in passengers){
				if(passengers[i]==passengerId){
					res.send({'id':passengers[i]});
					return next();
				}
			}
			
			return(new Error('Passsenger : '+passengerId+' not found '));
			
		}).error(handleError)
		.finally(next);
	}
	
	function getPassengers(req, res, next){
		var id=req.params.Id;
		
		var result=new Model();
		
		result.getById(id).then(function(result){
			console.log(result.getProperty('passengers'));
			var passengers=result.getProperty('passengers');
			
			
			res.send(passengers);
			return next();
			
		}).error(handleError)
		.finally(next);
	}
	
	function setup(req, res, next) {
		
		rethinkdb.table('path').indexCreate('startLocation.location', {'geo':true}).run(GLOBAL.dbConn, function(err, result) {
			if(err) throw err;
			console.log(result);
			
			res.send(result);
			return next();
		});
			/*
		rethinkdb.db('test').tableCreate('path').run(GLOBAL.dbConn, function(err, result) {
			if(err) throw err;
			console.log(result);
			
			//res.send(result);
		//	return next();
		rethinkdb.table('path').indexCreate('startLocation', {'geo':true}).run(GLOBAL.dbConn, function(err, result) {
			if(err) throw err;
			console.log(result);
			
			rethinkdb.table('path').indexCreate('endLocation', {'geo':true}).run(GLOBAL.dbConn, function(err, result) {
			if(err) throw err;
			console.log(result);
			
			res.send(result);
			return next();
		});
		
		rethinkdb.table('path').indexCreate('timestamp').run(GLOBAL.dbConn, function(err, result) {
			if(err) throw err;
			console.log(result);
			
			res.send(result);
			return next();
		});
		});
		
		});*/


		
	}
		
	function handleError(res) {
		return function(error) {
			console.log(error);
			res.send(500, {error: error.message});
		}
	}	
		
	function registerListeners(service){
			myService=service;
		
			myService.get(endpointURL+'/findByLocation', findByLocation);
			myService.put(endpointURL+'/:Id/passengers/:passengerId', createPassenger);
			myService.del(endpointURL+'/:Id/passengers/:passengerId', removePassenger);
			myService.get(endpointURL+'/:Id/passengers/:passengerId', getPassenger);
			myService.get(endpointURL+'/:Id/passengers', getPassengers);
		
			myService.put(endpointURL+'/setup', setup);
			myService.get(endpointURL+'/:Id', getById);

			
			myService.get(endpointURL, find);
			myService.put(endpointURL, create);
			
			myService.post(endpointURL+'/:Id', update);
			myService.del(endpointURL+'/:Id', remove);
	}
	
	return({
		'registerListeners':registerListeners		
	});
}


module.exports.Endpoint=endpoint;