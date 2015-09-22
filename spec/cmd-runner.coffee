child = null

exitEventName =
  if process.version.split('.')[1] is '6' then 'exit' else 'close'

process.on exitEventName, ->
  if child
    child.kill 'SIGINT'

execCommand = (cmd, callback) ->
  execCommand.result =
    stdout: ''
    stderr: ''
    exitStatus: null

  cli = [__dirname + '/background.js']

  if typeof cmd is 'function'
    callback = cmd
  else
    unless Array.isArray(cmd)
      copy = cmd
      cmd = []

      if copy.argv
        Array::push.apply cmd, copy.argv
        delete copy.argv

      for k, v of copy
        cmd.push "#{k}:#{v}"

    Array::push.apply cli, cmd

  if child
    child.kill 'SIGINT'

  child = require('child_process')
    .spawn('node', cli)

  t = null
  s = []
  e = []

  killme = ->
    clearTimeout t
    t = setTimeout ->
      execCommand.result.stdout = s.join('')
      execCommand.result.stderr = e.join('')
      callback()
    , 100

  child.stderr.on 'data', (text) ->
    e.push(text)
    killme()

  child.stdout.on 'data', (text) ->
    s.push(text)
    killme()

  child.on exitEventName, (code) ->
    execCommand.result.stdout = s.join('')
    execCommand.result.stderr = e.join('')
    execCommand.result.exitStatus = code

module.exports = execCommand
