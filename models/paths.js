var rethinkdb = require('rethinkdb');


function PathModel(){
	
	var properties={isNew:true};
	
	function setProperty(property, value){
		
		properties[property]=value;
		
		if(!properties.passengers) {
			properties.passengers=[];
		}
	}
	
	function setProperties(propertyValues){
		
		for(var i in propertyValues){
			if(i=='Id') continue;
		
			properties[i]=propertyValues[i];
		}
		
		if(!properties.passengers) {
			properties.passengers=[];
		}
	}	
	
	function getProperties(){
		return(properties);
	}	
	
	function getById(Id){
		properties.isNew=false;
		
		return rethinkdb.table('path').run(GLOBAL.dbConn).then(function(cursor){ 
			return cursor.toArray();
		}).then(function(result) {
			
			if(result.length==0) {
				throw new Error('Path : '+Id+' not found ');
				return(new Error('Path : '+Id+' not found '));
			}
			
			var user=new PathModel();
			
			user.setProperties(result[0]);
			users.setProperty('isNew', false);
			
			return(user);
		});
	}
	
	function find(){
		return rethinkdb.table('path').run(GLOBAL.dbConn).then(function(cursor){ 
			return cursor.toArray();
		}).then(function(resultOutput) {
			
			console.log(resultOutput);
			
			var users=[];
			
			for(var i in resultOutput){
				users.push(new PathModel());

				users[i].setProperties(resultOutput[i]);
				users[i].setProperty('isNew', false);
			}
			
			
			return(users);
		});
	}

	function insert(driverId, maxPassengers, startTime, startLocation,endLocation){
		
		setProperties({driver_id:driverId, 
						max_passengers:maxPassengers,
						passengers:[],
						startTime:startTime,
						start_location:startLocation, 
						end_location:endLocation});
		var newUser=this;
		return rethinkdb.table('path').insert(properties).run(GLOBAL.dbConn).then(function(result){ 
			
			newUser.setProperty('id',result.generated_keys[0]);
			return newUser;
		});				
	}
	
	function update(Id, newProperties){
		
		setProperties(newProperties);
		setProperty('id', Id);
		
		var updateUser=this;
		return rethinkdb.table('path').get(Id).update(properties, {returnChanges: true}).run(GLOBAL.dbConn).then(function(result){ 

			return updateUser;
		});				
	}
	
	function remove(Id){
		return rethinkdb.table('path').get(Id).delete().run(GLOBAL.dbConn).then(function(result){ 
			return result;
		});	
	}
		
	
	return({
			insert:insert,
			update:update,
			setProperty:setProperty,
			setProperties:setProperties,
			getProperties:getProperties,
			getById:getById,
			find:find,
			remove:remove
	});
}

module.exports=PathModel;


