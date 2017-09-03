import sinon from 'sinon';
import assert from 'assert';
import { inspect } from 'util';
import logware from '../src';

const createReqOrResObject = () => ({
  prop: (Math.random() + 1).toString(36).substring(7),
  number: Math.random() * 10,
  deepProp: {
    nestedProp: {
      evenMoreNestedProp: (Math.random() + 1).toString(36).substring(7)
    },
  },
  locals: {},
});

const noop = () => {};

const concatRelevantArgsFromCalls = (spy) => {
  let counter = 0;
  let callString = '';
  while (spy.getCall(counter)) {
    callString = callString.concat(spy.getCall(counter).args[1]);
    counter++;
  }
  return callString;
};

describe('Logware', () => {
  let logSpy;
  let req, res;

  beforeEach(() => {
    req = createReqOrResObject();
    res = createReqOrResObject();
    logSpy = sinon.spy(console, 'log');
  });

  afterEach(() => {
    if (logSpy) logSpy.restore();
    delete logware.options;
  });

  describe('logging from the request and response objects', () => {
    it('correctly logs shallow and deep properties from req and res', () => {
      logware({ req: 'prop', res: 'deepProp.nestedProp.evenMoreNestedProp'})(req, res, noop);
      const consoleCalls = concatRelevantArgsFromCalls(logSpy);
      assert(consoleCalls.includes(req.prop));
      assert(consoleCalls.includes(res.deepProp.nestedProp.evenMoreNestedProp));
    });
    
    it('correctly logs when an array of properties is passed', () => {
      logware({ req: 'prop', res: ['deepProp.nestedProp.evenMoreNestedProp', 'prop']})(req, res, noop);
      const consoleCalls = concatRelevantArgsFromCalls(logSpy);
      assert(consoleCalls.includes(res.deepProp.nestedProp.evenMoreNestedProp));
      assert(consoleCalls.includes(res.prop));
    });

    it('correctly stringifies objects when they are logged', () => {
      logware({ res: ['deepProp.nestedProp']})(req, res, noop);
      const consoleCalls = concatRelevantArgsFromCalls(logSpy);
      assert(consoleCalls.includes(inspect(res.deepProp.nestedProp)));
    });

    it('logs undefined if the property sought from req or res is not found', () => {
      logware({ req: ['this.does.not.exist']})(req, res, noop);
      const consoleCalls = concatRelevantArgsFromCalls(logSpy);
      assert(consoleCalls.includes('undefined'));
    });
  });

  describe('logging a message', () => {
    it('should display a message passed in via the individualOptions object', () => {
      logware({ message: 'hello' })(req, res, noop);
      const consoleCalls = concatRelevantArgsFromCalls(logSpy);
      assert(consoleCalls.includes('hello'));
    });

    it('should display a message configured in external options, alongside any passed in via individualOptions', () => {
      logware.options = { message: 'externally-configured message' };
      logware({ message: 'hello' })(req, res, noop);
      const consoleCalls = concatRelevantArgsFromCalls(logSpy);
      assert(consoleCalls.includes('externally-configured message - hello'));
    });

    it('should display the default message if no message is passed in external options or individualOptions', () => {
      logware()(req, res, noop);
      const consoleCalls = concatRelevantArgsFromCalls(logSpy);
      assert(consoleCalls.includes('Logger middleware called'));
    });

    it('should display the no valid arguments message if external options does not exist or is invalid and individualOptions is invalid', () => {
      logware.options = 'this is not valid';
      logware(123456)(req, res, noop);
      const consoleCalls = concatRelevantArgsFromCalls(logSpy);
      assert(consoleCalls.includes('Please pass an options object or a message string into the middleware logger'));
    });

    it('should display external options message even if individualOptions is invalid', () => {
      logware.options = { message: 'message from external options' };
      logware(123456)(req, res, noop);
      const consoleCalls = concatRelevantArgsFromCalls(logSpy);
      assert(consoleCalls.includes('message from external options'));
      assert(!consoleCalls.includes('Please pass an options object or a message string into the middleware logger'));
    });
  });

  describe('using outside configuration', () => {
    it('correctly logs shallow and deep properties from req and res alongside anything from individualOptions', () => {
      logware.options = { req: 'prop', res: 'deepProp.nestedProp.evenMoreNestedProp' };
      logware({ res: 'number' })(req, res, noop);
      const consoleCalls = concatRelevantArgsFromCalls(logSpy);
      assert(consoleCalls.includes(req.prop));
      assert(consoleCalls.includes(res.deepProp.nestedProp.evenMoreNestedProp));
      assert(consoleCalls.includes(res.number));
    });
  });
});
