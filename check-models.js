const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Checking models in database...');

db.all("SELECT id, name, code FROM model", (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('현재 등록된 기종들:');
    rows.forEach(row => {
      console.log(`- ID: ${row.id}, 이름: ${row.name}, 코드: ${row.code}`);
    });
  }
  db.close();
}); 