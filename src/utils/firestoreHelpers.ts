/**
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  Firestore,
  doc,
  runTransaction,
  deleteField,
} from 'firebase/firestore';

interface PointsOptions {
  clearPendingHomeChallenge?: boolean;
  notificationMessage?: string;
}

/**
 * Increment points and award badges atomically to a cub in both 'cubs' and 'scouts' paths
 */
export async function atomicAddPoints(
  db: Firestore,
  cubId: string,
  pts: number,
  extraBadges: string[] = [],
  options: PointsOptions = {}
): Promise<void> {
  const cubRef = doc(db, 'cubs', cubId);
  const scoutRef = doc(db, 'scouts', cubId);

  await runTransaction(db, async (transaction) => {
    const cubSnap = await transaction.get(cubRef);
    const scoutSnap = await transaction.get(scoutRef);

    let currentPoints = 0;
    let currentBadges: string[] = [];
    let currentNotifications: Array<Record<string, unknown>> = [];

    const data = cubSnap.exists() ? cubSnap.data() : scoutSnap.exists() ? scoutSnap.data() : null;
    if (data) {
      currentPoints = Number(data.points ?? 0);
      currentBadges = Array.isArray(data.badges) ? data.badges.filter(Boolean) : [];
      currentNotifications = Array.isArray(data.notifications) ? data.notifications.filter(Boolean) as Array<Record<string, unknown>> : [];
    }

    const newPoints = currentPoints + pts;
    const uniqueBadges = Array.from(new Set([...currentBadges, ...extraBadges].filter(Boolean)));

    const updates: Record<string, unknown> = {
      points: newPoints,
      badges: uniqueBadges,
      updatedAt: new Date().toISOString(),
    };

    if (options.clearPendingHomeChallenge) {
      updates.pendingHomeChallenge = deleteField();
    }

    if (options.notificationMessage) {
      updates.notificationMessage = options.notificationMessage;

      const newNotif = {
        id: Math.random().toString(36).slice(2),
        message: options.notificationMessage,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false,
      };

      updates.notifications = [newNotif, ...currentNotifications].slice(0, 25);
    }

    if (cubSnap.exists()) {
      transaction.update(cubRef, updates);
    } else {
      transaction.set(cubRef, updates, { merge: true });
    }

    if (scoutSnap.exists()) {
      transaction.update(scoutRef, updates);
    } else {
      transaction.set(scoutRef, updates, { merge: true });
    }
  });
}

/**
 * Same atomic upgrade specifically for inline games / challenges
 */
export async function atomicAddGamePoints(
  db: Firestore,
  cubId: string,
  pts: number,
  extraBadges: string[] = []
): Promise<void> {
  return atomicAddPoints(db, cubId, pts, extraBadges);
}

/**
 * Increment a sextet's score summary atomically
 */
export async function atomicUpdateSextetPoints(
  db: Firestore,
  sextetId: string,
  delta: number
): Promise<void> {
  const sextetRef = doc(db, 'sextets', sextetId);
  const sixRef = doc(db, 'sixes', sextetId);

  await runTransaction(db, async (transaction) => {
    const sextetSnap = await transaction.get(sextetRef);
    const sixSnap = await transaction.get(sixRef);

    let currentPoints = 0;
    if (sextetSnap.exists()) {
      currentPoints = Number(sextetSnap.data().points ?? 0);
    } else if (sixSnap.exists()) {
      currentPoints = Number(sixSnap.data().points ?? 0);
    }

    const newPoints = currentPoints + delta;
    const payload = {
      points: newPoints,
      totalPoints: newPoints,
      updatedAt: new Date().toISOString(),
    };

    if (sextetSnap.exists()) {
      transaction.update(sextetRef, payload);
    } else {
      transaction.set(sextetRef, payload, { merge: true });
    }

    if (sixSnap.exists()) {
      transaction.update(sixRef, payload);
    } else {
      transaction.set(sixRef, payload, { merge: true });
    }
  });
}
