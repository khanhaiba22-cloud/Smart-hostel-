// setup.cjs - Creates hostel_db.sqlite with all tables and seed data
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'hostel_db.sqlite'));
db.pragma('journal_mode = WAL');

// ── Create Tables ─────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT NOT NULL,
    email     TEXT UNIQUE NOT NULL,
    password  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS wardens (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT NOT NULL,
    email     TEXT UNIQUE NOT NULL,
    password  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS students (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    email           TEXT UNIQUE NOT NULL,
    password        TEXT NOT NULL DEFAULT 'pass123',
    room_no         TEXT DEFAULT '',
    course          TEXT NOT NULL DEFAULT 'Engineering',
    year            TEXT NOT NULL DEFAULT '1st Year',
    gender          TEXT DEFAULT 'Female',
    phone           TEXT DEFAULT '',
    parent_phone    TEXT DEFAULT '',
    address         TEXT DEFAULT '',
    admission_year  INTEGER DEFAULT 2024,
    fee_status      TEXT DEFAULT 'pending' CHECK(fee_status IN ('paid','pending','partial')),
    fee_amount      REAL DEFAULT 50000,
    fee_paid        REAL DEFAULT 0,
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    room_no   TEXT UNIQUE NOT NULL,
    floor     TEXT NOT NULL DEFAULT 'Ground',
    type      TEXT NOT NULL DEFAULT 'Double',
    capacity  INTEGER NOT NULL DEFAULT 2,
    occupied  INTEGER NOT NULL DEFAULT 0,
    status    TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available','full','maintenance')),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS complaints (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id   INTEGER,
    student_name TEXT NOT NULL,
    room_no      TEXT NOT NULL,
    title        TEXT DEFAULT 'General Complaint',
    complaint    TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending','In Progress','Resolved')),
    resolved_at  TEXT,
    created_at   TEXT DEFAULT (datetime('now')),
    updated_at   TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notices (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    description TEXT NOT NULL,
    type        TEXT NOT NULL DEFAULT 'General' CHECK(type IN ('General','Announcement','Food Menu','Maintenance')),
    date        TEXT DEFAULT (datetime('now')),
    posted_by   TEXT DEFAULT '',
    created_at  TEXT DEFAULT (datetime('now'))
  );
`);

// ── Migrate existing students table if columns are missing ────
const cols = db.prepare("PRAGMA table_info(students)").all().map(c => c.name);
if (!cols.includes('phone'))          db.exec("ALTER TABLE students ADD COLUMN phone TEXT DEFAULT ''");
if (!cols.includes('parent_phone'))   db.exec("ALTER TABLE students ADD COLUMN parent_phone TEXT DEFAULT ''");
if (!cols.includes('address'))        db.exec("ALTER TABLE students ADD COLUMN address TEXT DEFAULT ''");
if (!cols.includes('admission_year')) db.exec("ALTER TABLE students ADD COLUMN admission_year INTEGER DEFAULT 2024");
if (!cols.includes('fee_status'))     db.exec("ALTER TABLE students ADD COLUMN fee_status TEXT DEFAULT 'pending'");
if (!cols.includes('fee_amount'))     db.exec("ALTER TABLE students ADD COLUMN fee_amount REAL DEFAULT 50000");
if (!cols.includes('fee_paid'))       db.exec("ALTER TABLE students ADD COLUMN fee_paid REAL DEFAULT 0");
if (!cols.includes('updated_at'))     db.exec("ALTER TABLE students ADD COLUMN updated_at TEXT DEFAULT '2024-01-01 00:00:00'");

const complaintCols = db.prepare("PRAGMA table_info(complaints)").all().map(c => c.name);
if (!complaintCols.includes('title'))      db.exec("ALTER TABLE complaints ADD COLUMN title TEXT DEFAULT 'General Complaint'");
if (!complaintCols.includes('updated_at')) db.exec("ALTER TABLE complaints ADD COLUMN updated_at TEXT DEFAULT '2024-01-01 00:00:00'");

// ── Seed Admin & Warden ───────────────────────────────────────
db.prepare(`INSERT OR IGNORE INTO admins (name,email,password) VALUES (?,?,?)`).run('Ambar Jain','ambar@gmail.com','1234');
db.prepare(`INSERT OR IGNORE INTO wardens (name,email,password) VALUES (?,?,?)`).run('Riya Jain','riya@gmail.com','1234');

// ── Seed Rooms ────────────────────────────────────────────────
const roomSeed = db.prepare(`INSERT OR IGNORE INTO rooms (room_no,floor,type,capacity,occupied,status) VALUES (?,?,?,?,?,?)`);
const seedRooms = db.transaction(() => {
  const floors = [
    { prefix: 'A', floor: 'Ground', type: 'Single',  cap: 1 },
    { prefix: 'B', floor: 'First',  type: 'Double',  cap: 2 },
    { prefix: 'C', floor: 'Second', type: 'Double',  cap: 2 },
    { prefix: 'D', floor: 'Third',  type: 'Triple',  cap: 3 },
    { prefix: 'E', floor: 'Third',  type: 'Triple',  cap: 3 },
    { prefix: 'F', floor: 'Fourth', type: 'Double',  cap: 2 },
  ];
  for (const f of floors) {
    for (let i = 101; i <= 120; i++) {
      roomSeed.run(`${f.prefix}${i}`, f.floor, f.type, f.cap, 0, 'available');
    }
  }
});
seedRooms();

// ── Seed Students ─────────────────────────────────────────────
const students = [
  ['Aarti Sharma',    'aarti.sharma@hostel.com',    'pass123','A101','Engineering','1st Year'],
  ['Priya Verma',     'priya.verma@hostel.com',     'pass123','A102','Engineering','1st Year'],
  ['Sneha Patel',     'sneha.patel@hostel.com',     'pass123','A103','Engineering','1st Year'],
  ['Kavya Nair',      'kavya.nair@hostel.com',      'pass123','A104','Engineering','1st Year'],
  ['Ritu Singh',      'ritu.singh@hostel.com',      'pass123','A105','Engineering','1st Year'],
  ['Pooja Gupta',     'pooja.gupta@hostel.com',     'pass123','A106','Engineering','1st Year'],
  ['Ananya Mishra',   'ananya.mishra@hostel.com',   'pass123','A107','Engineering','1st Year'],
  ['Divya Yadav',     'divya.yadav@hostel.com',     'pass123','A108','Engineering','1st Year'],
  ['Meera Joshi',     'meera.joshi@hostel.com',     'pass123','A109','Engineering','1st Year'],
  ['Nisha Tiwari',    'nisha.tiwari@hostel.com',    'pass123','A110','Engineering','1st Year'],
  ['Sonal Desai',     'sonal.desai@hostel.com',     'pass123','A111','Engineering','1st Year'],
  ['Tanvi Mehta',     'tanvi.mehta@hostel.com',     'pass123','A112','Engineering','1st Year'],
  ['Pallavi Rao',     'pallavi.rao@hostel.com',     'pass123','A113','Engineering','1st Year'],
  ['Swati Kulkarni',  'swati.kulkarni@hostel.com',  'pass123','A114','Engineering','1st Year'],
  ['Rekha Pandey',    'rekha.pandey@hostel.com',    'pass123','A115','Engineering','1st Year'],
  ['Geeta Chauhan',   'geeta.chauhan@hostel.com',   'pass123','A116','Engineering','1st Year'],
  ['Sunita Bhat',     'sunita.bhat@hostel.com',     'pass123','A117','Engineering','1st Year'],
  ['Archana Pillai',  'archana.pillai@hostel.com',  'pass123','A118','Engineering','1st Year'],
  ['Bhavna Saxena',   'bhavna.saxena@hostel.com',   'pass123','A119','Engineering','1st Year'],
  ['Chitra Reddy',    'chitra.reddy@hostel.com',    'pass123','A120','Engineering','1st Year'],
  ['Deepa Iyer',      'deepa.iyer@hostel.com',      'pass123','B101','Engineering','2nd Year'],
  ['Farida Khan',     'farida.khan@hostel.com',     'pass123','B102','Engineering','2nd Year'],
  ['Harsha Menon',    'harsha.menon@hostel.com',    'pass123','B103','Engineering','2nd Year'],
  ['Indira Nambiar',  'indira.nambiar@hostel.com',  'pass123','B104','Engineering','2nd Year'],
  ['Jyoti Agarwal',   'jyoti.agarwal@hostel.com',   'pass123','B105','Engineering','2nd Year'],
  ['Kamla Tripathi',  'kamla.tripathi@hostel.com',  'pass123','B106','Engineering','2nd Year'],
  ['Lata Shukla',     'lata.shukla@hostel.com',     'pass123','B107','Engineering','2nd Year'],
  ['Madhuri Patil',   'madhuri.patil@hostel.com',   'pass123','B108','Engineering','2nd Year'],
  ['Nalini Shetty',   'nalini.shetty@hostel.com',   'pass123','B109','Engineering','2nd Year'],
  ['Omana Thomas',    'omana.thomas@hostel.com',    'pass123','B110','Engineering','2nd Year'],
  ['Parvati Das',     'parvati.das@hostel.com',     'pass123','B111','Engineering','2nd Year'],
  ['Radha Krishnan',  'radha.krishnan@hostel.com',  'pass123','B112','Engineering','2nd Year'],
  ['Sarita Dubey',    'sarita.dubey@hostel.com',    'pass123','B113','Engineering','2nd Year'],
  ['Tara Bhatt',      'tara.bhatt@hostel.com',      'pass123','B114','Engineering','2nd Year'],
  ['Uma Shankar',     'uma.shankar@hostel.com',     'pass123','B115','Engineering','2nd Year'],
  ['Vandana Jain',    'vandana.jain@hostel.com',    'pass123','B116','Engineering','2nd Year'],
  ['Yamini Goyal',    'yamini.goyal@hostel.com',    'pass123','B117','Engineering','2nd Year'],
  ['Zara Hussain',    'zara.hussain@hostel.com',    'pass123','B118','Engineering','2nd Year'],
  ['Abha Srivastava', 'abha.srivastava@hostel.com', 'pass123','C101','Engineering','3rd Year'],
  ['Bindu Nair',      'bindu.nair@hostel.com',      'pass123','C102','Engineering','3rd Year'],
  ['Chhaya Yadav',    'chhaya.yadav@hostel.com',    'pass123','C103','Engineering','3rd Year'],
  ['Disha Kapoor',    'disha.kapoor@hostel.com',    'pass123','C104','Engineering','3rd Year'],
  ['Ekta Malhotra',   'ekta.malhotra@hostel.com',   'pass123','C105','Engineering','3rd Year'],
  ['Falguni Shah',    'falguni.shah@hostel.com',    'pass123','C106','Engineering','3rd Year'],
  ['Garima Bajaj',    'garima.bajaj@hostel.com',    'pass123','C107','Engineering','3rd Year'],
  ['Hema Walia',      'hema.walia@hostel.com',      'pass123','C108','Engineering','3rd Year'],
  ['Isha Bansal',     'isha.bansal@hostel.com',     'pass123','C109','Engineering','3rd Year'],
  ['Jasmine Sethi',   'jasmine.sethi@hostel.com',   'pass123','C110','Engineering','3rd Year'],
  ['Kiran Arora',     'kiran.arora@hostel.com',     'pass123','C111','Engineering','3rd Year'],
  ['Lalita Rawat',    'lalita.rawat@hostel.com',    'pass123','C112','Engineering','3rd Year'],
  ['Mamta Bisht',     'mamta.bisht@hostel.com',     'pass123','D101','Diploma','1st Year'],
  ['Neha Chaudhary',  'neha.chaudhary@hostel.com',  'pass123','D102','Diploma','1st Year'],
  ['Ojaswini Thakur', 'ojaswini.thakur@hostel.com', 'pass123','D103','Diploma','1st Year'],
  ['Preeti Rathore',  'preeti.rathore@hostel.com',  'pass123','D104','Diploma','1st Year'],
  ['Qamar Fatima',    'qamar.fatima@hostel.com',    'pass123','D105','Diploma','1st Year'],
  ['Rani Kumari',     'rani.kumari@hostel.com',     'pass123','D106','Diploma','1st Year'],
  ['Shilpa Garg',     'shilpa.garg@hostel.com',     'pass123','D107','Diploma','1st Year'],
  ['Trishna Bose',    'trishna.bose@hostel.com',    'pass123','D108','Diploma','1st Year'],
  ['Usha Pandey',     'usha.pandey@hostel.com',     'pass123','D109','Diploma','1st Year'],
  ['Vidya Murthy',    'vidya.murthy@hostel.com',    'pass123','D110','Diploma','1st Year'],
  ['Warda Ansari',    'warda.ansari@hostel.com',    'pass123','D111','Diploma','1st Year'],
  ['Xena Rodrigues',  'xena.rodrigues@hostel.com',  'pass123','D112','Diploma','1st Year'],
  ['Yashoda Hegde',   'yashoda.hegde@hostel.com',   'pass123','D113','Diploma','1st Year'],
  ['Zeenat Mirza',    'zeenat.mirza@hostel.com',    'pass123','D114','Diploma','1st Year'],
  ['Amrita Ghosh',    'amrita.ghosh@hostel.com',    'pass123','D115','Diploma','1st Year'],
  ['Bharati Naik',    'bharati.naik@hostel.com',    'pass123','D116','Diploma','1st Year'],
  ['Chandni Solanki', 'chandni.solanki@hostel.com', 'pass123','D117','Diploma','1st Year'],
  ['Damini Pawar',    'damini.pawar@hostel.com',    'pass123','D118','Diploma','1st Year'],
  ['Esha Deshpande',  'esha.deshpande@hostel.com',  'pass123','D119','Diploma','1st Year'],
  ['Falak Shaikh',    'falak.shaikh@hostel.com',    'pass123','D120','Diploma','1st Year'],
  ['Gauri Sawant',    'gauri.sawant@hostel.com',    'pass123','E101','Diploma','2nd Year'],
  ['Hina Qureshi',    'hina.qureshi@hostel.com',    'pass123','E102','Diploma','2nd Year'],
  ['Ishita Chatterjee','ishita.chatterjee@hostel.com','pass123','E103','Diploma','2nd Year'],
  ['Juhi Sinha',      'juhi.sinha@hostel.com',      'pass123','E104','Diploma','2nd Year'],
  ['Komal Yadav',     'komal.yadav@hostel.com',     'pass123','E105','Diploma','2nd Year'],
  ['Leena Varma',     'leena.varma@hostel.com',     'pass123','E106','Diploma','2nd Year'],
  ['Mona Sharma',     'mona.sharma@hostel.com',     'pass123','E107','Diploma','2nd Year'],
  ['Nandini Pillai',  'nandini.pillai@hostel.com',  'pass123','E108','Diploma','2nd Year'],
  ['Ojasvi Mehrotra', 'ojasvi.mehrotra@hostel.com', 'pass123','E109','Diploma','2nd Year'],
  ['Poonam Tiwari',   'poonam.tiwari@hostel.com',   'pass123','E110','Diploma','2nd Year'],
  ['Roshni Kaur',     'roshni.kaur@hostel.com',     'pass123','E111','Diploma','2nd Year'],
  ['Shruti Dixit',    'shruti.dixit@hostel.com',    'pass123','E112','Diploma','2nd Year'],
  ['Trisha Mukherjee','trisha.mukherjee@hostel.com','pass123','E113','Diploma','2nd Year'],
  ['Urmila Shinde',   'urmila.shinde@hostel.com',   'pass123','E114','Diploma','2nd Year'],
  ['Vasudha Nair',    'vasudha.nair@hostel.com',    'pass123','E115','Diploma','2nd Year'],
  ['Winnie DSouza',   'winnie.dsouza@hostel.com',   'pass123','E116','Diploma','2nd Year'],
  ['Xenia Fernandes', 'xenia.fernandes@hostel.com', 'pass123','E117','Diploma','2nd Year'],
  ['Yogita Patil',    'yogita.patil@hostel.com',    'pass123','E118','Diploma','2nd Year'],
  ['Zoya Begum',      'zoya.begum@hostel.com',      'pass123','F101','Diploma','3rd Year'],
  ['Aishwarya Rao',   'aishwarya.rao@hostel.com',   'pass123','F102','Diploma','3rd Year'],
  ['Bhumi Pednekar',  'bhumi.pednekar@hostel.com',  'pass123','F103','Diploma','3rd Year'],
  ['Charulata Sen',   'charulata.sen@hostel.com',   'pass123','F104','Diploma','3rd Year'],
  ['Devika Menon',    'devika.menon@hostel.com',    'pass123','F105','Diploma','3rd Year'],
  ['Elina Bora',      'elina.bora@hostel.com',      'pass123','F106','Diploma','3rd Year'],
  ['Fiona Gomes',     'fiona.gomes@hostel.com',     'pass123','F107','Diploma','3rd Year'],
  ['Gitanjali Roy',   'gitanjali.roy@hostel.com',   'pass123','F108','Diploma','3rd Year'],
  ['Hemali Joshi',    'hemali.joshi@hostel.com',    'pass123','F109','Diploma','3rd Year'],
  ['Ira Kapoor',      'ira.kapoor@hostel.com',      'pass123','F110','Diploma','3rd Year'],
  ['Jayashree Iyer',  'jayashree.iyer@hostel.com',  'pass123','F111','Diploma','3rd Year'],
  ['Kavitha Suresh',  'kavitha.suresh@hostel.com',  'pass123','F112','Diploma','3rd Year'],
];

// Assign random fee data
const feeStatuses = ['paid', 'pending', 'partial'];
const insertStudent = db.prepare(
  `INSERT OR IGNORE INTO students (name,email,password,room_no,course,year,gender,fee_status,fee_amount,fee_paid,admission_year)
   VALUES (?,?,?,?,?,?,'Female',?,?,?,?)`
);
const seedStudents = db.transaction((rows) => {
  for (const row of rows) {
    const feeStatus = feeStatuses[Math.floor(Math.random() * 3)];
    const feeAmount = 50000;
    const feePaid   = feeStatus === 'paid' ? 50000 : feeStatus === 'partial' ? 25000 : 0;
    const admYear   = 2022 + Math.floor(Math.random() * 3);
    insertStudent.run(...row, feeStatus, feeAmount, feePaid, admYear);
  }
});
seedStudents(students);

// Update room occupancy based on students
db.exec(`
  UPDATE rooms SET occupied = (
    SELECT COUNT(*) FROM students WHERE students.room_no = rooms.room_no
  );
`);
// Update status separately after occupied is set
db.prepare(`
  UPDATE rooms SET status = CASE
    WHEN (SELECT COUNT(*) FROM students WHERE students.room_no = rooms.room_no) >= capacity THEN 'full'
    ELSE 'available'
  END
`).run();

// ── Seed sample complaints ────────────────────────────────────
const sampleComplaints = [
  [1, 1, 'Aarti Sharma',   'A101', 'Water Leakage',      'Water is leaking from the bathroom tap.',        'Pending'],
  [2, 2, 'Priya Verma',    'A102', 'Fan Not Working',    'The ceiling fan in my room stopped working.',    'In Progress'],
  [3, 3, 'Sneha Patel',    'A103', 'WiFi Issue',         'No internet connectivity since yesterday.',      'Resolved'],
  [4, 4, 'Kavya Nair',     'A104', 'Broken Window',      'Window glass is cracked and needs replacement.', 'Pending'],
  [5, 5, 'Ritu Singh',     'A105', 'Dirty Washroom',     'Washroom on 2nd floor is not being cleaned.',    'In Progress'],
];
const insertComplaint = db.prepare(
  `INSERT OR IGNORE INTO complaints (id,student_id,student_name,room_no,title,complaint,status) VALUES (?,?,?,?,?,?,?)`
);
const seedComplaints = db.transaction((rows) => {
  for (const row of rows) insertComplaint.run(...row);
});
seedComplaints(sampleComplaints);

// ── Seed sample notices ───────────────────────────────────────
const sampleNotices = [
  ['Hostel Day Celebration', 'Annual hostel day will be celebrated on 20th April. All students must attend.', 'Announcement', 'Ambar Jain'],
  ['Food Menu Update',       'New mess menu effective from Monday. Breakfast timings changed to 7:30 AM.',    'Food Menu',    'Riya Jain'],
  ['Water Supply Shutdown',  'Water supply will be shut down on Sunday 10 AM - 2 PM for maintenance.',        'Maintenance',  'Ambar Jain'],
  ['Exam Schedule',          'End semester exams start from 1st May. Study rooms open 24x7 till exams.',      'General',      'Riya Jain'],
];
const insertNotice = db.prepare(
  `INSERT OR IGNORE INTO notices (title,description,type,posted_by) VALUES (?,?,?,?)`
);
const seedNotices = db.transaction((rows) => {
  for (const row of rows) insertNotice.run(...row);
});
// Only seed if empty
const noticeCount = db.prepare('SELECT COUNT(*) as c FROM notices').get().c;
if (noticeCount === 0) seedNotices(sampleNotices);

const studentCount = db.prepare('SELECT COUNT(*) as c FROM students').get().c;
const roomCount    = db.prepare('SELECT COUNT(*) as c FROM rooms').get().c;
console.log(`\n✅ Setup complete!`);
console.log(`   Students  : ${studentCount}`);
console.log(`   Rooms     : ${roomCount}`);
console.log(`   Admin     : ambar@gmail.com / 1234`);
console.log(`   Warden    : riya@gmail.com  / 1234`);
console.log(`   Student   : aarti.sharma@hostel.com / pass123`);
console.log(`\nNow run: node server.cjs`);

db.close();
