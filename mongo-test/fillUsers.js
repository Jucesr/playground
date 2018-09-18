require('./db/db');
const {Company} = require('./models/company');
const {User} = require('./models/user');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _id = Schema.Types.ObjectId;

const user = new User({
  username: 'jucesr',
  password: 'mypass'
});

User.remove({}).then(() => {
  user.save().then(user_doc => {
    console.log(`An user was created ${user_doc}`);
    user.update({
          $set: {
            password: 'nono'
          }
        }, {
          new: true
        }).then(user_doc => {
          console.log('User was updated');
        })
    // User.findOneAndUpdate( {
    //       _id: user_doc._id
    //     }, {
    //       $set: {
    //         password: 'nono'
    //       }
    //     }, {
    //       new: true
    //     }).then(user_doc => {
    //       console.log('User was updated');
    //     })


  });
})
