require('./db/db');
const mongoose = require('mongoose');
const {ObjectID} = require('mongodb');
const faker = require('faker/locale/es_MX');

const {Person} = require('./models/person');

const numberOfCompanies = 10000;
let companies = [];
for (var i = 0; i < numberOfCompanies; i++) {
  companies.push({
    item: new ObjectID(),
    selected: true,
    owner: false
  })
}

let person = new Person({
  name: faker.name.firstName(),
  companies: companies
});

//console.log(client);

person.save();
