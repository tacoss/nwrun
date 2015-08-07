util = require('../lib/functions')

describe 'Helpers', ->
  describe 'omit() and pick()', ->
    subject =
      foo: 'bar'
      baz: 'buzz'

    it 'should return an empty object when pick() nothing', ->
      expect(util.pick(subject)).toEqual {}

    it 'should return a cloned object when omit() nothing', ->
      expect(util.omit(subject)).toEqual subject

    it 'should pick() the provided properties from given keys', ->
      expect(util.pick(subject, ['foo'])).toEqual foo: 'bar'

    it 'should omit() the provided properties from given keys', ->
      expect(util.omit(subject, ['foo'])).toEqual baz: 'buzz'
