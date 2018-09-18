require('./db/db');
const mongoose = require('mongoose');
const {ObjectID} = require('mongodb');
const faker = require('faker/locale/es_MX');

const {Persona} = require('./models/Persona');

const numberOfCompanies = 10000;
let companies = [];
for (var i = 0; i < numberOfCompanies; i++) {
  companies.push(new ObjectID())
}

let persona = new Persona({
  name: faker.name.firstName(),
  companies: companies
});

//console.log(client);

persona.save();
