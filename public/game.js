// --- 1. THREE.JS KURULUMU ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x4caf50); // Here Wars Arenası Çim Rengi

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 18, 14); 
camera.lookAt(0, 0, -2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Işıklar
const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(5, 20, 7);
scene.add(light);
scene.add(new THREE.AmbientLight(0x555555));

// --- 2. ARENA ELEMENTLERİ ---
// Nehir
const riverGeo = new THREE.BoxGeometry(16, 0.1, 2);
const riverMat = new THREE.MeshLambertMaterial({ color: 0x2196f3 });
const river = new THREE.Mesh(riverGeo, riverMat);
river.position.set(0, 0.05, 0);
scene.add(river);

// Tıklamaları yakalamak için görünmez yer düzlemi
const groundGeo = new THREE.PlaneGeometry(16, 20);
const groundMat = new THREE.MeshBasicMaterial({ visible: false });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// --- 3. KULELER VE ASKER LİSTELERİ ---
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

// Oyuncu Kuleleri (Mavi) - Aşağıda (z > 0)
kuleOlustur(-3, 7, 0x2196f3, 1000, 'oyuncu_yan');
kuleOlustur(3, 7, 0x2196f3, 1000, 'oyuncu_yan');
kuleOlustur(0, 8.5, 0x0d47a1, 2000, 'oyuncu_ana');

// Bot Kuleleri (Kırmızı) - Yukarıda (z < 0)
kuleOlustur(-3, -7, 0xf44336, 1000, 'bot_yan');
kuleOlustur(3, -7, 0xf44336, 1000, 'bot_yan');
kuleOlustur(0, -8.5, 0xb71c1c, 2000, 'bot_ana');

// --- 4. OYUNCU İKSİR VE KART SEÇİMİ ---
let oyuncuIksir = 0;
let botIksir = 0;
const maxIksir = 10;
let seciliKart = null;
let seciliKartMaliyet = 0;

function iksirDoldur() {
    if (oyuncuIksir < maxIksir) {
        oyuncuIksir += 0.02;
        document.getElementById('iksir-doluluk').style.width = (oyuncuIksir / maxIksir * 100) + '%';
        document.getElementById('iksir-metin').innerText = Math.floor(oyuncuIksir) + " / " + maxIksir;
    }
    if (botIksir < maxIksir) botIksir += 0.02; // Botun iksiri de arkada doluyor
}

function kartSec(kartAdi, maliyet) {
    // Eski seçimi temizle
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
    
    if (oyuncuIksir >= maliyet) {
        seciliKart = kartAdi;
        seciliKartMaliyet = maliyet;
        document.getElementById('card-' + kartAdi).classList.add('active');
    } else {
        console.log("Yetersiz iksir!");
    }
}

// --- 5. ASKER OLUŞTURMA VE HAREKET MANTIĞI ---
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
    } else { // Şövalye
        geo = new THREE.ConeGeometry(0.5, 1.2, 8);
        renk = (taraf === 'oyuncu') ? 0x1e88e5 : 0xe53935;
        hız = 0.035;
    }

    const mat = new THREE.MeshLambertMaterial({ color: renk });
    const asker = new THREE.Mesh(geo, mat);
    asker.position.set(x, 0.6, z);
    
    // Askerin zekası için veriler
    asker.userData = { taraf: taraf, hiz: hız, tip: kartAdi };
    scene.add(asker);
    askerler.push(asker);
}

// --- 6. TIKLAMA İLE KART BIRAKMA (RAYCASTER) ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (e) => {
    if (!seciliKart) return;
    if (e.clientY > window.innerHeight - 150) return; // UI'ya tıklandıysa geç

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(ground);
    if (intersects.length > 0) {
        const nokta = intersects[0].point;
        
        // Clash Royale kuralı: Kendi sağına (aşağı yarıya) bırakabilirsin
        if (nokta.z > 0 && oyuncuIksir >= seciliKartMaliyet) {
            askerIndir(nokta.x, nokta.z, seciliKart, 'oyuncu');
            oyuncuIksir -= seciliKartMaliyet;
            seciliKart = null;
            document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
        }
    }
});

// --- 7. ONLINE BOT YAPAY ZEKASI 🤖 ---
setInterval(() => {
    const kartlar = ['Sovalye', 'Okcu', 'Dev'];
    const maliyetler = [3, 2, 5];
    const rastgeleIndeks = Math.floor(Math.random() * kartlar.length);
    
    const botunKarti = kartlar[rastgeleIndeks];
    const kartMaliyeti = maliyetler[rastgeleIndeks];

    if (botIksir >= kartMaliyeti) {
        // Bot yukarı sahada (z: -3 ile -5 arası) rastgele bir yere asker bırakır
        const botX = (Math.random() * 8) - 4;
        const botZ = -(Math.random() * 3) - 2;
        
        askerIndir(botX, botZ, botunKarti, 'bot');
        botIksir -= kartMaliyeti;
        console.log("Bot asker gönderdi: " + botunKarti);
    }
}, 4000); // Her 4 saniyede bir bot hamle yapmayı dener

// --- 8. OYUN DÖNGÜSÜ ---
function animate() {
    requestAnimationFrame(animate);
    iksirDoldur();

    // Askerlerin kulelere doğru ilerleme mantığı
    askerler.forEach(asker => {
        if (asker.userData.taraf === 'oyuncu') {
            // Oyuncu askeri üstteki bot kulelerine (z = -7) doğru yürür
            if (asker.position.z > -7) {
                asker.position.z -= asker.userData.hiz;
            }
        } else {
            // Bot askeri alttaki oyuncu kulelerine (z = 7) doğru yürür
            if (asker.position.z < 7) {
                asker.position.z += asker.userData.hiz;
            }
        }
    });

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
