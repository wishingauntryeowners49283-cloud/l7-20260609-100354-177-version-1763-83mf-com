import { H as Hls } from './hls-vendor.js';

export function initMoviePlayer(options) {
  const video = document.querySelector(options.videoSelector);
  const overlay = document.querySelector(options.overlaySelector);
  const source = options.source;
  let attached = false;
  let hls = null;

  if (!video || !source) {
    return;
  }

  const attachSource = () => {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 60
      });

      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  };

  const play = async () => {
    attachSource();

    if (overlay) {
      overlay.classList.add('player-overlay-hidden');
    }

    try {
      await video.play();
    } catch (error) {
      if (overlay) {
        overlay.classList.remove('player-overlay-hidden');
      }
    }
  };

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  video.addEventListener('click', () => {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', () => {
    if (overlay) {
      overlay.classList.add('player-overlay-hidden');
    }
  });

  window.addEventListener('pagehide', () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
