document.documentElement.classList.add(
  'ontouchstart' in document.documentElement ? 'touch' : 'no-touch'
);

function DOMReady(callback) {
  document.readyState === 'interactive' || document.readyState === 'complete'
    ? callback()
    : document.addEventListener('DOMContentLoaded', callback);
}

DOMReady(function () {
  document
    .querySelector('#open-mobile-menu')
    .addEventListener('click', function () {
      document.documentElement.classList.add('mobile-menu-opened');
    });

  document
    .querySelector('#close-mobile-menu')
    .addEventListener('click', function () {
      document.documentElement.classList.remove('mobile-menu-opened');
    });

  document
    .querySelector('#animated-logo')
    .addEventListener('touchstart', function (event) {
      event.currentTarget.classList.toggle('touched');
    });

  var whyShtobarBtn = document.querySelector('#why-shtobar__btn');
  if (whyShtobarBtn) {
    whyShtobarBtn.addEventListener('click', function () {
      document.documentElement.classList.toggle('why-shtobar');
    });
  }
});
