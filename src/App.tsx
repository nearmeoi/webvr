import React, { useEffect, useRef, useState } from 'react';
import 'aframe'; 
import { FaVrCardboard } from 'react-icons/fa';

const LOCAL_IMAGE_PATH = '/assets/local_360.jpg';

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const rigRef = useRef<any>(null);
  
  // State Logika
  const [rotateDirection, setRotateDirection] = useState<'left' | 'right' | null>(null);
  const [showInfo, setShowInfo] = useState(false); // Untuk menampilkan popup info

  // --- LOOP ROTASI (Diperlambat sedikit agar smooth) ---
  useEffect(() => {
    let interval: any;
    if (rotateDirection) {
      interval = setInterval(() => {
        if (rigRef.current) {
          const currentRotation = rigRef.current.getAttribute('rotation');
          // Kecepatan 0.4 agar tidak bikin pusing
          const speed = rotateDirection === 'left' ? 0.4 : -0.4;
          
          rigRef.current.setAttribute('rotation', {
            x: 0, 
            y: currentRotation.y + speed, 
            z: 0
          });
        }
      }, 16); 
    }
    return () => clearInterval(interval);
  }, [rotateDirection]);

  // Fungsi Masuk VR
  const enterVRMode = () => {
    const scene = document.querySelector('a-scene');
    if (scene) { scene.enterVR(); }
  };

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 1500);
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw', backgroundColor: '#000', fontFamily: 'Arial, sans-serif' }}>
      
      <a-scene embedded vr-mode-ui="enabled: false">
        <a-assets>
          <img id="skyTexture" src={LOCAL_IMAGE_PATH} crossOrigin="anonymous" alt="360 view" />
        </a-assets>

        {/* --- CAMERA RIG (BADAN) --- */}
        <a-entity id="cameraRig" ref={rigRef} rotation="0 0 0">
           
           {/* KAMERA (KEPALA) */}
           <a-entity camera look-controls="reverseMouseDrag: true" position="0 1.6 0">
              
              {/* CURSOR (RETICLE) - Dibuat lebih responsif */}
              <a-cursor 
                id="cursor"
                color="#00ff00" // Warna hijau neon
                scale="1 1 1"
                fuse="true" 
                fuseTimeout="1500" // Butuh 1.5 detik menatap untuk 'klik' info
                raycaster="objects: .clickable"
                // Animasi saat klik/fuse
                animation__click="property: scale; startEvents: click; from: 0.1 0.1 0.1; to: 1 1 1; dur: 150"
                animation__fusing="property: scale; startEvents: fusing; from: 1 1 1; to: 0.1 0.1 0.1; dur: 1500"
                // Ganti warna saat kena objek
                event-set__mouseenter="_event: mouseenter; color: yellow"
                event-set__mouseleave="_event: mouseleave; color: #00ff00"
              ></a-cursor>

              {/* --- HUD POPUP INFO (Muncul di depan muka saat Info dilihat) --- */}
              <a-plane
                visible={showInfo}
                position="0 0 -0.8" // Tepat di depan muka (dekat)
                width="1" height="0.6"
                color="black" opacity="0.8"
                material="shader: flat; transparent: true"
              >
                 <a-text value="INFO LOKASI" align="center" position="0 0.2 0" color="yellow" width="2"></a-text>
                 <a-text value="Ini adalah contoh Hotspot.\nAnda bisa melihat detail objek di sini." align="center" position="0 0 0" color="white" width="1.5"></a-text>
                 <a-text value="(Tatap Info lagi untuk tutup)" align="center" position="0 -0.2 0" color="gray" width="1"></a-text>
              </a-plane>

           </a-entity>

           {/* --- TOMBOL NAVIGASI KIRI (Interaktif) --- */}
           <a-entity
             class="clickable"
             position="-1.5 1.6 -1.5" 
             rotation="0 45 0"
             onMouseEnter={() => setRotateDirection('left')} 
             onMouseLeave={() => setRotateDirection(null)}
             // Animasi Membesar saat dilihat (Juice!)
             animation__enter="property: scale; to: 1.2 1.2 1.2; startEvents: mouseenter; dur: 200"
             animation__leave="property: scale; to: 1 1 1; startEvents: mouseleave; dur: 200"
           >
             <a-circle color="#000" opacity="0.5" radius="0.3" material="side: double; shader: flat"></a-circle>
             <a-ring color="white" radius-inner="0.28" radius-outer="0.3"></a-ring>
             <a-text value="<" align="center" color="#00ff00" width="8" position="-0.05 0 0"></a-text>
             <a-text value="PUTAR" align="center" color="white" width="2.5" position="0 -0.45 0"></a-text>
           </a-entity>

           {/* --- TOMBOL NAVIGASI KANAN (Interaktif) --- */}
           <a-entity
             class="clickable"
             position="1.5 1.6 -1.5" 
             rotation="0 -45 0"
             onMouseEnter={() => setRotateDirection('right')} 
             onMouseLeave={() => setRotateDirection(null)}
             animation__enter="property: scale; to: 1.2 1.2 1.2; startEvents: mouseenter; dur: 200"
             animation__leave="property: scale; to: 1 1 1; startEvents: mouseleave; dur: 200"
           >
             <a-circle color="#000" opacity="0.5" radius="0.3" material="side: double; shader: flat"></a-circle>
             <a-ring color="white" radius-inner="0.28" radius-outer="0.3"></a-ring>
             <a-text value=">" align="center" color="#00ff00" width="8" position="0.05 0 0"></a-text>
             <a-text value="PUTAR" align="center" color="white" width="2.5" position="0 -0.45 0"></a-text>
           </a-entity>

        </a-entity> {/* End Camera Rig */}


        {/* --- HOTSPOT INFO (Objek di Dunia 3D) --- */}
        {/* Ditaruh agak jauh di depan (z: -4) */}
        <a-entity 
          position="0 1.6 -4" 
          class="clickable"
          // Saat cursor "fuse" (penuh), ubah state showInfo
          events={{ click: () => setShowInfo(!showInfo) }}
          // Animasi muter-muter supaya menarik perhatian
          animation="property: rotation; to: 0 360 0; loop: true; dur: 5000; easing: linear"
          // Animasi membesar saat dilihat
          animation__enter="property: scale; to: 1.5 1.5 1.5; startEvents: mouseenter; dur: 200"
          animation__leave="property: scale; to: 1 1 1; startEvents: mouseleave; dur: 200"
        >
          {/* Ikon 'i' */}
          <a-circle color="#0984e3" radius="0.4" opacity="0.8"></a-circle>
          <a-text value="i" align="center" color="white" width="10" position="0 0 0.05"></a-text>
          <a-text value="LIHAT SINI" align="center" color="white" width="4" position="0 -0.6 0"></a-text>
        </a-entity>

        <a-sky src="#skyTexture" rotation="0 -90 0"></a-sky>
      </a-scene>

      {/* --- UI MASUK VR --- */}
      <div style={{
        position: 'absolute', bottom: '30px', width: '100%',
        display: 'flex', justifyContent: 'center', pointerEvents: 'none'
      }}>
        <button 
          onClick={enterVRMode}
          style={{
            pointerEvents: 'auto',
            background: 'linear-gradient(45deg, #0984e3, #00cec9)',
            color: 'white', border: 'none', padding: '12px 40px',
            borderRadius: '50px', fontSize: '1.2rem', fontWeight: 'bold',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)', // Efek Glow neon
            display: 'flex', alignItems: 'center', gap: '10px',
            cursor: 'pointer'
          }}
        >
          <FaVrCardboard size={24} />
          MULAI VR EXPERIENCE
        </button>
      </div>

      {/* Loading Screen Keren */}
      {!isLoaded && (
        <div style={{position: 'absolute', inset: 0, background: '#111', color: '#00cec9', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
          <h2 style={{fontFamily: 'monospace'}}>INITIALIZING VR SYSTEM...</h2>
          <div style={{width: '200px', height: '4px', background: '#333', marginTop: '10px'}}>
             <div style={{width: '100%', height: '100%', background: '#00cec9', animation: 'load 1.5s ease-out'}} />
          </div>
        </div>
      )}

      {/* Style untuk animasi CSS */}
      <style>{`@keyframes load { from { width: 0; } to { width: 100%; } }`}</style>
    </div>
  );
};

export default App;