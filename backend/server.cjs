require('dotenv').config({ path: require('path').join(__dirname, '.env') });

process.on('uncaughtException',  err => console.error('Uncaught:', err.message));
process.on('unhandledRejection', err => console.error('Unhandled:', err));

const express  = require('express');
const cors     = require('cors');
const jwt      = require('jsonwebtoken');
const mongoose = require('mongoose');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const { Admin, Warden, Student, Room, Complaint, Notice, Attendance, FeeStructure } = require('./models.cjs');

const app    = express();
const PORT   = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || 'hostel_jwt_secret_2024';

// ── CORS ──────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:3000',
  'https://smart-hostel-htlh.vercel.app',
  'https://smarthostel.co.in',
  'https://www.smarthostel.co.in',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow Postman/curl
    if (allowedOrigins.includes(origin)) return cb(null, true);
    console.warn('CORS blocked:', origin);
    return cb(null, true); // allow all in production for now
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.options('*', cors()); // handle preflight
app.use(express.json());

// ── Static uploads ────────────────────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

// ── Multer config ─────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `photo_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

// ── MongoDB connection ────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_URI not set. Please add it in Render environment variables.');
  process.exit(1);
}

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
})
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(e => {
    console.error('❌ MongoDB connection failed:', e.message);
    process.exit(1);
  });

// ── Helpers ───────────────────────────────────────────────────
function norm(doc) {
  if (!doc) return doc;
  const o = doc.toObject ? doc.toObject() : { ...doc };
  o._id = String(o._id);
  o.id  = o._id;
  return o;
}

// ── JWT middleware ────────────────────────────────────────────
function auth(req, res, next) {
  const h = req.headers['authorization'];
  if (!h) return res.status(401).json({ success:false, message:'No token.' });
  try { req.user = jwt.verify(h.split(' ')[1], SECRET); next(); }
  catch { return res.status(401).json({ success:false, message:'Invalid token.' }); }
}
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role))
      return res.status(403).json({ success:false, message:'Access denied.' });
    next();
  };
}

// ── AUTH ──────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success:false, message:'Email and password required.' });
  try {
    let user = await Admin.findOne({ email, password }).lean();
    let role = 'owner';
    if (!user) { user = await Warden.findOne({ email, password }).lean(); role = 'rector'; }
    if (!user) { user = await Student.findOne({ email, password }).lean(); role = 'student'; }
    if (!user) return res.status(401).json({ success:false, message:'Invalid email or password.' });
    const token = jwt.sign({ id: user._id, email: user.email, role }, SECRET, { expiresIn:'7d' });
    return res.json({ success:true, message:'Login successful.', data:{ token, user:{ id:String(user._id), name:user.name, email:user.email, role } } });
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const { id, role } = req.user;
    let user;
    if (role==='owner')   user = await Admin.findById(id).lean();
    if (role==='rector')  user = await Warden.findById(id).lean();
    if (role==='student') user = await Student.findById(id).lean();
    if (!user) return res.status(404).json({ success:false, message:'Not found.' });
    return res.json({ success:true, data:{ user:{ id:String(user._id), name:user.name, email:user.email, role } } });
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

// ── STUDENTS ──────────────────────────────────────────────────
app.get('/api/students', auth, async (req, res) => {
  const { page=1, limit=20, search, branch, feeStatus, roomNo } = req.query;
  const filter = {};
  if (search)    filter.$or = [{ name:{ $regex:search, $options:'i' } }, { email:{ $regex:search, $options:'i' } }];
  if (branch)    filter.branch = branch;
  if (feeStatus) filter.feeStatus = feeStatus;
  if (roomNo)    filter.roomNo = roomNo;
  try {
    const total = await Student.countDocuments(filter);
    const data  = await Student.find(filter).sort({ name:1 }).skip((Number(page)-1)*Number(limit)).limit(Number(limit)).lean();
    return res.json({ success:true, data: data.map(s=>({ ...s, _id:String(s._id), id:String(s._id) })),
      pagination:{ total, page:Number(page), limit:Number(limit), totalPages:Math.ceil(total/Number(limit)) } });
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

app.get('/api/students/:id', auth, async (req, res) => {
  try {
    const s = await Student.findById(req.params.id).lean();
    if (!s) return res.status(404).json({ success:false, message:'Not found.' });
    return res.json({ success:true, data:{ student:{ ...s, _id:String(s._id), id:String(s._id) } } });
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

app.post('/api/students', auth, requireRole('owner'), async (req, res) => {
  try {
    const s = await Student.create(req.body);
    return res.status(201).json({ success:true, message:'Created.', data:{ student: norm(s) } });
  } catch(e) { return res.status(400).json({ success:false, message:e.message }); }
});

app.put('/api/students/:id', auth, requireRole('owner'), async (req, res) => {
  try {
    const s = await Student.findByIdAndUpdate(req.params.id, req.body, { new:true }).lean();
    if (!s) return res.status(404).json({ success:false, message:'Not found.' });
    return res.json({ success:true, message:'Updated.', data:{ student:{ ...s, _id:String(s._id), id:String(s._id) } } });
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

app.delete('/api/students/:id', auth, requireRole('owner'), async (req, res) => {
  try {
    await Complaint.deleteMany({ studentId: req.params.id });
    await Attendance.deleteMany({ studentId: req.params.id });
    await Student.findByIdAndDelete(req.params.id);
    return res.json({ success:true, message:'Deleted.', data:null });
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

// ── ROOMS ─────────────────────────────────────────────────────
app.get('/api/rooms', auth, async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.floor)  filter.floor  = req.query.floor;
  try {
    const rooms = await Room.find(filter).sort({ roomNo:1 }).lean();
    return res.json({ success:true, data: rooms.map(r=>({ ...r, _id:String(r._id), id:String(r._id) })) });
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

app.post('/api/rooms', auth, requireRole('owner'), async (req, res) => {
  try {
    const r = await Room.create(req.body);
    return res.status(201).json({ success:true, data:{ room: norm(r) } });
  } catch(e) { return res.status(400).json({ success:false, message:e.message }); }
});

app.put('/api/rooms/:id', auth, requireRole('owner'), async (req, res) => {
  try {
    const r = await Room.findByIdAndUpdate(req.params.id, req.body, { new:true }).lean();
    if (!r) return res.status(404).json({ success:false, message:'Not found.' });
    return res.json({ success:true, data:{ room:{ ...r, _id:String(r._id), id:String(r._id) } } });
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

app.delete('/api/rooms/:id', auth, requireRole('owner'), async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    return res.json({ success:true, message:'Deleted.', data:null });
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

// ── COMPLAINTS ────────────────────────────────────────────────
app.get('/api/complaints', auth, async (req, res) => {
  const { status, page=1, limit=20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  try {
    const total = await Complaint.countDocuments(filter);
    const data  = await Complaint.find(filter).sort({ createdAt:-1 }).skip((Number(page)-1)*Number(limit)).limit(Number(limit)).lean();
    const normalized = data.map(c => ({ ...c, _id:String(c._id), id:String(c._id), studentId:c.studentId?String(c.studentId):null, createdAt:c.createdAt, updatedAt:c.updatedAt }));
    return res.json({ success:true, data:normalized, pagination:{ total, page:Number(page), limit:Number(limit), totalPages:Math.ceil(total/Number(limit)) } });
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

app.post('/api/complaints', auth, async (req, res) => {
  try {
    const c = await Complaint.create(req.body);
    return res.status(201).json({ success:true, message:'Submitted.', data:{ complaint: norm(c) } });
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

app.patch('/api/complaints/:id/status', auth, requireRole('owner','rector'), async (req, res) => {
  const { status } = req.body;
  const valid = ['Pending','In Progress','Resolved'];
  if (!valid.includes(status)) return res.status(400).json({ success:false, message:'Invalid status.' });
  try {
    const update = { status };
    if (status === 'Resolved') update.resolvedAt = new Date();
    const c = await Complaint.findByIdAndUpdate(req.params.id, update, { new:true }).lean();
    if (!c) return res.status(404).json({ success:false, message:'Not found.' });
    return res.json({ success:true, data:{ complaint:{ ...c, _id:String(c._id), id:String(c._id) } } });
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

app.delete('/api/complaints/:id', auth, requireRole('owner','rector'), async (req, res) => {
  try {
    await Complaint.findByIdAndDelete(req.params.id);
    return res.json({ success:true, message:'Deleted.', data:null });
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

// ── NOTICES ───────────────────────────────────────────────────
app.get('/api/notices', auth, async (req, res) => {
  const limit = Number(req.query.limit) || 50;
  try {
    const notices = await Notice.find().sort({ createdAt:-1 }).limit(limit).lean();
    const data = notices.map(n=>({ ...n, _id:String(n._id), id:String(n._id), postedBy:n.postedBy, createdAt:n.createdAt }));
    return res.json({ success:true, data:{ notices:data, count:data.length } });
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

app.post('/api/notices', auth, requireRole('owner','rector'), async (req, res) => {
  try {
    const n = await Notice.create(req.body);
    return res.status(201).json({ success:true, data:{ notice: norm(n) } });
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

app.put('/api/notices/:id', auth, requireRole('owner','rector'), async (req, res) => {
  try {
    const n = await Notice.findByIdAndUpdate(req.params.id, req.body, { new:true }).lean();
    if (!n) return res.status(404).json({ success:false, message:'Not found.' });
    return res.json({ success:true, data:{ notice:{ ...n, _id:String(n._id), id:String(n._id) } } });
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

app.delete('/api/notices/:id', auth, requireRole('owner','rector'), async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    return res.json({ success:true, message:'Deleted.', data:null });
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

// ── FEE STRUCTURE ─────────────────────────────────────────────
app.get('/api/fee-structure', auth, async (req, res) => {
  try {
    const data = await FeeStructure.find().sort({ course:1, year:1 }).lean();
    return res.json({ success:true, data: data.map(f=>({ ...f, _id:String(f._id), id:String(f._id) })) });
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

app.put('/api/fee-structure', auth, requireRole('owner'), async (req, res) => {
  const { course, year, amount } = req.body;
  if (!course||!year||amount===undefined) return res.status(400).json({ success:false, message:'course, year, amount required.' });
  try {
    await FeeStructure.findOneAndUpdate({ course, year }, { amount }, { upsert:true, new:true });
    return res.json({ success:true, message:'Updated.' });
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

// ── ATTENDANCE ────────────────────────────────────────────────
app.get('/api/attendance', auth, requireRole('owner','rector'), async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0,10);
  try {
    const students = await Student.find().sort({ name:1 }).lean();
    const records  = await Attendance.find({ date }).lean();
    const recMap   = {};
    for (const r of records) recMap[String(r.studentId)] = r;
    const rows = students.map(s => {
      const sid = String(s._id);
      const rec = recMap[sid];
      return { id:sid, name:s.name, roomNo:s.roomNo, branch:s.branch, year:s.year,
        status: rec?.status || 'Absent', note: rec?.note||'', markedBy: rec?.markedBy||'', attendanceId: rec?String(rec._id):null };
    });
    const summary = { total:rows.length, present:rows.filter(r=>r.status==='Present').length,
      absent:rows.filter(r=>r.status==='Absent').length, late:rows.filter(r=>r.status==='Late').length,
      onLeave:rows.filter(r=>r.status==='On Leave').length, marked:records.length };
    return res.json({ success:true, data:{ date, students:rows, summary } });
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

app.post('/api/attendance/bulk', auth, requireRole('owner','rector'), async (req, res) => {
  const { date, records } = req.body;
  if (!date||!Array.isArray(records)||!records.length)
    return res.status(400).json({ success:false, message:'date and records[] required.' });
  const markedBy = req.user.email;
  try {
    const ops = records.map(r => ({
      updateOne: {
        filter: { studentId: r.studentId, date },
        update: { $set: { status: r.status||'Absent', note: r.note||'', markedBy } },
        upsert: true,
      }
    }));
    await Attendance.bulkWrite(ops);
    const all = await Attendance.find({ date }).lean();
    const summary = { total:all.length, present:all.filter(r=>r.status==='Present').length,
      absent:all.filter(r=>r.status==='Absent').length, late:all.filter(r=>r.status==='Late').length,
      onLeave:all.filter(r=>r.status==='On Leave').length };
    return res.json({ success:true, message:'Saved.', data:{ date, summary } });
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

app.get('/api/attendance/student/:id', auth, async (req, res) => {
  try {
    const rows = await Attendance.find({ studentId: req.params.id }).sort({ date:-1 }).limit(60).lean();
    return res.json({ success:true, data: rows.map(r=>({ ...r, _id:String(r._id) })) });
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

// ── DASHBOARD ─────────────────────────────────────────────────
app.get('/api/dashboard/owner', auth, requireRole('owner'), async (req, res) => {
  try {
    const totalStudents      = await Student.countDocuments();
    const pendingFeeStudents = await Student.countDocuments({ feeStatus:{ $in:['pending','partial'] } });
    const activeComplaints   = await Complaint.countDocuments({ status:{ $ne:'Resolved' } });
    const occupiedRooms      = await Student.distinct('roomNo', { roomNo:{ $ne:'' } }).then(r=>r.length);
    const totalRooms         = await Room.countDocuments();
    const feeAgg = await Student.aggregate([
      { $group:{ _id:'$feeStatus', count:{ $sum:1 }, totalAmount:{ $sum:'$feeAmount' }, paidAmount:{ $sum:'$feePaid' } } }
    ]);
    const pendingFeeAmt = await Student.aggregate([
      { $match:{ feeStatus:{ $ne:'paid' } } },
      { $group:{ _id:null, total:{ $sum:{ $subtract:['$feeAmount','$feePaid'] } } } }
    ]).then(r=>r[0]?.total||0);
    const recentComplaints = await Complaint.find().sort({ createdAt:-1 }).limit(5).lean();
    return res.json({ success:true, data:{
      totalStudents, pendingFeeStudents, totalPendingFees:pendingFeeAmt,
      activeComplaints, totalRooms, occupiedRooms,
      feeBreakdown: feeAgg,
      recentComplaints: recentComplaints.map(c=>({ ...c, _id:String(c._id), id:String(c._id), studentId:c.studentId?String(c.studentId):null })),
    }});
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

app.get('/api/dashboard/warden', auth, requireRole('owner','rector'), async (req, res) => {
  try {
    const totalStudents        = await Student.countDocuments();
    const pendingComplaints    = await Complaint.countDocuments({ status:'Pending' });
    const inProgressComplaints = await Complaint.countDocuments({ status:'In Progress' });
    const recentComplaints     = await Complaint.find().sort({ createdAt:-1 }).limit(10).lean();
    const notices              = await Notice.find().sort({ createdAt:-1 }).limit(5).lean();
    const today                = new Date().toISOString().slice(0,10);
    const att                  = await Attendance.find({ date:today }).lean();
    return res.json({ success:true, data:{
      totalStudents,
      presentStudents:  att.filter(a=>a.status==='Present').length,
      absentStudents:   att.filter(a=>a.status==='Absent').length,
      lateStudents:     att.filter(a=>a.status==='Late').length,
      attendanceMarked: att.length > 0,
      pendingComplaints, inProgressComplaints,
      recentComplaints: recentComplaints.map(c=>({ ...c, _id:String(c._id), id:String(c._id), studentId:c.studentId?String(c.studentId):null })),
      notices: notices.map(n=>({ ...n, _id:String(n._id), id:String(n._id), postedBy:n.postedBy })),
    }});
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

app.get('/api/dashboard/student/:id', auth, async (req, res) => {
  try {
    const student      = await Student.findById(req.params.id).lean();
    if (!student) return res.status(404).json({ success:false, message:'Not found.' });
    const myComplaints = await Complaint.find({ studentId: req.params.id }).sort({ createdAt:-1 }).lean();
    const notices      = await Notice.find().sort({ createdAt:-1 }).limit(10).lean();
    return res.json({ success:true, data:{
      student: { ...student, _id:String(student._id), id:String(student._id) },
      myComplaints: myComplaints.map(c=>({ ...c, _id:String(c._id), id:String(c._id) })),
      notices: notices.map(n=>({ ...n, _id:String(n._id), id:String(n._id), postedBy:n.postedBy })),
    }});
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

// ── PROFILE (student self-update) ────────────────────────────
app.get('/api/profile', auth, async (req, res) => {
  try {
    const s = await Student.findById(req.user.id).lean();
    if (!s) return res.status(404).json({ success:false, message:'Not found.' });
    return res.json({ success:true, data:{ student:{ ...s, _id:String(s._id), id:String(s._id) } } });
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

app.put('/api/profile', auth, async (req, res) => {
  const { roomNo, branch, year, phone } = req.body;
  try {
    const s = await Student.findByIdAndUpdate(
      req.user.id,
      { ...(roomNo  !== undefined && { roomNo }),
        ...(branch  !== undefined && { branch }),
        ...(year    !== undefined && { year }),
        ...(phone   !== undefined && { phone }) },
      { new: true }
    ).lean();
    if (!s) return res.status(404).json({ success:false, message:'Not found.' });
    return res.json({ success:true, message:'Profile updated.', data:{ student:{ ...s, _id:String(s._id), id:String(s._id) } } });
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

app.post('/api/profile/photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success:false, message:'No file uploaded.' });
    const photoUrl = `/uploads/${req.file.filename}`;
    // Delete old photo if exists
    const old = await Student.findById(req.user.id).lean();
    if (old?.photoUrl) {
      const oldPath = path.join(__dirname, old.photoUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    const s = await Student.findByIdAndUpdate(req.user.id, { photoUrl }, { new:true }).lean();
    return res.json({ success:true, message:'Photo updated.', data:{ photoUrl, student:{ ...s, _id:String(s._id), id:String(s._id) } } });
  } catch(e) { return res.status(500).json({ success:false, message:e.message }); }
});

// ── ONE-TIME SEED (remove after use) ─────────────────────────
app.get('/api/seed', async (req, res) => {
  const secret = req.query.secret;
  if (secret !== 'seed_hostel_2024') return res.status(403).json({ message: 'Forbidden' });
  try {
    const { Admin, Warden, Student, Room, Complaint, Notice } = require('./models.cjs');
    await Promise.all([Admin.deleteMany({}), Warden.deleteMany({}), Student.deleteMany({}), Room.deleteMany({}), Complaint.deleteMany({}), Notice.deleteMany({})]);
    await Admin.create({ name:'Ambar Jain', email:'ambar@gmail.com', password:'1234' });
    await Warden.create({ name:'Riya Jain', email:'riya@gmail.com', password:'1234' });
    const floors = [
      {prefix:'A',floor:'Ground',type:'Single',cap:1},{prefix:'B',floor:'First',type:'Double',cap:2},
      {prefix:'C',floor:'Second',type:'Double',cap:2},{prefix:'D',floor:'Third',type:'Triple',cap:3},
      {prefix:'E',floor:'Third',type:'Triple',cap:3},{prefix:'F',floor:'Fourth',type:'Double',cap:2},
    ];
    const rooms = [];
    for (const f of floors) for (let i=101;i<=120;i++) rooms.push({roomNo:`${f.prefix}${i}`,floor:f.floor,type:f.type,capacity:f.cap});
    await Room.insertMany(rooms);
    const feeStatuses = ['paid','pending','partial'];
    const sd = [
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
    const students = sd.map(([name,email,roomNo,branch,year]) => {
      const fs = feeStatuses[Math.floor(Math.random()*3)];
      return {name,email,password:'pass123',roomNo,branch,year,feeStatus:fs,feeAmount:50000,feePaid:fs==='paid'?50000:fs==='partial'?25000:0};
    });
    const inserted = await Student.insertMany(students);
    for (const s of inserted) await Room.updateOne({roomNo:s.roomNo},{$inc:{occupied:1}});
    await Complaint.insertMany([
      {studentId:inserted[0]._id,studentName:'Aarti Sharma',roomNo:'A101',title:'Water Leakage',complaint:'Water leaking.',status:'Pending'},
      {studentId:inserted[1]._id,studentName:'Priya Verma',roomNo:'A102',title:'Fan Not Working',complaint:'Fan stopped.',status:'In Progress'},
    ]);
    await Notice.insertMany([
      {title:'Hostel Day',description:'Annual hostel day on 20th April.',type:'Announcement',postedBy:'Ambar Jain'},
      {title:'Food Menu',description:'New mess menu from Monday.',type:'Food Menu',postedBy:'Riya Jain'},
    ]);
    return res.json({success:true, message:`Seeded: ${inserted.length} students, 120 rooms, admin+rector created`});
  } catch(e) { return res.status(500).json({success:false, message:e.message}); }
});

// ── Health ────────────────────────────────────────────────────
app.get('/', (_req, res) => res.json({
  status: 'ok',
  message: 'Hostel API (MongoDB)',
  mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  env: {
    port: PORT,
    mongoSet: !!process.env.MONGO_URI,
    jwtSet: !!process.env.JWT_SECRET,
  }
}));

// ── 404 handler ───────────────────────────────────────────────
app.use(function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ── Error handler ─────────────────────────────────────────────
app.use(function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error('Server error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Hostel API running`);
  console.log(`   http://localhost:${PORT}/api`);
});
