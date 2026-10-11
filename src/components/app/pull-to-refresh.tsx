'use client';

import {useState,useEffect,useRef,useCallback} from 'react';
import {useApp} from './provider';
import {RefreshCw,Sparkles} from 'lucide-react';
import {cn} from '@/lib/utils';

const PULL_THRESHOLD = 68; // px needed to trigger refresh
const MAX_PULL = 110;      // max visual drag distance

export function PullToRefresh() {
  const {t} = useApp();
  const [pullY, setPullY] = useState(0);
  const [status, setStatus] = useState<'idle' | 'pulling' | 'ready' | 'refreshing'>('idle');
  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const isPullingRef = useRef(false);
  const statusRef = useRef(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const performRefresh = useCallback(() => {
    setStatus('refreshing');
    setPullY(54);
    // Give time for pleasant visual animation before reload
    setTimeout(() => {
      window.location.reload();
    }, 750);
  }, []);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    let touchActive = false;

    const onTouchStart = (e: TouchEvent) => {
      if (statusRef.current === 'refreshing') return;
      // Only initiate pull when at the absolute top of the page
      if (window.scrollY > 1 || document.documentElement.scrollTop > 1) return;

      const touch = e.touches[0];
      startYRef.current = touch.clientY;
      startXRef.current = touch.clientX;
      touchActive = true;
      isPullingRef.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touchActive || statusRef.current === 'refreshing') return;
      if (window.scrollY > 1 || document.documentElement.scrollTop > 1) {
        touchActive = false;
        setPullY(0);
        setStatus('idle');
        return;
      }

      const touch = e.touches[0];
      const diffY = touch.clientY - startYRef.current;
      const diffX = Math.abs(touch.clientX - startXRef.current);

      // If user is swiping horizontally more than vertically, do not pull
      if (diffX > diffY && !isPullingRef.current) {
        touchActive = false;
        return;
      }

      if (diffY > 0) {
        // Logarithmic damping for smooth native rubber-band feeling
        const damped = Math.min(MAX_PULL, Math.pow(diffY, 0.85) * 1.6);
        isPullingRef.current = true;
        setPullY(damped);

        if (damped >= PULL_THRESHOLD) {
          setStatus('ready');
        } else {
          setStatus('pulling');
        }

        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };

    const onTouchEnd = () => {
      if (!touchActive || statusRef.current === 'refreshing') return;
      touchActive = false;

      if (statusRef.current === 'ready') {
        performRefresh();
      } else {
        setPullY(0);
        setStatus('idle');
      }
      isPullingRef.current = false;
    };

    // Also support mouse drag on the top bar for easy desktop testing
    let mouseActive = false;
    const onMouseDown = (e: MouseEvent) => {
      if (statusRef.current === 'refreshing') return;
      if (window.scrollY > 0 || e.clientY > 90) return;
      // Left click only
      if (e.button !== 0) return;

      startYRef.current = e.clientY;
      startXRef.current = e.clientX;
      mouseActive = true;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!mouseActive || statusRef.current === 'refreshing') return;
      const diffY = e.clientY - startYRef.current;
      if (diffY > 0 && window.scrollY <= 0) {
        const damped = Math.min(MAX_PULL, Math.pow(diffY, 0.85) * 1.6);
        setPullY(damped);
        setStatus(damped >= PULL_THRESHOLD ? 'ready' : 'pulling');
      }
    };

    const onMouseUp = () => {
      if (!mouseActive || statusRef.current === 'refreshing') return;
      mouseActive = false;
      if (statusRef.current === 'ready') {
        performRefresh();
      } else {
        setPullY(0);
        setStatus('idle');
      }
    };

    window.addEventListener('touchstart', onTouchStart, {passive: true});
    window.addEventListener('touchmove', onTouchMove, {passive: false});
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);

      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [performRefresh]);

  if (status === 'idle' && pullY === 0) {
    return null;
  }

  const progress = Math.min(1, pullY / PULL_THRESHOLD);
  const ringCircumference = 2 * Math.PI * 16;
  const strokeDashoffset = ringCircumference * (1 - progress);

  return (
    <div
      className={cn(
        'pull-to-refresh-container',
        status === 'refreshing' && 'is-refreshing',
        status === 'ready' && 'is-ready'
      )}
      style={{
        transform: `translateY(${pullY}px)`,
      }}
      aria-live="polite"
      aria-label={t('Làm mới trang', 'Pull to refresh')}
    >
      <div className="pull-to-refresh-card">
        {/* Circular Progress & Fox Badge */}
        <div className="pull-badge-wrapper">
          <svg className="pull-progress-ring" width="44" height="44" viewBox="0 0 44 44">
            <circle
              className="pull-ring-bg"
              cx="22"
              cy="22"
              r="16"
              strokeWidth="3.5"
            />
            <circle
              className="pull-ring-fill"
              cx="22"
              cy="22"
              r="16"
              strokeWidth="3.5"
              strokeDasharray={ringCircumference}
              strokeDashoffset={status === 'refreshing' ? 0 : strokeDashoffset}
            />
          </svg>

          {/* Fox Icon Indicator */}
          <div className={cn('pull-mascot-icon', status === 'refreshing' && 'mascot-spinning')}>
            {status === 'refreshing' ? (
              <RefreshCw className="animate-spin text-primary" size={20} />
            ) : (
              <svg
                viewBox="0 0 200 220"
                className="fox-mini"
                style={{
                  transform: `rotate(${progress * 25 - 12}deg) scale(${0.85 + progress * 0.2})`,
                  transition: status === 'ready' ? 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
                }}
              >
                {/* Simplified Mascot Fox SVG for Crisp Small Render */}
                <path d="M129 168q15-54 56-52 2 69-62 84" fill="#ff925c" stroke="#38213d" strokeWidth="5"/>
                <path d="M63 144q-18 24-12 56h90q6-34-20-54Z" fill="#ff925c" stroke="#38213d" strokeWidth="5"/>
                <path d="M34 98 24 25q-1-12 10-7l41 44q23-12 49 0l42-27q14-7 12 7l-8 58q24 41-13 54c-6 14-18 9-31 10q-31 19-54-2-31 8-39-12-17-10 1-52Z" fill="#ff925c" stroke="#38213d" strokeWidth="5"/>
                <path d="M42 112q13-35 39-23 11 6 18 22 7-23 31-23 24 3 33 27l-5 29q-26 16-37 17-22 22-44 0-21-1-40-23Z" fill="#fff0d8"/>
                <path d="M58 110q10-18 19 0m45 0q10-18 19 0" stroke="#38213d" strokeWidth="8" fill="none" strokeLinecap="round"/>
                <ellipse cx="99" cy="120" rx="8" ry="6" fill="#38213d"/>
                <path d="M86 133q13 7 25-1c-2 26-25 26-25 1Z" fill="#ee7087" stroke="#38213d" strokeWidth="4"/>
                <ellipse cx="54" cy="128" rx="9" ry="6" fill="#ffb1a2"/>
                <ellipse cx="147" cy="128" rx="9" ry="6" fill="#ffb1a2"/>
              </svg>
            )}
          </div>
        </div>

        {/* Status Text & Indicator */}
        <div className="pull-status-text">
          {status === 'refreshing' && (
            <span className="pull-label refreshing">
              <Sparkles className="inline-icon" size={14} />
              {t('Đang làm mới...', 'Refreshing...')}
            </span>
          )}
          {status === 'ready' && (
            <span className="pull-label ready">
              {t('Thả tay để làm mới ✨', 'Release to refresh ✨')}
            </span>
          )}
          {status === 'pulling' && (
            <span className="pull-label pulling">
              {t('Kéo xuống để làm mới', 'Pull down to refresh')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
