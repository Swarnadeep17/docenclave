// docenclave-main/functions/index.js

const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

/**
 * A callable function to track usage events securely.
 * This function will be called from the client-side code.
 * NOTE: To get location data, your project must be on the Blaze (pay-as-you-go) plan.
 */
exports.trackEvent = functions.https.onCall(async (data, context) => {
  // data: an object like { tool: "toolName" } or { event: "pageView" }
  // context: Contains metadata like auth, IP, and location (on Blaze plan).

  const toolName = data.tool;
  const eventType = data.event;

  if (!eventType && !toolName) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with an 'event' or 'tool' field.",
    );
  }

  // Get location info from the request context (inferred from IP by Firebase)
  // On the free Spark plan, these headers will be undefined.
  const location = context.rawRequest.headers["x-appengine-city"] ? {
      city: context.rawRequest.headers["x-appengine-city"],
      country: context.rawRequest.headers["x-appengine-country"],
  } : {
      city: "Unknown",
      country: "Unknown",
  };

  // Use a Firestore batch to perform multiple writes atomically.
  const batch = db.batch();
  const overallStatsRef = db.collection("stats").doc("overall");

  // 1. Write a detailed, private log for your admin dashboard.
  const analyticsLogRef = db.collection("analytics_events").doc(); // Create a new document
  batch.set(analyticsLogRef, {
    type: toolName ? "tool_usage" : "page_view",
    name: toolName || eventType,
    location: location,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    // You could add more details here, like user agent from context
  });

  // 2. Increment the public counters.
  if (eventType === "pageView") {
    // For a page view, only increment the visits counter.
    // The { merge: true } option creates the document if it doesn't exist.
    batch.set(overallStatsRef, {
      monthlyVisits: admin.firestore.FieldValue.increment(1),
    }, {merge: true});
  } else if (toolName) {
    // For tool usage, increment files processed and the specific tool counter.
    const toolUsagePath = `toolUsage.${toolName}`;
    batch.set(overallStatsRef, {
      [toolUsagePath]: admin.firestore.FieldValue.increment(1),
      filesProcessed: admin.firestore.FieldValue.increment(1),
    }, {merge: true});
  }

  // Commit all the database operations at once.
  try {
    await batch.commit();
    return {result: `Event '${toolName || eventType}' tracked successfully.`};
  } catch (error) {
    console.error("Error committing batch for event tracking:", error);
    // Throw an error back to the client.
    throw new functions.https.HttpsError(
        "internal",
        "Failed to write event data to the database.",
    );
  }
});