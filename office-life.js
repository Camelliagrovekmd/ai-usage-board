// AI 동백숲한의원 운영실 - 직원 생활 엔진 (게임식 2D 프레임)
// 좌표는 모두 원본 그림 1672×941 기준. office-view.js가 렌더 후 OF_LIFE.mount()를 부름.
(function () {
  const W0 = 1672, H0 = 941;
  const P = (v, t) => (v / t * 100).toFixed(3) + '%';
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 자리별 설정 (자동 측정 + 확인). seat: 자세별 [left, top, 높이], stand: 일어선 발 위치 [x, y, 키]
  const CFG = {"boss":{"dir":"poses/boss/","seat":{"type1":[139.4,278,116.3],"type2":[138.3,278,116],"sleep":[137.9,306.4,95.5],"startle":[142.3,256.5,116.3]},"above":["sleep"],"ovs":[["poses/boss/ov.webp",[110,238,295,422]]],"stand":[300,495,90.7],"standImg":"poses/boss/walk1.webp","boss":true},"herb":{"dir":"poses/herb/","seat":{"type1":[601.3,162,125.2],"type2":[600.8,162,125.8],"sleep":[584.7,187.3,106.7],"doze":[610.7,138.3,129.2],"startle":[597.6,151.6,115.9],"stretch":[612.9,152.7,114.9]},"above":["sleep"],"ovs":[["poses/herb/ov.webp",[565,128,755,288]]],"stand":[770,360,97.7],"standImg":"sprites/stand_herb.webp"},"edu":{"dir":"poses/edu/","seat":{"type1":[926.5,245,124.5],"type2":[925.6,245,125.7],"sleep":[946.7,283.7,93.3],"doze":[928.8,236.5,117.9],"startle":[942.9,231.3,123.1],"stretch":[928.6,232.7,121.7]},"above":["sleep"],"ovs":[["poses/edu/ov.webp",[902,198,1062,362]]],"stand":[1090,480,97.1],"standImg":"sprites/stand_edu.webp"},"col":{"dir":"poses/col/","seat":{"type1":[390.7,440,131.3],"type2":[391.9,440,129.1],"sleep":[369.9,475.3,104.1],"doze":[401.6,442.4,119.9],"startle":[402,440.2,122.2],"stretch":[395,446,116.3]},"above":["sleep"],"ovs":[["poses/col/ov.webp",[352,392,522,568]]],"stand":[350,482,102.4],"standImg":"sprites/stand_col.webp"},"ops":{"dir":"poses/ops/","seat":{"type1":[999.2,458,117.9],"type2":[1000.1,458,117],"sleep":[996,502.1,80.3],"doze":[1012.2,447.3,110.3],"startle":[1002.8,450,107.5],"stretch":[998.8,452.5,105.1]},"above":["sleep"],"ovs":[["poses/ops/ov.webp",[978,418,1162,578]]],"stand":[975,530,92],"standImg":"sprites/stand_ops.webp"},"news":{"dir":"poses/news/","seat":{"type1":[1384.9,505,124.1],"type2":[1388.4,505,123.5],"sleep":[1409.5,544.2,92.2],"doze":[1390.5,491.7,116.8],"startle":[1400.9,486,122.5],"stretch":[1395,487.6,120.9]},"above":["sleep"],"ovs":[["poses/news/ov.webp",[1368,462,1522,638]]],"stand":[1300,560,96.8],"standImg":"sprites/stand_news.webp"},"vid":{"dir":"poses/vid/","seat":{"type1":[971.5,592,144.8],"type2":[971.1,592,144],"sleep":[975.4,643.9,102.4],"doze":[968.4,580.3,141.4],"startle":[965.9,582.9,138.7],"stretch":[981.5,585.9,135.7]},"above":["sleep"],"ovs":[["poses/vid/ov.webp",[938,542,1152,742]]],"stand":[1160,650,112.9],"standImg":"sprites/stand_vid.webp"},"diet":{"dir":"poses/diet/","seat":{"type1":[636.5,633,136.9],"type2":[637.4,633,136.6],"sleep":[627.5,682.3,96],"doze":[650.8,616.1,130.3],"startle":[643.4,614,132.4],"stretch":[629.5,614,132.4]},"above":["sleep"],"ovs":[["poses/diet/ov.webp",[632,582,822,768]]],"stand":[780,665,106.8],"standImg":"sprites/stand_diet.webp"},"tang":{"dir":"poses/tang/","seat":{"type1":[1189.9,645,129.5],"type2":[1194.7,645,124.5],"sleep":[1197.2,683.4,100.6],"doze":[1189.3,622.9,124.8],"startle":[1188.2,623.6,124.2],"stretch":[1199.9,628.6,119.1]},"above":["sleep"],"ovs":[["poses/tang/ov.webp",[1158,602,1358,812]]],"stand":[1440,720,101],"standImg":"sprites/stand_tang.webp"},"ctl":{"dir":"poses/ctl/","seat":{"type1":[648,372,126],"type2":[648,370,127],"sleep":[646,404,100],"doze":[656,366,116],"startle":[642,366,114],"stretch":[640,362,118]},"above":["type1","type2","sleep"],"ovs":[["poses/ctl/ov_table.webp",[598,440,744,560]],["poses/ctl/ov_monitor.webp",[740,406,812,505],4]],"stand":[560,482,96],"standImg":"sprites/stand_ctl.webp"}};
  const HUB = {"H1":[330,490],"H2":[520,470],"H3":[560,385],"H4":[720,625],"H5":[930,580],"H6":[1100,485],"H7":[1290,560],"H8":[1170,655],"H9":[1440,730],"H10":[780,360],"H12":[940,495],"H13":[1230,470],"H14":[520,745]};
  const EDGES = [["H1","H2"],["H2","H3"],["H1","H3"],["H3","H10"],["H10","H12"],["H12","H5"],["H5","H4"],["H4","H14"],["H12","H6"],["H6","H13"],["H13","H7"],["H7","H8"],["H5","H8"],["H8","H9"]];
  const OUTINGS = [[560,385,"창밖 구경"],[880,318,"화이트보드"],[930,580,"수다"],[330,742,"소파에서 차 한잔"],[1440,730,"물 한잔"]];
  const BOSS_OUT = {"tea":[560,385,"약재실에서 차 한잔"],"coffee":[1440,730,"원외탕전실 커피"],"exit":[330,490]};
  const BOSS_IDLE_MS = 30 * 60e3;   // 지시 없이 30분 → 진료중
  const depth = y => 0.7 + 0.5 * y / H0;
  // 통로 길찾기: 가장 가까운 통로점끼리 최단 경로
  const near = p => Object.keys(HUB).reduce((b, k) => Math.hypot(HUB[k][0] - p[0], HUB[k][1] - p[1]) < Math.hypot(HUB[b][0] - p[0], HUB[b][1] - p[1]) ? k : b, 'H1');
  function route(a, b) { const s = near(a), t = near(b); const dist = { [s]: 0 }, prev = {}, todo = new Set(Object.keys(HUB));
    while (todo.size) { let u = null; for (const k of todo) if (dist[k] != null && (u == null || dist[k] < dist[u])) u = k; if (u == null || u === t) break; todo.delete(u);
      for (const [x, y] of EDGES) { const v = x === u ? y : y === u ? x : null; if (!v || !todo.has(v)) continue; const d = dist[u] + Math.hypot(HUB[u][0] - HUB[v][0], HUB[u][1] - HUB[v][1]); if (dist[v] == null || d < dist[v]) { dist[v] = d; prev[v] = u; } } }
    const path = []; let k = t; if (dist[t] == null) return [a, b]; while (k) { path.unshift(HUB[k]); k = prev[k]; }
    const pts = [a, ...path, b].filter((p, i, arr) => i === 0 || Math.hypot(p[0] - arr[i - 1][0], p[1] - arr[i - 1][1]) > 4);
    if (pts.length > 2 && Math.hypot(pts[1][0] - a[0], pts[1][1] - a[1]) + Math.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1]) > 1.6 * Math.hypot(pts[2][0] - a[0], pts[2][1] - a[1])) pts.splice(1, 1);
    return pts; }

  const css = `
  .lf{position:absolute;inset:0;pointer-events:none}
  .lf img{position:absolute;user-select:none;-webkit-user-drag:none}
  .lf .lf-pose,.lf .lf-walk{pointer-events:auto;cursor:pointer}
  .lf .lf-walk{transform:translate(-50%,-100%);filter:drop-shadow(0 4px 3px rgba(60,40,10,.25))}
  .lf .lf-walk.flip{transform:translate(-50%,-100%) scaleX(-1)}
  .lf .lf-z{position:absolute;font-weight:900;color:#6f8399;text-shadow:0 1px 2px #fff;pointer-events:none;font-size:14px}
  .lf .lf-z span{position:absolute;opacity:0;animation:lfZ 3.2s linear infinite}.lf .lf-z span:nth-child(2){animation-delay:1.05s;font-size:12px}.lf .lf-z span:nth-child(3){animation-delay:2.1s;font-size:10px}
  @keyframes lfZ{0%{opacity:0;transform:translate(0,0)}15%{opacity:1}100%{opacity:0;transform:translate(16px,-30px)}}
  .lf .lf-bang{position:absolute;transform:translate(-50%,-100%);background:#fff;border:2px solid #e39b2d;color:#c8463d;font-weight:900;border-radius:12px;padding:0 9px;font-size:16px;pointer-events:none;animation:lfPop .35s ease-out}
  .lf .lf-say{position:absolute;transform:translate(-50%,-100%);background:#fff;border:1px solid #d9e7dd;color:#1f6b43;font-weight:700;border-radius:10px;padding:2px 8px;font-size:11px;white-space:nowrap;pointer-events:none;box-shadow:0 2px 8px rgba(0,0,0,.12)}
  @keyframes lfPop{0%{transform:translate(-50%,-80%) scale(.4)}70%{transform:translate(-50%,-105%) scale(1.15)}100%{transform:translate(-50%,-100%) scale(1)}}
  .lf .lf-sign{position:absolute;transform:translate(-50%,-100%);background:#2b2a26;color:#f3d9a4;font-weight:800;border-radius:8px;padding:2px 9px;font-size:12px;white-space:nowrap;pointer-events:none;box-shadow:0 2px 6px rgba(0,0,0,.2)}
  @media (max-width:640px){.lf .lf-z,.lf .lf-say{display:none}}`;
  function ensureCss() { if (document.getElementById('lf-css')) return; const s = document.createElement('style'); s.id = 'lf-css'; s.textContent = css; document.head.appendChild(s); }

  function Agent(root, id, cfg, A, ver, working, label, bossLastAt) {
    const box = document.createElement('div'); box.className = 'lf'; root.appendChild(box);
    const mk = (cls, z) => { const i = document.createElement('img'); i.className = cls; i.style.zIndex = z; i.alt = ''; box.appendChild(i); return i; };
    const place = (img, b) => { img.style.left = P(b[0], W0); img.style.top = P(b[1], H0); img.style.width = P(b[2] - b[0], W0); img.style.height = P(b[3] - b[1], H0); };
    const pose = mk('lf-pose', 1);
    for (const [s, b, z] of cfg.ovs) { const o = mk('lf-ov', z || 2); o.src = A + s + ver; place(o, b); }
    const walk = mk('lf-walk', 5);
    const zz = document.createElement('div'); zz.className = 'lf-z'; zz.innerHTML = '<span>Z</span><span>z</span><span>z</span>'; zz.style.display = 'none'; box.appendChild(zz);
    const fx = document.createElement('div'); fx.style.cssText = 'position:absolute;inset:0;z-index:6'; box.appendChild(fx);
    const has = k => !!cfg.seat[k];
    const frames = {}; for (const k of [...Object.keys(cfg.seat), 'walk1', 'walk2', ...(cfg.boss ? ['tea', 'coffee'] : [])]) { const im = new Image(); im.src = A + cfg.dir + k + '.webp' + ver; frames[k] = im.src; }
    const standSrc = A + cfg.standImg + ver;
    const S = cfg.boss ? [cfg.stand[0], cfg.stand[1], cfg.stand[2] * 1.3] : cfg.stand, hAt = y => S[2] * depth(y) / depth(S[1]);
    let timers = [], mode = working ? 'work' : 'rest', busy = false, alive = true, away = false, raf = 0;
    const later = (fn, ms) => { const t = setTimeout(() => { if (alive) fn(); }, ms); timers.push(t); return t; };
    const clear = () => { timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(raf); };
    const headAt = () => { const t = cfg.seat.type1; return [t[0] + t[2] * 0.42, t[1] - 4]; };

    function sit(k) {
      if (!has(k)) k = k === 'doze' ? 'sleep' : 'type1';
      const [l, t, h] = cfg.seat[k]; const im = new Image(); im.src = frames[k];
      const set = () => { const w = h * (im.naturalWidth / im.naturalHeight || 1); pose.src = frames[k]; pose.style.left = P(l, W0); pose.style.top = P(t, H0); pose.style.height = P(h, H0); pose.style.width = P(w, W0); pose.style.zIndex = cfg.above.includes(k) ? 3 : 1; pose.style.display = ''; pose.style.opacity = 1; };
      im.complete ? set() : (im.onload = set);
      walk.style.display = 'none';
      const sleepy = k === 'sleep' || k === 'doze'; zz.style.display = sleepy ? '' : 'none';
      if (sleepy) { zz.style.left = P(l + h * 0.75, W0); zz.style.top = P(t - 6, H0); }
    }
    function bubble(cls, text, at, ms) { const b = document.createElement('div'); b.className = cls; b.textContent = text; b.style.left = P(at[0], W0); b.style.top = P(at[1], H0); fx.appendChild(b); if (ms) later(() => b.remove(), ms); return b; }
    const say = (text, ms = 2500, at) => bubble('lf-say', text, at || headAt(), ms);
    const bang = at => bubble('lf-bang', '!', at || headAt(), 1500);

    // 통로를 따라 걷기
    function walkPath(pts, done) {
      pose.style.display = 'none'; zz.style.display = 'none'; walk.style.display = ''; walk.style.opacity = 1;
      let seg = 0, f = -1;
      const go = () => { if (seg >= pts.length - 1) { done && done(); return; } const a = pts[seg], b = pts[seg + 1]; const dur = Math.max(500, Math.hypot(b[0] - a[0], b[1] - a[1]) / 80 * 1000); walk.classList.toggle('flip', b[0] < a[0]); const t0 = performance.now();
        const step = () => { if (!alive) return; const now = performance.now(); const t = Math.min(1, (now - t0) / dur); const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
          walk.style.left = P(x, W0); walk.style.top = P(y, H0); walk.style.height = P(hAt(y), H0);
          const nf = Math.floor(now / 230) % 2; if (nf !== f) { f = nf; walk.src = frames[f ? 'walk2' : 'walk1']; }
          if (t < 1) raf = requestAnimationFrame(step); else { seg++; go(); } }; raf = requestAnimationFrame(step); };
      go();
    }
    const walkTo = (from, to, done) => walkPath(route(from, to), done);
    function standAt(p, src) { walk.src = src || standSrc; walk.classList.remove('flip'); walk.style.left = P(p[0], W0); walk.style.top = P(p[1], H0); walk.style.height = P(hAt(p[1]), H0); walk.style.display = ''; }
    const top = p => [p[0], p[1] - hAt(p[1]) - 4];
    // 다녀오기 (쉬는 시간 산책 / 원장님 차·커피)
    function trip(o, img, then) { busy = true; sit(has('stretch') ? 'stretch' : 'type1');
      later(() => walkTo(S, o, () => { standAt(o, img); say(o[2], 3000, top(o)); later(() => walkTo(o, S, () => { busy = false; then(); }), rnd(9000, 16000)); }), 1200); }

    // 일하는 중: 타이핑 (원장님은 다다다 빠르게) + 가끔 기지개
    function workLoop() { if (mode !== 'work' || busy || away) return; let n = 0; const fast = cfg.boss;
      const tick = () => { if (mode !== 'work' || busy || away) return; sit(n++ % 2 ? 'type2' : 'type1'); later(tick, fast ? rnd(90, 170) : rnd(260, 620)); }; tick();
      if (cfg.boss) { later(() => { if (busy || away) return; clear(); bossBreak(); }, rnd(25000, 50000)); return; }
      if (has('stretch')) later(() => { if (mode !== 'work' || busy) return; busy = true; clear(); sit('stretch'); later(() => { busy = false; workLoop(); }, 1800); }, rnd(14000, 26000)); }
    // 원장님 쉬는 시간: 엎드려 쉬기 / 약재실 차 / 원외탕전 커피
    function bossBreak() { if (away) return; const r = Math.random();
      if (r < 0.4) { sit('sleep'); later(() => { sit('type1'); later(workLoop, 1200); }, rnd(9000, 16000)); }
      else if (r < 0.7) trip(BOSS_OUT.tea, frames.tea, workLoop);
      else trip(BOSS_OUT.coffee, frames.coffee, workLoop); }
    // 직원 쉬는 중: 엎드려 자기 / 졸기 / 기지개 / 잠깐 산책
    function restLoop() { if (mode !== 'rest' || busy) return; const r = Math.random();
      if (r < 0.38) { sit('sleep'); later(restLoop, rnd(14000, 26000)); }
      else if (r < 0.7) { sit('doze'); later(restLoop, rnd(12000, 22000)); }
      else if (r < 0.8) { sit('stretch'); later(() => { sit('type1'); later(restLoop, rnd(3000, 6000)); }, 1900); }
      else trip(pick(OUTINGS), null, () => { sit('doze'); later(restLoop, rnd(8000, 14000)); }); }

    // 원장님: 30분 지시 없으면 "진료중" 말풍선 띄우고 자리 비우기
    let sign = null;
    const idleMs = () => Date.now() - (Date.parse(window.__ofBossLastAt || bossLastAt || 0) || 0);
    function leave() { if (away) return; away = true; clear(); busy = true; sit('type1'); { const t = cfg.seat.type1; bubble('lf-say', '진료 보러 갑니다', [t[0] + t[2] * 0.8, t[1] + t[2] * 0.25], 2600); }
      later(() => walkTo(S, BOSS_OUT.exit, () => { walk.style.transition = 'opacity .8s'; walk.style.opacity = 0; later(() => { walk.style.display = 'none'; walk.style.transition = ''; busy = false; showSign(); }, 850); }), 2200); }
    function showSign() { if (sign) return; const t = cfg.seat.type1; sign = bubble('lf-sign', '진료중', [t[0] + t[2] * 0.42, t[1] + t[2] * 0.35]); }
    function comeBack() { if (!away) return; away = false; clear(); if (sign) { sign.remove(); sign = null; } busy = true; walk.style.opacity = 1;
      walkTo(BOSS_OUT.exit, S, () => { busy = false; mode = 'work'; sit('type1'); say('다녀왔어요', 2000); later(workLoop, 1500); }); }
    function bossCheck() { const idle = idleMs() > BOSS_IDLE_MS; if (idle && !away && !busy) leave(); else if (!idle && away) comeBack(); }

    function start() { clear(); busy = false; if (reduce) { sit(mode === 'work' ? 'type1' : 'doze'); return; } mode === 'work' ? workLoop() : restLoop(); }

    const poke = () => { if (away) { say('진료 중이에요', 2000, [cfg.seat.type1[0] + cfg.seat.type1[2] * 0.42, cfg.seat.type1[1]]); return; }
      if (busy && walk.style.display !== 'none') { bang([parseFloat(walk.style.left) / 100 * W0, parseFloat(walk.style.top) / 100 * H0 - hAt(parseFloat(walk.style.top) / 100 * H0) - 6]); return; }
      clear(); busy = true; sit('startle'); bang();
      later(() => { busy = false; if (mode === 'rest') { sit('type1'); say(label ? label + ' 여기 있어요!' : '깼어요!', 2200); later(() => { sit('type2'); later(restLoop, 2600); }, 700); } else workLoop(); }, 1400); };
    pose.addEventListener('click', e => { e.stopPropagation(); poke(); });
    walk.addEventListener('click', e => { e.stopPropagation(); poke(); });

    let iv = 0;
    if (cfg.boss) { mode = 'work'; if (idleMs() > BOSS_IDLE_MS) { away = true; showSign(); } else start(); iv = setInterval(() => alive && bossCheck(), 20000); }
    else start();
    const outing = (i) => { if (busy || away) return; clear(); const o = OUTINGS[i ?? Math.floor(Math.random() * OUTINGS.length)]; trip(o, null, () => { sit('doze'); later(restLoop, rnd(8000, 14000)); }); };
    return { outing, bossBreak: k => { if (!cfg.boss || busy || away) return; clear(); k === 'sleep' ? (sit('sleep'), later(() => { sit('type1'); later(workLoop, 1200); }, 8000)) : trip(BOSS_OUT[k], frames[k], workLoop); }, check: bossCheck,
      setMode(w) { if (cfg.boss) return; const m = w ? 'work' : 'rest'; if (m === mode) return; mode = m; start(); }, destroy() { alive = false; clear(); clearInterval(iv); box.remove(); } };
  }

  const live = {};
  window.OF_LIFE = {
    has: id => !!CFG[id],
    outing: (id, i) => live[id] && live[id].outing(i),
    boss: k => live.boss && live.boss.bossBreak(k),
    bossCheck: () => live.boss && live.boss.check(),
    mount(stage, o, A, ver) {
      ensureCss(); if (!stage) return; const layer = stage.querySelector('.of-anim') || stage;
      for (const k of Object.keys(live)) { live[k].destroy(); delete live[k]; }
      for (const d of o.depts || []) { if (!CFG[d.id]) continue; live[d.id] = Agent(layer, d.id, CFG[d.id], A || 'office/', ver || '', d.status === '일하는 중', d.boss ? '' : d.name, d.boss ? (d.lastAt || o.generatedAt) : null); }
    }
  };
})();
