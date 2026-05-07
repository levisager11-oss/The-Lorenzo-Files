/* eslint-env node */
/**
 * One-time migration: move the legacy top-level `/evidenceFiles` collection
 * and the global `users.experiencePoints` field into a built-in
 * `/databases/main` archive (members + scoped evidenceFiles + subcollections).
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json \
 *   ADMIN_UID=<owner uid> \
 *   node scripts/migrate-to-main-db.mjs [--dry-run] [--delete-legacy]
 *
 * Safe to re-run: writes are idempotent (setDoc with merge, deterministic IDs).
 * The destructive `--delete-legacy` flag is OFF by default.
 */

import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const argv = new Set(process.argv.slice(2));
const DRY_RUN = argv.has('--dry-run');
const DELETE_LEGACY = argv.has('--delete-legacy');
const ADMIN_UID = process.env.ADMIN_UID;
const MAIN_DB_ID = 'main';

if (!ADMIN_UID) {
    console.error('ADMIN_UID env var is required (uid of the original site admin).');
    process.exit(1);
}

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

function log(...args) {
    console.log(`[migrate]${DRY_RUN ? ' (dry-run)' : ''}`, ...args);
}

async function ensureMainDatabase() {
    const ref = db.collection('databases').doc(MAIN_DB_ID);
    const snap = await ref.get();
    if (snap.exists) {
        log(`databases/${MAIN_DB_ID} already exists.`);
        return ref;
    }
    const payload = {
        name: 'The Lorenzo Files',
        ownerId: ADMIN_UID,
        joinCode: 'MAIN',
        isMain: true,
        requiresUniversalPassword: true,
        createdAt: FieldValue.serverTimestamp(),
        memberCount: 0,
    };
    if (!DRY_RUN) await ref.set(payload);
    log(`Created databases/${MAIN_DB_ID}`);
    return ref;
}

async function copySubcollection(srcDocRef, dstDocRef, name) {
    const snap = await srcDocRef.collection(name).get();
    let n = 0;
    for (const doc of snap.docs) {
        if (!DRY_RUN) await dstDocRef.collection(name).doc(doc.id).set(doc.data(), { merge: true });
        n += 1;
    }
    return n;
}

async function migrateEvidenceFiles(mainRef) {
    const snap = await db.collection('evidenceFiles').get();
    log(`Found ${snap.size} evidence files to migrate.`);

    let totalReports = 0, totalVoters = 0, totalReportVoters = 0;

    for (const fileDoc of snap.docs) {
        const newFileRef = mainRef.collection('evidenceFiles').doc(fileDoc.id);
        if (!DRY_RUN) await newFileRef.set(fileDoc.data(), { merge: true });

        // voters
        totalVoters += await copySubcollection(fileDoc.ref, newFileRef, 'voters');

        // intelReports + their voters
        const reportsSnap = await fileDoc.ref.collection('intelReports').get();
        for (const reportDoc of reportsSnap.docs) {
            const newReportRef = newFileRef.collection('intelReports').doc(reportDoc.id);
            if (!DRY_RUN) await newReportRef.set(reportDoc.data(), { merge: true });
            totalReports += 1;
            totalReportVoters += await copySubcollection(reportDoc.ref, newReportRef, 'voters');
        }
    }

    log(`Copied ${snap.size} files, ${totalVoters} file-voters, ${totalReports} reports, ${totalReportVoters} report-voters.`);
    return snap.size;
}

async function migrateUsersToMembers(mainRef) {
    const snap = await db.collection('users').get();
    log(`Found ${snap.size} users to register as members of ${MAIN_DB_ID}.`);

    let count = 0;
    for (const userDoc of snap.docs) {
        const u = userDoc.data();
        const memberRef = mainRef.collection('members').doc(userDoc.id);
        const memberPayload = {
            uid: userDoc.id,
            username: u.username || '',
            joinedAt: u.createdAt || FieldValue.serverTimestamp(),
            experiencePoints: u.experiencePoints || 0,
        };
        if (!DRY_RUN) {
            await memberRef.set(memberPayload, { merge: true });
            await userDoc.ref.set({ currentDatabaseId: MAIN_DB_ID }, { merge: true });
        }
        count += 1;
    }
    if (!DRY_RUN) await mainRef.update({ memberCount: count });
    log(`Registered ${count} members.`);
}

async function deleteLegacyEvidence() {
    log(`Deleting legacy /evidenceFiles ...`);
    const snap = await db.collection('evidenceFiles').get();
    for (const fileDoc of snap.docs) {
        // delete subcollections first
        for (const sub of ['voters', 'intelReports']) {
            const subSnap = await fileDoc.ref.collection(sub).get();
            for (const d of subSnap.docs) {
                if (sub === 'intelReports') {
                    const vSnap = await d.ref.collection('voters').get();
                    for (const v of vSnap.docs) if (!DRY_RUN) await v.ref.delete();
                }
                if (!DRY_RUN) await d.ref.delete();
            }
        }
        if (!DRY_RUN) await fileDoc.ref.delete();
    }
    log(`Deleted ${snap.size} legacy evidence files.`);
}

(async () => {
    try {
        const mainRef = await ensureMainDatabase();
        await migrateEvidenceFiles(mainRef);
        await migrateUsersToMembers(mainRef);

        if (DELETE_LEGACY) {
            if (DRY_RUN) {
                log('Skipping legacy deletion in dry-run mode.');
            } else {
                await deleteLegacyEvidence();
            }
        } else {
            log('Skipped legacy deletion. Re-run with --delete-legacy after verifying.');
        }
        log('Done.');
        process.exit(0);
    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(2);
    }
})();
