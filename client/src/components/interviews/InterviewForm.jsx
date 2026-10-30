import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '../../context/ToastContext.jsx';
import { applicationsApi, applyServerErrors, getErrorMessage, interviewsApi } from '../../services/api.js';
import { INTERVIEW_RESULTS, INTERVIEW_TYPES } from '../../utils/constants.js';
import { toInputDate } from '../../utils/format.js';
import { interviewSchema } from '../../utils/validation.js';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Modal, { ModalFooter } from '../ui/Modal.jsx';
import Select from '../ui/Select.jsx';

function toFormValues(interview, defaultApplicationId) {
  return {
    applicationId: interview?.applicationId?._id ?? interview?.applicationId ?? defaultApplicationId ?? '',
    date: toInputDate(interview?.date),
    time: interview?.time ?? '',
    type: interview?.type ?? '',
    interviewerName: interview?.interviewerName ?? '',
    meetingLink: interview?.meetingLink ?? '',
    preparationNotes: interview?.preparationNotes ?? '',
    result: interview?.result ?? 'Pending',
  };
}

// Form 4 — schedule or edit an interview linked to an application.
export default function InterviewForm({ open, onClose, interview, defaultApplicationId, onSaved }) {
  const isEdit = Boolean(interview);
  const toast = useToast();
  const [applications, setApplications] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(interviewSchema), defaultValues: toFormValues(interview, defaultApplicationId) });

  useEffect(() => {
    if (!open) return;
    reset(toFormValues(interview, defaultApplicationId));
    setApplications(null);
    applicationsApi
      .list({ sort: 'company' })
      .then(setApplications)
      .catch(() => setApplications([]));
  }, [open, interview, defaultApplicationId, reset]);

  // Re-apply the chosen application after its <option>s have rendered,
  // otherwise the select can't display it.
  useEffect(() => {
    if (applications?.length) {
      setValue('applicationId', toFormValues(interview, defaultApplicationId).applicationId);
    }
  }, [applications, interview, defaultApplicationId, setValue]);

  async function onSubmit(values) {
    try {
      const saved = isEdit ? await interviewsApi.update(interview._id, values) : await interviewsApi.create(values);
      toast.success(isEdit ? 'Interview updated.' : 'Interview scheduled.');
      onSaved?.(saved);
      onClose();
    } catch (err) {
      applyServerErrors(err, setError);
      toast.error(getErrorMessage(err));
    }
  }

  const applicationOptions = (applications || []).map((a) => ({
    value: a._id,
    label: `${a.company} — ${a.position}`,
  }));
  const noApplications = applications !== null && applications.length === 0;

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      title={isEdit ? 'Edit interview' : 'Schedule interview'}
      description="Link the interview to one of your applications."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset className="modal-body-mono" disabled={isSubmitting}>
          {noApplications && (
            <div className="notice mb-3">
              You need an application before scheduling an interview.{' '}
              <Link to="/applications?new=1" onClick={onClose}>
                Add an application
              </Link>
            </div>
          )}
          <div className="row g-3">
            <div className="col-12">
              <Select
                label="Related application"
                required
                placeholder={applications === null ? 'Loading applications…' : 'Select an application'}
                options={applicationOptions}
                error={errors.applicationId?.message}
                {...register('applicationId')}
              />
            </div>
            <div className="col-md-6">
              <Input type="date" label="Interview date" required error={errors.date?.message} {...register('date')} />
            </div>
            <div className="col-md-6">
              <Input type="time" label="Time" error={errors.time?.message} {...register('time')} />
            </div>
            <div className="col-md-6">
              <Select label="Interview type" required placeholder="Select type" options={INTERVIEW_TYPES} error={errors.type?.message} {...register('type')} />
            </div>
            <div className="col-md-6">
              <Select label="Result" options={INTERVIEW_RESULTS} error={errors.result?.message} {...register('result')} />
            </div>
            <div className="col-md-6">
              <Input label="Interviewer name" error={errors.interviewerName?.message} {...register('interviewerName')} />
            </div>
            <div className="col-md-6">
              <Input label="Meeting link or location" placeholder="https://meet… or office address" error={errors.meetingLink?.message} {...register('meetingLink')} />
            </div>
            <div className="col-12">
              <Input as="textarea" rows={3} label="Preparation notes" placeholder="Topics to revise, questions to ask…" error={errors.preparationNotes?.message} {...register('preparationNotes')} />
            </div>
          </div>
        </fieldset>

        <ModalFooter>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} disabled={noApplications}>
            {isEdit ? 'Save changes' : 'Schedule interview'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
