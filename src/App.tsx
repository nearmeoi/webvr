import React, { useEffect, useState } from 'react';
import 'aframe'; 
import { FaVrCardboard } from 'react-icons/fa';

const LOCAL_IMAGE_PATH = '/assets/local_360.jpg';

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const enterVRMode = () => {
    const scene = document.querySelector('a-scene');
    if (scene) { scene.enterVR(); }
  };

  useEffect(() => { setTimeout(() => setIsLoaded(true), 1000); }, []);

  return (
    <div style={{ height: '100vh', width: '100vw', backgroundColor: '#000', fontFamily: 'Arial, sans-serif' }}>
      
      <a-scene embedded vr-mode-ui="enabled: false">
        <a-assets>
          <img id="skyTexture" src={LOCAL_IMAGE_PATH} crossOrigin="anonymous" alt="360 view" />
        </a-assets>

        <a-entity camera look-controls="reverseMouseDrag: true" position="0 1.6 0">
           
           {/* KURSOR (TITIK TENGAH) */}
           <a-cursor 
             id="cursor"
             color="white" 
             scale="1 1 1"
             
             // LOGIKA WAKTU:
             fuse="true" 
             fuseTimeout="2000" // Saya kurangi jadi 2 detik biar tidak terlalu lama nunggunya
             
             raycaster="objects: .clickable" // Hanya bereaksi pada bola merah
             
             // Animasi 1: Saat menatap (Fusing) -> Kursor mengecil & Jadi KUNING
             animation__fusing="property: scale; startEvents: fusing; from: 1 1 1; to: 0.2 0.2 0.2; dur: 2000"
             animation__colorfusing="property: color; startEvents: fusing; from: white; to: yellow; dur: 100"

             // Animasi 2: Saat berhasil klik (Click) -> Kursor membesar & Jadi HIJAU
             animation__click="property: scale; startEvents: click; from: 0.2 0.2 0.2; to: 1 1 1; dur: 200"
             animation__colorclick="property: color; startEvents: click; from: yellow; to: springgreen; dur: 100"

             // Animasi 3: Saat batal menatap (MouseLeave) -> Reset ke PUTIH
             animation__leave="property: scale; startEvents: mouseleave; to: 1 1 1; dur: 200"
             animation__colorleave="property: color; startEvents: mouseleave; to: white; dur: 100"
           ></a-cursor>

        </a-entity>

        {/* --- BOLA MERAH (HOTSPOT) --- */}
        {/* PERBAIKAN: Posisi digeser ke X=3 (KANAN), supaya tidak langsung kena tatap saat start */}
        <a-entity 
          class="clickable"
          position="3 1.6 -3" 
          rotation="0 -45 0" // Menghadap serong ke user
          
          // Event logic
          events={{ click: () => setShowInfo(!showInfo) }} 
          
          // Animasi membesar sedikit saat dilirik
          animation__enter="property: scale; to: 1.2 1.2 1.2; startEvents: mouseenter; dur: 200"
          animation__leave="property: scale; to: 1 1 1; startEvents: mouseleave; dur: 200"
        >
           <a-sphere color="#e74c3c" radius="0.5" opacity="0.9"></a-sphere>
           
           {/* Teks ajakan */}
           <a-text value="INFO" align="center" position="0 0.8 0" width="10" color="white"></a-text>
           <a-text value="(Tatap 2 Detik)" align="center" position="0 -0.8 0" width="5" color="#ddd"></a-text>
        </a-entity>


        {/* --- PANEL INFO POPUP --- */}
        <a-entity 
          position="2.5 1.6 -2.5" // Muncul di dekat bola merah (sebelah kanan)
          rotation="0 -45 0"      // Menghadap user
          visible={showInfo}
        >
            <a-plane color="#000" width="2.5" height="1.5" opacity="0.8" side="double"></a-plane>
            
            <a-text value="TELESKOP ALMA" align="center" color="yellow" width="6" position="0 0.4 0.1"></a-text>
            <a-text 
              value="Teleskop radio terbesar di dunia.\nLokasi: Gurun Atacama." 
              align="center" color="white" width="3" position="0 0 0.1">
            </a-text>
            
            <a-text value="(Tatap bola merah lagi untuk tutup)" align="center" color="gray" width="2" position="0 -0.5 0.1"></a-text>
        </a-entity>

        <a-sky src="#skyTexture" rotation="0 -90 0"></a-sky>
      </a-scene>

      <div style={{ position: 'absolute', bottom: '20px', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <button onClick={enterVRMode} style={{
            background: '#0984e3', color: 'white', border: 'none', padding: '12px 30px',
            borderRadius: '50px', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px'
          }}>
          <FaVrCardboard size={24} /> MASUK VR
        </button>
      </div>

      {/* Petunjuk Awal di Layar */}
      {!isLoaded ? (
         <div style={{position: 'absolute', inset: 0, background: 'black', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>Loading...</div>
      ) : (
         <div style={{position: 'absolute', top: '20px', left: 0, width: '100%', textAlign: 'center', pointerEvents: 'none'}}>
            <span style={{background: 'rgba(0,0,0,0.5)', color: 'white', padding: '5px 10px', borderRadius: '5px'}}>
               Geser layar ke KANAN untuk menemukan bola merah
            </span>
         </div>
      )}
    </div>
  );
};

export default App;