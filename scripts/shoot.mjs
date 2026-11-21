import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9333
const BASE = process.env.URL || 'http://127.0.0.1:5173/'
const WIDTH = Number(process.env.W || 1440)
const HEIGHT = Number(process.env.H || 900)
const OUT = process.env.OUT || 'shots'
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null
const PROGRESS = (process.env.P || '0.06,0.5,0.94').split(',').map(Number)

await fs.mkdir(OUT, { recursive: true })
await fs.rm(path.join(OUT, '.chrome'), { recursive: true, force: true })

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-dev-shm-usage',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${path.resolve(OUT, '.chrome')}`,
    `--window-size=${WIDTH},${HEIGHT}`,
    '--force-device-scale-factor=1',
    'about:blank',
  ],
  { stdio: 'ignore' }
)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getJSON(p) {
  const r = await fetch(`http://127.0.0.1:${PORT}${p}`)
  return r.json()
}

let targets = null
for (let i = 0; i < 60; i++) {
  try {
    targets = await getJSON('/json/list')
    if (targets && targets.length) break
  } catch {
    /* chrome not up yet */
  }
  await sleep(250)
}
if (!targets) {
  console.error('chrome did not start')
  chrome.kill()
  process.exit(1)
}

const page = targets.find((t) => t.type === 'page')
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((resolve) => (ws.onopen = resolve))

let nextId = 1
const pending = new Map()
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data)
  if (msg.method === 'Runtime.exceptionThrown') {
    console.log('EXCEPTION', msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text)
  }
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
    console.log('CONSOLE', msg.params.args?.map((a) => a.value ?? a.description).join(' '))
  }
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id)
    pending.delete(msg.id)
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result)
  }
}
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = nextId++
    pending.set(id, { resolve, reject })
    ws.send(JSON.stringify({ id, method, params }))
  })

await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width: WIDTH,
  height: HEIGHT,
  deviceScaleFactor: 1,
  mobile: WIDTH < 600,
})
await send('Page.navigate', { url: BASE })
await sleep(3200)

const evalJS = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  return r.result?.value
}

const fontOk = await evalJS(
  "document.fonts.check('16px Oswald') + '|' + document.fonts.check('16px \"Instrument Serif\"')"
)
console.log('fonts oswald|serif ->', fontOk)
console.log('url:', await evalJS('location.href'))
console.log('title:', await evalJS('document.title'))
console.log('height:', await evalJS('document.documentElement.scrollHeight'))
console.log('plates:', await evalJS("document.querySelectorAll('[data-plate]').length"))

const plates = ONLY || ['plate-01', 'plate-02', 'plate-03', 'plate-04', 'plate-05', 'plate-06', 'plate-07', 'plate-08']

for (const id of plates) {
  for (const p of PROGRESS) {
    const y = await evalJS(`(() => {
      const el = document.getElementById(${JSON.stringify(id)});
      if (!el) return -1;
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const span = Math.max(1, el.offsetHeight - window.innerHeight);
      return Math.round(top + span * ${p});
    })()`)
    if (y < 0) {
      console.log('missing', id)
      continue
    }
    await evalJS(`window.scrollTo(0, ${y})`)
    await sleep(420)
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
    const name = `${id}-${String(p).replace('.', '')}.png`
    await fs.writeFile(path.join(OUT, name), Buffer.from(shot.data, 'base64'))
    console.log('shot', name)
  }
}

ws.close()
chrome.kill()
await sleep(300)
process.exit(0)
