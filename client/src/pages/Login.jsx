import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { applyServerErrors, getErrorMessage } from '../services/api.js';
import { loginSchema } from '../utils/validation.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  async function onSubmit(values) {
    setFormError('');
    try {
      await login(values);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      if (!applyServerErrors(err, setError)) setFormError(getErrorMessage(err));
    }
  }

  return (
    <AuthLayout
      title="Log in"
      subtitle="Welcome back. Pick up where you left off."
      footer={
        <>
          New to MONO? <Link to="/register">Create an account</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form">
        {formError && (
          <div className="form-alert" role="alert">
            <AlertCircle size={16} /> {formError}
          </div>
        )}
        <Input type="email" label="Email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <Input type="password" label="Password" autoComplete="current-password" placeholder="Your password" error={errors.password?.message} {...register('password')} />
        <Button type="submit" loading={isSubmitting} className="w-100 mbtn-lg">
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
}
