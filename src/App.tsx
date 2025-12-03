import React, { useEffect, useRef, useState } from 'react';
import 'aframe'; 
import { FaVrCardboard, FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const LOCAL_IMAGE_PATH = '/assets/local_360.jpg';

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInVR, setIsInVR] = useState(false); 
  const rigRef = useRef<any>(null);
  const [rotateDirection, setRotateDirection] = useState<'left' | 'right' | null>(null);

  // --- 1. DETEKSI MODE VR ---
  useEffect(() => {
    const scene = document.querySelector('a-scene');
    const handleEnterVR = () => setIsInVR(true);
    const handleExitVR = () => setIsInVR(false);

    if (scene) {
      scene.addEventListener('enter-vr', handleEnterVR);
      scene.addEventListener('exit-vr', handleExitVR);
    }
    return () => {
      if (scene) {
        scene.removeEventListener('enter-vr', handleEnterVR);
        scene.removeEventListener('exit-vr', handleExitVR);
      }
    };
  }, []);

  // --- 2. LOGIKA ROTASI OTOMATIS (GAZE VR) ---
  useEffect(() => {
    let interval: any;
    if (rotateDirection) {
      interval = setInterval(() => {
        if (rigRef.current) {
          const currentRotation = rigRef.current.getAttribute('rotation');
          const speed = rotateDirection === 'left' ? 0.4 : -0.4;
          rigRef.current.setAttribute('rotation', { x: 0, y: currentRotation.y + speed, z: 0 });
        }
      }, 16); 
    }
    return () => clearInterval(interval);
  }, [rotateDirection]);

  // --- 3. LOGIKA JOYSTICK MANUAL (MODE 2D) ---
  const manualRotate = (axis: 'x' | 'y', amount: number) => {
    if (rigRef.current) {
      const currentRotation = rigRef.current.getAttribute('rotation');
      const newRot = {
        x: axis === 'x' ? currentRotation.x + amount : currentRotation.x,
        y: axis === 'y' ? currentRotation.y + amount : currentRotation.y,
        z: 0
      };
      rigRef.current.setAttribute('rotation', newRot);
    }
  };

  const enterVRMode = () => {
    const scene = document.querySelector('a-scene');
    if (scene) { scene.enterVR(); }
  };

  useEffect(() => { setTimeout(() => setIsLoaded(true), 1500); }, []);

  return (
    <div style={{ height: '100vh', width: '100vw', backgroundColor: '#000', fontFamily: 'Arial, sans-serif' }}>
      
      <a-scene embedded vr-mode-ui="enabled: false">
        <a-assets>
          <img id="skyTexture" src={LOCAL_IMAGE_PATH} crossOrigin="anonymous" alt="360 view" />
        </a-assets>

        {/* CAMERA RIG */}
        <a-entity id="cameraRig" ref={rigRef} rotation="0 0 0">
           
           <a-entity camera look-controls="reverseMouseDrag: true" position="0 1.6 0">
              {/* CURSOR HIJAU (Hanya muncul saat Mode VR) */}
              <a-cursor 
                visible={isInVR} 
                color="#00ff00" 
                scale={isInVR ? "1 1 1" : "0 0 0"} 
                fuse="true" 
                fuseTimeout="1500"
                raycaster="objects: .clickable"
                animation__click="property: scale; startEvents: click; from: 0.1 0.1 0.1; to: 1 1 1; dur: 150"
                animation__fusing="property: scale; startEvents: fusing; from: 1 1 1; to: 0.1 0.1 0.1; dur: 1500"
              ></a-cursor>
           </a-entity>

           {/* --- UI NAVIGASI VR (HANYA MUNCUL DI VR) --- */}
           <a-entity visible={isInVR}>
             {/* KIRI */}
             <a-entity
               class={isInVR ? "clickable" : ""} 
               position="-1.5 1.6 -1.5" rotation="0 45 0"
               onMouseEnter={() => isInVR && setRotateDirection('left')} 
               onMouseLeave={() => setRotateDirection(null)}
               animation__enter="property: scale; to: 1.2 1.2 1.2; startEvents: mouseenter; dur: 200"
               animation__leave="property: scale; to: 1 1 1; startEvents: mouseleave; dur: 200"
             >
               <a-circle color="#000" opacity="0.5" radius="0.3"></a-circle>
               <a-ring color="white" radius-inner="0.28" radius-outer="0.3"></a-ring>
               <a-text value="<" align="center" color="#00ff00" width="8" position="-0.05 0 0"></a-text>
               <a-text value="PUTAR" align="center" color="white" width="2.5" position="0 -0.45 0"></a-text>
             </a-entity>

             {/* KANAN */}
             <a-entity
               class={isInVR ? "clickable" : ""}
               position="1.5 1.6 -1.5" rotation="0 -45 0"
               onMouseEnter={() => isInVR && setRotateDirection('right')} 
               onMouseLeave={() => setRotateDirection(null)}
               animation__enter="property: scale; to: 1.2 1.2 1.2; startEvents: mouseenter; dur: 200"
               animation__leave="property: scale; to: 1 1 1; startEvents: mouseleave; dur: 200"
             >
               <a-circle color="#000" opacity="0.5" radius="0.3"></a-circle>
               <a-ring color="white" radius-inner="0.28" radius-outer="0.3"></a-ring>
               <a-text value=">" align="center" color="#00ff00" width="8" position="0.05 0 0"></a-text>
               <a-text value="PUTAR" align="center" color="white" width="2.5" position="0 -0.45 0"></a-text>
             </a-entity>
           </a-entity>

        </a-entity>

        {/* --- LABEL INFO STATIS (Pengganti Popup) --- */}
        {/* Teks melayang di depan agak atas, tanpa interaksi */}
        <a-entity position="0 2.5 -4">
            {/* Background hitam transparan agar teks terbaca */}
            <a-plane color="black" opacity="0.6" width="3" height="0.8"></a-plane>
            <a-text value="TELESKOP ALMA" align="center" color="#00cec9" width="6" position="0 0.1 0.1"></a-text>
            <a-text value="Gurun Atacama, Chile" align="center" color="white" width="3" position="0 -0.2 0.1"></a-text>
        </a-entity>

        <a-sky src="#skyTexture" rotation="0 -90 0"></a-sky>
      </a-scene>

      {/* --- UI 2D (Layar HP) --- */}
      {!isInVR && (
        <>
          {/* Joystick Kiri Bawah */}
          <div style={{
            position: 'absolute', bottom: '20px', left: '20px',
            display: 'grid', gridTemplateColumns: '50px 50px 50px', gap: '5px',
            zIndex: 999
          }}>
            <div />
            <button onMouseDown={() => manualRotate('x', 5)} onClick={() => manualRotate('x', 5)} style={joyBtnStyle}><FaArrowUp /></button>
            <div />
            <button onMouseDown={() => manualRotate('y', 5)} onClick={() => manualRotate('y', 5)} style={joyBtnStyle}><FaArrowLeft /></button>
            <button onMouseDown={() => manualRotate('x', -5)} onClick={() => manualRotate('x', -5)} style={joyBtnStyle}><FaArrowDown /></button>
            <button onMouseDown={() => manualRotate('y', -5)} onClick={() => manualRotate('y', -5)} style={joyBtnStyle}><FaArrowRight /></button>
          </div>

          {/* Tombol Masuk VR */}
          <div style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
            <button onClick={enterVRMode} style={{...joyBtnStyle, width: 'auto', padding: '0 20px', borderRadius: '30px', background: '#0984e3'}}>
              <FaVrCardboard /> MASUK VR
            </button>
          </div>
        </>
      )}

      {!isLoaded && <div style={{position: 'absolute', inset: 0, background: 'black', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>Loading...</div>}
    </div>
  );
};

const joyBtnStyle: React.CSSProperties = {
  width: '50px', height: '50px', borderRadius: '10px',
  background: 'rgba(255,255,255,0.2)', border: '1px solid white',
  color: 'white', fontSize: '1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center',
  cursor: 'pointer', backdropFilter: 'blur(4px)'
};

export default App;