import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileUp } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader.jsx';
import ResumeForm from '../components/resumes/ResumeForm.jsx';
import ResumeList from '../components/resumes/ResumeList.jsx';
import Button from '../components/ui/Button.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { getErrorMessage, resumesApi } from '../services/api.js';

export default function Resumes() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formState, setFormState] = useState({ open: false, resume: null });
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { data: resumes, loading, error, reload } = useAsync(() => resumesApi.list(), []);

  useEffect(() => {
    if (searchParams.get('new')) {
      setFormState({ open: true, resume: null });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  async function confirmDelete() {
    setDeleting(true);
    try {
      const result = await resumesApi.remove(toDelete._id);
      const unlinked = result.unlinkedApplications;
      toast.success(
        unlinked
          ? `Resume deleted and unlinked from ${unlinked} application${unlinked === 1 ? '' : 's'}.`
          : 'Resume deleted.'
      );
      setToDelete(null);
      reload({ silent: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  const openUpload = () => setFormState({ open: true, resume: null });

  let content;
  if (loading && !resumes) content = <LoadingState label="Loading resumes…" />;
  else if (error) content = <ErrorState message={error} onRetry={reload} />;
  else if (resumes.length === 0)
    content = (
      <div className="panel">
        <EmptyState
          icon={FileUp}
          title="No resumes uploaded"
          description="Upload each version of your resume as a PDF, then link it to the applications you send it with."
          action={<Button icon={FileUp} onClick={openUpload}>Upload resume</Button>}
        />
      </div>
    );
  else
    content = (
      <ResumeList
        resumes={resumes}
        onEdit={(resume) => setFormState({ open: true, resume })}
        onDelete={setToDelete}
      />
    );

  return (
    <>
      <PageHeader
        title="Resumes"
        description="Manage resume versions and see where each one was used."
        actions={<Button icon={FileUp} onClick={openUpload}>Upload resume</Button>}
      />

      {content}

      <ResumeForm
        open={formState.open}
        resume={formState.resume}
        onClose={() => setFormState({ open: false, resume: null })}
        onSaved={() => reload({ silent: true })}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete resume?"
        message={
          toDelete && (
            <>
              <strong>{toDelete.name} — {toDelete.version}</strong> and its PDF will be permanently deleted.
              {toDelete.usageCount > 0 &&
                ` It is linked to ${toDelete.usageCount} application${toDelete.usageCount === 1 ? '' : 's'}; ${toDelete.usageCount === 1 ? 'that application' : 'those applications'} will be kept but show no resume.`}
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
