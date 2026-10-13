import React, { useState, useRef } from 'react';
import { api } from '../../api/client';
import { Upload, FileText, CheckCircle, Trash2, Loader2, AlertCircle } from 'lucide-react';

interface ResumeData {
  id: string;
  originalFilename: string;
  fileSizeBytes: number;
  detectedSkills: string[];
  skillsEvidence: { canonicalName: string; matchedAlias: string; category: string; evidenceSnippet: string }[];
  textLength: number;
  previewSnippet: string;
  updatedAt: string;
}

interface ResumeUploaderProps {
  currentResume: ResumeData | null;
  onUploadSuccess: (resume: ResumeData) => void;
  onDeleteSuccess: () => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  currentResume,
  onUploadSuccess,
  onDeleteSuccess,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    // Validate type and size
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a standard text-based PDF (.pdf) file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setLoading(true);
    try {
      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        onUploadSuccess(res.data.resume);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload and parse resume PDF.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your stored resume and extracted text?')) {
      return;
    }
    setLoading(true);
    try {
      await api.delete('/resume');
      onDeleteSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to delete resume.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            Student Resume & Extracted Skills
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload your PDF resume once to run instant, explainable skill-gap matching across any internship.
          </p>
        </div>

        {currentResume && (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 flex items-center gap-1.5 transition-colors"
            title="Delete stored resume and privacy data"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Resume
          </button>
        )}
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={e => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-teal-500 bg-teal-50/50'
            : 'border-slate-300 hover:border-teal-400 bg-slate-50/50 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={e => {
            if (e.target.files?.[0]) handleFile(e.target.files[0]);
          }}
        />

        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-teal-100/60 text-teal-700 flex items-center justify-center mb-3">
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
          </div>
          <p className="text-sm font-semibold text-slate-800">
            {currentResume ? 'Click or drop to replace your PDF resume' : 'Click or drop your PDF resume here'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Standard text-based PDF only • Max 5MB • Scanned image PDFs are rejected
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Existing Resume Summary & Detected Skills */}
      {currentResume && (
        <div className="mt-6 border-t border-slate-100 pt-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 font-medium">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>{currentResume.originalFilename}</span>
              <span className="text-slate-400">({Math.round(currentResume.fileSizeBytes / 1024)} KB)</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Analyzed: {new Date(currentResume.updatedAt).toLocaleDateString('en-IN')}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Detected Skills in Resume ({currentResume.detectedSkills.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {currentResume.detectedSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1"
                >
                  <CheckCircle className="w-3 h-3 text-teal-600" />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
