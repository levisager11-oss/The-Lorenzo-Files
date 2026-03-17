import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { evidenceFiles } from '../src/data/files.js';

// ** User must provide their own service account JSON file here **
// Download from Firebase Console -> Project Settings -> Service Accounts -> Generate new private key
// Save it as `serviceAccountKey.json` in the LOLOFiles root directory.
const serviceAccount = JSON.parse(readFileSync(new URL('../serviceAccountKey.json', import.meta.url)));

const app = initializeApp({
    credential: cert(serviceAccount),
    storageBucket: 'the-lorenzo-files.firebasestorage.app'
});

const db = getFirestore(app);
const bucket = getStorage(app).bucket();

async function seedData() {
    console.log('🌱 Starting database seed and file generation...');

    for (const file of evidenceFiles) {
        console.log(`\nProcessing reference for: ${file.name} (ID: ${file.id})`);

        // 1. Generate a physical dummy file locally
        const dummyContent = `[CLASSIFIED LORENZO U.R.D.]\n\nOriginal file: ${file.name}\nContext: ${file.redactedText}\nDate Captured: ${file.date}\n\nWARNING: UNAUTHORIZED DISTRIBUTION IS PUNISHABLE BY KARAOKE.`;
        const tempPath = `./${file.name}`;
        writeFileSync(tempPath, dummyContent);
        console.log(`  📝 Created physical dummy file at ${tempPath}`);

        try {
            // 2. Upload to Firebase Storage
            const storagePath = `uploads/seed_${file.id}_${file.name}`;
            console.log(`  ☁️ Uploading to Storage bucket at ${storagePath}...`);

            const [uploadedFile] = await bucket.upload(tempPath, {
                destination: storagePath,
                public: true, // Make publicly accessible for easy downloading
                metadata: {
                    cacheControl: 'public, max-age=31536000',
                }
            });

            // 3. Get the public download URL
            // Firebase Admin SDK doesn't generate the same long-lived tokens as the client Web SDK by default when making public.
            // But if we make the file public, we can construct the direct Google Storage URL or use getSignedUrl
            const [downloadURL] = await uploadedFile.getSignedUrl({
                action: 'read',
                expires: '01-01-2100' // Far future
            });

            console.log(`  🔗 Generated Download URL: ${downloadURL.substring(0, 50)}...`);

            // 4. Update the Firestore Document with the new URL
            const docRef = db.collection('evidenceFiles').doc(file.id.toString());

            const newEvidenceData = {
                ...file,
                downloadURL: downloadURL
            };

            await docRef.set(newEvidenceData);
            console.log(`  💾 Saved metadata to Firestore Document ID: ${file.id}`);

        } catch (error) {
            console.error(`  ❌ Error processing ${file.name}:`, error);
        } finally {
            // Clean up the local temp file
            unlinkSync(tempPath);
            console.log(`  🧹 Cleaned up local temp file.`);
        }
    }

    console.log('\n✅ Seeding process completely finished!');
    process.exit(0);
}

seedData();
