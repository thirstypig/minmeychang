// Client for the local archive editor. Vanilla JS, no build step — this
// only ever runs from scripts/admin-server.mjs on localhost.

const statusEl = document.getElementById('status')
const saveBtn = document.getElementById('save-btn')
const reloadBtn = document.getElementById('reload-btn')
const sectionsEl = document.getElementById('sections')
const jumpNavEl = document.getElementById('jump-nav')

let state = { items: [], categoryOrder: [], categoryLabels: {} }
let dirty = false

function setStatus(text) {
  statusEl.textContent = text
}

function setDirty(next) {
  dirty = next
  saveBtn.disabled = !dirty
  saveBtn.textContent = dirty ? 'Save all changes' : 'No changes'
}

async function loadData() {
  setStatus('loading…')
  const res = await fetch('/api/archive')
  const data = await res.json()
  state = {
    items: data.items.map((i) => ({ ...i, _pendingDelete: false, _deleteAssetToo: false })),
    categoryOrder: data.categoryOrder,
    categoryLabels: data.categoryLabels,
  }
  setDirty(false)
  setStatus(`${state.items.length} entries`)
  render()
}

function siblings(item) {
  return state.items.filter((i) => i.category === item.category && i.decade === item.decade)
}

function moveItem(item, direction) {
  const group = siblings(item)
  const posInGroup = group.indexOf(item)
  const swapWith = group[posInGroup + direction]
  if (!swapWith) return
  const a = state.items.indexOf(item)
  const b = state.items.indexOf(swapWith)
  ;[state.items[a], state.items[b]] = [state.items[b], state.items[a]]
  setDirty(true)
  render()
}

function fieldRow(labelText, inputEl) {
  const row = document.createElement('div')
  row.className = 'row'
  const label = document.createElement('label')
  label.textContent = labelText
  row.append(label, inputEl)
  return row
}

function textInput(value, className, onChange) {
  const el = document.createElement('input')
  el.type = 'text'
  el.className = className
  el.value = value ?? ''
  el.addEventListener('input', () => {
    onChange(el.value)
    setDirty(true)
    el.closest('.item')?.classList.add('dirty')
  })
  return el
}

function textArea(value, onChange) {
  const el = document.createElement('textarea')
  el.value = value ?? ''
  el.addEventListener('input', () => {
    onChange(el.value)
    setDirty(true)
    el.closest('.item')?.classList.add('dirty')
  })
  return el
}

function renderItem(item) {
  const el = document.createElement('div')
  el.className = 'item' + (item._pendingDelete ? ' deleted' : '')

  if (item.asset) {
    const img = document.createElement('img')
    img.className = 'thumb'
    img.loading = 'lazy'
    img.src = '/archive-images/' + item.asset.replace('/archive/', '')
    el.append(img)
  } else {
    const ph = document.createElement('div')
    ph.className = 'thumb-placeholder'
    ph.textContent = 'no asset'
    el.append(ph)
  }

  const fields = document.createElement('div')
  fields.className = 'fields'

  const topRow = document.createElement('div')
  topRow.className = 'row'
  const idBadge = document.createElement('span')
  idBadge.className = 'id-badge'
  idBadge.textContent = item.id
  topRow.append(idBadge)

  const catSelect = document.createElement('select')
  catSelect.className = 'category'
  for (const cat of state.categoryOrder) {
    const opt = document.createElement('option')
    opt.value = cat
    opt.textContent = state.categoryLabels[cat]?.en ?? cat
    if (cat === item.category) opt.selected = true
    catSelect.append(opt)
  }
  catSelect.addEventListener('change', () => {
    item.category = catSelect.value
    setDirty(true)
    render()
  })

  const decadeSelect = document.createElement('select')
  decadeSelect.className = 'decade'
  for (const d of [1960, 1970, 1980, 1990, 2000, 2010, 2020]) {
    const opt = document.createElement('option')
    opt.value = String(d)
    opt.textContent = d + 's'
    if (d === item.decade) opt.selected = true
    decadeSelect.append(opt)
  }
  decadeSelect.addEventListener('change', () => {
    item.decade = Number(decadeSelect.value)
    setDirty(true)
    render()
  })

  const actions = document.createElement('div')
  actions.className = 'actions'

  if (!item._pendingDelete) {
    const upBtn = document.createElement('button')
    upBtn.className = 'btn-move'
    upBtn.textContent = '↑'
    upBtn.title = 'Move up within this section'
    upBtn.addEventListener('click', () => moveItem(item, -1))

    const downBtn = document.createElement('button')
    downBtn.className = 'btn-move'
    downBtn.textContent = '↓'
    downBtn.title = 'Move down within this section'
    downBtn.addEventListener('click', () => moveItem(item, 1))

    const delBtn = document.createElement('button')
    delBtn.className = 'btn-delete'
    delBtn.textContent = 'Delete'
    delBtn.addEventListener('click', () => {
      item._pendingDelete = true
      setDirty(true)
      render()
    })

    actions.append(upBtn, downBtn, delBtn)
  } else {
    const note = document.createElement('span')
    note.className = 'meta'
    note.textContent = 'Marked for deletion.'

    let assetToggle = null
    if (item.asset) {
      const label = document.createElement('label')
      label.className = 'meta'
      const cb = document.createElement('input')
      cb.type = 'checkbox'
      cb.checked = item._deleteAssetToo
      cb.addEventListener('change', () => {
        item._deleteAssetToo = cb.checked
      })
      label.append(cb, document.createTextNode(' also delete image file'))
      assetToggle = label
    }

    const undoBtn = document.createElement('button')
    undoBtn.className = 'btn-move'
    undoBtn.textContent = 'Undo'
    undoBtn.addEventListener('click', () => {
      item._pendingDelete = false
      item._deleteAssetToo = false
      setDirty(true)
      render()
    })

    actions.append(note)
    if (assetToggle) actions.append(assetToggle)
    actions.append(undoBtn)
  }

  topRow.append(catSelect, decadeSelect, actions)
  fields.append(topRow)

  const labelRow = document.createElement('div')
  labelRow.className = 'row'
  labelRow.append(
    fieldRow('Label (en)', textInput(item.en, 'label-en', (v) => (item.en = v))),
    fieldRow('Label (zh)', textInput(item.zhHant, 'label-zh', (v) => (item.zhHant = v)))
  )
  fields.append(labelRow)

  if (item.caption) {
    const capWrap = document.createElement('div')
    capWrap.className = 'caption-fields'
    const capEnLabel = document.createElement('div')
    capEnLabel.className = 'meta'
    capEnLabel.textContent = 'Caption (en)'
    const capEn = textArea(item.caption.en, (v) => (item.caption.en = v))
    const capZhLabel = document.createElement('div')
    capZhLabel.className = 'meta'
    capZhLabel.textContent = 'Caption (zh)'
    const capZh = textArea(item.caption.zhHant, (v) => (item.caption.zhHant = v))
    capWrap.append(capEnLabel, capEn, capZhLabel, capZh)
    fields.append(capWrap)
  }

  el.append(fields)
  return el
}

function render() {
  sectionsEl.innerHTML = ''
  jumpNavEl.innerHTML = ''

  for (const category of state.categoryOrder) {
    const items = state.items.filter((i) => i.category === category)
    if (items.length === 0) continue

    const link = document.createElement('a')
    link.href = '#cat-' + category
    link.textContent = state.categoryLabels[category]?.en ?? category
    jumpNavEl.append(link)

    const section = document.createElement('section')
    section.className = 'category'
    section.id = 'cat-' + category
    const h2 = document.createElement('h2')
    h2.textContent = state.categoryLabels[category]?.en ?? category
    section.append(h2)

    const decades = [...new Set(items.map((i) => i.decade))].sort((a, b) => a - b)
    for (const decade of decades) {
      const group = document.createElement('div')
      group.className = 'decade-group'
      const h3 = document.createElement('h3')
      h3.textContent = decade + 's'
      group.append(h3)
      for (const item of items.filter((i) => i.decade === decade)) {
        group.append(renderItem(item))
      }
      section.append(group)
    }

    sectionsEl.append(section)
  }
}

async function save() {
  saveBtn.disabled = true
  saveBtn.textContent = 'Saving…'
  const items = state.items
    .filter((i) => !i._pendingDelete)
    .map(({ _pendingDelete, _deleteAssetToo, ...rest }) => rest)
  const deleteAssets = state.items
    .filter((i) => i._pendingDelete && i._deleteAssetToo && i.asset)
    .map((i) => i.asset.replace('/archive/', ''))

  const res = await fetch('/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, deleteAssets }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    setStatus('Save failed: ' + (err.error ?? res.statusText))
    setDirty(true)
    return
  }

  setStatus('Saved. Review with `git diff`.')
  await loadData()
}

saveBtn.addEventListener('click', save)
reloadBtn.addEventListener('click', () => {
  if (dirty && !confirm('Discard all unsaved changes?')) return
  loadData()
})

loadData()
