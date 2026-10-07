// Lets the admin pages know whether to show themselves.
export default defineEventHandler(async (event) => ({
  isAdmin: await isAdmin(event),
}));
