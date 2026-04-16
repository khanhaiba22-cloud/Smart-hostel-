const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'hostel_db.sqlite'));

db.exec('DROP TABLE IF EXISTS attendance');
db.exec(`
  CREATE TABLE attendance (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    date       TEXT NOT NULL,
    status     TEXT NOT NULL DEFAULT 'Absent',
    marked_by  TEXT DEFAULT '',
    note       TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(student_id, date)
  )
`);
console.log('✅ attendance table recreated with correct schema');
db.close();
