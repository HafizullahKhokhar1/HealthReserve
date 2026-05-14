import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
// import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Card, Button } from '../components/ui/core';
import { FileText, Upload, Trash2, Download, FileImage, FileCode, Plus } from 'lucide-react';
import { MedicalRecord } from '../types';
import { showToast } from '../lib/toast';

// To support actual file upload, we mock the firebase storage for UI purposes now 
// until we integrate real Firebase Storage buckets per user requirement.
export function MedicalRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'medicalRecords'), where('patientId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recs: MedicalRecord[] = [];
      snapshot.forEach(d => recs.push({ id: d.id, ...d.data() } as MedicalRecord));
      recs.sort((a, b) => b.uploadedAt?.seconds - a.uploadedAt?.seconds);
      setRecords(recs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (record: MedicalRecord) => {
    try {
      // 1. Delete from Firestore
      await deleteDoc(doc(db, 'medicalRecords', record.id));
      
      // 2. Delete from Storage (mocked for now)
      // const storage = getStorage();
      // const fileRef = ref(storage, record.fileUrl);
      // await deleteObject(fileRef);

      showToast({ title: 'Success', message: 'Record deleted', variant: 'info' });
    } catch (error) {
      console.error(error);
      showToast({ title: 'Error', message: 'Failed to delete record', variant: 'error' });
    }
  };

  if (!user || user.role !== 'patient') {
    return <div className="p-8 text-center">Unauthorized access.</div>;
  }

  return (
    <div className="p-4 md:p-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Medical Vault</h1>
          <p className="text-slate-500 font-medium">Securely store and manage your health records, lab reports, and prescriptions.</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)} icon={Plus}>
          Upload Record
        </Button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl" />)}
        </div>
      ) : records.length === 0 ? (
        <Card className="text-center py-20 bg-slate-50/20 border-dashed border-2 flex flex-col items-center dark:bg-slate-900/20 dark:border-slate-800">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6 dark:bg-slate-800 dark:text-slate-600">
            <FileText size={40} />
          </div>
          <p className="text-slate-400 font-bold text-xl mb-2 tracking-tight">No Records Found</p>
          <p className="text-slate-400/60 text-sm font-medium">Upload your first lab report or prescription to keep it safe.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map(record => (
            <RecordCard key={record.id} record={record} onDelete={() => handleDelete(record)} />
          ))}
        </div>
      )}

      {showUploadModal && (
        <UploadModal 
          onClose={() => setShowUploadModal(false)} 
          userId={user.uid}
        />
      )}
    </div>
  );
}

function RecordCard({ record, onDelete }: { record: MedicalRecord, onDelete: () => void }) {
  const isImage = record.fileType.startsWith('image/');
  const isPDF = record.fileType === 'application/pdf';

  return (
    <Card className="!p-6 flex flex-col hover:border-blue-200 dark:hover:border-blue-500/30 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-900/30 dark:text-blue-400">
          {isImage ? <FileImage size={24} /> : isPDF ? <FileText size={24} /> : <FileCode size={24} />}
        </div>
        <button onClick={onDelete} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors dark:hover:bg-rose-900/20">
          <Trash2 size={16} />
        </button>
      </div>
      <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 truncate">{record.title}</h3>
      <p className="text-xs text-slate-500 mb-4 font-medium uppercase tracking-widest">{new Date(record.uploadedAt?.seconds * 1000).toLocaleDateString()}</p>
      
      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
        <a 
          href={record.fileUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
        >
          <Download size={16} />
          View / Download
        </a>
      </div>
    </Card>
  );
}

function UploadModal({ onClose, userId }: { onClose: () => void, userId: string }) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!title || !file) return;
    setLoading(true);

    try {
      // MOCK UPLOAD LOGIC FOR NOW (will be replaced with actual Firebase Storage)
      // const storage = getStorage();
      // const fileRef = ref(storage, `medicalRecords/${userId}/${Date.now()}_${file.name}`);
      // await uploadBytes(fileRef, file);
      // const url = await getDownloadURL(fileRef);

      const mockUrl = URL.createObjectURL(file); // Temporary mock URL for prototype

      const record: Omit<MedicalRecord, 'id'> = {
        patientId: userId,
        title,
        fileUrl: mockUrl,
        fileType: file.type,
        uploadedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'medicalRecords'), record);
      showToast({ title: 'Success', message: 'Record uploaded securely', variant: 'success' });
      onClose();
    } catch (error) {
      console.error(error);
      showToast({ title: 'Error', message: 'Upload failed', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6 dark:bg-slate-950/60">
      <Card className="max-w-md w-full !p-8">
        <h2 className="text-2xl font-bold mb-6 dark:text-slate-100">Upload Record</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Document Title</label>
            <input 
              className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:text-white"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Blood Test Results (Jan 2026)"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Select File</label>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <input 
                type="file" 
                id="fileUpload" 
                className="hidden" 
                onChange={e => setFile(e.target.files?.[0] || null)}
                accept="image/*,application/pdf"
              />
              <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3 dark:bg-blue-900/30 dark:text-blue-400">
                  <Upload size={20} />
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {file ? file.name : 'Click to browse files'}
                </span>
                <span className="text-xs text-slate-400 mt-1">PDF, JPG, PNG (Max 5MB)</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={handleUpload} loading={loading} disabled={!title || !file}>
              Upload Securely
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
