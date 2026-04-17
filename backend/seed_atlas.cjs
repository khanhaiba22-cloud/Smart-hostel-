'use strict';
// Seed script for Atlas — run once to populate production database
const mongoose = require('mongoose');
const { Admin, Warden, Student, Room, Complaint, Notice } = require('./models.cjs');

// Password with @ encoded as %40
const MONGO_URI = 'mongodb+srv://khanhaiba22_db_user:Haiba%402003@cluster0.k8gatrp.mongodb.net/hostel_db?retryWrites=true&w=majority&appName=Cluster0';

async function seed() {
  console.log('Connecting to Atlas...');
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  console.log('✅ Connected to MongoDB Atlas');

  await Promise.all([
    Admin.deleteMany({}), Warden.deleteMany({}), Student.deleteMany({}),
    Room.deleteMany({}), Complaint.deleteMany({}), Notice.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  await Admin.create({ name: 'Ambar Jain', email: 'ambar@gmail.com', password: '1234' });
  await Warden.create({ name: 'Riya Jain', email: 'riya@gmail.com', password: '1234' });
  console.log('✅ Admin & Rector created');

  const floors = [
    { prefix: 'A', floor: 'Ground', type: 'Single', cap: 1 },
    { prefix: 'B', floor: 'First',  type: 'Double', cap: 2 },
    { prefix: 'C', floor: 'Second', type: 'Double', cap: 2 },
    { prefix: 'D', floor: 'Third',  type: 'Triple', cap: 3 },
    { prefix: 'E', floor: 'Third',  type: 'Triple', cap: 3 },
    { prefix: 'F', floor: 'Fourth', type: 'Double', cap: 2 },
  ];
  const rooms = [];
  for (const f of floors)
    for (let i = 101; i <= 120; i++)
      rooms.push({ roomNo: `${f.prefix}${i}`, floor: f.floor, type: f.type, capacity: f.cap });
  await Room.insertMany(rooms);
  console.log('✅ 120 Rooms seeded');

  const feeStatuses = ['paid','pending','partial'];
  const studentData = [
    ['Aarti Sharma','aarti.sharma@hostel.com','A101','Engineering','1st Year'],
    ['Priya Verma','priya.verma@hostel.com','A102','Engineering','1st Year'],
    ['Sneha Patel','sneha.patel@hostel.com','A103','Engineering','1st Year'],
    ['Kavya Nair','kavya.nair@hostel.com','A104','Engineering','1st Year'],
    ['Ritu Singh','ritu.singh@hostel.com','A105','Engineering','1st Year'],
    ['Pooja Gupta','pooja.gupta@hostel.com','A106','Engineering','1st Year'],
    ['Ananya Mishra','ananya.mishra@hostel.com','A107','Engineering','1st Year'],
    ['Divya Yadav','divya.yadav@hostel.com','A108','Engineering','1st Year'],
    ['Meera Joshi','meera.joshi@hostel.com','A109','Engineering','1st Year'],
    ['Nisha Tiwari','nisha.tiwari@hostel.com','A110','Engineering','1st Year'],
    ['Deepa Iyer','deepa.iyer@hostel.com','B101','Engineering','2nd Year'],
    ['Farida Khan','farida.khan@hostel.com','B102','Engineering','2nd Year'],
    ['Harsha Menon','harsha.menon@hostel.com','B103','Engineering','2nd Year'],
    ['Indira Nambiar','indira.nambiar@hostel.com','B104','Engineering','2nd Year'],
    ['Jyoti Agarwal','jyoti.agarwal@hostel.com','B105','Engineering','2nd Year'],
    ['Abha Srivastava','abha.srivastava@hostel.com','C101','Engineering','3rd Year'],
    ['Bindu Nair','bindu.nair@hostel.com','C102','Engineering','3rd Year'],
    ['Chhaya Yadav','chhaya.yadav@hostel.com','C103','Engineering','3rd Year'],
    ['Disha Kapoor','disha.kapoor@hostel.com','C104','Engineering','3rd Year'],
    ['Ekta Malhotra','ekta.malhotra@hostel.com','C105','Engineering','3rd Year'],
    ['Mamta Bisht','mamta.bisht@hostel.com','D101','Diploma','1st Year'],
    ['Neha Chaudhary','neha.chaudhary@hostel.com','D102','Diploma','1st Year'],
    ['Ojaswini Thakur','ojaswini.thakur@hostel.com','D103','Diploma','1st Year'],
    ['Preeti Rathore','preeti.rathore@hostel.com','D104','Diploma','1st Year'],
    ['Qamar Fatima','qamar.fatima@hostel.com','D105','Diploma','1st Year'],
    ['Gauri Sawant','gauri.sawant@hostel.com','E101','Diploma','2nd Year'],
    ['Hina Qureshi','hina.qureshi@hostel.com','E102','Diploma','2nd Year'],
    ['Ishita Chatterjee','ishita.chatterjee@hostel.com','E103','Diploma','2nd Year'],
    ['Juhi Sinha','juhi.sinha@hostel.com','E104','Diploma','2nd Year'],
    ['Komal Yadav','komal.yadav@hostel.com','E105','Diploma','2nd Year'],
    ['Zoya Begum','zoya.begum@hostel.com','F101','Diploma','3rd Year'],
    ['Aishwarya Rao','aishwarya.rao@hostel.com','F102','Diploma','3rd Year'],
    ['Bhumi Pednekar','bhumi.pednekar@hostel.com','F103','Diploma','3rd Year'],
    ['Charulata Sen','charulata.sen@hostel.com','F104','Diploma','3rd Year'],
    ['Devika Menon','devika.menon@hostel.com','F105','Diploma','3rd Year'],
  ];

  const students = studentData.map(([name,email,roomNo,branch,year]) => {
    const fs = feeStatuses[Math.floor(Math.random()*3)];
    return { name, email, password:'pass123', roomNo, branch, year,
      feeStatus:fs, feeAmount:50000, feePaid: fs==='paid'?50000:fs==='partial'?25000:0 };
  });
  const inserted = await Student.insertMany(students);
  for (const s of inserted)
    await Room.updateOne({ roomNo: s.roomNo }, { $inc: { occupied: 1 } });
  await Room.updateMany({ $expr: { $gte: ['$occupied','$capacity'] } }, { status:'full' });
  console.log(`✅ ${inserted.length} Students seeded`);

  await Complaint.insertMany([
    { studentId: inserted[0]._id, studentName:'Aarti Sharma', roomNo:'A101', title:'Water Leakage', complaint:'Water leaking from bathroom tap.', status:'Pending' },
    { studentId: inserted[1]._id, studentName:'Priya Verma',  roomNo:'A102', title:'Fan Not Working', complaint:'Ceiling fan stopped working.', status:'In Progress' },
    { studentId: inserted[2]._id, studentName:'Sneha Patel',  roomNo:'A103', title:'WiFi Issue', complaint:'No internet since yesterday.', status:'Resolved' },
  ]);

  await Notice.insertMany([
    { title:'Hostel Day Celebration', description:'Annual hostel day on 20th April.', type:'Announcement', postedBy:'Ambar Jain' },
    { title:'Food Menu Update', description:'New mess menu from Monday.', type:'Food Menu', postedBy:'Riya Jain' },
    { title:'Water Supply Shutdown', description:'Water off Sunday 10 AM–2 PM.', type:'Maintenance', postedBy:'Ambar Jain' },
  ]);

  console.log('\n✅ Atlas database seeded successfully!');
  console.log('   Admin   : ambar@gmail.com / 1234');
  console.log('   Rector  : riya@gmail.com  / 1234');
  console.log('   Student : aarti.sharma@hostel.com / pass123');
  await mongoose.disconnect();
}

seed().catch(e => { console.error('❌ Failed:', e.message); process.exit(1); });
