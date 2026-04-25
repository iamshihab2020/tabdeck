'use strict';
// =============================================
//  FIREFLY TAB — app.js v2 (All bugs fixed)
// =============================================

// ===== CHROME API WRAPPER =====
const IS_CHROME = typeof chrome !== 'undefined' && !!chrome.runtime?.id;

const API = {
  get: (keys) => new Promise(res => {
    if (IS_CHROME && chrome.storage) {
      chrome.storage.sync.get(keys, res);
    } else {
      const out = {};
      (Array.isArray(keys) ? keys : [keys]).forEach(k => {
        try { out[k] = JSON.parse(localStorage.getItem('ft2_' + k)); } catch(e) {}
      });
      res(out);
    }
  }),
  set: (data) => new Promise(res => {
    if (IS_CHROME && chrome.storage) {
      chrome.storage.sync.set(data, res);
    } else {
      Object.entries(data).forEach(([k,v]) => localStorage.setItem('ft2_' + k, JSON.stringify(v)));
      res();
    }
  }),
  getLocal: (keys) => new Promise(res => {
    if (IS_CHROME && chrome.storage) {
      chrome.storage.local.get(keys, res);
    } else {
      const out = {};
      (Array.isArray(keys) ? keys : [keys]).forEach(k => {
        try { out[k] = JSON.parse(localStorage.getItem('ftL_' + k)); } catch(e) {}
      });
      res(out);
    }
  }),
  setLocal: (data) => new Promise(res => {
    if (IS_CHROME && chrome.storage) {
      chrome.storage.local.set(data, res);
    } else {
      Object.entries(data).forEach(([k,v]) => localStorage.setItem('ftL_' + k, JSON.stringify(v)));
      res();
    }
  }),
  bookmarks: () => new Promise(res => {
    if (IS_CHROME && chrome.bookmarks) {
      chrome.bookmarks.getTree(tree => res(tree || []));
    } else {
      // Demo bookmarks for non-Chrome
      res([{id:'0',title:'',children:[
        {id:'1',title:'Bookmarks bar',children:[
          {id:'10',title:'Social Media',children:[
            {id:'100',title:'YouTube',url:'https://youtube.com'},
            {id:'101',title:'Twitter / X',url:'https://twitter.com'},
            {id:'102',title:'Instagram',url:'https://instagram.com'},
            {id:'103',title:'Facebook',url:'https://facebook.com'},
            {id:'104',title:'TikTok',url:'https://tiktok.com'},
          ]},
          {id:'11',title:'Development',children:[
            {id:'110',title:'GitHub',url:'https://github.com'},
            {id:'111',title:'Stack Overflow',url:'https://stackoverflow.com'},
            {id:'112',title:'MDN Web Docs',url:'https://developer.mozilla.org'},
            {id:'113',title:'CodePen',url:'https://codepen.io'},
          ]},
          {id:'12',title:'Design Resources',children:[
            {id:'120',title:'Figma',url:'https://figma.com'},
            {id:'121',title:'Dribbble',url:'https://dribbble.com'},
            {id:'122',title:'Behance',url:'https://behance.net'},
          ]},
        ]},
        {id:'2',title:'Other bookmarks',children:[
          {id:'20',title:'Tools',children:[
            {id:'200',title:'Notion',url:'https://notion.so'},
            {id:'201',title:'Trello',url:'https://trello.com'},
            {id:'202',title:'Google Drive',url:'https://drive.google.com'},
          ]},
        ]},
      ]}]);
    }
  }),
  history: (query='') => new Promise(res => {
    if (IS_CHROME && chrome.history) {
      chrome.history.search({text:query, maxResults:100, startTime: Date.now()-30*86400000}, res);
    } else {
      res([
        {id:'1',title:'GitHub',url:'https://github.com',lastVisitTime:Date.now()-1800000},
        {id:'2',title:'Stack Overflow',url:'https://stackoverflow.com',lastVisitTime:Date.now()-3600000},
        {id:'3',title:'MDN Web Docs',url:'https://developer.mozilla.org',lastVisitTime:Date.now()-7200000},
        {id:'4',title:'YouTube',url:'https://youtube.com',lastVisitTime:Date.now()-10800000},
        {id:'5',title:'Google',url:'https://google.com',lastVisitTime:Date.now()-14400000},
        {id:'6',title:'Figma',url:'https://figma.com',lastVisitTime:Date.now()-18000000},
        {id:'7',title:'Notion',url:'https://notion.so',lastVisitTime:Date.now()-21600000},
        {id:'8',title:'Twitter',url:'https://twitter.com',lastVisitTime:Date.now()-86400000},
      ]);
    }
  }),
  downloads: () => new Promise(res => {
    if (IS_CHROME && chrome.downloads) {
      chrome.downloads.search({limit:50, orderBy:['-startTime']}, res);
    } else {
      res([
        {id:1,filename:'/Downloads/project-report.pdf',fileSize:2457600,state:'complete',startTime:new Date(Date.now()-86400000).toISOString()},
        {id:2,filename:'/Downloads/design-assets.zip',fileSize:15728640,state:'complete',startTime:new Date(Date.now()-172800000).toISOString()},
        {id:3,filename:'/Downloads/nodejs-setup.exe',fileSize:31457280,state:'complete',startTime:new Date(Date.now()-259200000).toISOString()},
      ]);
    }
  }),
  identity: () => new Promise(res => {
    if (IS_CHROME && chrome.identity && chrome.identity.getProfileUserInfo) {
      try {
        chrome.identity.getProfileUserInfo({accountStatus:'ANY'}, info => {
          if (chrome.runtime.lastError) { res(null); return; }
          res(info && info.email ? info : null);
        });
      } catch(e) { res(null); }
    } else { res(null); }
  }),
  createBookmark: (details) => new Promise(res => {
    if (IS_CHROME && chrome.bookmarks) {
      chrome.bookmarks.create(details, node => res(node || null));
    } else { res(null); }
  }),
  updateBookmark: (id, changes) => new Promise(res => {
    if (IS_CHROME && chrome.bookmarks) {
      chrome.bookmarks.update(id, changes, node => res(node || null));
    } else { res(null); }
  }),
  moveBookmark: (id, dest) => new Promise(res => {
    if (IS_CHROME && chrome.bookmarks) {
      chrome.bookmarks.move(id, dest, node => res(node || null));
    } else { res(null); }
  }),
  removeBookmark: (id) => new Promise(res => {
    if (IS_CHROME && chrome.bookmarks) {
      chrome.bookmarks.remove(id, () => res(true));
    } else { res(false); }
  }),
  removeBookmarkTree: (id) => new Promise(res => {
    if (IS_CHROME && chrome.bookmarks) {
      chrome.bookmarks.removeTree(id, () => res(true));
    } else { res(false); }
  }),
  deleteHistoryUrl: (url) => new Promise(res => {
    if (IS_CHROME && chrome.history) {
      chrome.history.deleteUrl({url}, () => res(true));
    } else { res(false); }
  }),
  deleteAllHistory: () => new Promise(res => {
    if (IS_CHROME && chrome.history) {
      chrome.history.deleteAll(() => res(true));
    } else { res(false); }
  }),
  showDownload: (id) => {
    if (IS_CHROME && chrome.downloads) chrome.downloads.show(id);
  },
};

// ===== DEFAULT DATA =====
const DEFAULT_WORKSPACES = [
  {id:1, name:'Home', icon:'🏠'},
  {id:2, name:'AI',   icon:'🤖'},
  {id:3, name:'Dev',  icon:'💻'},
];

const DEFAULT_WS_DATA = (id) => {
  if (id === 1) return {
    quickAccess: [
      {id:101,name:'Gmail',url:'https://mail.google.com'},
      {id:102,name:'YouTube',url:'https://youtube.com'},
      {id:103,name:'WhatsApp',url:'https://web.whatsapp.com'},
      {id:104,name:'Google Drive',url:'https://drive.google.com'},
      {id:105,name:'Google Maps',url:'https://maps.google.com'},
      {id:106,name:'Google',url:'https://google.com'},
    ],
    notes: [],
    tasks: [],
    folders: [
      {name:'Google'},
      {name:'Social Media'},
    ],
    importedBookmarks: [
      // Google Services
      {id:'ws1_001',title:'Google',url:'https://google.com',folderName:'Google'},
      {id:'ws1_002',title:'Gmail',url:'https://mail.google.com',folderName:'Google'},
      {id:'ws1_003',title:'YouTube',url:'https://youtube.com',folderName:'Google'},
      {id:'ws1_004',title:'Google Drive',url:'https://drive.google.com',folderName:'Google'},
      {id:'ws1_005',title:'Google Maps',url:'https://maps.google.com',folderName:'Google'},
      {id:'ws1_006',title:'Google Photos',url:'https://photos.google.com',folderName:'Google'},
      {id:'ws1_007',title:'Google Docs',url:'https://docs.google.com',folderName:'Google'},
      {id:'ws1_008',title:'Google Sheets',url:'https://sheets.google.com',folderName:'Google'},
      {id:'ws1_009',title:'Google Slides',url:'https://slides.google.com',folderName:'Google'},
      {id:'ws1_010',title:'Google Calendar',url:'https://calendar.google.com',folderName:'Google'},
      {id:'ws1_011',title:'Google Meet',url:'https://meet.google.com',folderName:'Google'},
      {id:'ws1_012',title:'Google Translate',url:'https://translate.google.com',folderName:'Google'},
      {id:'ws1_013',title:'Google News',url:'https://news.google.com',folderName:'Google'},
      {id:'ws1_014',title:'Google Forms',url:'https://forms.google.com',folderName:'Google'},
      // Social Media
      {id:'ws1_101',title:'Facebook',url:'https://facebook.com',folderName:'Social Media'},
      {id:'ws1_102',title:'X (Twitter)',url:'https://x.com',folderName:'Social Media'},
      {id:'ws1_103',title:'Instagram',url:'https://instagram.com',folderName:'Social Media'},
      {id:'ws1_104',title:'LinkedIn',url:'https://linkedin.com',folderName:'Social Media'},
      {id:'ws1_105',title:'Reddit',url:'https://reddit.com',folderName:'Social Media'},
      {id:'ws1_106',title:'TikTok',url:'https://tiktok.com',folderName:'Social Media'},
      {id:'ws1_107',title:'Pinterest',url:'https://pinterest.com',folderName:'Social Media'},
      {id:'ws1_108',title:'WhatsApp Web',url:'https://web.whatsapp.com',folderName:'Social Media'},
      {id:'ws1_109',title:'Telegram Web',url:'https://web.telegram.org',folderName:'Social Media'},
      {id:'ws1_110',title:'Discord',url:'https://discord.com',folderName:'Social Media'},
      {id:'ws1_111',title:'Snapchat',url:'https://snapchat.com',folderName:'Social Media'},
      {id:'ws1_112',title:'Threads',url:'https://threads.net',folderName:'Social Media'},
    ],
  };
  if (id === 2) return {
    quickAccess: [
      {id:201,name:'ChatGPT',url:'https://chat.openai.com'},
      {id:202,name:'Claude',url:'https://claude.ai'},
      {id:203,name:'Gemini',url:'https://gemini.google.com'},
      {id:204,name:'Perplexity',url:'https://perplexity.ai'},
      {id:205,name:'Copilot',url:'https://copilot.microsoft.com'},
      {id:206,name:'Hugging Face',url:'https://huggingface.co'},
    ],
    notes: [],
    tasks: [],
    folders: [
      {name:'AI Chatbots'},
      {name:'AI Image & Video'},
      {name:'AI Audio'},
      {name:'AI Dev Tools'},
    ],
    importedBookmarks: [
      // AI Chatbots
      {id:'ws2_001',title:'ChatGPT',url:'https://chat.openai.com',folderName:'AI Chatbots'},
      {id:'ws2_002',title:'Claude',url:'https://claude.ai',folderName:'AI Chatbots'},
      {id:'ws2_003',title:'Gemini',url:'https://gemini.google.com',folderName:'AI Chatbots'},
      {id:'ws2_004',title:'Perplexity',url:'https://perplexity.ai',folderName:'AI Chatbots'},
      {id:'ws2_005',title:'Microsoft Copilot',url:'https://copilot.microsoft.com',folderName:'AI Chatbots'},
      {id:'ws2_006',title:'Grok',url:'https://grok.com',folderName:'AI Chatbots'},
      {id:'ws2_007',title:'DeepSeek',url:'https://chat.deepseek.com',folderName:'AI Chatbots'},
      {id:'ws2_008',title:'Mistral Le Chat',url:'https://chat.mistral.ai',folderName:'AI Chatbots'},
      {id:'ws2_009',title:'Meta AI',url:'https://meta.ai',folderName:'AI Chatbots'},
      // AI Image & Video
      {id:'ws2_101',title:'Midjourney',url:'https://midjourney.com',folderName:'AI Image & Video'},
      {id:'ws2_102',title:'DALL-E (ChatGPT)',url:'https://chat.openai.com',folderName:'AI Image & Video'},
      {id:'ws2_103',title:'Stable Diffusion',url:'https://stability.ai',folderName:'AI Image & Video'},
      {id:'ws2_104',title:'Runway',url:'https://runwayml.com',folderName:'AI Image & Video'},
      {id:'ws2_105',title:'Leonardo AI',url:'https://leonardo.ai',folderName:'AI Image & Video'},
      {id:'ws2_106',title:'Adobe Firefly',url:'https://firefly.adobe.com',folderName:'AI Image & Video'},
      {id:'ws2_107',title:'Ideogram',url:'https://ideogram.ai',folderName:'AI Image & Video'},
      {id:'ws2_108',title:'Kling AI',url:'https://klingai.com',folderName:'AI Image & Video'},
      // AI Audio
      {id:'ws2_201',title:'ElevenLabs',url:'https://elevenlabs.io',folderName:'AI Audio'},
      {id:'ws2_202',title:'Suno',url:'https://suno.com',folderName:'AI Audio'},
      {id:'ws2_203',title:'Udio',url:'https://udio.com',folderName:'AI Audio'},
      {id:'ws2_204',title:'Murf AI',url:'https://murf.ai',folderName:'AI Audio'},
      {id:'ws2_205',title:'Descript',url:'https://descript.com',folderName:'AI Audio'},
      // AI Dev Tools
      {id:'ws2_301',title:'Cursor',url:'https://cursor.com',folderName:'AI Dev Tools'},
      {id:'ws2_302',title:'GitHub Copilot',url:'https://github.com/features/copilot',folderName:'AI Dev Tools'},
      {id:'ws2_303',title:'Codeium',url:'https://codeium.com',folderName:'AI Dev Tools'},
      {id:'ws2_304',title:'Windsurf',url:'https://codeium.com/windsurf',folderName:'AI Dev Tools'},
      {id:'ws2_305',title:'Replit AI',url:'https://replit.com',folderName:'AI Dev Tools'},
      {id:'ws2_306',title:'v0 by Vercel',url:'https://v0.dev',folderName:'AI Dev Tools'},
      {id:'ws2_307',title:'Hugging Face',url:'https://huggingface.co',folderName:'AI Dev Tools'},
    ],
  };
  if (id === 3) return {
    quickAccess: [
      {id:301,name:'GitHub',url:'https://github.com'},
      {id:302,name:'Stack Overflow',url:'https://stackoverflow.com'},
      {id:303,name:'MDN Docs',url:'https://developer.mozilla.org'},
      {id:304,name:'Vercel',url:'https://vercel.com'},
      {id:305,name:'Figma',url:'https://figma.com'},
      {id:306,name:'DevDocs',url:'https://devdocs.io'},
    ],
    notes: [],
    tasks: [],
    folders: [
      {name:'Code & Repos'},
      {name:'Docs & Reference'},
      {name:'Dev Platforms'},
      {name:'Design'},
    ],
    importedBookmarks: [
      // Code & Repos
      {id:'ws3_001',title:'GitHub',url:'https://github.com',folderName:'Code & Repos'},
      {id:'ws3_002',title:'GitLab',url:'https://gitlab.com',folderName:'Code & Repos'},
      {id:'ws3_003',title:'Bitbucket',url:'https://bitbucket.org',folderName:'Code & Repos'},
      {id:'ws3_004',title:'CodePen',url:'https://codepen.io',folderName:'Code & Repos'},
      {id:'ws3_005',title:'StackBlitz',url:'https://stackblitz.com',folderName:'Code & Repos'},
      {id:'ws3_006',title:'Replit',url:'https://replit.com',folderName:'Code & Repos'},
      {id:'ws3_007',title:'JSFiddle',url:'https://jsfiddle.net',folderName:'Code & Repos'},
      {id:'ws3_008',title:'npm',url:'https://npmjs.com',folderName:'Code & Repos'},
      // Docs & Reference
      {id:'ws3_101',title:'MDN Web Docs',url:'https://developer.mozilla.org',folderName:'Docs & Reference'},
      {id:'ws3_102',title:'DevDocs',url:'https://devdocs.io',folderName:'Docs & Reference'},
      {id:'ws3_103',title:'Stack Overflow',url:'https://stackoverflow.com',folderName:'Docs & Reference'},
      {id:'ws3_104',title:'W3Schools',url:'https://w3schools.com',folderName:'Docs & Reference'},
      {id:'ws3_105',title:'Can I Use',url:'https://caniuse.com',folderName:'Docs & Reference'},
      {id:'ws3_106',title:'CSS-Tricks',url:'https://css-tricks.com',folderName:'Docs & Reference'},
      {id:'ws3_107',title:'web.dev',url:'https://web.dev',folderName:'Docs & Reference'},
      // Dev Platforms
      {id:'ws3_201',title:'Vercel',url:'https://vercel.com',folderName:'Dev Platforms'},
      {id:'ws3_202',title:'Netlify',url:'https://netlify.com',folderName:'Dev Platforms'},
      {id:'ws3_203',title:'Railway',url:'https://railway.app',folderName:'Dev Platforms'},
      {id:'ws3_204',title:'Supabase',url:'https://supabase.com',folderName:'Dev Platforms'},
      {id:'ws3_205',title:'Firebase',url:'https://firebase.google.com',folderName:'Dev Platforms'},
      {id:'ws3_206',title:'Render',url:'https://render.com',folderName:'Dev Platforms'},
      {id:'ws3_207',title:'Cloudflare',url:'https://cloudflare.com',folderName:'Dev Platforms'},
      {id:'ws3_208',title:'Postman',url:'https://postman.com',folderName:'Dev Platforms'},
      // Design
      {id:'ws3_301',title:'Figma',url:'https://figma.com',folderName:'Design'},
      {id:'ws3_302',title:'Dribbble',url:'https://dribbble.com',folderName:'Design'},
      {id:'ws3_303',title:'Behance',url:'https://behance.net',folderName:'Design'},
      {id:'ws3_304',title:'Tailwind CSS',url:'https://tailwindcss.com',folderName:'Design'},
      {id:'ws3_305',title:'Google Fonts',url:'https://fonts.google.com',folderName:'Design'},
      {id:'ws3_306',title:'Font Awesome',url:'https://fontawesome.com',folderName:'Design'},
      {id:'ws3_307',title:'Coolors',url:'https://coolors.co',folderName:'Design'},
      {id:'ws3_308',title:'Lucide Icons',url:'https://lucide.dev',folderName:'Design'},
    ],
  };
  return { quickAccess: [], notes: [], tasks: [], importedBookmarks: [] };
};

const FALLBACK_QUOTES = [
  {quote:'The best way to predict the future is to create it.',author:'Peter Drucker'},
  {quote:'Simplicity is the ultimate sophistication.',author:'Leonardo da Vinci'},
  {quote:'It always seems impossible until it\'s done.',author:'Nelson Mandela'},
];

// ===== STATE =====
let S = {
  user:          { name:'Ahsan', avatarColor:'#7c3aed', googlePicture:null, googleName:null },
  workspaces:    [],
  activeWsId:    1,
  wsData:        {},   // {[wsId]: {quickAccess,notes,tasks}}
  trash:         [],
  settings: {
    theme:       'dark',
    accentColor: '#7c3aed',
    clockFormat: '12',
    showSeconds: true,
    cardGlow:    'glow',
    widgets:     { notes:true, tasks:true, quote:true, timer:true },
    gridView:         false,
    sidebarCollapsed: false,
  },
  allBookmarks:  [],   // parsed flat array of folders
  timer: { total:1500, remaining:1500, running:false, interval:null },
  editingNoteId: null,
  notesViewSearch: '',
  notesViewTagFilter: null,
  bmFolderFilter: null,
  bmSort: 'az',
  googleUser:    null,
  weatherLocation: null,  // null = auto-detect, string = manual city
};

// ===== BOOT =====
document.addEventListener('DOMContentLoaded', async () => {
  await loadState();
  initClock();
  updateGreeting();
  autoDetectWeather();
  setupEventListeners();
  setupSearch();
  initTooltips();
  _cmdInitKeyboard();
  renderAll();
  loadBookmarks();
  loadHistory('');
  loadDownloads();
  checkGoogleIdentity();

  document.addEventListener('keydown', e => {
    if (e.key === '/' && !['INPUT','TEXTAREA'].includes(e.target.tagName)) {
      e.preventDefault();
      openCmdPalette();
    }
    if (e.key === 'Escape') {
      if (el('cmdPaletteOverlay').classList.contains('open')) { closeCmdPalette(); return; }
      closeAllModals();
      closeSettings();
      closeFab();
    }
  });
});

// ===== PERSIST =====
// wsData goes to local storage (large, can contain hundreds of bookmarks).
async function loadState() {
  let d = await API.getLocal(['user','workspaces','activeWsId','trash','settings','weatherLocation','wsData']);
  // One-time migration: pull from sync storage if local is still empty
  if (!d.settings && IS_CHROME && chrome.storage) {
    const synced = await API.get(['user','workspaces','activeWsId','trash','settings','weatherLocation']);
    if (synced.settings) { d = { ...d, ...synced }; save(); }
  }
  S.user       = d.user       || S.user;
  S.workspaces = Array.isArray(d.workspaces) && d.workspaces.length ? d.workspaces : DEFAULT_WORKSPACES;
  // Normalize all workspace IDs to numbers for consistent comparison
  S.workspaces.forEach(ws => { ws.id = Number(ws.id); });
  const savedWsId = d.activeWsId != null ? Number(d.activeWsId) : S.workspaces[0].id;
  S.activeWsId = S.workspaces.find(w => w.id === savedWsId) ? savedWsId : S.workspaces[0].id;
  S.trash      = Array.isArray(d.trash) ? d.trash : [];
  S.settings   = d.settings   ? { ...S.settings, ...d.settings, widgets:{ ...S.settings.widgets, ...(d.settings.widgets||{}) } } : S.settings;
  S.weatherLocation = d.weatherLocation || null;
  S.wsData = d.wsData || {};
  S.workspaces.forEach(ws => {
    if (!S.wsData[ws.id]) S.wsData[ws.id] = DEFAULT_WS_DATA(ws.id);
  });
  // Migration: ensure AI (id:2) and Dev (id:3) preset workspaces exist
  const wsIds = S.workspaces.map(w => w.id);
  let migrated = false;
  if (!wsIds.includes(2)) {
    S.workspaces.push({id:2, name:'AI', icon:'🤖'});
    S.wsData[2] = DEFAULT_WS_DATA(2);
    migrated = true;
  }
  if (!wsIds.includes(3)) {
    S.workspaces.push({id:3, name:'Dev', icon:'💻'});
    S.wsData[3] = DEFAULT_WS_DATA(3);
    migrated = true;
  }
  if (migrated) save();
  applyAccent(S.settings.accentColor);
  applyTheme(S.settings.theme);
  applyCardGlow(S.settings.cardGlow || 'glow');
  document.body.classList.toggle('grid-view-mode', !!S.settings.gridView);
  el('gridViewBtn')?.classList.toggle('active', !!S.settings.gridView);
  document.body.classList.toggle('sidebar-collapsed', !!S.settings.sidebarCollapsed);
  el('sidebarToggleBtn')?.classList.toggle('active', !!S.settings.sidebarCollapsed);
  updateAvatarDisplay();
}

function save() {
  return API.setLocal({
    user: S.user,
    workspaces: S.workspaces,
    activeWsId: S.activeWsId,
    trash: S.trash,
    settings: S.settings,
    weatherLocation: S.weatherLocation,
    wsData: S.wsData,
  });
}

// ===== HELPERS =====
const el = id => document.getElementById(id);
const escH = s => s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : '';
const getDomain = url => { try { return new URL(url).hostname.replace('www.',''); } catch { return url; }};
const fmtTimeAgo = ms => {
  const d = Date.now()-ms, m = Math.floor(d/60000);
  if (m<1) return 'just now'; if (m<60) return m+'m ago';
  const h = Math.floor(m/60); if (h<24) return h+'h ago';
  return Math.floor(h/24)+'d ago';
};
const fmtBytes = b => { if(!b) return '0 B'; const k=1024, s=['B','KB','MB','GB']; const i=Math.floor(Math.log(b)/Math.log(k)); return (b/Math.pow(k,i)).toFixed(1)+' '+s[i]; };
const fileIcon = e => ({pdf:'📄',zip:'📦',rar:'📦',jpg:'🖼️',jpeg:'🖼️',png:'🖼️',gif:'🖼️',webp:'🖼️',mp4:'🎬',mkv:'🎬',mp3:'🎵',wav:'🎵',doc:'📝',docx:'📝',txt:'📝',xls:'📊',xlsx:'📊',csv:'📊',exe:'⚙️',dmg:'⚙️',js:'💻',ts:'💻',py:'💻',html:'💻',css:'💻'}[e]||'📁');
function debounce(fn,d){let t; return (...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),d);}}
function favSrc(url) {
  try {
    const origin = new URL(url).origin;
    return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(origin)}&size=64`;
  } catch {
    return `https://www.google.com/s2/favicons?domain=${getDomain(url)}&sz=64`;
  }
}

// Workspace edit state
let _editingWsId = null;

// Bookmark/folder edit state (Chrome native bookmarks)
let _bmEditId = null;
let _bmEditParentId = null;
let _folderEditId = null;
let _folderParentId = '1';
let _openFolderId = null;

// Workspace bookmark/folder edit state
let _wsFolderEditName = null;
let _wsBmEditId = null;
let _wsBmDefaultFolder = null;
let _wsBmFolderValue = null;  // currently selected value in custom folder dropdown
let _qaEditId = null;

// Current workspace data helpers
function wsData() {
  const d = S.wsData[S.activeWsId] || (S.wsData[S.activeWsId] = { quickAccess: [], notes: [], tasks: [], importedBookmarks: [] });
  if (!d.folders) d.folders = [];
  return d;
}
function wsNotes()  { return wsData().notes;       }
function wsTasks()  { return wsData().tasks;       }
function wsQA()     { return wsData().quickAccess; }
function wsBookmarks() { const d = wsData(); if (!d.importedBookmarks) d.importedBookmarks = []; return d.importedBookmarks; }
function wsFolders()   { return wsData().folders; }

// Returns all folder names: explicit empty ones first, then any derived from bookmarks not yet in the explicit list
function allWsFolderNames() {
  const explicit = wsFolders().map(f => f.name);
  const seen = new Set(explicit);
  wsBookmarks().forEach(b => {
    const k = b.folderName || 'Other';
    if (!seen.has(k)) { seen.add(k); explicit.push(k); }
  });
  return explicit;
}

// ===== CLOCK =====
let clockInterval = null;
function initClock() {
  updateClock();
  clockInterval = setInterval(updateClock, 1000);
}
function updateClock() {
  const n = new Date();
  let h = n.getHours(), m = n.getMinutes(), s = n.getSeconds();
  let ampm = '';
  if (S.settings.clockFormat === '12') {
    ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
  }
  let str = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  if (S.settings.showSeconds) str += `:${String(s).padStart(2,'0')}`;
  el('clockDisplay').textContent = str;
  el('clockAmPm').textContent = ampm;
  const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  el('dateDisplay').textContent = `${days[n.getDay()]}, ${months[n.getMonth()]} ${n.getDate()}, ${n.getFullYear()}`;
}

function updateGreeting() {
  const h = new Date().getHours();
  const g = h>=5&&h<12?'Good morning':h>=12&&h<17?'Good afternoon':h>=17&&h<21?'Good evening':'Good night';
  el('greetingText').textContent = `${g}, ${S.user.name} 👋`;
}

// ===== WEATHER =====
async function fetchWeather(locationOverride) {
  const loc = locationOverride !== undefined ? locationOverride : S.weatherLocation;
  const url = loc
    ? `https://wttr.in/${encodeURIComponent(loc)}?format=j1`
    : 'https://wttr.in/?format=j1';
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error('bad response');
    const d = await r.json();
    const c = d.current_condition[0];
    const a = d.nearest_area[0];
    const apiCity   = a.areaName[0]?.value || '';
    const region    = a.region[0]?.value   || '';
    const country   = a.country[0]?.value  || '';
    const isCoords  = loc && /^-?\d+\.\d+,-?\d+\.\d+$/.test(loc);
    const isManual  = loc && !isCoords;
    // Manual entry: show what the user typed + country; auto: use API area name
    const displayCity = isManual ? loc : apiCity;
    const locationStr = (region && region !== displayCity && !isManual)
      ? `${displayCity}, ${region}`
      : `${displayCity}, ${country}`;
    el('weatherIcon').textContent = weatherEmoji(parseInt(c.weatherCode));
    el('weatherTemp').textContent = c.temp_C + '°C';
    el('weatherCity').textContent = locationStr;
    el('weatherDesc').textContent = c.weatherDesc?.[0]?.value || '';
    return true;
  } catch {
    el('weatherCity').textContent = 'Unavailable';
    el('weatherDesc').textContent = '';
    return false;
  }
}

// Detect location via ipapi.co (more accurate than wttr.in IP detection)
async function detectByIP() {
  try {
    const r = await fetch('https://ipapi.co/json/');
    if (!r.ok) throw new Error();
    const d = await r.json();
    if (d.latitude && d.longitude) {
      const locStr = `${d.latitude},${d.longitude}`;
      const ok = await fetchWeather(locStr);
      if (ok) { S.weatherLocation = locStr; save(); return; }
    }
  } catch {}
  // Last resort: wttr.in bare IP
  fetchWeather(undefined);
}

// GPS → ipapi.co → wttr.in IP. Skips detection if user has a valid saved location.
async function autoDetectWeather() {
  if (S.weatherLocation) { fetchWeather(S.weatherLocation); return; }
  el('weatherCity').textContent = 'Detecting...';
  el('weatherTemp').textContent = '--°C';
  el('weatherDesc').textContent = '';

  if (!navigator.geolocation) { detectByIP(); return; }

  navigator.geolocation.getCurrentPosition(
    async pos => {
      const { latitude: lat, longitude: lon } = pos.coords;
      const locStr = `${lat.toFixed(4)},${lon.toFixed(4)}`;
      const ok = await fetchWeather(locStr);
      if (ok) { S.weatherLocation = locStr; save(); }
      else detectByIP();
    },
    () => detectByIP(), // permission denied → ipapi.co fallback
    { timeout: 6000, maximumAge: 600000 }
  );
}

// Force re-detect (clears saved location first)
async function reDetectWeather() {
  S.weatherLocation = null;
  save();
  autoDetectWeather();
}

// Weather location modal
function openWeatherLocationModal() {
  el('weatherLocationInput').value = S.weatherLocation || '';
  el('weatherLocationStatus').textContent = '';
  openModal('weatherLocationModal');
}

async function saveWeatherLocation() {
  const city = el('weatherLocationInput').value.trim();
  if (!city) { showToast('Enter a city name', 'error'); return; }
  el('weatherLocationStatus').textContent = 'Checking...';
  const ok = await fetchWeather(city);
  if (ok) {
    S.weatherLocation = city;
    save();
    closeModal('weatherLocationModal');
    showToast(`Weather set to ${city}`, 'success');
  } else {
    el('weatherLocationStatus').textContent = '⚠ City not found. Try a different name.';
  }
}

async function detectWeatherLocation() {
  const status = el('weatherLocationStatus');
  status.textContent = '📡 Detecting your location...';
  if (!navigator.geolocation) {
    status.textContent = '⚠ Geolocation not supported by this browser.';
    return;
  }
  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude: lat, longitude: lon } = pos.coords;
    const locStr = `${lat.toFixed(4)},${lon.toFixed(4)}`;
    status.textContent = '🌐 Fetching weather...';
    const ok = await fetchWeather(locStr);
    if (ok) {
      S.weatherLocation = locStr;
      save();
      status.textContent = '✓ Location detected!';
      setTimeout(() => closeModal('weatherLocationModal'), 700);
      showToast('Location detected!', 'success');
    } else {
      status.textContent = '⚠ Could not fetch weather for your location.';
    }
  }, err => {
    status.textContent = err.code === 1
      ? '⚠ Permission denied. Allow location access in Chrome settings.'
      : '⚠ Could not determine location. Try entering a city manually.';
  }, { timeout: 8000 });
}

function weatherEmoji(c) {
  if (c===113) return '☀️';
  if (c===116) return '⛅';
  if (c===119||c===122) return '☁️';
  if (c>=386&&c<=395) return '⛈️';  // thundery (must check before rain)
  if (c>=323&&c<=377) return '❄️';  // snow/sleet (correct wttr.in range, before rain)
  if (c>=176&&c<=321) return '🌧️'; // rain/drizzle
  return '🌤️';
}

// ===== GOOGLE IDENTITY + PROFILE IMAGE =====
async function checkGoogleIdentity() {
  const info = await API.identity();
  if (info && info.email) {
    S.googleUser = info;
    el('syncCard').style.display = 'none';
    // Try to get Google profile picture
    fetchGoogleProfilePicture();
    // Update name from email only if no real name has been set yet
    if (!S.user.name || S.user.name === 'Ahsan' || (!S.user.googleName && !S.user.name)) {
      const nameParts = (info.email.split('@')[0] || 'User').replace(/[._]/g,' ');
      S.user.name = nameParts.charAt(0).toUpperCase() + nameParts.slice(1);
      updateGreeting();
      save();
    }
    updateAvatarDisplay();
  } else {
    el('syncCard').style.display = '';
    el('signInBtn').addEventListener('click', () => {
      if (IS_CHROME && chrome.identity) {
        chrome.identity.getAuthToken({interactive:true}, token => {
          if (token) { checkGoogleIdentity(); } else { showToast('Sign-in cancelled'); }
        });
      } else {
        openModal('profileModal');
      }
    });
  }
}

// Fetch Google profile picture using OAuth token
function fetchGoogleProfilePicture() {
  if (!IS_CHROME || !chrome.identity) return;
  chrome.identity.getAuthToken({interactive: false}, async token => {
    if (chrome.runtime.lastError || !token) return;
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.picture) {
        S.googleUser.picture = data.picture;
        S.user.googlePicture = data.picture;
        if (data.name) {
          S.user.name = data.name;
          S.user.googleName = data.name;
        }
        updateAvatarDisplay();
        updateGreeting();
        save();
      }
    } catch {}
  });
}

// Update avatar: show Google photo if available, else letter
function updateAvatarDisplay() {
  const avatarEl = el('userAvatar');
  const pic = (S.googleUser && S.googleUser.picture) || S.user.googlePicture;
  if (pic) {
    avatarEl.innerHTML = `<img src="${escH(pic)}" alt="Profile" class="avatar-google-img" onerror="this.parentElement.innerHTML='${S.user.name?.[0]?.toUpperCase()||'U'}'">`;
    avatarEl.style.background = 'transparent';
    avatarEl.style.padding = '0';
  } else {
    avatarEl.innerHTML = S.user.name ? S.user.name[0].toUpperCase() : 'U';
    avatarEl.style.background = S.user.avatarColor || '#7c3aed';
    avatarEl.style.padding = '';
  }
}

// ===== RENDER ALL =====
function renderAll() {
  renderSidebarWorkspaces();
  renderTabsWorkspaces();
  renderSidebarFolders();
  applyWidgetVisibility();
  renderQuickAccess();
  renderWorkspaceBookmarks();
  renderNotesWidget();
  renderTasksWidget();
  renderQuote();
  renderNotesView();
  renderTrash();
}

// ===== FIX #7 — WORKSPACE SWITCHING =====
function setActiveWorkspace(wsId) {
  const id = Number(wsId);
  if (id === S.activeWsId) return;
  S.activeWsId = id;
  save();
  renderSidebarWorkspaces();
  renderTabsWorkspaces();
  renderSidebarFolders();

  const content = document.querySelector('.home-content');
  const doRender = () => {
    renderQuickAccess();
    renderWorkspaceBookmarks();
    renderNotesWidget();
    renderTasksWidget();
    renderNotesView();
  };
  if (content) {
    content.style.animation = 'wsContentOut .14s ease forwards';
    setTimeout(() => {
      doRender();
      content.style.animation = 'wsContentIn .2s cubic-bezier(.4,0,.2,1) both';
      content.addEventListener('animationend', () => { content.style.animation = ''; }, { once: true });
    }, 140);
  } else {
    doRender();
  }
}

// ===== WORKSPACES SIDEBAR =====
function renderSidebarWorkspaces() {
  const list = el('sidebarWorkspacesList');
  list.innerHTML = S.workspaces.map(ws => `
    <div class="workspace-sidebar-item ${ws.id===S.activeWsId?'active':''}" data-wsid="${ws.id}">
      <div class="ws-icon">${ws.icon}</div>
      <span style="flex:1">${escH(ws.name)}</span>
    </div>`).join('');
  list.querySelectorAll('.workspace-sidebar-item').forEach(item => {
    item.addEventListener('click', () => setActiveWorkspace(item.dataset.wsid));
  });
  _addDragDrop(list, '.workspace-sidebar-item');
  // Scroll overflow indicator (same as folders)
  const wrap = el('sidebarWorkspacesWrap');
  if (wrap) {
    const update = () => {
      const overflows = list.scrollHeight > list.clientHeight;
      const atBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 2;
      wrap.classList.toggle('no-overflow', !overflows || atBottom);
    };
    update();
    list.removeEventListener('scroll', list._wsScrollIndicator);
    list._wsScrollIndicator = update;
    list.addEventListener('scroll', update);
  }
}

function reorderWorkspaces(fromId, toId) {
  fromId = Number(fromId); toId = Number(toId);
  if (fromId === toId) return;
  const from = S.workspaces.findIndex(w => w.id === fromId);
  const to   = S.workspaces.findIndex(w => w.id === toId);
  if (from < 0 || to < 0) return;
  const [item] = S.workspaces.splice(from, 1);
  S.workspaces.splice(to, 0, item);
  save();
  renderSidebarWorkspaces();
  renderTabsWorkspaces();
  renderManageWorkspacesList();
}

function _addDragDrop(container, itemSelector) {
  let dragId = null;
  container.querySelectorAll(itemSelector).forEach(item => {
    item.setAttribute('draggable', 'true');
    item.addEventListener('dragstart', e => {
      dragId = item.dataset.wsid;
      item.classList.add('ws-dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    item.addEventListener('dragend', () => {
      dragId = null;
      container.querySelectorAll(itemSelector).forEach(el => el.classList.remove('ws-dragging', 'ws-drag-over'));
    });
    item.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      container.querySelectorAll(itemSelector).forEach(el => el.classList.remove('ws-drag-over'));
      if (item.dataset.wsid !== dragId) item.classList.add('ws-drag-over');
    });
    item.addEventListener('dragleave', () => item.classList.remove('ws-drag-over'));
    item.addEventListener('drop', e => {
      e.preventDefault();
      item.classList.remove('ws-drag-over');
      if (dragId && item.dataset.wsid !== dragId) reorderWorkspaces(dragId, item.dataset.wsid);
    });
  });
}

function renderTabsWorkspaces() {
  const tabs = el('workspaceTabs');
  tabs.innerHTML = S.workspaces.map(ws => `
    <div class="ws-tab ${ws.id===S.activeWsId?'active':''}" data-wsid="${ws.id}">
      <span class="ws-tab-icon">${ws.icon}</span>
      <span>${escH(ws.name)}</span>
    </div>`).join('');
  tabs.querySelectorAll('.ws-tab').forEach(tab => {
    tab.addEventListener('click', () => setActiveWorkspace(tab.dataset.wsid));
  });
  _addDragDrop(tabs, '.ws-tab');
}

function renderManageWorkspacesList() {
  const list = el('manageWsList');
  if (!list) return;
  list.innerHTML = S.workspaces.map(ws => `
    <div class="manage-ws-row" data-wsid="${ws.id}">
      <span class="manage-ws-drag" data-tip="Drag to reorder">⠿</span>
      <span class="manage-ws-icon">${ws.icon}</span>
      <span class="manage-ws-name">${escH(ws.name)}</span>
      <div class="manage-ws-actions">
        <button class="manage-ws-edit" data-wsid="${ws.id}" data-tip="Edit">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </button>
        <button class="manage-ws-delete" data-wsid="${ws.id}" data-tip="Delete">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          Delete
        </button>
      </div>
    </div>`).join('');
  list.querySelectorAll('.manage-ws-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal('manageWorkspacesModal');
      openEditWorkspaceModal(btn.dataset.wsid);
    });
  });
  list.querySelectorAll('.manage-ws-delete').forEach(btn => {
    btn.addEventListener('click', e => {
      closeModal('manageWorkspacesModal');
      const wsId = Number(btn.dataset.wsid);
      if (S.workspaces.length <= 1) { showToast('Cannot delete the last workspace!', 'error'); renderManageWorkspacesList(); openModal('manageWorkspacesModal'); return; }
      const ws = S.workspaces.find(w => w.id === wsId);
      if (!ws) return;
      confirm2(
        `Delete "${ws.name}"?`,
        'All notes, tasks and quick access in this workspace will be moved to trash.',
        () => {
          const data = S.wsData[wsId];
          if (data) {
            (data.notes||[]).forEach(n => S.trash.push({...n, _type:'note', _deletedAt:Date.now()}));
            (data.tasks||[]).forEach(t => S.trash.push({...t, _type:'task', _deletedAt:Date.now()}));
          }
          delete S.wsData[wsId];
          S.workspaces = S.workspaces.filter(w => w.id !== wsId);
          if (S.activeWsId === wsId) S.activeWsId = S.workspaces[0].id;
          save();
          renderAll();
          renderManageWorkspacesList();
          showToast('Workspace deleted', 'success');
        },
        () => { renderManageWorkspacesList(); openModal('manageWorkspacesModal'); }
      );
    });
  });
  _addDragDrop(list, '.manage-ws-row');
}

function openNewWorkspaceModal() {
  _editingWsId = null;
  el('workspaceModalTitle').textContent = 'New Workspace';
  el('workspaceName').value = '';
  el('selectedEmoji').value = '🏠';
  document.querySelectorAll('.emoji-picker span').forEach(s => s.classList.remove('selected'));
  document.querySelector('.emoji-picker span[data-emoji="🏠"]')?.classList.add('selected');
  el('saveWorkspaceBtn').textContent = 'Create';
  openModal('workspaceModal');
}

function openEditWorkspaceModal(wsId) {
  const ws = S.workspaces.find(w => w.id === Number(wsId));
  if (!ws) return;
  _editingWsId = ws.id;
  el('workspaceModalTitle').textContent = 'Edit Workspace';
  el('workspaceName').value = ws.name;
  el('selectedEmoji').value = ws.icon;
  document.querySelectorAll('.emoji-picker span').forEach(s => {
    s.classList.toggle('selected', s.dataset.emoji === ws.icon);
  });
  el('saveWorkspaceBtn').textContent = 'Save';
  openModal('workspaceModal');
}

function addWorkspace(name, icon) {
  const ws = { id: Date.now(), name, icon };
  S.workspaces.push(ws);
  S.wsData[ws.id] = { quickAccess:[], notes:[], tasks:[], importedBookmarks:[] };
  save();
  renderSidebarWorkspaces();
  renderTabsWorkspaces();
  showToast(`Workspace "${name}" created!`, 'success');
}

function deleteWorkspace(e, wsId) {
  e.stopPropagation();
  if (S.workspaces.length <= 1) { showToast('Cannot delete the last workspace!', 'error'); return; }
  const ws = S.workspaces.find(w => w.id === wsId);
  if (!ws) return;
  confirm2(`Delete workspace "${ws.name}"?`, 'All notes, tasks and quick access in this workspace will be moved to trash.', () => {
    // Move data to trash
    const data = S.wsData[wsId];
    if (data) {
      (data.notes||[]).forEach(n => S.trash.push({...n, _type:'note', _deletedAt:Date.now()}));
      (data.tasks||[]).forEach(t => S.trash.push({...t, _type:'task', _deletedAt:Date.now()}));
    }
    delete S.wsData[wsId];
    S.workspaces = S.workspaces.filter(w => w.id !== wsId);
    if (S.activeWsId === wsId) S.activeWsId = S.workspaces[0].id;
    save();
    renderAll();
    renderManageWorkspacesList();
    showToast(`Workspace deleted`, 'success');
  });
}

// ===== FIX #2 — BOOKMARKS (Real Chrome API) =====
async function loadBookmarks() {
  el('bookmarksLoading').style.display = 'flex';
  el('allBookmarksList').innerHTML = '';
  el('sidebarFoldersList').innerHTML = '<div style="color:var(--text-muted);font-size:11.5px;padding:4px 9px">Loading...</div>';
  const tree = await API.bookmarks();
  S.allBookmarks = parseBookmarkTree(tree);
  el('bookmarksLoading').style.display = 'none';
  S.bmFolderFilter = null;
  renderAllBookmarks(S.allBookmarks);
  renderSidebarFolders();
}

// Recursively flatten bookmark tree into array of folder objects
function parseBookmarkTree(nodes) {
  const folders = [];
  function walk(node) {
    if (!node.url && node.title && node.children) {
      // It's a folder
      const items = [];
      collectLeafs(node.children, items);
      if (items.length > 0 || node.id !== '0') {
        // Only add if has bookmarks
        if (items.length > 0) {
          folders.push({ id: node.id, title: node.title || 'Untitled', items });
        }
      }
      // Also recurse subfolders
      node.children.forEach(child => {
        if (!child.url) walk(child);
      });
    }
  }
  function collectLeafs(children, arr) {
    if (!children) return;
    children.forEach(c => {
      if (c.url) { arr.push(c); }
      // Don't recurse into sub-folders here, they become their own folders
    });
  }
  // Start from root children
  if (nodes && nodes[0] && nodes[0].children) {
    nodes[0].children.forEach(rootFolder => {
      walk(rootFolder);
    });
  }
  return folders;
}

// Sidebar bookmark folders list (click to open popup)
function renderSidebarFolders() {
  const list = document.getElementById('sidebarFoldersList');
  if (!list) return;
  const folderNames = allWsFolderNames();
  if (!folderNames.length) {
    list.innerHTML = '<div style="color:var(--text-muted);font-size:11.5px;padding:4px 9px">No folders</div>';
    return;
  }
  // Group bookmarks by folderName
  const groups = {};
  wsBookmarks().forEach(bm => {
    const key = bm.folderName || 'Other';
    if (!groups[key]) groups[key] = [];
    groups[key].push(bm);
  });
  list.innerHTML = folderNames.map(name => {
    const count = (groups[name] || []).length;
    return `
      <div class="sidebar-folder-item" data-folder="${escH(name)}">
        <span style="font-size:12px">📁</span>
        <span class="sidebar-folder-name" data-tip="${escH(name)}">${escH(name)}</span>
        <span class="sidebar-folder-count">${count}</span>
      </div>`;
  }).join('');
  list.querySelectorAll('.sidebar-folder-item[data-folder]').forEach(item => {
    const name = item.dataset.folder;
    item.addEventListener('click', () => openWsBmFolderModal(name, groups[name] || []));
  });

  // Scroll overflow indicator
  const wrap = list.parentElement;
  if (wrap && wrap.classList.contains('sidebar-folders-wrap')) {
    const update = () => {
      const overflows = list.scrollHeight > list.clientHeight;
      const atBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 2;
      wrap.classList.toggle('no-overflow', !overflows || atBottom);
    };
    update();
    list.removeEventListener('scroll', list._scrollIndicator);
    list._scrollIndicator = update;
    list.addEventListener('scroll', update);
  }
}


// FIX #6 — Folders click opens modal
function renderFolders(folders) {
  const grid = el('foldersGrid');
  if (!folders || !folders.length) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">📂</div><div class="empty-state-text">No bookmark folders found</div></div>';
    return;
  }
  const colors = ['#e11d48','#7c3aed','#059669','#f59e0b','#3b82f6','#ec4899'];
  grid.innerHTML = folders.slice(0,5).map((f,i) => {
    const color = colors[i % colors.length];
    const prev = f.items.slice(0,4);
    const extra = f.items.length - prev.length;
    const favs = prev.map(it => `<img class="favicon-img" src="${favSrc(it.url)}" alt="">`).join('');
    return `
      <div class="folder-card" data-fid="${escH(f.id)}">
        <div class="folder-card-top">
          <div class="folder-card-icon" style="background:${color}22">
            <span style="font-size:16px">📁</span>
          </div>
          <div class="folder-card-text">
            <div class="folder-card-name">${escH(f.title)}</div>
            <div class="folder-card-count">${f.items.length} bookmark${f.items.length!==1?'s':''}</div>
          </div>
        </div>
        <div class="folder-favicons">
          ${favs}
          ${extra>0?`<div class="favicon-more">+${extra}</div>`:''}
        </div>
      </div>`;
  }).join('');
  grid.querySelectorAll('.folder-card[data-fid]').forEach(card => {
    card.addEventListener('click', () => openFolderModal(card.dataset.fid));
  });
}

// FIX #6 — Folder modal actually shows bookmarks and they're clickable
function openFolderModal(folderId) {
  const folder = S.allBookmarks.find(f => f.id === folderId);
  if (!folder) return;
  _openFolderId = folderId;
  el('folderModalIcon').textContent = '📁';
  el('folderModalTitle').textContent = folder.title;
  el('folderModalCount').textContent = `${folder.items.length} bookmarks`;

  // Header action buttons (rename / delete folder)
  const actionsEl = el('folderModalActions');
  if (actionsEl) {
    actionsEl.innerHTML = IS_CHROME ? `
      <button class="icon-btn" id="_fmRename" data-tip="Rename folder" style="width:26px;height:26px">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </button>
      <button class="icon-btn" id="_fmDelete" data-tip="Delete folder" style="width:26px;height:26px;color:var(--red)">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
      </button>` : '';
    if (IS_CHROME) {
      actionsEl.querySelector('#_fmRename')?.addEventListener('click', () => openEditFolderModal(folderId));
      actionsEl.querySelector('#_fmDelete')?.addEventListener('click', () => deleteChromeFolder(folderId));
    }
  }

  const editIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
  const delIcon  = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>`;

  const itemsEl = el('folderModalItems');
  itemsEl.innerHTML = folder.items.map(item => `
    <div class="folder-modal-row">
      <a href="${escH(item.url)}" class="folder-modal-item" target="_blank" style="flex:1">
        <img src="${favSrc(item.url)}" alt="">
        <div class="folder-modal-item-info">
          <span class="folder-modal-item-title">${escH(item.title||item.url)}</span>
          <span class="folder-modal-item-url">${escH(getDomain(item.url))}</span>
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;opacity:.4"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </a>
      ${IS_CHROME ? `
        <button class="folder-modal-action-btn" data-bmid="${escH(item.id)}" data-action="edit" data-tip="Edit bookmark">${editIcon}</button>
        <button class="folder-modal-action-btn folder-modal-del-btn" data-bmid="${escH(item.id)}" data-action="del" data-tip="Delete bookmark">${delIcon}</button>
      ` : ''}
    </div>`).join('') +
    (IS_CHROME ? `<button class="bm-add-item-btn" id="_fmAddBm" style="padding:9px 12px;border-top:1px solid var(--border);margin-top:4px;width:100%">+ Add bookmark to this folder</button>` : '');

  // Close modal on link click
  itemsEl.querySelectorAll('.folder-modal-item').forEach(a => {
    a.addEventListener('click', () => closeModal('folderModal'));
  });
  if (IS_CHROME) {
    itemsEl.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', () => openEditBookmarkModal(btn.dataset.bmid));
    });
    itemsEl.querySelectorAll('[data-action="del"]').forEach(btn => {
      btn.addEventListener('click', () => deleteChromeBm(btn.dataset.bmid));
    });
    itemsEl.querySelector('#_fmAddBm')?.addEventListener('click', () => openAddBookmarkModal(folderId));
  }
  openModal('folderModal');
}

function renderBmToolbar(folderNames) {
  const filtersEl = el('bmFolderFilters');
  const sortEl = el('bmSortSelect');
  if (sortEl) sortEl.value = S.bmSort;

  if (!filtersEl) return;
  // "All" chip + one chip per folder
  const chips = [{ label: 'All', value: null }, ...folderNames.map(n => ({ label: n, value: n }))];
  filtersEl.innerHTML = chips.map(c =>
    `<button class="bm-folder-chip${S.bmFolderFilter === c.value ? ' active' : ''}" data-folder="${c.value === null ? '' : escH(c.value)}">${escH(c.label)}</button>`
  ).join('');
  filtersEl.querySelectorAll('.bm-folder-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      S.bmFolderFilter = btn.dataset.folder === '' ? null : btn.dataset.folder;
      // re-render whichever view is active
      if (S.allBookmarks && S.allBookmarks.length) renderAllBookmarks(S.allBookmarks);
      else renderBmForActiveWorkspace();
    });
  });
}

function renderAllBookmarks(folders) {
  const list = el('allBookmarksList');
  if (!folders || !folders.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔖</div><div class="empty-state-text">No bookmarks found</div></div>';
    return;
  }

  // Build toolbar
  renderBmToolbar(folders.map(f => f.title));

  // Apply folder filter
  let visible = S.bmFolderFilter ? folders.filter(f => f.title === S.bmFolderFilter) : folders;

  // Sort items within each folder
  visible = visible.map(f => {
    let items = [...f.items];
    if (S.bmSort === 'az') items.sort((a,b) => (a.title||'').localeCompare(b.title||''));
    else if (S.bmSort === 'za') items.sort((a,b) => (b.title||'').localeCompare(a.title||''));
    else if (S.bmSort === 'newest') items.sort((a,b) => (b.dateAdded||0) - (a.dateAdded||0));
    else if (S.bmSort === 'oldest') items.sort((a,b) => (a.dateAdded||0) - (b.dateAdded||0));
    // 'most' — no reliable visit count from Chrome bookmarks API, keep as-is
    return {...f, items};
  });

  const editIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
  const delIcon  = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>`;

  list.innerHTML = visible.map(f => `
    <div class="bm-folder${S.bmFolderFilter ? ' open' : ''}" id="bm-${escH(f.id)}">
      <div class="bm-folder-header" data-fid="${escH(f.id)}">
        <span class="bm-folder-chevron">▶</span>
        <div class="bm-folder-icon-wrap">📁</div>
        <span class="bm-folder-name">${escH(f.title)}</span>
        ${IS_CHROME ? `
          <button class="bm-action-btn" data-action="edit-folder" data-fid="${escH(f.id)}" data-tip="Rename">${editIcon}</button>
          <button class="bm-action-btn bm-del-btn" data-action="delete-folder" data-fid="${escH(f.id)}" data-tip="Delete">${delIcon}</button>
        ` : ''}
        <span class="bm-folder-count">${f.items.length}</span>
      </div>
      <div class="bm-items">
        <div class="bm-items-inner">
          ${f.items.map(it=>`
            <div class="bm-item-row">
              <a href="${escH(it.url)}" class="bm-item" target="_self">
                <div class="bm-favicon-wrap"><img src="${favSrc(it.url)}" onerror="this.style.display='none'" alt=""></div>
                <div class="bm-item-text">
                  <span class="bm-item-title">${escH(it.title||it.url)}</span>
                  <span class="bm-item-url">${escH(getDomain(it.url))}</span>
                </div>
              </a>
              ${IS_CHROME ? `
                <button class="bm-action-btn" data-action="edit-bm" data-bmid="${escH(it.id)}" data-tip="Edit">${editIcon}</button>
                <button class="bm-action-btn bm-del-btn" data-action="delete-bm" data-bmid="${escH(it.id)}" data-tip="Delete">${delIcon}</button>
              ` : ''}
            </div>`).join('')}
          ${IS_CHROME ? `<button class="bm-add-item-btn" data-action="add-bm" data-fid="${escH(f.id)}">+ Add bookmark</button>` : ''}
        </div>
      </div>
    </div>`).join('');

  list.querySelectorAll('.bm-folder-header[data-fid]').forEach(h => {
    h.addEventListener('click', e => { if (!e.target.closest('[data-action]')) toggleBmFolder(h.dataset.fid); });
  });
  list.querySelectorAll('[data-action="edit-folder"]').forEach(b => {
    b.addEventListener('click', e => { e.stopPropagation(); openEditFolderModal(b.dataset.fid); });
  });
  list.querySelectorAll('[data-action="delete-folder"]').forEach(b => {
    b.addEventListener('click', e => { e.stopPropagation(); deleteChromeFolder(b.dataset.fid); });
  });
  list.querySelectorAll('[data-action="edit-bm"]').forEach(b => {
    b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); openEditBookmarkModal(b.dataset.bmid); });
  });
  list.querySelectorAll('[data-action="delete-bm"]').forEach(b => {
    b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); deleteChromeBm(b.dataset.bmid); });
  });
  list.querySelectorAll('[data-action="add-bm"]').forEach(b => {
    b.addEventListener('click', () => openAddBookmarkModal(b.dataset.fid));
  });
}

function toggleBmFolder(id) {
  // Works for Chrome bookmark folders (id="bm-{id}") and ws folders (data-folder header's parent)
  const byId = el('bm-'+id);
  if (byId) { byId.classList.toggle('open'); return; }
  // Workspace folder: find header by data-folder, toggle parent .bm-folder
  const header = document.querySelector(`.bm-ws-folder-header[data-folder="${CSS.escape(id)}"]`);
  header?.closest('.bm-folder')?.classList.toggle('open');
}

// ===== BOOKMARK CRUD =====
function populateFolderSelect(selectId, selectedId) {
  const sel = el(selectId);
  if (!sel) return;
  sel.innerHTML = S.allBookmarks.map(f =>
    `<option value="${escH(f.id)}"${f.id === selectedId ? ' selected' : ''}>${escH(f.title)}</option>`
  ).join('');
}

function openAddBookmarkModal(parentId) {
  if (!IS_CHROME) { showToast('Bookmark editing requires Chrome', 'error'); return; }
  _bmEditId = null;
  _bmEditParentId = parentId || (S.allBookmarks[0] && S.allBookmarks[0].id) || '1';
  el('bookmarkEditModalTitle').textContent = 'Add Bookmark';
  el('bmEditName').value = '';
  el('bmEditUrl').value = '';
  el('bmEditDeleteBtn').style.display = 'none';
  populateFolderSelect('bmEditFolder', _bmEditParentId);
  openModal('bookmarkEditModal');
}

function openEditBookmarkModal(bmId) {
  if (!IS_CHROME) { showToast('Bookmark editing requires Chrome', 'error'); return; }
  let item = null, parentId = null;
  for (const f of S.allBookmarks) {
    const found = f.items.find(i => i.id === bmId);
    if (found) { item = found; parentId = f.id; break; }
  }
  if (!item) return;
  _bmEditId = bmId;
  _bmEditParentId = parentId;
  el('bookmarkEditModalTitle').textContent = 'Edit Bookmark';
  el('bmEditName').value = item.title || '';
  el('bmEditUrl').value = item.url || '';
  el('bmEditDeleteBtn').style.display = 'block';
  populateFolderSelect('bmEditFolder', parentId);
  openModal('bookmarkEditModal');
}

async function saveBookmarkEdit() {
  const title = el('bmEditName').value.trim();
  const url   = el('bmEditUrl').value.trim();
  const newParentId = el('bmEditFolder').value;
  if (!title) { showToast('Enter a title', 'error'); return; }
  if (!url)   { showToast('Enter a URL', 'error'); return; }
  const fullUrl = url.startsWith('http') ? url : 'https://' + url;
  if (_bmEditId) {
    await API.updateBookmark(_bmEditId, { title, url: fullUrl });
    if (newParentId && newParentId !== _bmEditParentId) {
      await API.moveBookmark(_bmEditId, { parentId: newParentId });
    }
    showToast('Bookmark updated!', 'success');
  } else {
    const node = await API.createBookmark({ parentId: newParentId || '1', title, url: fullUrl });
    if (!node) { showToast('Failed to create bookmark', 'error'); return; }
    showToast('Bookmark added!', 'success');
  }
  closeModal('bookmarkEditModal');
  await loadBookmarks();
}

function deleteChromeBm(bmId) {
  if (!IS_CHROME) { showToast('Requires Chrome', 'error'); return; }
  confirm2('Delete Bookmark?', 'This will permanently remove it from Chrome.', async () => {
    await API.removeBookmark(bmId);
    closeModal('bookmarkEditModal');
    showToast('Bookmark deleted', 'success');
    await loadBookmarks();
    if (_openFolderId) openFolderModal(_openFolderId);
  });
}

// ===== FOLDER CRUD =====
function openAddFolderModal(parentId) {
  if (!IS_CHROME) { showToast('Folder creation requires Chrome', 'error'); return; }
  _folderEditId = null;
  _folderParentId = parentId || '1';
  el('folderEditModalTitle').textContent = 'New Folder';
  el('folderEditName').value = '';
  el('folderEditSaveBtn').textContent = 'Create';
  openModal('folderEditModal');
}

function openEditFolderModal(folderId) {
  if (!IS_CHROME) { showToast('Folder editing requires Chrome', 'error'); return; }
  const folder = S.allBookmarks.find(f => f.id === folderId);
  if (!folder) return;
  _folderEditId = folderId;
  el('folderEditModalTitle').textContent = 'Rename Folder';
  el('folderEditName').value = folder.title || '';
  el('folderEditSaveBtn').textContent = 'Save';
  openModal('folderEditModal');
}

async function saveFolderEdit() {
  const name = el('folderEditName').value.trim();
  if (!name) { showToast('Enter a folder name', 'error'); return; }
  if (_folderEditId) {
    await API.updateBookmark(_folderEditId, { title: name });
    showToast('Folder renamed!', 'success');
  } else {
    const node = await API.createBookmark({ parentId: _folderParentId, title: name });
    if (!node) { showToast('Failed to create folder', 'error'); return; }
    showToast('Folder created!', 'success');
  }
  closeModal('folderEditModal');
  await loadBookmarks();
}

function deleteChromeFolder(folderId) {
  if (!IS_CHROME) { showToast('Requires Chrome', 'error'); return; }
  const folder = S.allBookmarks.find(f => f.id === folderId);
  const title = folder ? folder.title : 'this folder';
  confirm2(`Delete "${title}"?`, 'All bookmarks inside will be permanently deleted from Chrome.', async () => {
    await API.removeBookmarkTree(folderId);
    closeModal('folderModal');
    showToast('Folder deleted', 'success');
    await loadBookmarks();
  });
}

// ===== WORKSPACE BOOKMARKS =====
function renderWorkspaceBookmarks() {
  const section = el('wsBmSection');
  if (!section) return;
  if (!IS_CHROME) { section.style.display = 'none'; return; }
  section.style.display = '';
  const grid = el('wsBmGrid');
  // Group bookmarks by folderName first
  const groups = {};
  wsBookmarks().forEach(bm => {
    const key = bm.folderName || 'Other';
    if (!groups[key]) groups[key] = [];
    groups[key].push(bm);
  });
  // Only show folders that have at least one bookmark
  const folderNames = allWsFolderNames().filter(f => (groups[f] || []).length > 0);
  if (!folderNames.length) {
    grid.innerHTML = `<button class="qa-add-btn ws-bm-add-card" id="_wsBmAddCard">
      <div class="qa-add-icon">+</div>
      <span style="font-size:11px;color:var(--text-muted)">Add</span>
    </button>`;
    grid.querySelector('#_wsBmAddCard')?.addEventListener('click', openWsBmChooser);
    return;
  }
  const colors = ['#e11d48','#7c3aed','#059669','#f59e0b','#3b82f6','#ec4899','#0891b2','#d97706'];
  grid.innerHTML = folderNames.map((folder, i) => {
    const bms = groups[folder] || [];
    const color = colors[i % colors.length];
    const prev = bms.slice(0, 4);
    const extra = bms.length - prev.length;
    const favs = prev.map(bm => `<img class="favicon-img" src="${favSrc(bm.url)}" onerror="this.style.display='none'" alt="">`).join('');
    return `
      <div class="folder-card ws-bm-folder-card" data-folder="${escH(folder)}" draggable="true">
        <button class="ws-folder-menu-btn" data-folder="${escH(folder)}" data-tip="Options">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
        </button>
        <div class="folder-card-top">
          <div class="folder-card-icon" style="background:${color}22">
            <span style="font-size:16px">📁</span>
          </div>
          <div class="folder-card-text">
            <div class="folder-card-name">${escH(folder)}</div>
            <div class="folder-card-count">${bms.length} bookmark${bms.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
        <div class="folder-favicons">
          ${favs}
          ${extra > 0 ? `<div class="favicon-more">+${extra}</div>` : ''}
        </div>
      </div>`;
  }).join('') + `<button class="qa-add-btn ws-bm-add-card" id="_wsBmAddCard">
    <div class="qa-add-icon">+</div>
    <span style="font-size:11px;color:var(--text-muted)">Add</span>
  </button>`;
  // Click card body → open folder modal; three-dot → folder menu
  grid.querySelectorAll('.ws-bm-folder-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.ws-folder-menu-btn')) return;
      const fn = card.dataset.folder;
      openWsBmFolderModal(fn, groups[fn] || []);
    });
  });
  grid.querySelectorAll('.ws-folder-menu-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openFolderCardCtxMenu(btn, btn.dataset.folder, groups[btn.dataset.folder] || []);
    });
  });
  grid.querySelector('#_wsBmAddCard')?.addEventListener('click', openWsBmChooser);

  initDragReorder(grid, '.ws-bm-folder-card', () => {
    const newOrder = [...grid.querySelectorAll('.ws-bm-folder-card')].map(el => el.dataset.folder);
    const d = wsData();
    const existingMap = new Map((d.folders || []).map(f => [f.name, f]));
    // Persist new order; convert any bookmark-derived folders to explicit entries
    d.folders = newOrder.map(name => existingMap.get(name) || { name });
    save();
  });

  // Collapse to 2 rows if there are many folders
  let viewMoreBtn = el('_wsBmViewMore');
  if (viewMoreBtn) viewMoreBtn.remove();

  // Calculate how many items fit in 2 rows based on current grid width
  const colWidth = 200 + 12; // minmax + gap
  const gridWidth = grid.offsetWidth || section.offsetWidth || (window.innerWidth - 260);
  const cols = Math.max(2, Math.floor((gridWidth + 12) / colWidth));
  const twoRowsMax = cols * 2;
  const totalCards = folderNames.length + 1; // +1 for Add card

  const addCard = grid.querySelector('#_wsBmAddCard');

  function placeAddCardCollapsed() {
    if (!addCard) return;
    const allCards = [...grid.querySelectorAll('.folder-card')];
    // Insert add card at slot twoRowsMax-1 (last slot of 2nd row)
    const insertBefore = allCards[twoRowsMax - 1];
    if (insertBefore) grid.insertBefore(addCard, insertBefore);
  }

  function placeAddCardExpanded() {
    if (addCard) grid.appendChild(addCard);
  }

  if (totalCards > twoRowsMax) {
    // Place add card at last slot of 2nd row, hiding one extra folder card
    placeAddCardCollapsed();
    // Measure actual card height after render and set max-height for 2 rows
    requestAnimationFrame(() => {
      const firstCard = grid.querySelector('.folder-card');
      if (firstCard) {
        const cardH = firstCard.offsetHeight;
        grid.style.maxHeight = (cardH * 2 + 12 + 8) + 'px'; // +8 for padding
      }
    });
    grid.classList.add('ws-bm-grid-collapsed');
    viewMoreBtn = document.createElement('button');
    viewMoreBtn.id = '_wsBmViewMore';
    viewMoreBtn.className = 'ws-bm-view-more-btn';
    // hidden = all folders not visible + the one displaced by add card
    const hiddenCount = folderNames.length - (twoRowsMax - 1);
    viewMoreBtn.innerHTML = `View ${hiddenCount} more <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6,9 12,15 18,9"/></svg>`;
    viewMoreBtn.addEventListener('click', () => {
      const collapsed = grid.classList.toggle('ws-bm-grid-collapsed');
      if (collapsed) {
        placeAddCardCollapsed();
        const firstCard = grid.querySelector('.folder-card');
        if (firstCard) grid.style.maxHeight = (firstCard.offsetHeight * 2 + 12 + 8) + 'px';
      } else {
        placeAddCardExpanded();
        // scrollHeight returns full content height even while max-height is constraining it
        grid.style.maxHeight = grid.scrollHeight + 'px';
      }
      viewMoreBtn.innerHTML = collapsed
        ? `View ${hiddenCount} more <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6,9 12,15 18,9"/></svg>`
        : `Show less <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18,15 12,9 6,15"/></svg>`;
    });
    section.appendChild(viewMoreBtn);
  } else {
    grid.classList.remove('ws-bm-grid-collapsed');
  }
}

// ===== BOOKMARK CONTEXT MENU =====
let _ctxMenu = null;
let _ctxSub  = null;
let _ctxCurrentFolder = null;

function _getOrCreateCtxMenu() {
  if (!_ctxMenu) {
    _ctxMenu = document.createElement('div');
    _ctxMenu.className = 'bm-ctx-menu';
    document.body.appendChild(_ctxMenu);
    _ctxSub = document.createElement('div');
    _ctxSub.className = 'bm-ctx-sub';
    document.body.appendChild(_ctxSub);
    document.addEventListener('click', e => {
      if (!_ctxMenu.contains(e.target) && !_ctxSub.contains(e.target)) closeCtxMenu();
    });
  }
  return _ctxMenu;
}

function closeCtxMenu() {
  _ctxMenu?.classList.remove('open');
  _ctxSub?.classList.remove('open');
}

function openFolderCardCtxMenu(btn, folderName, items) {
  const menu = _getOrCreateCtxMenu();
  const rect = btn.getBoundingClientRect();
  menu.style.top  = (rect.bottom + 4) + 'px';
  menu.style.left = Math.min(rect.left, window.innerWidth - 210) + 'px';
  const otherWorkspaces = S.workspaces.filter(w => w.id !== S.activeWsId);
  menu.innerHTML = `
    <div class="bm-ctx-item" data-action="add">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Add Bookmark
    </div>
    <div class="bm-ctx-item" data-action="rename">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      Rename
    </div>
    ${otherWorkspaces.length ? `<div class="bm-ctx-item" data-action="move-ws">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
      Move folder to workspace
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-left:auto"><polyline points="9,6 15,12 9,18"/></svg>
    </div>` : ''}
    <div class="bm-ctx-sep"></div>
    <div class="bm-ctx-item danger" data-action="delete">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
      Delete folder
    </div>`;
  menu.querySelector('[data-action="add"]').addEventListener('click', () => {
    closeCtxMenu(); openWsBookmarkEditModal(folderName, null);
  });
  menu.querySelector('[data-action="rename"]').addEventListener('click', () => {
    closeCtxMenu(); openWsFolderEditModal(folderName);
  });
  menu.querySelector('[data-action="move-ws"]')?.addEventListener('click', e => {
    e.stopPropagation();
    const itemRect = e.currentTarget.getBoundingClientRect();
    _ctxSub.innerHTML = otherWorkspaces.map((ws, i) =>
      `${i > 0 ? '<div class="bm-ctx-sep"></div>' : ''}
      <div class="bm-ctx-ws-header bm-ctx-ws-direct" data-wsid="${ws.id}" style="cursor:pointer">
        <span class="bm-ctx-ws-icon">${ws.icon}</span>
        <span style="flex:1">${escH(ws.name)}</span>
      </div>`
    ).join('');
    _ctxSub.classList.add('open');
    requestAnimationFrame(() => {
      const subW = _ctxSub.offsetWidth, subH = _ctxSub.offsetHeight;
      const spaceRight = window.innerWidth - itemRect.right - 8;
      const left = spaceRight >= subW ? itemRect.right + 4 : itemRect.left - subW - 4;
      _ctxSub.style.left = Math.max(4, left) + 'px';
      _ctxSub.style.top  = Math.min(itemRect.top, window.innerHeight - subH - 8) + 'px';
    });
    _ctxSub.querySelectorAll('.bm-ctx-ws-direct').forEach(opt => {
      opt.addEventListener('click', async () => {
        const targetId = Number(opt.dataset.wsid);
        const src = wsData();
        const folderItems = (src.importedBookmarks || []).filter(b => b.folderName === folderName);
        // Remove from current workspace
        src.importedBookmarks = (src.importedBookmarks || []).filter(b => b.folderName !== folderName);
        // Also remove explicit folder entry
        if (src.folders) src.folders = src.folders.filter(f => f.name !== folderName);
        // Add to target workspace
        const tgt = S.wsData[targetId] || (S.wsData[targetId] = { quickAccess:[], notes:[], tasks:[], importedBookmarks:[], folders:[] });
        if (!tgt.importedBookmarks) tgt.importedBookmarks = [];
        if (!tgt.folders) tgt.folders = [];
        folderItems.forEach(b => tgt.importedBookmarks.push({ ...b }));
        if (!tgt.folders.find(f => f.name === folderName)) tgt.folders.push({ name: folderName });
        await save();
        closeCtxMenu();
        renderWorkspaceBookmarks(); renderSidebarFolders();
        const ws = S.workspaces.find(w => w.id === targetId);
        showToast(`Folder "${folderName}" moved to ${ws?.name || 'workspace'}`, 'success');
      });
    });
  });
  menu.querySelector('[data-action="delete"]').addEventListener('click', () => {
    closeCtxMenu();
    const count = items.length;
    confirm2(
      `Delete "${folderName}"?`,
      count ? `This will also delete ${count} bookmark${count !== 1 ? 's' : ''} inside.` : 'The folder is empty.',
      () => removeWsFolder(folderName)
    );
  });
  menu.classList.add('open');
  _ctxSub.classList.remove('open');
}

function openBmCtxMenu(btn, bm, currentFolder) {
  const menu = _getOrCreateCtxMenu();
  _ctxCurrentFolder = currentFolder;

  // Position below/above the button
  const rect = btn.getBoundingClientRect();
  menu.style.top  = (rect.bottom + 4) + 'px';
  menu.style.left = Math.min(rect.left, window.innerWidth - 210) + 'px';

  const otherFolders = allWsFolderNames().filter(f => f !== currentFolder);
  const otherWorkspaces = S.workspaces.filter(w => w.id !== S.activeWsId);
  const isPinned = wsQA().some(q => q.url === bm.url);

  menu.innerHTML = `
    <div class="bm-ctx-item" data-action="edit">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      Edit
    </div>
    <div class="bm-ctx-item" data-action="pin">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      ${isPinned ? 'Unpin from Quick Access' : 'Pin to Quick Access'}
    </div>
    ${otherFolders.length ? `<div class="bm-ctx-item" data-action="move-folder">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
      Move to folder
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-left:auto"><polyline points="9,6 15,12 9,18"/></svg>
    </div>` : ''}
    ${otherWorkspaces.length ? `<div class="bm-ctx-item" data-action="move-ws">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
      Move to workspace
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-left:auto"><polyline points="9,6 15,12 9,18"/></svg>
    </div>` : ''}
    <div class="bm-ctx-sep"></div>
    <div class="bm-ctx-item danger" data-action="delete">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
      Delete
    </div>`;

  menu.querySelector('[data-action="edit"]')?.addEventListener('click', () => {
    closeCtxMenu(); closeModal('folderModal');
    openWsBookmarkEditModal(currentFolder, bm.id);
  });

  menu.querySelector('[data-action="pin"]')?.addEventListener('click', () => {
    closeCtxMenu();
    if (isPinned) {
      const d = wsData();
      d.quickAccess = d.quickAccess.filter(q => q.url !== bm.url);
      save(); renderQuickAccess();
      showToast('Unpinned from Quick Access', 'success');
    } else {
      addQA(bm.title || getDomain(bm.url), bm.url);
    }
  });

  menu.querySelector('[data-action="move-folder"]')?.addEventListener('click', e => {
    e.stopPropagation();
    const itemRect = e.currentTarget.getBoundingClientRect();
    _ctxSub.innerHTML = otherFolders.map(f =>
      `<div class="bm-ctx-sub-item" data-folder="${escH(f)}">📁 ${escH(f)}</div>`
    ).join('');
    _ctxSub.classList.add('open');
    requestAnimationFrame(() => {
      const subW = _ctxSub.offsetWidth, subH = _ctxSub.offsetHeight;
      const spaceRight = window.innerWidth - itemRect.right - 8;
      const left = spaceRight >= subW ? itemRect.right + 4 : itemRect.left - subW - 4;
      _ctxSub.style.left = Math.max(4, left) + 'px';
      _ctxSub.style.top  = Math.min(itemRect.top, window.innerHeight - subH - 8) + 'px';
    });
    _ctxSub.querySelectorAll('.bm-ctx-sub-item').forEach(opt => {
      opt.addEventListener('click', async () => {
        const d = wsData();
        d.importedBookmarks = (d.importedBookmarks || []).map(b =>
          b.id === bm.id ? { ...b, folderName: opt.dataset.folder } : b
        );
        await save();
        closeCtxMenu(); closeModal('folderModal');
        renderWorkspaceBookmarks(); renderSidebarFolders();
        showToast(`Moved to "${opt.dataset.folder}"`, 'success');
      });
    });
  });

  menu.querySelector('[data-action="move-ws"]')?.addEventListener('click', e => {
    e.stopPropagation();
    const itemRect = e.currentTarget.getBoundingClientRect();
    _ctxSub.innerHTML = otherWorkspaces.map((ws, i) => {
      const wsFolders = [
        ...(S.wsData[ws.id]?.folders || []).map(f => f.name),
        ...[...new Set((S.wsData[ws.id]?.importedBookmarks || []).map(b => b.folderName).filter(Boolean))],
      ].filter((v, idx, a) => v && a.indexOf(v) === idx);
      const folderItems = wsFolders.map(f =>
        `<div class="bm-ctx-ws-folder" data-wsid="${ws.id}" data-folder="${escH(f)}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
          ${escH(f)}
        </div>`
      ).join('');
      return `${i > 0 ? '<div class="bm-ctx-sep"></div>' : ''}
<div class="bm-ctx-ws-header" data-ws-toggle="${ws.id}">
  <span class="bm-ctx-ws-icon">${ws.icon}</span>
  <span style="flex:1">${escH(ws.name)}</span>
  <svg class="bm-ctx-ws-chevron" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6,9 12,15 18,9"/></svg>
</div>
<div class="bm-ctx-ws-body" data-ws-body="${ws.id}" style="display:none">
${folderItems}
<div class="bm-ctx-ws-folder bm-ctx-ws-nofolder" data-wsid="${ws.id}" data-folder="">
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
  No folder
</div>
</div>`;
    }).join('');
    // Auto-expand first workspace
    const firstBody = _ctxSub.querySelector('[data-ws-body]');
    const firstHeader = _ctxSub.querySelector('[data-ws-toggle]');
    if (firstBody) { firstBody.style.display = ''; firstHeader?.querySelector('.bm-ctx-ws-chevron')?.classList.add('open'); }
    // Toggle collapse on header click
    _ctxSub.querySelectorAll('[data-ws-toggle]').forEach(hdr => {
      hdr.addEventListener('click', e => {
        e.stopPropagation();
        const body = _ctxSub.querySelector(`[data-ws-body="${hdr.dataset.wsToggle}"]`);
        if (!body) return;
        const open = body.style.display !== 'none';
        body.style.display = open ? 'none' : '';
        hdr.querySelector('.bm-ctx-ws-chevron')?.classList.toggle('open', !open);
      });
    });
    _ctxSub.classList.add('open');
    requestAnimationFrame(() => {
      const subW = _ctxSub.offsetWidth;
      const subH = _ctxSub.offsetHeight;
      const spaceRight = window.innerWidth - itemRect.right - 8;
      const left = spaceRight >= subW ? itemRect.right + 4 : itemRect.left - subW - 4;
      const maxTop = window.innerHeight - subH - 8;
      _ctxSub.style.left = Math.max(4, left) + 'px';
      _ctxSub.style.top  = Math.min(itemRect.top, maxTop) + 'px';
    });
    _ctxSub.querySelectorAll('.bm-ctx-ws-folder').forEach(opt => {
      opt.addEventListener('click', async () => {
        const targetId = Number(opt.dataset.wsid);
        const targetFolder = opt.dataset.folder;
        const src = wsData();
        src.importedBookmarks = (src.importedBookmarks || []).filter(b => b.id !== bm.id);
        const tgt = S.wsData[targetId] || (S.wsData[targetId] = { quickAccess:[], notes:[], tasks:[], importedBookmarks:[], folders:[] });
        if (!tgt.importedBookmarks) tgt.importedBookmarks = [];
        tgt.importedBookmarks.push({ ...bm, folderName: targetFolder || undefined });
        await save();
        closeCtxMenu(); closeModal('folderModal');
        renderWorkspaceBookmarks(); renderSidebarFolders();
        const ws = S.workspaces.find(w => w.id === targetId);
        const dest = targetFolder ? `"${targetFolder}" in ${ws?.name}` : ws?.name || 'workspace';
        showToast(`Moved to ${dest}`, 'success');
      });
    });
  });

  menu.querySelector('[data-action="delete"]')?.addEventListener('click', () => {
    closeCtxMenu();
    confirm2('Delete bookmark?', `"${bm.title || bm.url}" will be permanently removed.`, async () => {
      await removeWsBm(bm.id);
      closeModal('folderModal');
      showToast('Bookmark deleted', 'success');
    });
  });

  menu.classList.add('open');
  _ctxSub.classList.remove('open');
}

function openWsBmFolderModal(folderName, items) {
  closeCtxMenu();
  el('folderModalIcon').textContent = '📁';
  el('folderModalTitle').textContent = folderName;
  el('folderModalCount').textContent = items.length ? `${items.length} bookmark${items.length !== 1 ? 's' : ''}` : 'Empty';

  const actionsEl = el('folderModalActions');
  actionsEl.innerHTML = `
    <button class="btn-primary" id="_wsFmAddBm" style="font-size:12px;padding:5px 10px">+ Add Bookmark</button>
    <button class="icon-btn" id="_wsFmRename" data-tip="Rename folder" style="width:26px;height:26px">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
    </button>
    <button class="icon-btn" id="_wsFmDelete" data-tip="Delete folder" style="width:26px;height:26px;color:var(--red)">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
    </button>`;

  actionsEl.querySelector('#_wsFmAddBm').addEventListener('click', () => {
    closeModal('folderModal');
    openWsBookmarkEditModal(folderName, null);
  });
  actionsEl.querySelector('#_wsFmRename').addEventListener('click', () => {
    closeModal('folderModal');
    openWsFolderEditModal(folderName);
  });
  actionsEl.querySelector('#_wsFmDelete').addEventListener('click', () => {
    const count = items.length;
    confirm2(
      `Delete "${folderName}"?`,
      count ? `This will also delete ${count} bookmark${count !== 1 ? 's' : ''} inside.` : 'The folder is empty.',
      () => removeWsFolder(folderName)
    );
  });

  const itemsEl = el('folderModalItems');
  if (!items.length) {
    itemsEl.style.display = 'block';
    itemsEl.innerHTML = '<div style="color:var(--text-muted);font-size:13px;padding:20px 0;text-align:center">No bookmarks yet. Click "+ Add Bookmark" above.</div>';
  } else {
    itemsEl.style.display = '';
    itemsEl.innerHTML = items.map(bm => {
      const letter = (bm.title || getDomain(bm.url) || '?')[0].toUpperCase();
      return `
      <a class="bm-card" href="${escH(bm.url)}" target="_self" data-bmid="${escH(bm.id)}" draggable="true">
        <button class="bm-card-menu" data-bmid="${escH(bm.id)}" data-tip="Options">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
        </button>
        <div class="bm-card-icon" data-letter="${escH(letter)}">
          <img src="${favSrc(bm.url)}" onerror="this.style.display='none';this.parentNode.classList.add('bm-icon-fallback')" alt="">
        </div>
        <div class="bm-card-name">${escH(bm.title || getDomain(bm.url))}</div>
        <div class="bm-card-domain">${escH(getDomain(bm.url))}</div>
      </a>`;
    }).join('');
    itemsEl.querySelectorAll('.bm-card-menu').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const bm = items.find(b => b.id === btn.dataset.bmid);
        if (bm) openBmCtxMenu(btn, bm, folderName);
      });
    });
    initDragReorder(itemsEl, '.bm-card', () => {
      const newIds = [...itemsEl.querySelectorAll('.bm-card')].map(el => el.dataset.bmid);
      const d = wsData();
      // Replace this folder's bookmarks in-place within the flat array
      const folderIndices = d.importedBookmarks.reduce((acc, b, i) => {
        if ((b.folderName || 'Other') === folderName) acc.push(i);
        return acc;
      }, []);
      const reordered = newIds.map(id => d.importedBookmarks.find(b => b.id === id)).filter(Boolean);
      folderIndices.forEach((origIdx, i) => { if (reordered[i]) d.importedBookmarks[origIdx] = reordered[i]; });
      save();
    });
  }
  openModal('folderModal');
}

async function removeWsBm(id) {
  const d = wsData();
  d.importedBookmarks = (d.importedBookmarks || []).filter(b => b.id !== id);
  await save();
  renderWorkspaceBookmarks();
}

function openWsBmChooser() {
  openModal('wsBmChooserModal');
}

function openWsFolderEditModal(existingName) {
  _wsFolderEditName = existingName || null;
  const isEdit = !!existingName;
  el('wsFolderEditTitle').textContent = isEdit ? 'Rename Folder' : 'New Folder';
  el('wsFolderEditNameInput').value = existingName || '';
  el('wsFolderEditSaveBtn').textContent = isEdit ? 'Save' : 'Create';
  openModal('wsFolderEditModal');
}

async function saveWsFolderEdit() {
  const name = el('wsFolderEditNameInput').value.trim();
  if (!name) { showToast('Enter a folder name', 'error'); return; }
  const d = wsData();
  if (_wsFolderEditName) {
    // Rename: update folders array + all bookmark folderName references
    const f = d.folders.find(x => x.name === _wsFolderEditName);
    if (f) f.name = name;
    else d.folders.push({ name });
    d.importedBookmarks = (d.importedBookmarks || []).map(b =>
      b.folderName === _wsFolderEditName ? { ...b, folderName: name } : b
    );
    showToast('Folder renamed!', 'success');
  } else {
    // Create: check for duplicate
    const existing = allWsFolderNames();
    if (existing.includes(name)) { showToast('A folder with that name already exists', 'error'); return; }
    d.folders.push({ name });
    showToast('Folder created!', 'success');
  }
  await save();
  closeModal('wsFolderEditModal');
  renderWorkspaceBookmarks();
  renderSidebarFolders();
}

function _setWsBmFolder(value, label) {
  _wsBmFolderValue = value;
  el('wsBmFolderLabel').textContent = label || value;
  el('wsBmFolderLabel').style.color = value ? 'var(--text-primary)' : 'var(--text-muted)';
  // Update selected highlight
  el('wsBmFolderDropdown').querySelectorAll('.csel-option').forEach(o => {
    o.classList.toggle('selected', o.dataset.value === value);
  });
  _closeCsel();
}

function _closeCsel() {
  el('wsBmFolderBtn')?.classList.remove('open');
  el('wsBmFolderDropdown')?.classList.remove('open');
}

function openWsBookmarkEditModal(defaultFolderName, bmId) {
  _wsBmEditId = bmId || null;
  _wsBmDefaultFolder = defaultFolderName || null;
  const isEdit = !!bmId;
  const folders = allWsFolderNames();

  // Build custom dropdown options
  const dropdown = el('wsBmFolderDropdown');
  if (!folders.length) {
    dropdown.innerHTML = `<div class="csel-option" data-value="__new__">📁 Create a folder first...</div>`;
    _setWsBmFolder('__new__', '📁 Create a folder first...');
  } else {
    dropdown.innerHTML = folders.map(f =>
      `<div class="csel-option" data-value="${escH(f)}">📁 ${escH(f)}</div>`
    ).join('');
    const initial = (isEdit
      ? (wsBookmarks().find(b => b.id === bmId)?.folderName)
      : defaultFolderName) || folders[0];
    _setWsBmFolder(initial, `📁 ${initial}`);
  }
  dropdown.querySelectorAll('.csel-option').forEach(opt => {
    opt.addEventListener('click', () => _setWsBmFolder(opt.dataset.value, opt.textContent));
  });

  if (isEdit) {
    const bm = wsBookmarks().find(b => b.id === bmId);
    if (!bm) return;
    el('wsBookmarkEditTitle').textContent = 'Edit Bookmark';
    el('wsBmEditTitle').value = bm.title || '';
    el('wsBmEditUrl').value = bm.url || '';
    el('wsBmEditDeleteBtn').style.display = 'block';
    el('wsBmEditSaveBtn').textContent = 'Save';
  } else {
    el('wsBookmarkEditTitle').textContent = 'Add Bookmark';
    el('wsBmEditTitle').value = '';
    el('wsBmEditUrl').value = '';
    el('wsBmEditDeleteBtn').style.display = 'none';
    el('wsBmEditSaveBtn').textContent = 'Add Bookmark';
  }
  openModal('wsBookmarkEditModal');
}

async function saveWsBookmarkEdit() {
  const folder = _wsBmFolderValue;
  if (folder === '__new__') {
    closeModal('wsBookmarkEditModal');
    openWsFolderEditModal(null);
    return;
  }
  const title = el('wsBmEditTitle').value.trim();
  const url = el('wsBmEditUrl').value.trim();
  if (!url) { showToast('Enter a URL', 'error'); return; }
  const fullUrl = url.startsWith('http') ? url : 'https://' + url;
  const d = wsData();
  if (_wsBmEditId) {
    d.importedBookmarks = (d.importedBookmarks || []).map(b =>
      b.id === _wsBmEditId ? { ...b, title: title || fullUrl, url: fullUrl, folderName: folder } : b
    );
    showToast('Bookmark updated!', 'success');
  } else {
    const newBm = { id: 'ws_' + Date.now(), title: title || fullUrl, url: fullUrl, folderName: folder };
    d.importedBookmarks = [...(d.importedBookmarks || []), newBm];
    showToast('Bookmark added!', 'success');
  }
  await save();
  closeModal('wsBookmarkEditModal');
  renderWorkspaceBookmarks();
  renderSidebarFolders();
}

async function removeWsFolder(folderName) {
  const d = wsData();
  d.folders = (d.folders || []).filter(f => f.name !== folderName);
  d.importedBookmarks = (d.importedBookmarks || []).filter(b => (b.folderName || 'Other') !== folderName);
  await save();
  closeModal('folderModal');
  renderWorkspaceBookmarks();
  renderSidebarFolders();
  showToast('Folder deleted', 'success');
}

async function importAllChromeBookmarks() {
  if (!IS_CHROME) { showToast('Requires Chrome extension', 'error'); return; }
  if (!S.allBookmarks.length) {
    showToast('No Chrome bookmarks found', 'error');
    return;
  }
  // Flatten all bookmarks across all folders
  const allItems = [];
  S.allBookmarks.forEach(folder => {
    (folder.items || []).forEach(it => {
      allItems.push({ id: it.id, title: it.title || it.url, url: it.url, folderName: folder.title });
    });
  });
  if (!allItems.length) { showToast('No bookmarks to import', 'error'); return; }
  // Create a dedicated workspace
  const ws = { id: Date.now(), name: 'Chrome Bookmarks', icon: '🔖' };
  S.workspaces.push(ws);
  S.wsData[ws.id] = { quickAccess: [], notes: [], tasks: [], importedBookmarks: allItems, folders: [] };
  S.activeWsId = ws.id;
  await save();
  el('importChromeBookmarksBtn').closest('.settings-section').style.display = 'none';
  closeSettings();
  renderAll();
  showToast(`Imported ${allItems.length} bookmarks into new workspace`, 'success');
}

// ===== DRAG REORDER =====
function initDragReorder(container, itemSelector, onDrop) {
  let dragSrc = null;
  let placeholder = null;
  let didDrop = false;

  function getItems() {
    return [...container.querySelectorAll(itemSelector)];
  }

  function clearTransforms() {
    getItems().forEach(el => { el.style.transition = ''; el.style.transform = ''; });
  }

  // FLIP: snapshot positions → move placeholder → animate items to new positions
  function movePlaceholder(newNext) {
    if (placeholder.nextElementSibling === newNext) return; // already there
    const snap = new Map(getItems().map(el => [el, el.getBoundingClientRect()]));
    container.insertBefore(placeholder, newNext);
    getItems().forEach(el => {
      const before = snap.get(el);
      if (!before) return;
      const after = el.getBoundingClientRect();
      const dx = before.left - after.left;
      const dy = before.top  - after.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      el.style.transition = 'none';
      el.style.transform  = `translate(${dx}px,${dy}px)`;
      requestAnimationFrame(() => {
        el.style.transition = 'transform 0.16s ease';
        el.style.transform  = '';
      });
    });
  }

  container.addEventListener('dragstart', e => {
    if (e.target.closest('button')) { e.preventDefault(); return; }
    const item = e.target.closest(itemSelector);
    if (!item) return;
    dragSrc = item;
    didDrop = false;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');

    // Custom ghost: slightly scaled + shadow so it looks "lifted"
    const ghost = item.cloneNode(true);
    Object.assign(ghost.style, {
      position: 'fixed', top: '-9999px', left: '-9999px',
      width: item.offsetWidth + 'px', pointerEvents: 'none',
      transform: 'scale(1.05) rotate(-1deg)',
      boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
      borderRadius: getComputedStyle(item).borderRadius,
      opacity: '0.95'
    });
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, item.offsetWidth / 2, item.offsetHeight / 2);
    requestAnimationFrame(() => ghost.remove());

    // Hide original + insert placeholder in its spot
    requestAnimationFrame(() => {
      if (!dragSrc) return;
      placeholder = document.createElement('div');
      placeholder.className = 'drag-placeholder';
      placeholder.style.cssText =
        `width:${item.offsetWidth}px;height:${item.offsetHeight}px;flex-shrink:0`;
      container.insertBefore(placeholder, dragSrc);
      dragSrc.style.display = 'none';
    });
  });

  container.addEventListener('dragover', e => {
    e.preventDefault();
    if (!dragSrc || !placeholder) return;
    const target = e.target.closest(itemSelector);
    if (!target || target === dragSrc) return;
    const rect = target.getBoundingClientRect();
    const after = e.clientX > rect.left + rect.width / 2;
    movePlaceholder(after ? target.nextElementSibling : target);
  });

  container.addEventListener('drop', e => {
    e.preventDefault();
    if (!dragSrc || !placeholder) return;
    didDrop = true;
    clearTransforms();
    dragSrc.style.display = '';
    container.insertBefore(dragSrc, placeholder);
    placeholder.remove();
    placeholder = null;
    dragSrc = null;
    onDrop();
  });

  container.addEventListener('dragend', () => {
    if (didDrop) return;
    clearTransforms();
    if (dragSrc) {
      dragSrc.style.display = '';
      if (placeholder) container.insertBefore(dragSrc, placeholder);
    }
    placeholder?.remove();
    placeholder = null;
    dragSrc = null;
  });
}

// ===== HISTORY =====
function _historyDateLabel(ts) {
  const nowDay = new Date(); nowDay.setHours(0,0,0,0);
  const itemDay = new Date(ts); itemDay.setHours(0,0,0,0);
  const diff = Math.round((nowDay - itemDay) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return 'This Week';
  if (diff < 30) return 'This Month';
  return 'Older';
}

async function loadHistory(q) {
  el('historyLoading').style.display = 'flex';
  const items = await API.history(q);
  el('historyLoading').style.display = 'none';
  const list = el('historyList');
  if (!items.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🕐</div><div class="empty-state-text">No history found</div></div>';
    return;
  }
  const groups = {}; const groupOrder = [];
  items.slice(0, 150).forEach(it => {
    const lbl = _historyDateLabel(it.lastVisitTime);
    if (!groups[lbl]) { groups[lbl] = []; groupOrder.push(lbl); }
    groups[lbl].push(it);
  });
  list.innerHTML = groupOrder.map(lbl => `
    <div class="history-date-group">
      <div class="history-date-label">${lbl}</div>
      <div class="history-group-items">
        ${groups[lbl].map(it => {
          const initial = escH((it.title || getDomain(it.url) || '?')[0].toUpperCase());
          return `<div class="history-item-wrap">
            <a href="${escH(it.url)}" class="history-item" target="_blank">
              <div class="history-favicon-wrap">
                <img src="${favSrc(it.url)}" onerror="this.style.display='none';this.nextElementSibling.style.display='block'" alt="">
                <span class="history-favicon-initial" style="display:none">${initial}</span>
              </div>
              <div class="history-item-body">
                <span class="history-title">${escH(it.title||it.url)}</span>
                <span class="history-url">${escH(getDomain(it.url))}</span>
              </div>
              <span class="history-time">${fmtTimeAgo(it.lastVisitTime)}</span>
            </a>
            <button class="history-delete-btn" data-url="${escH(it.url)}" data-tip="Remove from history">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>`;
        }).join('')}
      </div>
    </div>`).join('');

  list.querySelectorAll('.history-delete-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.preventDefault();
      const url = btn.dataset.url;
      await API.deleteHistoryUrl(url);
      btn.closest('.history-item-wrap').remove();
    });
  });

  const clearAllBtn = el('historyClearAllBtn');
  if (clearAllBtn) {
    clearAllBtn.onclick = async () => {
      if (!confirm('Clear all browsing history? This cannot be undone.')) return;
      await API.deleteAllHistory();
      list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🕐</div><div class="empty-state-text">History cleared</div></div>';
    };
  }
}

// ===== DOWNLOADS =====
function _extBadgeColor(ext) {
  const m = {
    pdf:['#f87171','rgba(239,68,68,.14)'],
    zip:['#fbbf24','rgba(245,158,11,.14)'],rar:['#fbbf24','rgba(245,158,11,.14)'],'7z':['#fbbf24','rgba(245,158,11,.14)'],tar:['#fbbf24','rgba(245,158,11,.14)'],gz:['#fbbf24','rgba(245,158,11,.14)'],
    jpg:['#34d399','rgba(16,185,129,.14)'],jpeg:['#34d399','rgba(16,185,129,.14)'],png:['#34d399','rgba(16,185,129,.14)'],gif:['#34d399','rgba(16,185,129,.14)'],webp:['#34d399','rgba(16,185,129,.14)'],svg:['#34d399','rgba(16,185,129,.14)'],
    mp4:['#a78bfa','rgba(139,92,246,.14)'],mov:['#a78bfa','rgba(139,92,246,.14)'],avi:['#a78bfa','rgba(139,92,246,.14)'],mkv:['#a78bfa','rgba(139,92,246,.14)'],webm:['#a78bfa','rgba(139,92,246,.14)'],
    mp3:['#f472b6','rgba(236,72,153,.14)'],wav:['#f472b6','rgba(236,72,153,.14)'],flac:['#f472b6','rgba(236,72,153,.14)'],
    js:['#fde047','rgba(234,179,8,.14)'],ts:['#60a5fa','rgba(59,130,246,.14)'],jsx:['#60a5fa','rgba(59,130,246,.14)'],tsx:['#60a5fa','rgba(59,130,246,.14)'],
    doc:['#60a5fa','rgba(59,130,246,.14)'],docx:['#60a5fa','rgba(59,130,246,.14)'],
    xls:['#4ade80','rgba(34,197,94,.14)'],xlsx:['#4ade80','rgba(34,197,94,.14)'],
    json:['#94a3b8','rgba(148,163,184,.1)'],
  };
  const [color, bg] = m[ext] || ['#94a3b8','rgba(148,163,184,.1)'];
  return {color, bg};
}

async function loadDownloads() {
  el('downloadsLoading').style.display = 'flex';
  const items = await API.downloads();
  el('downloadsLoading').style.display = 'none';
  const list = el('downloadsList');
  if (!items.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⬇️</div><div class="empty-state-text">No downloads found</div></div>';
    return;
  }
  list.innerHTML = items.map(it => {
    const fn = (it.filename||'').split(/[/\\]/).pop() || 'Unknown';
    const ext = fn.includes('.') ? fn.split('.').pop().toLowerCase() : '';
    const badge = ext ? ext.slice(0,4) : '?';
    const {color, bg} = _extBadgeColor(ext);
    const stateCls = it.state==='complete'?'dl-complete':it.state==='in_progress'?'dl-progress':'dl-interrupted';
    const stateLabel = it.state==='complete'?'Complete':it.state==='in_progress'?'In Progress':it.state==='interrupted'?'Interrupted':'Unknown';
    return `<div class="download-item ${stateCls}">
      <div class="download-ext-badge" style="color:${color};background:${bg}">${escH(badge)}</div>
      <div class="download-info">
        <div class="download-name">${escH(fn)}</div>
        <div class="download-meta">${fmtBytes(it.fileSize||0)}<span class="dl-sep">·</span>${it.startTime?new Date(it.startTime).toLocaleDateString():''}</div>
      </div>
      <div class="download-actions">
        <span class="download-status-badge ${stateCls}">${stateLabel}</span>
        ${it.state==='complete' ? `<button class="dl-show-btn" data-dlid="${it.id}" data-tip="Show in folder">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/><line x1="12" y1="11" x2="12" y2="17"/><polyline points="9,14 12,17 15,14"/></svg>
          Show in folder
        </button>` : ''}
      </div>
    </div>`;
  }).join('');

  list.querySelectorAll('.dl-show-btn').forEach(btn => {
    btn.addEventListener('click', () => API.showDownload(Number(btn.dataset.dlid)));
  });
}

// ===== FIX #5 — QUICK ACCESS WITH REMOVE =====
function renderQuickAccess() {
  const grid = el('quickAccessGrid');
  const items = wsQA();
  grid.innerHTML = items.map(item => `
    <a href="${escH(item.url)}" class="qa-item" data-qaid="${item.id}" draggable="true">
      <button class="qa-menu-btn" data-qaid="${item.id}" data-tip="Options">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
      </button>
      <img class="qa-item-favicon" src="${favSrc(item.url)}" onerror="this.style.display='none'" alt="${escH(item.name)}">
      <span class="qa-item-name">${escH(item.name)}</span>
    </a>`).join('') + `
  <button class="qa-add-btn" id="_qaAddBtn">
    <div class="qa-add-icon">+</div>
    <span style="font-size:11px;color:var(--text-muted)">Add</span>
  </button>`;
  grid.querySelectorAll('.qa-menu-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      const item = items.find(q => String(q.id) === btn.dataset.qaid);
      if (item) openQACtxMenu(btn, item);
    });
  });
  initDragReorder(grid, '.qa-item', () => {
    const newOrder = [...grid.querySelectorAll('.qa-item')].map(el => Number(el.dataset.qaid));
    wsData().quickAccess = newOrder.map(id => items.find(q => q.id === id)).filter(Boolean);
    save();
  });
  grid.querySelector('#_qaAddBtn')?.addEventListener('click', () => openQAEditModal(null));
}

function removeQA(e, id) {
  e.preventDefault();
  e.stopPropagation();
  const qaId = Number(id);
  const data = wsData();
  const item = data.quickAccess.find(q => q.id === qaId);
  if (!item) return;
  data.quickAccess = data.quickAccess.filter(q => q.id !== qaId);
  S.trash.push({...item, _type:'quickAccess', _wsId:S.activeWsId, _deletedAt:Date.now()});
  save();
  renderQuickAccess();
  renderTrash();
  showToast('Removed from Quick Access', 'success');
}

const QA_MAX = 8;

function addQA(name, url) {
  const data = wsData();
  const item = { id: Date.now(), name, url };
  if (data.quickAccess.length >= QA_MAX) {
    openQAReplaceModal(item);
    return;
  }
  data.quickAccess.push(item);
  save();
  renderQuickAccess();
  showToast('Quick access added!', 'success');
}

function openQAReplaceModal(newItem) {
  const current = wsData().quickAccess;
  el('qaReplaceNewName').textContent = newItem.name;
  const list = el('qaReplaceList');
  list.innerHTML = current.map(q => `
    <button class="qa-replace-row" data-qaid="${q.id}">
      <img src="${favSrc(q.url)}" width="16" height="16" style="border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">
      <span class="qa-replace-name">${escH(q.name)}</span>
      <span class="qa-replace-url">${escH(getDomain(q.url))}</span>
      <span class="qa-replace-tag">Replace</span>
    </button>`).join('');
  list.querySelectorAll('.qa-replace-row').forEach(btn => {
    btn.addEventListener('click', () => {
      const d = wsData();
      const idx = d.quickAccess.findIndex(q => String(q.id) === btn.dataset.qaid);
      if (idx !== -1) d.quickAccess[idx] = newItem;
      save(); renderQuickAccess();
      closeModal('qaReplaceModal');
      showToast(`Replaced with "${newItem.name}"`, 'success');
    });
  });
  openModal('qaReplaceModal');
}

function openQAEditModal(item) {
  _qaEditId = item ? item.id : null;
  const modal = el('quickAccessModal');
  modal.querySelector('h3').textContent = item ? 'Edit Quick Access' : 'Add Quick Access';
  el('qaName').value = item ? item.name : '';
  el('qaUrl').value = item ? item.url : '';
  el('saveQuickAccessBtn').textContent = item ? 'Save' : 'Add';
  openModal('quickAccessModal');
}

function openQACtxMenu(btn, item) {
  const menu = _getOrCreateCtxMenu();
  const rect = btn.getBoundingClientRect();
  menu.style.top  = (rect.bottom + 4) + 'px';
  menu.style.left = Math.min(rect.left, window.innerWidth - 180) + 'px';
  menu.innerHTML = `
    <div class="bm-ctx-item" data-action="edit">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      Edit
    </div>
    <div class="bm-ctx-sep"></div>
    <div class="bm-ctx-item danger" data-action="delete">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
      Delete
    </div>`;
  menu.querySelector('[data-action="edit"]').addEventListener('click', () => {
    closeCtxMenu(); openQAEditModal(item);
  });
  menu.querySelector('[data-action="delete"]').addEventListener('click', () => {
    closeCtxMenu();
    confirm2('Remove from Quick Access?', `"${item.name}" will be moved to trash.`, () => {
      const data = wsData();
      const found = data.quickAccess.find(q => q.id === item.id);
      if (found) S.trash.push({...found, _type:'quickAccess', _wsId:S.activeWsId, _deletedAt:Date.now()});
      data.quickAccess = data.quickAccess.filter(q => q.id !== item.id);
      save(); renderQuickAccess(); renderTrash();
      showToast('Removed from Quick Access', 'success');
    });
  });
  menu.classList.add('open');
  _ctxSub.classList.remove('open');
}

// ===== NOTES =====
function renderNotesWidget() {
  const notes = wsNotes();
  const list = el('notesList');
  if (!notes.length) {
    list.innerHTML = `<div class="widget-empty-state">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
      <span>No notes yet</span></div>`;
    return;
  }
  list.innerHTML = notes.slice(0,5).map(n => `
    <div class="note-item" data-nid="${n.id}">
      <span class="note-text">${escH(n.title||n.content)}</span>
    </div>`).join('');
  list.querySelectorAll('.note-item[data-nid]').forEach(item => {
    item.addEventListener('click', () => openNoteEdit(Number(item.dataset.nid)));
  });
}

function renderNotesView() {
  const allNotes = wsNotes();
  const list = el('notesViewList');
  const filtersEl = el('notesTagFilters');

  // Build tag filter bar from all unique tags
  const allTags = [...new Set(allNotes.flatMap(n => n.tags || []))].sort();
  if (filtersEl) {
    filtersEl.innerHTML = allTags.map(t =>
      `<button class="notes-tag-filter${S.notesViewTagFilter===t?' active':''}" data-tag="${escH(t)}">${escH(t)}</button>`
    ).join('');
    filtersEl.querySelectorAll('.notes-tag-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        S.notesViewTagFilter = S.notesViewTagFilter === btn.dataset.tag ? null : btn.dataset.tag;
        renderNotesView();
      });
    });
  }

  // Filter notes by search query and active tag
  let notes = allNotes;
  const q = S.notesViewSearch.toLowerCase();
  if (q) notes = notes.filter(n => (n.title||'').toLowerCase().includes(q) || (n.content||'').toLowerCase().includes(q));
  if (S.notesViewTagFilter) notes = notes.filter(n => (n.tags||[]).includes(S.notesViewTagFilter));

  if (!notes.length) {
    list.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">📝</div><div class="empty-state-text">${q||S.notesViewTagFilter?'No notes match your search.':'No notes yet. Click "+ New Note" to create one.'}</div></div>`;
    return;
  }

  // Pinned first
  const sorted = [...notes.filter(n=>n.pinned), ...notes.filter(n=>!n.pinned)];
  list.innerHTML = sorted.map(n => {
    const tags = n.tags||[];
    const dateStr = new Date(n.updatedAt||n.date).toLocaleDateString(undefined,{month:'short',day:'numeric'});
    return `<div class="note-card${n.pinned?' pinned':''}" data-nid="${n.id}">
      ${n.pinned?'<span class="note-card-pin" data-tip="Pinned">📌</span>':''}
      <div class="note-card-title">${escH(n.title||'Untitled')}</div>
      <div class="note-card-content">${escH(n.content)}</div>
      <div class="note-card-footer">
        <span class="note-card-date">${dateStr}</span>
        ${tags.length?`<div class="note-card-tags">${tags.slice(0,3).map(t=>`<span class="note-card-tag">${escH(t)}</span>`).join('')}</div>`:''}
      </div>
      <button class="note-card-del-btn" data-nid="${n.id}" data-tip="Delete">🗑</button>
    </div>`;
  }).join('');
  list.querySelectorAll('.note-card[data-nid]').forEach(card => {
    card.addEventListener('click', e => { if (!e.target.closest('.note-card-del-btn')) openNoteEdit(Number(card.dataset.nid)); });
    card.querySelector('.note-card-del-btn')?.addEventListener('click', e => { e.stopPropagation(); deleteNoteById(Number(card.dataset.nid)); });
  });
}

// ===== NOTE EDITOR HELPERS =====
let _noteTags = [];
let _notePinned = false;

function renderNoteEditorTags() {
  const list = el('noteTagsList');
  if (!list) return;
  list.innerHTML = _noteTags.map((t,i) =>
    `<span class="note-tag-chip">${escH(t)}<span class="note-tag-chip-x" data-i="${i}">✕</span></span>`
  ).join('');
  list.querySelectorAll('.note-tag-chip-x').forEach(x => {
    x.addEventListener('click', () => { _noteTags.splice(Number(x.dataset.i),1); renderNoteEditorTags(); });
  });
}

function updateNotePinBtn() {
  const btn = el('notePinBtn');
  const lbl = el('notePinLabel');
  if (!btn) return;
  btn.classList.toggle('pinned', _notePinned);
  if (lbl) lbl.textContent = _notePinned ? 'Pinned' : 'Pin';
}

function updateNoteWordCount() {
  const wc = el('noteWordCount');
  if (!wc) return;
  const words = (el('noteContent')?.value||'').trim().split(/\s+/).filter(Boolean).length;
  wc.textContent = `${words} word${words===1?'':'s'}`;
}

function openNoteEdit(id) {
  const noteId = Number(id);
  const note = wsNotes().find(n => n.id === noteId);
  if (!note) return;
  S.editingNoteId = noteId;
  el('noteModalTitle').textContent = 'Edit Note';
  el('noteTitle').value = note.title || '';
  el('noteContent').value = note.content || '';
  el('deleteNoteBtn').style.display = 'block';
  _noteTags = Array.isArray(note.tags) ? [...note.tags] : [];
  _notePinned = !!note.pinned;
  renderNoteEditorTags();
  updateNotePinBtn();
  updateNoteWordCount();
  openModal('noteModal');
}

function openNoteNew() {
  S.editingNoteId = null;
  el('noteModalTitle').textContent = 'New Note';
  el('noteTitle').value = '';
  el('noteContent').value = '';
  el('deleteNoteBtn').style.display = 'none';
  _noteTags = [];
  _notePinned = false;
  renderNoteEditorTags();
  updateNotePinBtn();
  updateNoteWordCount();
  openModal('noteModal');
  setTimeout(() => el('noteTitle').focus(), 60);
}

function saveNote() {
  const title = el('noteTitle').value.trim();
  const content = el('noteContent').value.trim();
  if (!content && !title) { showToast('Write something first!', 'error'); return; }
  const notes = wsNotes();
  const now = Date.now();
  if (S.editingNoteId) {
    const idx = notes.findIndex(n => n.id === S.editingNoteId);
    if (idx > -1) notes[idx] = {...notes[idx], title:title||'Untitled', content, updatedAt:now, tags:_noteTags, pinned:_notePinned};
  } else {
    notes.unshift({id:now, title:title||'Untitled', content, date:now, updatedAt:now, tags:_noteTags, pinned:_notePinned});
  }
  save();
  renderNotesWidget();
  renderNotesView();
  closeModal('noteModal');
  showToast('Note saved!', 'success');
}

function deleteNote() {
  if (!S.editingNoteId) return;
  deleteNoteById(S.editingNoteId);
  closeModal('noteModal');
}

// Delete a note directly by ID (used by inline buttons in note cards)
function deleteNoteById(id) {
  const noteId = Number(id);
  const data = wsData();
  const note = data.notes.find(n => n.id === noteId);
  if (note) {
    S.trash.push({...note, _type:'note', _wsId:S.activeWsId, _deletedAt:Date.now()});
    data.notes = data.notes.filter(n => n.id !== noteId);
    S.editingNoteId = null;
    save();
    renderNotesWidget();
    renderNotesView();
    renderTrash();
    showToast('Note deleted', 'success');
  }
}

// ===== TASKS =====
function renderTasksWidget() {
  const tasks = wsTasks();
  const list = el('tasksList');
  const chip = el('tasksProgressChip');
  if (!tasks.length) {
    list.innerHTML = `<div class="widget-empty-state">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="9,11 12,14 22,4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
      <span>No tasks yet</span></div>`;
    if (chip) { chip.className = 'tasks-progress-chip'; }
    return;
  }
  const done = tasks.filter(t => t.done).length;
  if (chip) {
    if (done === tasks.length) {
      chip.textContent = '✓ All done';
      chip.className = 'tasks-progress-chip visible all-done';
    } else {
      chip.textContent = `${done}/${tasks.length}`;
      chip.className = 'tasks-progress-chip visible';
    }
  }
  list.innerHTML = tasks.slice(0,6).map(t => `
    <div class="task-item ${t.done?'done':''}" data-tid="${t.id}">
      <div class="task-checkbox" data-tid="${t.id}"></div>
      <span class="task-text">${escH(t.text)}</span>
      <button class="task-del-btn" data-tid="${t.id}" data-tip="Delete">✕</button>
    </div>`).join('');
  list.querySelectorAll('.task-checkbox[data-tid]').forEach(cb => {
    cb.addEventListener('click', () => toggleTask(Number(cb.dataset.tid)));
  });
  list.querySelectorAll('.task-del-btn[data-tid]').forEach(btn => {
    btn.addEventListener('click', () => deleteTask(Number(btn.dataset.tid)));
  });
}

function toggleTask(id) {
  const taskId = Number(id);
  const t = wsTasks().find(t => t.id === taskId);
  if (t) { t.done = !t.done; save(); renderTasksWidget(); }
}

function deleteTask(id) {
  const taskId = Number(id);
  const data = wsData();
  const t = data.tasks.find(t => t.id === taskId);
  if (t) {
    S.trash.push({...t, _type:'task', _wsId:S.activeWsId, _deletedAt:Date.now()});
    data.tasks = data.tasks.filter(t => t.id !== taskId);
    save();
    renderTasksWidget();
    renderTrash();
    showToast('Task deleted', 'success');
  }
}

function addTask(text) {
  if (!text.trim()) return;
  wsTasks().unshift({id:Date.now(), text:text.trim(), done:false});
  save();
  renderTasksWidget();
  showToast('Task added!', 'success');
}

// ===== QUOTE =====
const QUOTE_API = 'https://motivational-spark-api.vercel.app/api/quotes/random';

async function fetchQuote() {
  try {
    const res = await fetch(QUOTE_API);
    if (!res.ok) throw new Error('non-200');
    return await res.json();
  } catch {
    return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  }
}

function setQuoteLoading(on) {
  const txt = el('quoteText'), btn = el('refreshQuoteBtn');
  if (!txt || !btn) return;
  txt.classList.toggle('loading', on);
  btn.classList.toggle('spinning', on);
}

function showQuoteData(q) {
  el('quoteText').textContent = q.quote;
  el('quoteAuthor').textContent = `— ${q.author}`;
}

async function renderQuote() {
  setQuoteLoading(true);
  const q = await fetchQuote();
  showQuoteData(q);
  setQuoteLoading(false);
}

async function refreshQuote() {
  setQuoteLoading(true);
  const q = await fetchQuote();
  showQuoteData(q);
  setQuoteLoading(false);
}

// ===== FOCUS TIMER =====
const T = { total:1500, remaining:1500, running:false, iv:null };
const CIRC = 2*Math.PI*44;

function renderTimerDisplay() {
  const prog = el('timerProgress');
  const ratio = T.remaining / T.total;
  prog.style.strokeDashoffset = CIRC*(1-ratio);
  prog.style.stroke = ratio > 0.5 ? '#7c3aed' : ratio > 0.2 ? '#f97316' : '#ef4444';
  const m = Math.floor(T.remaining/60), s = T.remaining%60;
  el('timerDisplay').textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function timerPlay() {
  if (T.running) { pauseTimer(); return; }
  T.running = true;
  el('timerPlayBtn').innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
  T.iv = setInterval(() => {
    if (T.remaining <= 0) {
      clearInterval(T.iv); T.running = false;
      el('timerPlayBtn').innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>';
      showToast('⏰ Focus session complete! Great job!', 'success');
      return;
    }
    T.remaining--;
    renderTimerDisplay();
  }, 1000);
}
function pauseTimer() {
  clearInterval(T.iv); T.running = false;
  el('timerPlayBtn').innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>';
}
function resetTimer(mins) {
  clearInterval(T.iv); T.running = false;
  T.total = (mins||25)*60; T.remaining = T.total;
  el('timerPlayBtn').innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>';
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.toggle('active', parseInt(b.dataset.min)===(mins||25)));
  renderTimerDisplay();
}

// ===== TRASH =====
function renderTrash() {
  const list = el('trashList');
  if (!S.trash.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🗑️</div><div class="empty-state-text">Trash is empty</div></div>';
    return;
  }
  const items = [...S.trash].reverse();
  list.innerHTML = items.map(item => {
    const name = item.name||item.text||item.title||'Item';
    const icon = item._type==='task'?'✅':item._type==='quickAccess'?'⚡':'📝';
    const key = item.id||item._deletedAt;
    return `<div class="trash-item">
      <span>${icon}</span>
      <span class="trash-item-name">${escH(name)}</span>
      <span class="trash-item-type">${item._type||'item'}</span>
      <button class="restore-btn" data-key="${key}">Restore</button>
    </div>`;
  }).join('');
  list.querySelectorAll('.restore-btn[data-key]').forEach(btn => {
    btn.addEventListener('click', () => restoreItem(Number(btn.dataset.key)));
  });
}

function restoreItem(key) {
  const idx = S.trash.findIndex(i => (i.id||i._deletedAt) === key);
  if (idx===-1) return;
  const item = S.trash.splice(idx,1)[0];
  const wsId = item._wsId||S.activeWsId;
  if (!S.wsData[wsId]) S.wsData[wsId] = {quickAccess:[],notes:[],tasks:[]};
  if (item._type==='task') S.wsData[wsId].tasks.unshift({id:item.id||Date.now(),text:item.text,done:false});
  else if (item._type==='note') S.wsData[wsId].notes.unshift({id:item.id||Date.now(),title:item.title,content:item.content,date:item.date||Date.now()});
  else if (item._type==='quickAccess') S.wsData[wsId].quickAccess.unshift({id:item.id||Date.now(),name:item.name,url:item.url});
  save();
  renderAll();
  showToast('Item restored!', 'success');
}
function emptyTrash() {
  confirm2('Empty Trash?', 'All deleted items will be permanently removed.', () => {
    S.trash=[];
    save();
    renderTrash();
    showToast('Trash emptied','success');
  });
}

// ===== ANALYTICS VIEW =====
async function renderAnalytics() {
  const container = el('analyticsContent');
  if (!container) return;

  let totalBookmarks = 0, totalFolders = 0;
  S.allBookmarks.forEach(f => { totalFolders++; totalBookmarks += (f.items||[]).length; });

  let totalNotes = 0, totalTasksDone = 0, totalTasksPending = 0, totalQA = 0;
  S.workspaces.forEach(ws => {
    const d = S.wsData[ws.id] || {};
    totalNotes += (d.notes||[]).length;
    (d.tasks||[]).forEach(t => { if (t.done) totalTasksDone++; else totalTasksPending++; });
    totalQA += (d.quickAccess||[]).length;
  });
  const totalTasks = totalTasksDone + totalTasksPending;
  const taskRate = totalTasks > 0 ? Math.round(totalTasksDone / totalTasks * 100) : 0;

  const topFolders = [...S.allBookmarks].sort((a,b) => (b.items||[]).length-(a.items||[]).length).slice(0,10);
  const maxFolderSize = (topFolders[0]?.items||[]).length || 1;

  const wsRows = S.workspaces.map(ws => {
    const d = S.wsData[ws.id] || {};
    return { ws, notes:(d.notes||[]).length, tasks:(d.tasks||[]).length, done:(d.tasks||[]).filter(t=>t.done).length, qa:(d.quickAccess||[]).length };
  });

  const tagCounts = {};
  S.workspaces.forEach(ws => {
    (S.wsData[ws.id]?.notes||[]).forEach(note => {
      (note.tags||[]).forEach(tag => { tagCounts[tag]=(tagCounts[tag]||0)+1; });
    });
  });
  const topTags = Object.entries(tagCounts).sort((a,b)=>b[1]-a[1]).slice(0,6);

  const pic = (S.googleUser?.picture) || S.user.googlePicture;
  const gName = S.user.googleName || S.googleUser?.email || '';
  const gEmail = S.googleUser?.email || '';
  const chromeVer = navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] || '';

  container.innerHTML = `
    <!-- Row 1: KPI strip (full width) -->
    <div class="an-strip">
      <div class="an-chip"><span class="an-chip-val">${totalBookmarks}</span><span class="an-chip-lbl">Bookmarks</span></div>
      <div class="an-chip"><span class="an-chip-val">${totalFolders}</span><span class="an-chip-lbl">Folders</span></div>
      <div class="an-chip"><span class="an-chip-val">${totalNotes}</span><span class="an-chip-lbl">Notes</span></div>
      <div class="an-chip"><span class="an-chip-val">${totalTasksDone}<em>/${totalTasks}</em></span><span class="an-chip-lbl">Tasks Done</span></div>
      <div class="an-chip"><span class="an-chip-val">${S.workspaces.length}</span><span class="an-chip-lbl">Workspaces</span></div>
      <div class="an-chip"><span class="an-chip-val">${totalQA}</span><span class="an-chip-lbl">Quick Access</span></div>
      <div class="an-chip"><span class="an-chip-val">${S.trash.length}</span><span class="an-chip-lbl">Trash</span></div>
    </div>

    <!-- Row 2: Tasks | Notes | Workspaces | Account (4 cols) -->
    <div class="an-card">
      <div class="an-label">Tasks</div>
      <div class="an-progress-row">
        <div class="an-progress-label"><span>${taskRate}% done</span><span>${totalTasksDone}/${totalTasks}</span></div>
        <div class="an-progress-track"><div class="an-progress-fill" style="width:${taskRate}%"></div></div>
      </div>
      ${wsRows.filter(r=>r.tasks>0).map(r=>`
        <div class="an-row"><span>${escH(r.ws.icon)} ${escH(r.ws.name)}</span><span class="an-muted">${r.done}/${r.tasks}</span></div>
      `).join('')||'<div class="an-empty">No tasks yet.</div>'}
    </div>

    <div class="an-card">
      <div class="an-label">Notes</div>
      <div class="an-hero-val">${totalNotes}</div>
      ${wsRows.filter(r=>r.notes>0).map(r=>`
        <div class="an-row"><span>${escH(r.ws.icon)} ${escH(r.ws.name)}</span><span class="an-pill">${r.notes}</span></div>
      `).join('')||'<div class="an-empty">No notes yet.</div>'}
      ${topTags.length?`<div class="an-label" style="margin-top:10px">Tags</div>
        <div class="an-tags">${topTags.map(([t,c])=>`<span class="an-tag">#${escH(t)} <b>${c}</b></span>`).join('')}</div>`:''}
    </div>

    <div class="an-card">
      <div class="an-label">Workspaces</div>
      ${wsRows.map(r=>`
        <div class="an-row">
          <span class="an-ws-name">${escH(r.ws.icon)} ${escH(r.ws.name)}</span>
          <span class="an-muted" style="font-size:11px;flex-shrink:0">${r.notes}n · ${r.tasks}t · ${r.qa}qa</span>
        </div>`).join('')}
    </div>

    <div class="an-card">
      <div class="an-label">Account</div>
      ${gEmail?`<div class="an-account-row">
        ${pic?`<img src="${escH(pic)}" class="an-avatar-img" onerror="this.remove()">`:
              `<div class="an-avatar-letter">${(gName[0]||'G').toUpperCase()}</div>`}
        <div style="min-width:0">
          <div class="an-account-name">${escH(gName)}</div>
          <div class="an-muted" style="font-size:11px;overflow:hidden;text-overflow:ellipsis">${escH(gEmail)}</div>
        </div>
      </div>`:'<div class="an-empty">No Google account connected.</div>'}
      <div class="an-row" style="margin-top:4px"><span>Name</span><span class="an-muted">${escH(S.user.name)}</span></div>
      ${chromeVer?`<div class="an-row"><span>Chrome</span><span class="an-muted">v${chromeVer}</span></div>`:''}
      <div class="an-row"><span>Platform</span><span class="an-muted">${navigator.platform||'—'}</span></div>
    </div>

    <!-- Row 3: Folders (span 2) | Top Sites | Downloads -->
    <div class="an-card an-span-2">
      <div class="an-label">Bookmark Folders <span class="an-muted" style="font-weight:400">(top 10)</span></div>
      ${!totalFolders
        ?'<div class="an-empty">Visit Bookmarks view first to load data.</div>'
        :topFolders.map(f=>{
          const count=(f.items||[]).length;
          const pct=Math.round(count/maxFolderSize*100);
          return `<div class="an-row">
            <span class="an-folder-name">📁 ${escH(f.title)}</span>
            <div class="an-bar-row">
              <div class="an-bar"><div class="an-bar-fill" style="width:${pct}%"></div></div>
              <span class="an-pill">${count}</span>
            </div>
          </div>`;
        }).join('')}
    </div>

    <div class="an-card" id="an-topsites">
      <div class="an-label">Top Visited Sites</div>
      <div class="an-loading">Loading…</div>
    </div>

    <div class="an-card" id="an-downloads">
      <div class="an-label">Downloads — 30 Days</div>
      <div class="an-loading">Loading…</div>
    </div>

    <!-- Row 4: Browsing activity (full width) -->
    <div class="an-card an-span-4" id="an-history">
      <div class="an-label">Browsing Activity — Last 7 Days</div>
      <div class="an-loading">Loading…</div>
    </div>
  `;

  // --- Top Sites (async) ---
  if (IS_CHROME && chrome.topSites) {
    chrome.topSites.get(sites => {
      const card = el('an-topsites');
      if (!card) return;
      if (!sites||!sites.length) { card.querySelector('.an-loading').textContent='No data.'; return; }
      card.innerHTML = '<div class="an-label">Top Visited Sites</div>' +
        sites.slice(0,10).map(s=>`
          <div class="an-row">
            <div style="display:flex;align-items:center;gap:7px;min-width:0">
              <img src="${favSrc(s.url)}" style="width:14px;height:14px;border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">
              <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escH(s.title||getDomain(s.url))}</span>
            </div>
            <span class="an-muted" style="font-size:11px;flex-shrink:0">${escH(getDomain(s.url))}</span>
          </div>`).join('');
    });
  } else {
    const c=el('an-topsites');
    if(c) c.innerHTML='<div class="an-label">Top Visited Sites</div><div class="an-empty">Requires Chrome extension.</div>';
  }

  // --- History (async) ---
  if (IS_CHROME && chrome.history) {
    const since = Date.now() - 7*86400000;
    chrome.history.search({text:'',startTime:since,maxResults:1000}, items => {
      const card = el('an-history');
      if (!card) return;
      const domainCounts={};
      let totalVisits=0;
      (items||[]).forEach(item => {
        const d=getDomain(item.url);
        domainCounts[d]=(domainCounts[d]||0)+(item.visitCount||1);
        totalVisits+=(item.visitCount||1);
      });
      const topDomains=Object.entries(domainCounts).sort((a,b)=>b[1]-a[1]).slice(0,10);
      const maxV=topDomains[0]?.[1]||1;
      card.innerHTML=`<div class="an-label">Browsing Activity — Last 7 Days</div>
        <div class="an-strip-mini">
          <div class="an-chip-sm"><span class="an-chip-val">${totalVisits.toLocaleString()}</span><span class="an-chip-lbl">Total Visits</span></div>
          <div class="an-chip-sm"><span class="an-chip-val">${Object.keys(domainCounts).length.toLocaleString()}</span><span class="an-chip-lbl">Unique Sites</span></div>
          <div class="an-chip-sm"><span class="an-chip-val">${(items||[]).length.toLocaleString()}</span><span class="an-chip-lbl">History Items</span></div>
        </div>
        <div class="an-domain-grid">`+
        topDomains.map(([d,c])=>`
          <div class="an-domain-row">
            <div class="an-domain-left">
              <img src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=16" style="width:14px;height:14px;border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">
              <span class="an-domain-name">${escH(d)}</span>
              <div class="an-bar an-bar-flex"><div class="an-bar-fill" style="width:${Math.round(c/maxV*100)}%"></div></div>
            </div>
            <span class="an-pill">${c.toLocaleString()}</span>
          </div>`).join('')+
        `</div>`;
    });
  } else {
    const c=el('an-history');
    if(c) c.innerHTML='<div class="an-label">Browsing Activity</div><div class="an-empty">Requires Chrome extension.</div>';
  }

  // --- Downloads (async) ---
  if (IS_CHROME && chrome.downloads) {
    const since = Date.now() - 30*86400000;
    chrome.downloads.search({orderBy:['-startTime'],limit:500}, items => {
      const card = el('an-downloads');
      if (!card) return;
      const recent=(items||[]).filter(d=>d.startTime&&new Date(d.startTime).getTime()>since);
      const totalBytes=recent.reduce((s,d)=>s+(d.fileSize||0),0);
      const fmt=b=>b>1e9?(b/1e9).toFixed(1)+' GB':b>1e6?(b/1e6).toFixed(1)+' MB':b>1e3?(b/1e3).toFixed(1)+' KB':b+' B';
      card.innerHTML=`<div class="an-label">Downloads — 30 Days</div>
        <div style="display:flex;gap:10px;margin-bottom:8px">
          <div class="an-chip-sm"><span class="an-chip-val">${recent.length}</span><span class="an-chip-lbl">Files</span></div>
          <div class="an-chip-sm"><span class="an-chip-val">${fmt(totalBytes)}</span><span class="an-chip-lbl">Total Size</span></div>
        </div>`+
        (items||[]).slice(0,5).map(d=>{
          const name=(d.filename||d.url||'').split(/[\\/]/).pop()||'Unknown';
          return `<div class="an-row">
            <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px">${escH(name)}</span>
            <span class="an-muted" style="font-size:11px;flex-shrink:0">${fmt(d.fileSize||0)}</span>
          </div>`;
        }).join('');
    });
  } else {
    const c=el('an-downloads');
    if(c) c.innerHTML='<div class="an-label">Downloads</div><div class="an-empty">Requires Chrome extension.</div>';
  }
}

// ===== TOOLTIPS (delegated — works for dynamically rendered elements) =====
function initTooltips() {
  const tip = document.createElement('div');
  tip.className = 'tt';
  document.body.appendChild(tip);
  let cur = null;

  function show(target) {
    if (target === cur) return;
    cur = target;
    const rect = target.getBoundingClientRect();
    tip.textContent = target.dataset.tip;
    const inCollapsedSidebar = S.settings.sidebarCollapsed &&
      (target.closest('.nav') || target.closest('.sidebar-footer'));
    if (inCollapsedSidebar) {
      tip.dataset.dir = 'right';
      tip.style.left = (rect.right + 10) + 'px';
      tip.style.top = (rect.top + rect.height / 2) + 'px';
    } else {
      tip.dataset.dir = 'down';
      tip.style.left = (rect.left + rect.width / 2) + 'px';
      tip.style.top = (rect.bottom + 10) + 'px';
    }
    tip.classList.add('tt-show');
  }
  function hide() { tip.classList.remove('tt-show'); cur = null; }

  document.addEventListener('mouseover', e => {
    const t = e.target.closest('[data-tip]');
    if (t) show(t); else if (!cur) return; else if (!cur.contains(e.target)) hide();
  });
  document.addEventListener('mouseout', e => {
    if (!cur) return;
    const t = e.target.closest('[data-tip]');
    if (t && t === cur && !t.contains(e.relatedTarget)) hide();
  });
  document.addEventListener('click', hide);
  document.addEventListener('scroll', hide, true);
}

// ===== FIX #4 — SETTINGS PANEL =====
function openSettings() {
  const alreadyImported = S.workspaces.some(w => w.name === 'Chrome Bookmarks');
  el('importChromeBookmarksBtn').closest('.settings-section').style.display = alreadyImported ? 'none' : '';
  // Populate current values
  el('settingsName').value = S.user.name;
  el('darkThemeBtn').classList.toggle('active', S.settings.theme==='dark');
  el('lightThemeBtn').classList.toggle('active', S.settings.theme==='light');
  el('clock12Btn').classList.toggle('active', S.settings.clockFormat==='12');
  el('clock24Btn').classList.toggle('active', S.settings.clockFormat==='24');
  el('showSecondsToggle').checked = !!S.settings.showSeconds;
  el('widgetNotesToggle').checked = S.settings.widgets.notes !== false;
  el('widgetTasksToggle').checked = S.settings.widgets.tasks !== false;
  el('widgetQuoteToggle').checked = S.settings.widgets.quote !== false;
  el('widgetTimerToggle').checked = S.settings.widgets.timer !== false;
  // Highlight active card glow
  document.querySelectorAll('#cardGlowGroup .toggle-opt').forEach(b => {
    b.classList.toggle('active', b.dataset.glow === (S.settings.cardGlow || 'glow'));
  });
  // Highlight active accent
  document.querySelectorAll('#accentColors .color-swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.color === S.settings.accentColor);
  });
  document.querySelectorAll('#avatarColors .color-swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.color === (S.user.avatarColor||'#7c3aed'));
  });
  el('settingsPanel').classList.add('open');
  el('settingsOverlay').classList.add('open');
}
function closeSettings() {
  el('settingsPanel').classList.remove('open');
  el('settingsOverlay').classList.remove('open');
}
function saveSettings() {
  const name = el('settingsName').value.trim() || S.user.name;
  S.user.name = name;
  S.settings.widgets.notes = el('widgetNotesToggle').checked;
  S.settings.widgets.tasks = el('widgetTasksToggle').checked;
  S.settings.widgets.quote = el('widgetQuoteToggle').checked;
  S.settings.widgets.timer = el('widgetTimerToggle').checked;
  S.settings.showSeconds   = el('showSecondsToggle').checked;
  const glowBtn = document.querySelector('#cardGlowGroup .toggle-opt.active');
  S.settings.cardGlow = glowBtn?.dataset.glow || 'glow';
  applyCardGlow(S.settings.cardGlow);
  updateAvatarDisplay();
  updateGreeting();
  applyWidgetVisibility();
  save();
  closeSettings();
  showToast('Settings saved!', 'success');
}
function applyTheme(theme) {
  S.settings.theme = theme;
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('__td_theme', theme); } catch(e) {}
  const icon = el('themeIcon'), label = el('themeLabel');
  if (theme==='light') {
    icon.innerHTML='<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
    label.textContent='Light';
  } else {
    icon.innerHTML='<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';
    label.textContent='Dark';
  }
}
function applyAccent(color) {
  if (!color) return;
  S.settings.accentColor = color;
  document.documentElement.style.setProperty('--accent', color);
  document.documentElement.style.setProperty('--accent-light', color+'cc');
  document.documentElement.style.setProperty('--accent-bg', color+'2e');
  document.documentElement.style.setProperty('--accent-subtle', color+'14');
  document.documentElement.style.setProperty('--accent-glow',   color+'80');
  try { localStorage.setItem('__td_accent', color); } catch(e) {}
}
function applyCardGlow(mode) {
  document.documentElement.dataset.cardGlow = mode || 'glow';
}
function applyWidgetVisibility() {
  const w = S.settings.widgets;
  const show = (id, visible) => {
    const el2 = document.getElementById(id);
    if (el2) el2.style.display = visible===false ? 'none' : '';
  };
  show('widget-notes', w.notes);
  show('widget-tasks', w.tasks);
  show('widget-quote', w.quote);
  show('widget-timer', w.timer);
}

// Export / Import
function exportData() {
  const blob = new Blob([JSON.stringify({
    user:S.user, workspaces:S.workspaces, wsData:S.wsData, settings:S.settings, trash:S.trash,
    exportedAt: new Date().toISOString()
  }, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `tabdeck-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  showToast('Data exported!', 'success');
}
function importData(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const d = JSON.parse(e.target.result);
      if (d.workspaces) S.workspaces = d.workspaces;
      if (d.wsData)     S.wsData = d.wsData;
      if (d.user)       S.user = d.user;
      if (d.settings)   S.settings = {...S.settings, ...d.settings};
      if (d.trash)      S.trash = d.trash;
      save();
      renderAll();
      applyTheme(S.settings.theme);
      applyAccent(S.settings.accentColor);
      showToast('Data imported successfully!', 'success');
    } catch {
      showToast('Invalid file format', 'error');
    }
  };
  reader.readAsText(file);
}

// ===== SEARCH =====
function setupSearch() {
  // Search trigger button opens command palette
  el('searchTriggerBtn').addEventListener('click', () => openCmdPalette());
}

// ===== COMMAND PALETTE =====
let _cmdActiveIdx = -1;

function openCmdPalette(prefill) {
  const overlay = el('cmdPaletteOverlay');
  const inp = el('cmdInput');
  overlay.classList.add('open');
  inp.value = prefill || '';
  _cmdActiveIdx = -1;
  setTimeout(() => inp.focus(), 50);
  if (prefill) _renderCmdResults(prefill);
  else el('cmdResults').innerHTML = _cmdEmptyState();
}

function closeCmdPalette() {
  el('cmdPaletteOverlay').classList.remove('open');
  el('cmdInput').value = '';
  el('cmdResults').innerHTML = '';
  _cmdActiveIdx = -1;
}

function _cmdEmptyState() {
  return `<div class="cmd-empty"><div class="cmd-empty-icon">⌕</div>Type to search bookmarks and notes</div>`;
}

function _buildCmdResults(q) {
  const ql = q.toLowerCase();
  const bmMatches = [];
  for (const f of S.allBookmarks) {
    for (const it of f.items) {
      if ((it.title||'').toLowerCase().includes(ql)||(it.url||'').toLowerCase().includes(ql)) {
        bmMatches.push(it);
        if (bmMatches.length >= 8) break;
      }
    }
    if (bmMatches.length >= 8) break;
  }
  // Also search workspace bookmarks
  for (const ws of S.workspaces) {
    const wsBms = (S.wsData[ws.id]?.importedBookmarks) || [];
    for (const bm of wsBms) {
      if (bmMatches.length >= 8) break;
      if ((bm.title||'').toLowerCase().includes(ql)||(bm.url||'').toLowerCase().includes(ql)) {
        if (!bmMatches.find(b => b.url === bm.url)) bmMatches.push(bm);
      }
    }
  }
  const noteMatches = [];
  for (const ws of S.workspaces) {
    const notes = S.wsData[ws.id]?.notes || [];
    notes.forEach(n => {
      if ((n.title||'').toLowerCase().includes(ql)||(n.content||'').toLowerCase().includes(ql))
        noteMatches.push(n);
    });
  }
  return { bmMatches: bmMatches.slice(0,8), noteMatches: noteMatches.slice(0,3) };
}

function _renderCmdResults(q) {
  const { bmMatches, noteMatches } = _buildCmdResults(q);
  let html = '';

  if (bmMatches.length) {
    html += `<div class="cmd-section-label">Bookmarks</div>`;
    html += bmMatches.map(bm => `
      <a href="${escH(bm.url)}" class="cmd-result-item" target="_self" data-cmd-item>
        <div class="cmd-favicon-wrap"><img src="${favSrc(bm.url)}" onerror="this.style.opacity=0" alt=""></div>
        <div class="cmd-item-body">
          <div class="cmd-item-title">${escH(bm.title||bm.url)}</div>
        </div>
        <div class="cmd-domain-tag">${escH(getDomain(bm.url))}</div>
      </a>`).join('');
  }

  if (noteMatches.length) {
    html += `<div class="cmd-section-label">Notes</div>`;
    html += noteMatches.map(n => `
      <div class="cmd-result-item" data-cmd-item data-note-id="${n.id}">
        <div class="cmd-note-icon">📝</div>
        <div class="cmd-item-body">
          <div class="cmd-item-title">${escH(n.title||'Untitled Note')}</div>
          <div class="cmd-item-sub">${escH((n.content||'').replace(/<[^>]+>/g,'').slice(0,55))}${(n.content||'').length>55?'…':''}</div>
        </div>
      </div>`).join('');
  }

  if (!bmMatches.length && !noteMatches.length) {
    html += `<div class="cmd-empty"><div class="cmd-empty-icon" style="font-size:20px">∅</div>No results for "<em style="color:var(--accent-light)">${escH(q)}</em>"</div>`;
  }

  html += `<a href="https://www.google.com/search?q=${encodeURIComponent(q)}" class="cmd-google-item" target="_blank" data-cmd-item>
    <div class="cmd-google-icon">G</div>
    <div class="cmd-google-label">Search Google for <em>"${escH(q)}"</em></div>
  </a>`;

  el('cmdResults').innerHTML = html;
  _cmdActiveIdx = -1;

  // Wire note clicks
  el('cmdResults').querySelectorAll('[data-note-id]').forEach(el2 => {
    el2.addEventListener('click', () => {
      openNoteEdit(Number(el2.dataset.noteId));
      navigateTo('notes');
      closeCmdPalette();
    });
  });
}

function _cmdItems() {
  return Array.from(el('cmdResults').querySelectorAll('[data-cmd-item]'));
}

function _cmdSetActive(idx) {
  const items = _cmdItems();
  items.forEach(i => i.classList.remove('active'));
  if (idx >= 0 && idx < items.length) {
    items[idx].classList.add('active');
    items[idx].scrollIntoView({ block: 'nearest' });
  }
  _cmdActiveIdx = idx;
}

function _cmdInitKeyboard() {
  const inp = el('cmdInput');
  inp.addEventListener('input', debounce(e => {
    const q = e.target.value.trim();
    if (!q) { el('cmdResults').innerHTML = _cmdEmptyState(); _cmdActiveIdx = -1; return; }
    _renderCmdResults(q);
  }, 150));

  inp.addEventListener('keydown', e => {
    const items = _cmdItems();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      _cmdSetActive(Math.min(_cmdActiveIdx + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      _cmdSetActive(Math.max(_cmdActiveIdx - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const q = inp.value.trim();
      if (_cmdActiveIdx >= 0 && items[_cmdActiveIdx]) {
        const active = items[_cmdActiveIdx];
        if (active.href) { window.location.href = active.href; closeCmdPalette(); }
        else active.click();
      } else if (q) {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank');
        closeCmdPalette();
      }
    } else if (e.key === 'Escape') {
      closeCmdPalette();
    }
  });

  el('cmdPaletteOverlay').addEventListener('click', e => {
    if (e.target === el('cmdPaletteOverlay')) closeCmdPalette();
  });
  el('cmdEscBadge') && el('cmdEscBadge').addEventListener('click', closeCmdPalette);
}

function hideSearch() {} // kept for any legacy references

// ===== NAVIGATION =====
function navigateTo(view) {
  const current = document.querySelector('.view.active');
  const next = el(`view-${view}`);
  if (current && current !== next) {
    current.style.animation = 'wsContentOut .1s ease forwards';
    setTimeout(() => {
      current.style.animation = '';
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      next?.classList.add('active');
      document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view===view));
      _navigateLoad(view);
    }, 100);
    return;
  }
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  next?.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view===view));
  _navigateLoad(view);
}

function _navigateLoad(view) {
  if (view==='bookmarks') {
    if (!S.allBookmarks.length) loadBookmarks();
    renderBmWorkspaceTabs();
    S.bmFolderFilter = null;
    renderBmForActiveWorkspace();
  }
  if (view==='history') loadHistory(el('historySearch').value||'');
  if (view==='downloads') loadDownloads();
  if (view==='trash') renderTrash();
  if (view==='analytics') renderAnalytics();
}

function renderBmWorkspaceTabs() {
  const bar = el('bmWsTabs');
  if (!bar) return;
  bar.innerHTML = S.workspaces.map(ws => `
    <div class="bm-ws-tab ${ws.id===S.activeWsId?'active':''}" data-wsid="${ws.id}">
      <span>${ws.icon}</span>
      <span>${escH(ws.name)}</span>
    </div>`).join('');
  bar.querySelectorAll('.bm-ws-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      setActiveWorkspace(tab.dataset.wsid);
      S.bmFolderFilter = null;
      renderBmWorkspaceTabs();
      renderBmForActiveWorkspace();
    });
  });
}

function renderBmForActiveWorkspace() {
  const items = wsBookmarks();
  const q = (el('bookmarkSearch')?.value || '').toLowerCase().trim();

  if (!items.length) {
    renderBmToolbar([]);
    el('allBookmarksList').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔖</div>
        <div class="empty-state-text">No bookmarks in this workspace.<br>Import Chrome bookmarks from Settings.</div>
      </div>`;
    return;
  }

  // Group by folderName
  const groups = {};
  items.forEach(bm => {
    const key = bm.folderName || 'Other';
    if (!groups[key]) groups[key] = [];
    groups[key].push(bm);
  });

  // Build toolbar with all folder names
  renderBmToolbar(Object.keys(groups).sort());

  // Apply folder filter
  let entries = Object.entries(groups);
  if (S.bmFolderFilter) entries = entries.filter(([name]) => name === S.bmFolderFilter);

  // Apply search
  if (q) {
    entries = entries.map(([name, bms]) => [name, bms.filter(b =>
      (b.title||'').toLowerCase().includes(q) || (b.url||'').toLowerCase().includes(q)
    )]).filter(([,bms]) => bms.length);
  }

  // Sort items within each folder
  entries = entries.map(([name, bms]) => {
    let sorted = [...bms];
    if (S.bmSort === 'az') sorted.sort((a,b) => (a.title||'').localeCompare(b.title||''));
    else if (S.bmSort === 'za') sorted.sort((a,b) => (b.title||'').localeCompare(a.title||''));
    else if (S.bmSort === 'newest') sorted.sort((a,b) => (b.date||b.id||0) - (a.date||a.id||0));
    else if (S.bmSort === 'oldest') sorted.sort((a,b) => (a.date||a.id||0) - (b.date||b.id||0));
    else if (S.bmSort === 'most') sorted.sort((a,b) => (a.title||'').localeCompare(b.title||'')); // fallback to A-Z
    return [name, sorted];
  });

  if (!entries.length) {
    el('allBookmarksList').innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">No bookmarks match</div></div>';
    return;
  }

  const list = el('allBookmarksList');
  const delIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>`;
  list.innerHTML = entries.map(([folderName, bms]) => `
    <div class="bm-folder${S.bmFolderFilter ? ' open' : ''}">
      <div class="bm-folder-header bm-ws-folder-header" data-folder="${escH(folderName)}">
        <span class="bm-folder-chevron">▶</span>
        <div class="bm-folder-icon-wrap">📁</div>
        <span class="bm-folder-name">${escH(folderName)}</span>
        <span class="bm-folder-count">${bms.length}</span>
      </div>
      <div class="bm-items">
        <div class="bm-items-inner">
          ${bms.map(bm => `
            <div class="bm-item-row">
              <a href="${escH(bm.url)}" class="bm-item" target="_self">
                <div class="bm-favicon-wrap"><img src="${favSrc(bm.url)}" onerror="this.style.display='none'" alt=""></div>
                <div class="bm-item-text">
                  <span class="bm-item-title">${escH(bm.title || bm.url)}</span>
                  <span class="bm-item-url">${escH(getDomain(bm.url))}</span>
                </div>
              </a>
              <button class="bm-action-btn bm-del-btn ws-bm-remove" data-bmid="${escH(bm.id)}" data-tip="Remove">${delIcon}</button>
            </div>`).join('')}
        </div>
      </div>
    </div>`).join('');
  list.querySelectorAll('.bm-ws-folder-header').forEach(h => {
    h.addEventListener('click', () => toggleBmFolder(h.dataset.folder));
  });
  list.querySelectorAll('.ws-bm-remove').forEach(btn => {
    btn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); removeWsBm(btn.dataset.bmid); renderBmForActiveWorkspace(); });
  });
}

// ===== FAB =====
function toggleFab() {
  el('fabBtn').classList.toggle('open');
  el('fabMenu').classList.toggle('open');
}
function closeFab() {
  el('fabBtn').classList.remove('open');
  el('fabMenu').classList.remove('open');
}

// ===== MODALS =====
function openModal(id) { el(id)?.classList.add('open'); }
function closeModal(id) { el(id)?.classList.remove('open'); }
function closeAllModals() { document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open')); _closeCsel(); closeCtxMenu(); }

// Confirm helper
function confirm2(title, msg, onOk, onCancel) {
  el('confirmTitle').textContent = title;
  el('confirmMessage').textContent = msg;
  el('confirmOkBtn').onclick = () => { closeModal('confirmModal'); onOk(); };
  // Wire cancel button to also call onCancel if provided
  const cancelBtns = document.querySelectorAll('#confirmModal [data-modal="confirmModal"]');
  cancelBtns.forEach(btn => {
    btn.onclick = onCancel ? () => { closeModal('confirmModal'); onCancel(); } : null;
  });
  openModal('confirmModal');
}

// ===== TOAST =====
let toastTO;
function showToast(msg, type='') {
  let t = document.getElementById('_toast');
  if (!t) { t=document.createElement('div'); t.id='_toast'; t.className='toast'; document.body.appendChild(t); }
  t.className = `toast ${type}`;
  t.textContent = msg;
  clearTimeout(toastTO);
  requestAnimationFrame(() => t.classList.add('show'));
  toastTO = setTimeout(() => t.classList.remove('show'), 3000);
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Static HTML buttons that had inline onclick removed
  el('refreshFoldersBtn').addEventListener('click', loadBookmarks);
  el('analyticsBtn').addEventListener('click', () => navigateTo('analytics'));
  document.querySelectorAll('.view-back-btn').forEach(btn => btn.addEventListener('click', () => navigateTo('home')));
  el('gridViewBtn').addEventListener('click', () => {
    S.settings.gridView = !S.settings.gridView;
    document.body.classList.toggle('grid-view-mode', S.settings.gridView);
    el('gridViewBtn').classList.toggle('active', S.settings.gridView);
    save();
    renderQuickAccess();
    renderWorkspaceBookmarks();
  });
  el('sidebarToggleBtn').addEventListener('click', () => {
    S.settings.sidebarCollapsed = !S.settings.sidebarCollapsed;
    document.body.classList.toggle('sidebar-collapsed', S.settings.sidebarCollapsed);
    el('sidebarToggleBtn').classList.toggle('active', S.settings.sidebarCollapsed);
    save();
  });
  el('weatherWidget').addEventListener('click', openWeatherLocationModal);

  // Nav
  document.querySelectorAll('.nav-item').forEach(n => {
    n.addEventListener('click', e => { e.preventDefault(); navigateTo(n.dataset.view); });
  });

  // Theme
  el('themeBtn').addEventListener('click', () => {
    applyTheme(S.settings.theme==='dark'?'light':'dark');
    save();
  });

  // Settings open
  el('settingsBtn').addEventListener('click', openSettings);
  el('topSettingsBtn').addEventListener('click', openSettings);
  el('closeSettingsBtn').addEventListener('click', closeSettings);
  el('settingsOverlay').addEventListener('click', closeSettings);
  el('saveSettingsBtn').addEventListener('click', saveSettings);

  // Settings theme toggles
  el('darkThemeBtn').addEventListener('click', () => {
    applyTheme('dark');
    el('darkThemeBtn').classList.add('active');
    el('lightThemeBtn').classList.remove('active');
    save();
  });
  el('lightThemeBtn').addEventListener('click', () => {
    applyTheme('light');
    el('lightThemeBtn').classList.add('active');
    el('darkThemeBtn').classList.remove('active');
    save();
  });

  // Clock format
  el('clock12Btn').addEventListener('click', () => {
    S.settings.clockFormat='12';
    el('clock12Btn').classList.add('active');
    el('clock24Btn').classList.remove('active');
    updateClock();
    save();
  });
  el('clock24Btn').addEventListener('click', () => {
    S.settings.clockFormat='24';
    el('clock24Btn').classList.add('active');
    el('clock12Btn').classList.remove('active');
    updateClock();
    save();
  });
  el('showSecondsToggle').addEventListener('change', () => {
    S.settings.showSeconds = el('showSecondsToggle').checked;
    updateClock();
    save();
  });

  // Card glow toggle
  document.querySelectorAll('#cardGlowGroup .toggle-opt').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('#cardGlowGroup .toggle-opt').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      S.settings.cardGlow = b.dataset.glow;
      applyCardGlow(b.dataset.glow);
      save();
    });
  });

  // Accent colors
  document.querySelectorAll('#accentColors .color-swatch').forEach(s => {
    s.addEventListener('click', () => {
      document.querySelectorAll('#accentColors .color-swatch').forEach(x=>x.classList.remove('active'));
      s.classList.add('active');
      applyAccent(s.dataset.color);
      save();
    });
  });
  // Avatar colors
  document.querySelectorAll('#avatarColors .color-swatch').forEach(s => {
    s.addEventListener('click', () => {
      document.querySelectorAll('#avatarColors .color-swatch').forEach(x=>x.classList.remove('active'));
      s.classList.add('active');
      S.user.avatarColor = s.dataset.color;
      el('userAvatar').style.background = s.dataset.color;
      save();
    });
  });

  // Widget toggles (live preview)
  ['Notes','Tasks','Quote','Timer'].forEach(w => {
    el(`widget${w}Toggle`).addEventListener('change', () => {
      S.settings.widgets[w.toLowerCase()] = el(`widget${w}Toggle`).checked;
      applyWidgetVisibility();
      save();
    });
  });

  // Export/Import/Clear
  el('exportDataBtn').addEventListener('click', exportData);
  el('importDataBtn').addEventListener('click', () => el('importFileInput').click());
  el('importFileInput').addEventListener('change', e => { if(e.target.files[0]) importData(e.target.files[0]); });

  // Granular data clear
  el('clearNotesBtn').addEventListener('click', () => {
    confirm2('Clear All Notes?', 'All notes in the current workspace will be moved to Trash.', () => {
      const data = wsData();
      (data.notes||[]).forEach(n => S.trash.push({...n, _type:'note', _wsId:S.activeWsId, _deletedAt:Date.now()}));
      data.notes = [];
      save(); renderNotesWidget(); renderNotesView(); renderTrash();
      showToast('Notes cleared', 'success');
    });
  });
  el('clearTasksBtn').addEventListener('click', () => {
    confirm2('Clear All Tasks?', 'All tasks in the current workspace will be moved to Trash.', () => {
      const data = wsData();
      (data.tasks||[]).forEach(t => S.trash.push({...t, _type:'task', _wsId:S.activeWsId, _deletedAt:Date.now()}));
      data.tasks = [];
      save(); renderTasksWidget(); renderTrash();
      showToast('Tasks cleared', 'success');
    });
  });
  el('clearQuickAccessBtn').addEventListener('click', () => {
    confirm2('Clear Quick Access?', 'All quick access links in the current workspace will be removed.', () => {
      wsData().quickAccess = [];
      save(); renderQuickAccess();
      showToast('Quick access cleared', 'success');
    });
  });
  el('clearTrashBtn').addEventListener('click', () => {
    confirm2('Empty Trash?', 'All deleted items will be permanently removed.', () => {
      S.trash = []; save(); renderTrash();
      showToast('Trash emptied', 'success');
    });
  });
  el('clearAllDataBtn').addEventListener('click', () => {
    confirm2('Clear All Data', 'This will permanently delete all your notes, tasks, workspaces and settings. This cannot be undone.', () => {
      S.workspaces = DEFAULT_WORKSPACES;
      S.activeWsId = 1;
      S.wsData = {};
      S.weatherLocation = null;
      S.workspaces.forEach(ws => S.wsData[ws.id] = DEFAULT_WS_DATA(ws.id));
      S.trash = [];
      S.settings = { theme:'dark', accentColor:'#7c3aed', clockFormat:'12', showSeconds:true, cardGlow:'glow', widgets:{notes:true,tasks:true,quote:true,timer:true} };
      save();
      renderAll();
      applyTheme('dark');
      applyAccent('#7c3aed');
      applyCardGlow('glow');
      showToast('All data cleared', 'success');
    });
  });

  // Weather location modal
  el('saveWeatherLocationBtn').addEventListener('click', saveWeatherLocation);
  el('detectLocationBtn').addEventListener('click', detectWeatherLocation);
  el('weatherLocationInput').addEventListener('keydown', e => { if(e.key==='Enter') saveWeatherLocation(); });
  el('reDetectWeatherBtn').addEventListener('click', () => {
    closeModal('weatherLocationModal');
    reDetectWeather();
  });

  // Workspaces
  el('addWorkspaceBtn').addEventListener('click', openNewWorkspaceModal);
  el('newWorkspaceTabBtn').addEventListener('click', openNewWorkspaceModal);
  el('manageWorkspacesBtn').addEventListener('click', () => { renderManageWorkspacesList(); openModal('manageWorkspacesModal'); });
  el('manageWsAddBtn').addEventListener('click', () => { closeModal('manageWorkspacesModal'); openNewWorkspaceModal(); });
  document.querySelector('.emoji-picker span')?.classList.add('selected');
  document.querySelectorAll('.emoji-picker span').forEach(s => {
    s.addEventListener('click', () => {
      document.querySelectorAll('.emoji-picker span').forEach(x=>x.classList.remove('selected'));
      s.classList.add('selected');
      el('selectedEmoji').value = s.dataset.emoji;
    });
  });
  el('saveWorkspaceBtn').addEventListener('click', () => {
    const name = el('workspaceName').value.trim();
    const icon = el('selectedEmoji').value;
    if (!name) { showToast('Enter a workspace name', 'error'); return; }
    if (_editingWsId !== null) {
      const ws = S.workspaces.find(w => w.id === _editingWsId);
      if (ws) { ws.name = name; ws.icon = icon; }
      save();
      renderSidebarWorkspaces();
      renderTabsWorkspaces();
      showToast('Workspace updated!', 'success');
    } else {
      addWorkspace(name, icon);
    }
    _editingWsId = null;
    closeModal('workspaceModal');
  });

  // Notes
  el('addNoteBtn').addEventListener('click', openNoteNew);
  el('addNoteViewBtn').addEventListener('click', openNoteNew);
  el('saveNoteBtn').addEventListener('click', saveNote);
  el('deleteNoteBtn').addEventListener('click', deleteNote);
  el('notePinBtn').addEventListener('click', () => { _notePinned = !_notePinned; updateNotePinBtn(); });
  el('noteContent').addEventListener('input', updateNoteWordCount);
  el('noteTagInput').addEventListener('keydown', e => {
    if ((e.key==='Enter'||e.key===','||e.key===' ') && e.target.value.trim()) {
      e.preventDefault();
      const tag = e.target.value.trim().replace(/,$/,'').toLowerCase();
      if (tag && !_noteTags.includes(tag) && _noteTags.length < 8) { _noteTags.push(tag); renderNoteEditorTags(); }
      e.target.value = '';
    }
    if (e.key==='Backspace' && !e.target.value && _noteTags.length) {
      _noteTags.pop(); renderNoteEditorTags();
    }
  });
  el('notesViewSearch').addEventListener('input', e => {
    S.notesViewSearch = e.target.value;
    renderNotesView();
  });

  // Tasks
  el('addTaskBtn').addEventListener('click', () => openModal('taskModal'));
  el('saveTaskBtn').addEventListener('click', () => {
    const t = el('taskInput').value.trim();
    if (!t) { showToast('Enter a task!','error'); return; }
    addTask(t);
    el('taskInput').value='';
    closeModal('taskModal');
  });
  el('taskInput')?.addEventListener('keydown', e => { if(e.key==='Enter') el('saveTaskBtn').click(); });

  // Quick Access
  el('editQuickAccessBtn').addEventListener('click', () => openModal('quickAccessModal'));
  el('saveQuickAccessBtn').addEventListener('click', () => {
    const name = el('qaName').value.trim(), url = el('qaUrl').value.trim();
    if (!name||!url) { showToast('Fill in all fields','error'); return; }
    const fullUrl = url.startsWith('http') ? url : 'https://' + url;
    if (_qaEditId !== null) {
      const d = wsData();
      const item = d.quickAccess.find(q => q.id === _qaEditId);
      if (item) { item.name = name; item.url = fullUrl; }
      save(); renderQuickAccess(); showToast('Updated!', 'success');
    } else {
      addQA(name, fullUrl);
    }
    _qaEditId = null;
    el('qaName').value=''; el('qaUrl').value='';
    closeModal('quickAccessModal');
  });

  // Quote
  el('refreshQuoteBtn').addEventListener('click', refreshQuote);

  // Timer
  el('timerPlayBtn').addEventListener('click', timerPlay);
  el('timerResetBtn').addEventListener('click', () => resetTimer(25));
  document.querySelectorAll('.preset-btn').forEach(b => {
    b.addEventListener('click', () => resetTimer(parseInt(b.dataset.min)));
  });

  // View all folders → bookmarks
  el('viewAllFolders')?.addEventListener('click', e => { e.preventDefault(); navigateTo('bookmarks'); });

  // Profile
  el('userAvatarBtn').addEventListener('click', () => {
    el('profileName').value = S.user.name;
    const gUser = S.googleUser;
    if (gUser) {
      const pic = (gUser.picture) || S.user.googlePicture;
      const name = S.user.googleName || gUser.email;
      const avatarHtml = pic
        ? `<img src="${escH(pic)}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;flex-shrink:0" onerror="this.style.display='none'">`
        : `<div style="width:40px;height:40px;border-radius:50%;background:${S.user.avatarColor||'#7c3aed'};display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#fff;flex-shrink:0">${(name[0]||'G').toUpperCase()}</div>`;
      el('profileGoogleInfo').style.display='flex';
      el('profileGoogleInfo').innerHTML=`${avatarHtml}<div style="min-width:0"><div style="font-weight:600;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escH(name)}</div><div style="color:var(--text-muted);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escH(gUser.email)}</div></div>`;
    }
    openModal('profileModal');
  });
  el('saveProfileBtn').addEventListener('click', () => {
    const n = el('profileName').value.trim();
    if (!n) { showToast('Enter a name','error'); return; }
    S.user.name = n;
    updateAvatarDisplay();
    updateGreeting();
    save();
    closeModal('profileModal');
    showToast('Profile updated!','success');
  });

  // FAB
  el('fabBtn').addEventListener('click', e => { e.stopPropagation(); toggleFab(); });
  el('fabAddNote').addEventListener('click', () => { closeFab(); openNoteNew(); });
  el('fabAddTask').addEventListener('click', () => { closeFab(); openModal('taskModal'); });
  el('fabAddQuickAccess').addEventListener('click', () => { closeFab(); openModal('quickAccessModal'); });
  el('fabAddBookmark').addEventListener('click', () => { closeFab(); openAddBookmarkModal(); });
  document.addEventListener('click', e => {
    if (!el('fabBtn').contains(e.target) && !el('fabMenu').contains(e.target)) closeFab();
  });

  // Trash
  el('emptyTrashBtn').addEventListener('click', emptyTrash);

  // Modal close buttons
  document.querySelectorAll('[data-modal]').forEach(b => b.addEventListener('click', () => closeModal(b.dataset.modal)));
  document.querySelectorAll('.modal-overlay').forEach(o => o.addEventListener('click', e => { if(e.target===o) o.classList.remove('open'); }));

  // Bookmark / folder add buttons in bookmarks view header
  el('addBookmarkBtn').addEventListener('click', () => openAddBookmarkModal());
  el('addFolderBtn').addEventListener('click', () => openAddFolderModal());

  // Import Chrome Bookmarks (settings sidebar)
  el('importChromeBookmarksBtn').addEventListener('click', importAllChromeBookmarks);

  // Workspace bookmark chooser
  el('addWsBmBtn').addEventListener('click', openWsBmChooser);
  el('chooserFolderBtn').addEventListener('click', () => { closeModal('wsBmChooserModal'); openWsFolderEditModal(null); });
  el('chooserBookmarkBtn').addEventListener('click', () => { closeModal('wsBmChooserModal'); openWsBookmarkEditModal(_wsBmDefaultFolder, null); });

  // Workspace folder create/edit modal
  el('wsFolderEditSaveBtn').addEventListener('click', saveWsFolderEdit);
  el('wsFolderEditNameInput').addEventListener('keydown', e => { if (e.key === 'Enter') el('wsFolderEditSaveBtn').click(); });

  // Custom folder dropdown toggle
  el('wsBmFolderBtn').addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = el('wsBmFolderBtn').classList.toggle('open');
    el('wsBmFolderDropdown').classList.toggle('open', isOpen);
  });
  document.addEventListener('click', e => {
    if (!el('wsBmFolderWrap')?.contains(e.target)) _closeCsel();
  });

  // Workspace bookmark add/edit modal
  el('wsBmEditSaveBtn').addEventListener('click', saveWsBookmarkEdit);
  el('wsBmEditDeleteBtn').addEventListener('click', () => {
    if (!_wsBmEditId) return;
    confirm2('Delete bookmark?', 'This bookmark will be permanently removed.', async () => {
      const d = wsData();
      d.importedBookmarks = (d.importedBookmarks || []).filter(b => b.id !== _wsBmEditId);
      await save();
      closeModal('wsBookmarkEditModal');
      renderWorkspaceBookmarks();
      renderSidebarFolders();
      showToast('Bookmark deleted', 'success');
    });
  });
  el('wsBmEditUrl').addEventListener('keydown', e => { if (e.key === 'Enter') el('wsBmEditSaveBtn').click(); });

  // Bookmark edit modal
  el('bmEditSaveBtn').addEventListener('click', saveBookmarkEdit);
  el('bmEditDeleteBtn').addEventListener('click', () => _bmEditId && deleteChromeBm(_bmEditId));
  el('bmEditName').addEventListener('keydown', e => { if (e.key==='Enter') el('bmEditSaveBtn').click(); });

  // Folder edit modal
  el('folderEditSaveBtn').addEventListener('click', saveFolderEdit);
  el('folderEditName').addEventListener('keydown', e => { if (e.key==='Enter') el('folderEditSaveBtn').click(); });

  // History search
  el('historySearch').addEventListener('input', debounce(e => loadHistory(e.target.value), 350));

  // Bookmark search
  el('bookmarkSearch').addEventListener('input', () => renderBmForActiveWorkspace());

  // Bookmark sort
  el('bmSortSelect').addEventListener('change', e => {
    S.bmSort = e.target.value;
    if (S.allBookmarks && S.allBookmarks.length) renderAllBookmarks(S.allBookmarks);
    else renderBmForActiveWorkspace();
  });

  // Init timer
  renderTimerDisplay();
}

// Make functions global (needed for inline onclick)
window.setActiveWorkspace       = setActiveWorkspace;
window.deleteWorkspace          = deleteWorkspace;
window.openEditWorkspaceModal   = openEditWorkspaceModal;
window.openNewWorkspaceModal    = openNewWorkspaceModal;
window.openFolderModal       = openFolderModal;
window.toggleBmFolder        = toggleBmFolder;
window.closeModal            = closeModal;
window.openNoteEdit          = openNoteEdit;
window.deleteNoteById        = deleteNoteById;
window.toggleTask            = toggleTask;
window.deleteTask            = deleteTask;
window.removeQA              = removeQA;
window.restoreItem           = restoreItem;
window.hideSearch            = hideSearch;
window.openCmdPalette        = openCmdPalette;
window.closeCmdPalette       = closeCmdPalette;
window.navigateTo            = navigateTo;
window.showToast             = showToast;
window.openWeatherLocationModal = openWeatherLocationModal;
window.openAddBookmarkModal  = openAddBookmarkModal;
window.openEditBookmarkModal = openEditBookmarkModal;
window.deleteChromeBm        = deleteChromeBm;
window.openAddFolderModal    = openAddFolderModal;
window.openEditFolderModal   = openEditFolderModal;
window.deleteChromeFolder    = deleteChromeFolder;
window.removeWsBm               = removeWsBm;
window.openWsBmChooser          = openWsBmChooser;
window.openWsFolderEditModal    = openWsFolderEditModal;
window.openWsBookmarkEditModal  = openWsBookmarkEditModal;
window.removeWsFolder           = removeWsFolder;