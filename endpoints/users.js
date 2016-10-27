var UserModel=require('../models/user');

function endpoint(){
	
	var endpointURL='/users';
	var myService;
	
	function getById(req, res, next){
		var userId=req.params.Id;
		
		var result=new UserModel();
		
		result.getById(userId).then(function(user){
			
			res.send(user.getProperties());
			return next();
			
		}).error(handleError)
		.finally(next);
		
	}
	
	function find(req, res, next){
		var userId=req.params.Id;
		
		var result=new UserModel();
		
		result.find(userId).then(function(users){
			
			var usersOutput=[];
			
			for(var i in users){
				usersOutput.push(users[i].getProperties());
			}
			
			res.send(usersOutput);
			return next();
			
		}).error(handleError)
		.finally(next);
	}
	
	function get(req, res, next){
		var userId=req.params.Id;
		
		if(userId){
			getById(req, res, next);
		}
		else {
			find(req, res, next);
		}
	}

	function create(req, res, next){
		var name=req.params.name;
		var email=req.params.email;
		var username=req.params.username;
		var password=req.params.password;
		var imageURL=req.params.imageURL;
				
		var user=new UserModel();	
		user.insert(name,email,username,password,imageURL).then(function(result){
			
			res.send(result.getProperties());
			return next();
			
		}).error(handleError)
		.finally(next);
	}

	function update(req, res, next){

		var userId=req.params.Id;
		var properties=req.params;
		
		var user=new UserModel();	
		user.update(userId, properties).then(function(result){
			
			res.send(result.getProperties());
			return next();
			
		}).error(handleError)
		.finally(next);
	}

	function remove(req, res, next){
		var userId=req.params.Id;
				
		var user=new UserModel();	
		user.remove(userId).then(function(result){
			
			res.send({message:userId});
			return next();
			
		}).error(handleError)
		.finally(next);
		
	}
		
	function handleError(res) {
		return function(error) {
			res.send(500, {error: error.message});
		}
	}	
		
	function registerListeners(service){
			myService=service;
		
			//myService.list(endpointURL, list);
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