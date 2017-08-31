import { inspect } from 'util';

const textColours = [
  '\x1b[32m', // green
  '\x1b[36m', // cyan
  '\x1b[33m', // yellow
  '\x1b[31m', // red
  '\x1b[34m', // blue
  '\x1b[35m', // magenta
];

const getTextColourFromCounter = (counter) => `${textColours[(counter % textColours.length) - 1]}%s\x1b[0m`;

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

const forceArrayOfStrings = (value) => {
  const array = Array.isArray(value) ? value : [value];
  return array.filter(element => typeof element === 'string');
};

const getUnderline = (n) => Array(n).fill('─').join('');

const logCounterAndMessage = (counter, message, textColour) => {
  const fullMessage = `${counter}.${message ? ' ' + message : ''}`;
  const corner = `╔══\n║ `;
  console.log(textColour, `\n\n${corner}${fullMessage}\n\n`);
};

// colours https://stackoverflow.com/a/41407246
const logInfo = (entityName, path, value, textColour) =>
  console.log(textColour, `\n\n  ${entityName}.${path}\n  ${getUnderline(entityName.length + path.length)}\n  ${inspect(value)}\n`);

const assembleAndLog = (entityName, textColour, entity) => (path) =>
  logInfo(entityName, path, resolve(path, entity), textColour);

const loggerWare = (individualOptions = 'Logger middleware called') => {
  let message = '';
  let reqPaths = [];
  let resPaths = [];

  if (isJSObject(individualOptions)) {
    if (individualOptions.message) message = individualOptions.message;
    if (individualOptions.req) reqPaths = forceArrayOfStrings(individualOptions.req);
    if (individualOptions.res) resPaths = forceArrayOfStrings(individualOptions.res);
  } else if (typeof individualOptions === 'string') {
    message = individualOptions;
  } else /* fix for if there is an outside options obj - this won't be relevant then */ {
    message = 'Please pass an options object or a message string into the middleware logger';
  }

  if (isJSObject(loggerWare.options)) {
    if (loggerWare.options.message) message = `${loggerWare.options.message}${message ? ' - ' + message : ''}`;
    if (loggerWare.options.req) reqPaths = forceArrayOfStrings(loggerWare.options.req).concat(reqPaths);
    if (loggerWare.options.res) resPaths = forceArrayOfStrings(loggerWare.options.res).concat(resPaths);
  }

  return (req, res, next) => {
    if (typeof res.locals.expressMiddlewareLoggerCounter !== 'number') {
      res.locals.expressMiddlewareLoggerCounter = 1;
    }

    const textColour = getTextColourFromCounter(res.locals.expressMiddlewareLoggerCounter);

    logCounterAndMessage(res.locals.expressMiddlewareLoggerCounter, message, textColour);
    reqPaths.forEach(assembleAndLog('req', textColour, req));
    resPaths.forEach(assembleAndLog('res', textColour, res));
    res.locals.expressMiddlewareLoggerCounter++;
    next();
  };
};

module.exports /* see https://stackoverflow.com/a/40295288 for why this is neccessary */ = loggerWare;
