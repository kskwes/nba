/* ─── Hamburger menu ─── */
(function () {
    const hamburgerWrap = document.getElementById('hamburger-wrap');
    const hamburgerBtn  = document.getElementById('hamburger-btn');
    if (!hamburgerWrap || !hamburgerBtn) return;
    hamburgerBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        hamburgerWrap.classList.toggle('open');
    });
    document.addEventListener('click', function () {
        hamburgerWrap.classList.remove('open');
    });
}());
