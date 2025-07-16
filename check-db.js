const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Checking database at:', dbPath);

db.all("SELECT * FROM model", (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('All models:', rows);
    console.log('Total models:', rows.length);
  }
  
  db.all("SELECT * FROM model WHERE isActive = 1", (err, activeRows) => {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log('Active models:', activeRows);
      console.log('Active models count:', activeRows.length);
    }
    db.close();
  });
}); 