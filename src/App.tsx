import React, { useEffect, useState, useRef } from 'react';
import 'aframe';
import { FaVrCardboard, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

// --- DEFINISI KOMPONEN A-FRAME (DILUAR REACT) ---
// Ini wajib ditaruh di sini agar terdaftar SEBELUM scene dimuat
if (typeof (window as any).AFRAME !== 'undefined') {
  const AFRAME = (window as any).AFRAME;

  // Hapus definisi lama jika ada (Hot Reload Safe)
  ['vid-handler', 'audio-handler', 'info-toggler', 'close-handler', 'open-video', 'scene-changer'].forEach(name => {
    delete AFRAME.components[name];
  });

  // 1. Handler Klik Generik (Untuk mengirim event ke React)
  const createClickComponent = (name: string, eventName: string) => {
    AFRAME.registerComponent(name, {
      schema: { target: { type: 'string', default: '' } },
      init: function () {
        // Gunakan bind untuk menjaga scope
        this.onClick = this.onClick.bind(this);
        // Event click (fuse) & click manual (mouse)
        this.el.addEventListener('click', this.onClick);
      },
      remove: function () {
        this.el.removeEventListener('click', this.onClick);
      },
      onClick: function () {
        // Kirim event global
        window.dispatchEvent(new CustomEvent(eventName, { detail: this.data.target }));
      }
    });
  };

  createClickComponent('info-toggler', 'toggleInfoEvent');
  createClickComponent('close-handler', 'closePanelEvent');
  createClickComponent('open-video', 'openVideoEvent');
  createClickComponent('scene-changer', 'changeSceneEvent');
  createClickComponent('audio-handler', 'toggleAudioEvent');

  // 2. Handler Video Khusus (Langsung manipulasi DOM video)
  AFRAME.registerComponent('vid-handler', {
    init: function () {
      this.onClick = () => {
        const v = document.querySelector('#promovideo') as HTMLVideoElement;
        if (v) { v.paused ? v.play() : v.pause(); }
      };
      this.el.addEventListener('click', this.onClick);
    },
    remove: function () {
      this.el.removeEventListener('click', this.onClick);
    }
  });
}

// --- DATA SCENE ---
const SCENES = {
  sechelt: {
    id: 'sechelt',
    image: '/assets/sechelt.jpg',
    title: 'DERMAGA SECHELT',
    desc: 'Lokasi: Gurun Atacama\nSuasana: Gersang & Luas',
    nextScene: 'mountain'
  },
  mountain: {
    id: 'mountain',
    image: '/assets/puydesancy.jpg',
    title: 'PUNCAK GUNUNG',
    desc: 'Lokasi: Pegunungan Andes\nSuasana: Dingin & Berawan',
    nextScene: 'sechelt'
  }
};

const VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
const AUDIO_URL = 'https://cdn.pixabay.com/download/audio/2022/10/24/audio_03d6d07730.mp3';

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const [currentSceneId, setCurrentSceneId] = useState<'sechelt' | 'mountain'>('sechelt');
  const currentScene = SCENES[currentSceneId];

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- LOGIKA UTAMA (REACT) ---
  const changeScene = (targetId: string) => {
    setShowInfo(false);
    setCurrentSceneId(targetId as 'sechelt' | 'mountain');
  };

  const startExperience = () => {
    const scene = document.querySelector('a-scene');
    if (scene) { scene.enterVR(); }

    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(e => console.error("Video error:", e));
      videoRef.current.volume = 0.5;
    }
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio error:", e));
      audioRef.current.volume = 0.3;
    }
  };

  useEffect(() => {
    // Event Listeners untuk komunikasi A-Frame -> React
    const handleToggleInfo = () => setShowInfo(prev => !prev);

    const handleClosePanel = (e: any) => {
      const target = e.detail;
      if (target === 'info') setShowInfo(false);
      if (target === 'video') setShowVideo(false);
    };

    const handleOpenVideo = () => setShowVideo(true);
    const handleChangeScene = (e: any) => changeScene(e.detail);

    const handleToggleAudio = () => {
      setIsMuted(prev => {
        const newState = !prev;
        if (audioRef.current) audioRef.current.muted = newState;
        if (videoRef.current) videoRef.current.muted = newState;
        return newState;
      });
    };

    window.addEventListener('toggleInfoEvent', handleToggleInfo);
    window.addEventListener('closePanelEvent', handleClosePanel);
    window.addEventListener('openVideoEvent', handleOpenVideo);
    window.addEventListener('changeSceneEvent', handleChangeScene);
    window.addEventListener('toggleAudioEvent', handleToggleAudio);

    setTimeout(() => setIsLoaded(true), 1000);

    return () => {
      window.removeEventListener('toggleInfoEvent', handleToggleInfo);
      window.removeEventListener('closePanelEvent', handleClosePanel);
      window.removeEventListener('openVideoEvent', handleOpenVideo);
      window.removeEventListener('changeSceneEvent', handleChangeScene);
      window.removeEventListener('toggleAudioEvent', handleToggleAudio);
    };
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw', backgroundColor: '#000', fontFamily: 'Arial, sans-serif' }}>

      <a-scene embedded vr-mode-ui="enabled: false">
        <a-assets>
          {/* Jangan cache image di sini agar bisa ganti scene */}
          <video ref={videoRef} id="promovideo" src={VIDEO_URL} loop crossOrigin="anonymous" playsInline webkit-playsinline="true"></video>
          <audio ref={audioRef} id="windAudio" src={AUDIO_URL} loop crossOrigin="anonymous"></audio>
        </a-assets>

        <a-entity camera look-controls="reverseMouseDrag: true" position="0 1.6 0">
          {/* KURSOR HUD */}
          {/* interval: 100 membuat raycaster mengecek setiap 100ms (hemat performa tapi responsif) */}
          <a-entity
            cursor="fuse: true; fuseTimeout: 1500"
            position="0 0 -1"
            geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
            material="color: #ffffff; shader: flat; opacity: 0.9"
            raycaster="objects: .clickable; interval: 100; far: 30"
            animation__fusing="property: scale; startEvents: fusing; from: 1 1 1; to: 0.1 0.1 0.1; dur: 1500"
            animation__reset="property: scale; startEvents: mouseleave; to: 1 1 1; dur: 200"
            animation__color="property: material.color; startEvents: fusing; from: #ffffff; to: #bdc3c7; dur: 100"
            animation__colorreset="property: material.color; startEvents: mouseleave; to: #ffffff; dur: 100"
          ></a-entity>
        </a-entity>


        {/* --- TV VIRTUAL (Kiri) --- */}
        {showVideo ? (
          <a-entity position="-3 2 -5" rotation="0 30 0">
            <a-plane width="4.2" height="2.5" color="white" position="0 0 -0.15" opacity="0.1" shader="flat"></a-plane>
            <a-box color="#111" width="4" height="2.3" depth="0.1" position="0 0 -0.1"></a-box>

            <a-plane vid-handler="" class="clickable" src="#promovideo" width="3.8" height="2.1" position="0 0 0.01"></a-plane>

            <a-text value="VIDEO PROFIL" align="center" position="0 -1.4 0" color="white" width="4" font="kelsonsans"></a-text>

            {/* Tombol X (Close) - Hitbox Diperbesar */}
            <a-entity position="2.2 1.3 0.1">
              <a-circle
                close-handler="target: video"
                class="clickable"
                radius="0.3" // Radius fisik agar mudah ditatap
                material="color: black; opacity: 0.6; transparent: true"
                animation__hover="property: scale; to: 1.2 1.2 1; startEvents: mouseenter; dur: 200"
                animation__leave="property: scale; to: 1 1 1; startEvents: mouseleave; dur: 200"
              >
                <a-text value="X" align="center" color="white" width="8"></a-text>
                <a-ring radius-inner="0.28" radius-outer="0.3" color="white"></a-ring>
              </a-circle>
            </a-entity>
          </a-entity>
        ) : (
          // ICON BUKA VIDEO
          <a-entity position="-3 2 -5" rotation="0 30 0">
            <a-entity
              open-video=""
              class="clickable"
              // Hitbox Solid Transparan (Opacity 0.01 agar raycaster mendeteksi)
              geometry="primitive: sphere; radius: 0.6"
              material="color: white; opacity: 0.01; transparent: true"
              animation__hover="property: scale; to: 1.1 1.1 1; startEvents: mouseenter; dur: 200"
              animation__leave="property: scale; to: 1 1 1; startEvents: mouseleave; dur: 200"
            >
              <a-ring radius-inner="0.38" radius-outer="0.4" color="white"></a-ring>
              <a-triangle
                vertex-a="0 0.15 0" vertex-b="-0.1 -0.1 0" vertex-c="0.1 -0.1 0"
                color="white" position="0.03 0 0.01" rotation="0 0 -90">
              </a-triangle>
              <a-text value="BUKA VIDEO" align="center" position="0 -0.6 0" width="4" color="white"></a-text>
              <a-animation attribute="position" to="0 0.1 0" direction="alternate" dur="2000" repeat="indefinite"></a-animation>
            </a-entity>
          </a-entity>
        )}


        {/* --- KONTROL MUSIK --- */}
        <a-entity position="0 3.5 -4" rotation="20 0 0">
          <a-entity
            audio-handler=""
            class="clickable"
            // Hitbox Solid
            geometry="primitive: sphere; radius: 0.4"
            material="color: white; opacity: 0.01; transparent: true"
            animation__hover="property: scale; to: 1.2 1.2 1; startEvents: mouseenter; dur: 200"
            animation__leave="property: scale; to: 1 1 1; startEvents: mouseleave; dur: 200"
          >
            <a-ring radius-inner="0.28" radius-outer="0.3" color="white"></a-ring>
            <a-entity position="-0.05 0 0" scale="0.7 0.7 0.7">
              <a-box color="white" width="0.15" height="0.15" depth="0.05" position="-0.1 0 0"></a-box>
              <a-cone color="white" radius-bottom="0.15" radius-top="0.05" height="0.2" rotation="0 0 -90" position="0.1 0 0"></a-cone>
              {!isMuted && (
                <a-entity position="0.25 0 0">
                  <a-ring radius-inner="0.1" radius-outer="0.12" theta-length="60" theta-start="-30" color="white"></a-ring>
                  <a-ring radius-inner="0.2" radius-outer="0.22" theta-length="60" theta-start="-30" color="white"></a-ring>
                </a-entity>
              )}
              {isMuted && (
                <a-text value="X" color="white" align="center" width="5" position="0.1 0 0.1"></a-text>
              )}
            </a-entity>
            <a-text value={isMuted ? "SUARA: OFF" : "SUARA: ON"} align="center" position="0 -0.5 0" width="3" color="white"></a-text>
          </a-entity>
        </a-entity>


        {/* --- HOTSPOT INFO --- */}
        <a-entity position="3.5 1.6 -4.5" rotation="0 -45 0">
          <a-entity
            info-toggler=""
            class="clickable"
            // Hitbox Solid
            geometry="primitive: sphere; radius: 0.5"
            material="color: white; opacity: 0.01; transparent: true"
            animation__scale="property: scale; to: 1.1 1.1 1; startEvents: mouseenter; dur: 300; easing: easeOutElastic"
            animation__scalereset="property: scale; to: 1 1 1; startEvents: mouseleave; dur: 300"
          >
            <a-sphere radius="0.08" position="0 0.25 0" color="white" opacity="0.9"></a-sphere>
            <a-cylinder height="0.3" radius="0.04" position="0 0 0" color="white" opacity="0.9"></a-cylinder>
            <a-ring radius-inner="0.35" radius-outer="0.36" color="white" opacity="0.6" segments-theta="64">
              <a-animation attribute="rotation" to="0 0 -360" repeat="indefinite" dur="8000" easing="linear"></a-animation>
            </a-ring>
          </a-entity>
          <a-text value="INFO LOKASI" align="center" position="0 -0.6 0" width="4" color="white" font="kelsonsans"></a-text>
        </a-entity>


        {/* --- PANEL POPUP --- */}
        <a-entity
          position="2 1.6 -3.5" rotation="0 -45 0"
          visible={showInfo.toString()}
        >
          <a-plane width="3" height="1.8" color="white" opacity="0.15" position="0 0 -0.01"></a-plane>
          <a-plane color="#000" width="2.9" height="1.7" opacity="0.9" side="double"></a-plane>
          <a-text value={currentScene.title} align="center" color="white" width="7" position="0 0.5 0.1" font="exo2bold"></a-text>
          <a-plane color="white" width="2" height="0.02" position="0 0.35 0.1"></a-plane>
          <a-text value={currentScene.desc} align="center" color="#ecf0f1" width="5" position="0 0 0.1" font="roboto"></a-text>

          {/* Tombol X (Close Info) */}
          <a-entity position="1.3 0.7 0.1">
            <a-circle
              close-handler="target: info"
              class="clickable"
              radius="0.2" // Ukuran pas untuk ditatap
              material="color: black; opacity: 0.8; transparent: true"
              animation__hover="property: scale; to: 1.1 1.1 1; startEvents: mouseenter; dur: 200"
              animation__leave="property: scale; to: 1 1 1; startEvents: mouseleave; dur: 200"
            >
              <a-text value="X" align="center" color="white" width="6"></a-text>
              <a-ring radius-inner="0.18" radius-outer="0.2" color="white"></a-ring>
            </a-circle>
          </a-entity>
        </a-entity>


        {/* --- NAVIGASI LANTAI (FIXED) --- */}
        <a-entity position="0 -1.2 -4" rotation="-90 0 0">
          <a-entity
            class="clickable"
            scene-changer={`target: ${currentScene.nextScene}`}
            // Geometry Solid (Cylinder Tipis)
            geometry="primitive: cylinder; height: 0.1; radius: 0.6"
            material="color: white; opacity: 0.01; transparent: true"

            animation__hover="property: scale; to: 1.1 1.1 1; startEvents: mouseenter; dur: 200"
            animation__leave="property: scale; to: 1 1 1; startEvents: mouseleave; dur: 200"
          >
            {/* Visual */}
            <a-ring radius-inner="0.45" radius-outer="0.5" color="white" rotation="90 0 0" position="0 0.06 0"></a-ring>
            <a-triangle
              vertex-a="0 0.25 0" vertex-b="-0.2 -0.2 0" vertex-c="0.2 -0.2 0"
              color="white" rotation="90 0 0" position="0 0.06 0">
            </a-triangle>
            <a-text value="PINDAH TEMPAT" align="center" position="0 0.3 0.6" rotation="-90 0 0" width="4" color="white"></a-text>
          </a-entity>
        </a-entity>

        {/* --- BACKGROUND 360 (KEY IS CRITICAL) --- */}
        <a-sky
          key={currentScene.id}
          src={currentScene.image}
          rotation="0 -90 0"
          animation__fade="property: material.opacity; from: 0; to: 1; dur: 1000; startEvents: loaded"
        ></a-sky>

      </a-scene>

      <div style={{ position: 'absolute', bottom: '40px', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <button onClick={startExperience} style={glassBtnStyle}>
          <FaVrCardboard size={24} /> MULAI TOUR
        </button>
      </div>

      {!isLoaded && <div style={{ position: 'absolute', inset: 0, background: '#000', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'monospace', fontSize: '1.5rem' }}>SYSTEM LOADING...</div>}
    </div>
  );
};

const glassBtnStyle: React.CSSProperties = {
  background: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(10px)',
  border: '1px solid white',
  color: 'white',
  padding: '12px 35px',
  borderRadius: '50px',
  fontSize: '1rem',
  fontWeight: 'bold',
  display: 'flex', alignItems: 'center', gap: '15px',
  boxShadow: '0 0 15px rgba(255, 255, 255, 0.2)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  textTransform: 'uppercase',
  letterSpacing: '2px'
};

export default App;