(function () {
  function startPlayer(shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.player-overlay');

    if (!video) {
      return;
    }

    var stream = shell.getAttribute('data-stream');

    if (!stream) {
      return;
    }

    if (!video.dataset.ready) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      video.dataset.ready = 'true';
    }

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    var playResult = video.play();

    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {});
    }
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-stream]'));

  players.forEach(function (shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.player-overlay');

    if (overlay) {
      overlay.addEventListener('click', function () {
        startPlayer(shell);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayer(shell);
        }
      });
    }
  });
})();
