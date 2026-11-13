(function () {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  try {
    var nav = performance.getEntriesByType && performance.getEntriesByType('navigation');
    var isReload = (nav && nav.length > 0 && nav[0].type === 'reload') || (performance && performance.navigation && performance.navigation.type === 1);
    if (isReload) {
      sessionStorage.removeItem('portfolio_restore_pending');
      sessionStorage.setItem('portfolio_home_scroll', '0');
      if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname);
      }
      window.scrollTo(0, 0);
    }
  } catch (e) {}

  try {
    var savedTheme = localStorage.getItem('richard-portfolio-theme');
    var theme = savedTheme === 'light' || savedTheme === 'dark'
      ? savedTheme
      : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (error) {
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.style.colorScheme = 'dark';
  }
})();
