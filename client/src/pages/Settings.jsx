import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogOut } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Panel from '../components/ui/Panel.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { applyServerErrors, authApi, dashboardApi, getErrorMessage } from '../services/api.js';
import { formatDate, initials } from '../utils/format.js';
import { profileSchema } from '../utils/validation.js';

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const toast = useToast();
  const { data: stats } = useAsync(() => dashboardApi.stats(), []);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: zodResolver(profileSchema), defaultValues: { name: user.name, email: user.email } });

  async function onSubmit(values) {
    try {
      const data = await authApi.updateProfile(values);
      setUser(data.user);
      reset({ name: data.user.name, email: data.user.email });
      toast.success('Profile updated.');
    } catch (err) {
      applyServerErrors(err, setError);
      toast.error(getErrorMessage(err));
    }
  }

  async function handleLogout() {
    await logout();
    toast.success('You have been logged out.');
  }

  const summary = [
    ['Applications', stats?.totalApplications],
    ['In progress', stats?.inProgress],
    ['Resume versions', stats?.totalResumes],
    ['Interviews logged', stats?.totalInterviews],
  ];

  return (
    <>
      <PageHeader title="Settings" description="Your profile, account and workspace details." />

      <div className="row g-4">
        <div className="col-lg-7 d-flex flex-column gap-4">
          <Panel title="Profile" description="Shown in the sidebar and on your dashboard greeting.">
            <div className="d-flex align-items-center gap-3 mb-4">
              <span className="avatar avatar-lg">{initials(user.name)}</span>
              <div className="min-w-0">
                <div className="cell-strong">{user.name}</div>
                <div className="cell-sub">{user.email}</div>
              </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <fieldset className="row g-3" disabled={isSubmitting}>
                <div className="col-md-6">
                  <Input label="Display name" required error={errors.name?.message} {...register('name')} />
                </div>
                <div className="col-md-6">
                  <Input type="email" label="Email address" required error={errors.email?.message} {...register('email')} />
                </div>
                <div className="col-12 d-flex justify-content-end">
                  <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
                    Save changes
                  </Button>
                </div>
              </fieldset>
            </form>
          </Panel>

          <Panel title="Account">
            <dl className="detail-grid">
              <div className="detail">
                <dt>Member since</dt>
                <dd>{formatDate(user.createdAt)}</dd>
              </div>
              <div className="detail">
                <dt>Sign-in method</dt>
                <dd>Email &amp; password</dd>
              </div>
            </dl>
            <div className="divider" />
            <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
              <div>
                <div className="cell-strong">Log out</div>
                <div className="cell-sub">End your session on this device.</div>
              </div>
              <Button variant="secondary" icon={LogOut} onClick={handleLogout}>
                Log out
              </Button>
            </div>
          </Panel>
        </div>

        <div className="col-lg-5 d-flex flex-column gap-4">
          <Panel title="Dashboard overview" description="What your dashboard is currently tracking.">
            <dl className="summary-list">
              {summary.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value ?? '–'}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel title="About MONO">
            <p className="prose-text mb-3">
              MONO is a job application tracker and resume manager. Record every application, link the resume version
              you sent, schedule interviews and keep follow-ups on time.
            </p>
            <dl className="summary-list">
              <div>
                <dt>Version</dt>
                <dd>1.0.0</dd>
              </div>
              <div>
                <dt>Stack</dt>
                <dd>MongoDB · Express · React · Node.js</dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>
    </>
  );
}
