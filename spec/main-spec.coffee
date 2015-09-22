cmd = require('./cmd-runner')

describe 'Runner', ->
  describe 'using defaults', ->
    beforeEach cmd

    it 'should fail here?', ->
      expect(cmd.result.exitStatus).toBe 2

  describe 'on empty modules?', ->
    beforeEach (done) ->
      cmd
        argv: ['--test', __dirname + '/fixtures/empty.js']
      , done

    it 'should not fail', ->
      expect(cmd.result.exitStatus).toBe 0

    it 'should print `OK true`', ->
      expect(cmd.result.stdout).toContain 'OK true'

    it 'should print `[Empty] Test Suite`', ->
      expect(cmd.result.stdout).toContain '[Empty] Test Suite'

  describe 'on wrong modules? (syntax)', ->
    beforeEach (done) ->
      cmd
        argv: ['--test', __dirname + '/fixtures/bad/syntax.js']
      , done

    it 'should fail', ->
      expect(cmd.result.exitStatus).toBe 2

    it 'should print `OK false`', ->
      expect(cmd.result.stdout).toContain 'OK false'

    it 'should print `SyntaxError: Unexpected token .`', ->
      expect(cmd.result.stderr).toContain 'SyntaxError: Unexpected token .'

  describe 'on wrong modules? (runtime)', ->
    beforeEach (done) ->
      cmd
        argv: ['--test', __dirname + '/fixtures/bad/runtime.js']
      , done

    it 'should fail', ->
      expect(cmd.result.exitStatus).toBe 2

    it 'should print `OK false`', ->
      expect(cmd.result.stdout).toContain 'OK false'

    it 'should print `ReferenceError: x is not defined`', ->
      expect(cmd.result.stdout).toContain 'ReferenceError: x is not defined'

  describe 'on well defined modules?', ->
    describe 'standalone = off', ->
      beforeEach (done) ->
        cmd
          argv: ['--test', __dirname + '/fixtures/ok/google.js']
        , done

      it 'should fail', ->
        expect(cmd.result.exitStatus).toBe 2

      it 'should print `Demo test Google`', ->
        expect(cmd.result.stdout).toContain 'Demo test Google'

      it 'should print `Error: connect ECONNREFUSED`', ->
        expect(cmd.result.stderr).toContain 'Error: connect ECONNREFUSED'
