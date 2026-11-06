/* ═══════════════════════════════════════════════
   リーグ全体の分析データ（data/advanced.json）の表示
   Teams ページの Advanced タブ・チームページ（On/Off・ラインナップ・Clutch・Team Style）と、選手ページ（Player Profile）で共通
   advanced.json はローカルの nba-tools/aggregate.js が書き出す（更新は手動）
   必要なもの: assets/teams.js（NBA.link・esc）、assets/ui.js（NBA.ui.sortable）
   ═══════════════════════════════════════════════ */
window.NBA = window.NBA || {};

(function () {
    const STALE_DAYS = 7;   // これより古い集計は注意の色にする

    // 更新のたびに中身が変わるので、ブラウザのキャッシュを使わずに確かめる（変わっていなければ通信は小さい）
    let promise = null;
    const load = () => promise ||= fetch('../data/advanced.json', { cache: 'no-cache' })
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .catch(e => { promise = null; throw e; });

    const rating = (pts, poss) => poss > 0 ? 100 * pts / poss : null;
    const f1 = v => v == null || isNaN(v) ? '-' : v.toFixed(1);
    const sgn = v => v == null || isNaN(v) ? '-' : (v > 0 ? '+' : '') + v.toFixed(1);
    const cls = v => v > 0 ? 'pos' : v < 0 ? 'neg' : '';
    const mmss = sec => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')}`;
    const ymd = s => s ? `${+s.slice(4, 6)}/${+s.slice(6, 8)}` : '-';

    // 「集計: 10/28 9:42 時点（10/20〜10/26 の52試合）」。STALE_DAYS より古ければ注意の色と一言
    function updatedHTML(d) {
        const at = new Date(d.generatedAt);
        const days = (Date.now() - at) / 864e5;
        const when = at.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' });
        return `<div class="adv-updated ${days >= STALE_DAYS ? 'stale' : ''}">集計: ${when} 時点（${ymd(d.from)}〜${ymd(d.to)} の ${d.games} 試合）${
            days >= STALE_DAYS ? `・${Math.floor(days)}日前の集計です。データの更新が必要です` : ''}</div>`;
    }

    /* ── 行のデータ（100ポゼッションあたりに直す） ── */
    function onOffRows(d) {
        return d.players.map(p => {
            const onO = rating(p.pf, p.offPoss), onD = rating(p.pa, p.defPoss);
            const offO = rating(p.tPF - p.pf, p.tOff - p.offPoss), offD = rating(p.tPA - p.pa, p.tDef - p.defPoss);
            const onNet = onO != null && onD != null ? onO - onD : null;
            const offNet = offO != null && offD != null ? offO - offD : null;
            return { ...p, min: p.sec / 60, onO, onD, onNet, offNet, diff: onNet != null && offNet != null ? onNet - offNet : null };
        });
    }
    const unitRows = d => d.units.map(u => {
        const o = rating(u.pf, u.offPoss), dr = rating(u.pa, u.defPoss);
        return { ...u, min: u.sec / 60, ortg: o, drtg: dr, net: o != null && dr != null ? o - dr : null };
    });
    const clutchRows = d => d.clutch.map(c => {
        const o = rating(c.pf, c.offPoss), dr = rating(c.pa, c.defPoss);
        return { ...c, min: c.sec / 60, pct: c.games ? c.w / c.games : null, ortg: o, drtg: dr, net: o != null && dr != null ? o - dr : null };
    });

    /* ── 表 ── */
    const team = abbr => `<a class="plain-link" href="${NBA.link.team(abbr)}"><b>${esc(abbr)}</b></a>`;
    const person = (id, name) => `<a class="plain-link" href="${NBA.link.player(id)}">${esc(name)}</a>`;
    const shell = wrap => { wrap.innerHTML = '<div class="adv-scroll"><table class="adv-table"><thead></thead><tbody></tbody></table></div>'; return wrap.querySelector('.adv-scroll'); };

    function renderOnOff(wrap, rows, { showTeam = true } = {}) {
        if (!rows.length) { wrap.innerHTML = '<div class="msg">該当する選手がいません</div>'; return; }
        const cols = [
            { key: 'name', label: 'Player', cls: 'l', get: r => r.name, asc: true },
            ...(showTeam ? [{ key: 'team', label: 'Team', cls: 'l', get: r => r.team, asc: true }] : []),
            { key: 'gp', label: 'GP', get: r => r.gp },
            { key: 'min', label: 'MIN', get: r => r.min },
            { key: 'boxPm', label: '+/-', get: r => r.boxPm, title: '公式のボックススコアの +/- の合計' },
            { key: 'onO', label: 'On ORtg', get: r => r.onO, title: '出場中にチームが100ポゼッションで取った得点' },
            { key: 'onD', label: 'On DRtg', get: r => r.onD, asc: true, title: '出場中に相手が100ポゼッションで取った得点' },
            { key: 'onNet', label: 'On Net', get: r => r.onNet },
            { key: 'offNet', label: 'Off Net', get: r => r.offNet, title: 'ベンチにいる間の Net' },
            { key: 'diff', label: 'On − Off', get: r => r.diff, title: 'On Net − Off Net。大きいほど、その選手がいるとチームが良くなる' },
        ];
        NBA.ui.sortable(shell(wrap), {
            rows, cols, initial: { key: 'diff', asc: false },
            render: r => `<tr><td class="l">${person(r.id, r.name)}</td>${showTeam ? `<td class="l">${team(r.team)}</td>` : ''}
                <td>${r.gp}</td><td>${mmss(r.sec)}</td><td class="${cls(r.boxPm)}">${r.boxPm > 0 ? '+' : ''}${r.boxPm}</td>
                <td>${f1(r.onO)}</td><td>${f1(r.onD)}</td><td class="${cls(r.onNet)}">${sgn(r.onNet)}</td>
                <td class="${cls(r.offNet)}">${sgn(r.offNet)}</td><td class="adv-key ${cls(r.diff)}">${sgn(r.diff)}</td></tr>`,
        });
    }

    function renderUnits(wrap, rows, { showTeam = true } = {}) {
        if (!rows.length) { wrap.innerHTML = '<div class="msg">該当するラインナップがありません</div>'; return; }
        const cols = [
            { key: 'names', label: '5人', cls: 'l', sort: false, get: () => 0 },
            ...(showTeam ? [{ key: 'team', label: 'Team', cls: 'l', get: r => r.team, asc: true }] : []),
            { key: 'gp', label: 'GP', get: r => r.gp },
            { key: 'min', label: 'MIN', get: r => r.min },
            { key: 'diffPts', label: '得点-失点', get: r => r.pf - r.pa },
            { key: 'ortg', label: 'ORtg', get: r => r.ortg },
            { key: 'drtg', label: 'DRtg', get: r => r.drtg, asc: true },
            { key: 'net', label: 'NET', get: r => r.net },
        ];
        NBA.ui.sortable(shell(wrap), {
            rows, cols, initial: { key: 'min', asc: false },
            render: r => `<tr><td class="l adv-unit">${r.ids.map((id, i) => person(id, r.names[i])).join(' · ')}</td>${showTeam ? `<td class="l">${team(r.team)}</td>` : ''}
                <td>${r.gp}</td><td>${mmss(r.sec)}</td><td>${r.pf}-${r.pa}</td><td>${f1(r.ortg)}</td><td>${f1(r.drtg)}</td>
                <td class="adv-key ${cls(r.net)}">${sgn(r.net)}</td></tr>`,
        });
    }

    function renderClutch(wrap, rows) {
        const cols = [
            { key: 'team', label: 'Team', cls: 'l', get: r => r.team, asc: true },
            { key: 'games', label: '接戦', get: r => r.games, title: '残り5分で5点差以内になった試合' },
            { key: 'pct', label: 'W-L', get: r => r.pct, title: '接戦の試合の勝敗' },
            { key: 'min', label: 'MIN', get: r => r.min, title: 'Clutch の時間の合計' },
            { key: 'diffPts', label: '得点-失点', get: r => r.pf - r.pa },
            { key: 'ortg', label: 'ORtg', get: r => r.ortg },
            { key: 'drtg', label: 'DRtg', get: r => r.drtg, asc: true },
            { key: 'net', label: 'NET', get: r => r.net },
        ];
        NBA.ui.sortable(shell(wrap), {
            rows, cols, initial: { key: 'pct', asc: false },
            render: r => `<tr><td class="l">${team(r.team)}</td><td>${r.games}</td><td>${r.games ? `${r.w}-${r.l}` : '-'}</td>
                <td>${r.games ? mmss(r.sec) : '-'}</td><td>${r.games ? `${r.pf}-${r.pa}` : '-'}</td>
                <td>${f1(r.ortg)}</td><td>${f1(r.drtg)}</td><td class="adv-key ${cls(r.net)}">${sgn(r.net)}</td></tr>`,
        });
    }

    /* ── 共通: 順位（1 = 一番良い）と、上から何%の位置かのバー ── */
    const TEAL = '#16a6ba', GOLD = '#F5B700';
    const rankOf = (list, get, v, lowGood) => 1 + list.filter(x => get(x) != null && (lowGood ? get(x) < v : get(x) > v)).length;
    const pctBar = (rank, n) => {
        const p = 1 - (rank - 1) / Math.max(1, n - 1);
        const c = p >= .75 ? 'var(--pos)' : p <= .25 ? 'var(--neg)' : GOLD;
        return `<div class="ap-pct"><i style="width:${Math.max(4, p * 100)}%;background:${c}"></i></div>`;
    };

    /* ── Player Profile（選手ページ）: 効率と役割・シュートの傾向・Game Score の安定度・On/Off ──
       順位の対象は出場200分以上の選手。それ未満の選手は値だけ出す */
    const PROFILE_MIN = 200;
    const ZN = { rim: 'ゴール下', paint: 'ペイント', mid: 'ミドル', corner3: 'コーナー3', ab3: 'トップ3' };
    function profileHTML(d, id) {
        const p = (d.profiles || []).find(x => x.id === String(id));
        if (!p) return null;
        const L = d.profiles.filter(x => x.min >= PROFILE_MIN), ranked = p.min >= PROFILE_MIN;
        const tile = (label, key, lowGood) => {
            const r = ranked ? rankOf(L, x => x[key], p[key], lowGood) : null;
            return `<div class="ap-tile"><span>${label}</span><b>${f1(p[key])}%</b>${r ? `${pctBar(r, L.length)}<small>${r}位 / ${L.length}</small>` : ''}</div>`;
        };
        const tiles = tile('TS%', 'ts') + tile('eFG%', 'efg') + tile('USG%', 'usg') + tile('AST%', 'ast') + tile('TOV%', 'tov', true) + tile('REB%', 'reb');

        // シュートの傾向（棒 = 打った割合。全体の50%で端まで。白い線はリーグ平均）
        const tot = Object.values(p.z).reduce((n, z) => n + z[1], 0) || 1;
        const lgTot = Object.values(d.lgZones).reduce((n, z) => n + z[1], 0) || 1;
        const zones = `<div class="ap-zr ap-zhead"><span>ゾーン</span><span>打った割合</span><span class="r">成功率</span><span class="r">平均との差</span></div>` +
            Object.entries(ZN).map(([z, label]) => {
                const [m, a] = p.z[z], freq = a / tot * 100, lgFreq = d.lgZones[z][1] / lgTot * 100;
                const fg = a ? m / a * 100 : null, lg = d.lgZones[z][1] ? d.lgZones[z][0] / d.lgZones[z][1] * 100 : null, df = fg == null || lg == null ? null : fg - lg;
                const c = df == null || a < 5 ? 'mut' : df >= 3 ? 'pos' : df <= -3 ? 'neg' : 'mut';
                return `<div class="ap-zr"><span>${label}</span><div class="ap-zbar"><i style="width:${Math.min(100, freq * 2)}%"></i><b style="left:${Math.min(100, lgFreq * 2)}%"></b></div>
                    <span class="v">${a ? f1(fg) + '%' : '-'}<small>${m}/${a}</small></span><span class="d ${c}">${df == null ? '' : sgn(df)}</span></div>`;
            }).join('') + `<div class="ap-note">棒の長さ = 打った割合（全体の50%で端まで）。白い線はリーグ平均。5本未満は差を灰色に</div>`;

        // Game Score の安定度（ばらつきが平均の30%以内なら安定、55%を超えると波あり）
        const gs = p.gs, mean = gs.reduce((n, v) => n + v, 0) / gs.length;
        const sd = Math.sqrt(gs.reduce((n, v) => n + (v - mean) ** 2, 0) / gs.length);
        const max = Math.max(...gs, 1), cv = sd / Math.max(1, mean);
        const stab = cv <= .3 ? ['安定', 'good'] : cv <= .55 ? ['普通', 'mid'] : ['波あり', 'bad'];
        const gsHTML = `<div class="ap-kv"><span>平均<b>${f1(mean)}</b></span><span>ばらつき<b>${f1(sd)}</b></span><span>安定度<span class="ap-tag ${stab[1]}">${stab[0]}</span></span></div>
            <div class="ap-gs">${gs.map(v => `<span style="height:${Math.max(3, Math.max(0, v) / max * 100)}%;${v < 0 ? 'background:var(--neg)' : ''}" title="${v}"></span>`).join('')}<div class="avg" style="bottom:${Math.max(0, mean) / max * 100}%"></div></div>
            <div class="ap-note">${gs.length}試合を古い順に。点線が平均。ばらつきが平均の30%以内なら「安定」、55%を超えると「波あり」</div>`;

        // On/Off（出場中とベンチ中の、100ポゼッションあたりの得失点差）
        const o = onOffRows(d).find(x => x.id === String(id));
        const ooHTML = o ? `<div class="ap-oo"><div class="ap-tile"><span>出場中</span><b class="${cls(o.onNet)}">${sgn(o.onNet)}</b></div><div class="ap-tile"><span>ベンチ中</span><b class="${cls(o.offNet)}">${sgn(o.offNet)}</b></div><div class="ap-tile"><span>差（On − Off）</span><b class="${cls(o.diff)}">${sgn(o.diff)}</b></div></div>`
            : '<div class="ap-note">集計の対象外です</div>';

        return `<div class="sd-title">効率と役割 <span class="ap-sub">${ranked ? `バーと順位は、出場${PROFILE_MIN}分以上の ${L.length} 人の中での位置` : `出場${PROFILE_MIN}分未満のため順位はありません`}</span></div>
            <div class="ap-tiles">${tiles}</div>
            <p class="ap-desc">TS%: FT も含めたシュートの効率 / eFG%: 3P を1.5本分に数えた FG% / USG%: 出場中の攻撃のうち、その選手が終えた割合 / AST%: 出場中に味方が決めたシュートのうち、その選手のアシストの割合 / TOV%: 攻撃を終えたうち、ターンオーバーだった割合（低いほど良い） / REB%: 出場中のリバウンドのうち、その選手が取った割合</p>
            <div class="ap-grid2">
                <div><div class="sd-title">シュートの傾向 <span class="ap-sub">打った割合と成功率</span></div><div class="ap-card">${zones}</div></div>
                <div><div class="sd-title">Game Score の安定度 <span class="ap-sub">試合ごとの出来</span></div><div class="ap-card">${gsHTML}</div>
                    <div class="sd-title" style="margin-top:14px">On / Off <span class="ap-sub">100ポゼッションあたりの得失点差</span></div>${ooHTML}</div>
            </div>`;
    }

    /* ── Team Style（チームページ）: 戦い方の型・スタイルマップ・攻守の強み・弱み（Four Factors） ── */
    function styleMapSVG(T, me) {
        const n = T.length, avg = k => T.reduce((s, x) => s + x[k], 0) / n;
        const W = 420, H = 300, L = 40, R = 12, Tp = 12, B = 30;
        const xs = T.map(x => x.tpaRate), ys = T.map(x => x.rimRate);
        const x0 = Math.floor(Math.min(...xs) - 1), x1 = Math.ceil(Math.max(...xs) + 1), y0 = Math.floor(Math.min(...ys) - 1), y1 = Math.ceil(Math.max(...ys) + 1);
        const X = v => L + (W - L - R) * (v - x0) / (x1 - x0), Y = v => Tp + (H - Tp - B) * (1 - (v - y0) / (y1 - y0));
        let g = `<line x1="${X(avg('tpaRate'))}" x2="${X(avg('tpaRate'))}" y1="${Tp}" y2="${H - B}" stroke="#55555f" stroke-dasharray="4 3"/><line x1="${L}" x2="${W - R}" y1="${Y(avg('rimRate'))}" y2="${Y(avg('rimRate'))}" stroke="#55555f" stroke-dasharray="4 3"/>`;
        g += `<text x="${W - R - 2}" y="${Tp + 10}" font-size="9.5" fill="#8b8b95" text-anchor="end">3P も ゴール下も多い</text><text x="${L + 4}" y="${H - B - 6}" font-size="9.5" fill="#8b8b95">ミドル寄り</text>`;
        // 自チームは最後に描いて前面に
        [...T].sort((a, b) => (a.team === me) - (b.team === me)).forEach(x => {
            const m = x.team === me;
            g += `<a href="${NBA.link.team(x.team)}"><circle cx="${X(x.tpaRate)}" cy="${Y(x.rimRate)}" r="${m ? 7 : 4}" fill="${m ? GOLD : TEAL}" fill-opacity="${m ? 1 : .55}"/><text x="${X(x.tpaRate) + (m ? 9 : 6)}" y="${Y(x.rimRate) + 3}" font-size="${m ? 11 : 8.5}" font-weight="${m ? 800 : 600}" fill="${m ? GOLD : '#8b8b95'}">${x.team}</text></a>`;
        });
        g += `<text x="${(L + W) / 2}" y="${H - 6}" font-size="10" fill="#8b8b95" text-anchor="middle">3P を打つ割合 →</text><text transform="translate(11 ${(Tp + H - B) / 2}) rotate(-90)" font-size="10" fill="#8b8b95" text-anchor="middle">ゴール下の割合 →</text>`;
        return `<svg class="ap-map" viewBox="0 0 ${W} ${H}">${g}</svg><div class="ap-note">横: 3P を打つ割合 / 縦: ゴール下で打つ割合。点線はリーグ平均。点を押すとそのチームへ</div>`;
    }

    function teamStyleHTML(d, abbr) {
        const T = d.teamStyle || [], t = T.find(x => x.team === abbr), n = T.length;
        if (!t) return null;
        const avg = k => T.reduce((s, x) => s + x[k], 0) / n;
        const tile = (label, key, unit) => {
            const r = rankOf(T, x => x[key], t[key]);
            return `<div class="ap-tile"><span>${label}</span><b>${f1(t[key])}${unit}</b>${pctBar(r, n)}<small>多い順 ${r}位 · 平均 ${f1(avg(key))}</small></div>`;
        };
        const tiles = tile('PACE', 'pace', '') + tile('3P を打つ割合', 'tpaRate', '%') + tile('ゴール下の割合', 'rimRate', '%') + tile('ミドルの割合', 'midRate', '%') + tile('FT をもらう', 'ftRate', '') + tile('速攻の得点', 'fb', '');
        // 型の一言: 上位5位・下位5位に入る項目
        const tags = [];
        const top = (k, label, lowLabel) => { const r = rankOf(T, x => x[k], t[k]); if (r <= 5) tags.push(['acc', label]); else if (lowLabel && r > n - 5) tags.push(['mid', lowLabel]); };
        top('pace', '速い展開', 'ゆっくり攻める'); top('tpaRate', '3P を多く打つ', '3P は少なめ'); top('rimRate', 'ゴール下で勝負'); top('midRate', 'ミドルが多い'); top('ftRate', 'FT をよくもらう'); top('fb', '速攻が多い');
        const tagHTML = (tags.length ? tags : [['mid', '目立った偏りなし（バランス型）']]).map(([c, s]) => `<span class="ap-tag ${c}">${s}</span>`).join('');

        // 攻守の強み・弱み: 攻撃は eFG・ORB・FT が高いほど、TOV が低いほど良い。守備は相手の数字なので逆（TOV だけ高いほど良い）
        const FF = [['efg', 'eFG%', 'シュートの質'], ['tov', 'TOV%', '攻撃100回あたりの TO'], ['orb', 'ORB%', 'オフェンスリバウンドを取る割合'], ['ftr', 'FT Rate', 'FT をもらう（FTM ÷ FGA）']];
        const goodLow = (grp, k) => grp === 'ff' ? k === 'tov' : k !== 'tov';
        const strong = [], weak = [];
        const ffRows = (grp, title) => `<div class="ap-ff-grp">${title}</div>` + FF.map(([k, label, sub]) => {
            const r = rankOf(T, x => x[grp][k], t[grp][k], goodLow(grp, k)), name = (grp === 'dff' ? '守備の' : '') + label;
            if (r <= 5) strong.push(`${name}（${r}位）`); else if (r >= n - 4) weak.push(`${name}（${r}位）`);
            return `<div class="ap-ff-row"><span>${label}<small>${grp === 'dff' ? '相手の' : ''}${sub}</small></span><span class="v">${f1(t[grp][k])}</span><span class="r">${r}位${pctBar(r, n)}</span></div>`;
        }).join('');
        const ffBody = ffRows('ff', '攻撃') + ffRows('dff', '守備（相手に許した数字）');
        const ffHTML = `<div class="ap-ff-sum"><div><b style="color:var(--pos)">強み</b>${strong.join('・') || '目立った強みなし'}</div><div><b style="color:var(--neg)">弱み</b>${weak.join('・') || '目立った弱みなし'}</div></div>${ffBody}
            <div class="ap-note">順位は良い順（守備は相手の数字が悪いほど上）。上位5位を強み、下位5位を弱みに。</div>`;

        return `<div class="ap-tags">${tagHTML}</div>
            <div class="ap-tiles">${tiles}</div>
            <div class="ap-grid2 ap-eq">
                <div><div class="sd-title">スタイルマップ</div><div class="ap-card">${styleMapSVG(T, abbr)}</div></div>
                <div><div class="sd-title">攻守の強み・弱み <span class="ap-sub">Four Factors の今季の順位</span></div><div class="ap-card">${ffHTML}</div></div>
            </div>`;
    }

    NBA.advanced = { load, updatedHTML, onOffRows, unitRows, clutchRows, renderOnOff, renderUnits, renderClutch, profileHTML, teamStyleHTML, styleMapSVG, f1, sgn, cls, mmss };
})();
