import { Link, useNavigate } from 'react-router-dom';
import { Eye, FileText, Pencil, Trash2 } from 'lucide-react';
import { daysAgoLabel, formatDate } from '../../utils/format.js';
import StatusBadge from '../ui/StatusBadge.jsx';

export function ResumeCell({ resume }) {
  if (!resume) return <span className="text-muted-mono">—</span>;
  return (
    <span className="resume-chip" title={`${resume.name} — ${resume.version}`}>
      <FileText size={13} />
      <span className="text-truncate">{resume.name}</span>
      <span className="resume-chip-version">{resume.version}</span>
    </span>
  );
}

function RowActions({ app, onEdit, onDelete }) {
  return (
    <div className="row-actions" onClick={(e) => e.stopPropagation()}>
      <Link to={`/applications/${app._id}`} className="icon-btn" aria-label={`View ${app.company}`} title="View">
        <Eye size={16} />
      </Link>
      <button type="button" className="icon-btn" onClick={() => onEdit(app)} aria-label={`Edit ${app.company}`} title="Edit">
        <Pencil size={16} />
      </button>
      <button type="button" className="icon-btn" onClick={() => onDelete(app)} aria-label={`Delete ${app.company}`} title="Delete">
        <Trash2 size={16} />
      </button>
    </div>
  );
}

// Table on desktop, stacked cards on mobile.
export default function ApplicationTable({ applications, onEdit, onDelete }) {
  const navigate = useNavigate();

  return (
    <>
      <div className="table-wrap d-none d-md-block">
        <table className="table-mono">
          <thead>
            <tr>
              <th>Company</th>
              <th>Job title</th>
              <th className="d-none d-xxl-table-cell">Job type</th>
              <th>Date applied</th>
              <th>Status</th>
              <th>Resume version</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app._id} className="row-link" onClick={() => navigate(`/applications/${app._id}`)}>
                <td>
                  <span className="cell-strong">{app.company}</span>
                  {app.location && <span className="cell-sub">{app.location}</span>}
                </td>
                <td>
                  {app.position}
                  <span className="cell-sub d-xxl-none">{app.jobType}</span>
                </td>
                <td className="d-none d-xxl-table-cell">{app.jobType}</td>
                <td className="text-nowrap">
                  <span>{formatDate(app.dateApplied)}</span>
                  <span className="cell-sub">{daysAgoLabel(app.dateApplied)}</span>
                </td>
                <td>
                  <StatusBadge status={app.status} />
                </td>
                <td className="cell-resume">
                  <ResumeCell resume={app.resumeId} />
                </td>
                <td className="text-end">
                  <RowActions app={app} onEdit={onEdit} onDelete={onDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="card-list d-md-none">
        {applications.map((app) => (
          <li key={app._id} className="list-card" onClick={() => navigate(`/applications/${app._id}`)}>
            <div className="d-flex justify-content-between align-items-start gap-2">
              <div className="min-w-0">
                <div className="cell-strong">{app.company}</div>
                <div className="cell-sub">{app.position}</div>
              </div>
              <StatusBadge status={app.status} />
            </div>
            <div className="list-card-meta">
              <span>{app.jobType}</span>
              <span>Applied {formatDate(app.dateApplied)}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center gap-2">
              <ResumeCell resume={app.resumeId} />
              <RowActions app={app} onEdit={onEdit} onDelete={onDelete} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
