import React from 'react';
import { AlumniReview } from '@internfit/shared';
import { CheckCircle, GraduationCap, Star } from 'lucide-react';

interface AlumniReviewCardProps {
  review: AlumniReview;
}

export const AlumniReviewCard: React.FC<AlumniReviewCardProps> = ({ review }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
      {/* Reviewer Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-900">{review.reviewerName || 'Alumnus'}</span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                <CheckCircle className="w-2.5 h-2.5" />
                Verified Alumni
              </span>
            </div>
            {review.currentRole && review.currentCompany && (
              <span className="text-xs text-slate-500 block">
                {review.currentRole} at {review.currentCompany}
                {review.graduationYear ? ` (Batch of '${review.graduationYear.toString().slice(-2)})` : ''}
              </span>
            )}
          </div>
        </div>

        <span className="text-[11px] text-slate-400">
          {new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
        </span>
      </div>

      {/* Ratings */}
      {(review.workCultureRating || review.learningRating) && (
        <div className="flex items-center gap-4 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          {review.workCultureRating && (
            <div className="flex items-center gap-1">
              <span className="text-slate-500">Culture:</span>
              <span className="font-bold text-slate-800 flex items-center gap-0.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                {review.workCultureRating}/5
              </span>
            </div>
          )}
          {review.learningRating && (
            <div className="flex items-center gap-1">
              <span className="text-slate-500">Learning:</span>
              <span className="font-bold text-slate-800 flex items-center gap-0.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                {review.learningRating}/5
              </span>
            </div>
          )}
        </div>
      )}

      {/* Review Text */}
      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
        {review.reviewText}
      </p>

      {/* Application Advice */}
      {review.applicationAdvice && (
        <div className="p-3 bg-teal-50/50 border border-teal-100 rounded-lg text-xs text-teal-900 space-y-1">
          <span className="font-bold block uppercase tracking-wider text-[10px] text-teal-700">
            Advice for Student Applicants:
          </span>
          <p className="italic leading-relaxed">{review.applicationAdvice}</p>
        </div>
      )}
    </div>
  );
};
