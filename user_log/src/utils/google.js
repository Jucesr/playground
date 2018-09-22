const {google} = require('googleapis');
const fs = require('fs');
const path = require('path');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

const getUserList = (options) => {

  const sheets = google.sheets({version: 'v4'});

  return new Promise((resolve, reject) => {
    sheets.spreadsheets.values.get({
      spreadsheetId: options.spreadsheet_id,
      range: 'A2:F',
      key: options.APIKey
    }, (err, res) => {
      if (err) return reject('The API returned an error: ' + err);
      const rows = res.data.values;
      if (rows.length) {
        // Prepare object of user list
  
        let user_role_list = {}
        rows.forEach((row) => {
          let username = row[1]
          let role = row[2]
          user_role_list[username] = role            
        });
        resolve(user_role_list)
      } else {
        reject('No data found.');
      }
    });
  })
  
}

const getChartColors = (options) => {

  const sheets = google.sheets({version: 'v4'});

  return new Promise((resolve, reject) => {
    sheets.spreadsheets.values.get({
      spreadsheetId: options.spreadsheet_id,
      range: 'Graficas!A2:B',
      key: options.APIKey
    }, (err, res) => {
      if (err) return reject('The API returned an error: ' + err);
      const rows = res.data.values;
      if (rows.length) {
        // Prepare object of user list
  
        let chart_colors = {}
        rows.forEach((row) => {
          let role = row[0]
          let color = row[1]
          chart_colors[role] = color            
        });
        resolve(chart_colors)
      } else {
        reject('No data found.');
      }
    });
  })
  
}

const updateConfigsFromGoogleSheet = (project_folder, options) => {
  const {parseJsonFile} = require('./helpers')
  const user_role_file = path.join(project_folder, 'config', 'user_role.json');
  const chart_color_file = path.join(project_folder, 'config', 'chart_color.json');

  return Promise.all([getUserList(options), getChartColors(options)]).then(results => {

      //  Handle response for chart colors
      const chart_colors = results[1]
      fs.writeFileSync(chart_color_file, JSON.stringify(chart_colors, null, 2))

      //  Handle response for user roles
      const user_roles = results[0]

      fs.writeFileSync(user_role_file, JSON.stringify(user_roles, null, 2))
      return Promise.resolve(user_roles)
  }).catch(e => {
    //  If it fails take the values that are stored in the file.
    console.log(e);
    
    const user_role = parseJsonFile(user_role_file)
    return Promise.resolve(user_role)   
})
}

module.exports = {
  getUserList,
  getChartColors,
  updateConfigsFromGoogleSheet
}
