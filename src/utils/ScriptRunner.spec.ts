import ScriptRunner from './ScriptRunner';

const api = {
  val1: 1,
  val2: 2,
  fnA: () => { },
};

const scope = { stuff: true };

const syncCode = 'return val1 + val2;';

const asyncCode = `
const a = await (new Promise((res) => {
  res(val1);
}));
const b = await (new Promise((res) => {
  res(val2);
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
        expect(() => {
          runner = new ScriptRunner(scope);
          runner.api = api;
          runner.code = asyncCode;
        }).not.toThrow();

        expect(runner.isAsync).toBe(true);

        expect(runner.version).toBe(2);

        expect(runner).toBeInstanceOf(ScriptRunner);

        expect(runner.isAsync).toBe(true);
      });

      it('returns a promise when executed', async () => {
        const promise = runner.exec();
        expect(promise).toBeInstanceOf(Promise);
        await expect(promise).resolves.toBeTruthy();
      });

      it('executes', async () => {
        const result = await runner.exec();
        expect(result).toBe(3);
      });
    });
  });

  describe('execution', () => {
    describe('with sync code', () => {
      it('does not return a promise when executed', async () => {
        const runner = new ScriptRunner(scope);
        runner.code = syncCode;
        runner.api = api;

        let result;
        await expect((async () => {
          result = await runner.exec();
        })()).resolves.toBeUndefined();
        expect(result).not.toBeInstanceOf(Promise);

        expect(result).toBe(3);
      });
    });

    describe('with async code', () => {
      it('does not return a promise when executed', async () => {
        const runner = new ScriptRunner(scope);
        runner.code = asyncCode;
        runner.api = api;
        const promise = runner.exec();

        expect(promise).toBeInstanceOf(Promise);

        expect(await promise).toBe(3);
      });
    });

    describe('scope', () => {
      it('prevents access to global', async () => {
        const runner = new ScriptRunner(scope);
        runner.code = 'return console';

        let result;
        await expect((async () => {
          result = await runner.exec();
        })()).resolves.toBeUndefined();

        expect(result).toBeUndefined();
      });

      it('can be set', async () => {
        const runner = new ScriptRunner(scope);
        runner.code = `
        return this.stuff
        `;

        let result;
        await expect((async () => {
          result = await runner.exec();
        })()).resolves.toBeUndefined();

        expect(result).toBe(true);
      });
    });

    describe('scriptLog()', () => {
      it('logs', async () => {
        const runner = new ScriptRunner(scope);
        runner.api = api;
        runner.code = `
        scriptLog("script logged", this, self, window, val1, val2);
        return this.stuff
        `;

        let result;
        await expect((async () => {
          result = await runner.exec();
        })()).resolves.toBeUndefined();

        expect(result).toBe(true);

        expect(runner.log).toHaveLength(1);
        expect(runner.log[0]).toHaveLength(6);
        expect(runner.log[0][0]).toBe('script logged');
        expect(runner.log[0][1]).toStrictEqual(scope);
        expect(runner.log[0][2]).toBeUndefined();
        expect(runner.log[0][3]).toBeUndefined();
        expect(runner.log[0][4]).toBe(api.val1);
        expect(runner.log[0][5]).toBe(api.val2);
      });
    });
  });

  describe('events', () => {
    describe('"compilationerror" type', () => {
      it('is triggered when code cannot be compiled', () => {
        const listener = jest.fn();

        const runner = new ScriptRunner(scope);
        runner.addEventListener('compilationerror', listener);
        runner.code = compilationBrokenCode;

        expect(listener).toHaveBeenCalledTimes(1);
      });
    });

    describe('"executionerror" type', () => {
      it('is triggered when code execution fails', async () => {
        const compilationErrorListener = jest.fn();
        const executionErrorListener = jest.fn();
        const runner = new ScriptRunner(scope);

        runner.addEventListener('compilationerror', compilationErrorListener);
        runner.addEventListener('executionerror', executionErrorListener);

        runner.code = executionBrokenCode;

        try { await runner.exec(); } catch (e) { /* */ }

        expect(executionErrorListener).toHaveBeenCalledTimes(1);
        expect(compilationErrorListener).toHaveBeenCalledTimes(0);
      });
    });

    describe('"log" type', () => {
      it('is triggered after execution of code', async () => {
        const listener = jest.fn();

        const runner = new ScriptRunner(scope);
        runner.code = 'scriptLog("log");';
        runner.addEventListener('log', listener);

        try { await runner.exec(); } catch (e) { /* */ }

        expect(listener).toHaveBeenCalledTimes(1);
      });

      it('is triggered only if log() has been called within the code', async () => {
        const listener = jest.fn();

        const runner = new ScriptRunner(scope);
        runner.addEventListener('log', listener);

        try { await runner.exec(); } catch (e) { /* */ }

        expect(listener).toHaveBeenCalledTimes(0);
      });
    });

    describe('.removeEventListener()', () => {
      it('can be used to remove event listeners', async () => {
        const listener = jest.fn();

        const runner = new ScriptRunner(scope);
        runner.code = 'scriptLog("log");';
        runner.addEventListener('log', listener);

        try { await runner.exec(); } catch (e) { /* */ }

        runner.removeEventListener('log', listener);

        try { await runner.exec(); } catch (e) { /* */ }

        expect(listener).toHaveBeenCalledTimes(1);
      });
    });
  });
});
