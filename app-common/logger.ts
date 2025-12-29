type ValueOf<T> = T[keyof T];

const LogLevels = {
	0: "DEBUG",
	1: "INFO",
	2: "WARN",
	3: "ERROR",
} as const;

export type LogLevel = ValueOf<typeof LogLevels>;

function _log(
	level: LogLevel,
	message: string,
	context: Record<string, unknown>,
) {
	console.log(`[${level}] ${message}`, context);
}

export const log = {
	debug(message: string, context: Record<string, unknown>) {
		_log("DEBUG", message, context);
	},
	info(message: string, context: Record<string, unknown>) {
		_log("INFO", message, context);
	},
	warn(message: string, context: Record<string, unknown>) {
		_log("WARN", message, context);
	},
	error(message: string, context: Record<string, unknown>) {
		_log("ERROR", message, context);
	},
};
