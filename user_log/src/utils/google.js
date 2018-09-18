const {google} = require('googleapis');

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

module.exports = {
  getUserList
}
