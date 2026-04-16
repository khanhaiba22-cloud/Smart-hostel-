'use strict';
const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
});

const WardenSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
});

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, default: 'pass123' },
  roomNo: { type: String, default: '' },
  branch: { type: String, default: 'Engineering' },
  year: { type: String, default: '1st Year' },
  gender: { type: String, default: 'Female' },
  phone: { type: String, default: '' },
  parentPhone: { type: String, default: '' },
  address: { type: String, default: '' },
  admissionYear: { type: Number, default: 2024 },
  feeStatus: { type: String, enum: ['paid','pending','partial'], default: 'pending' },
  feeAmount: { type: Number, default: 50000 },
  feePaid: { type: Number, default: 0 },
  photoUrl: { type: String, default: '' },
}, { timestamps: true });

const RoomSchema = new mongoose.Schema({
  roomNo: { type: String, unique: true, required: true },
  floor: { type: String, default: 'Ground' },
  type: { type: String, default: 'Double' },
  capacity: { type: Number, default: 2 },
  occupied: { type: Number, default: 0 },
  status: { type: String, enum: ['available','full','maintenance'], default: 'available' },
}, { timestamps: true });

const ComplaintSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentName: { type: String, required: true },
  roomNo: { type: String, required: true },
  title: { type: String, default: 'General Complaint' },
  complaint: { type: String, required: true },
  status: { type: String, enum: ['Pending','In Progress','Resolved'], default: 'Pending' },
  resolvedAt: Date,
}, { timestamps: true });

const NoticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['General','Announcement','Food Menu','Maintenance'], default: 'General' },
  date: { type: Date, default: Date.now },
  postedBy: { type: String, default: '' },
}, { timestamps: true });

const AttendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  status: { type: String, enum: ['Present','Absent','Late','On Leave'], default: 'Absent' },
  markedBy: { type: String, default: '' },
  note: { type: String, default: '' },
}, { timestamps: true });
AttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

const FeeStructureSchema = new mongoose.Schema({
  course: { type: String, required: true },
  year: { type: String, required: true },
  amount: { type: Number, default: 50000 },
}, { timestamps: true });
FeeStructureSchema.index({ course: 1, year: 1 }, { unique: true });

module.exports = {
  Admin:        mongoose.model('Admin',        AdminSchema),
  Warden:       mongoose.model('Warden',       WardenSchema),
  Student:      mongoose.model('Student',      StudentSchema),
  Room:         mongoose.model('Room',         RoomSchema),
  Complaint:    mongoose.model('Complaint',    ComplaintSchema),
  Notice:       mongoose.model('Notice',       NoticeSchema),
  Attendance:   mongoose.model('Attendance',   AttendanceSchema),
  FeeStructure: mongoose.model('FeeStructure', FeeStructureSchema),
};
