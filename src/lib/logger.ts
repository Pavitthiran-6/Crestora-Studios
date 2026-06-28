import { supabase } from './supabase';

export type LogLevel = 'error' | 'warning' | 'info';

const isMinorError = (message: string, source: string, stack?: string): boolean => {
  const msg = (message || '').toLowerCase();
  const src = (source || '').toLowerCase();
  const stk = (stack || '').toLowerCase();

  // 1. ResizeObserver loop warnings (harmless browser warnings)
  if (msg.includes('resizeobserver') || stk.includes('resizeobserver')) {
    return true;
  }

  // 2. Browser Extension errors (third-party chrome-extension/moz-extension scripts)
  if (src.includes('extension://') || stk.includes('extension://') || msg.includes('extension')) {
    return true;
  }

  // 3. Network glitches (ad-blockers blocking analytics, connection drops)
  if (
    msg.includes('failed to fetch') ||
    msg.includes('network request failed') ||
    msg.includes('load failed') ||
    msg.includes('networkerror') ||
    msg.includes('abort')
  ) {
    return true;
  }

  // 4. Script errors lacking cross-origin details
  if (msg === 'script error.' || msg === 'uncaught script error.') {
    return true;
  }

  return false;
};

export const logSystemEvent = async (
  message: string, 
  source: string = 'frontend', 
  level: LogLevel = 'error', 
  error?: any
) => {
  let adjustedLevel = level;

  // Demote minor errors to 'warning' to prevent alerting email spam
  if (level === 'error' && isMinorError(message, source, error?.stack)) {
    adjustedLevel = 'warning';
  }

  try {
    const { error: insertError } = await supabase
      .from('system_logs')
      .insert({
        message,
        source,
        level: adjustedLevel,
        stack_trace: error?.stack || null,
        metadata: error ? { name: error.name, message: error.message } : null
      });

    if (insertError) {
      console.error('Failed to log to database:', insertError);
    } else if (adjustedLevel === 'error') {
      // 🚀 Explicitly trigger the notification function for critical errors
      // This ensures you get an email for EVERY major error immediately
      await supabase.functions.invoke('send-error-notification', {
        body: { message, source, stack: error?.stack }
      }).catch(err => console.error('Notification trigger failed:', err));
    }
  } catch (err) {
    console.error('Logger failed:', err);
  }
};
