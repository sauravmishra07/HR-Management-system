import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
// import { toPng } from 'html-to-image/dist/html-to-image.js';
import { PageHeader, Card, Button, Icon, Avatar, Field } from '@/components/ui';
import { useToast } from '@/hooks/useToast';

const INITIAL_VALUES = {
  name: '',
  empId: '',
  role: '',
  department: '',
  dob: '',
  joinDate: '',
  email: '',
  phone: '',
};

function PreviewCard({ values, photoUrl }) {
  return (
    <div className="idcard-preview">
      <div className="idcard-heading">
        <div className="idcard-logo-block">
          <div className="idcard-logo-mark">I</div>
          <div>
            <div className="idcard-brand-name">ITSYBIZZ</div>
            <div className="idcard-brand-sub">INNOVATE · AUTOMATE · ELEVATE</div>
          </div>
        </div>
        <div className="idcard-badge">VIRTUAL ID CARD</div>
      </div>

      <div className="idcard-avatar-row">
        <div className="idcard-avatar-shell">
          {photoUrl ? (
            <img src={photoUrl} alt="Profile" className="idcard-avatar-img" />
          ) : (
            <Avatar name={values.name || 'Guest User'} size={132} />
          )}
          <div className="idcard-photo-icon"><Icon name="camera" width={20} height={20} /></div>
        </div>
      </div>

      <div className="idcard-title-row">
        <div className="idcard-name">{values.name || 'Employee Name'}</div>
        <div className="idcard-role">{values.role || 'Software Engineer'}</div>
      </div>

      <div className="idcard-details-grid">
        <div className="idcard-detail-item">
          <div className="idcard-detail-label">EMPLOYEE ID</div>
          <div className="idcard-detail-value">{values.empId || 'TSYBIZZ10058'}</div>
        </div>
        <div className="idcard-detail-item">
          <div className="idcard-detail-label">JOINING DATE</div>
          <div className="idcard-detail-value">{values.joinDate || '01 May 2024'}</div>
        </div>
        <div className="idcard-detail-item">
          <div className="idcard-detail-label">ROLE</div>
          <div className="idcard-detail-value">{values.role || 'Software Engineer'}</div>
        </div>
        <div className="idcard-detail-item">
          <div className="idcard-detail-label">DEPARTMENT</div>
          <div className="idcard-detail-value">{values.department || 'Engineering'}</div>
        </div>
        <div className="idcard-detail-item">
          <div className="idcard-detail-label">DATE OF BIRTH</div>
          <div className="idcard-detail-value">{values.dob || '01 Jan 1990'}</div>
        </div>
        <div className="idcard-detail-item">
          <div className="idcard-detail-label">CONTACT</div>
          <div className="idcard-detail-value">{values.phone || '+91 98765 43210'}</div>
        </div>
      </div>

      <div className="idcard-footer-row">
        <div className="idcard-footer-quote">BUILDING SMARTER SOLUTIONS TOGETHER</div>
        <div className="idcard-qr-sign">
          <div className="idcard-qr">QR</div>
          <div className="idcard-signature">Authorized Signatory</div>
        </div>
      </div>
    </div>
  );
}

export default function IDCardPage() {
  const { register, watch, handleSubmit } = useForm({ defaultValues: INITIAL_VALUES });
  const watchedValues = watch();
  const [preview, setPreview] = useState(INITIAL_VALUES);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [downloadPending, setDownloadPending] = useState(false);
  const previewRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    setPreview(watchedValues);
  }, [watchedValues]);

  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  const onPhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    const url = URL.createObjectURL(file);
    setPhotoFile(file);
    setPhotoUrl(url);
  };

  const onSubmit = (data) => {
    toast('ID card generated successfully');
  };

  const handleDownload = async () => {
    if (!previewRef.current) return;
    setDownloadPending(true);

    try {
      const dataUrl = await toPng(previewRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff',
      });

      const anchor = document.createElement('a');
      anchor.href = dataUrl;
      anchor.download = `${preview.name ? preview.name.replace(/[^\w\d]+/g, '_') : 'employee-id-card'}.png`;
      anchor.click();
      toast('ID card downloaded successfully');
    } catch (error) {
      console.error(error);
      toast('Failed to export ID card. Please try again.');
    } finally {
      setDownloadPending(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Issued ID Card"
        hint="Fill employee details and generate an ID card that matches the issued card preview."
        actions={
          <>
            <Button icon="check" onClick={handleSubmit(onSubmit)}>Generate card</Button>
            <Button icon="download" onClick={handleDownload} disabled={downloadPending}>
              {downloadPending ? 'Exporting...' : 'Download PNG'}
            </Button>
          </>
        }
      />

      <div className="reports-grid" style={{ gridTemplateColumns: '1.3fr 0.9fr', gap: 24 }}>
        <Card>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <Field label="Full Name"><input className="input" {...register('name')} /></Field>
            <Field label="Employee ID"><input className="input" {...register('empId')} /></Field>
            <Field label="Role"><input className="input" {...register('role')} /></Field>
            <Field label="Department"><input className="input" {...register('department')} /></Field>
            <Field label="Date of Birth"><input type="date" className="input" {...register('dob')} /></Field>
            <Field label="Joining Date"><input type="date" className="input" {...register('joinDate')} /></Field>
            <Field label="Email"><input type="email" className="input" {...register('email')} /></Field>
            <Field label="Phone"><input className="input" {...register('phone')} /></Field>
          </div>
          <div className="mt-18" style={{ display: 'grid', gap: 10 }}>
            <Field label="Card Profile Photo">
              <input type="file" className="input" onChange={onPhotoChange} accept="image/*" />
              <small style={{ color: 'var(--ink-3)' }}>Choose a profile image and it will appear on the generated ID card.</small>
            </Field>
            {photoUrl && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={photoUrl} alt="Uploaded" style={{ width: 68, height: 68, borderRadius: 16, objectFit: 'cover', border: '1px solid var(--line)' }} />
                <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Selected photo preview</div>
              </div>
            )}
          </div>
        </Card>

        <div>
          <Card className="idcard-preview-card" pad={false}>
            <div style={{ fontWeight: 700, marginBottom: 18, padding: '22px 22px 0' }}>Preview</div>
            <div ref={previewRef}>
              <PreviewCard values={preview} photoUrl={photoUrl} />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
