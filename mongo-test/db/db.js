const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/mongotesting")
  .then(
    () => console.log('A connection was successfully established with mongodb'),
    e => console.log(e));

module.exports = {
  mongoose
};
