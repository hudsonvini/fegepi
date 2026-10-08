import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { afterEach, beforeEach, test } from 'node:test'
import vm from 'node:vm'
import { JSDOM } from 'jsdom'
import React, { act } from 'react'
import ts from 'typescript'

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' })
globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.IS_REACT_ACT_ENVIRONMENT = true
const { createRoot } = await import('react-dom/client')
const require = createRequire(import.meta.url)
let requests
let save
const source = readFileSync(new URL('../src/components/AdminDashboard/CreateChampionshipForm.tsx', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
})
const exports = {}
vm.runInNewContext(outputText, {
  exports,
  FormData: dom.window.FormData,
  require(name) {
    if (name.endsWith('.scss')) return {}
    if (name === '@/app/admin/championship-actions') return {
      saveChampionshipAction: (data) => { requests.push(data); return save(data) },
    }
    return require(name)
  },
})
const CreateChampionshipForm = exports.default
const props = { seasonId: '10000000-0000-4000-8000-000000000001', seasonLabel: 'Temporada', gameName: 'Jogo', available: true }
let container
let root

beforeEach(async () => {
  requests = []
  save = async () => {}
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  await act(async () => root.render(React.createElement(CreateChampionshipForm, props)))
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
})

async function fill(name, value) {
  const input = container.querySelector(`[name="${name}"]`)
  await act(async () => {
    input.value = value
    input.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
    input.dispatchEvent(new dom.window.Event('change', { bubbles: true }))
  })
}

for (const date of ['2025-01-01', '2026-10-08', '2027-12-31']) {
  test(`changing the date to ${date} keeps registration idle until the button is activated`, async () => {
    await fill('name', 'Copa Piauí')
    await fill('playedAt', date)
    assert.equal(requests.length, 0)
    const button = container.querySelector('button')
    assert.equal(button.disabled, false)
    assert.equal(button.getAttribute('aria-busy'), 'false')

    // An implicit/native submit must not create the championship either.
    await act(async () => container.querySelector('form').requestSubmit())
    assert.equal(requests.length, 0)
    assert.equal(button.disabled, false)

    await act(async () => button.click())
    assert.equal(requests.length, 1)
    assert.equal(requests[0].get('playedAt'), date)
    assert.equal(requests[0].get('seasonId'), props.seasonId)
    assert.equal(requests[0].get('status'), 'draft')
  })
}

test('validates required fields before starting the request', async () => {
  const button = container.querySelector('button')
  await act(async () => button.click())
  await fill('name', 'Copa Piauí')
  await act(async () => button.click())
  assert.equal(requests.length, 0)
  assert.equal(button.getAttribute('aria-busy'), 'false')
})

test('prevents duplicate requests and restores the button and inputs after failure', async () => {
  let rejectRequest
  save = () => new Promise((_resolve, reject) => { rejectRequest = reject })
  await fill('name', 'Copa Piauí')
  await fill('playedAt', '2026-10-07')
  const button = container.querySelector('button')
  await act(async () => { button.click(); button.click() })
  assert.equal(requests.length, 1)
  assert.equal(button.disabled, true)
  assert.equal(button.getAttribute('aria-busy'), 'true')

  await act(async () => rejectRequest(new Error('Network failure')))
  assert.equal(button.disabled, false)
  assert.equal(button.getAttribute('aria-busy'), 'false')
  assert.match(container.querySelector('[role="alert"]').textContent, /Confira a lista/)
  assert.equal(container.querySelector('[name="name"]').value, 'Copa Piauí')
  assert.equal(container.querySelector('[name="playedAt"]').value, '2026-10-07')
})

test('does not enable registration when the season or championship data is unavailable', async () => {
  for (const unavailable of [{ available: false }, { seasonId: undefined }]) {
    await act(async () => root.render(React.createElement(CreateChampionshipForm, { ...props, ...unavailable })))
    await fill('name', 'Copa Piauí')
    await fill('playedAt', '2026-10-07')
    assert.equal(container.querySelector('button').disabled, true)
    await act(async () => container.querySelector('button').click())
    assert.equal(requests.length, 0)
  }
})
