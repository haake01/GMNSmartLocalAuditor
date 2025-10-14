import { supabase } from '../lib/supabase';
import { RealCompanyAudit } from './batchAudit';
import { CompetitiveComparison } from './competitiveComparison';
import { MultiPlatformAnalysis } from './platformPresence';
import { logError, withAutoRecovery } from '../utils/errorLogger';

export type BackupType = 'full' | 'partial' | 'emergency';

export interface BackupMetadata {
  source: string;
  recordCount: number;
  size: number;
  compressed: boolean;
  version: string;
}

export interface AuditBackup {
  id: string;
  audit_id?: string;
  backup_data: any;
  backup_type: BackupType;
  created_at: string;
  metadata: BackupMetadata;
}

class BackupService {
  private readonly CHUNK_SIZE = 50;
  private readonly VERSION = '1.0.0';

  async backupAuditResults(
    auditId: string,
    results: RealCompanyAudit[],
    type: BackupType = 'full'
  ): Promise<string | null> {
    try {
      return await withAutoRecovery(
        async () => {
          const metadata: BackupMetadata = {
            source: 'batch_audit',
            recordCount: results.length,
            size: JSON.stringify(results).length,
            compressed: false,
            version: this.VERSION
          };

          const { data, error } = await supabase
            .from('audit_backups')
            .insert({
              audit_id: auditId,
              backup_data: { results },
              backup_type: type,
              metadata
            })
            .select()
            .single();

          if (error) throw error;

          console.log(`✅ Backup created successfully: ${data.id}`);
          return data.id;
        },
        'supabase',
        { operation: 'backup_audit', auditId, resultCount: results.length }
      );
    } catch (error) {
      console.error('Failed to create backup after retries:', error);
      await this.createEmergencyBackup(auditId, results);
      return null;
    }
  }

  async backupComparison(
    comparison: CompetitiveComparison,
    type: BackupType = 'full'
  ): Promise<string | null> {
    try {
      return await withAutoRecovery(
        async () => {
          const metadata: BackupMetadata = {
            source: 'competitive_comparison',
            recordCount: 1,
            size: JSON.stringify(comparison).length,
            compressed: false,
            version: this.VERSION
          };

          const { data, error } = await supabase
            .from('audit_backups')
            .insert({
              backup_data: { comparison },
              backup_type: type,
              metadata
            })
            .select()
            .single();

          if (error) throw error;

          console.log(`✅ Comparison backup created: ${data.id}`);
          return data.id;
        },
        'supabase',
        { operation: 'backup_comparison', companyName: comparison.company_name }
      );
    } catch (error) {
      console.error('Failed to backup comparison:', error);
      await this.createEmergencyBackup('comparison', comparison);
      return null;
    }
  }

  async backupPlatformAnalysis(
    analysis: MultiPlatformAnalysis,
    type: BackupType = 'full'
  ): Promise<string | null> {
    try {
      return await withAutoRecovery(
        async () => {
          const metadata: BackupMetadata = {
            source: 'platform_analysis',
            recordCount: 1,
            size: JSON.stringify(analysis).length,
            compressed: false,
            version: this.VERSION
          };

          const { data, error } = await supabase
            .from('audit_backups')
            .insert({
              backup_data: { analysis },
              backup_type: type,
              metadata
            })
            .select()
            .single();

          if (error) throw error;

          console.log(`✅ Platform analysis backup created: ${data.id}`);
          return data.id;
        },
        'supabase',
        { operation: 'backup_platform', companyName: analysis.company_name }
      );
    } catch (error) {
      console.error('Failed to backup platform analysis:', error);
      await this.createEmergencyBackup('platform', analysis);
      return null;
    }
  }

  async restoreBackup(backupId: string): Promise<any> {
    try {
      return await withAutoRecovery(
        async () => {
          const { data, error } = await supabase
            .from('audit_backups')
            .select('*')
            .eq('id', backupId)
            .single();

          if (error) throw error;
          if (!data) throw new Error('Backup not found');

          console.log(`✅ Backup restored: ${backupId}`);
          return data.backup_data;
        },
        'supabase',
        { operation: 'restore_backup', backupId }
      );
    } catch (error) {
      console.error('Failed to restore backup:', error);
      logError('supabase', error as Error, { operation: 'restore_backup', backupId });
      return null;
    }
  }

  async listBackups(limit: number = 50): Promise<AuditBackup[]> {
    try {
      const { data, error } = await supabase
        .from('audit_backups')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Failed to list backups:', error);
      return [];
    }
  }

  async deleteOldBackups(daysToKeep: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { data, error } = await supabase
        .from('audit_backups')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .neq('backup_type', 'emergency')
        .select();

      if (error) throw error;

      const deletedCount = data?.length || 0;
      console.log(`🗑️ Deleted ${deletedCount} old backups`);
      return deletedCount;
    } catch (error) {
      console.error('Failed to delete old backups:', error);
      return 0;
    }
  }

  private async createEmergencyBackup(id: string, data: any): Promise<void> {
    try {
      const timestamp = new Date().getTime();
      const key = `emergency_backup_${id}_${timestamp}`;

      localStorage.setItem(key, JSON.stringify({
        id,
        data,
        timestamp: new Date().toISOString(),
        type: 'emergency'
      }));

      console.warn(`⚠️ Emergency backup created in localStorage: ${key}`);

      const backupKeys = Object.keys(localStorage).filter(k => k.startsWith('emergency_backup_'));
      if (backupKeys.length > 10) {
        const oldestKey = backupKeys.sort()[0];
        localStorage.removeItem(oldestKey);
      }
    } catch (error) {
      console.error('Failed to create emergency backup:', error);
    }
  }

  async syncEmergencyBackups(): Promise<number> {
    try {
      const backupKeys = Object.keys(localStorage).filter(k => k.startsWith('emergency_backup_'));
      let syncedCount = 0;

      for (const key of backupKeys) {
        try {
          const backup = JSON.parse(localStorage.getItem(key) || '{}');

          const metadata: BackupMetadata = {
            source: 'emergency_sync',
            recordCount: 1,
            size: JSON.stringify(backup.data).length,
            compressed: false,
            version: this.VERSION
          };

          const { error } = await supabase
            .from('audit_backups')
            .insert({
              backup_data: backup.data,
              backup_type: 'emergency',
              metadata
            });

          if (!error) {
            localStorage.removeItem(key);
            syncedCount++;
          }
        } catch (error) {
          console.error(`Failed to sync emergency backup ${key}:`, error);
        }
      }

      if (syncedCount > 0) {
        console.log(`✅ Synced ${syncedCount} emergency backups to database`);
      }

      return syncedCount;
    } catch (error) {
      console.error('Failed to sync emergency backups:', error);
      return 0;
    }
  }
}

export const backupService = new BackupService();

export async function createBackup(
  type: 'audit' | 'comparison' | 'platform',
  data: any,
  auditId?: string
): Promise<string | null> {
  switch (type) {
    case 'audit':
      return backupService.backupAuditResults(auditId || 'unknown', data, 'full');
    case 'comparison':
      return backupService.backupComparison(data, 'full');
    case 'platform':
      return backupService.backupPlatformAnalysis(data, 'full');
    default:
      return null;
  }
}

export async function restoreBackup(backupId: string): Promise<any> {
  return backupService.restoreBackup(backupId);
}

export async function listBackups(limit?: number): Promise<AuditBackup[]> {
  return backupService.listBackups(limit);
}

export async function cleanupOldBackups(daysToKeep?: number): Promise<number> {
  return backupService.deleteOldBackups(daysToKeep);
}

export async function syncEmergencyBackups(): Promise<number> {
  return backupService.syncEmergencyBackups();
}
