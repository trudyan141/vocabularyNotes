'use client';
import { useSyncExternalStore, useState } from 'react';
import { useApp } from '@/components/app/provider';
import { Button } from '@/components/ui/button';
import { SubmitButton, type SubmitState } from '@/components/ui/submit-button';
import { Input } from '@/components/ui/input';
import { Globe, Save, Trash2 } from 'lucide-react';
import { getGoogleSearchConfig, setGoogleSearchConfig } from '@/lib/media/google-search-config';

export function GoogleSearchSettings() {
  const hydrated = useSyncExternalStore(() => () => {}, () => true, () => false);
  return hydrated ? <GoogleSearchForm /> : null;
}

function GoogleSearchForm() {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => getGoogleSearchConfig()?.apiKey ?? '');
  const [cx, setCx] = useState(() => getGoogleSearchConfig()?.cx ?? '');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<SubmitState>('idle');

  const hasConfig = Boolean(apiKey.trim() && cx.trim());

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!apiKey.trim() || !cx.trim()) {
      setState('error');
      setMessage(t('Vui lòng nhập cả API Key và CX ID.', 'Please enter both API Key and CX ID.'));
      return;
    }
    setGoogleSearchConfig({ apiKey: apiKey.trim(), cx: cx.trim() });
    setState('success');
    setMessage(t('Đã lưu Google Search Key.', 'Google Search key saved.'));
  }

  function handleRemove() {
    setGoogleSearchConfig(null);
    setApiKey('');
    setCx('');
    setState('idle');
    setMessage(t('Đã xóa Google Search Key.', 'Google Search key removed.'));
  }

  return (
    <section id="google-search-settings" className="page-flow ai-settings">
      <Button
        variant="outline"
        aria-expanded={open}
        aria-controls="google-search-form"
        onClick={() => setOpen((v) => !v)}
      >
        <Globe aria-hidden="true" />
        {hasConfig
          ? t('Google Tìm ảnh (Đã bật)', 'Google Image Search (Enabled)')
          : t('Cài đặt Google Tìm ảnh (Tùy chọn)', 'Google Image Search (Optional)')}
      </Button>

      {open && (
        <form id="google-search-form" className="compact-form" onSubmit={handleSave}>
          <p className="settings-tip">
            {t(
              'Miễn phí 100 lượt/ngày. Nếu không nhập key, app sẽ tự động tìm ảnh clipart hoạt hình từ Web miễn phí.',
              '100 free searches/day. If omitted, the app automatically finds cartoon clipart from the Web for free.'
            )}
          </p>

          <label htmlFor="google-search-api-key">Google Search API Key</label>
          <Input
            id="google-search-api-key"
            type="password"
            autoComplete="off"
            spellCheck={false}
            maxLength={200}
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setState('idle');
              setMessage('');
            }}
            placeholder="AIzaSy…"
          />

          <label htmlFor="google-search-cx">Search Engine ID (CX)</label>
          <Input
            id="google-search-cx"
            type="text"
            autoComplete="off"
            spellCheck={false}
            maxLength={100}
            value={cx}
            onChange={(e) => {
              setCx(e.target.value);
              setState('idle');
              setMessage('');
            }}
            placeholder="b67e…"
          />

          <div className="row-wrap">
            <SubmitButton
              type="submit"
              state={state}
              error={state === 'error' ? message : undefined}
              successLabel={t('Đã lưu', 'Saved')}
            >
              <Save aria-hidden="true" />
              {t('Lưu Google Key', 'Save Google Key')}
            </SubmitButton>

            {hasConfig && (
              <Button type="button" variant="outline" onClick={handleRemove}>
                <Trash2 aria-hidden="true" />
                {t('Xóa key', 'Remove key')}
              </Button>
            )}
          </div>

          {state === 'success' && <p role="status">{message}</p>}
        </form>
      )}
    </section>
  );
}
