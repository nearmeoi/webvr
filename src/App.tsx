import React, { useEffect, useState } from 'react';
import 'aframe'; 
import { FaVrCardboard } from 'react-icons/fa';

const LOCAL_IMAGE_PATH = '/assets/local_360.jpg';

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // --- LOGIKA CLICK (BRIDGE REACT <-> AFRAME) ---
  useEffect(() => {
    if (typeof (window as any).AFRAME !== 'undefined') {
      const AFRAME = (window as any).AFRAME;
      delete AFRAME.components['info-toggler']; // Bersihkan yg lama

      AFRAME.registerComponent('info-toggler', {
        init: function () {
          this.el.addEventListener('click', () => {
            const event = new CustomEvent('toggleInfoEvent');
            window.dispatchEvent(event);
          });
        }
      });
    }

    const handleToggle = () => setShowInfo(prev => !prev);
    window.addEventListener('toggleInfoEvent', handleToggle);

    setTimeout(() => setIsLoaded(true), 1000);

    return () => {
      window.removeEventListener('toggleInfoEvent', handleToggle);
    };
  }, []);

  const enterVRMode = () => {
    const scene = document.querySelector('a-scene');
    if (scene) { scene.enterVR(); }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', backgroundColor: '#000', fontFamily: 'Arial, sans-serif' }}>
      
      <a-scene embedded vr-mode-ui="enabled: false">
        <a-assets>
          <img id="skyTexture" src={LOCAL_IMAGE_PATH} crossOrigin="anonymous" alt="360 view" />
        </a-assets>

        <a-entity camera look-controls="reverseMouseDrag: true" position="0 1.6 0">
           
           {/* KURSOR CINCIN PUTIH (Reticle) */}
           <a-entity 
             cursor="fuse: true; fuseTimeout: 2000"
             position="0 0 -1"
             geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
             material="color: white; shader: flat; opacity: 0.8"
             raycaster="objects: .clickable"
             
             // Animasi Loading
             animation__fusing="property: scale; startEvents: fusing; from: 1 1 1; to: 0.1 0.1 0.1; dur: 2000; easing: linear"
             animation__reset="property: scale; startEvents: mouseleave; to: 1 1 1; dur: 200"
           ></a-entity>

        </a-entity>


        {/* --- HOTSPOT 2D MODERN (Lingkaran) --- */}
        {/* Container Utama: Mengatur Posisi & Rotasi agar menghadap user */}
        <a-entity position="2.5 1.6 -3" rotation="0 -45 0">
            
            {/* Lingkaran Background (Semi Transparan) */}
            <a-circle 
                info-toggler="" // Logic Click
                class="clickable"
                radius="0.4"
                color="white"
                opacity="0.2" // Transparan (Kaca)
                shader="flat" // Agar warnanya solid tidak kena bayangan
                
                // Animasi Hover: Membesar & Jadi Lebih Terang (Opaque)
                animation__scale="property: scale; to: 1.2 1.2 1; startEvents: mouseenter; dur: 200"
                animation__opacity="property: material.opacity; to: 0.8; startEvents: mouseenter; dur: 200"
                
                // Animasi Leave: Balik Transparan
                animation__scalereset="property: scale; to: 1 1 1; startEvents: mouseleave; dur: 200"
                animation__opacityreset="property: material.opacity; to: 0.2; startEvents: mouseleave; dur: 200"
            >
                {/* Ikon Tengah (Titik Biru/Info) */}
                <a-circle radius="0.15" color="#0984e3" position="0 0 0.01"></a-circle>
                
                {/* Border Luar Tipis */}
                <a-ring radius-inner="0.38" radius-outer="0.4" color="white" position="0 0 0.01"></a-ring>
            </a-circle>

            {/* Label Teks di Bawahnya */}
            <a-text value="INFO LOKASI" align="center" position="0 -0.6 0" width="8" color="white"></a-text>
        </a-entity>


        {/* --- PANEL INFO --- */}
        <a-entity 
           position="1.8 1.6 -2.5" rotation="0 -45 0"
           visible={showInfo.toString()} 
        >
            {/* Kartu Kaca Gelap */}
            <a-plane color="#000" width="2.2" height="1.4" opacity="0.85" side="double"></a-plane>
            
            <a-text value="TELESKOP ALMA" align="center" color="#00cec9" width="5" position="0 0.4 0.05"></a-text>
            <a-plane color="white" width="1.8" height="0.005" position="0 0.25 0.05"></a-plane>

            <a-text 
              value="Lokasi: Gurun Atacama\nKetinggian: 5.000 mdpl" 
              align="center" color="white" width="3.5" position="0 0 0.05"
            ></a-text>
            
            <a-text value="(Tatap lagi untuk tutup)" align="center" color="#aaa" width="2" position="0 -0.55 0.05"></a-text>
        </a-entity>

        <a-sky src="#skyTexture" rotation="0 -90 0"></a-sky>
      </a-scene>

      <div style={{ position: 'absolute', bottom: '30px', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <button onClick={enterVRMode} style={{
            background: 'rgba(255, 255, 255, 0.2)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.5)',
            color: 'white', padding: '12px 35px',
            borderRadius: '50px', fontSize: '1rem', fontWeight: 'bold', 
            display: 'flex', alignItems: 'center', gap: '10px'
          }}>
          <FaVrCardboard size={20} /> MULAI TOUR
        </button>
      </div>
      
      {!isLoaded && <div style={{position: 'absolute', inset: 0, background: '#000', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>Loading...</div>}
    </div>
  );
};

export default App;