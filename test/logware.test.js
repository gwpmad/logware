const sinon  = require('sinon');
const assert = require('assert');
const logware = require('../src');

const createReqResObject = () => ({
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

describe('Logware', () => {
  let logSpy;

  afterEach(logSpy ? logSpy.restore : noop);

  describe('logging from the request and response objects', () => {
    let res, req;

    beforeEach(() => {
      res = createReqResObject();
      req = createReqResObject();
    });

    it('correctly logs shallow and deep properties from req and res', () => {
      logSpy = sinon.spy(console, 'log');
      logware({ req: 'prop', res: 'deepProp.nestedProp.evenMoreNestedProp'})(req, res, noop);
      assert(logSpy.getCall(1).args[1].includes(req.prop));
      assert(logSpy.getCall(2).args[1].includes(res.deepProp.nestedProp.evenMoreNestedProp));
      // figure out how to focus on vscode terminal
      // how to get afterEach working
    });
    
    it.only('correctly logs when an array of properties is passed', () => {
      logSpy = sinon.spy(console, 'log');
      logware({ req: 'prop', res: ['deepProp.nestedProp.evenMoreNestedProp', 'prop']})(req, res, noop);
      assert(logSpy.getCall(2).args[1].includes(res.deepProp.nestedProp.evenMoreNestedProp));
      assert(logSpy.getCall(3).args[1].includes(res.prop));
    });
    it('correctly stringifies objects when they are logged', () => {});
  });

  describe('logging a message', () => {});

  describe('using outside configuration', () => {});
});
