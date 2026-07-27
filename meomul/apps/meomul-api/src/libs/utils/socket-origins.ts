/**
 * Allowed CORS origins for the Socket.IO gateways.
 *
 * Mirrors the HTTP CORS policy built in `main.ts`: localhost origins are development
 * only and must never be accepted in production. Previously each gateway inlined its
 * own copy of this logic and seeded localhost unconditionally, which left the sockets
 * accepting localhost origins on the production deployment.
 */
export const resolveSocketOrigins = (): string[] => {
	const isProduction = process.env.NODE_ENV === 'production';

	const frontendUrl = process.env.FRONTEND_URL?.trim();
	if (isProduction && !frontendUrl) {
		throw new Error('FRONTEND_URL environment variable is required in production for socket CORS.');
	}

	const envList = (process.env.SOCKET_CORS_ORIGINS ?? '')
		.split(',')
		.map((origin) => origin.trim())
		.filter(Boolean);

	return Array.from(
		new Set([
			...(isProduction ? [] : ['http://localhost:3000', 'http://localhost:3001']),
			...(frontendUrl ? [frontendUrl] : []),
			...envList,
		]),
	);
};
