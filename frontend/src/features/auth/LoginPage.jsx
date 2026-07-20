import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { Field, Button, Icon } from '@/components/ui';

// Served from /public — referenced by URL so the 2.5MB asset isn't inlined into the bundle.
const HERO_IMG = '/hr_image.jpg';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const features = [
  { icon: 'user-check', text: 'Employee Management' },
  { icon: 'calendar', text: 'Attendance Tracking' },
  { icon: 'briefcase', text: 'Asset Management' },
  { icon: 'file-text', text: 'Document Control' },
];

const stats = [
  { value: '18', label: 'People onboard' },
  { value: '16', label: 'HR modules' },
  { value: '99.9%', label: 'Uptime' },
];

const demoAccounts = [
  ['HR Admin', 'pankaj@itsybizz.com'],
  ['HR Rep', 'pooja@itsybizz.com'],
  ['Finance', 'priya@itsybizz.com'],
  ['Employee', 'rohit@itsybizz.com'],
];

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const user = await login(values);
      toast(`Welcome back, ${user.name.split(' ')[0]}`);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      toast(apiError(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (email) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'Password@123', { shouldValidate: true });
  };

  return (
    <div className="auth-shell">
      {/* ============ Left — brand hero ============ */}
      <div className="auth-hero">
        {/* Background photo with a slow cinematic zoom */}
        <motion.img
          src={HERO_IMG}
          alt=""
          aria-hidden="true"
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 12, ease: 'easeOut' }}
          className="auth-hero-img"
        />
        {/* Brand gradient wash (keeps the RAMP blue identity + text legibility) */}
        <div className="auth-hero-wash" />
        {/* Soft glow + fine grid texture */}
        <div className="auth-hero-glow" />
        <div className="auth-hero-grid" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="auth-hero-content"
        >
          {/* Logo */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 13 }}>
            <div className="auth-logo-tile">R</div>
            <div style={{ color: '#fff' }}>
              <div style={{ fontFamily: 'var(--font-disp)', fontSize: 20, fontWeight: 800, letterSpacing: '-0.4px' }}>
                RAMP
              </div>
              <div style={{ fontSize: 10.5, opacity: 0.7, letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: 600 }}>
                HR Suite
              </div>
            </div>
          </div>

          {/* Headline */}
          <div>
            <h1 className="auth-hero-title">
              Empowering your
              <br />
              HR, end&nbsp;to&nbsp;end.
            </h1>
            <p className="auth-hero-sub">
              Streamline operations, manage people effortlessly, and run your entire workplace from one
              comprehensive platform.
            </p>
          </div>

          {/* Feature grid */}
          <div className="auth-feature-grid">
            {features.map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.08 }}
                className="auth-feature"
              >
                <span className="auth-feature-ico">
                  <Icon name={feature.icon} size={16} color="#fff" />
                </span>
                <span>{feature.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div className="auth-stats">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="auth-stat-value">{stat.value}</div>
                <div className="auth-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ============ Right — sign-in form ============ */}
      <div className="auth-form-col">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 400 }}
        >
          {/* Mobile brand (shown when hero is hidden) */}
          <div className="auth-mobile-brand">
            <div className="auth-logo-tile" style={{ margin: '0 auto 12px' }}>R</div>
            <div style={{ fontFamily: 'var(--font-disp)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.4px' }}>
              RA<span style={{ color: 'var(--blue)' }}>MP</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Recruitment And Management of People</div>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 28 }}>
            <span className="auth-badge">
              <span className="auth-badge-dot" />
              Secure sign in
            </span>
            <h1 className="auth-title">Welcome back</h1>
            <p style={{ color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.5, marginTop: 6 }}>
              Enter your credentials to access your HR dashboard.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ display: 'grid', gap: 16 }}>
              <Field label="Email address" error={errors.email?.message}>
                <div className="auth-input-wrap">
                  <Icon name="mail" size={16} className="auth-input-ico" />
                  <input
                    type="email"
                    className="input auth-input"
                    placeholder="you@itsybizz.com"
                    autoFocus
                    autoComplete="email"
                    {...register('email')}
                  />
                </div>
              </Field>

              <Field label="Password" error={errors.password?.message}>
                <div className="auth-input-wrap">
                  <Icon name="lock" size={16} className="auth-input-ico" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input auth-input"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    style={{ paddingRight: 44 }}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="auth-eye"
                  >
                    <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} />
                  </button>
                </div>
              </Field>

              <div className="auth-row">
                <label className="auth-remember">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => toast('Please contact your HR administrator to reset your password.')}
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                icon="arrow-right"
                loading={submitting}
                className="auth-submit"
              >
                Sign in to dashboard
              </Button>
            </div>
          </form>

          {/* Demo quick-fill (seeded accounts — password Password@123) */}
          <div className="auth-demo">
            <div className="auth-demo-head">
              <Icon name="sparkles" size={13} />
              <span>Demo accounts · tap to prefill</span>
            </div>
            <div className="auth-demo-chips">
              {demoAccounts.map(([label, email]) => (
                <button key={email} type="button" className="auth-chip" onClick={() => fillDemo(email)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="auth-footer">
            <Icon name="shield" size={14} color="var(--ink-3)" />
            Protected by role-based access ·{' '}
            <button type="button" className="auth-link" onClick={() => toast('Reach us at hr@itsybizz.com')}>
              Contact support
            </button>
          </div>
        </motion.div>
      </div>

      {/* Scoped styles */}
      <style>{`
        .auth-shell { min-height: 100vh; display: flex; background: var(--paper); }

        /* ---- Hero ---- */
        .auth-hero {
          flex: 1.1; position: relative; overflow: hidden; min-height: 100vh;
          display: flex; align-items: center; justify-content: center; padding: 48px;
          background: linear-gradient(150deg, #0A3D91 0%, #0E4FB5 48%, #1465E0 100%);
        }
        .auth-hero-img {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; object-position: center; opacity: 0.4;
        }
        .auth-hero-wash {
          position: absolute; inset: 0;
          background: linear-gradient(160deg, rgba(10,61,145,0.80) 0%, rgba(9,32,74,0.90) 58%, rgba(6,20,46,0.95) 100%);
        }
        .auth-hero-glow {
          position: absolute; top: -12%; right: -8%; width: 460px; height: 460px; border-radius: 50%;
          background: radial-gradient(circle, rgba(120,178,255,0.35) 0%, rgba(120,178,255,0) 70%); filter: blur(6px);
        }
        .auth-hero-grid {
          position: absolute; inset: 0; opacity: 0.5;
          background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: radial-gradient(circle at 30% 40%, #000 0%, transparent 75%);
        }
        .auth-hero-content {
          position: relative; z-index: 1; width: 100%; max-width: 520px;
          display: flex; flex-direction: column; gap: 38px;
        }
        .auth-logo-tile {
          width: 50px; height: 50px; border-radius: 14px; flex-shrink: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08));
          border: 1px solid rgba(255,255,255,0.28); backdrop-filter: blur(12px);
          display: grid; place-items: center; color: #fff;
          font-family: var(--font-disp); font-weight: 800; font-size: 22px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.28);
        }
        .auth-hero-title {
          font-family: var(--font-disp); font-size: 42px; font-weight: 800; color: #fff;
          line-height: 1.1; margin-bottom: 16px; letter-spacing: -1.2px;
        }
        .auth-hero-sub { font-size: 15.5px; color: rgba(255,255,255,0.82); line-height: 1.65; max-width: 452px; }
        .auth-feature-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 11px; }
        .auth-feature {
          display: flex; align-items: center; gap: 12px; padding: 13px 15px;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14);
          border-radius: 13px; backdrop-filter: blur(10px);
          color: #fff; font-size: 13.5px; font-weight: 600; transition: background .18s, transform .18s;
        }
        .auth-feature:hover { background: rgba(255,255,255,0.14); transform: translateY(-2px); }
        .auth-feature-ico {
          width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
          background: rgba(255,255,255,0.14); display: grid; place-items: center;
        }
        .auth-stats { display: flex; gap: 34px; padding-top: 26px; border-top: 1px solid rgba(255,255,255,0.16); }
        .auth-stat-value { font-family: var(--font-disp); font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.6px; }
        .auth-stat-label { font-size: 11.5px; color: rgba(255,255,255,0.68); margin-top: 2px; font-weight: 600; }

        /* ---- Form column ---- */
        .auth-form-col {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 40px; background: var(--card); min-height: 100vh;
        }
        .auth-mobile-brand { display: none; margin-bottom: 30px; text-align: center; }
        .auth-badge {
          display: inline-flex; align-items: center; gap: 8px; padding: 5px 12px; border-radius: 999px;
          background: var(--sky-3); border: 1px solid var(--line); margin-bottom: 18px;
          font-size: 12px; font-weight: 600; color: var(--ink-2);
        }
        .auth-badge-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #22c55e;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.18);
        }
        .auth-title {
          font-family: var(--font-disp); font-size: 30px; font-weight: 800;
          letter-spacing: -0.6px; color: var(--ink);
        }
        .auth-input-wrap { position: relative; }
        .auth-input-ico {
          position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
          color: var(--ink-3); pointer-events: none;
        }
        .auth-input.input { height: 48px; padding-left: 40px; }
        .auth-eye {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; padding: 6px; display: flex;
          color: var(--ink-3); border-radius: 8px; transition: color .15s, background .15s;
        }
        .auth-eye:hover { color: var(--blue-ink); background: var(--sky-3); }
        .auth-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
        .auth-remember { display: flex; align-items: center; gap: 8px; cursor: pointer; color: var(--ink-2); font-weight: 500; }
        .auth-remember input { width: 16px; height: 16px; accent-color: var(--blue); cursor: pointer; }
        .auth-link { background: none; border: none; cursor: pointer; color: var(--blue); font-weight: 700; font-size: inherit; }
        .auth-link:hover { text-decoration: underline; }
        .auth-submit { justify-content: center; height: 48px; font-size: 14.5px; margin-top: 2px; width: 100%; }

        .auth-demo { margin-top: 22px; padding: 14px; border: 1px dashed var(--line-2); border-radius: 12px; background: var(--sky-3); }
        .auth-demo-head { display: flex; align-items: center; gap: 7px; font-size: 11.5px; font-weight: 700; color: var(--ink-3); margin-bottom: 10px; }
        .auth-demo-head svg { stroke: var(--blue); }
        .auth-demo-chips { display: flex; flex-wrap: wrap; gap: 7px; }
        .auth-chip {
          background: var(--sky); border: 1px solid var(--sky-2); color: var(--blue-ink);
          font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 20px; cursor: pointer;
          transition: background .15s, transform .12s;
        }
        .auth-chip:hover { background: var(--sky-2); transform: translateY(-1px); }
        .auth-chip:active { transform: scale(0.96); }

        .auth-footer {
          margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--line);
          display: flex; align-items: center; justify-content: center; gap: 6px;
          font-size: 12.5px; color: var(--ink-3); text-align: center; flex-wrap: wrap;
        }

        /* ---- Responsive ---- */
        @media (max-width: 900px) {
          .auth-hero { display: none; }
          .auth-mobile-brand { display: block; }
          .auth-form-col { background: var(--paper); }
        }
      `}</style>
    </div>
  );
}
