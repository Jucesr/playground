const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _id = Schema.Types.ObjectId;

var CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  user_owner_id: {
    type: String,
    required: true
  },
  max_users: {
    type: Number,
    default: 2
  },
  no_users: {
    type: Number,
    default: 1
  },
  users: [{
    type: _id,
    ref: 'User'
  }]
});



var Company = mongoose.model('Company', CompanySchema);

module.exports = {Company};
