const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _id = Schema.Types.ObjectId;

var UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: String,
  max_companies: {
    type: Number,
    default: 1
  },
  companies: [{
    _id: false,
    item: {
      type: _id,
      ref: 'Company'
    },
    selected: Boolean
  }]
});

UserSchema.pre('save', function(next){
  var user = this;
  console.log('---Before saving user---');
  console.log('Is password new: ' + user.isModified('password'));
  next();
});

UserSchema.pre('validate', function(next){
  var user = this;
  console.log('---Before validating user---');
  // console.log('Is password new: ' + user.isModified('password'));
  next();
});

UserSchema.pre('update', function(next){
  var user = this;

  console.log('---Before updating user---');
  // console.log(user);
  // console.log('Is username new: ' + user.isModified('username'));
  // console.log('Is password new: ' + user.isModified('password'));
  next();
});

UserSchema.pre('init', function(next){
  var user = this;
  console.log('---Before initing user---');
  next();
});

UserSchema.pre('findOneAndUpdate', function(next){
  var user = this;
  console.log('---Before findOneAndUpdate user---');
  console.log('Is username new: ' + user.isModified('username'));
  console.log('Is password new: ' + user.isModified('password'));
  next();
});

var User = mongoose.model('User', UserSchema);


module.exports = {User};
