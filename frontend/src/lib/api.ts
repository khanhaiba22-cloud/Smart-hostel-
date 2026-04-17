// ─── API Base Configuration ───────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Debug: log the API URL in dev
if (import.meta.env.DEV) console.log('[API] Base URL:', BASE_URL);

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'rector' | 'student';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Student {
  _id: string;
  id: string;
  name: string;
  age?: number;
  year?: string | number;
  roomNo: string;
  branch: string;
  phone?: string;
  parentPhone?: string;
  address?: string;
  admissionYear?: number;
  photoUrl?: string;
  feeStatus: 'paid' | 'pending' | 'partial';
  feeAmount: number;
  feePaid: number;
  email?: string;
  gender?: 'male' | 'female' | 'other' | 'Female' | 'Male';
  createdAt: string;
  updatedAt?: string;
}

export interface Complaint {
  _id: string;
  id?: string;
  studentId?: string;
  studentName: string;
  roomNo: string;
  title?: string;
  complaint: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  resolvedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Notice {
  _id: string;
  title: string;
  description: string;
  type: 'Announcement' | 'Food Menu' | 'Maintenance' | 'General';
  date: string;
  postedBy?: string;
  createdAt: string;
}

export interface OwnerStats {
  totalStudents: number;
  pendingFeeStudents: number;
  totalPendingFees: number;
  activeComplaints: number;
  totalRooms: number;
  occupiedRooms: number;
  recentComplaints: Complaint[];
  feeBreakdown: { _id: string; count: number; totalAmount: number }[];
}

export interface RectorStats {
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  lateStudents: number;
  attendanceMarked: boolean;
  pendingComplaints: number;
  inProgressComplaints: number;
  recentComplaints: Complaint[];
  notices: Notice[];
}

export interface StudentStats {
  student: Student;
  myComplaints: Complaint[];
  notices: Notice[];
}

// ─── Storage Helpers ──────────────────────────────────────────────────────────
export const getToken = (): string | null => localStorage.getItem('hostel_token');
export const getUser = (): User | null => {
  const u = localStorage.getItem('hostel_user');
  return u ? JSON.parse(u) : null;
};
export const setAuth = (token: string, user: User) => {
  localStorage.setItem('hostel_token', token);
  localStorage.setItem('hostel_user', JSON.stringify(user));
};
export const clearAuth = () => {
  localStorage.removeItem('hostel_token');
  localStorage.removeItem('hostel_user');
};

// ─── Core Fetch Wrapper ───────────────────────────────────────────────────────
async function request<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const json = await res.json();

  if (!res.ok) {
    const msg = json?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json as T;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    request<ApiResponse<AuthResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, role: string) =>
    request<ApiResponse<AuthResponse>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),

  getMe: () => request<ApiResponse<{ user: User }>>('/auth/me'),
};

// ─── Students API ─────────────────────────────────────────────────────────────
export const studentsApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    branch?: string;
    feeStatus?: string;
    roomNo?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.search) qs.set('search', params.search);
    if (params?.branch) qs.set('branch', params.branch);
    if (params?.feeStatus) qs.set('feeStatus', params.feeStatus);
    if (params?.roomNo) qs.set('roomNo', params.roomNo);
    return request<PaginatedResponse<Student>>(`/students?${qs.toString()}`);
  },

  getById: (id: string) =>
    request<ApiResponse<{ student: Student }>>(`/students/${id}`),

  create: (data: Partial<Student>) =>
    request<ApiResponse<{ student: Student }>>('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Student>) =>
    request<ApiResponse<{ student: Student }>>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<ApiResponse<null>>(`/students/${id}`, { method: 'DELETE' }),
};

// ─── Complaints API ───────────────────────────────────────────────────────────
export const complaintsApi = {
  getAll: (params?: { status?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return request<PaginatedResponse<Complaint>>(`/complaints?${qs.toString()}`);
  },

  create: (data: { studentName: string; roomNo: string; complaint: string; studentId?: string; title?: string }) =>
    request<ApiResponse<{ complaint: Complaint }>>('/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: 'Pending' | 'In Progress' | 'Resolved') =>
    request<ApiResponse<{ complaint: Complaint }>>(`/complaints/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  delete: (id: string) =>
    request<ApiResponse<null>>(`/complaints/${id}`, { method: 'DELETE' }),
};

// ─── Notices API ──────────────────────────────────────────────────────────────
export const noticesApi = {
  getAll: (limit?: number) => {
    const qs = limit ? `?limit=${limit}` : '';
    return request<ApiResponse<{ notices: Notice[]; count: number }>>(`/notices${qs}`);
  },

  create: (data: {
    title: string;
    description: string;
    type?: string;
    date?: string;
    postedBy?: string;
  }) =>
    request<ApiResponse<{ notice: Notice }>>('/notices', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<ApiResponse<null>>(`/notices/${id}`, { method: 'DELETE' }),
};

// ─── Fee Structure API ────────────────────────────────────────────────────────
export interface FeeStructureEntry {
  id: number;
  course: string;
  year: string;
  amount: number;
}

export const feeStructureApi = {
  getAll: () => request<{ success: boolean; data: FeeStructureEntry[] }>('/fee-structure'),
  update: (course: string, year: string, amount: number) =>
    request<{ success: boolean; message: string }>('/fee-structure', {
      method: 'PUT',
      body: JSON.stringify({ course, year, amount }),
    }),
};

// ─── Attendance Types ─────────────────────────────────────────────────────────
export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'On Leave';

export interface AttendanceRecord {
  id?: number | string;
  studentId?: number | string;
  name: string;
  roomNo: string;
  branch: string;
  year: string;
  status: AttendanceStatus;
  note?: string;
  markedBy?: string;
  attendanceId?: number | null;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  onLeave: number;
  marked: number;
}

export interface AttendanceDateEntry {
  date: string;
  total: number;
  present: number;
  absent: number;
}

// ─── Attendance API ───────────────────────────────────────────────────────────
export const attendanceApi = {
  getByDate: (date: string) =>
    request<{ success: boolean; data: { date: string; students: AttendanceRecord[]; summary: AttendanceSummary } }>(`/attendance?date=${date}`),

  getDates: () =>
    request<{ success: boolean; data: AttendanceDateEntry[] }>('/attendance/dates'),

  getStudentHistory: (studentId: string) =>
    request<{ success: boolean; data: { date: string; status: AttendanceStatus; note: string; markedBy: string }[] }>(`/attendance/student/${studentId}`),

  saveBulk: (date: string, records: { studentId: string | number; status: AttendanceStatus; note?: string }[]) =>
    request<{ success: boolean; message: string; data: { date: string; summary: AttendanceSummary } }>('/attendance/bulk', {
      method: 'POST',
      body: JSON.stringify({ date, records }),
    }),
};

// ─── Profile API (student self-update) ───────────────────────────────────────
export const profileApi = {
  get: () => request<ApiResponse<{ student: Student }>>('/profile'),

  update: (data: { roomNo?: string; branch?: string; year?: string; phone?: string }) =>
    request<ApiResponse<{ student: Student }>>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  uploadPhoto: (file: File) => {
    const token = getToken();
    const form  = new FormData();
    form.append('photo', file);
    return fetch(`${BASE_URL}/profile/photo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }).then(r => r.json()) as Promise<ApiResponse<{ photoUrl: string; student: Student }>>;
  },
};

// ─── Dashboard API ────────────────────────────────────────────────────────────
export const dashboardApi = {
  getOwnerStats: () =>
    request<ApiResponse<OwnerStats>>('/dashboard/owner'),

  getWardenStats: () =>
    request<ApiResponse<RectorStats>>('/dashboard/warden'),

  getStudentStats: (studentId: string) =>
    request<ApiResponse<StudentStats>>(`/dashboard/student/${studentId}`),
};
