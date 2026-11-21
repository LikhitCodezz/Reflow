import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9334
const BASE = process.env.URL || 'http://127.0.0.1:5180/'
await fs.rm(path.resolve('shots/.chrome-debug'), { recursive: true, force: true })
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${path.resolve('shots/.chrome-debug')}`,
    '--window-size=1440,900',
    '--disable-dev-shm-usage',
    '--hide-scrollbars',
    'about:blank',
  ],
  { stdio: 'ignore' }
)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let targets
for (let i = 0; i < 40; i++) {
  try {
    targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
    if (targets && targets.length) break
  } catch {}
  await sleep(250)
}
if (!targets) {
  console.log('chrome not reachable; exit code', chrome.exitCode)
  process.exit(1)
}
const page = targets.find((t) => t.type === 'page')
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((r) => (ws.onopen = r))
let id = 1
const pend = new Map()
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data)
  if (m.method === 'Runtime.exceptionThrown') {
    console.log('EXCEPTION:', m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text)
    console.log(JSON.stringify(m.params.exceptionDetails?.stackTrace?.callFrames?.slice(0, 6), null, 1))
  }
  if (m.method === 'Runtime.consoleAPICalled') {
    console.log('CONSOLE', m.params.type, m.params.args?.map((a) => a.value ?? a.description).join(' '))
  }
  if (m.method === 'Log.entryAdded') console.log('LOG', m.params.entry.level, m.params.entry.text)
  if (m.method === 'Network.loadingFailed') console.log('NETFAIL', m.params.errorText, m.params.type)
  if (m.id && pend.has(m.id)) {
    const p = pend.get(m.id)
    pend.delete(m.id)
    m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result)
  }
}
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    pend.set(id, { resolve, reject })
    ws.send(JSON.stringify({ id: id++, method, params }))
  })
await send('Runtime.enable')
await send('Log.enable')
await send('Network.enable')
await send('Page.enable')
await send('Page.navigate', { url: BASE })
await sleep(3500)
const r = await send('Runtime.evaluate', { expression: 'document.body.innerHTML.slice(0,2000)', returnByValue: true })
console.log('BODY:', r.result.value)
const e = await send('Runtime.evaluate', { expression: 'document.querySelectorAll("[data-plate]").length', returnByValue: true })
console.log('PLATES:', e.result.value)
ws.close()
chrome.kill()
process.exit(0)
