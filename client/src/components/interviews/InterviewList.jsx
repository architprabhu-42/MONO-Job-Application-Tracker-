import { Link } from 'react-router-dom';
import { Clock, ExternalLink, MapPin, Pencil, Trash2, User } from 'lucide-react';
import { daysFromToday, formatDate, formatTime } from '../../utils/format.js';
import StatusBadge, { Tag } from '../ui/StatusBadge.jsx';

const isUrl = (text) => /^https?:\/\//i.test(text);

function DateBlock({ date }) {
  return (
    <div className={`date-block ${daysFromToday(date) === 0 ? 'is-today' : ''}`}>
      <span className="date-block-month">{formatDate(date, { month: 'short', day: undefined, year: undefined })}</span>
      <span className="date-block-day">{formatDate(date, { day: 'numeric', month: undefined, year: undefined })}</span>
    </div>
  );
}

// showApplication=false hides the company line (used on the application details page).
export default function InterviewList({ interviews, onEdit, onDelete, showApplication = true }) {
  return (
    <ul className="interview-list">
      {interviews.map((iv) => {
        const app = iv.applicationId;
        return (
          <li key={iv._id} className="interview-item">
            <DateBlock date={iv.date} />
            <div className="interview-main">
              <div className="interview-title-row">
                {showApplication && app ? (
                  <Link to={`/applications/${app._id}`} className="interview-company">
                    {app.company}
                    <span className="interview-position"> · {app.position}</span>
                  </Link>
                ) : (
                  <span className="interview-company">{iv.type} interview</span>
                )}
              </div>
              <div className="interview-meta">
                {showApplication && <Tag>{iv.type}</Tag>}
                <span>
                  <Clock size={13} /> {formatDate(iv.date, { weekday: 'short' })}
                  {iv.time && ` · ${formatTime(iv.time)}`}
                </span>
                {iv.interviewerName && (
                  <span>
                    <User size={13} /> {iv.interviewerName}
                  </span>
                )}
                {iv.meetingLink &&
                  (isUrl(iv.meetingLink) ? (
                    <a href={iv.meetingLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={13} /> Join link
                    </a>
                  ) : (
                    <span>
                      <MapPin size={13} /> {iv.meetingLink}
                    </span>
                  ))}
              </div>
              {iv.preparationNotes && <p className="interview-notes">{iv.preparationNotes}</p>}
            </div>
            <div className="interview-side">
              <StatusBadge status={iv.result} kind="result" />
              <div className="row-actions">
                <button type="button" className="icon-btn" onClick={() => onEdit(iv)} aria-label="Edit interview" title="Edit">
                  <Pencil size={16} />
                </button>
                <button type="button" className="icon-btn" onClick={() => onDelete(iv)} aria-label="Delete interview" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
