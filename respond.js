'use strict';

/*
 Public API.
 */
exports.success = success;
exports.sendSuccess = sendSuccess;
exports.error = {
	custom: custom,
	socketNotAllowed: socketNotAllowed,
	xhrNotAllowed: xhrNotAllowed,
	notFound: notFound,
	itemNotFound: itemNotFound,
	accessDenied: forbidden,
	forbidden: forbidden,
	loginRequired: loginRequired,
	loginInvalidated: loginInvalidated,
	paramRequired: paramRequired,
	paramInvalid: paramInvalid,
	serverError: serverError,
	disabled: disabled,
	localhostNotSupported: localhostNotSupported,
	notImplemented: notImplemented
};

/*
 Implementation.
 */

/**
 * Successful result.
 * @param result Payload to return.
 * @param res Optional express response to receive the payload.
 * @param internalCode Optional internalCode to add to the payload.
 */
function success(result, res, internalCode) {
	return sendSuccess(res, result, internalCode);
}
function custom(message, res, internalCode, errorCode) {
	return sendStringError(res, message, errorCode || 400, internalCode);
}
function forbidden(res, internalCode, message) {
	return sendStringError(res, message || 'You do not have access privileges to view this content.', 403, internalCode);
}
function socketNotAllowed(res, internalCode) {
	return sendStringError(res, 'This API cannot be accessed via sockets; please use XHR.', 403, internalCode);
}
function xhrNotAllowed(res, internalCode) {
	return sendStringError(res, 'This API cannot be accessed via XHR; please use sockets.', 403, internalCode);
}
function notFound(res, internalCode) {
	return sendStringError(res, 'Resource Not Found', 404, internalCode);
}
function itemNotFound(name, res, internalCode) {
	return sendSPrintFError(res, [ '"%s" Not Found', name ], 404, internalCode);
}
function loginRequired(res, internalCode) {
	return sendStringError(res, 'Login Required', 401, internalCode);
}
function loginInvalidated(res, internalCode) {
	return sendStringError(res, 'Login Invalidated', 401, internalCode);
}
function paramRequired(field, res, internalCode, errorCode) {
	return sendSPrintFError(res, [ '"%s" is a required parameter.', field ], errorCode || 400, internalCode);
}
function paramInvalid(field, res, internalCode) {
	return sendSPrintFError(res, [ '"%s" contained an invalid value.', field ], 400, internalCode);
}
function serverError(res, internalCode, errorCode) {
	return sendStringError(res, 'The server has encountered an error. Please try again, or contact support.', errorCode || 500, internalCode);
}
function disabled(res, internalCode) {
	return sendStringError(res, 'This feature is currently disabled.', 500, internalCode);
}
function localhostNotSupported(res, internalCode) {
	return sendStringError(res, 'Localhost cannot support this request.', 500, internalCode, true);
}
function notImplemented(res, internalCode) {
	return sendStringError(res, 'This API has not been implemented yet, but is reserved for future use.', 501, internalCode);
}

/*
 Utility.
 */

/**
 * Sends a successful response to the server.
 * @param res Optional Express Response object.
 * @param result The results that are successful and should be sent to the server. If this is a string, it'll be localized.
 * @param internalCode An optional internal code to also send to the client. This is useful for programmatic use of the API so we can do non-string-based comparisons.
 * @param enableStringLocalize Optional ability to enable localization of simple strings returned as success responses.
 * @return {*} If no res is provided, the success JSON object will be returned; otherwise, the results of res.send are returned.
 */
function sendSuccess(res, result, internalCode) {
	var obj = {
			success: true,
			code: res.statusCode,
			result: result
		};

	if (internalCode !== undefined) {
		obj.internalCode = internalCode;
	}

	if (!res) {
		return obj;
	}

	try {
		return res.send(obj);
	}
	catch(e) {
		console.error('swagger.respond sendSuccess:', e, 'headersSent', res.headersSent);
		if (res) {
			res.end(JSON.stringify(obj));
		}
	}
}

/**
 * Sends a SPrintF formatted error to the user. Otherwise, behaves the same as sendStringError.
 * @param res Optional Express Response object.
 * @param errorArray The first element should be a string; subsequent args are formatted in to the first string.
 * @param code The HTTP Status code to send (like 404, 403, etc).
 * @param internalCode An optional internal code to also send to the client. This is useful for programmatic use of the API so we can do non-string-based comparisons.
 * @return {*} If no res is provided, the error JSON object will be returned; otherwise, the results of res.send are returned.
 */
function sendSPrintFError(res, errorArray, code, internalCode) {
	var obj = { success: false };
	obj[res ? 'description' : 'reason'] = errorArray;
	return sendError(res, obj, code, internalCode);
}

/**
 * Sends a string error to the user. Attempts to localize it.
 * @param res Optional Express Response object.
 * @param error The error to send to the user. If it's a string, it will be localized.
 * @param code The HTTP Status code to send (like 404, 403, etc).
 * @param internalCode An optional internal code to also send to the client. This is useful for programmatic use of the API so we can do non-string-based comparisons.
 */
function sendStringError(res, error, code, internalCode) {
	var obj = { success: false };
	obj[res ? 'description' : 'reason'] = error;
	return sendError(res, obj, code, internalCode);
}

/**
 * Sends an error down to the client. This is designed to be used by 'sendSPrintFError' and 'sendStringError'. Only use
 * this if you know what you're up to, sir. :)
 * @param res Optional Express Response object.
 * @param obj The partially composed JSON response.
 * @param code The HTTP Status code to send (like 404, 403, etc).
 * @param internalCode An optional internal code to also send to the client. This is useful for programmatic use of the API so we can do non-string-based comparisons.
 * @return {*} If no res is provided, the error JSON object will be returned; otherwise, the results of res.send are returned.
 */
function sendError(res, obj, code, internalCode) {
	if (code) {
		obj.code = code;
	}
	if (!res) {
		if (internalCode !== undefined) {
			obj.reason += ' { internalCode: ' + internalCode + ' }';
		}
		return obj;
	}
	if (internalCode !== undefined) {
		obj.internalCode = internalCode;
	}

	try {
		if (!res.headersSent) {
			res.status(code);
		}
		return res.send(obj);
	}
	catch(e) {
		console.error('swagger.respond sendError:', e, 'headersSent', res.headersSent);
		if (res && res.status(code)) {
			res.end(JSON.stringify(obj));
		}
	}
}