import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, FileUp, FileText } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { applyServerErrors, getErrorMessage, resumesApi } from '../../services/api.js';
import { formatFileSize, toInputDate } from '../../utils/format.js';
import { makeResumeSchema } from '../../utils/validation.js';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Modal, { ModalFooter } from '../ui/Modal.jsx';

function toFormValues(resume) {
  return {
    name: resume?.name ?? '',
    version: resume?.version ?? '',
    description: resume?.description ?? '',
    skillsTargeted: resume?.skillsTargeted?.join(', ') ?? '',
    dateCreated: toInputDate(resume?.dateCreated),
    file: undefined,
  };
}

// Form 3 — upload a new resume PDF, or edit an existing resume's details.
export default function ResumeForm({ open, onClose, resume, onSaved }) {
  const isEdit = Boolean(resume);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(makeResumeSchema({ isEdit })), defaultValues: toFormValues(resume) });

  useEffect(() => {
    if (open) reset(toFormValues(resume));
  }, [open, resume, reset]);

  const selectedFile = watch('file')?.[0];

  async function onSubmit(values) {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('version', values.version);
    formData.append('description', values.description);
    formData.append('skillsTargeted', values.skillsTargeted);
    formData.append('dateCreated', values.dateCreated);
    if (values.file?.[0]) formData.append('file', values.file[0]);

    try {
      const saved = isEdit ? await resumesApi.update(resume._id, formData) : await resumesApi.create(formData);
      toast.success(isEdit ? 'Resume updated.' : 'Resume uploaded.');
      onSaved?.(saved);
      onClose();
    } catch (err) {
      applyServerErrors(err, setError);
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      title={isEdit ? 'Edit resume' : 'Upload resume'}
      description={isEdit ? `${resume.name} — ${resume.version}` : 'Add a new resume version as a PDF (max 4 MB).'}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset className="modal-body-mono" disabled={isSubmitting}>
          <div className="row g-3">
            <div className="col-md-8">
              <Input label="Resume name" required placeholder="e.g. Software Engineer Resume" error={errors.name?.message} {...register('name')} />
            </div>
            <div className="col-md-4">
              <Input label="Version label" required placeholder="e.g. v1" error={errors.version?.message} {...register('version')} />
            </div>

            <div className="col-12">
              <span className="field-label">
                PDF file{!isEdit && <span className="field-required"> *</span>}
              </span>
              <label className={`dropzone ${errors.file ? 'is-invalid' : ''} ${selectedFile ? 'has-file' : ''}`}>
                <input type="file" accept="application/pdf,.pdf" className="dropzone-input" {...register('file')} />
                <span className="dropzone-icon">{selectedFile ? <FileText size={20} /> : <FileUp size={20} />}</span>
                {selectedFile ? (
                  <span className="dropzone-text">
                    <strong>{selectedFile.name}</strong>
                    <span>{formatFileSize(selectedFile.size)} · Click to choose a different file</span>
                  </span>
                ) : (
                  <span className="dropzone-text">
                    <strong>{isEdit ? 'Replace PDF (optional)' : 'Choose a PDF or drag it here'}</strong>
                    <span>
                      {isEdit ? `Current file: ${resume.originalFilename}` : 'PDF only, up to 4 MB'}
                    </span>
                  </span>
                )}
              </label>
              {errors.file && (
                <p className="field-error">
                  <AlertCircle size={13} /> {errors.file.message}
                </p>
              )}
            </div>

            <div className="col-12">
              <Input as="textarea" rows={2} label="Description" placeholder="What is this version tailored for?" error={errors.description?.message} {...register('description')} />
            </div>
            <div className="col-md-8">
              <Input label="Skills targeted" placeholder="React, Node.js, SQL" hint="Separate skills with commas" error={errors.skillsTargeted?.message} {...register('skillsTargeted')} />
            </div>
            <div className="col-md-4">
              <Input type="date" label="Date created" error={errors.dateCreated?.message} {...register('dateCreated')} />
            </div>
          </div>
        </fieldset>

        <ModalFooter>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Upload resume'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
