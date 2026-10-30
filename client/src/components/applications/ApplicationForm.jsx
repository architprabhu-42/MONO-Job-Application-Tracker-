import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '../../context/ToastContext.jsx';
import { applicationsApi, applyServerErrors, getErrorMessage, resumesApi } from '../../services/api.js';
import { APPLICATION_STATUSES, JOB_TYPES, WORK_ARRANGEMENTS } from '../../utils/constants.js';
import { resumeLabel, toInputDate, todayInputDate } from '../../utils/format.js';
import { applicationSchema } from '../../utils/validation.js';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Modal, { ModalFooter } from '../ui/Modal.jsx';
import Select from '../ui/Select.jsx';

function toFormValues(app) {
  return {
    company: app?.company ?? '',
    position: app?.position ?? '',
    jobType: app?.jobType ?? '',
    location: app?.location ?? '',
    workArrangement: app?.workArrangement ?? '',
    dateApplied: app ? toInputDate(app.dateApplied) : todayInputDate(),
    status: app?.status ?? 'Applied',
    jobUrl: app?.jobUrl ?? '',
    salaryRange: app?.salaryRange ?? '',
    resumeId: app?.resumeId?._id ?? app?.resumeId ?? '',
    recruiterName: app?.recruiterName ?? '',
    recruiterEmail: app?.recruiterEmail ?? '',
    jobDescription: app?.jobDescription ?? '',
    notes: app?.notes ?? '',
    followUpDate: toInputDate(app?.followUpDate),
  };
}

// Form 2 — create or edit a job application (pass `application` to edit).
export default function ApplicationForm({ open, onClose, application, onSaved }) {
  const isEdit = Boolean(application);
  const toast = useToast();
  const [resumes, setResumes] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(applicationSchema), defaultValues: toFormValues(application) });

  useEffect(() => {
    if (!open) return;
    reset(toFormValues(application));
    resumesApi
      .list()
      .then(setResumes)
      .catch(() => setResumes([]));
  }, [open, application, reset]);

  // Re-apply the linked resume after its <option>s have rendered,
  // otherwise the select can't display it (and saving would unlink it).
  useEffect(() => {
    if (resumes.length) setValue('resumeId', toFormValues(application).resumeId);
  }, [resumes, application, setValue]);

  async function onSubmit(values) {
    try {
      const saved = isEdit
        ? await applicationsApi.update(application._id, values)
        : await applicationsApi.create(values);
      toast.success(isEdit ? 'Application updated.' : 'Application added.');
      onSaved?.(saved);
      onClose();
    } catch (err) {
      applyServerErrors(err, setError);
      toast.error(getErrorMessage(err));
    }
  }

  const resumeOptions = resumes.map((r) => ({ value: r._id, label: resumeLabel(r) }));

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      size="lg"
      title={isEdit ? 'Edit application' : 'Add application'}
      description={isEdit ? `${application.company} · ${application.position}` : 'Track a new role you applied for.'}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="modal-body-mono">
          <fieldset className="form-section" disabled={isSubmitting}>
            <legend>Role</legend>
            <div className="row g-3">
              <div className="col-md-6">
                <Input label="Company name" required placeholder="e.g. Google" error={errors.company?.message} {...register('company')} />
              </div>
              <div className="col-md-6">
                <Input label="Job title" required placeholder="e.g. Frontend Developer" error={errors.position?.message} {...register('position')} />
              </div>
              <div className="col-md-6">
                <Select label="Job type" required placeholder="Select job type" options={JOB_TYPES} error={errors.jobType?.message} {...register('jobType')} />
              </div>
              <div className="col-md-6">
                <Select label="Status" required options={APPLICATION_STATUSES} error={errors.status?.message} {...register('status')} />
              </div>
              <div className="col-md-6">
                <Input type="date" label="Date applied" required error={errors.dateApplied?.message} {...register('dateApplied')} />
              </div>
              <div className="col-md-6">
                <Select label="Work arrangement" placeholder="Not specified" options={WORK_ARRANGEMENTS} error={errors.workArrangement?.message} {...register('workArrangement')} />
              </div>
              <div className="col-md-6">
                <Input label="Location" placeholder="e.g. Bengaluru" error={errors.location?.message} {...register('location')} />
              </div>
              <div className="col-md-6">
                <Input label="Salary range" placeholder="e.g. ₹12–15 LPA" error={errors.salaryRange?.message} {...register('salaryRange')} />
              </div>
            </div>
          </fieldset>

          <fieldset className="form-section" disabled={isSubmitting}>
            <legend>Posting &amp; resume</legend>
            <div className="row g-3">
              <div className="col-md-6">
                <Input type="url" label="Job posting URL" placeholder="https://" error={errors.jobUrl?.message} {...register('jobUrl')} />
              </div>
              <div className="col-md-6">
                <Select
                  label="Resume version"
                  placeholder={resumes.length ? 'No resume linked' : 'No resumes uploaded yet'}
                  options={resumeOptions}
                  error={errors.resumeId?.message}
                  {...register('resumeId')}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="form-section" disabled={isSubmitting}>
            <legend>Recruiter</legend>
            <div className="row g-3">
              <div className="col-md-6">
                <Input label="Recruiter name" error={errors.recruiterName?.message} {...register('recruiterName')} />
              </div>
              <div className="col-md-6">
                <Input type="email" label="Recruiter email" placeholder="name@company.com" error={errors.recruiterEmail?.message} {...register('recruiterEmail')} />
              </div>
            </div>
          </fieldset>

          <fieldset className="form-section" disabled={isSubmitting}>
            <legend>Notes</legend>
            <div className="row g-3">
              <div className="col-12">
                <Input as="textarea" rows={3} label="Job description" placeholder="Paste key responsibilities or requirements" error={errors.jobDescription?.message} {...register('jobDescription')} />
              </div>
              <div className="col-12">
                <Input as="textarea" rows={3} label="Notes" placeholder="Anything worth remembering" error={errors.notes?.message} {...register('notes')} />
              </div>
              <div className="col-md-6">
                <Input type="date" label="Next follow-up date" error={errors.followUpDate?.message} {...register('followUpDate')} />
              </div>
            </div>
          </fieldset>
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Add application'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
