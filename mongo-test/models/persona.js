const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _id = Schema.Types.ObjectId;

var PersonaSchema = new Schema({
  name: {
    type: String
  },
  companies: [{
    type: _id,
    ref: 'Company'
  }]
});


var Persona = mongoose.model('Persona', PersonaSchema);

module.exports = {Persona};
