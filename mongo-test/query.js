require('./db/db');
const {Company} = require('./models/company');
const {User} = require('./models/user');

// var author = authorsCollection.findOne({name: "Peter Standford"});
// var books = booksCollection.find({_id: {$in: author.books}}).toArray();

User.
  findOne({ username: 'jucesr' }).
  populate('companies.item', 'name').
  exec(function (err, user) {
    if (err) return handleError(err);
    console.log(user.companies);
    //console.log('The author is %s', story.author.name);
    // prints "The author is Ian Fleming"
  });

  // Company.
  //   findOne({ name: 'Nike' }).
  //   populate('users', 'username').
  //   exec(function (err, user) {
  //     if (err) return handleError(err);
  //     console.log(user);
  //     //console.log('The author is %s', story.author.name);
  //     // prints "The author is Ian Fleming"
  //   });
