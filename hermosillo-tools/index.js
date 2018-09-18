const fs = require('fs');

const files = fs.readdirSync(`${__dirname}/input_files/`, 'utf8');
let ids = []
//SGet only id of file and remove extension.
files.map(file => {
  if(!file.includes('indirects')){
    ids.push(file.substr(0, file.indexOf('.')) );
  }
});

let indirect_filepath, lines_filepath;
let indirects, items;
const template_filepath = `${__dirname}/template.json`;
let template = JSON.parse(fs.readFileSync(template_filepath, 'utf8'));

ids.map((id) => {
  indirect_filepath = `${__dirname}/input_files/${id}_indirects.json`;
  lines_filepath = `${__dirname}/input_files/${id}.json`;

  indirects = JSON.parse(fs.readFileSync(indirect_filepath, 'utf8'));
  items = JSON.parse(fs.readFileSync(lines_filepath, 'utf8'));

  template.list = items;
  template.selected = indirects.selected;
  template.normal = indirects.normal;
  template.accumulate = indirects.accumulate;

  fs.writeFileSync(`./output_files/${id}.json`, JSON.stringify(template, null, null) , 'utf-8');
  console.log(`${id}.json generated`);
});
