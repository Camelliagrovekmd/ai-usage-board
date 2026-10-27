// AI 동백숲한의원 운영실 화면 (공개 페이지 index.html / PC 전용 office-local.html 공용)
// renderOffice(el, office, { detail: bool, usage: services 객체, bg: 배경 경로 })
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const ago = iso => { if (!iso) return ''; const m = Math.round((Date.now() - Date.parse(iso)) / 60000); return m < 1 ? '방금' : m < 60 ? m + '분 전' : m < 1440 ? Math.round(m / 60) + '시간 전' : Math.round(m / 1440) + '일 전'; };
  const until = iso => { if (!iso) return ''; const m = Math.round((Date.parse(iso) - Date.now()) / 60000); return m < 1 ? '곧' : m < 60 ? m + '분 뒤' : Math.round(m / 60) + '시간 뒤'; };
  const hm = iso => iso ? new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Seoul' }) : '';
  const md = iso => iso ? new Date(iso).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', timeZone: 'Asia/Seoul' }) : '';
  const ICON = { '원장': '🧑‍⚕️', '부엉이': '🦉', '토끼': '🐰', '여우': '🦊', '사슴': '🦌', '다람쥐': '🐿️', '수달': '🦦', '고양이': '🐱' };
  const ST = { '일하는 중': 'w', '승인 대기': 'a', '쉬는 중': 'r', '확인 필요': 'a', '확인 완료': 'r' };
  const css = `
  .of{--of-bg:#fbf7ef;--of-card:#fffdf8;--of-line:#eadfcb;--of-tx:#2b2a26;--of-mut:#8a8276;--of-g:#2e8b57;--of-a:#e39b2d;--of-r:#b9b2a6;--of-red:#c8463d;
      color:var(--of-tx);background:linear-gradient(180deg,#f6efe2,#efe6d4);border-radius:20px;padding:12px;margin:8px 16px 16px;display:grid;grid-template-columns:minmax(0,1fr) 300px 290px;gap:12px}
  .of *{box-sizing:border-box}
  .of-stage{position:relative;border-radius:18px;overflow:hidden;background:#d9cbb2;box-shadow:0 6px 24px rgba(80,60,30,.18)}
  .of-stage img{display:block;width:100%;height:auto}
  .of-top{position:absolute;left:12px;top:12px;display:flex;gap:8px;align-items:center;background:rgba(255,253,248,.92);border-radius:14px;padding:8px 12px;font-size:13px;box-shadow:0 2px 10px rgba(0,0,0,.12);flex-wrap:wrap}
  .of-top b{font-size:15px}
  .of-chip{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:var(--of-mut)}
  .of-dot{width:8px;height:8px;border-radius:50%;display:inline-block;background:var(--of-r)}
  .of-dot.w{background:var(--of-g);box-shadow:0 0 0 3px rgba(46,139,87,.2);animation:ofp 1.6s infinite}.of-dot.a{background:var(--of-a)}
  @keyframes ofp{50%{box-shadow:0 0 0 6px rgba(46,139,87,.05)}}
  .of-tag{position:absolute;transform:translate(-50%,-135%);background:rgba(255,253,248,.95);border:1px solid var(--of-line);border-radius:12px;padding:4px 9px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.15);display:flex;align-items:center;gap:6px;cursor:default}
  .of-tag small{font-weight:600;color:var(--of-mut);font-size:11px}
  .of-tag .of-badge{margin-left:2px}
  .of-tag.w{border-color:var(--of-g)}.of-tag.a{border-color:var(--of-a)}
  .of-tag .of-cur{display:none}
  .of-tag:hover .of-cur{display:block;position:absolute;top:110%;left:50%;transform:translateX(-50%);background:#2b2a26;color:#fff;font-weight:500;border-radius:8px;padding:5px 8px;max-width:240px;white-space:normal}
  .of-col{display:flex;flex-direction:column;gap:12px;min-width:0}
  .of-card{background:var(--of-card);border:1px solid var(--of-line);border-radius:16px;padding:12px 14px}
  .of-card h3{margin:0 0 8px;font-size:14px;display:flex;align-items:center;gap:6px}
  .of-card h3 .of-n{margin-left:auto;font-size:11px;background:var(--of-g);color:#fff;border-radius:10px;padding:1px 8px}
  .of-card h3 .of-n.a{background:var(--of-red)}
  .of-li{display:flex;gap:8px;align-items:flex-start;padding:7px 0;border-top:1px solid #f1e9da;font-size:13px}
  .of-li:first-of-type{border-top:0}
  .of-li .of-ic{width:24px;text-align:center;font-size:16px;flex:none}
  .of-li .of-t{flex:1;min-width:0}
  .of-li .of-t b{display:block;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .of-li .of-t span{color:var(--of-mut);font-size:11.5px}
  .of-ext{font-size:10px;font-weight:800;color:#fff;border-radius:5px;padding:3px 4px;flex:none;background:#7a8b99}
  .of-ext.MP4{background:#c8463d}.of-ext.PDF{background:#d1495b}.of-ext.HTML{background:#2e8b57}.of-ext.MD{background:#6b5b95}
  .of-big{font-size:26px;font-weight:800}.of-sub{color:var(--of-mut);font-size:12px}
  .of-num{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .of-num div{background:#f7f0e3;border-radius:12px;padding:8px 10px}
  .of-staff{display:flex;align-items:center;gap:8px;padding:5px 0;font-size:13px}
  .of-staff .of-nm{flex:1;font-weight:700;white-space:nowrap}
  .of-badge{font-size:10.5px;border-radius:8px;padding:2px 7px;font-weight:700;background:#fde3d3;color:#b5532a}
  .of-badge.g{background:#d9f0e2;color:#1f6b43}.of-badge.x{background:#dfe7ff;color:#2f4fb5}.of-badge.b{background:#2b2a26;color:#fff}
  .of-tag.boss{cursor:pointer;background:#2b2a26;color:#fff;border-color:#2b2a26;font-size:13px;padding:6px 11px}.of-tag.boss small{color:#f3d9a4}.of-tag.boss:hover{transform:translate(-50%,-140%)}
  .of-tag.boss .of-cnt{background:#c8463d;color:#fff;border-radius:10px;padding:0 7px;font-size:11px}
  .of-bossbtn{cursor:pointer;border:0;background:#2b2a26;color:#fff;border-radius:10px;padding:4px 10px;font:inherit;font-size:12px;font-weight:700}
  .of-modal{position:fixed;inset:0;background:rgba(30,25,15,.45);display:flex;align-items:center;justify-content:center;z-index:50;padding:16px}
  .of-box{background:#fffdf8;color:#2b2a26;border-radius:18px;max-width:760px;width:100%;max-height:88vh;overflow:auto;padding:18px 20px;box-shadow:0 20px 60px rgba(0,0,0,.3)}
  .of-box h2{margin:0 0 4px;font-size:19px;display:flex;align-items:center;gap:8px}.of-box h2 button{margin-left:auto;border:0;background:#efe9df;border-radius:10px;padding:4px 10px;cursor:pointer;font:inherit}
  .of-tabs{display:flex;gap:6px;margin:12px 0;flex-wrap:wrap}.of-tabs button{border:1px solid #eadfcb;background:#fff;border-radius:20px;padding:5px 12px;cursor:pointer;font:inherit;font-size:13px}
  .of-tabs button.on{background:#2e8b57;border-color:#2e8b57;color:#fff}
  .of-pre{font-family:inherit;white-space:pre-wrap;font-size:13.5px;line-height:1.6;background:#f7f0e3;border-radius:12px;padding:12px 14px;margin:0}
  .of-st{font-size:11px;border-radius:8px;padding:2px 7px;background:#efe9df;color:var(--of-mut)}
  .of-st.w{background:#d9f0e2;color:#1f6b43}.of-st.a{background:#fbe7c6;color:#9a5d0b}
  .of-bar{height:7px;border-radius:5px;background:#eee4d3;overflow:hidden;margin:4px 0 8px}.of-bar i{display:block;height:100%}
  .of-log{font-size:12.5px;padding:6px 0;border-top:1px solid #f1e9da;display:flex;gap:8px}.of-log:first-of-type{border-top:0}
  .of-log em{font-style:normal;color:var(--of-g);font-weight:700;flex:none}
  .of-lock{font-size:12px;color:var(--of-mut);background:#f7f0e3;border-radius:10px;padding:8px 10px;margin-top:6px}
  .of-empty{font-size:12.5px;color:var(--of-mut)}
  @media (max-width:1180px){.of{grid-template-columns:1fr 1fr}.of>.of-col:first-child{grid-column:1/-1}}
  @media (max-width:640px){.of{grid-template-columns:1fr;margin:6px 8px 12px;padding:8px}.of-tag{font-size:10px;padding:2px 6px}.of-tag small,.of-tag .of-badge{display:none}.of-top{font-size:11px;padding:6px 8px}.of-top b{font-size:13px}}
  `;
  function ensureCss() { if (document.getElementById('of-css')) return; const s = document.createElement('style'); s.id = 'of-css'; s.textContent = css; document.head.appendChild(s); }
  const dname = (o, id) => (o.depts.find(d => d.id === id) || {}).name || '';
  const dicon = (o, id) => ICON[(o.depts.find(d => d.id === id) || {}).animal] || '•';
  const badge = m => `<span class="of-badge ${m === 'Aside' ? 'x' : m === '원장님' ? 'b' : /GPT/.test(m) && !/Claude/.test(m) ? 'g' : ''}">${esc(m)}</span>`;
  const pc = p => p == null ? '#ccc' : p >= 80 ? '#c8463d' : p >= 50 ? '#e39b2d' : '#2e8b57';

  window.renderOffice = function (el, o, opt = {}) {
    ensureCss();
    if (!o || !o.depts) { el.innerHTML = '<div class="of"><div class="of-card">운영실 데이터가 아직 없어요. 다음 갱신(매시 정각) 뒤에 보여요.</div></div>'; return; }
    const det = !!opt.detail, c = o.counts || {};
    const lock = t => `<div class="of-lock">🔒 ${t} 목록은 PC 전용 화면에서만 보여요.</div>`;
    const stage = `<div class="of-stage"><img src="${esc(opt.bg || 'office/office_bg.webp')}" alt="AI 동백숲한의원 운영실">
      <div class="of-top"><b>AI 동백숲한의원 운영실</b>
        <span class="of-chip"><i class="of-dot w"></i>일하는 중 ${c.working ?? 0}</span>
        <span class="of-chip"><i class="of-dot a"></i>승인 대기 ${c.waitingDepts ?? 0}</span>
        <span class="of-chip"><i class="of-dot"></i>쉬는 중 ${c.resting ?? 0}</span>
        <span class="of-chip">· ${ago(o.generatedAt)} 갱신</span><button class="of-bossbtn" data-boss="1">🧑‍⚕️ 원장실</button></div>
      ${o.depts.map(d => d.boss ? `<div class="of-tag boss" data-boss="1" style="left:${d.x}%;top:${d.y}%">🧑‍⚕️ 원장실 ${d.waiting ? `<span class="of-cnt">${d.waiting}</span>` : ''}<small>눌러서 보기</small></div>` : `<div class="of-tag ${ST[d.status]}" style="left:${d.x}%;top:${d.y}%"><i class="of-dot ${ST[d.status]}"></i>${esc(d.name)}<small>${esc(d.status)}</small>${badge(d.model)}${det && d.current ? `<span class="of-cur">${esc(d.current)}</span>` : ''}</div>`).join('')}
    </div>`;
    // 알림
    const appr = det ? (o.approvals || []) : [];
    const alerts = `<div class="of-card"><h3>🔔 승인·게시 대기<span class="of-n ${c.approvals ? 'a' : ''}">${c.approvals ?? 0}</span></h3>
      ${det ? (appr.length ? appr.map(a => `<div class="of-li"><span class="of-ic">${dicon(o, a.dept)}</span><div class="of-t"><b>${esc(a.title)}</b><span>${esc(dname(o, a.dept))}${a.due ? ' · ' + esc(a.due) : ''}</span></div></div>`).join('') : '<div class="of-empty">대기 중인 항목이 없어요.</div>')
        : `<div class="of-big">${c.approvals ?? 0}건</div>` + lock('대기 항목')}</div>`;
    const prog = `<div class="of-card"><h3>⚙️ 진행 중인 일<span class="of-n">${(c.running ?? 0)}</span></h3>
      ${det ? ([...(o.running || []), ...(o.upcoming || [])].map(t => `<div class="of-li"><span class="of-ic">${dicon(o, t.dept)}</span><div class="of-t"><b>${esc(t.title)}</b><span>${esc(dname(o, t.dept))} · ${t.state === '예정' ? '예정 ' + hm(t.at) + ' (' + until(t.at) + ')' : '작업 중 · ' + ago(t.at)}</span></div></div>`).join('') || '<div class="of-empty">지금 진행 중인 일이 없어요.</div>')
        : `<div class="of-num"><div><div class="of-big">${c.running ?? 0}</div><div class="of-sub">작업 중</div></div><div><div class="of-big">${c.upcoming ?? 0}</div><div class="of-sub">24시간 내 예정</div></div></div>` + lock('작업')}</div>`;
    const rec = `<div class="of-card"><h3>📁 최근 완성 자료<span class="of-n">${c.recent7d ?? 0}</span></h3>
      ${det ? ((o.recent || []).slice(0, 8).map(r => `<div class="of-li"><span class="of-ext ${esc(r.ext)}">${esc(r.ext)}</span><div class="of-t"><b>${esc(r.name)}</b><span>${esc(dname(o, r.dept))} · ${md(r.at)} ${hm(r.at)}</span></div></div>`).join('') || '<div class="of-empty">최근 7일 자료가 없어요.</div>')
        : `<div class="of-big">${c.recent7d ?? 0}개</div><div class="of-sub">최근 7일</div>` + lock('파일')}</div>`;
    const staff = `<div class="of-card"><h3>👥 직원 현황</h3><div class="of-sub" style="margin-bottom:6px">일하는 중 ${c.working ?? 0} · 승인 대기 ${c.waitingDepts ?? 0} · 쉬는 중 ${c.resting ?? 0}</div>
      ${o.depts.filter(d => !d.boss).map(d => `<div class="of-staff"><span>${ICON[d.animal] || ''}</span><span class="of-nm">${esc(d.name)}</span>${badge(d.model)}<span class="of-st ${ST[d.status]}">${esc(d.status)}</span></div>`).join('')}</div>`;
    const U = opt.usage || {};
    const ub = (lab, w) => w ? `<div class="of-sub" style="display:flex;justify-content:space-between"><span>${lab}</span><b style="color:var(--of-tx)">${w.usedPct ?? '-'}%</b></div><div class="of-bar"><i style="width:${w.usedPct ?? 0}%;background:${pc(w.usedPct)}"></i></div>` : '';
    const use = `<div class="of-card"><h3>⚡ 오늘 사용량</h3>${ub('Claude 5시간', U.claude?.fiveHour)}${ub('Claude 주간', U.claude?.weekly)}${ub('GPT 5시간', U.gpt?.fiveHour)}${ub('GPT 주간', U.gpt?.weekly)}<div class="of-sub">오늘 작업 ${c.tasksToday ?? 0}건</div></div>`;
    const log = `<div class="of-card"><h3>📝 작업 기록</h3>${det ? ((o.log || []).slice(0, 10).map(l => `<div class="of-log"><em>${esc(dname(o, l.dept))}</em><span>${esc(l.text)}</span></div>`).join('') || '<div class="of-empty">기록이 없어요.</div>') : lock('작업 기록')}</div>`;
    const openBoss = (tab) => {
      const B = o.boss || {}, n = c, br = B.briefing;
      const sec = {
        todo: ['✅ 할 일', det ? (B.todos || []).map(t => `<div class="of-li"><span class="of-ic">☐</span><div class="of-t"><b style="white-space:normal">${esc(t.text)}</b><span>${esc(dname(o, t.dept))}${t.at ? ' · ' + esc(t.at) + ' 등록' : ''}</span></div></div>`).join('') || '<div class="of-empty">할 일이 없어요.</div>' : `<div class="of-big">${n.todos ?? 0}건</div>` + lock('할 일')],
        appr: ['🔔 승인할 일', det ? ((B.recentPosts || []).length ? `<div class="of-lock" style="margin:0 0 8px;color:#2b2a26"><b>📣 최근 게시</b>${B.recentPosts.map(p => `<div style="margin-top:4px">${esc(p.kind)}: <b>${esc(p.title)}</b> · ${esc(p.at)} · ${esc(p.channel)} · ${p.days === 0 ? '오늘' : p.days + '일 전'}${p.summary ? '<br><span class="of-sub">' + esc(p.summary) + '</span>' : ''}</div>`).join('')}</div>` : '') + (B.approvals || []).map(a => `<div class="of-li"><span class="of-ic">${dicon(o, a.dept)}</span><div class="of-t"><b style="white-space:normal">${esc(a.title)}</b>${a.summary ? `<span style="display:block">${esc(a.summary)}</span>` : ''}<span>${esc(dname(o, a.dept))}${a.due ? ' · ' + esc(a.due) : ''} · 텔레그램에 "○○ 승인"이라고 보내면 처리돼요</span></div></div>`).join('') || '<div class="of-empty">승인할 일이 없어요.</div>' : `<div class="of-big">${n.approvals ?? 0}건</div>` + lock('승인 항목')],
        rep: ['📋 알아둘 보고', det ? (B.reports || []).map(r => `<div class="of-log"><em>${r.level === 'warn' ? '⚠ ' : ''}${esc(dname(o, r.dept))}</em><span>${esc(r.text)}</span></div>`).join('') || '<div class="of-empty">새 보고가 없어요.</div>' : `<div class="of-big">${n.reports ?? 0}건</div>` + lock('보고')],
        brief: ['☀️ 아침 브리핑', det ? (br ? `<div class="of-sub" style="margin-bottom:6px">${esc(br.date)} 작성 · 매일 08:00 텔레그램으로도 받아요</div><pre class="of-pre">${esc(br.text)}</pre>` : '<div class="of-empty">아직 브리핑이 없어요. 매일 08:00에 만들어져요.</div>') : `<div class="of-sub">${n.briefingAt ? md(n.briefingAt) + ' ' + hm(n.briefingAt) + ' 작성' : '아직 없음'} · 매일 08:00 텔레그램으로 발송</div>` + lock('브리핑 내용')],
      };
      const m = document.createElement('div'); m.className = 'of-modal';
      const draw = k => { m.innerHTML = `<div class="of-box"><h2>🧑‍⚕️ 원장실<button>닫기</button></h2><div class="of-sub">원장님이 하실 일·승인할 일·알아둘 보고·아침 브리핑</div><div class="of-tabs">${Object.entries(sec).map(([id, s]) => `<button data-k="${id}" class="${id === k ? 'on' : ''}">${s[0]}${id === 'todo' ? ' ' + (n.todos ?? 0) : id === 'appr' ? ' ' + (n.approvals ?? 0) : ''}</button>`).join('')}</div><div>${sec[k][1]}</div></div>`;
        m.querySelector('h2 button').onclick = () => m.remove(); m.querySelectorAll('.of-tabs button').forEach(b => b.onclick = () => draw(b.dataset.k)); };
      m.onclick = e => { if (e.target === m) m.remove(); }; draw(tab || 'todo'); document.body.appendChild(m);
    };
    el.innerHTML = `<div class="of"><div class="of-col">${stage}${log}</div><div class="of-col">${alerts}${prog}${rec}</div><div class="of-col">${staff}${use}</div></div>`;
    el.querySelectorAll('[data-boss]').forEach(b => b.onclick = () => openBoss('todo'));
    if (opt.openBoss) openBoss(opt.openBoss);
  };
})();
