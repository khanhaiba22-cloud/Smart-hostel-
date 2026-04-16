'use strict';
require('dotenv').config();
const mysql = require('mysql2/promise');

async function setup() {
  // Connect without DB first to create it
  const root = await mysql.createConnection({
    host:     process.env.DB_HOST,
    port:     Number(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  await root.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  console.log(`✅ Database '${process.env.DB_NAME}' ready`);
  await root.end();

  // Now connect to the DB
  const db = await mysql.createConnection({
    host:     process.env.DB_HOST,
    port:     Number(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  // ── Tables ──────────────────────────────────────────────────
  await db.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id       INT AUTO_INCREMENT PRIMARY KEY,
      name     VARCHAR(100) NOT NULL,
      email    VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS wardens (
      id       INT AUTO_INCREMENT PRIMARY KEY,
      name     VARCHAR(100) NOT NULL,
      email    VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS students (
      id             INT AUTO_INCREMENT PRIMARY KEY,
      name           VARCHAR(100) NOT NULL,
      email          VARCHAR(150) UNIQUE NOT NULL,
      password       VARCHAR(100) NOT NULL DEFAULT 'pass123',
      room_no        VARCHAR(20)  DEFAULT '',
      course         VARCHAR(50)  NOT NULL DEFAULT 'Engineering',
      year           VARCHAR(20)  NOT NULL DEFAULT '1st Year',
      gender         VARCHAR(20)  DEFAULT 'Female',
      phone          VARCHAR(20)  DEFAULT '',
      parent_phone   VARCHAR(20)  DEFAULT '',
      address        TEXT         DEFAULT '',
      admission_year INT          DEFAULT 2024,
      fee_status     ENUM('paid','pending','partial') DEFAULT 'pending',
      fee_amount     DECIMAL(10,2) DEFAULT 50000,
      fee_paid       DECIMAL(10,2) DEFAULT 0,
      created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      room_no    VARCHAR(20) UNIQUE NOT NULL,
      floor      VARCHAR(30) NOT NULL DEFAULT 'Ground',
      type       VARCHAR(30) NOT NULL DEFAULT 'Double',
      capacity   INT NOT NULL DEFAULT 2,
      occupied   INT NOT NULL DEFAULT 0,
      status     ENUM('available','full','maintenance') DEFAULT 'available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      student_id   INT,
      student_name VARCHAR(100) NOT NULL,
      room_no      VARCHAR(20)  NOT NULL,
      title        VARCHAR(200) DEFAULT 'General Complaint',
      complaint    TEXT NOT NULL,
      status       ENUM('Pending','In Progress','Resolved') DEFAULT 'Pending',
      resolved_at  DATETIME,
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notices (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      title       VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      type        ENUM('General','Announcement','Food Menu','Maintenance') DEFAULT 'General',
      date        DATETIME DEFAULT CURRENT_TIMESTAMP,
      posted_by   VARCHAR(100) DEFAULT '',
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      date       DATE NOT NULL,
      status     ENUM('Present','Absent','Late','On Leave') DEFAULT 'Absent',
      marked_by  VARCHAR(150) DEFAULT '',
      note       TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_student_date (student_id, date)
    );

    CREATE TABLE IF NOT EXISTS fee_structure (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      course     VARCHAR(50) NOT NULL,
      year       VARCHAR(20) NOT NULL,
      amount     DECIMAL(10,2) NOT NULL DEFAULT 50000,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_course_year (course, year)
    );
  `);
  console.log('✅ All tables created');

  // ── Seed admin & warden ──────────────────────────────────────
  await db.query(`INSERT IGNORE INTO admins (name,email,password) VALUES ('Ambar Jain','ambar@gmail.com','1234')`);
  await db.query(`INSERT IGNORE INTO wardens (name,email,password) VALUES ('Riya Jain','riya@gmail.com','1234')`);

  // ── Seed rooms ───────────────────────────────────────────────
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
      await db.query(
        `INSERT IGNORE INTO rooms (room_no,floor,type,capacity,status) VALUES (?,?,?,?,'available')`,
        [`${f.prefix}${i}`, f.floor, f.type, f.cap]
      );
    }
  }
  console.log('✅ Rooms seeded');

  // ── Seed students ────────────────────────────────────────────
  const students = [
    ['Aarti Sharma','aarti.sharma@hostel.com','pass123','A101','Engineering','1st Year'],
    ['Priya Verma','priya.verma@hostel.com','pass123','A102','Engineering','1st Year'],
    ['Sneha Patel','sneha.patel@hostel.com','pass123','A103','Engineering','1st Year'],
    ['Kavya Nair','kavya.nair@hostel.com','pass123','A104','Engineering','1st Year'],
    ['Ritu Singh','ritu.singh@hostel.com','pass123','A105','Engineering','1st Year'],
    ['Pooja Gupta','pooja.gupta@hostel.com','pass123','A106','Engineering','1st Year'],
    ['Ananya Mishra','ananya.mishra@hostel.com','pass123','A107','Engineering','1st Year'],
    ['Divya Yadav','divya.yadav@hostel.com','pass123','A108','Engineering','1st Year'],
    ['Meera Joshi','meera.joshi@hostel.com','pass123','A109','Engineering','1st Year'],
    ['Nisha Tiwari','nisha.tiwari@hostel.com','pass123','A110','Engineering','1st Year'],
    ['Deepa Iyer','deepa.iyer@hostel.com','pass123','B101','Engineering','2nd Year'],
    ['Farida Khan','farida.khan@hostel.com','pass123','B102','Engineering','2nd Year'],
    ['Harsha Menon','harsha.menon@hostel.com','pass123','B103','Engineering','2nd Year'],
    ['Indira Nambiar','indira.nambiar@hostel.com','pass123','B104','Engineering','2nd Year'],
    ['Jyoti Agarwal','jyoti.agarwal@hostel.com','pass123','B105','Engineering','2nd Year'],
    ['Abha Srivastava','abha.srivastava@hostel.com','pass123','C101','Engineering','3rd Year'],
    ['Bindu Nair','bindu.nair@hostel.com','pass123','C102','Engineering','3rd Year'],
    ['Chhaya Yadav','chhaya.yadav@hostel.com','pass123','C103','Engineering','3rd Year'],
    ['Disha Kapoor','disha.kapoor@hostel.com','pass123','C104','Engineering','3rd Year'],
    ['Ekta Malhotra','ekta.malhotra@hostel.com','pass123','C105','Engineering','3rd Year'],
    ['Mamta Bisht','mamta.bisht@hostel.com','pass123','D101','Diploma','1st Year'],
    ['Neha Chaudhary','neha.chaudhary@hostel.com','pass123','D102','Diploma','1st Year'],
    ['Ojaswini Thakur','ojaswini.thakur@hostel.com','pass123','D103','Diploma','1st Year'],
    ['Preeti Rathore','preeti.rathore@hostel.com','pass123','D104','Diploma','1st Year'],
    ['Qamar Fatima','qamar.fatima@hostel.com','pass123','D105','Diploma','1st Year'],
    ['Gauri Sawant','gauri.sawant@hostel.com','pass123','E101','Diploma','2nd Year'],
    ['Hina Qureshi','hina.qureshi@hostel.com','pass123','E102','Diploma','2nd Year'],
    ['Ishita Chatterjee','ishita.chatterjee@hostel.com','pass123','E103','Diploma','2nd Year'],
    ['Juhi Sinha','juhi.sinha@hostel.com','pass123','E104','Diploma','2nd Year'],
    ['Komal Yadav','komal.yadav@hostel.com','pass123','E105','Diploma','2nd Year'],
    ['Zoya Begum','zoya.begum@hostel.com','pass123','F101','Diploma','3rd Year'],
    ['Aishwarya Rao','aishwarya.rao@hostel.com','pass123','F102','Diploma','3rd Year'],
    ['Bhumi Pednekar','bhumi.pednekar@hostel.com','pass123','F103','Diploma','3rd Year'],
    ['Charulata Sen','charulata.sen@hostel.com','pass123','F104','Diploma','3rd Year'],
    ['Devika Menon','devika.menon@hostel.com','pass123','F105','Diploma','3rd Year'],
  ];

  const feeStatuses = ['paid','pending','partial'];
  for (const s of students) {
    const fs = feeStatuses[Math.floor(Math.random() * 3)];
    const fp = fs === 'paid' ? 50000 : fs === 'partial' ? 25000 : 0;
    await db.query(
      `INSERT IGNORE INTO students (name,email,password,room_no,course,year,gender,fee_status,fee_amount,fee_paid,admission_year)
       VALUES (?,?,?,?,?,?,'Female',?,50000,?,2024)`,
      [...s, fs, fp]
    );
  }
  console.log('✅ Students seeded');

  // ── Seed sample complaints ───────────────────────────────────
  const complaints = [
    ['Aarti Sharma','A101','Water Leakage','Water is leaking from the bathroom tap.','Pending'],
    ['Priya Verma','A102','Fan Not Working','The ceiling fan stopped working.','In Progress'],
    ['Sneha Patel','A103','WiFi Issue','No internet connectivity since yesterday.','Resolved'],
  ];
  for (const c of complaints) {
    await db.query(
      `INSERT IGNORE INTO complaints (student_name,room_no,title,complaint,status) VALUES (?,?,?,?,?)`, c
    );
  }

  // ── Seed notices ─────────────────────────────────────────────
  const notices = [
    ['Hostel Day Celebration','Annual hostel day on 20th April. All students must attend.','Announcement','Ambar Jain'],
    ['Food Menu Update','New mess menu from Monday. Breakfast at 7:30 AM.','Food Menu','Riya Jain'],
    ['Water Supply Shutdown','Water off Sunday 10 AM–2 PM for maintenance.','Maintenance','Ambar Jain'],
  ];
  for (const n of notices) {
    await db.query(`INSERT IGNORE INTO notices (title,description,type,posted_by) VALUES (?,?,?,?)`, n);
  }

  // Update room occupancy
  await db.query(`
    UPDATE rooms r SET occupied = (
      SELECT COUNT(*) FROM students s WHERE s.room_no = r.room_no
    )
  `);
  await db.query(`
    UPDATE rooms SET status = CASE WHEN occupied >= capacity THEN 'full' ELSE 'available' END
  `);

  const [[{ c: sc }]] = await db.query('SELECT COUNT(*) as c FROM students');
  const [[{ c: rc }]] = await db.query('SELECT COUNT(*) as c FROM rooms');
  console.log(`\n✅ Setup complete!`);
  console.log(`   Students : ${sc}`);
  console.log(`   Rooms    : ${rc}`);
  console.log(`   Admin    : ambar@gmail.com / 1234`);
  console.log(`   Rector   : riya@gmail.com  / 1234`);
  console.log(`   Student  : aarti.sharma@hostel.com / pass123`);
  console.log(`\nNow run: node server.cjs`);

  await db.end();
}

setup().catch(e => { console.error('❌ Setup failed:', e.message); process.exit(1); });
