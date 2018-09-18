const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _id = Schema.Types.ObjectId;

var PersonSchema = new Schema({
  name: {
    type: String
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


var Person = mongoose.model('Person', PersonSchema);

module.exports = {Person};
