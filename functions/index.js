/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.checkAndDeleteExpiredDocument = functions.firestore
  .document('Rooms/{roomId}')
  .onWrite(async (change, context) => {
    const now = new Date();

    // Get the document data
    const data = change.after.exists ? change.after.data() : null;

    if (data && data.expiresAt.toDate() <= now) {
      // If the document has expired, delete it
      try {
        await db.collection('Rooms').doc(context.params.roomId).delete();
        console.log(`Deleted expired room: ${context.params.roomId}`);
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }

    return null;
  });
