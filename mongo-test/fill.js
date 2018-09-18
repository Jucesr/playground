require('./db/db');
const {Company} = require('./models/company');
const {User} = require('./models/user');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _id = Schema.Types.ObjectId;

const user = new User({
  username: 'jucesr'
});

user.save().then( user_doc => {
  const company01 = new Company({
    name: 'Adidas',
    user_owner_id: user_doc._id,
    users: [user_doc._id]
  });

  const company02 = new Company({
    name: 'Puma',
    user_owner_id: user_doc._id,
    users: [user_doc._id]
  });

  Promise.all([company01.save(), company02.save()]).then(
    companies => {
      return User.findOneAndUpdate( {
        _id: user_doc._id
        },{
        $push: {
          "companies": {
            $each: [ {
              item: companies[0]._id,
              selected: true
            }, {
              item: companies[1]._id,
              selected: false
            } ]

          }
        }},
        { new: true }
      )
    }
  ).then(doc => {

    console.log(doc);

  });

  company.save().then( company_doc => {

  });
});

user_doc = {
  _id: '5b3182f5f39cd94ea4e9521d'
}

const company = new Company({
  name: 'GNC',
  user_owner_id: user_doc._id,
  users: [user_doc._id]
});

company.save().then( company_doc => {

  User.findOneAndUpdate( {
    _id: user_doc._id
  }, { $push: {
    "companies": {
      item: company_doc._id,
      selected: true
    }
  }}, { new: true }).then(doc => {

    console.log(doc);

  });

});
