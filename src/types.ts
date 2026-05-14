export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  uid: string;
  name: string;
  email: string;
  phoneNumber?: string;
  username?: string;
  role: UserRole;
  profilePicUrl?: string;
  bloodGroup?: string;
  allergies?: string;
  emergencyContact?: string;
  createdAt: any;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  title: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: any;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  medicines: { name: string; dosage: string; frequency: string; duration: string }[];
  instructions: string;
  createdAt: any;
}

export interface DoctorProfile {
  userId: string;
  specialization: string;
  bio: string;
  fees: number;
  currency: string;
  experience: number;
  education: string[];
  licenses: string[];
  verified: boolean;
  hospitals: string[];
  availability: {
    days: string[];
    slots: string[];
  };
  rating: number;
  reviewCount: number;
  updatedAt: any;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  address: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName?: string;
  patientName?: string;
  hospitalId: string;
  hospitalName?: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: any;
}

export interface Review {
  id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  appointmentId: string;
  rating: number;
  comment: string;
  createdAt: any;
}
