# Skelenode Swagger
This is a [Skelenode](https://github.com/tgolen/skelenode) component to provide common swagger utilities for standard responses and params. This can be used standalone with any swagger implementation.

# Installation
```
npm install skelenode-swagger
```

# Usage
```javascript
var swr = require('skelenode-swagger/respond');

// send a standard response from an express or restify route handler
// `res` is an express or restify response object
swr.respond({ msg: 'Hello World!' }, res);
```

The resulting response sent is always in the same form:
```javascript
{
  success: true|false,
  code: 200|404|ect.,
  result: { ...whatever... }
}
```

## Response Methods

With all methods `res` is an express or restify response object

### success(result, res[, internalCode])
Sends a 200 response with `result`.

### custom(message, res[, internalCode, errorCode])
By default, sends a 400 response with the given `message`. Pass an optional `errorCode` to override the default.

### forbidden(res[, internalCode, message])
Sends a 403 response. Pass an optional `message` to override the default message.

### socketNotAllowed(res[, internalCode])
Sends a 403 response saying that a socket request is not allowed.

### xhrNotAllowed(res[, internalCode])
Sends a 403 response saying that an XHR request is not allowed.

### notFound(res[, internalCode])
Sends a 404 response saying that the given resource was not found.

### itemNotFound(name, res[, internalCode])
Sends a 404 response saying that the resource named `name` was not found.

### loginRequired(res[, internalCode])
Sends a 401 response saying that a login is required.

### loginInvalidated(res[, internalCode])
Sends a 401 response saying that a login was invalidated.

### paramRequired(field, res[, internalCode, errorCode])
Sends a 400 response saying that a `field` is required.

### paramInvalid(field, res[, internalCode])
Sends a 400 response saying that a `field` is invalid.

### serverError(res[, internalCode, errorCode])
By default, sends a 500 response with the details of a server error. Pass an optional `errorCode` to override the default.

### disabled(res[, internalCode])
Sends a 500 response saying that feature is disabled.

### localhostNotSupported(res[, internalCode])
Sends a 500 response saying that localhost is not supported.

### notImplemented(res[, internalCode])
Sends a 501 response saying that API hasn't been implemented yet.

# Contributing
Open a pull request with plenty of well-written instructions on what you are submitting and why you are submitting it
