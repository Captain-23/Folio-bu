export class FollowError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

/** Block self-follow before any Prisma call (schema has no DB constraint). */
export function assertNotSelfFollow(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new FollowError('You cannot follow yourself', 400)
  }
}
