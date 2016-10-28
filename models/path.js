var rethinkdb = require('rethinkdb');


function PathModel(){
	
	var properties={isNew:true};
	
	function setProperty(property, value){
		
		properties[property]=value;

	}
	
	function setProperties(propertyValues){
		
		for(var i in propertyValues){
			if(i=='Id') continue;
		
			properties[i]=propertyValues[i];
		}

	}	
	
	function getProperty(property){
		
		return(properties[property]);
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
				return(new Error('User : '+Id+' not found '));
			}
			
			var path=new PathModel();
			
			path.setProperties(result[0]);
			path.setProperty('isNew', false);
			
			return(path);
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
	
	function findByLocation(startLocation, minTime, maxTime, maxDistance){
		
		function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
		  var R = 6371; // Radius of the earth in km
		  var dLat = deg2rad(lat2-lat1);  // deg2rad below
		  var dLon = deg2rad(lon2-lon1); 
		  var a = 
			Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
			Math.sin(dLon/2) * Math.sin(dLon/2)
			; 
		  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		  var d = R * c; // Distance in km
		  return d;
		}

		function deg2rad(deg) {
		  return deg * (Math.PI/180)
		}
		
		console.log(startLocation);
		
		function dateFilter(path){
			
			return path("startTime").during(minTime, maxTime);
		}
		try{
		return rethinkdb.table('path').run(GLOBAL.dbConn).then(function(cursor){ 		
			return cursor.toArray();
		}).then(function(resultOutput) {
				
			var paths=[];
			
			var minDist=null;
						
			for(var i in resultOutput){
				pathStartLocation=resultOutput[i].start_location.location;
				
				if(getDistanceFromLatLonInKm(parseFloat(startLocation.location[0]), parseFloat(startLocation.location[1]), parseFloat(pathStartLocation[0]), parseFloat(pathStartLocation[1]))>maxDistance) continue;
				
				var resultStartTime=new Date(resultOutput[i].startTime);
				
				if(resultStartTime<new Date(minTime) || resultStartTime>new Date(maxTime)) continue;
				
				paths.push(new PathModel());

				paths[paths.length-1].setProperties(resultOutput[i]);
				paths[paths.length-1].setProperty('isNew', false);
			}
			
			
			return(paths);
		});
		
		}
		catch(e){
			console.log(e);
		}
	}

	function insert(driverId, maxPassengers, startTime, startLocation,endLocation){
		
		setProperties({driverId:driverId, 
						maxPassengers: maxPassengers,
						startTime: startTime,
						passengers:[],
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
			getProperty:getProperty,
			getProperties:getProperties,
			getById:getById,
			find:find,
			findByLocation:findByLocation,
			remove:remove
	});
}

module.exports=PathModel;


