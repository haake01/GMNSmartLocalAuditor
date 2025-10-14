import { supabase } from '../lib/supabase';

export interface ErrorLog {
  timestamp: string;
  type: 'pdf' | 'excel' | 'supabase' | 'api' | 'general';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  recovered: boolean;
  recoveryAttempts: number;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxRetries = 3;
  private retryDelay = 2000;

  async logError(
    type: ErrorLog['type'],
    error: Error,
    context?: Record<string, any>
  ): Promise<void> {
    const log: ErrorLog = {
      timestamp: new Date().toISOString(),
      type,
      message: error.message,
      stack: error.stack,
      context,
      recovered: false,
      recoveryAttempts: 0
    };

    this.logs.push(log);

    console.error(`[${type.toUpperCase()}] Error logged:`, {
      message: error.message,
      context,
      timestamp: log.timestamp
    });

    await this.saveToLocalStorage();
    await this.saveToSupabase(log);
  }

  async retryOperation<T>(
    operation: () => Promise<T>,
    type: ErrorLog['type'],
    context?: Record<string, any>
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await operation();

        if (attempt > 1) {
          await this.logRecovery(type, attempt, context);
        }

        return result;
      } catch (error) {
        lastError = error as Error;

        console.warn(`Attempt ${attempt}/${this.maxRetries} failed for ${type}:`, error);

        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    if (lastError) {
      await this.logError(type, lastError, {
        ...context,
        attempts: this.maxRetries,
        failed: true
      });
      throw lastError;
    }

    throw new Error('Operation failed without error');
  }

  private async logRecovery(
    type: ErrorLog['type'],
    attempts: number,
    context?: Record<string, any>
  ): Promise<void> {
    const log: ErrorLog = {
      timestamp: new Date().toISOString(),
      type,
      message: `Operation recovered after ${attempts} attempts`,
      recovered: true,
      recoveryAttempts: attempts,
      context
    };

    this.logs.push(log);
    await this.saveToLocalStorage();
    await this.saveToSupabase(log);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async saveToLocalStorage(): Promise<void> {
    try {
      const logsToSave = this.logs.slice(-100);
      localStorage.setItem('gmn_error_logs', JSON.stringify(logsToSave));
    } catch (error) {
      console.error('Failed to save logs to localStorage:', error);
    }
  }

  private async saveToSupabase(log: ErrorLog): Promise<void> {
    try {
      const { error } = await supabase
        .from('error_logs')
        .insert({
          timestamp: log.timestamp,
          type: log.type,
          message: log.message.substring(0, 2000),
          stack: log.stack?.substring(0, 2000),
          context: log.context || {},
          recovered: log.recovered,
          recovery_attempts: log.recoveryAttempts
        });

      if (error) {
        console.error('Failed to save log to Supabase:', error);
      }
    } catch (error) {
      console.error('Exception saving log to Supabase:', error);
    }
  }

  async getLogsFromSupabase(limit: number = 100): Promise<ErrorLog[]> {
    try {
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(row => ({
        timestamp: row.timestamp,
        type: row.type,
        message: row.message,
        stack: row.stack,
        context: row.context,
        recovered: row.recovered,
        recoveryAttempts: row.recovery_attempts
      }));
    } catch (error) {
      console.error('Failed to fetch logs from Supabase:', error);
      return [];
    }
  }

  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  getLogsByType(type: ErrorLog['type']): ErrorLog[] {
    return this.logs.filter(log => log.type === type);
  }

  clearLogs(): void {
    this.logs = [];
    localStorage.removeItem('gmn_error_logs');
  }

  exportLogs(): string {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `error_log_${timestamp}.json`;
    const content = JSON.stringify(this.logs, null, 2);

    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    return filename;
  }

  loadLogsFromStorage(): void {
    try {
      const stored = localStorage.getItem('gmn_error_logs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load logs from localStorage:', error);
    }
  }
}

export const errorLogger = new ErrorLogger();

errorLogger.loadLogsFromStorage();

export async function withAutoRecovery<T>(
  operation: () => Promise<T>,
  type: ErrorLog['type'],
  context?: Record<string, any>,
  fallbackValue?: T
): Promise<T> {
  try {
    return await errorLogger.retryOperation(operation, type, context);
  } catch (error) {
    if (fallbackValue !== undefined) {
      console.warn(`Using fallback value after all retry attempts failed for ${type}`);
      return fallbackValue;
    }
    throw error;
  }
}

export function logError(
  type: ErrorLog['type'],
  error: Error,
  context?: Record<string, any>
): void {
  errorLogger.logError(type, error, context);
}

export function exportErrorLogs(): string {
  return errorLogger.exportLogs();
}

export function clearErrorLogs(): void {
  errorLogger.clearLogs();
}

export function getErrorLogs(): ErrorLog[] {
  return errorLogger.getLogs();
}

export function getErrorLogsByType(type: ErrorLog['type']): ErrorLog[] {
  return errorLogger.getLogsByType(type);
}

export async function getErrorLogsFromDatabase(limit: number = 100): Promise<ErrorLog[]> {
  return errorLogger.getLogsFromSupabase(limit);
}
