import type { H3Event } from "h3";
import { OWNER_TOKEN_HEADER } from "~~/layers/events/shared/constants/event-owner.constant";
import type { EventRecord } from "../database/schema";

// The creator is recognized by the token their browser got when creating the
// event, or by their Google account when they were signed in.
export async function isEventOwner(
  event: H3Event,
  record: Pick<EventRecord, "ownerToken" | "ownerSub">
) {
  const token = getHeader(event, OWNER_TOKEN_HEADER);
  if (record.ownerToken && token && token === record.ownerToken) return true;

  if (!record.ownerSub) return false;
  const { user } = await getUserSession(event);
  return user?.sub === record.ownerSub;
}

export async function requireEventOwner(
  event: H3Event,
  record: Pick<EventRecord, "ownerToken" | "ownerSub">
) {
  if (!(await isEventOwner(event, record))) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only the event creator can do this",
    });
  }
}
