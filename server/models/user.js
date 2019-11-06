var mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
	email:{
		type: String,
		trim: true,
		required:true,
		minlength:1,
		unique:true,
		validate:{
			validator:(txt) => {
				return validator.isEmail(txt);
			},
			message:(p) => p.value + " is not valid email"
		}
	},
	password:{
		type: String,
		require: true,
		minlength: 6
	},
	tokens:[{
		access:{
			type:String,
			require:true
		},
		token:{
			type:String,
			require: true
		}
	}]
});

UserSchema.methods.generateAuthToken = function(){
	var user = this;
	var access = 'auth';
	var token = jwt.sign({ _id:user._id.toHexString(), access}, 'abc123').toString();
	user.tokens = user.tokens.concat([{access, token}]);

	return user.save().then(()=>{
		return token;
	});
};

UserSchema.statics.findByToken =  function(token){

	var User = this;
	var decoded;

	

	try {
		decoded = jwt.verify(token, 'abc123');
	}catch(e){
		return Promise.reject();
	 }

	return User.findOne({
		_id: decoded._id,
		'tokens.access':'auth',
		'tokens.token':token
	});

};	

UserSchema.methods.toJSON = function(){

	var obj = this.toObject();
	var ext = _.pick(obj, ['_id', 'email']);
	return ext;

};


var User = mongoose.model('User', UserSchema);

module.exports = {User};






