import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { applyServerErrors, getErrorMessage } from '../services/api.js';
import { registerSchema } from '../utils/validation.js';

// Form 1 — user registration.
export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  async function onSubmit(values) {
    setFormError('');
    try {
      const user = await registerUser(values);
      toast.success(`Welcome to MONO, ${user.name.split(' ')[0]}!`);
      navigate('/', { replace: true });
    } catch (err) {
      if (!applyServerErrors(err, setError)) setFormError(getErrorMessage(err));
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start organizing your job search in minutes."
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form">
        {formError && (
          <div className="form-alert" role="alert">
            <AlertCircle size={16} /> {formError}
          </div>
        )}
        <Input label="Full name" required autoComplete="name" placeholder="Jane Doe" error={errors.name?.message} {...register('name')} />
        <Input type="email" label="Email" required autoComplete="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <Input type="password" label="Password" required autoComplete="new-password" placeholder="At least 8 characters" error={errors.password?.message} {...register('password')} />
        <Input type="password" label="Confirm password" required autoComplete="new-password" placeholder="Repeat your password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Button type="submit" loading={isSubmitting} className="w-100 mbtn-lg">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
