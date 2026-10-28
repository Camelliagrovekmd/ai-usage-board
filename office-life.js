// AI 동백숲한의원 운영실 - 직원 생활 엔진 (게임식 2D 프레임)
// 좌표는 모두 원본 그림 1672×941 기준. office-view.js가 렌더 후 OF_LIFE.mount()를 부름.
(function () {
  const W0 = 1672, H0 = 941;
  const P = (v, t) => (v / t * 100).toFixed(3) + '%';
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 자리별 설정 (자동 측정 + 확인). seat: 자세별 [left, top, 높이], stand: 일어선 발 위치 [x, y, 키]
  const CFG = {"boss":{"dir":"poses/boss/","seat":{"type1":[145.5,292,102.3],"type2":[144.5,292,102.1],"sleep":[144.2,316.9,84],"startle":[150.7,279,96.4],"key1":[145.5,292,102.3],"key2":[145.5,292,102.3],"key3":[145.5,292,102.3],"key4":[145.5,292,102.3]},"above":["sleep"],"ovs":[["poses/boss/ov.webp",[110,238,295,422]]],"stand":[300,495,139.2],"standImg":"poses/boss/walk1.webp","boss":true},"herb":{"dir":"poses/herb/","seat":{"type1":[614.6,189.5,97.7],"type2":[614.3,189.5,98.1],"sleep":[602.9,211.2,81.3],"doze":[623.4,174.2,97.7],"startle":[615.6,188.5,83.4],"stretch":[625.9,186.5,85.4]},"above":["sleep"],"ovs":[["poses/herb/ov.webp",[565,128,755,288]]],"stand":[770,360,128.8],"standImg":"sprites/stand_herb.webp"},"edu":{"dir":"poses/edu/","seat":{"type1":[926.5,245,124.5],"type2":[925.6,245,125.7],"sleep":[946.7,283.7,93.3],"doze":[930.9,241.7,112.7],"startle":[942.9,231.3,123.1],"stretch":[936.4,250.2,104.2]},"above":["sleep"],"ovs":[["poses/edu/ov.webp",[902,198,1062,362]]],"stand":[1090,480,169.9],"standImg":"sprites/stand_edu.webp"},"col":{"dir":"poses/col/","seat":{"type1":[390.7,440,131.3],"type2":[391.9,440,129.1],"sleep":[369.9,475.3,104.1],"doze":[403,446,116.3],"startle":[402,440.2,122.2],"stretch":[396.8,450.5,111.8]},"above":["sleep"],"ovs":[["poses/col/ov.webp",[352,392,522,568]]],"stand":[350,482,159.1],"standImg":"sprites/stand_col.webp"},"ops":{"dir":"poses/ops/","seat":{"type1":[1007.2,475.7,100.2],"type2":[1008,475.7,99.5],"sleep":[1004.5,513.2,68.3],"doze":[1018.3,466.6,93.8],"startle":[1012.6,473.5,86.8],"stretch":[1008,473.3,87]},"above":["sleep"],"ovs":[["poses/ops/ov.webp",[978,418,1162,578]]],"stand":[975,530,107.6],"standImg":"sprites/stand_ops.webp"},"news":{"dir":"poses/news/","seat":{"type1":[1391.7,519.9,109.2],"type2":[1394.8,519.9,108.7],"sleep":[1413.3,554.4,81.1],"doze":[1396.7,508.5,102.5],"startle":[1405.8,503.2,107.8],"stretch":[1403,509.9,101.1]},"above":["sleep"],"ovs":[["poses/news/ov.webp",[1368,462,1522,638]]],"stand":[1300,560,142.5],"standImg":"sprites/stand_news.webp"},"vid":{"dir":"poses/vid/","seat":{"type1":[989.9,629.6,107.2],"type2":[989.6,629.6,106.6],"sleep":[992.7,668.1,75.8],"doze":[987.6,621,104.6],"startle":[987.2,625.9,99.7],"stretch":[997.3,625.1,100.4]},"above":["sleep"],"ovs":[["poses/vid/ov.webp",[938,542,1152,742]]],"stand":[1160,650,151.2],"standImg":"sprites/stand_vid.webp"},"diet":{"dir":"poses/diet/","seat":{"type1":[655.7,668.6,101.3],"type2":[656.4,668.6,101.1],"sleep":[649,705.1,71],"doze":[666.3,656.1,96.4],"startle":[661.8,656.5,96],"stretch":[651.5,656.5,96]},"above":["sleep"],"ovs":[["poses/diet/ov.webp",[632,582,822,768]]],"stand":[780,665,133.1],"standImg":"sprites/stand_diet.webp"},"tang":{"dir":"poses/tang/","seat":{"type1":[1201.8,670.9,103.6],"type2":[1205.6,670.9,99.6],"sleep":[1207.6,701.6,80.5],"doze":[1204.6,679.1,93.1],"startle":[1206.6,684.9,87.4],"stretch":[1212.1,681.7,90.6]},"above":["sleep"],"ovs":[["poses/tang/ov.webp",[1158,602,1358,812]]],"stand":[1300,728,160.2],"standImg":"sprites/stand_tang.webp"},"ctl":{"dir":"poses/ctl/","seat":{"type1":[660.5,396,102],"type2":[660.4,394.2,102.9],"sleep":[658.5,422.6,81],"doze":[667,389.3,93.9],"startle":[655,389.2,92.3],"stretch":[653.4,385.9,95.5]},"above":["type1","type2","sleep"],"ovs":[["poses/ctl/ov_table.webp",[598,440,744,560]],["poses/ctl/ov_monitor.webp",[740,406,812,505],4]],"stand":[560,482,114],"standImg":"sprites/stand_ctl.webp"}};
  const HUB = {"H1":[330,490],"H2":[520,470],"H3":[560,385],"H4":[720,625],"H5":[930,580],"H6":[1100,485],"H7":[1290,560],"H8":[1180,668],"H9":[1300,728],"H10":[780,360],"H12":[940,495],"H13":[1230,470],"H14":[540,758],"H15":[420,808],"H16":[212,754],"G1":[1255,630],"H17":[655,645],"H18":[606,694],"H19":[563,722]};
  const EDGES = [["H1","H2"],["H2","H3"],["H1","H3"],["H3","H10"],["H10","H12"],["H12","H5"],["H5","H4"],["H12","H6"],["H6","H13"],["H13","H7"],["H8","H9"],["H15","H16"],["H7","G1"],["G1","H8"],["H4","H17"],["H14","H15"],["H17","H18"],["H18","H19"],["H19","H14"]];
  const OUTINGS = [[560,385,"창밖 구경"],[880,318,"화이트보드"],[930,580,"수다"],[172,742,"소파에서 쉬는 중","sofaL"],[262,738,"소파에서 차 한잔","sofaR"]];
  const SOFA = {"sofaL":{"foot":[160,716],"walk":[172,742]},"sofaR":{"foot":[232,700],"walk":[262,738]}};
  const TAKEN = new Set();   // 한 장소에 한 명만
  const BOSS_OUT = {"tea":[560,385,"약재실에서 차 한잔"],"coffee":[1318,734,"원외탕전실 커피"],"exit":[330,490]};
  const WALKN = { diet: 2 };          // 걷기 프레임 수 (기본 4: 왼발-모음-오른발-모음)
  const FACE_LEFT = ['edu'];         // 걷기 그림이 왼쪽을 보는 캐릭터
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
  .lf .lf-wind{position:absolute;transform:translate(-50%,-50%);pointer-events:none;z-index:4;aspect-ratio:1.6}
  .lf .lf-wind i{position:absolute;border-radius:50%;border:0 solid transparent;border-top:3px solid #fff;filter:drop-shadow(0 0 1.5px #3d8fd6) drop-shadow(0 0 3px rgba(80,160,240,.8));opacity:0;animation:lfSw .42s linear infinite}
  .lf .lf-wind i:nth-child(1){left:2%;top:12%;width:46%;height:70%;transform:rotate(-35deg)}
  .lf .lf-wind i:nth-child(2){left:50%;top:6%;width:46%;height:70%;transform:rotate(30deg);animation-delay:.14s}
  .lf .lf-wind i:nth-child(3){left:22%;top:34%;width:56%;height:62%;transform:rotate(180deg);animation-delay:.28s}
  .lf .lf-wind b{position:absolute;height:3px;width:26%;border-radius:2px;background:#fff;box-shadow:0 0 2px #3d8fd6,0 0 4px rgba(80,160,240,.8);opacity:0;animation:lfDash .3s linear infinite}
  .lf .lf-wind b:nth-of-type(1){left:-14%;top:40%;animation-delay:.05s}.lf .lf-wind b:nth-of-type(2){right:-14%;top:30%;animation-delay:.2s;animation-name:lfDashR}.lf .lf-wind b:nth-of-type(3){right:-8%;top:62%;animation-delay:.12s;animation-name:lfDashR}
  @keyframes lfSw{0%{opacity:0;clip-path:inset(0 70% 0 0)}25%{opacity:1}100%{opacity:0;clip-path:inset(0 0 0 0)}}
  @keyframes lfDash{0%{opacity:0;transform:translateX(30%)}30%{opacity:1}100%{opacity:0;transform:translateX(-60%)}}
  @keyframes lfDashR{0%{opacity:0;transform:translateX(-30%)}30%{opacity:1}100%{opacity:0;transform:translateX(60%)}}
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
    const wind = document.createElement('div'); wind.className = 'lf-wind'; wind.innerHTML = '<i></i><i></i><i></i><b></b><b></b><b></b>'; wind.style.display = 'none'; box.appendChild(wind);
    const windOn = on => { if (!on) { wind.style.display = 'none'; return; } const t = cfg.seat.type1, wpx = t[2] * 0.87; wind.style.left = P(t[0] + wpx * 0.53, W0); wind.style.top = P(t[1] + t[2] * 0.82, H0); wind.style.width = P(wpx * 0.85, W0); wind.style.display = ''; };
    const has = k => !!cfg.seat[k];
    const frames = {}; const WN = WALKN[id] || 4, WK = Array.from({ length: WN }, (_, i) => 'walk' + (i + 1)), FACEL = FACE_LEFT.includes(id);
    for (const k of [...Object.keys(cfg.seat), ...WK, ...(cfg.boss ? ['tea', 'coffee'] : [])]) { const im = new Image(); im.src = A + cfg.dir + k + '.webp' + ver; frames[k] = im.src; }
    const standSrc = A + cfg.standImg + ver;
    const S = cfg.stand, hAt = y => S[2] * depth(y) / depth(S[1]);
    let timers = [], mode = working ? 'work' : 'rest', busy = false, alive = true, away = false, raf = 0;
    const later = (fn, ms) => { const t = setTimeout(() => { if (alive) fn(); }, ms); timers.push(t); return t; };
    const clear = () => { timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(raf); };
    const headAt = () => { const t = cfg.seat.type1; return [t[0] + t[2] * 0.42, t[1] - 4]; };

    function sit(k) {
      if (!has(k)) k = k === 'doze' ? 'sleep' : 'type1';
      const [l, t, h] = cfg.seat[k]; const im = new Image(); im.src = frames[k];
      const set = () => { const w = h * (im.naturalWidth / im.naturalHeight || 1); pose.src = frames[k]; pose.style.left = P(l, W0); pose.style.top = P(t, H0); pose.style.height = P(h, H0); pose.style.width = P(w, W0); pose.style.zIndex = cfg.above.includes(k) ? 3 : 1; pose.style.display = ''; pose.style.opacity = 1; };
      im.complete ? set() : (im.onload = set);
      walk.style.display = 'none'; windOn(false);
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
      const go = () => { if (seg >= pts.length - 1) { done && done(); return; } const a = pts[seg], b = pts[seg + 1]; const dur = Math.max(500, Math.hypot(b[0] - a[0], b[1] - a[1]) / 150 * 1000); walk.classList.toggle('flip', FACEL ? b[0] > a[0] : b[0] < a[0]); const t0 = performance.now();
        const step = () => { if (!alive) return; const now = performance.now(); const t = Math.min(1, (now - t0) / dur); const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
          walk.style.left = P(x, W0); walk.style.top = P(y, H0); walk.style.height = P(hAt(y), H0);
          const nf = Math.floor(now / (WN === 4 ? 210 : 260)) % WN; if (nf !== f) { f = nf; walk.src = frames[WK[f]]; }
          if (t < 1) raf = requestAnimationFrame(step); else { seg++; go(); } }; raf = requestAnimationFrame(step); };
      go();
    }
    const walkTo = (from, to, done) => walkPath(route(from, to), done);
    function standAt(p, src) { walk.src = src || standSrc; walk.classList.remove('flip'); walk.style.left = P(p[0], W0); walk.style.top = P(p[1], H0); walk.style.height = P(hAt(p[1]), H0); walk.style.display = ''; }
    const top = p => [p[0], p[1] - hAt(p[1]) - 4];
    // 다녀오기 (쉬는 시간 산책 / 원장님 차·커피)
    let sofaOv = null;
    function sofaSit(k) { const v = SOFA[k]; const n = k === 'sofaR' ? 'sofa_tea' : 'sofa_doze'; const fr = A + cfg.dir + n + '.webp' + ver; const im = new Image(); im.src = fr;
      const h = hAt(v.foot[1]) * 0.82;   // 소파 전신 앉은 키 = 선 키의 0.82
      const set = () => { const w = h * (im.naturalWidth / im.naturalHeight || 0.8); pose.src = fr; pose.style.left = P(v.foot[0] - w / 2, W0); pose.style.top = P(v.foot[1] - h, H0); pose.style.height = P(h, H0); pose.style.width = P(w, W0); pose.style.zIndex = 1; pose.style.display = ''; };
      im.onerror = () => { im.onerror = null; im.src = frames.type1; }; im.complete && im.naturalWidth ? set() : (im.onload = set); walk.style.display = 'none';
      const dozing = n === 'sofa_doze'; zz.style.display = dozing ? '' : 'none'; if (dozing) { zz.style.left = P(v.foot[0] + h * 0.25, W0); zz.style.top = P(v.foot[1] - h - 4, H0); } return [v.foot[0], v.foot[1] - h - 4]; }
    const unSofa = () => {};
    function trip(o, img, then) { const key = o[2]; if (TAKEN.has(key)) { then(); return; } TAKEN.add(key); busy = true; sit(has('stretch') ? 'stretch' : 'type1');
      const back = () => { unSofa(); walkTo(o, S, () => { TAKEN.delete(key); busy = false; then(); }); };
      later(() => walkTo(S, o, () => { if (o[3] && SOFA[o[3]]) { const at = sofaSit(o[3]); say(o[2], 3000, at); later(back, rnd(20000, 40000)); } else { standAt(o, img); say(o[2], 3000, top(o)); later(back, rnd(9000, 16000)); } }), 1200); }

    // 일하는 중: 타이핑 (원장님은 다다다 빠르게) + 가끔 기지개
    function workLoop() { if (mode !== 'work' || busy || away) return; let n = 0; const fast = cfg.boss;
      if (cfg.boss && clinic) { sit('type1'); later(() => { if (busy) return; clear(); bossBreak(); }, rnd(75000, 150000)); return; }
      const tick = () => { if (mode !== 'work' || busy || away) return; sit(n++ % 2 ? 'type2' : 'type1'); later(tick, rnd(260, 620)); };
      if (fast) { let last = 1; const keyTick = () => { if (mode !== 'work' || busy || away || clinic) return; let k; do { k = 1 + Math.floor(Math.random() * 4); } while (k === last); last = k; sit('key' + k); later(keyTick, rnd(75, 135)); }; keyTick(); } else tick();
      if (cfg.boss) { later(() => { if (busy || away) return; clear(); bossBreak(); }, rnd(75000, 150000)); return; }
      if (has('stretch')) later(() => { if (mode !== 'work' || busy) return; busy = true; clear(); sit('stretch'); later(() => { busy = false; workLoop(); }, 1800); }, rnd(14000, 26000)); }
    // 원장님 쉬는 시간: 엎드려 쉬기 / 약재실 차 / 원외탕전 커피
    function bossBreak() { if (away) return; const r = Math.random();
      if (r < 0.4) { sit('sleep'); later(() => { sit('type1'); later(workLoop, 1200); }, rnd(9000, 16000)); }
      else if (r < 0.7) trip(BOSS_OUT.tea, frames.tea, workLoop);
      else trip(BOSS_OUT.coffee, frames.coffee, workLoop); }
    // 직원 쉬는 중: 엎드려 자기 / 졸기 / 기지개 / 잠깐 산책
    function restLoop() { if (mode !== 'rest' || busy) return; const r = Math.random();
      if (r < 0.55) { sit('type1'); later(restLoop, rnd(10000, 20000)); }
      else if (r < 0.8) { let n = 0, m = Math.floor(rnd(6, 14)); const slow = () => { if (mode !== 'rest' || busy) return; sit(n++ % 2 ? 'type2' : 'type1'); if (n < m) later(slow, rnd(500, 900)); else later(restLoop, rnd(6000, 12000)); }; slow(); }
      else if (r < 0.93) { sit('stretch'); later(() => { sit('type1'); later(restLoop, rnd(6000, 12000)); }, 1900); }
      else { const free = OUTINGS.filter(o => !TAKEN.has(o[2])); if (!free.length) { sit('type1'); later(restLoop, rnd(12000, 22000)); } else trip(pick(free), null, () => { sit('type1'); later(restLoop, rnd(8000, 14000)); }); } }
    // 원장님: 30분 지시 없으면 머리 위에 "진료중" 팻말 (자리는 그대로, 타자 멈춤)
    let sign = null, clinic = false;
    const idleMs = () => Date.now() - (Date.parse(window.__ofBossLastAt || bossLastAt || 0) || 0);
    function showSign() { if (sign) return; const t = cfg.seat.type1; sign = bubble('lf-sign', '진료중', [t[0] + t[2] * 1.05, t[1] + t[2] * 0.3]); }
    function bossCheck() { const idle = idleMs() > BOSS_IDLE_MS; if (idle === clinic) return; clinic = idle;
      if (clinic) { showSign(); if (!busy) { clear(); sit('type1'); workLoop(); } }
      else { if (sign) { sign.remove(); sign = null; } if (!busy) { clear(); say('다녀왔어요', 2000); later(workLoop, 1200); } } }

    function start() { clear(); busy = false; if (reduce) { sit('type1'); return; } mode === 'work' ? workLoop() : restLoop(); }

    const poke = () => {
      if (busy && walk.style.display !== 'none') { bang([parseFloat(walk.style.left) / 100 * W0, parseFloat(walk.style.top) / 100 * H0 - hAt(parseFloat(walk.style.top) / 100 * H0) - 6]); return; }
      clear(); busy = true; sit('startle'); bang();
      later(() => { busy = false; if (mode === 'rest') { sit('type1'); say(label ? label + ' 여기 있어요!' : '깼어요!', 2200); later(() => { sit('type2'); later(restLoop, 2600); }, 700); } else workLoop(); }, 1400); };
    pose.addEventListener('click', e => { e.stopPropagation(); poke(); });
    walk.addEventListener('click', e => { e.stopPropagation(); poke(); });

    let iv = 0;
    if (cfg.boss) { mode = 'work'; clinic = idleMs() > BOSS_IDLE_MS; if (clinic) showSign(); start(); iv = setInterval(() => alive && bossCheck(), 20000); }
    else start();
    const outing = (i) => { if (busy) return; clear(); const o = OUTINGS[i ?? Math.floor(Math.random() * OUTINGS.length)]; trip(o, null, () => { sit('type1'); later(restLoop, rnd(8000, 14000)); }); };
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
