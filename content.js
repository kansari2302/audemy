// content.js (optimized)

chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
  if (req.action !== 'getCourseLinks') return;
  try {
    // Collect likely offer links/clickables
    const q = (s) => Array.from(document.querySelectorAll(s));
    let anchors = q('a').filter(a => {
      const href = a.getAttribute('href');
      if (!href) return false;
      try {
        const u = new URL(href, location.href);
        const path = u.pathname.toLowerCase();
        if (u.hash) return false;
        if (path === '/courses' || path.startsWith('/courses?')) return false;
        if (/\/(login|signup|register|category|categories|blog|about|contact)\b/i.test(path)) return false;
        return /(^|\.)real\.discount$/i.test(u.hostname) && /(\/offer\/|\/go\/|\/deal\/|\/coupon\/|\/course\/)/i.test(path);
      } catch { return false; }
    });
    if (anchors.length === 0) anchors = q('a[href*="/offer/"]');
    const extras = q('[data-href*="/offer/"], [data-url*="/offer/"], [onclick*="real.discount" i]');

    // Nearest card container for sponsorship scope
    const card = (el) => {
      let n = el, c = 0; while (n && n !== document.body && c++ < 8) { const t=(n.tagName||'').toLowerCase(); if (t==='li'||t==='article'||t==='section'||t==='div') return n; n=n.parentElement; }
      return el.parentElement || el;
    };
    // Sponsored badge within container only
    const isSponsored = (root) => {
      if (!root || !root.querySelector) return false;
      if (root.matches('[data-sponsored], [data-promoted], [class*="sponsor" i]')) return true;
      if (root.querySelector('[data-sponsored], [data-promoted], [class*="sponsor" i]')) return true;
      const cand = root.querySelectorAll('span,small,em,strong,i,b,div,p');
      for (let i=0;i<cand.length && i<150;i++){const el=cand[i];const txt=(el.innerText||el.textContent||'').trim();if(/\bSponsored\b/i.test(txt)) return true;}
      return false;
    };
    // Resolve URL from element
    const urlOf = (el) => {
      try {
        if (!el) return '';
        const get = (e) => e && (e.getAttribute('href')||e.href||e.getAttribute('data-href')||e.getAttribute('data-url')||'');
        let href = get(el);
        if ((!href||href==='#') && el.parentElement) href = get(el.parentElement);
        if (!href){const oc=el.getAttribute&&el.getAttribute('onclick'); if (oc){const m=oc.match(/https?:\/\/[\w\.-]+\S*/i); if(m) href=m[0];}}
        return href ? new URL(href, location.href).href : '';
      } catch { return ''; }
    };
    // Build candidates and filter out sponsored
    const candidates = (anchors.length?anchors:extras).filter(el => !isSponsored(card(el)) && !isSponsored(el));
    // Dedupe and validate
    const seen = new Set();
    let links = candidates.map(urlOf).filter(h => {
      if (!h || seen.has(h)) return false; seen.add(h);
      try { const u=new URL(h); return /(^|\.)real\.discount$/i.test(u.hostname) && /(\/offer\/|\/go\/|\/deal\/|\/coupon\/|\/course\/)/i.test(u.pathname.toLowerCase()); } catch { return false; }
    });
    if (links.length===0 && (anchors.length||extras.length)) { // fallback if over-filtered
      for (const el of (anchors.length?anchors:extras)) {
        const h=urlOf(el); if (h && !seen.has(h)) { try{const u=new URL(h); if(/(^|\.)real\.discount$/i.test(u.hostname)&&/(\/offer\/|\/go\/|\/deal\/|\/coupon\/|\/course\/)/i.test(u.pathname.toLowerCase())){links.push(u.href); seen.add(u.href);} }catch{}}
      }
    }
    setTimeout(()=>sendResponse({ courseLinks: links }),0);
  } catch {
    setTimeout(()=>sendResponse({ courseLinks: [] }),0);
  }
  return true;
});
