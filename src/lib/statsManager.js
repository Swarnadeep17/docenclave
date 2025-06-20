import { db } from "./firebase.js";
import { ref, runTransaction } from "firebase/database";

export async function incrementStat(pathParts) {
    const statRef = ref(db, `/stats/${pathParts.join("/")}`);
    return runTransaction(statRef, (currentVal) => {
        return (currentVal || 0) + 1;
    });
}