import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarPlus,
  Download,
  ExternalLink,
  FileText,
  Mail,
  Pencil,
  Trash2,
  User,
} from 'lucide-react';
import ApplicationForm from '../components/applications/ApplicationForm.jsx';
import InterviewForm from '../components/interviews/InterviewForm.jsx';
import InterviewList from '../components/interviews/InterviewList.jsx';
import Button from '../components/ui/Button.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import Panel from '../components/ui/Panel.jsx';
import Select from '../components/ui/Select.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { applicationsApi, getErrorMessage, interviewsApi, resumeFileUrl } from '../services/api.js';
import { APPLICATION_STATUSES } from '../utils/constants.js';
import { daysAgoLabel, daysFromToday, formatDate } from '../utils/format.js';

function Detail({ label, children }) {
  return (
    <div className="detail">
      <dt>{label}</dt>
      <dd>{children || <span className="text-muted-mono">—</span>}</dd>
    </div>
  );
}

export default function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data, loading, error, status, reload, setData } = useAsync(() => applicationsApi.get(id), [id]);

  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [interviewForm, setInterviewForm] = useState({ open: false, interview: null });
  const [interviewToDelete, setInterviewToDelete] = useState(null);
  const [deletingInterview, setDeletingInterview] = useState(false);

  if (loading && !data) return <LoadingState label="Loading application…" />;
  if (error && !data) {
    const notFound = status === 404 || status === 400;
    return (
      <ErrorState
        title={notFound ? 'Application not found' : 'Could not load application'}
        message={notFound ? 'It may have been deleted, or the link is incorrect.' : error}
        onRetry={notFound ? undefined : reload}
        action={<Button variant="secondary" icon={ArrowLeft} to="/applications">Back to applications</Button>}
      />
    );
  }

  const { application: app, interviews } = data;
  const resume = app.resumeId;
  const followUpDays = daysFromToday(app.followUpDate);

  async function changeStatus(e) {
    const newStatus = e.target.value;
    setStatusSaving(true);
    try {
      const updated = await applicationsApi.updateStatus(app._id, newStatus);
      setData((d) => ({ ...d, application: updated }));
      toast.success(`Status changed to ${newStatus}.`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setStatusSaving(false);
    }
  }

  async function deleteApplication() {
    setDeleting(true);
    try {
      await applicationsApi.remove(app._id);
      toast.success(`Deleted ${app.company} application.`);
      navigate('/applications', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDeleting(false);
    }
  }

  async function deleteInterview() {
    setDeletingInterview(true);
    try {
      await interviewsApi.remove(interviewToDelete._id);
      toast.success('Interview deleted.');
      setInterviewToDelete(null);
      reload({ silent: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeletingInterview(false);
    }
  }

  return (
    <>
      <Link to="/applications" className="back-link">
        <ArrowLeft size={15} /> Applications
      </Link>

      <div className="page-header">
        <div className="page-header-text">
          <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
            <h1 className="page-title mb-0">{app.company}</h1>
            <StatusBadge status={app.status} />
          </div>
          <p className="page-description">
            {app.position}
            {app.location && ` · ${app.location}`}
          </p>
        </div>
        <div className="page-actions">
          <Button variant="secondary" icon={Trash2} onClick={() => setConfirmOpen(true)}>
            Delete
          </Button>
          <Button variant="secondary" icon={Pencil} onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button icon={CalendarPlus} onClick={() => setInterviewForm({ open: true, interview: null })}>
            Schedule interview
          </Button>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8 d-flex flex-column gap-4">
          <Panel title="Overview">
            <dl className="detail-grid">
              <Detail label="Date applied">
                {formatDate(app.dateApplied)} <span className="text-muted-mono">· {daysAgoLabel(app.dateApplied)}</span>
              </Detail>
              <Detail label="Job type">{app.jobType}</Detail>
              <Detail label="Work arrangement">{app.workArrangement}</Detail>
              <Detail label="Location">{app.location}</Detail>
              <Detail label="Salary range">{app.salaryRange}</Detail>
              <Detail label="Next follow-up">
                {app.followUpDate && (
                  <>
                    {formatDate(app.followUpDate)}
                    {followUpDays > 0 && <span className="followup-due is-due ms-2">Overdue</span>}
                    {followUpDays === 0 && <span className="followup-due is-due ms-2">Today</span>}
                  </>
                )}
              </Detail>
              <Detail label="Job posting">
                {app.jobUrl && (
                  <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="external-link">
                    {new URL(app.jobUrl).hostname.replace(/^www\./, '')} <ExternalLink size={13} />
                  </a>
                )}
              </Detail>
              <Detail label="Last updated">{formatDate(app.updatedAt)}</Detail>
            </dl>
          </Panel>

          <Panel title="Job description">
            {app.jobDescription ? (
              <p className="prose-text">{app.jobDescription}</p>
            ) : (
              <p className="text-muted-mono mb-0">No job description saved.</p>
            )}
          </Panel>

          <Panel title="Notes">
            {app.notes ? <p className="prose-text">{app.notes}</p> : <p className="text-muted-mono mb-0">No notes yet.</p>}
          </Panel>

          <Panel
            title="Interviews"
            description={`${interviews.length} interview${interviews.length === 1 ? '' : 's'} for this application.`}
            actions={
              <Button size="sm" variant="secondary" icon={CalendarPlus} onClick={() => setInterviewForm({ open: true, interview: null })}>
                Add
              </Button>
            }
            flush
          >
            {interviews.length === 0 ? (
              <EmptyState compact icon={CalendarPlus} title="No interviews yet" description="Schedule one when you hear back." />
            ) : (
              <InterviewList
                interviews={interviews}
                showApplication={false}
                onEdit={(interview) => setInterviewForm({ open: true, interview })}
                onDelete={setInterviewToDelete}
              />
            )}
          </Panel>
        </div>

        <div className="col-lg-4 d-flex flex-column gap-4">
          <Panel title="Status">
            <Select
              aria-label="Application status"
              options={APPLICATION_STATUSES}
              value={app.status}
              onChange={changeStatus}
              disabled={statusSaving}
              hint={statusSaving ? 'Saving…' : 'Changes are saved immediately.'}
            />
          </Panel>

          <Panel title="Resume used">
            {resume ? (
              <div className="side-resume">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <span className="resume-file-icon">
                    <FileText size={18} strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <div className="cell-strong text-truncate">{resume.name}</div>
                    <span className="version-label">{resume.version}</span>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <a className="mbtn mbtn-secondary mbtn-sm" href={resumeFileUrl(resume._id)} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={15} /> <span>Open PDF</span>
                  </a>
                  <a className="mbtn mbtn-ghost mbtn-sm" href={resumeFileUrl(resume._id, { download: true })}>
                    <Download size={15} /> <span>Download</span>
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-muted-mono mb-0">
                No resume linked.{' '}
                <button type="button" className="link-btn d-inline-flex" onClick={() => setEditOpen(true)}>
                  Link one
                </button>
              </p>
            )}
          </Panel>

          <Panel title="Recruiter">
            {app.recruiterName || app.recruiterEmail ? (
              <ul className="contact-list">
                {app.recruiterName && (
                  <li>
                    <User size={15} /> {app.recruiterName}
                  </li>
                )}
                {app.recruiterEmail && (
                  <li>
                    <Mail size={15} /> <a href={`mailto:${app.recruiterEmail}`}>{app.recruiterEmail}</a>
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-muted-mono mb-0">No recruiter details.</p>
            )}
          </Panel>
        </div>
      </div>

      <ApplicationForm
        open={editOpen}
        application={app}
        onClose={() => setEditOpen(false)}
        onSaved={() => reload({ silent: true })}
      />

      <InterviewForm
        open={interviewForm.open}
        interview={interviewForm.interview}
        defaultApplicationId={app._id}
        onClose={() => setInterviewForm({ open: false, interview: null })}
        onSaved={() => reload({ silent: true })}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete application?"
        message={
          <>
            <strong>{app.company} — {app.position}</strong>
            {interviews.length > 0
              ? ` and its ${interviews.length} interview${interviews.length === 1 ? '' : 's'} will be permanently deleted.`
              : ' will be permanently deleted.'}
          </>
        }
        loading={deleting}
        onConfirm={deleteApplication}
        onCancel={() => setConfirmOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(interviewToDelete)}
        title="Delete interview?"
        message={interviewToDelete && `The ${interviewToDelete.type} interview on ${formatDate(interviewToDelete.date)} will be permanently deleted.`}
        loading={deletingInterview}
        onConfirm={deleteInterview}
        onCancel={() => setInterviewToDelete(null)}
      />
    </>
  );
}
