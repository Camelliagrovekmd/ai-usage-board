// AI 동백숲한의원 운영실 화면 (공개 페이지 index.html / PC 전용 office-local.html 공용)
// renderOffice(el, office, { detail: bool, usage: services 객체, bg: 배경 경로 })
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const ago = iso => { if (!iso) return ''; const m = Math.round((Date.now() - Date.parse(iso)) / 60000); return m < 1 ? '방금' : m < 60 ? m + '분 전' : m < 1440 ? Math.round(m / 60) + '시간 전' : Math.round(m / 1440) + '일 전'; };
  const until = iso => { if (!iso) return ''; const m = Math.round((Date.parse(iso) - Date.now()) / 60000); return m < 1 ? '곧' : m < 60 ? m + '분 뒤' : Math.round(m / 60) + '시간 뒤'; };
  const hm = iso => iso ? new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Seoul' }) : '';
  const md = iso => iso ? new Date(iso).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', timeZone: 'Asia/Seoul' }) : '';
  const ICON = { '원장': '<img class="of-av" src="' + (window.OF_AVATAR || 'office/avatar.png') + '" alt="원장">', '너구리': '🦝', '곰': '🐻', '부엉이': '🦉', '토끼': '🐰', '여우': '🦊', '사슴': '🦌', '다람쥐': '🐿️', '수달': '🦦', '고양이': '🐱' };
  const AV = (s = '') => `<img class="of-av ${s}" src="${window.OF_AVATAR || 'office/avatar.png'}" alt="원장">`;
  const ST = { '일하는 중': 'w', '승인 대기': 'a', '쉬는 중': 'r', '확인 필요': 'a', '확인 완료': 'r' };
  const css = `
  .of{--of-bg:#fbf7ef;--of-card:#fffdf8;--of-line:#eadfcb;--of-tx:#2b2a26;--of-mut:#8a8276;--of-g:#2e8b57;--of-a:#e39b2d;--of-r:#b9b2a6;--of-red:#c8463d;
      color:var(--of-tx);background:linear-gradient(180deg,#f6efe2,#efe6d4);border-radius:20px;padding:12px;margin:8px 16px 16px;display:grid;grid-template-columns:minmax(0,1fr) 300px 290px;gap:12px}
  .of *{box-sizing:border-box}
  .of-stage{position:relative;border-radius:18px;overflow:hidden;background:#d9cbb2;box-shadow:0 6px 24px rgba(80,60,30,.18)}
  .of-stage>img{display:block;width:100%;height:auto}
  .of-top{position:absolute;left:12px;bottom:12px;display:flex;gap:8px;align-items:center;background:rgba(255,253,248,.92);border-radius:14px;padding:8px 12px;font-size:13px;box-shadow:0 2px 10px rgba(0,0,0,.12);flex-wrap:wrap}
  .of-top b{font-size:15px}
  .of-chip{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:var(--of-mut)}
  .of-dot{width:8px;height:8px;border-radius:50%;display:inline-block;background:var(--of-r)}
  .of-dot.w{background:var(--of-g);box-shadow:0 0 0 3px rgba(46,139,87,.2);animation:ofp 1.6s infinite}.of-dot.a{background:var(--of-a)}
  @keyframes ofp{50%{box-shadow:0 0 0 6px rgba(46,139,87,.05)}}
  .of-tag{position:absolute;transform:translate(-50%,calc(-100% - 6px));background:rgba(255,253,248,.95);border:1px solid var(--of-line);border-radius:12px;padding:3px 8px;font-size:12px;z-index:2;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.15);display:flex;align-items:center;gap:6px;cursor:default}
  .of-tag{flex-direction:column;align-items:center;gap:1px;line-height:1.25}.of-tag .of-l1{display:flex;align-items:center;gap:5px}.of-tag .of-l2{display:flex;align-items:center;gap:4px;font-size:10.5px;font-weight:600;color:var(--of-mut)}.of-tag .of-l2 .of-badge{font-size:9.5px;padding:0 5px;margin:0}.of-tag.w .of-l2 b{color:#1f6b43}.of-tag.a .of-l2 b{color:#9a5d0b}.of-tag:hover{z-index:5}.of-tag.boss{flex-direction:row}.of-tag.boss small{font-weight:600;color:#f3d9a4;font-size:11px}
  .of-tag::after{content:'';position:absolute;left:50%;bottom:-6px;transform:translateX(-50%);border:6px solid transparent;border-bottom:0;border-top-color:rgba(255,253,248,.95)}
  .of-tag.boss::after{border-top-color:#2b2a26}
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
  .of-tag.boss{cursor:pointer;background:#2b2a26;color:#fff;border-color:#2b2a26;font-size:13px;padding:6px 11px}.of-tag.boss small{color:#f3d9a4}.of-tag.boss:hover{transform:translate(-50%,calc(-100% - 9px))}
  .of-tag.boss .of-cnt{background:#c8463d;color:#fff;border-radius:10px;padding:0 7px;font-size:11px}
  .of-bossbtn{cursor:pointer;border:0;background:#2b2a26;color:#fff;border-radius:10px;padding:4px 10px;font:inherit;font-size:12px;font-weight:700}
  .of-modal{position:fixed;inset:0;background:rgba(30,25,15,.45);display:flex;align-items:center;justify-content:center;z-index:50;padding:16px}
  .of-box{background:#fffdf8;color:#2b2a26;border-radius:18px;max-width:760px;width:100%;max-height:88vh;overflow:auto;padding:18px 20px;box-shadow:0 20px 60px rgba(0,0,0,.3)}
  .of-box h2{margin:0 0 4px;font-size:19px;display:flex;align-items:center;gap:8px}.of-box h2 button{margin-left:auto;border:0;background:#efe9df;border-radius:10px;padding:4px 10px;cursor:pointer;font:inherit}
  .of-tabs{display:flex;gap:6px;margin:12px 0;flex-wrap:wrap}.of-tabs button{border:1px solid #eadfcb;background:#fff;border-radius:20px;padding:5px 12px;cursor:pointer;font:inherit;font-size:13px}
  .of-tabs button.on{background:#2e8b57;border-color:#2e8b57;color:#fff}
  .of-av{width:18px;height:18px;border-radius:50%;vertical-align:middle;object-fit:cover;background:#fbf3e3}.of-av.lg{width:24px;height:24px;border:2px solid #f3d9a4}.of-av.xl{width:46px;height:46px;border:2px solid #eadfcb}
  .of-box{max-width:1100px !important;width:min(1100px,96vw) !important;max-height:90vh !important;padding:22px 26px !important;font-size:15px}
  .of-box h2{font-size:22px !important}.of-box .of-li{font-size:14.5px}.of-box .of-li .of-t span{font-size:12.5px}.of-box .of-log{font-size:14px}.of-box .of-tabs button{font-size:14.5px;padding:7px 15px}
  .of-fsbtn{position:absolute;right:12px;top:12px;z-index:6;border:0;border-radius:12px;background:rgba(43,42,38,.85);color:#fff;font:inherit;font-size:13px;font-weight:700;padding:7px 12px;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.2)}
  .of-full{position:fixed;inset:0;z-index:40;margin:0;border-radius:0;display:block;padding:0;background:#1d1a15}
  .of-full .of-fswrap{position:absolute;inset:0 0 64px 0;display:flex;align-items:center;justify-content:center}
  .of-full .of-stage{width:min(100vw,calc((100vh - 64px) * 1.777));border-radius:0;box-shadow:none}
  .of-full .of-tag{font-size:14px}.of-full .of-tag .of-l2{font-size:12px}
  .of-dock{position:absolute;left:0;right:0;bottom:0;height:64px;display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:nowrap;overflow-x:auto;padding:0 12px;background:rgba(255,253,248,.96);border-top:1px solid #eadfcb}
  .of-dock button{flex:none;border:1px solid #eadfcb;background:#fff;border-radius:14px;padding:8px 13px;font:inherit;font-size:13.5px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;color:#2b2a26}
  .of-dock button em{font-style:normal;background:#2e8b57;color:#fff;border-radius:10px;padding:0 7px;font-size:11px}.of-dock button em.a{background:#c8463d}
  .of-chk{flex:none;width:22px;height:22px;border-radius:6px;border:2px solid #b9ad97;background:#fff;color:#fff;font-weight:900;font-size:14px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;margin-top:1px;padding:0}
  .of-chk:hover{border-color:#2e8b57}.of-todo.done .of-chk,.of-todo.checking .of-chk{background:#2e8b57;border-color:#2e8b57}
  .of-todo b{transition:color .4s}.of-todo b{background:linear-gradient(currentColor,currentColor) no-repeat 0 55%/0% 1.5px;transition:background-size .45s ease,color .4s}
  .of-todo.checking b,.of-todo.done b{background-size:100% 1.5px;color:#9a917f}.of-todo.checking{opacity:.75;transition:opacity .6s}.of-todo.done{opacity:.8}
  .of-todo .of-t b{display:inline}.of-todo .of-t span{display:block}
  .of-donebox{margin-top:12px;border-top:1px dashed #eadfcb;padding-top:8px}.of-donebox summary{cursor:pointer;font-weight:700;color:#8a8276;font-size:13.5px;padding:4px 0}
  .of-ask{margin-top:14px;padding:12px 14px;border:1px solid #d9e7dd;background:#f3faf5;border-radius:14px}
  .of-ask-h{font-weight:800;font-size:14px;margin-bottom:8px}.of-ask-h span{font-weight:500;color:#8a8276;font-size:12px;margin-left:6px}
  .of-ask-row{display:flex;gap:8px;align-items:stretch}.of-ask textarea{flex:1;resize:vertical;min-height:46px;border:1px solid #cfe0d4;border-radius:10px;padding:8px 10px;font:inherit;font-size:14px;background:#fff;color:#2b2a26}
  .of-ask-send{flex:none;border:0;border-radius:10px;background:#229ED9;color:#fff;font:inherit;font-weight:800;padding:0 16px;cursor:pointer}.of-ask .of-sub{margin-top:6px}
  .of-quick{display:inline-flex;gap:4px;margin-left:8px;vertical-align:middle}.of-quick button{border:1px solid #eadfcb;background:#fff;border-radius:8px;font:inherit;font-size:11.5px;padding:1px 8px;cursor:pointer;color:#2b2a26}.of-quick button:hover{border-color:#2e8b57;color:#2e8b57}
  .of-bub{position:absolute;transform:translate(-50%,calc(-100% - 46px));z-index:3;pointer-events:auto;cursor:pointer;background:#fff;border:1px solid #d9e7dd;border-radius:12px;padding:3px 9px;font-size:11.5px;font-weight:700;color:#1f6b43;white-space:nowrap;max-width:230px;overflow:hidden;text-overflow:ellipsis;box-shadow:0 3px 10px rgba(0,0,0,.15);animation:ofFloat 2.6s ease-in-out infinite}
  .of-bub::after{content:'';position:absolute;left:50%;bottom:-5px;transform:translateX(-50%) rotate(45deg);width:8px;height:8px;background:#fff;border-right:1px solid #d9e7dd;border-bottom:1px solid #d9e7dd}
  .of-bub .dots i{display:inline-block;width:4px;height:4px;margin-left:2px;border-radius:50%;background:#2e8b57;animation:ofDot 1.2s infinite}.of-bub .dots i:nth-child(2){animation-delay:.2s}.of-bub .dots i:nth-child(3){animation-delay:.4s}
  .of-bub.a{color:#9a5d0b;border-color:#f3d9a4;animation:ofBlink 1.4s ease-in-out infinite}.of-bub.a::after{border-color:#f3d9a4}
  .of-zz{position:absolute;right:-16px;top:-12px;width:20px;height:24px;pointer-events:none;font-weight:900;color:#7d8fa3;font-size:12px;text-shadow:0 1px 2px #fff}
  .of-dots i{display:inline-block;width:4px;height:4px;margin-left:2px;border-radius:50%;background:#2e8b57;animation:ofDot 1.2s infinite}.of-dots i:nth-child(2){animation-delay:.2s}.of-dots i:nth-child(3){animation-delay:.4s}
  .of-tag.a .of-l2 b{animation:ofBlink 1.4s ease-in-out infinite}
  .of-now{display:block;max-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10.5px;font-weight:600;color:#1f6b43;margin-top:1px}
  .of-zz span{position:absolute;opacity:0;animation:ofZ 3.6s linear infinite}.of-zz span:nth-child(2){animation-delay:1.2s;font-size:11px}.of-zz span:nth-child(3){animation-delay:2.4s;font-size:9px}
  .of-glow{position:absolute;transform:translate(-50%,-30%);width:7%;aspect-ratio:1;border-radius:50%;z-index:1;pointer-events:none;background:radial-gradient(circle,rgba(120,255,170,.45),rgba(120,255,170,0) 70%);animation:ofGlow 2.4s ease-in-out infinite}
  .of-tag.w{animation:ofHop 2.6s ease-in-out infinite}
  @keyframes ofFloat{0%,100%{margin-top:0}50%{margin-top:-4px}}
  @keyframes ofDot{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-2px)}}
  @keyframes ofBlink{0%,100%{opacity:1}50%{opacity:.55}}
  @keyframes ofZ{0%{opacity:0;transform:translate(0,0)}20%{opacity:1}100%{opacity:0;transform:translate(14px,-26px)}}
  @keyframes ofGlow{0%,100%{opacity:.55;transform:translate(-50%,-30%) scale(.9)}50%{opacity:1;transform:translate(-50%,-30%) scale(1.08)}}
  @keyframes ofHop{0%,86%,100%{margin-top:0}90%{margin-top:-5px}95%{margin-top:0}}
  @media (prefers-reduced-motion:reduce){.of-bub,.of-tag.w,.of-glow,.of-zz span,.of-bub .dots i{animation:none}}
  @media (max-width:640px){.of-bub{font-size:9px;padding:1px 6px;transform:translate(-50%,calc(-100% - 26px));max-width:120px}.of-zz{display:none}.of-glow{width:9%}}
  .of-anim{position:absolute;inset:0;pointer-events:none;z-index:1}.of-noanim .of-anim{display:none}.of-stage>img{min-height:120px}
  .of-seat{position:absolute;opacity:0;transition:opacity .7s ease}.of-seat.on{opacity:1;animation:ofBob 3.2s ease-in-out infinite}
  .of-sp{position:absolute;transform:translate(-50%,-100%);transition:left 3s linear,top 3s linear,height 3s linear,opacity .6s ease;filter:drop-shadow(0 4px 3px rgba(60,40,10,.25))}
  .of-sp.walk{animation:ofWalk .42s ease-in-out infinite}
  .of-sp.idle{animation:ofSway 4.2s ease-in-out infinite;transform-origin:50% 100%}
  @keyframes ofBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-0.35%)}}
  @keyframes ofWalk{0%,100%{transform:translate(-50%,-100%) rotate(-3deg)}50%{transform:translate(-50%,-104%) rotate(3deg)}}
  @keyframes ofSway{0%,100%{transform:translate(-50%,-100%) rotate(-1.5deg)}50%{transform:translate(-50%,-100%) rotate(1.5deg)}}
  @media (prefers-reduced-motion:reduce){.of-seat.on,.of-sp.walk,.of-sp.idle{animation:none}.of-sp{transition:none}}
  .of-tag,.of-glow{z-index:2}
  .of-pre{font-family:inherit;white-space:pre-wrap;font-size:13.5px;line-height:1.6;background:#f7f0e3;border-radius:12px;padding:12px 14px;margin:0}
  .of-st{font-size:11px;border-radius:8px;padding:2px 7px;background:#efe9df;color:var(--of-mut)}
  .of-st.w{background:#d9f0e2;color:#1f6b43}.of-st.a{background:#fbe7c6;color:#9a5d0b}
  .of-bar{height:7px;border-radius:5px;background:#eee4d3;overflow:hidden;margin:4px 0 8px}.of-bar i{display:block;height:100%}
  .of-log{font-size:12.5px;padding:6px 0;border-top:1px solid #f1e9da;display:flex;gap:8px}.of-log:first-of-type{border-top:0}
  .of-log em{font-style:normal;color:var(--of-g);font-weight:700;flex:none}
  .of-lock{font-size:12px;color:var(--of-mut);background:#f7f0e3;border-radius:10px;padding:8px 10px;margin-top:6px}
  .of-empty{font-size:12.5px;color:var(--of-mut)}
  @media (max-width:1180px){.of{grid-template-columns:1fr 1fr}.of>.of-col:first-child{grid-column:1/-1}}
  @media (max-width:640px){.of-stage .of-top{position:static;margin:0;border-radius:0 0 14px 14px;box-shadow:none;background:#fffdf8}.of-tag{padding:1px 5px !important;font-size:9.5px !important;border-radius:8px}.of-tag .of-l2{display:none !important}.of-tag .of-dot{width:6px;height:6px}.of-tag::after{border-width:4px}.of-tag.boss small{display:none}.of-tag.boss{font-size:10px !important}.of-av.lg{width:16px;height:16px}.of-fsbtn{font-size:11px;padding:4px 8px;right:6px;top:6px}.of-full .of-tag .of-l2{display:flex !important}.of-full .of-tag{font-size:11px !important}.of-full .of-stage .of-top{display:none}.of{grid-template-columns:1fr;margin:6px 8px 12px;padding:8px}.of-tag{font-size:10px;padding:2px 6px}.of-tag small,.of-tag .of-badge{display:none}.of-top{font-size:11px;padding:6px 8px}.of-top b{font-size:13px}}
  `;
  function ensureCss() { if (document.getElementById('of-css')) return; const s = document.createElement('style'); s.id = 'of-css'; s.textContent = css; document.head.appendChild(s); }
  const dname = (o, id) => (o.depts.find(d => d.id === id) || {}).name || '';
  const dicon = (o, id) => ICON[(o.depts.find(d => d.id === id) || {}).animal] || '•';
  const badge = m => `<span class="of-badge ${m === 'Aside' ? 'x' : m === '원장님' ? 'b' : /GPT/.test(m) && !/Claude/.test(m) ? 'g' : ''}">${esc(m)}</span>`;
  const pc = p => p == null ? '#ccc' : p >= 80 ? '#c8463d' : p >= 50 ? '#e39b2d' : '#2e8b57';

  
  // ===== 2단계: 직원 움직임 (빈 사무실 + 앉은 조각 + 서 있는 스프라이트) =====
  const OFW = 1672, OFH = 941;
  const SEAT = {"boss":[130,268,275,402],"herb":[585,158,735,268],"edu":[922,228,1042,342],"ctl":[638,362,778,478],"col":[372,422,502,548],"ops":[998,448,1142,558],"news":[1388,492,1502,618],"vid":[958,572,1132,722],"diet":[652,612,802,748],"tang":[1178,632,1338,792]};
  const LOUNGE = { herb: [178, 738, 112], edu: [258, 764, 116], ctl: [340, 748, 106], col: [424, 792, 116], ops: [506, 738, 106], diet: [108, 790, 114], news: [1226, 492, 92], vid: [1304, 514, 96], tang: [1262, 404, 84] };
  const ASPECT = {"boss":0.622,"herb":0.819,"edu":0.616,"ctl":0.846,"col":0.537,"ops":0.927,"news":0.617,"vid":0.941,"diet":0.819,"tang":0.858};
  const pct = (v, t) => (v / t * 100).toFixed(3) + '%';
  const seatFeet = id => { const s = SEAT[id]; return [(s[0] + s[2]) / 2, s[3] - (s[3] - s[1]) * 0.12, (s[3] - s[1]) * 0.95]; };
  const animLayer = (o, A, ver) => {
    let prev = {}; try { prev = JSON.parse(localStorage.getItem('of.prevStates') || 'null') || null; } catch { prev = null; }
    const html = [], moves = [];
    for (const d of o.depts) { const s = SEAT[d.id]; if (!s) continue; const work = d.boss || d.status === '일하는 중';
      html.push(`<img class="of-seat${work ? ' on' : ''}" data-seat="${d.id}" onerror="this.remove()" src="${A}seats/seat_${d.id}.webp${ver}" alt="" style="left:${pct(s[0], OFW)};top:${pct(s[1], OFH)};width:${pct(s[2] - s[0], OFW)};height:${pct(s[3] - s[1], OFH)}">`);
      if (d.boss) continue; const L = LOUNGE[d.id]; if (!L) continue;
      const was = prev ? (prev[d.id] === '일하는 중') : null; const ar = ASPECT[d.id] || 0.7;
      const from = was === null ? (work ? L : null) : (was !== work ? (was ? seatFeet(d.id) : L) : null);
      const to = work ? seatFeet(d.id) : L; const start = from || to;
      const hh = from && work ? L[2] : (work ? seatFeet(d.id)[2] : L[2]);
      html.push(`<img class="of-sp${!work && !from ? ' idle' : ''}" data-sp="${d.id}" onerror="this.remove()" src="${A}sprites/stand_${d.id}.webp${ver}" alt="" style="left:${pct(start[0], OFW)};top:${pct(start[1], OFH)};height:${pct(hh, OFH)};aspect-ratio:${ar};opacity:${(work && !from) ? 0 : 1}">`);
      if (from) moves.push({ id: d.id, to, work, h: work ? seatFeet(d.id)[2] * 0.9 : L[2] });
    }
    try { localStorage.setItem('of.prevStates', JSON.stringify(Object.fromEntries(o.depts.map(d => [d.id, d.status])))); } catch {}
    return { html: html.join(''), moves };
  };
  const runMoves = (root, moves) => { moves.forEach((m, i) => { const sp = root.querySelector('[data-sp="' + m.id + '"]'); const seat = root.querySelector('[data-seat="' + m.id + '"]'); if (!sp) return;
      if (m.work && seat) seat.classList.remove('on'); if (!m.work && seat) setTimeout(() => seat.classList.remove('on'), 50);
      setTimeout(() => { sp.classList.add('walk'); sp.style.left = pct(m.to[0], OFW); sp.style.top = pct(m.to[1], OFH); sp.style.height = pct(m.h, OFH); }, 600 + i * 450);
      setTimeout(() => { sp.classList.remove('walk'); if (m.work) { sp.style.opacity = 0; if (seat) seat.classList.add('on'); } else sp.classList.add('idle'); }, 600 + i * 450 + 3200); }); };

  window.renderOffice = function (el, o, opt = {}) {
    ensureCss();
    if (!o || !o.depts) { el.innerHTML = '<div class="of"><div class="of-card">운영실 데이터가 아직 없어요. 다음 갱신(매시 정각) 뒤에 보여요.</div></div>'; return; }
    const det = !!opt.detail, c = o.counts || {};
    const lock = t => `<div class="of-lock">🔒 ${t} 목록은 PC 전용 화면에서만 보여요.</div>`;
    const A = opt.assets || 'office/', AV2 = opt.assetVer || ''; const AN = opt.anim !== false && !!(opt.anim || window.OF_ANIM) ? animLayer(o, A, AV2) : null;
    const stage = `<div class="of-stage"><button class="of-fsbtn" data-fs="1">${window.__ofFull ? '↙ 원래 크기로' : '⛶ 크게 보기'}</button><img src="${esc(AN ? (opt.emptyBg || (A + 'office_empty.webp' + AV2)) : (opt.bg || 'office/office_bg.webp'))}" alt="AI 동백숲한의원 운영실"${AN ? ` onerror="this.onerror=null;this.parentNode.classList.add('of-noanim');this.src='${esc(opt.bg || 'office/office_bg.webp')}'"` : ''}>${AN ? '<div class="of-anim">' + AN.html + '</div>' : ''}
      <div class="of-top"><b>AI 동백숲한의원 운영실</b>
        <span class="of-chip"><i class="of-dot w"></i>일하는 중 ${c.working ?? 0}</span>
        <span class="of-chip"><i class="of-dot a"></i>승인 대기 ${c.waitingDepts ?? 0}</span>
        <span class="of-chip"><i class="of-dot"></i>쉬는 중 ${c.resting ?? 0}</span>
        <span class="of-chip">· ${ago(o.generatedAt)} 갱신</span><button class="of-bossbtn" data-boss="1">${AV()} 원장실</button></div>
      ${o.depts.filter(d => !d.boss && d.status === '일하는 중').map(d => `<i class="of-glow" style="left:${d.x}%;top:${d.y}%"></i>`).join('')}
      ${o.depts.map(d => d.boss ? `<div class="of-tag boss" data-boss="1" style="left:${d.x}%;top:${d.y}%">${AV('lg')} 원장실 ${d.waiting ? `<span class="of-cnt">${d.waiting}</span>` : ''}<small>눌러서 보기</small></div>` : `<div class="of-tag ${ST[d.status]}" style="left:${d.x}%;top:${d.y}%"><span class="of-l1"><i class="of-dot ${ST[d.status]}"></i>${esc(d.name)}</span><span class="of-l2"><b>${d.status === '승인 대기' ? '! ' : ''}${esc(d.status)}</b>${d.status === '일하는 중' ? '<span class="of-dots"><i></i><i></i><i></i></span>' : ''}${badge(d.model)}</span>${d.status === '쉬는 중' ? '<span class="of-zz"><span>Z</span><span>z</span><span>z</span></span>' : ''}${det && d.current && d.status === '일하는 중' ? `<span class="of-now">${esc(d.current)}</span>` : ''}${det && d.current ? `<span class="of-cur">${esc(d.current)}</span>` : ''}</div>`).join('')}
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
    const todoHtml = B => {
      const it = (t, d) => `<div class="of-li of-todo ${d ? 'done' : ''}" data-t="${esc(t.text)}"><button class="of-chk" data-chk="${d ? 0 : 1}" aria-label="${d ? '완료 취소' : '완료'}">${d ? '✓' : ''}</button><div class="of-t"><b style="white-space:normal">${esc(t.text)}</b><span>${esc(dname(o, t.dept))}${t.at ? ' · ' + esc(t.at) + ' 등록' : ''}${d && t.doneAt ? ' · ' + esc(t.doneAt) + ' 완료' : ''}</span></div></div>`;
      const open = (B.todos || []).map(t => it(t, false)).join('') || '<div class="of-empty">남은 할 일이 없어요. 👍</div>';
      const done = (B.done || []);
      return open + `<details class="of-donebox" ${window.__ofDoneOpen ? 'open' : ''}><summary>완료한 일 ${done.length}건</summary>${done.map(t => it(t, true)).join('') || '<div class="of-empty">아직 없어요.</div>'}</details>` + (window.OF_TODO_API ? '' : '<div class="of-lock" style="margin-top:8px">⚠ PC 서버가 꺼져 있어 체크가 이 브라우저에만 저장돼요. start.cmd를 실행하면 할 일 파일에 바로 반영돼요.</div>');
    };
    const toggleTodo = async (text, done) => {
      const B = o.boss; const from = done ? B.todos : B.done, to = done ? B.done : B.todos; const k = from.findIndex(t => t.text === text); if (k < 0) return;
      const item = from.splice(k, 1)[0]; const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
      if (done) { item.doneAt = today; to.unshift(item); } else { delete item.doneAt; to.push(item); }
      c.todos = B.todos.length; c.doneTodos = B.done.length;
      { const bd = o.depts.find(d => d.boss); if (bd) { bd.waiting = (c.todos || 0) + (c.approvals || 0); bd.status = bd.waiting ? '확인 필요' : '확인 완료'; } }
      try { window.renderOffice(el, o, { ...opt, openBoss: undefined }); } catch (e) {}
      if (window.OF_TODO_API) { try { const r = await fetch(window.OF_TODO_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, done }) }); if (!r.ok) throw new Error(r.status); } catch (e) { alert('할 일 파일 저장 실패: ' + e); } }
      else { const L = JSON.parse(localStorage.getItem('of.todoLocal') || '{}'); L[text] = done ? today : null; localStorage.setItem('of.todoLocal', JSON.stringify(L)); }
    };
    if (!window.OF_TODO_API && o.boss) { const L = JSON.parse(localStorage.getItem('of.todoLocal') || '{}'); for (const [t, d] of Object.entries(L)) { const B = o.boss; const inOpen = (B.todos || []).findIndex(x => x.text === t); const inDone = (B.done || []).findIndex(x => x.text === t); if (d && inOpen >= 0) { const x = B.todos.splice(inOpen, 1)[0]; x.doneAt = d; (B.done = B.done || []).unshift(x); } else if (!d && inDone >= 0) { const x = B.done.splice(inDone, 1)[0]; delete x.doneAt; B.todos.push(x); } } }
    const askBox = (k) => `<div class="of-ask"><div class="of-ask-h">💬 Aside에게 보내기 <span>${k === 'appr' ? '승인·보류·수정 요청을 적어 주세요' : '할 일에 대한 질문이나 지시를 적어 주세요'}</span></div>
      <div class="of-ask-row"><textarea rows="2" placeholder="${k === 'appr' ? '예) 화병 쇼츠 게시 승인 / 발목 염좌 쇼츠는 다음 주로 보류' : '예) 카톡 요약은 손가변증 방 빼고 매일 밤 9시로 해줘'}"></textarea><button class="of-ask-send">보내기</button></div>
      <div class="of-sub">텔레그램이 열리고 메시지가 채워져요. 텔레그램에서 '보내기'를 누르면 Aside가 받아서 처리해요.</div></div>`;
    const sendAsk = (text, k) => { const t = (text || '').trim(); if (!t) return; const bot = window.OF_TG_BOT || 'Camelliagrove_kmcbot'; const msg = '[원장실·' + (k === 'appr' ? '승인' : '할 일') + '] ' + t; window.open('https://t.me/' + bot + '?text=' + encodeURIComponent(msg), '_blank', 'noopener'); };
    const openBoss = (tab) => {
      const B = o.boss || {}, n = c, br = B.briefing;
      const sec = {
        todo: ['✅ 할 일', det ? todoHtml(B) : `<div class="of-big">${n.todos ?? 0}건</div>` + lock('할 일')],
        appr: ['🔔 승인할 일', det ? ((B.recentPosts || []).length ? `<div class="of-lock" style="margin:0 0 8px;color:#2b2a26"><b>📣 최근 게시</b>${B.recentPosts.map(p => `<div style="margin-top:4px">${esc(p.kind)}: <b>${esc(p.title)}</b> · ${esc(p.at)} · ${esc(p.channel)} · ${p.days === 0 ? '오늘' : p.days + '일 전'}${p.summary ? '<br><span class="of-sub">' + esc(p.summary) + '</span>' : ''}</div>`).join('')}</div>` : '') + (B.approvals || []).map(a => `<div class="of-li"><span class="of-ic">${dicon(o, a.dept)}</span><div class="of-t"><b style="white-space:normal">${esc(a.title)}</b><span class="of-quick">${(() => { if (a.publish) { const nm2 = a.title.replace(/ 칼럼 블로그 발행 대기$/, ''); return `<button data-quick="${esc(nm2 + ' 발행했어')}">발행했어</button>`; } const base = a.title.replace(/ (칼럼 )?승인 대기$/, '').replace(/ 대기$/, ''); const nm = base.replace(/ 게시$/, ''); return `<button data-quick="${esc(base + ' 승인')}">승인</button><button data-quick="${esc(nm + ' 보류')}">보류</button><button data-quick="${esc(nm + ' 수정: ')}">수정 요청</button>`; })()}</span>${a.summary ? `<span style="display:block">${esc(a.summary)}</span>` : ''}<span>${esc(dname(o, a.dept))}${a.due ? ' · ' + esc(a.due) : ''} · 텔레그램에 "○○ 승인"이라고 보내면 처리돼요</span></div></div>`).join('') || '<div class="of-empty">승인할 일이 없어요.</div>' : `<div class="of-big">${n.approvals ?? 0}건</div>` + lock('승인 항목')],
        rep: ['📋 알아둘 보고', det ? (B.reports || []).map(r => `<div class="of-log"><em>${r.level === 'warn' ? '⚠ ' : ''}${esc(dname(o, r.dept))}</em><span>${esc(r.text)}</span></div>`).join('') || '<div class="of-empty">새 보고가 없어요.</div>' : `<div class="of-big">${n.reports ?? 0}건</div>` + lock('보고')],
        brief: ['☀️ 아침 브리핑', det ? (br ? `<div class="of-sub" style="margin-bottom:6px">${esc(br.date)} 작성 · 매일 08:00 텔레그램으로도 받아요</div><pre class="of-pre">${esc(br.text)}</pre>` : '<div class="of-empty">아직 브리핑이 없어요. 매일 08:00에 만들어져요.</div>') : `<div class="of-sub">${n.briefingAt ? md(n.briefingAt) + ' ' + hm(n.briefingAt) + ' 작성' : '아직 없음'} · 매일 08:00 텔레그램으로 발송</div>` + lock('브리핑 내용')],
      };
      const m = document.createElement('div'); m.className = 'of-modal';
      const draw = k => { if (det) sec.todo[1] = todoHtml(o.boss); m.innerHTML = `<div class="of-box"><h2>${AV('xl')} 원장실<button>닫기</button></h2><div class="of-sub">원장님이 하실 일·승인할 일·알아둘 보고·아침 브리핑</div><div class="of-tabs">${Object.entries(sec).map(([id, s]) => `<button data-k="${id}" class="${id === k ? 'on' : ''}">${s[0]}${id === 'todo' ? ' ' + (n.todos ?? 0) : id === 'appr' ? ' ' + (n.approvals ?? 0) : ''}</button>`).join('')}</div><div>${sec[k][1]}</div>${(k === 'todo' || k === 'appr') ? askBox(k) : ''}</div>`;
        m.querySelector('h2 button').onclick = () => m.remove(); m.querySelectorAll('.of-tabs button').forEach(b => b.onclick = () => draw(b.dataset.k));
          const ta = m.querySelector('.of-ask textarea'); const sb = m.querySelector('.of-ask-send');
          if (ta && sb) { sb.onclick = () => { sendAsk(ta.value, k); ta.value = ''; }; ta.onkeydown = e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sb.click(); }; }
          m.querySelectorAll('[data-quick]').forEach(b => b.onclick = () => { if (ta) { ta.value = b.dataset.quick; ta.focus(); } });
          const db = m.querySelector('.of-donebox'); if (db) db.ontoggle = () => { window.__ofDoneOpen = db.open; };
          m.querySelectorAll('[data-chk]').forEach(b => b.onclick = async () => { const row = b.closest('.of-todo'); const done = b.dataset.chk === '1'; row.classList.add(done ? 'checking' : 'unchecking'); if (done) b.textContent = '✓'; await toggleTodo(row.dataset.t, done); setTimeout(() => { const sc = m.querySelector('.of-box').scrollTop; draw('todo'); m.querySelector('.of-box').scrollTop = sc; }, 650); }); };
      m.onclick = e => { if (e.target === m) m.remove(); }; draw(tab || 'todo'); document.body.appendChild(m);
    };
    const panel = (title, html) => { const m = document.createElement('div'); m.className = 'of-modal'; m.innerHTML = '<div class="of-box"><h2>' + title + '<button>닫기</button></h2><div>' + html + '</div></div>'; m.querySelector('h2 button').onclick = () => m.remove(); m.onclick = e => { if (e.target === m) m.remove(); }; document.body.appendChild(m); };
    const strip = h => h.replace(/^<div class="of-card"><h3>[\s\S]*?<\/h3>/, '').replace(/<\/div>$/, '');
    const boards = [['🔔 승인·게시 대기', alerts, c.approvals, 'a'], ['⚙️ 진행 중인 일', prog, c.running], ['📁 최근 완성 자료', rec, c.recent7d], ['👥 직원 현황', staff], ['⚡ 오늘 사용량', use], ['📝 작업 기록', log]];
    if (window.__ofFull) {
      el.innerHTML = '<div class="of of-full"><div class="of-fswrap">' + stage + '</div><div class="of-dock"><button data-boss="1">' + AV() + ' 원장실' + ((c.todos || 0) + (c.approvals || 0) ? ' <em class="a">' + ((c.todos || 0) + (c.approvals || 0)) + '</em>' : '') + '</button>' + boards.map((b, i) => '<button data-bd="' + i + '">' + b[0] + (b[2] != null ? ' <em class="' + (b[3] && b[2] ? 'a' : '') + '">' + b[2] + '</em>' : '') + '</button>').join('') + '</div></div>';
      el.querySelectorAll('[data-bd]').forEach(b => b.onclick = () => { const x = boards[+b.dataset.bd]; panel(x[0], strip(x[1])); });
      document.body.style.overflow = 'hidden';
    } else {
      el.innerHTML = `<div class="of"><div class="of-col">${stage}${log}</div><div class="of-col">${alerts}${prog}${rec}</div><div class="of-col">${staff}${use}</div></div>`;
      document.body.style.overflow = '';
    }
    const deptPanel = id => { const d = o.depts.find(x => x.id === id); if (!d) return; const rec = (d.recent || []);
      const body = '<div class="of-sub" style="margin-bottom:8px">' + esc(d.role || '') + ' · 담당 ' + esc(d.model || '') + ' · ' + esc(d.status) + (d.lastAt ? ' · 마지막 작업 ' + ago(d.lastAt) : '') + '</div>' +
        (det ? (rec.length ? rec.map(t => '<div class="of-li"><span class="of-ic">' + (ICON[d.animal] || '•') + '</span><div class="of-t"><b style="white-space:normal">' + esc(t.title) + '</b><span>' + (t.kind === 'routine' ? '자동 작업' : '작업') + ' · ' + md(t.at) + ' ' + hm(t.at) + '</span></div></div>').join('') : '<div class="of-empty">최근 7일 작업이 없어요.</div>') : '<div class="of-big">오늘 ' + (d.today || 0) + '건</div>' + lock('작업'));
      panel((ICON[d.animal] || '') + ' ' + esc(d.name), body); };
    el.querySelectorAll('[data-dept]').forEach(b => b.onclick = e => { e.stopPropagation(); deptPanel(b.dataset.dept); });
    el.querySelectorAll('.of-tag:not(.boss)').forEach((t, i) => { const d = o.depts.filter(x => !x.boss)[i]; if (d) { t.style.cursor = 'pointer'; t.onclick = () => deptPanel(d.id); } });
    if (AN && AN.moves.length) runMoves(el, AN.moves);
    el.querySelectorAll('[data-fs]').forEach(b => b.onclick = () => { window.__ofFull = !window.__ofFull; window.renderOffice(el, o, opt); });
    if (!window.__ofEsc) { window.__ofEsc = true; document.addEventListener('keydown', e => { if (e.key === 'Escape' && window.__ofFull && !document.querySelector('.of-modal')) { window.__ofFull = false; window.__ofLast && window.renderOffice(...window.__ofLast); } }); }
    window.__ofLast = [el, o, opt];
    el.querySelectorAll('[data-boss]').forEach(b => b.onclick = () => openBoss('todo'));
    if (opt.openBoss) openBoss(opt.openBoss);
  };
})();
