const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'hostel_db.sqlite'));
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', JSON.stringify(tables));
tables.forEach(t => {
  const cols = db.prepare('PRAGMA table_info(' + t.name + ')').all();
  console.log(t.name + ':', cols.map(c => c.name).join(', '));
  const count = db.prepare('SELECT COUNT(*) as c FROM ' + t.name).get();
  console.log('  rows:', count.c);
});
db.close();
