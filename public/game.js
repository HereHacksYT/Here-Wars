let oyunBasladi = false;
let oyunModu = 'bot';

function modSec(mod) {
    document.getElementById('mode-bot').classList.remove('secili');
    document.getElementById('mode-friend').classList.remove('secili');
    if(mod === 'bot') { oyunModu = 'bot'; document.getElementById('mode-bot').classList.add('secili'); }
    else { oyunModu = 'friend'; document.getElementById('mode-friend').classList.add('secili'); }
}

function oyunuBaslat() {
    document.getElementById('menu-ekrani').style.display = 'none';
    document.getElementById('oyun-ui').style.display = 'block';
    oyunBasladi = true;
}

// --- THREE.JS KURULUMU ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x52b788);

// Kamerayı dik ekrana göre optimize ettik (Daha dik ve yukarıdan açı)
const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 19, 11); 
camera.lookAt(0, 0, -2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1.3);
light.position.set(4, 20, 6);
scene.add(light);
scene.add(new THREE.AmbientLight(0x666666));

// Nehir
const riverGeo = new THREE.BoxGeometry(16, 0.1, 1.8);
const riverMat = new THREE.MeshLambertMaterial({ color: 0x22a6b3 });
const river = new THREE.Mesh(riverGeo, riverMat);
river.position.set(0, 0.05, 0);
scene.add(river);

// --- KÖPRÜLER (YOL MANTIĞI İÇİN KOORDİNATLAR) ---
const kopruler = [
    { x: -3.5, z: 0 }, // Sol Köprü
    { x: 3.5, z: 0 }   // Sağ Köprü
];

function kopruCiz(x) {
    const geo = new THREE.BoxGeometry(1.8, 0.15, 2.2);
    const mat = new THREE.MeshLambertMaterial({ color: 0x95a5a6 });
    const msh = new THREE.Mesh(geo, mat);
    msh.position.set(x, 0.1, 0);
    scene.add(msh);
}
kopruCiz(-3.5);
kopruCiz(3.5);

const groundGeo = new THREE.PlaneGeometry(16, 20);
const groundMat = new THREE.MeshBasicMaterial({ visible: false });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// --- KULELER VE CAN BARLARI ---
const kuleler = [];
const askerler = [];

function kuleOlustur(x, z, renk, maxCan, taraf, tip) {
    const kuleGrup = new THREE.Group();
    
    const geo = new THREE.CylinderGeometry(0.7, 0.9, 1.8, 8);
    const mat = new THREE.MeshLambertMaterial({ color: renk });
    const govde = new THREE.Mesh(geo, mat);
    govde.position.y = 0.9;
    kuleGrup.add(govde);

    // 3D Can Barı Arkalığı (Siyah)
    const barArkaGeo = new THREE.BoxGeometry(1.5, 0.15, 0.1);
    const barArkaMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const barArka = new THREE.Mesh(barArkaGeo, barArkaMat);
    barArka.position.set(0, 2.2, 0);
    kuleGrup.add(barArka);

    // Can Doluluk Çizgisi (Yeşil)
    const barCanGeo = new THREE.BoxGeometry(1.45, 0.1, 0.12);
    const barCanMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const barCan = new THREE.Mesh(barCanGeo, barCanMat);
    barCan.position.set(0, 2.2, 0.02);
    kuleGrup.add(barCan);

    kuleGrup.position.set(x, 0, z);
    scene.add(kuleGrup);

    kuleGrup.userData = { 
        taraf: taraf, tip: tip, can: maxCan, maxCan: maxCan, 
        x: x, z: z, barCan: barCan, canli: true 
    };
    kuleler.push(kuleGrup);
}

// Kuleleri Konumlandır (z mesafeleri dik ekrana sığacak şekilde daraltıldı)
kuleOlustur(-3.5, 5.5, 0x2980b9, 800, 'oyuncu', 'yan');
kuleOlustur(3.5, 5.5, 0x2980b9, 800, 'oyuncu', 'yan');
kuleOlustur(0, 7, 0x1f4068, 1600, 'oyuncu', 'ana');

kuleOlustur(-3.5, -5.5, 0xe74c3c, 800, 'bot', 'yan');
kuleOlustur(3.5, -5.5, 0xe74c3c, 800, 'bot', 'yan');
kuleOlustur(0, -7, 0xb13131, 1600, 'bot', 'ana');

// --- İKSİR VE KART SEÇİMİ ---
let oyuncuIksir = 0; let botIksir = 0; const maxIksir = 10;
let seciliKart = null; let seciliKartMaliyet = 0;

function iksirDoldur() {
    if (!oyunBasladi) return;
    if (oyuncuIksir < maxIksir) {
        oyuncuIksir += 0.025;
        document.getElementById('iksir-doluluk').style.width = (oyuncuIksir / maxIksir * 100) + '%';
        document.getElementById('iksir-metin').innerText = Math.floor(oyuncuIksir) + " / " + maxIksir;
    }
    if (botIksir < maxIksir) botIksir += 0.025;
}

function kartSec(kartAdi, maliyet) {
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
    if (oyuncuIksir >= maliyet) {
        seciliKart = kartAdi; seciliKartMaliyet = maliyet;
        document.getElementById('card-' + kartAdi).classList.add('active');
    }
}

function askerIndir(x, z, kartAdi, taraf) {
    let geo, renk, hız, hasar;
    if (kartAdi === 'Dev') {
        geo = new THREE.BoxGeometry(0.7, 1.2, 0.7);
        renk = (taraf === 'oyuncu') ? 0x2980b9 : 0xc0392b;
        hız = 0.02; hasar = 3;
    } else if (kartAdi === 'Okcu') {
        geo = new THREE.CylinderGeometry(0.25, 0.25, 0.8, 8);
        renk = (taraf === 'oyuncu') ? 0x3498db : 0xe74c3c;
        hız = 0.045; hasar = 1.5;
    } else {
        geo = new THREE.ConeGeometry(0.4, 0.9, 8);
        renk = (taraf === 'oyuncu') ? 0x1abc9c : 0xe67e22;
        hız = 0.035; hasar = 2;
    }

    const mat = new THREE.MeshLambertMaterial({ color: renk });
    const asker = new THREE.Mesh(geo, mat);
    asker.position.set(x, 0.4, z);
    
    // Köprü hedefi belirleme: Asker hangi köprüye daha yakınsa orayı seçer
    const hedefKopru = (x < 0) ? kopruler[0] : kopruler[1];

    asker.userData = { 
        taraf: taraf, hiz: hız, hasar: hasar, 
        gecitKopru: false, kopruHedef: hedefKopru, canli: true 
    };
    scene.add(asker);
    askerler.push(asker);
}

// --- DOKUNMA ALGILAYICI ---
const raycaster = new THREE.Raycaster(); const mouse = new THREE.Vector2();
window.addEventListener('pointerdown', (e) => {
    if (!oyunBasladi || !seciliKart) return;
    if (e.clientY > window.innerHeight - 130) return; 

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(ground);
    if (intersects.length > 0) {
        const nokta = intersects[0].point;
        // Nehrin kendi tarafına ve sınır dışına çıkmadan bırakma
        if (nokta.z > 0.5 && nokta.z < 9 && Math.abs(nokta.x) < 6 && oyuncuIksir >= seciliKartMaliyet) {
            askerIndir(nokta.x, nokta.z, seciliKart, 'oyuncu');
            oyuncuIksir -= seciliKartMaliyet;
            seciliKart = null;
            document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
        }
    }
});

// Bot Yapay Zekası
setInterval(() => {
    if (!oyunBasladi || oyunModu !== 'bot') return;
    const kartlar = ['Sovalye', 'Okcu', 'Dev']; const maliyetler = [3, 2, 5];
    const r = Math.floor(Math.random() * kartlar.length);
    if (botIksir >= maliyetler[r]) {
        const botX = (Math.random() * 7) - 3.5;
        askerIndir(botX, -5.5, kartlar[r], 'bot');
        botIksir -= maliyetler[r];
    }
}, 3500);

// --- OYUN DÖNGÜSÜ (YOL BULMA VE SALDIRI) ---
function animate() {
    requestAnimationFrame(animate);
    iksirDoldur();

    if (oyunBasladi) {
        askerler.forEach((asker, aIndex) => {
            if (!asker.userData.canli) return;

            // En yakın düşman kulesini bulma
            let enYakinKule = null;
            let minUzaklik = 999;
            kuleler.forEach(kule => {
                if (kule.userData.canli && kule.userData.taraf !== asker.userData.taraf) {
                    let d = asker.position.distanceTo(kule.position);
                    if (d < minUzaklik) { minUzaklik = d; enYakinKule = kule; }
                }
            });

            if (enYakinKule) {
                // Saldırı menzili kontrolü
                if (minUzaklik < 1.2) {
                    // Kuleye vurma
                    enYakinKule.userData.can -= asker.userData.hasar;
                    if (enYakinKule.userData.can <= 0) {
                        enYakinKule.userData.canli = false;
                        scene.remove(enYakinKule);
                    } else {
                        // Can barını güncelleme (Ölçek küçültme)
                        let oran = enYakinKule.userData.can / enYakinKule.userData.maxCan;
                        enYakinKule.userData.barCan.scale.x = Math.max(0, oran);
                    }
                    return; // Saldırırken yürüme
                }

                // --- SMART PATHFINDING (KÖPRÜDEN GEÇME YAPISI) ---
                let hedefX = enYakinKule.position.x;
                let hedefZ = enYakinKule.position.z;

                // Eğer nehrin karşısına henüz geçmediyse önce köprüye yürür
                if (!asker.userData.gecitKopru) {
                    let kHedef = asker.userData.kopruHedef;
                    hedefX = kHedef.x;
                    hedefZ = kHedef.z;

                    // Köprüye ulaştı mı kontrolü
                    if (Math.abs(asker.position.z - kHedef.z) < 0.3) {
                        asker.userData.gecitKopru = true;
                    }
                }

                // Hedefe doğru ilerleme
                if (asker.position.x < hedefX) asker.position.x += asker.userData.hiz;
                if (asker.position.x > hedefX) asker.position.x -= asker.userData.hiz;
                if (asker.position.z < hedefZ) asker.position.z += asker.userData.hiz;
                if (asker.position.z > hedefZ) asker.position.z -= asker.userData.hiz;
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
