import React, { useEffect, useState } from 'react';
import 'aframe'; 
import { FaVrCardboard } from 'react-icons/fa';

const LOCAL_IMAGE_PATH = '/assets/local_360.jpg';

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // State untuk menyimpan status apakah Info sedang tampil atau tidak
  const [showInfo, setShowInfo] = useState(false);

  // Fungsi Masuk VR Manual
  const enterVRMode = () => {
    const scene = document.querySelector('a-scene');
    if (scene) { scene.enterVR(); }
  };

  useEffect(() => { setTimeout(() => setIsLoaded(true), 1000); }, []);

  return (
    <div style={{ height: '100vh', width: '100vw', backgroundColor: '#000', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Scene A-Frame */}
      <a-scene embedded vr-mode-ui="enabled: false">
        <a-assets>
          <img id="skyTexture" src={LOCAL_IMAGE_PATH} crossOrigin="anonymous" alt="360 view" />
        </a-assets>

        {/* --- KAMERA & KURSOR --- */}
        <a-entity camera look-controls="reverseMouseDrag: true" position="0 1.6 0">
           
           {/* CURSOR (TITIK TENGAH) */}
           <a-cursor 
             id="cursor"
             color="white" 
             scale="1 1 1"
             
             // --- LOGIKA 3 DETIK ---
             fuse="true" 
             fuseTimeout="3000" // Wajib menatap 3000ms (3 detik) baru event 'click' jalan
             
             raycaster="objects: .clickable" // Hanya bereaksi pada objek .clickable
             
             // Animasi Loading (Mengecil saat menatap)
             animation__fusing="property: scale; startEvents: fusing; from: 1 1 1; to: 0.1 0.1 0.1; dur: 3000"
             // Animasi Reset (Membesar lagi kalau gagal tatap/selesai)
             animation__mouseleave="property: scale; startEvents: mouseleave; to: 1 1 1; dur: 500"
           ></a-cursor>

        </a-entity>

        {/* --- OBJEK INTERAKTIF (HOTSPOT) --- */}
        {/* Posisi: X=0 (Tengah), Y=1.6 (Sejajar Mata), Z=-4 (Jarak 4 meter di depan) */}
        <a-entity 
          class="clickable"
          position="0 1.6 -4"
          // Saat timer 3 detik habis, event 'click' terpanggil -> Ubah state showInfo
          events={{ click: () => setShowInfo(!showInfo) }} 
          
          // Animasi membesar saat dilihat
          animation__enter="property: scale; to: 1.2 1.2 1.2; startEvents: mouseenter; dur: 200"
          animation__leave="property: scale; to: 1 1 1; startEvents: mouseleave; dur: 200"
        >
           {/* Visual Bola Merah */}
           <a-sphere color="#e74c3c" radius="0.5" opacity="0.8"></a-sphere>
           {/* Cincin Luar biar keren */}
           <a-ring color="white" radius-inner="0.6" radius-outer="0.7" rotation="0 0 0">
             <a-animation attribute="rotation" to="0 0 360" repeat="indefinite" dur="5000" easing="linear"></a-animation>
           </a-ring>
           
           <a-text value="TATAP SAYA (3 Detik)" align="center" position="0 -1 0" width="6"></a-text>
        </a-entity>


        {/* --- PANEL INFO (MUNCUL SETELAH 3 DETIK) --- */}
        {/* Kita gunakan logic 'visible' berdasarkan state showInfo */}
        <a-entity 
          position="0 1.6 -3" // Muncul sedikit di depan Hotspot
          visible={showInfo}  // Default false (hilang), jadi true setelah 3 detik
        >
            {/* Background Panel */}
            <a-plane color="#2c3e50" width="3" height="1.5" opacity="0.9"></a-plane>
            
            {/* Isi Teks */}
            <a-text value="INFO LOKASI" align="center" color="#f1c40f" width="8" position="0 0.4 0.1"></a-text>
            <a-text 
              value="Ini adalah Teleskop ALMA.\nTerletak di gurun Atacama.\nTingginya 5000 meter." 
              align="center" color="white" width="4" position="0 0 0.1">
            </a-text>
            
            <a-text value="(Tatap bola merah lagi untuk tutup)" align="center" color="#bdc3c7" width="3" position="0 -0.5 0.1"></a-text>
        </a-entity>


        <a-sky src="#skyTexture" rotation="0 -90 0"></a-sky>
      </a-scene>

      {/* --- UI MASUK VR --- */}
      <div style={{ position: 'absolute', bottom: '20px', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <button onClick={enterVRMode} style={{
            background: '#0984e3', color: 'white', border: 'none', padding: '12px 30px',
            borderRadius: '50px', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px'
          }}>
          <FaVrCardboard size={24} /> MASUK VR
        </button>
      </div>

      {!isLoaded && <div style={{position: 'absolute', inset: 0, background: 'black', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>Loading...</div>}
    </div>
  );
};

export default App;