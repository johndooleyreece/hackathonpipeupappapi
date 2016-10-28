var rethinkdb = require('rethinkdb');


function UserModel(){
	
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
	
	function getProperties(){
		return(properties);
	}	
	
	function getById(userId){
		properties.isNew=false;
		
		return rethinkdb.table('user').run(GLOBAL.dbConn).then(function(cursor){ 
			return cursor.toArray();
		}).then(function(result) {
			
			if(result.length==0) {
				return(false);
			}
			
			var user=new UserModel();
			
			user.setProperties(result[0]);
			users.setProperty('isNew', false);
			
			return(user);
		});
	}
	
	function getByLogin(username, password){
		properties.isNew=false;
		
		return rethinkdb.table('user').filter({username: username, password:password}).run(GLOBAL.dbConn).then(function(cursor){ 
			return cursor.toArray();
		}).then(function(result) {
			
			if(result.length==0) {
				return(false);
			}
			
			var user=new UserModel();
			
			user.setProperties(result[0]);
			user.setProperty('isNew', false);
			
			return(user);
		});
	}

	
	function find(){
		return rethinkdb.table('user').run(GLOBAL.dbConn).then(function(cursor){ 
			return cursor.toArray();
		}).then(function(resultOutput) {
			
			console.log(resultOutput);
			
			var users=[];
			
			for(var i in resultOutput){
				users.push(new UserModel());

				users[i].setProperties(resultOutput[i]);
				users[i].setProperty('isNew', false);
			}
			
			
			return(users);
		});
	}

	function insert(name, email, username, password, imageURL){
		
		setProperties({name:name, email:email, 
						username:username, password:password, 
						imageURL:imageURL});
		var newUser=this;
		return rethinkdb.table('user').insert(properties).run(GLOBAL.dbConn).then(function(result){ 
			
			newUser.setProperty('id',result.generated_keys[0]);
			return newUser;
		});				
	}
	
	function update(userId, newProperties){
		
		setProperties(newProperties);
		setProperty('id', userId);
		
		var updateUser=this;
		return rethinkdb.table('user').get(userId).update(properties, {returnChanges: true}).run(GLOBAL.dbConn).then(function(result){ 

			return updateUser;
		});				
	}
	
	function remove(userId){
		return rethinkdb.table('user').get(userId).delete().run(GLOBAL.dbConn).then(function(result){ 
			return result;
		});	
	}
		
	
	return({
			insert:insert,
			update:update,
			setProperty:setProperty,
			setProperties:setProperties,
			getProperties:getProperties,
			getByLogin:getByLogin,
			getById:getById,
			find:find,
			remove:remove
	});
}

module.exports=UserModel;


