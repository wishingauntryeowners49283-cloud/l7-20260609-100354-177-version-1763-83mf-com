import { H as Hls } from '../vendor/hls.js';

document.addEventListener('DOMContentLoaded', function () {
  var video = document.querySelector('video[data-src]');
  var trigger = document.querySelector('[data-player-trigger]');
  var message = document.querySelector('[data-player-message]');

  if (!video) {
    return;
  }

  var source = video.getAttribute('data-src');
  var hls = null;
  var isReady = false;

  function setMessage(text) {
    if (message) {
      message.textContent = text || '';
    }
  }

  function hideTrigger() {
    if (trigger) {
      trigger.classList.add('is-hidden');
    }
  }

  function attachSource() {
    if (isReady) {
      return Promise.resolve();
    }

    setMessage('正在加载播放源…');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      isReady = true;
      setMessage('');
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      return new Promise(function (resolve) {
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          isReady = true;
          setMessage('');
          resolve();
        });

        hls.on(Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            setMessage('网络错误，正在重试…');
            hls.startLoad();
            return;
          }

          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            setMessage('媒体错误，正在恢复…');
            hls.recoverMediaError();
            return;
          }

          setMessage('播放器错误，请刷新页面后重试。');
          hls.destroy();
        });
      });
    }

    setMessage('当前浏览器不支持 HLS 播放。');
    return Promise.reject(new Error('HLS is not supported'));
  }

  function playVideo() {
    attachSource()
      .then(function () {
        hideTrigger();
        return video.play();
      })
      .catch(function () {
        setMessage('播放未能启动，请再次点击播放器。');
      });
  }

  if (trigger) {
    trigger.addEventListener('click', playVideo);
  }

  video.addEventListener('play', hideTrigger);
  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });
});
