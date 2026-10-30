import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Award,
  Bell,
  Briefcase,
  CalendarDays,
  CalendarPlus,
  FileUp,
  Hourglass,
  Plus,
} from 'lucide-react';
import ApplicationForm from '../components/applications/ApplicationForm.jsx';
import { ResumeCell } from '../components/applications/ApplicationTable.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import Panel from '../components/ui/Panel.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { dashboardApi } from '../services/api.js';
import { APPLICATION_STATUSES } from '../utils/constants.js';
import { daysFromToday, formatDate, formatTime } from '../utils/format.js';

function StatusOverview({ counts, total }) {
  const max = Math.max(1, ...Object.values(counts));
  return (
    <ul className="bar-chart">
      {APPLICATION_STATUSES.map((status) => {
        const count = counts[status] || 0;
        const share = total ? Math.round((count / total) * 100) : 0;
        return (
          <li key={status} className="bar-row">
            <span className="bar-label">
              <span className={`badge-dot dot-${status.toLowerCase().replace(/\s+/g, '-')}`} aria-hidden="true" />
              {status}
            </span>
            <span className="bar-track">
              <span
                className={`bar-fill bar-${status.toLowerCase().replace(/\s+/g, '-')}`}
                style={{ width: `${(count / max) * 100}%` }}
              />
            </span>
            <span className="bar-value">
              {count}
              <span className="bar-share">{share}%</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function followUpLabel(date) {
  const days = daysFromToday(date);
  if (days > 0) return `Overdue by ${days} day${days === 1 ? '' : 's'}`;
  if (days === 0) return 'Due today';
  return `Due ${formatDate(date, { year: undefined })}`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const { data: stats, loading, error, reload } = useAsync(() => dashboardApi.stats(), []);

  const firstName = user?.name?.split(' ')[0];

  const header = (
    <PageHeader
      title={`Welcome back${firstName ? `, ${firstName}` : ''}`}
      description="Here's an overview of your job search."
      actions={
        <Button icon={Plus} onClick={() => setFormOpen(true)}>
          Add application
        </Button>
      }
    />
  );

  if (loading && !stats) return (<>{header}<LoadingState label="Loading your dashboard…" /></>);
  if (error && !stats) return (<>{header}<ErrorState message={error} onRetry={reload} /></>);

  const isNewUser = stats.totalApplications === 0;

  return (
    <>
      {header}

      <div className="row g-3 mb-4">
        <div className="col-6 col-xl-3">
          <StatCard label="Total applications" value={stats.totalApplications} icon={Briefcase} hint={`${stats.totalResumes} resume version${stats.totalResumes === 1 ? '' : 's'}`} />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard label="In progress" value={stats.inProgress} icon={Hourglass} hint="Applied, under review or interviewing" />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard label="Interviews scheduled" value={stats.interviewsScheduled} icon={CalendarDays} hint={`${stats.totalInterviews} interview${stats.totalInterviews === 1 ? '' : 's'} logged`} />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard label="Offers received" value={stats.offers} icon={Award} hint={stats.totalApplications ? `${Math.round((stats.offers / stats.totalApplications) * 100)}% offer rate` : 'No applications yet'} />
        </div>
      </div>

      {isNewUser && (
        <Panel className="mb-4">
          <EmptyState
            icon={Briefcase}
            title="Start tracking your job search"
            description="Add your first application, upload a resume version, and MONO will build your overview automatically."
            action={
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                <Button icon={Plus} onClick={() => setFormOpen(true)}>Add application</Button>
                <Button variant="secondary" icon={FileUp} to="/resumes?new=1">Upload resume</Button>
              </div>
            }
          />
        </Panel>
      )}

      <div className="row g-4">
        <div className="col-xxl-8">
          <Panel
            title="Recent applications"
            description="Your five most recent applications."
            flush
            actions={<Link to="/applications" className="panel-link">View all <ArrowUpRight size={14} /></Link>}
          >
            {stats.recentApplications.length === 0 ? (
              <EmptyState compact icon={Briefcase} title="No applications yet" description="Applications you add will appear here." />
            ) : (
              <div className="table-wrap">
                <table className="table-mono">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th className="d-none d-sm-table-cell">Date applied</th>
                      <th>Status</th>
                      <th className="d-none d-lg-table-cell">Resume used</th>
                      <th className="text-end"><span className="visually-hidden">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentApplications.map((app) => (
                      <tr key={app._id} className="row-link" onClick={() => navigate(`/applications/${app._id}`)}>
                        <td>
                          <span className="cell-strong">{app.company}</span>
                          <span className="cell-sub">{app.position}</span>
                        </td>
                        <td className="d-none d-sm-table-cell text-nowrap">{formatDate(app.dateApplied)}</td>
                        <td><StatusBadge status={app.status} /></td>
                        <td className="d-none d-lg-table-cell cell-resume">
                          <ResumeCell resume={app.resumeId} />
                        </td>
                        <td className="text-end">
                          <Link to={`/applications/${app._id}`} className="panel-link" onClick={(e) => e.stopPropagation()}>
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>

        <div className="col-xxl-4">
          <Panel
            title="Upcoming interviews"
            description="Next scheduled rounds."
            actions={<Link to="/interviews" className="panel-link">View all <ArrowUpRight size={14} /></Link>}
          >
            {stats.upcomingInterviews.length === 0 ? (
              <EmptyState compact icon={CalendarDays} title="Nothing scheduled" description="Upcoming interviews will show up here." />
            ) : (
              <ul className="mini-list">
                {stats.upcomingInterviews.map((iv) => (
                  <li key={iv._id}>
                    <div className="mini-date">
                      <span>{formatDate(iv.date, { month: 'short', day: undefined, year: undefined })}</span>
                      <strong>{formatDate(iv.date, { day: 'numeric', month: undefined, year: undefined })}</strong>
                    </div>
                    <div className="min-w-0 flex-grow-1">
                      <Link to={`/applications/${iv.applicationId?._id}`} className="cell-strong d-block text-truncate">
                        {iv.applicationId?.company}
                      </Link>
                      <span className="cell-sub text-truncate">{iv.applicationId?.position}</span>
                    </div>
                    <div className="text-end flex-shrink-0">
                      <span className="mini-type">{iv.type}</span>
                      <span className="cell-sub">{iv.time ? formatTime(iv.time) : 'Time TBD'}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="col-lg-7 col-xxl-8">
          <Panel title="Application status overview" description={`${stats.totalApplications} application${stats.totalApplications === 1 ? '' : 's'} by current status.`}>
            <StatusOverview counts={stats.statusCounts} total={stats.totalApplications} />
          </Panel>
        </div>

        <div className="col-lg-5 col-xxl-4 d-flex flex-column gap-4">
          <Panel title="Quick actions">
            <div className="quick-actions">
              <button type="button" className="quick-action" onClick={() => setFormOpen(true)}>
                <Plus size={17} /> <span>Add application</span>
              </button>
              <Link to="/resumes?new=1" className="quick-action">
                <FileUp size={17} /> <span>Upload resume</span>
              </Link>
              <Link to="/interviews?new=1" className="quick-action">
                <CalendarPlus size={17} /> <span>Schedule interview</span>
              </Link>
            </div>
          </Panel>

          <Panel title="Follow-ups" description="Overdue or due within 7 days.">
            {stats.followUps.length === 0 ? (
              <EmptyState compact icon={Bell} title="You're all caught up" />
            ) : (
              <ul className="mini-list">
                {stats.followUps.map((app) => (
                  <li key={app._id}>
                    <div className="min-w-0 flex-grow-1">
                      <Link to={`/applications/${app._id}`} className="cell-strong d-block text-truncate">
                        {app.company}
                      </Link>
                      <span className="cell-sub text-truncate">{app.position}</span>
                    </div>
                    <span className={`followup-due ${daysFromToday(app.followUpDate) >= 0 ? 'is-due' : ''}`}>
                      {followUpLabel(app.followUpDate)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <ApplicationForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={() => reload({ silent: true })} />
    </>
  );
}
