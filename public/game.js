// --- 1. SENEK VE MENÜ KONTROLLERİ ---
let oyunBasladi = false;
let oyunModu = 'bot'; // Varsayılan

function modSec(mod) {
    document.getElementById('mode-bot').classList.remove('secili');
    document.getElementById('mode-friend').classList.remove('secili');
    
    if(mod === 'bot') {
        oyunModu = 'bot';
        document.getElementById('mode-bot').classList.add('secili');
    } else {
        oyunModu = 'friend';
        document.getElementById('mode-friend').classList.add('secili');
    }
}

function oyunuBaslat() {
    document.getElementById('menu-ekrani').style.display = 'none';
    document.getElementById('oyun-ui').style.display = 'block';
    oyunBasladi = true;
}

// --- 2. THREE.JS KURULUMU ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x4caf50);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 16, 13); 
camera.lookAt(0, 0, -2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Işıklar
const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(5, 20, 7);
scene.add(light);
scene.add(new THREE.AmbientLight(0x555555));

// Arena Elementleri
const riverGeo = new THREE.BoxGeometry(16, 0.1, 2);
const riverMat = new THREE.MeshLambertMaterial({ color: 0x2196f3 });
const river = new THREE.Mesh(riverGeo, riverMat);
river.position.set(0, 0.05, 0);
scene.add(river);

const groundGeo = new THREE.PlaneGeometry(16, 20);
const groundMat = new THREE.MeshBasicMaterial({ visible: false });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Listeler
const kuleler = [];
const askerler = [];

function kuleOlustur(x, z, renk, can, tip) {
    const geo = new THREE.CylinderGeometry(0.8, 1, 2, 8);
    const mat = new THREE.MeshLambertMaterial({ color: renk });
    const kule = new THREE.Mesh(geo, mat);
    kule.position.set(x, 1, z);
    kule.userData = { tip: tip, can: can, x: x, z: z };
    scene.add(kule);
    kuleler.push(kule);
}

// Kuleleri Dik (Oyuncu ve Bot)
kuleOlustur(-3, 7, 0x2196f3, 1000, 'oyuncu_yan');
kuleOlustur(3, 7, 0x2196f3, 1000, 'oyuncu_yan');
kuleOlustur(0, 8.5, 0x0d47a1, 2000, 'oyuncu_ana');
kuleOlustur(-3, -7, 0xf44336, 1000, 'bot_yan');
kuleOlustur(3, -7, 0xf44336, 1000, 'bot_yan');
kuleOlustur(0, -8.5, 0xb71c1c, 2000, 'bot_ana');

// İksir Mekaniği
let oyuncuIksir = 0;
let botIksir = 0;
const maxIksir = 10;
let seciliKart = null;
let seciliKartMaliyet = 0;

function iksirDoldur() {
    if (!oyunBasladi) return;
    if (oyuncuIksir < maxIksir) {
        oyuncuIksir += 0.02;
        document.getElementById('iksir-doluluk').style.width = (oyuncuIksir / maxIksir * 100) + '%';
        document.getElementById('iksir-metin').innerText = Math.floor(oyuncuIksir) + " / " + maxIksir;
    }
    if (botIksir < maxIksir) botIksir += 0.02;
}

function kartSec(kartAdi, maliyet) {
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
    if (oyuncuIksir >= maliyet) {
        seciliKart = kartAdi;
        seciliKartMaliyet = maliyet;
        document.getElementById('card-' + kartAdi).classList.add('active');
    }
}

function askerIndir(x, z, kartAdi, taraf) {
    let geo, renk, hız;
    if (kartAdi === 'Dev') {
        geo = new THREE.BoxGeometry(0.9, 1.5, 0.9);
        renk = (taraf === 'oyuncu') ? 0x1565c0 : 0xc62828;
        hız = 0.02;
    } else if (kartAdi === 'Okcu') {
        geo = new THREE.CylinderGeometry(0.3, 0.3, 1, 8);
        renk = (taraf === 'oyuncu') ? 0x64b5f6 : 0xe57373;
        hız = 0.05;
    } else {
        geo = new THREE.ConeGeometry(0.5, 1.2, 8);
        renk = (taraf === 'oyuncu') ? 0x1e88e5 : 0xe53935;
        hız = 0.035;
    }

    const mat = new THREE.MeshLambertMaterial({ color: renk });
    const asker = new THREE.Mesh(geo, mat);
    asker.position.set(x, 0.6, z);
    asker.userData = { taraf: taraf, hiz: hız, tip: kartAdi };
    scene.add(asker);
    askerler.push(asker);
}

// Mobil ve PC Dokunma Senkronizasyonu (Pointer Events)
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('pointerdown', (e) => {
    if (!oyunBasladi || !seciliKart) return;
    // UI alanına tıklandıysa iptal et (Kartların üst üste binmesini önler)
    if (e.clientY > window.innerHeight - 160) return; 

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(ground);
    if (intersects.length > 0) {
        const nokta = intersects[0].point;
        
        // Sadece kendi sahasına (z > 0) bırakabilir
        if (nokta.z > 0 && oyuncuIksir >= seciliKartMaliyet) {
            askerIndir(nokta.x, nokta.z, seciliKart, 'oyuncu');
            oyuncuIksir -= seciliKartMaliyet;
            seciliKart = null;
            document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
        }
    }
});

// Bot Döngüsü
setInterval(() => {
    if (!oyunBasladi || oyunModu !== 'bot') return;
    
    const kartlar = ['Sovalye', 'Okcu', 'Dev'];
    const maliyetler = [3, 2, 5];
    const rastgeleIndeks = Math.floor(Math.random() * kartlar.length);
    
    const botunKarti = kartlar[rastgeleIndeks];
    const kartMaliyeti = maliyetler[rastgeleIndeks];

    if (botIksir >= kartMaliyeti) {
        const botX = (Math.random() * 8) - 4;
        const botZ = -(Math.random() * 3) - 2; // Üst yarı saha
        askerIndir(botX, botZ, botunKarti, 'bot');
        botIksir -= kartMaliyeti;
    }
}, 4000);

// Animasyon Döngüsü
function animate() {
    requestAnimationFrame(animate);
    iksirDoldur();

    if (oyunBasladi) {
        askerler.forEach(asker => {
            if (asker.userData.taraf === 'oyuncu') {
                if (asker.position.z > -7) asker.position.z -= asker.userData.hiz;
            } else {
                if (asker.position.z < 7) asker.position.z += asker.userData.hiz;
            }
        });
    }

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
