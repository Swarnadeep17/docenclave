const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.trackEvent = functions.https.onCall(async (data, context) => {
  const toolName = data.tool;
  const eventType = data.event;

  if (!eventType && !toolName) {
    console.error("Function called without 'event' or 'tool' field.", data);
    throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with an 'event' or 'tool' field.",
    );
  }

  const location = context.rawRequest && context.rawRequest.headers["x-appengine-city"] ? {
      city: context.rawRequest.headers["x-appengine-city"],
      country: context.rawRequest.headers["x-appengine-country"],
  } : {
      city: "Unknown",
      country: "Unknown",
  };

  const batch = db.batch();
  const overallStatsRef = db.collection("stats").doc("overall");
  const analyticsLogRef = db.collection("analytics_events").doc();

  batch.set(analyticsLogRef, {
    type: toolName ? "tool_usage" : "page_view",
    name: toolName || eventType,
    location: location,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

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
    console.error("Error committing batch to Firestore:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Failed to write event data to the database.",
        error
    );
  }
});