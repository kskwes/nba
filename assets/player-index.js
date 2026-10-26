/* ═══════════════════════════════════════════════
   選手の索引（30チームのロスターから作る）と検索ボックス
   players/index.html と players/player.html で共通
   ロスターは api.js が1日キャッシュするので、2回目以降はほぼ取得しない
   ═══════════════════════════════════════════════ */
window.NBA = window.NBA || {};

(function () {
    let promise = null;

    // { players: [{ id, displayName, team, teamAbbr, teamId, position, jersey, headshot, expYears, dob }], teams: [...] }
    NBA.playerIndex = function () {
        if (promise) return promise;
        promise = Promise.allSettled(NBA.teams.ids.map(id => NBA.api.roster(id))).then(results => {
            const players = [], teams = [];
            for (const r of results) {
                if (r.status !== 'fulfilled') continue;
                const data = r.value;
                const teamName = data.team?.displayName || '';
                const teamAbbr = normAbbr(data.team?.abbreviation || '');
                if (data.team?.id) {
                    teams.push({
                        id:           String(data.team.id),
                        displayName:  teamName,
                        abbreviation: teamAbbr,
                        location:     data.team.location || '',
                        nickname:     data.team.name || data.team.shortDisplayName || '',
                        logo:         data.team.logo || data.team.logos?.[0]?.href || '',
                    });
                }
                for (const p of (data.athletes || [])) {
                    players.push({
                        id:          String(p.id),
                        displayName: p.displayName || p.fullName || '',
                        team:        teamName,
                        teamAbbr,
                        teamId:      String(data.team?.id || ''),
                        position:    p.position?.abbreviation || '',
                        jersey:      p.jersey || '',
                        headshot:    p.headshot?.href || '',
                        expYears:    p.experience?.years ?? null,  // 今季時点の NBA 経験年数
                        dob:         p.dateOfBirth || '',              // ISO 形式（選手ページの Bio 用）
                    });
                }
            }
            return {
                players: players.sort((a, b) => a.displayName.localeCompare(b.displayName)),
                teams: teams.sort((a, b) => a.displayName.localeCompare(b.displayName)),
            };
        });
        return promise;
    };

    // 選手検索。選んだ選手は onSelect(player) に渡す（既定は選手ページへ移動）
    NBA.playerSearch = function (input, sugg, { onSelect = p => { location.href = NBA.link.player(p.id); }, onClear } = {}) {
        let timer = null, index = null;
        const placeholder = input.placeholder;
        input.placeholder = 'Loading player data...';
        input.disabled = true;
        NBA.playerIndex().then(ix => {
            index = ix;
            input.placeholder = placeholder;
            input.disabled = false;
        });

        const clear = () => { sugg.innerHTML = ''; };
        function show(list) {
            sugg.innerHTML = '';
            if (!list.length) {
                sugg.innerHTML = '<li><span style="color:var(--muted);font-size:13px">No players found</span></li>';
                return;
            }
            list.forEach(a => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <img class="sugg-photo" src="${esc(a.headshot || FALLBACK_IMG)}" alt="" onerror="this.src='${FALLBACK_IMG}'">
                    <div>
                        <div class="sugg-name">${esc(a.displayName)}</div>
                        <div class="sugg-sub">${esc([a.team, a.position].filter(Boolean).join(' · '))}</div>
                    </div>`;
                li.addEventListener('click', () => { input.value = a.displayName; clear(); onSelect(a); });
                sugg.appendChild(li);
            });
        }
        input.addEventListener('input', () => {
            clearTimeout(timer);
            const q = input.value.trim();
            if (q.length < 1) { clear(); onClear?.(); return; }
            if (q.length < 2 || !index) { clear(); return; }
            timer = setTimeout(() => {
                const lower = q.toLowerCase();
                show(index.players.filter(p => p.displayName.toLowerCase().includes(lower)).slice(0, 8));
            }, 150);
        });
        input.addEventListener('keydown', e => { if (e.key === 'Escape') clear(); });
        document.addEventListener('click', e => { if (!e.target.closest('.search-wrap')) clear(); });
    };
})();
