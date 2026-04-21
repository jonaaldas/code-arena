import { like } from 'drizzle-orm';
import { Result } from 'better-result';
import { db } from './db';
import { user_link_invitations } from '../database/schema';

export type VerifiedInvitation = {
  id: string;
  ownerId: string;
  timestamp: Date;
};

export const INVITATION_GRACE_MS = 15 * 60 * 1000;

export async function verifyToken(
  token: string | undefined,
  userId: string,
): Promise<VerifiedInvitation> {
  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Missing token' });
  }

  const lookup = await Result.tryPromise({
    try: () =>
      db
        .select({
          id: user_link_invitations.id,
          ownerId: user_link_invitations.userId,
          timestamp: user_link_invitations.timestamp,
        })
        .from(user_link_invitations)
        .where(like(user_link_invitations.link, `%/invite/${token}`))
        .limit(1),
    catch: (e) => (e instanceof Error ? e.message : 'Unknown error'),
  });

  if (lookup.isErr()) {
    throw createError({ statusCode: 500, statusMessage: lookup.error });
  }

  const [row] = lookup.value;

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Invalid invitation token' });
  }

  if (row.ownerId === userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'You cannot accept your own invitation',
    });
  }

  if (row.timestamp.getTime() + INVITATION_GRACE_MS < Date.now()) {
    throw createError({ statusCode: 410, statusMessage: 'This invitation has expired' });
  }

  return row;
}
