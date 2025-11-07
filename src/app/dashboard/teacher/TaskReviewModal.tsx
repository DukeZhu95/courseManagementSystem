'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { X, Download, FileText, CheckCircle, Clock, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface TaskReviewModalProps {
  taskId: Id<'tasks'>;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskReviewModal({ taskId, isOpen, onClose }: TaskReviewModalProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<Id<'taskSubmissions'> | null>(null);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState('');

  // Get task details
  const task = useQuery(api.tasks.getTaskById, { taskId });

  // Get all submissions
  const submissions = useQuery(api.tasks.getTaskSubmissions, { taskId });

  // Grade submission mutation
  const gradeSubmission = useMutation(api.tasks.gradeSubmission);

  if (!isOpen) return null;

  const handleGrade = async () => {
    if (!selectedSubmission) return;

    try {
      await gradeSubmission({
        submissionId: selectedSubmission,
        feedback,
        score: score ? parseInt(score) : undefined,
      });

      toast.success('Graded successfully!');
      setFeedback('');
      setScore('');
      setSelectedSubmission(null);
    } catch (error) {
      toast.error('Failed to grade, please try again');
    }
  };

  const selectedSub = submissions?.find(s => s._id === selectedSubmission);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{task?.title}</h2>
            <p className="modal-subtitle">
              {task?.className} • {task?.classCode}
            </p>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body-split">
          {/* Left: Student Submissions List */}
          <div className="submissions-list">
            <h3 className="section-title">
              Student Submissions ({submissions?.length || 0})
            </h3>

            <div className="submissions-scroll">
              {submissions?.map((submission) => (
                <div
                  key={submission._id}
                  className={`submission-item ${selectedSubmission === submission._id ? 'selected' : ''}`}
                  onClick={() => setSelectedSubmission(submission._id)}
                >
                  <div className="submission-header">
                    <div className="student-info">
                      <User size={16} />
                      <span className="student-name">
                        {submission.studentName || 'Student'}
                      </span>
                    </div>
                    {submission.status === 'graded' && (
                      <CheckCircle size={16} className="graded-icon" />
                    )}
                  </div>

                  <div className="submission-meta">
                    <Clock size={14} />
                    <span className="submit-time">
                      {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {submission.grade !== undefined && (
                    <div className="submission-score">
                      Score: {submission.grade}
                    </div>
                  )}
                </div>
              ))}

              {(!submissions || submissions.length === 0) && (
                <div className="empty-state">
                  <FileText size={48} opacity={0.3} />
                  <p>No submissions yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Grading Panel */}
          <div className="grading-panel">
            {selectedSub ? (
              <>
                <h3 className="section-title">Grade Submission</h3>

                {/* Student Info */}
                <div className="student-card">
                  <div className="student-avatar">
                    {selectedSub.studentName?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <div className="student-name-large">
                      {selectedSub.studentName || 'Student'}
                    </div>
                    <div className="submit-date">
                      Submitted at {new Date(selectedSub.submittedAt).toLocaleString('en-US')}
                    </div>
                  </div>
                </div>

                {/* Student Answer */}
                <div className="submission-content">
                  <label className="form-label">Student Answer</label>
                  <div className="content-display">
                    {selectedSub.content || '(No content)'}
                  </div>
                </div>

                {/* Attachments */}
                {selectedSub.files && selectedSub.files.length > 0 && (
                  <div className="files-section">
                    <label className="form-label">Attachments</label>
                    <div className="files-list">
                      {selectedSub.files.map((file: { name: string; url: string }, index: number) => (
                        <a
                          key={index}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="file-item"
                        >
                          <Download size={16} />
                          <span>{file.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grading Form */}
                <div className="grading-form">
                  <div className="form-group">
                    <label className="form-label">Score (Optional)</label>
                    <input
                      type="number"
                      className="score-input"
                      placeholder="Enter score"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      disabled={selectedSub.status === 'graded'}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Feedback</label>
                    <textarea
                      className="feedback-textarea"
                      placeholder="Feedback for student..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={4}
                      disabled={selectedSub.status === 'graded'}
                    />
                  </div>

                  {selectedSub.status === 'graded' ? (
                    <div className="graded-notice">
                      <CheckCircle size={20} />
                      <div>
                        <div className="graded-text">Graded</div>
                        {selectedSub.feedback && (
                          <div className="existing-feedback">
                            Feedback: {selectedSub.feedback}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleGrade}
                      className="grade-btn"
                      disabled={!feedback.trim()}
                    >
                      Submit Grade
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <FileText size={48} opacity={0.3} />
                <p>Select a submission from the left to grade</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content-large {
          background: linear-gradient(135deg, #f8f4ff 0%, #fff 100%);
          border-radius: 24px;
          width: 100%;
          max-width: 1200px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px rgba(139, 92, 246, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 24px 32px;
          border-bottom: 1px solid rgba(139, 92, 246, 0.1);
        }

        .modal-title {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .modal-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-top: 4px;
        }

        .modal-close-btn {
          background: rgba(139, 92, 246, 0.1);
          border: none;
          border-radius: 12px;
          padding: 8px;
          cursor: pointer;
          color: #8b5cf6;
          transition: all 0.2s;
        }

        .modal-close-btn:hover {
          background: rgba(139, 92, 246, 0.2);
          transform: scale(1.05);
        }

        .modal-body-split {
          display: grid;
          grid-template-columns: 350px 1fr;
          flex: 1;
          overflow: hidden;
        }

        .submissions-list {
          border-right: 1px solid rgba(139, 92, 246, 0.1);
          padding: 24px;
          display: flex;
          flex-direction: column;
          background: rgba(139, 92, 246, 0.03);
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 16px 0;
        }

        .submissions-scroll {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .submission-item {
          background: white;
          border: 2px solid rgba(139, 92, 246, 0.1);
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .submission-item:hover {
          border-color: rgba(139, 92, 246, 0.3);
          transform: translateX(4px);
        }

        .submission-item.selected {
          background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
          border-color: #8b5cf6;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
        }

        .submission-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .student-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #1f2937;
        }

        .student-name {
          font-weight: 600;
          font-size: 14px;
        }

        .graded-icon {
          color: #10b981;
        }

        .submission-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
          font-size: 12px;
        }

        .submission-score {
          margin-top: 8px;
          padding: 4px 12px;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #8b5cf6;
          display: inline-block;
        }

        .grading-panel {
          padding: 24px 32px;
          overflow-y: auto;
        }

        .student-card {
          background: white;
          border: 1px solid rgba(139, 92, 246, 0.1);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .student-avatar {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 20px;
        }

        .student-name-large {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .submit-date {
          font-size: 13px;
          color: #6b7280;
          margin-top: 2px;
        }

        .submission-content {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .content-display {
          background: white;
          border: 1px solid rgba(139, 92, 246, 0.1);
          border-radius: 12px;
          padding: 16px;
          min-height: 100px;
          color: #1f2937;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .files-section {
          margin-bottom: 24px;
        }

        .files-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .file-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: white;
          border: 1px solid rgba(139, 92, 246, 0.1);
          border-radius: 8px;
          color: #8b5cf6;
          text-decoration: none;
          transition: all 0.2s;
        }

        .file-item:hover {
          background: rgba(139, 92, 246, 0.05);
          border-color: #8b5cf6;
        }

        .grading-form {
          background: white;
          border: 1px solid rgba(139, 92, 246, 0.1);
          border-radius: 12px;
          padding: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .score-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid rgba(139, 92, 246, 0.2);
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
        }

        .score-input:focus {
          outline: none;
          border-color: #8b5cf6;
        }

        .score-input:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }

        .feedback-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid rgba(139, 92, 246, 0.2);
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          transition: all 0.2s;
        }

        .feedback-textarea:focus {
          outline: none;
          border-color: #8b5cf6;
        }

        .feedback-textarea:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }

        .grade-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .grade-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(139, 92, 246, 0.3);
        }

        .grade-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .graded-notice {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 8px;
          color: #059669;
        }

        .graded-text {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .existing-feedback {
          font-size: 13px;
          color: #6b7280;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #9ca3af;
          gap: 12px;
        }

        .empty-state p {
          margin: 0;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}