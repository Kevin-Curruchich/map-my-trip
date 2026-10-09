import type { H3Event } from "h3";
import type { EventRecord } from "../database/schema";

// The creator is the Google account stored with the plan; nothing kept in the
// browser can stand in for it.
export async function isEventOwner(
  event: H3Event,
  record: Pick<EventRecord, "ownerSub">
) {
  if (!record.ownerSub) return false;
  const { user } = await getUserSession(event);
  return user?.sub === record.ownerSub;
}

export async function requireEventOwner(
  event: H3Event,
  record: Pick<EventRecord, "ownerSub">
) {
  if (!(await isEventOwner(event, record))) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only the event creator can do this",
    });
  }
}
