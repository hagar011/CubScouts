/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from '../lib/firebase';
import { 
  doc as firestoreDoc, 
  collection as firestoreCollection,
  getDoc,
  setDoc,
  updateDoc
} from 'firebase/firestore';

// دالة حماية وتوجيه المستندات الموحدة transparent proxy لتوحيد الجداول بالكامل
export const getProxyDocRef = (collectionPath: string, docId: string) => {
  let finalPath = collectionPath;
  if (collectionPath === 'cubs' || collectionPath === 'pending_cubs') {
    finalPath = 'scouts';
  } else if (collectionPath === 'sextets') {
    finalPath = 'sixes';
  }
  return firestoreDoc(db, finalPath, docId);
};

// دالة حماية وتوجيه المجموعات الموحدة
export const getProxyCollectionRef = (collectionPath: string) => {
  let finalPath = collectionPath;
  if (collectionPath === 'cubs' || collectionPath === 'pending_cubs') {
    finalPath = 'scouts';
  } else if (collectionPath === 'sextets') {
    finalPath = 'sixes';
  }
  return firestoreCollection(db, finalPath);
};

/**
 * Updates any scout or cub document safely
 */
export const updateScoutProfile = async (scoutId: string, data: any) => {
  const docRef = getProxyDocRef('scouts', scoutId);
  await updateDoc(docRef, data);
};

/**
 * Creates or merges scout profile
 */
export const writeScoutProfile = async (scoutId: string, data: any) => {
  const docRef = getProxyDocRef('scouts', scoutId);
  await setDoc(docRef, data, { merge: true });
};
