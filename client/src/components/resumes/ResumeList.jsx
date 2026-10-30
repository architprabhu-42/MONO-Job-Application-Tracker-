import { Download, ExternalLink, FileText, Pencil, Trash2 } from 'lucide-react';
import { resumeFileUrl } from '../../services/api.js';
import { formatDate, formatFileSize } from '../../utils/format.js';
import { Tag } from '../ui/StatusBadge.jsx';

export default function ResumeList({ resumes, onEdit, onDelete }) {
  return (
    <div className="row g-3">
      {resumes.map((resume) => (
        <div key={resume._id} className="col-md-6 col-xl-4">
          <article className="resume-card">
            <div className="resume-card-head">
              <span className="resume-file-icon">
                <FileText size={20} strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-grow-1">
                <h3 className="resume-name" title={resume.name}>
                  {resume.name}
                </h3>
                <span className="version-label">{resume.version}</span>
              </div>
            </div>

            <p className={`resume-description ${resume.description ? '' : 'text-muted-mono'}`}>
              {resume.description || 'No description'}
            </p>

            {resume.skillsTargeted?.length > 0 && (
              <div className="tag-row">
                {resume.skillsTargeted.map((skill) => (
                  <Tag key={skill}>{skill}</Tag>
                ))}
              </div>
            )}

            <dl className="resume-meta">
              <div>
                <dt>Uploaded</dt>
                <dd>{formatDate(resume.createdAt)}</dd>
              </div>
              <div>
                <dt>Size</dt>
                <dd>{formatFileSize(resume.fileSize)}</dd>
              </div>
              <div>
                <dt>Used in</dt>
                <dd>
                  {resume.usageCount} application{resume.usageCount === 1 ? '' : 's'}
                </dd>
              </div>
            </dl>

            <div className="resume-card-foot">
              <a className="mbtn mbtn-secondary mbtn-sm" href={resumeFileUrl(resume._id)} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={15} /> <span>Preview</span>
              </a>
              <a className="mbtn mbtn-ghost mbtn-sm" href={resumeFileUrl(resume._id, { download: true })}>
                <Download size={15} /> <span>Download</span>
              </a>
              <div className="row-actions ms-auto">
                <button type="button" className="icon-btn" onClick={() => onEdit(resume)} aria-label={`Edit ${resume.name}`} title="Edit">
                  <Pencil size={16} />
                </button>
                <button type="button" className="icon-btn" onClick={() => onDelete(resume)} aria-label={`Delete ${resume.name}`} title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </article>
        </div>
      ))}
    </div>
  );
}
