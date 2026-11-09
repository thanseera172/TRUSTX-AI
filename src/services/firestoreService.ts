import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase.ts';
import { VerificationRecord, UserProfile } from '../types/index.ts';

const VERIFICATIONS_COLLECTION = 'verifications';
const USERS_COLLECTION = 'users';

/**
 * Creates or updates a user profile document in Firestore
 */
export async function saveUserProfile(user: UserProfile): Promise<void> {
  const path = `${USERS_COLLECTION}/${user.uid}`;
  try {
    const userRef = doc(db, USERS_COLLECTION, user.uid);
    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        theme: user.theme || 'dark',
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Retrieves a user profile document from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `${USERS_COLLECTION}/${uid}`;
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Saves a verification record to Firestore
 */
export async function saveVerificationRecord(record: VerificationRecord): Promise<void> {
  const path = `${VERIFICATIONS_COLLECTION}/${record.verificationId}`;
  try {
    const ref = doc(db, VERIFICATIONS_COLLECTION, record.verificationId);
    await setDoc(ref, {
      ...record,
      savedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetches all verification records for a specific authenticated user
 */
export async function getUserVerifications(userId: string): Promise<VerificationRecord[]> {
  const path = VERIFICATIONS_COLLECTION;
  try {
    const q = query(
      collection(db, VERIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    const records: VerificationRecord[] = [];
    snap.forEach((d) => {
      records.push(d.data() as VerificationRecord);
    });
    return records;
  } catch (error) {
    // If order by requires composite index before created, fallback to client sort
    try {
      const fallbackQuery = query(collection(db, VERIFICATIONS_COLLECTION), where('userId', '==', userId));
      const snap = await getDocs(fallbackQuery);
      const records: VerificationRecord[] = [];
      snap.forEach((d) => {
        records.push(d.data() as VerificationRecord);
      });
      return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (fallbackError) {
      handleFirestoreError(fallbackError, OperationType.LIST, path);
    }
  }
}

/**
 * Retrieves a specific verification record by ID
 */
export async function getVerificationById(verificationId: string): Promise<VerificationRecord | null> {
  const path = `${VERIFICATIONS_COLLECTION}/${verificationId}`;
  try {
    const ref = doc(db, VERIFICATIONS_COLLECTION, verificationId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as VerificationRecord;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Deletes a verification record
 */
export async function deleteVerificationRecord(verificationId: string): Promise<void> {
  const path = `${VERIFICATIONS_COLLECTION}/${verificationId}`;
  try {
    const ref = doc(db, VERIFICATIONS_COLLECTION, verificationId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Calculates aggregate dashboard metrics strictly from real user records
 */
export function calculateDashboardStats(records: VerificationRecord[]) {
  let totalVerifications = records.length;
  let supportedClaims = 0;
  let refutedClaims = 0;
  let insufficientClaims = 0;
  let citationIssues = 0;
  let securityFindings = 0;

  for (const r of records) {
    if (r.assessment) {
      supportedClaims += r.assessment.supportedClaimsCount || 0;
      refutedClaims += r.assessment.refutedClaimsCount || 0;
      insufficientClaims += r.assessment.insufficientClaimsCount || 0;
      citationIssues += (r.assessment.mismatchedCitationsCount || 0) + (r.assessment.notFoundCitationsCount || 0);
      securityFindings +=
        (r.assessment.criticalSecurityCount || 0) +
        (r.assessment.highSecurityCount || 0) +
        (r.assessment.mediumSecurityCount || 0) +
        (r.assessment.lowSecurityCount || 0);
    }
  }

  return {
    totalVerifications,
    supportedClaims,
    refutedClaims,
    insufficientClaims,
    citationIssues,
    securityFindings,
  };
}
