// functions/index.js (Simplified for debugging)

const {onCall, HttpsError} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.trackEvent = onCall(async (request) => {
  const data = request.data;
  const toolName = data.tool;
  const eventType = data.event;

  if (!eventType && !toolName) {
    throw new HttpsError(
        "invalid-argument",
        "The function must be called with an 'event' or 'tool' field.",
    );
  }

  const batch = db.batch();
  const overallStatsRef = db.collection("stats").doc("overall");

  if (eventType === "pageView") {
    batch.set(overallStatsRef, {
      monthlyVisits: admin.firestore.FieldValue.increment(1),
    }, {merge: true});
  } else if (toolName) {
    const toolUsagePath = `toolUsage.${toolName}`;
    batch.set(overallStatsRef, {
      [toolUsagePath]: admin.firestore.FieldValue.increment(1),
      filesProcessed: admin.firestore.FieldValue.increment(1),
    }, {merge: true});
  }

  try {
    await batch.commit();
    return {result: `Event '${toolName || eventType}' tracked successfully.`};
  } catch (error) {
    console.error("Error tracking event:", error);
    throw new HttpsError("internal", "Failed to track event.");
  }
});