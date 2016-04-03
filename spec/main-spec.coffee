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

  # TODO: improve this on CI
  describe 'CLI', ->
    describe 'health check', ->
      it 'may fail without arguments', (done) ->
        cmd ->
          expect(cmd.result.stderr).toContain 'Cannot read source folder'
          expect(cmd.result.exitStatus).toBe 2
          done()

    describe 'non working example', ->
      it 'may fail if when --standalone is not present', (done) ->
        cmd
          argv: ['--test', __dirname + '/fixtures/ok/bing.js']
        , ->
         expect(cmd.result.stderr).toContain 'ECONNREFUSED'
         expect(cmd.result.exitStatus).toBe 2
         done()

    # describe 'working example (--standalone)', ->
    #   it 'may fail if when --standalone is not present', (done) ->
    #     cmd
    #       argv: ['--test', __dirname + '/fixtures/ok/bing.js', '--standalone']
    #     , ->
    #      #expect(cmd.result.stderr).toContain 'ECONNREFUSED'
    #      #expect(cmd.result.exitStatus).toBe 2
    #      console.log cmd.result
    #      done()
