import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import {
  PageHeader, Card, Button, Field, TextInput, TextArea, Spinner,
} from '@/components/ui';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MAIN_EMPTY = {
  company: '', brand: '', tagline: '', address: '', email: '', phone: '', cin: '',
  cl: 12, sl: 10, el: 18, inTime: '09:30', lateAfter: '09:45', weekOff: ['Sun'],
  needApproval: true, selfCheckin: true, emailAlerts: true,
};

function Toggle({ label, hint, ...rest }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0', borderBottom: '1px solid var(--line)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <b style={{ fontSize: 13, display: 'block' }}>{label}</b>
        {hint && <p style={{ fontSize: 11.5, color: 'var(--ink-3)', margin: '2px 0 0' }}>{hint}</p>}
      </div>
      <label className="switch">
        <input type="checkbox" {...rest} />
        <i />
      </label>
    </div>
  );
}

export default function SettingsPage() {
  const { can } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const allowed = can('settings');

  const { data, isLoading } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get, select: (r) => r.data });

  const main = useForm({ defaultValues: MAIN_EMPTY });
  const asset = useForm({ defaultValues: { url: '', key: '', enabled: true } });
  const [offer, setOffer] = useState('');

  useEffect(() => {
    if (!data) return;
    main.reset({
      company: data.company || '', brand: data.brand || '', tagline: data.tagline || '',
      address: data.address || '', email: data.email || '', phone: data.phone || '', cin: data.cin || '',
      cl: data.cl ?? 12, sl: data.sl ?? 10, el: data.el ?? 18,
      inTime: data.inTime || '09:30', lateAfter: data.lateAfter || '09:45',
      weekOff: data.weekOff || ['Sun'],
      needApproval: !!data.needApproval, selfCheckin: !!data.selfCheckin, emailAlerts: !!data.emailAlerts,
    });
    asset.reset({ url: data.assetApi?.url || '', key: data.assetApi?.key || '', enabled: !!data.assetApi?.enabled });
    setOffer(data.offerTemplate || '');
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const invalidate = () => qc.invalidateQueries({ queryKey: ['settings'] });

  const saveMain = useMutation({
    mutationFn: (values) => settingsApi.update(values),
    onSuccess: () => { toast('Settings saved'); invalidate(); },
    onError: (e) => toast(apiError(e), 'error'),
  });
  const saveAsset = useMutation({
    mutationFn: (values) => settingsApi.updateAssetApi(values),
    onSuccess: () => { toast('Asset API updated'); invalidate(); },
    onError: (e) => toast(apiError(e), 'error'),
  });
  const saveOffer = useMutation({
    mutationFn: (text) => settingsApi.updateOfferTemplate(text),
    onSuccess: () => { toast('Offer letter format saved'); invalidate(); },
    onError: (e) => toast(apiError(e), 'error'),
  });

  if (isLoading) {
    return (
      <>
        <PageHeader title="Settings" hint="Company details and the rules the whole system follows." />
        <Card><Spinner label="Loading settings…" /></Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Settings" hint="Company details and the rules the whole system follows. Change, save, done." />

      <form onSubmit={main.handleSubmit((v) => saveMain.mutate({ ...v, weekOff: Array.isArray(v.weekOff) ? v.weekOff : v.weekOff ? [v.weekOff] : [] }))}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'start' }}>
          {/* Company profile */}
          <Card title="Company profile">
            <div className="form-grid" style={{ marginTop: 4 }}>
              <Field label="Legal name (used on payslips & letters)" full><TextInput {...main.register('company')} /></Field>
              <Field label="Brand name"><TextInput {...main.register('brand')} /></Field>
              <Field label="Tagline"><TextInput {...main.register('tagline')} /></Field>
              <Field label="Registered address" full><TextArea {...main.register('address')} rows={2} /></Field>
              <Field label="HR email"><TextInput type="email" {...main.register('email')} /></Field>
              <Field label="Phone"><TextInput {...main.register('phone')} /></Field>
              <Field label="CIN" full><TextInput className="input mono" {...main.register('cin')} /></Field>
            </div>
          </Card>

          {/* Leave policy + attendance rules + behaviour */}
          <Card title="Leave policy & attendance">
            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginTop: 4 }}>
              <Field label="Casual (CL)"><TextInput type="number" {...main.register('cl')} /></Field>
              <Field label="Sick (SL)"><TextInput type="number" {...main.register('sl')} /></Field>
              <Field label="Earned (EL)"><TextInput type="number" {...main.register('el')} /></Field>
            </div>
            <div className="form-grid" style={{ marginTop: 12 }}>
              <Field label="Office in-time"><TextInput type="time" {...main.register('inTime')} /></Field>
              <Field label="Late after"><TextInput type="time" {...main.register('lateAfter')} /></Field>
              <Field label="Weekly off" full>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {DAYS.map((d) => (
                    <label key={d} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>
                      <input type="checkbox" value={d} {...main.register('weekOff')} />
                      {d}
                    </label>
                  ))}
                </div>
              </Field>
            </div>

            <div className="card-title" style={{ marginTop: 18 }}>Behaviour</div>
            <Toggle label="Leave needs HR approval" hint="Off = leaves get auto-approved instantly" {...main.register('needApproval')} />
            <Toggle label="Employees can self check-in" hint="From their own phone or desktop" {...main.register('selfCheckin')} />
            <Toggle label="Email alerts" hint="Approvals, payslips and announcements by email" {...main.register('emailAlerts')} />
          </Card>
        </div>

        {allowed && (
          <div style={{ marginTop: 14, textAlign: 'right' }}>
            <Button type="submit" icon="check" loading={saveMain.isPending}>Save settings</Button>
          </div>
        )}
      </form>

      {/* Offer letter format */}
      <div style={{ marginTop: 18 }}>
      <Card title="Offer letter format" sub="edit once — every offer you generate uses this">
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 10 }}>
          Available tokens (auto-filled per candidate):{' '}
          <span className="mono">{'{{NAME}} {{ROLE}} {{DEPT}} {{COMPANY}} {{CTC}} {{JOIN}} {{HR_NAME}}'}</span>
        </div>
        <TextArea
          value={offer}
          onChange={(e) => setOffer(e.target.value)}
          disabled={!allowed}
          style={{ minHeight: 260, fontFamily: 'var(--font-mono)', fontSize: 12.5, lineHeight: 1.7 }}
        />
        {allowed && (
          <div style={{ marginTop: 12, textAlign: 'right' }}>
            <Button icon="check" loading={saveOffer.isPending} onClick={() => saveOffer.mutate(offer)}>Save format</Button>
          </div>
        )}
      </Card>
      </div>

      {/* Asset Management API */}
      <div style={{ marginTop: 18 }}>
      <Card title="Asset Management API" sub="the master asset list is pulled from your separate Asset app">
        <form onSubmit={asset.handleSubmit((v) => saveAsset.mutate(v))}>
          <Toggle label="Enable asset sync" hint="Pull laptops, monitors, kits and SIMs over API into the Assets module" {...asset.register('enabled')} />
          <div className="form-grid" style={{ marginTop: 12 }}>
            <Field label="API endpoint URL" full><TextInput className="input mono" {...asset.register('url')} placeholder="https://assets.example.com/api/list" /></Field>
            <Field label="API key / token (sent as Authorization: Bearer)" full><TextInput className="input mono" {...asset.register('key')} placeholder="paste token" /></Field>
          </div>
          {data?.assetApi?.lastSync && (
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 8 }}>Last sync: <b>{data.assetApi.lastSync}</b></div>
          )}
          {allowed && (
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <Button type="submit" variant="soft" icon="check" loading={saveAsset.isPending}>Save asset API</Button>
            </div>
          )}
        </form>
      </Card>
      </div>
    </>
  );
}
