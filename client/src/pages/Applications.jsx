import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Briefcase, Download, Plus, SearchX } from 'lucide-react';
import ApplicationFilters from '../components/applications/ApplicationFilters.jsx';
import ApplicationForm from '../components/applications/ApplicationForm.jsx';
import ApplicationTable from '../components/applications/ApplicationTable.jsx';
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
import { applicationsApi, getErrorMessage } from '../services/api.js';
import { exportApplicationsCsv } from '../utils/csv.js';

const DEFAULT_FILTERS = { search: '', status: '', jobType: '', sort: 'newest' };

export default function Applications() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [formState, setFormState] = useState({ open: false, application: null });
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const search = useDebounce(filters.search, 300);
  const { status, jobType, sort } = filters;

  const { data: applications, loading, error, reload } = useAsync(
    () => applicationsApi.list({ search, status, jobType, sort }),
    [search, status, jobType, sort]
  );

  // /applications?new=1 (from the dashboard or interview form) opens the add form.
  useEffect(() => {
    if (searchParams.get('new')) {
      setFormState({ open: true, application: null });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const isFiltered = Boolean(search || status || jobType);

  async function confirmDelete() {
    setDeleting(true);
    try {
      await applicationsApi.remove(toDelete._id);
      toast.success(`Deleted ${toDelete.company} application.`);
      setToDelete(null);
      reload({ silent: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  let content;
  if (loading && !applications) content = <LoadingState label="Loading applications…" />;
  else if (error) content = <ErrorState message={error} onRetry={reload} />;
  else if (applications.length === 0 && !isFiltered)
    content = (
      <EmptyState
        icon={Briefcase}
        title="No applications yet"
        description="Add the roles you've applied for to track their status, resumes and follow-ups."
        action={<Button icon={Plus} onClick={() => setFormState({ open: true, application: null })}>Add application</Button>}
      />
    );
  else if (applications.length === 0)
    content = (
      <EmptyState
        icon={SearchX}
        title="No matching applications"
        description="Try a different search or clear the filters."
        action={<Button variant="secondary" onClick={() => setFilters(DEFAULT_FILTERS)}>Clear filters</Button>}
      />
    );
  else
    content = (
      <ApplicationTable
        applications={applications}
        onEdit={(application) => setFormState({ open: true, application })}
        onDelete={setToDelete}
      />
    );

  return (
    <>
      <PageHeader
        title="Applications"
        description="Every role you're tracking, in one place."
        actions={
          <>
            <Button
              variant="secondary"
              icon={Download}
              onClick={() => exportApplicationsCsv(applications || [])}
              disabled={!applications?.length}
            >
              Export CSV
            </Button>
            <Button icon={Plus} onClick={() => setFormState({ open: true, application: null })}>
              Add application
            </Button>
          </>
        }
      />

      <Panel flush>
        <div className="panel-toolbar">
          <ApplicationFilters
            values={filters}
            onChange={(key, value) => setFilters((f) => ({ ...f, [key]: value }))}
            onClear={() => setFilters(DEFAULT_FILTERS)}
          />
          {applications && (
            <span className="result-count">
              {applications.length} result{applications.length === 1 ? '' : 's'}
              {loading && ' · updating…'}
            </span>
          )}
        </div>
        {content}
      </Panel>

      <ApplicationForm
        open={formState.open}
        application={formState.application}
        onClose={() => setFormState({ open: false, application: null })}
        onSaved={() => reload({ silent: true })}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete application?"
        message={
          toDelete && (
            <>
              <strong>{toDelete.company} — {toDelete.position}</strong> and any interviews linked to it will be
              permanently deleted.
            </>
          )
        }
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
