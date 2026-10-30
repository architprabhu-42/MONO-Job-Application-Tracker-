import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarDays, CalendarPlus, Search, SearchX } from 'lucide-react';
import InterviewForm from '../components/interviews/InterviewForm.jsx';
import InterviewList from '../components/interviews/InterviewList.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import Panel from '../components/ui/Panel.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { getErrorMessage, interviewsApi } from '../services/api.js';
import { formatDate } from '../utils/format.js';

const VIEWS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'all', label: 'All' },
];

const EMPTY_TEXT = {
  upcoming: ['No upcoming interviews', 'Scheduled interviews that are still pending appear here in date order.'],
  completed: ['No completed interviews', 'Past interviews and those marked passed or failed appear here.'],
  all: ['No interviews yet', 'Schedule an interview and link it to one of your applications.'],
};

export default function Interviews() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState('upcoming');
  const [searchText, setSearchText] = useState('');
  const search = useDebounce(searchText, 300);
  const [formState, setFormState] = useState({ open: false, interview: null });
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { data: interviews, loading, error, reload } = useAsync(
    () => interviewsApi.list({ view, search }),
    [view, search]
  );

  useEffect(() => {
    if (searchParams.get('new')) {
      setFormState({ open: true, interview: null });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  async function confirmDelete() {
    setDeleting(true);
    try {
      await interviewsApi.remove(toDelete._id);
      toast.success('Interview deleted.');
      setToDelete(null);
      reload({ silent: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  const openNew = () => setFormState({ open: true, interview: null });

  let content;
  if (loading && !interviews) content = <LoadingState label="Loading interviews…" />;
  else if (error) content = <ErrorState message={error} onRetry={reload} />;
  else if (interviews.length === 0 && search)
    content = <EmptyState icon={SearchX} title="No matching interviews" description="Try a different company or position." />;
  else if (interviews.length === 0) {
    const [title, description] = EMPTY_TEXT[view];
    content = (
      <EmptyState
        icon={CalendarDays}
        title={title}
        description={description}
        action={view !== 'completed' && <Button icon={CalendarPlus} onClick={openNew}>Schedule interview</Button>}
      />
    );
  } else
    content = (
      <InterviewList
        interviews={interviews}
        onEdit={(interview) => setFormState({ open: true, interview })}
        onDelete={setToDelete}
      />
    );

  return (
    <>
      <PageHeader
        title="Interviews"
        description="Upcoming rounds in chronological order, plus everything you've completed."
        actions={<Button icon={CalendarPlus} onClick={openNew}>Schedule interview</Button>}
      />

      <Panel flush>
        <div className="panel-toolbar">
          <div className="filters">
            <div className="segmented" role="tablist" aria-label="Interview view">
              {VIEWS.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  role="tab"
                  aria-selected={view === v.value}
                  className={view === v.value ? 'active' : ''}
                  onClick={() => setView(v.value)}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <div className="search-box">
              <Search size={16} className="search-icon" aria-hidden="true" />
              <input
                type="search"
                className="control"
                placeholder="Search company or position"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                aria-label="Search interviews"
              />
            </div>
          </div>
          {interviews && (
            <span className="result-count">
              {interviews.length} interview{interviews.length === 1 ? '' : 's'}
              {loading && ' · updating…'}
            </span>
          )}
        </div>
        {content}
      </Panel>

      <InterviewForm
        open={formState.open}
        interview={formState.interview}
        onClose={() => setFormState({ open: false, interview: null })}
        onSaved={() => reload({ silent: true })}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete interview?"
        message={
          toDelete &&
          `The ${toDelete.type} interview with ${toDelete.applicationId?.company ?? 'this company'} on ${formatDate(toDelete.date)} will be permanently deleted.`
        }
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
