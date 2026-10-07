import { CustomerProfile, ReadinessReport, FrictionAnalysis } from '../types/integration';
import { mockProfiles } from '../data/mockProfiles';

const DB_NAME = 'IntegrationOS_DB';
const DB_VERSION = 1;

export interface EvaluationRecord {
  id: string;
  profileId: string;
  profileName: string;
  timestamp: string;
  status: 'READY' | 'READY WITH CONDITIONS' | 'BLOCKED';
  overallFrictionScore: number;
  confidencePercentage: number;
  timeToFirstRequest: string;
  hardBlockersCount: number;
  mandatoryConditionsCount: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Profiles Store
      if (!db.objectStoreNames.contains('profiles')) {
        db.createObjectStore('profiles', { keyPath: 'id' });
      }

      // 2. Evaluations Store
      if (!db.objectStoreNames.contains('evaluations')) {
        const evalStore = db.createObjectStore('evaluations', { keyPath: 'id' });
        evalStore.createIndex('by_profileId', 'profileId', { unique: false });
        evalStore.createIndex('by_timestamp', 'timestamp', { unique: false });
      }

      // 3. Custom Requirement Changes Store
      if (!db.objectStoreNames.contains('custom_changes')) {
        db.createObjectStore('custom_changes', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Initialize the database and pre-seed with default profiles if empty.
 */
export async function initDatabase(): Promise<CustomerProfile[]> {
  try {
    const db = await openDb();
    const existingProfiles = await getAllProfilesFromDb(db);

    if (existingProfiles.length === 0) {
      // Seed default profiles
      const tx = db.transaction('profiles', 'readwrite');
      const store = tx.objectStore('profiles');
      for (const p of mockProfiles) {
        store.put(p);
      }
      await new Promise<void>((res, rej) => {
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
      return mockProfiles;
    }

    return existingProfiles;
  } catch (err) {
    console.warn('IndexedDB initialization failed, falling back to in-memory profiles:', err);
    return mockProfiles;
  }
}

/**
 * Get all profiles from IndexedDB
 */
export async function getAllProfilesFromDb(dbInstance?: IDBDatabase): Promise<CustomerProfile[]> {
  try {
    const db = dbInstance || (await openDb());
    return new Promise((resolve, reject) => {
      const tx = db.transaction('profiles', 'readonly');
      const store = tx.objectStore('profiles');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as CustomerProfile[]);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to read profiles from DB:', err);
    return [];
  }
}

/**
 * Save / Update a customer profile in IndexedDB
 */
export async function saveProfileToDb(profile: CustomerProfile): Promise<void> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('profiles', 'readwrite');
      const store = tx.objectStore('profiles');
      const request = store.put(profile);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to save profile to IndexedDB:', err);
  }
}

/**
 * Delete a profile from IndexedDB
 */
export async function deleteProfileFromDb(profileId: string): Promise<void> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('profiles', 'readwrite');
      const store = tx.objectStore('profiles');
      const request = store.delete(profileId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to delete profile from IndexedDB:', err);
  }
}

/**
 * Save an evaluation snapshot in the audit history table
 */
export async function saveEvaluationSnapshot(
  profile: CustomerProfile,
  report: ReadinessReport,
  friction: FrictionAnalysis
): Promise<EvaluationRecord> {
  const record: EvaluationRecord = {
    id: `eval_${profile.id}_${Date.now()}`,
    profileId: profile.id,
    profileName: profile.name,
    timestamp: new Date().toISOString(),
    status: report.status,
    overallFrictionScore: friction.overallScore,
    confidencePercentage: report.confidencePercentage,
    timeToFirstRequest: report.timeToFirstRequest,
    hardBlockersCount: report.hardBlockers.length,
    mandatoryConditionsCount: report.mandatoryConditions.length,
  };

  try {
    const db = await openDb();
    const tx = db.transaction('evaluations', 'readwrite');
    const store = tx.objectStore('evaluations');
    store.put(record);
  } catch (err) {
    console.warn('Failed to save evaluation snapshot:', err);
  }

  return record;
}

/**
 * Retrieve evaluation history for a given profile
 */
export async function getEvaluationsFromDb(profileId?: string): Promise<EvaluationRecord[]> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('evaluations', 'readonly');
      const store = tx.objectStore('evaluations');
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result as EvaluationRecord[];
        if (profileId) {
          results = results.filter((r) => r.profileId === profileId);
        }
        results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to read evaluations from DB:', err);
    return [];
  }
}

/**
 * Export complete database JSON dump
 */
export async function exportDatabaseBackup(): Promise<string> {
  const db = await openDb();
  const profiles = await getAllProfilesFromDb(db);
  const evaluations = await getEvaluationsFromDb();

  const backupData = {
    appName: 'IntegrationOS',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    databaseName: DB_NAME,
    tables: {
      profiles,
      evaluations,
    },
  };

  return JSON.stringify(backupData, null, 2);
}

/**
 * Import database JSON dump
 */
export async function importDatabaseBackup(jsonString: string): Promise<CustomerProfile[]> {
  const parsed = JSON.parse(jsonString);
  if (!parsed.tables || !Array.isArray(parsed.tables.profiles)) {
    throw new Error('Invalid backup schema: missing profiles table');
  }

  const db = await openDb();

  // Clear and rewrite profiles
  const txProfiles = db.transaction('profiles', 'readwrite');
  const storeProfiles = txProfiles.objectStore('profiles');
  storeProfiles.clear();
  for (const p of parsed.tables.profiles) {
    storeProfiles.put(p);
  }

  // Clear and rewrite evaluations if present
  if (Array.isArray(parsed.tables.evaluations)) {
    const txEvals = db.transaction('evaluations', 'readwrite');
    const storeEvals = txEvals.objectStore('evaluations');
    storeEvals.clear();
    for (const ev of parsed.tables.evaluations) {
      storeEvals.put(ev);
    }
  }

  return parsed.tables.profiles;
}

/**
 * Reset database to default mock profiles
 */
export async function resetDatabaseToDefaults(): Promise<CustomerProfile[]> {
  const db = await openDb();

  const tx = db.transaction(['profiles', 'evaluations', 'custom_changes'], 'readwrite');
  tx.objectStore('profiles').clear();
  tx.objectStore('evaluations').clear();
  tx.objectStore('custom_changes').clear();

  for (const p of mockProfiles) {
    tx.objectStore('profiles').put(p);
  }

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  return mockProfiles;
}
