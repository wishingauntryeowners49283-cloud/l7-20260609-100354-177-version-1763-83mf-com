(function () {
  function initPlayer(shell) {
    var video = shell.querySelector('.movie-video');
    var startButton = shell.querySelector('.player-start');
    var status = shell.querySelector('.player-status');
    var media = shell.getAttribute('data-media');
    var loaded = false;
    var hls = null;

    function setStatus(text) {
      if (status) {
        status.textContent = text || '';
      }
    }

    function attach() {
      if (loaded || !video || !media) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = media;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(media);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setStatus('播放暂不可用，请稍后重试');
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setStatus('正在恢复播放');
              hls.recoverMediaError();
            } else {
              setStatus('播放暂不可用，请稍后重试');
              hls.destroy();
            }
          }
        });
        return;
      }
      setStatus('播放暂不可用，请稍后重试');
    }

    function play() {
      attach();
      shell.classList.add('is-started');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          shell.classList.remove('is-started');
        });
      }
    }

    function toggle() {
      if (!loaded || video.paused) {
        play();
      } else {
        video.pause();
      }
    }

    if (startButton) {
      startButton.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', toggle);
      video.addEventListener('play', function () {
        shell.classList.add('is-started');
        video.setAttribute('controls', 'controls');
        setStatus('');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          shell.classList.remove('is-started');
        }
      });
      video.addEventListener('ended', function () {
        shell.classList.remove('is-started');
      });
    }
  }

  document.querySelectorAll('.player-shell').forEach(initPlayer);
})();
