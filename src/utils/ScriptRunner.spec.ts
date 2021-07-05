import ScriptRunner from './ScriptRunner';

const data = {
  param1: 1,
  param2: 2,
};

const scope = { stuff: true };

const syncCode = 'return param1 + param2;';

const asyncCode = `
const a = await (new Promise((res) => {
  res(param1);
}));
const b = await (new Promise((res) => {
  res(param2);
}));
return a + b;
`;

const compilationBrokenCode = `
breaks % line 6;
`;

const executionBrokenCode = `
a.substr(0, 1);
`;

describe('object ScriptRunner', () => {
  describe('compilation', () => {
    describe('with sync code', () => {
      let runner: ScriptRunner;

      it('instanciates', () => {
        expect.assertions(3);

        expect(() => {
          runner = new ScriptRunner();
          runner.code = syncCode;
        }).not.toThrow();
        expect(runner).toBeInstanceOf(ScriptRunner);
        expect(runner.isAsync).toBe(false);
      });
    });

    describe('with async code', () => {
      let runner: ScriptRunner;

      it('instanciates', () => {
        expect.assertions(3);

        expect(() => {
          runner = new ScriptRunner();
          runner.code = asyncCode;
        }).not.toThrow();

        expect(runner).toBeInstanceOf(ScriptRunner);

        expect(runner.isAsync).toBe(true);
      });

      it('returns a promise when executed', async () => {
        expect.assertions(1);

        const result = runner.exec(data);
        expect(result).toBeInstanceOf(Promise);
      });

      it('executes', async () => {
        expect.assertions(1);

        const result = await runner.exec(data);
        expect(result).toBe(3);
      });
    });
  });

  describe('execution', () => {
    describe('with sync code', () => {
      it('does not return a promise when executed', async () => {
        expect.assertions(3);

        const runner = new ScriptRunner();
        runner.code = syncCode;

        let result;
        expect(() => {
          result = runner.exec(data);
        }).not.toThrow();
        expect(result).not.toBeInstanceOf(Promise);

        expect(result).toBe(3);
      });
    });

    describe('with async code', () => {
      it('does not return a promise when executed', async () => {
        expect.assertions(2);

        const runner = new ScriptRunner();
        runner.code = asyncCode;
        const result = runner.exec(data);

        expect(result).toBeInstanceOf(Promise);

        expect(await result).toBe(3);
      });
    });

    describe('scope', () => {
      it('prevents access to global', () => {
        expect.assertions(1);

        const runner = new ScriptRunner();
        runner.code = 'return console';

        const result = runner.exec();

        expect(result).toBeUndefined();
      });

      it('can be set', () => {
        expect.assertions(1);

        const runner = new ScriptRunner(scope);
        runner.code = `
        return this.stuff
        `;

        const result = runner.exec(data);

        expect(result).toBe(true);
      });
    });

    describe('log()', () => {
      it('logs', () => {
        expect.assertions(9);

        const runner = new ScriptRunner(scope);
        runner.code = `
        log("log", this, self, window, param1, param2);
        return this.stuff
        `;

        const result = runner.exec(data);

        expect(result).toBe(true);

        expect(runner.log).toHaveLength(1);
        expect(runner.log[0]).toHaveLength(6);
        expect(runner.log[0][0]).toBe('log');
        expect(runner.log[0][1]).toStrictEqual(scope);
        expect(runner.log[0][2]).toBeUndefined();
        expect(runner.log[0][3]).toBeUndefined();
        expect(runner.log[0][4]).toBe(data.param1);
        expect(runner.log[0][5]).toBe(data.param2);
      });
    });
  });

  describe('events', () => {
    describe('"compilationerror" type', () => {
      it('is triggered when code cannot be compiled', () => {
        expect.assertions(1);

        const listener = jest.fn();

        const runner = new ScriptRunner();
        runner.addEventListener('compilationerror', listener);
        runner.code = compilationBrokenCode;

        expect(listener).toHaveBeenCalledTimes(1);
      });
    });

    describe('"executionerror" type', () => {
      it('is triggered when code execution fails', () => {
        expect.assertions(2);

        const compilationErrorListener = jest.fn();
        const executionErrorListener = jest.fn();
        const runner = new ScriptRunner();

        runner.addEventListener('compilationerror', compilationErrorListener);
        runner.addEventListener('executionerror', executionErrorListener);

        runner.code = executionBrokenCode;

        runner.exec();

        expect(executionErrorListener).toHaveBeenCalledTimes(0);
        expect(compilationErrorListener).toHaveBeenCalledTimes(1);
      });
    });

    describe('"log" type', () => {
      it('is triggered after execution of code', () => {
        expect.assertions(1);

        const listener = jest.fn();

        const runner = new ScriptRunner();
        runner.code = 'log("log");';
        runner.addEventListener('log', listener);
        runner.exec();

        expect(listener).toHaveBeenCalledTimes(1);
      });

      it('is triggered only if log() has been called within the code', () => {
        expect.assertions(1);

        const listener = jest.fn();

        const runner = new ScriptRunner();
        runner.addEventListener('log', listener);
        runner.exec();
        expect(listener).toHaveBeenCalledTimes(0);
      });
    });

    describe('.removeEventListener()', () => {
      it('can be used to remove event listeners', () => {
        expect.assertions(1);

        const listener = jest.fn();

        const runner = new ScriptRunner();
        runner.code = 'log("log");';
        runner.addEventListener('log', listener);
        runner.exec();

        runner.removeEventListener('log', listener);
        runner.exec();

        expect(listener).toHaveBeenCalledTimes(1);
      });
    });
  });
});
