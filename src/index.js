import { inspect } from 'util';

const NO_VALID_ARGUMENTS = 'Please pass an options object or a message string into the middleware logger';
const DEFAULT_MESSAGE = 'Logger middleware called';

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
  const corner = '╔══\n║ ';
  console.log(textColour, `\n\n${corner}${fullMessage}\n`);
};

// colours https://stackoverflow.com/a/41407246
const logInfo = (entityName, path, value, textColour) =>
  console.log(textColour, `\n\n  ${entityName}.${path}\n  ${getUnderline(entityName.length + path.length)}\n  ${inspect(value)}\n`);

const assembleAndLog = (entityName, textColour, entity) => (path) =>
  logInfo(entityName, path, resolve(path, entity), textColour);

const logware = (individualOptions = DEFAULT_MESSAGE) => {
  let message = '';
  let reqPaths = [];
  let resPaths = [];

  if (isJSObject(individualOptions)) {
    if (individualOptions.message) message = individualOptions.message;
    if (individualOptions.req) reqPaths = forceArrayOfStrings(individualOptions.req);
    if (individualOptions.res) resPaths = forceArrayOfStrings(individualOptions.res);
  } else if (typeof individualOptions === 'string') {
    message = individualOptions;
  } else if (!isJSObject(logware.options)) {
    message = NO_VALID_ARGUMENTS;
  }

  if (isJSObject(logware.options)) {
    if (logware.options.message) message = `${logware.options.message}${message ? ' - ' + message : ''}`;
    if (logware.options.req) reqPaths = forceArrayOfStrings(logware.options.req).concat(reqPaths);
    if (logware.options.res) resPaths = forceArrayOfStrings(logware.options.res).concat(resPaths);
  }

  return (req, res, next) => {
    if (typeof res.locals._logwareCounter !== 'number') {
      res.locals._logwareCounter = 1;
    }

    const textColour = getTextColourFromCounter(res.locals._logwareCounter);

    logCounterAndMessage(res.locals._logwareCounter, message, textColour);
    reqPaths.forEach(assembleAndLog('req', textColour, req));
    resPaths.forEach(assembleAndLog('res', textColour, res));
    res.locals._logwareCounter++;
    next();
  };
};

module.exports /* see https://stackoverflow.com/a/40295288 for why this is neccessary */ = logware;
