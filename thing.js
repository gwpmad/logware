import { inspect } from 'util';

const resolve = (path, obj) => {
  /*  Combination of these two Stack Overflow answers (thanks to Alnitak and speigg):
        https://stackoverflow.com/a/6491621
        https://stackoverflow.com/a/22129960 */
  if (!obj) return undefined;
  const sanitisedPath = path
    .replace(/\[(\w+)\]/g, '.$1') // convert indexes to properties
    .replace(/^\./, '');           // strip a leading dot

  return sanitisedPath.split('.')
    .reduce((prev, curr) => (prev ? prev[curr] : undefined), obj);
};

const isJSObject = (entity) => Object.prototype.toString.call(entity) === '[object Object]';

const forceArray = (value) => (Array.isArray(value) ? value : [value]);

const getDashes = (n) => Array(n).fill('-').join('');
const getEqualsSigns = (n) => Array(n).fill('=').join('');

const logCounterAndMessage = (counter, message) => {
  const fullMessage = '\n\n' + counter + '. Logger middleware' + (message ? ': ' + message : '') + '\n';
  const equalsSigns = getEqualsSigns(fullMessage.length);
  console.log(`${fullMessage}${equalsSigns}`);
};

// colours https://stackoverflow.com/a/41407246
const logInfo = (entityName, path, value) => {
  console.log(`

${entityName}.${path}
${getDashes(entityName.length + path.length)}
${inspect(value)}
`);
};

export default (options = 'Logger middleware called') => {
  let message = '';
  let reqPaths = [];
  let resPaths = [];

  if (isJSObject(options)) {
    if (options.message) message = options.message;
    if (options.req) reqPaths = forceArray(options.req);
    if (options.res) resPaths = forceArray(options.res);
  } else if (typeof options === 'string') {
    message = options;
  } else {
    message = 'Please pass an options object or a message string into the middleware logger';
  }

  const assembleAndLog = (entityName, entity) => (path) =>
    logInfo(entityName, path, resolve(path, entity));

  return (req, res, next) => {
    if (typeof res.locals.expressMiddlewareLoggerCounter !== 'number') {
      res.locals.expressMiddlewareLoggerCounter = 1;
    }

    logCounterAndMessage(res.locals.expressMiddlewareLoggerCounter, message);
    reqPaths.forEach(assembleAndLog('req', req));
    resPaths.forEach(assembleAndLog('res', res));
    console.log(getEqualsSigns(20) + '\n\n');
    res.locals.expressMiddlewareLoggerCounter++;
    next();
  };
};
