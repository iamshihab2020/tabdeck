'use strict';

function init() {
  const el = id => document.getElementById(id);
  const CHECK_SVG = `<svg class="combo-item-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>`;

  let currentUrl = '';
  let currentTitle = '';
  let workspaces = [];
  let wsData = {};
  let destMode = 'quick';
  let creatingNewFolder = false;
  let selectedWsId = null;
  let selectedFolder = null;

  // ── Combobox factory ──────────────────────────────────────────────────────
  function makeCombo({ triggerId, valId, dropId, listId, placeholder, onSelect }) {
    const trigger = el(triggerId);
    const valEl   = el(valId);
    const drop    = el(dropId);
    const list    = el(listId);
    let selected  = null;

    if (!trigger || !valEl || !drop || !list) {
      return { setItems() {}, getValue() { return null; }, reset() {}, close() {} };
    }

    const open   = () => { trigger.classList.add('open');    drop.classList.add('open'); };
    const close  = () => { trigger.classList.remove('open'); drop.classList.remove('open'); };
    const isOpen = () => drop.classList.contains('open');

    trigger.addEventListener('click', e => { e.stopPropagation(); isOpen() ? close() : open(); });
    document.addEventListener('click', e => {
      if (!trigger.contains(e.target) && !drop.contains(e.target)) close();
    });

    function setItems(items) {
      list.innerHTML = '';
      if (!items.length) {
        list.innerHTML = '<div class="combo-empty">No options</div>';
        return;
      }
      items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'combo-item' + (selected === item.value ? ' selected' : '');
        div.innerHTML = `
          ${item.emoji ? `<span class="combo-item-emoji">${item.emoji}</span>` : ''}
          <span class="combo-item-label">${item.label}</span>
          ${CHECK_SVG}
        `;
        div.addEventListener('click', () => {
          selected = item.value;
          valEl.textContent = (item.emoji ? item.emoji + ' ' : '') + item.label;
          valEl.classList.remove('placeholder');
          list.querySelectorAll('.combo-item').forEach(d => d.classList.remove('selected'));
          div.classList.add('selected');
          close();
          onSelect(item.value, item);
        });
        list.appendChild(div);
      });
    }

    const getValue = () => selected;

    function reset() {
      selected = null;
      valEl.textContent = placeholder;
      valEl.classList.add('placeholder');
      list.innerHTML = '';
    }

    return { setItems, getValue, reset, close };
  }

  // ── Init combos ───────────────────────────────────────────────────────────
  const wsCombo = makeCombo({
    triggerId: 'wsTrigger', valId: 'wsVal', dropId: 'wsDrop', listId: 'wsList',
    placeholder: 'Select workspace…',
    onSelect: wsId => {
      selectedWsId = +wsId;
      folderCombo.reset();
      selectedFolder = null;
      populateFolders(+wsId);
    }
  });

  const folderCombo = makeCombo({
    triggerId: 'folderTrigger', valId: 'folderVal', dropId: 'folderDrop', listId: 'folderList',
    placeholder: 'Select folder…',
    onSelect: name => { selectedFolder = name; }
  });

  // ── Toast ─────────────────────────────────────────────────────────────────
  function showToast(msg, type) {
    const t = el('toast');
    if (!t) return;
    t.textContent = msg;
    t.className   = 'toast ' + type + ' show';
  }

  // ── Populate folder combobox ──────────────────────────────────────────────
  // Builds a flat indented list: top-level folders followed by their children.
  // Each item's value is the folder id (or legacy name if no id) and label is breadcrumb-indented.
  function populateFolders(wsId) {
    const data    = wsData[wsId] || {};
    const folders = Array.isArray(data.folders) ? data.folders : [];
    // Index by id + by parent
    const byParent = new Map();
    folders.forEach(f => {
      const pid = f.parentId == null ? null : f.parentId;
      if (!byParent.has(pid)) byParent.set(pid, []);
      byParent.get(pid).push(f);
    });
    // Add bookmark-derived folder names that aren't yet in folders list (legacy unmigrated)
    const knownNames = new Set(folders.filter(f => f.parentId == null).map(f => f.name));
    (data.importedBookmarks || []).forEach(b => {
      if (b.folderName && !knownNames.has(b.folderName) && !folders.some(f => f.id === b.folderId)) {
        knownNames.add(b.folderName);
        const ghost = { _legacy: true, name: b.folderName, parentId: null };
        if (!byParent.has(null)) byParent.set(null, []);
        byParent.get(null).push(ghost);
      }
    });

    const items = [];
    const tops = byParent.get(null) || [];
    tops.forEach(top => {
      items.push({
        value: top.id || ('name:' + top.name),
        label: top.name,
        emoji: '📁',
      });
      const subs = top.id ? (byParent.get(top.id) || []) : [];
      subs.forEach(sub => {
        items.push({
          value: sub.id || ('name:' + sub.name),
          label: '↳ ' + sub.name,
          emoji: '📁',
        });
      });
    });
    folderCombo.setItems(items);
  }

  // ── Load tab + storage ────────────────────────────────────────────────────
  Promise.all([
    new Promise(res => chrome.tabs.query({ active: true, currentWindow: true }, res)),
    new Promise(res => chrome.storage.local.get(['workspaces', 'wsData'], res)),
  ]).then(([[tab], stored]) => {
    const mainForm   = el('mainForm');
    const pageTitle  = el('pageTitle');
    const pageUrl    = el('pageUrl');
    const titleInput = el('titleInput');
    const pageFav    = el('pageFavicon');
    const saveBtn    = el('saveBtn');

    // Guard: if popup closed before promise resolved
    if (!mainForm) return;

    if (tab) {
      currentUrl   = tab.url || '';
      currentTitle = tab.title || currentUrl;
      if (pageTitle)  pageTitle.textContent = currentTitle;
      if (pageUrl)    pageUrl.textContent   = currentUrl;
      if (titleInput) titleInput.value      = currentTitle;

      if (tab.favIconUrl && pageFav) {
        const img = document.createElement('img');
        img.src = tab.favIconUrl;
        img.onerror = () => img.remove();
        pageFav.innerHTML = '';
        pageFav.appendChild(img);
      }

      if (currentUrl.startsWith('chrome://') || currentUrl.startsWith('chrome-extension://')) {
        showToast("This page can't be bookmarked.", 'err');
        if (saveBtn) saveBtn.disabled = true;
      }
    }

    workspaces = stored.workspaces || [];
    wsData     = stored.wsData     || {};

    if (!workspaces.length) {
      mainForm.innerHTML = '<div class="empty">No workspaces found.<br>Open a new tab to set up TabDeck first.</div>';
      return;
    }

    wsCombo.setItems(workspaces.map(ws => ({
      value: String(ws.id),
      label: ws.name,
      emoji: ws.emoji || '',
    })));
  }).catch(err => {
    console.warn('TabDeck popup load error:', err);
  });

  // ── Destination toggle ────────────────────────────────────────────────────
  const destQuick  = el('destQuick');
  const destFolder = el('destFolder');
  const folderRow  = el('folderRow');
  const newFolderRow = el('newFolderRow');
  const newFolderBtn = el('newFolderBtn');

  if (destQuick) destQuick.addEventListener('click', () => {
    destMode = 'quick';
    destQuick.classList.add('active');
    if (destFolder)    destFolder.classList.remove('active');
    if (folderRow)     folderRow.style.display = 'none';
    if (newFolderRow)  newFolderRow.style.display = 'none';
    creatingNewFolder = false;
    if (newFolderBtn) { newFolderBtn.textContent = '+'; newFolderBtn.classList.remove('active'); }
  });

  if (destFolder) destFolder.addEventListener('click', () => {
    destMode = 'folder';
    destFolder.classList.add('active');
    if (destQuick)  destQuick.classList.remove('active');
    if (folderRow)  folderRow.style.display = 'flex';
  });

  // ── New folder toggle ─────────────────────────────────────────────────────
  if (newFolderBtn) newFolderBtn.addEventListener('click', () => {
    creatingNewFolder = !creatingNewFolder;
    if (newFolderRow)  newFolderRow.style.display = creatingNewFolder ? 'block' : 'none';
    newFolderBtn.textContent = creatingNewFolder ? '×' : '+';
    newFolderBtn.classList.toggle('active', creatingNewFolder);
    const inp = el('newFolderInput');
    if (creatingNewFolder && inp) inp.focus();
  });

  // ── Save ──────────────────────────────────────────────────────────────────
  const saveBtn = el('saveBtn');
  if (saveBtn) saveBtn.addEventListener('click', async () => {
    const titleInput = el('titleInput');
    const title = (titleInput ? titleInput.value.trim() : '') || currentTitle;
    const wsId  = selectedWsId;

    if (!title || !currentUrl) { showToast('Missing title or URL.', 'err'); return; }
    if (currentUrl.startsWith('chrome://') || currentUrl.startsWith('chrome-extension://')) {
      showToast("This page can't be bookmarked.", 'err'); return;
    }
    if (!wsId) { showToast('Select a workspace.', 'err'); return; }

    if (!wsData[wsId]) wsData[wsId] = { quickAccess:[], notes:[], tasks:[], folders:[], importedBookmarks:[] };
    const data = wsData[wsId];

    if (destMode === 'quick') {
      if ((data.quickAccess || []).some(b => b.url === currentUrl)) {
        showToast('Already in Quick Access.', 'err'); return;
      }
      if (!data.quickAccess) data.quickAccess = [];
      data.quickAccess.push({ id: Date.now(), name: title, url: currentUrl });
    } else {
      let folderId = null;
      let folderName = '';
      if (!data.folders) data.folders = [];
      if (creatingNewFolder) {
        const inp = el('newFolderInput');
        folderName = inp ? inp.value.trim() : '';
        if (!folderName) { showToast('Enter a folder name.', 'err'); return; }
        let existing = data.folders.find(f => f.parentId == null && (f.name || f) === folderName);
        if (!existing) {
          existing = {
            id: 'f_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            name: folderName,
            parentId: null,
          };
          data.folders.push(existing);
        } else if (!existing.id) {
          existing.id = 'f_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
          existing.parentId = null;
        }
        folderId = existing.id;
      } else {
        const sel = selectedFolder;
        if (!sel) { showToast('Select a folder.', 'err'); return; }
        if (typeof sel === 'string' && sel.startsWith('name:')) {
          // Legacy unmigrated folder — create a real entry now
          folderName = sel.slice(5);
          let existing = data.folders.find(f => f.parentId == null && (f.name || f) === folderName);
          if (!existing) {
            existing = {
              id: 'f_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
              name: folderName, parentId: null,
            };
            data.folders.push(existing);
          } else if (!existing.id) {
            existing.id = 'f_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
            existing.parentId = null;
          }
          folderId = existing.id;
        } else {
          folderId = sel;
          const f = data.folders.find(x => x.id === folderId);
          if (!f) { showToast('Folder not found.', 'err'); return; }
          folderName = f.name;
        }
      }
      if ((data.importedBookmarks || []).some(b => b.url === currentUrl && b.folderId === folderId)) {
        showToast('Already in that folder.', 'err'); return;
      }
      if (!data.importedBookmarks) data.importedBookmarks = [];
      data.importedBookmarks.push({ id: 'p_' + Date.now(), title, url: currentUrl, folderId, folderName });
    }

    saveBtn.disabled = true;
    try {
      await new Promise((res, rej) => {
        chrome.storage.local.set({ wsData }, () => {
          chrome.runtime.lastError ? rej(chrome.runtime.lastError) : res();
        });
      });
      showToast('Bookmark saved!', 'ok');
      setTimeout(() => window.close(), 900);
    } catch {
      saveBtn.disabled = false;
      showToast('Save failed. Try again.', 'err');
    }
  });
}

// Script runs after full HTML parse (defer attribute on script tag)
init();
