let oyunBasladi = false;
let oyunModu = 'bot';
let kalanSure = 180;
let sureZamanlayici = null;

function modSec(mod) {
    document.getElementById('mode-bot').classList.remove('secili');
    document.getElementById('mode-friend').classList.remove('secili');
    if(mod === 'bot') { oyunModu = 'bot'; document.getElementById('mode-bot').classList.add('secili'); }
    else { oyunModu = 'friend'; document.getElementById('mode-friend').classList.add('secili'); }
}

function oyunuBaslat() {
    document.getElementById('menu-ekrani').style.display = 'none';
    document.getElementById('oyun-ui').style.display = 'block';
    document.getElementById('sure-sayaci').style.display = 'block';
    oyunBasladi = true;
    kalanSure = 180;
    sureyiBaslat();
}

function sureyiBaslat() {
    sureZamanlayici = setInterval(() => {
        if (!oyunBasladi) return;
        kalanSure--;
        let dk = Math.floor(kalanSure / 60);
        let sn = kalanSure % 60;
        document.getElementById('sure-sayaci').innerText = (dk < 10 ? "0" + dk : dk) + ":" + (sn < 10 ? "0" + sn : sn);
        if (kalanSure <= 0) macBitir('beraberlik');
    }, 1000);
}

function macBitir(durum) {
    oyunBasladi = false;
    clearInterval(sureZamanlayici);
    const popup = document.getElementById('mac-sonu-ekrani');
    popup.style.display = 'flex';
    if (durum === 'kazandin') { popup.innerHTML = "KAZANDIN! 🎉<br><span style='font-size:20px;'>Lobiye dönülüyor...</span>"; }
    else if (durum === 'kaybettin') { popup.innerHTML = "KAYBETTİN! 😢<br><span style='font-size:20px;'>Lobiye dönülüyor...</span>"; }
    else { popup.innerHTML = "BERABERE! 🤝<br><span style='font-size:20px;'>Lobiye dönülüyor...</span>"; }
    setTimeout(() => { location.reload(); }, 4000);
}

// --- THREE.JS KURULUMU ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x52b788);

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

// Zaman İzleyici (Animasyonların akıcılığı için şart)
const clock = new THREE.Clock();

// Nehir ve Köprüler
const riverGeo = new THREE.BoxGeometry(16, 0.1, 1.8);
const riverMat = new THREE.MeshLambertMaterial({ color: 0x22a6b3 });
const river = new THREE.Mesh(riverGeo, riverMat);
river.position.set(0, 0.05, 0);
scene.add(river);

const kopruler = [{ x: -3.5, z: 0 }, { x: 3.5, z: 0 }];
function kopruCiz(x) {
    const geo = new THREE.BoxGeometry(1.8, 0.15, 2.2);
    const mat = new THREE.MeshLambertMaterial({ color: 0x95a5a6 });
    const msh = new THREE.Mesh(geo, mat);
    msh.position.set(x, 0.1, 0);
    scene.add(msh);
}
kopruCiz(-3.5); kopruCiz(3.5);

const groundGeo = new THREE.PlaneGeometry(16, 20);
const groundMat = new THREE.MeshBasicMaterial({ visible: false });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// --- DİNAMİK ATMA SINIRI GÖRSELİ (IZGARA) ---
const sinirGeo = new THREE.PlaneGeometry(12, 8.5); 
const sinirMat = new THREE.MeshBasicMaterial({ 
    color: 0xffffff, 
    transparent: true, 
    opacity: 0.18, 
    side: THREE.DoubleSide 
});
const sinirIzgarasi = new THREE.Mesh(sinirGeo, sinirMat);
sinirIzgarasi.rotation.x = -Math.PI / 2;
sinirIzgarasi.position.set(0, 0.06, 4.75); 
sinirIzgarasi.visible = false; 
scene.add(sinirIzgarasi);

// --- GLTF MODEL VE ANİMASYON HAFIZASI ---
const gltfLoader = new THREE.GLTFLoader();
const aktifMixerler = []; 
const modelHafizasi = {}; 

function modelleriOnYukle() {
    const yuklenecekler = [
        { ad: 'Dev', url: 'dev.glb' },
        { ad: 'Okcu', url: 'okcu.glb' },
        { ad: 'Sovalye', url: 'sovalye.glb' }
    ];
    yuklenecekler.forEach(m => {
        gltfLoader.load(m.url, (gltf) => {
            modelHafizasi[m.ad] = gltf;
            console.log(`${m.ad} yüklendi!`);
        }, undefined, (err) => {
            console.log(`${m.ad} yüklenemedi (Dosya yok veya yolda hata var)`);
        });
    });
}
modelleriOnYukle();

// --- KULELER VE SAYISAL CANLAR ---
const kuleler = [];
const askerler = [];
let botSolKuleYikildi = false;
let botSagKuleYikildi = false;

function kuleOlustur(x, z, renk, maxCan, taraf, tip) {
    const kuleGrup = new THREE.Group();
    const geo = new THREE.CylinderGeometry(0.7, 0.9, 1.8, 8);
    const mat = new THREE.MeshLambertMaterial({ color: renk });
    const govde = new THREE.Mesh(geo, mat);
    govde.position.y = 0.9;
    kuleGrup.add(govde);

    const barArkaGeo = new THREE.BoxGeometry(1.8, 0.18, 0.1);
    const barArkaMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const barArka = new THREE.Mesh(barArkaGeo, barArkaMat);
    barArka.position.set(0, 2.4, 0);
    kuleGrup.add(barArka);

    const barCanGeo = new THREE.BoxGeometry(1.75, 0.12, 0.12);
    const barCanMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const barCan = new THREE.Mesh(barCanGeo, barCanMat);
    barCan.position.set(0, 2.4, 0.02);
    kuleGrup.add(barCan);

    kuleGrup.position.set(x, 0, z);
    scene.add(kuleGrup);

    const canYazisi = document.createElement('div');
    canYazisi.className = 'kule-can-yazisi';
    canYazisi.innerText = maxCan + " / " + maxCan;
    document.getElementById('can-yazilari-container').appendChild(canYazisi);

    kuleGrup.userData = { 
        taraf: taraf, tip: tip, can: maxCan, maxCan: maxCan, 
        x: x, z: z, barCan: barCan, canYazisi: canYazisi, canli: true 
    };
    kuleler.push(kuleGrup);
}

// Kule Konumları
kuleOlustur(-3.5, 5.5, 0x2980b9, 800, 'oyuncu', 'sol');
kuleOlustur(3.5, 5.5, 0x2980b9, 800, 'oyuncu', 'sag');
kuleOlustur(0, 7, 0x1f4068, 1600, 'oyuncu', 'ana');

kuleOlustur(-3.5, -5.5, 0xe74c3c, 800, 'bot', 'sol');
kuleOlustur(3.5, -5.5, 0xe74c3c, 800, 'bot', 'sag');
kuleOlustur(0, -7, 0xb13131, 1600, 'bot', 'ana');

// İksir Kontrolleri
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
        seciliKart = kartAdi; 
        seciliKartMaliyet = maliyet;
        document.getElementById('card-' + kartAdi).classList.add('active');
        
        sinirIzgarasi.geometry.dispose();

        if (!botSolKuleYikildi && !botSagKuleYikildi) {
            sinirIzgarasi.geometry = new THREE.PlaneGeometry(12, 8.5);
            sinirIzgarasi.position.set(0, 0.06, 4.75); 
        } 
        else if (botSolKuleYikildi && !botSagKuleYikildi) {
            sinirIzgarasi.geometry = new THREE.PlaneGeometry(12, 13);
            sinirIzgarasi.position.set(-2, 0.06, 2.5); 
        } 
        else if (!botSolKuleYikildi && botSagKuleYikildi) {
            sinirIzgarasi.geometry = new THREE.PlaneGeometry(12, 13);
            sinirIzgarasi.position.set(2, 0.06, 2.5); 
        } 
        else {
            sinirIzgarasi.geometry = new THREE.PlaneGeometry(12, 13);
            sinirIzgarasi.position.set(0, 0.06, 2.5);
        }
        
        sinirIzgarasi.visible = true;
    }
}

function sınırlarıGizle() {
    sinirIzgarasi.visible = false;
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
}

function askerIndir(x, z, kartAdi, taraf) {
    // Model henüz sunucudan yüklenmediyse güvenli çıkış yap
    if (!modelHafizasi[kartAdi]) {
        console.log(`${kartAdi} 3D modeli henüz tam yüklenmedi!`);
        return;
    }

    const askerGrup = new THREE.Group();
    let hız, hasar, maxCan;

    if (kartAdi === 'Dev') { hız = 0.018; hasar = 4; maxCan = 250; } 
    else if (kartAdi === 'Okcu') { hız = 0.045; hasar = 1.2; maxCan = 70; } 
    else { hız = 0.035; hasar = 2.2; maxCan = 120; }

    // Hazır 3D Model Klonlaması
    const gltfKopyasi = modelHafizasi[kartAdi].scene.clone();
    gltfKopyasi.scale.set(0.4, 0.4, 0.4); 
    askerGrup.add(gltfKopyasi);

    // Animasyonu Bağlama
    const mixer = new THREE.AnimationMixer(gltfKopyasi);
    if (modelHafizasi[kartAdi].animations.length > 0) {
        const action = mixer.clipAction(modelHafizasi[kartAdi].animations[0]); // 0. sıradaki yürüme animasyonu varsayılır
        action.play();
    }
    const animId = Math.random().toString(36);
    aktifMixerler.push({ id: animId, mixer: mixer });

    // Can Barları
    const bArka = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.05), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    bArka.position.set(0, 1.4, 0);
    askerGrup.add(bArka);

    const bCan = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.05, 0.06), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
    bCan.position.set(0, 1.4, 0.01);
    askerGrup.add(bCan);

    askerGrup.position.set(x, 0, z);
    scene.add(askerGrup);

    askerGrup.userData = { 
        taraf: taraf, hiz: hız, hasar: hasar, can: maxCan, maxCan: maxCan,
        tip: kartAdi, gecitKopru: false, kopruHedef: (x < 0) ? kopruler[0] : kopruler[1],
        barCan: bCan, canli: true, animasyonId: animId
    };
    askerler.push(askerGrup);
}

// Dokunma Yapısı
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
        
        let gecerliSinirZ = 0.5; 
        if (nokta.x < 0 && botSolKuleYikildi) gecerliSinirZ = -4;
        if (nokta.x > 0 && botSagKuleYikildi) gecerliSinirZ = -4;

        if (nokta.z > gecerliSinirZ && nokta.z < 9 && Math.abs(nokta.x) < 6 && oyuncuIksir >= seciliKartMaliyet) {
            askerIndir(nokta.x, nokta.z, seciliKart, 'oyuncu');
            oyuncuIksir -= seciliKartMaliyet;
            seciliKart = null;
            sınırlarıGizle();
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

// Sayısal Kule Canı Arayüz Senkronizasyonu
function kuleCanlariniGuncelle() {
    kuleler.forEach(kule => {
        if (!kule.userData.canli) {
            kule.userData.canYazisi.style.display = 'none';
            return;
        }
        
        const wp = new THREE.Vector3();
        kule.getWorldPosition(wp);
        wp.y += 2.8; 
        wp.project(camera);

        const x = (wp.x * .5 + .5) * window.innerWidth;
        let y = (-(wp.y * .5) + .5) * window.innerHeight;

        if (kule.userData.taraf === 'oyuncu') { y -= 12; }

        kule.userData.canYazisi.style.left = `${x}px`;
        kule.userData.canYazisi.style.top = `${y}px`;
        kule.userData.canYazisi.innerText = `${Math.max(0, Math.ceil(kule.userData.can))} / ${kule.userData.maxCan}`;
    });
}

// --- ANA MATRİS DÖNGÜSÜ ---
function animate() {
    requestAnimationFrame(animate);
    iksirDoldur();
    if (oyunBasladi) kuleCanlariniGuncelle();

    // Animasyon Zamanlayıcı Güncellemesi
    const delta = clock.getDelta();
    aktifMixerler.forEach(m => m.mixer.update(delta));

    if (oyunBasladi) {
        for (let i = askerler.length - 1; i >= 0; i--) {
            if (!askerler[i].userData.canli) {
                // Bellekten animasyon verilerini kazı
                const idx = aktifMixerler.findIndex(m => m.id === askerler[i].userData.animasyonId);
                if (idx !== -1) aktifMixerler.splice(idx, 1);

                scene.remove(askerler[i]);
                askerler.splice(i, 1);
            }
        }

        askerler.forEach(asker => {
            if (!asker.userData.canli) return;
            let hedon = null; let enYakinMesafe = 999;

            if (asker.userData.tip !== 'Dev') {
                askerler.forEach(rakip => {
                    if (rakip.userData.canli && rakip.userData.taraf !== asker.userData.taraf) {
                        let d = asker.position.distanceTo(rakip.position);
                        if (d < enYakinMesafe && d < 3.5) { enYakinMesafe = d; hedon = rakip; }
                    }
                });
            }

            if (!hedon) {
                kuleler.forEach(kule => {
                    if (kule.userData.canli && kule.userData.taraf !== asker.userData.taraf) {
                        let d = asker.position.distanceTo(kule.position);
                        if (d < enYakinMesafe) { enYakinMesafe = d; hedon = kule; }
                    }
                });
            }

            if (hedon) {
                if (enYakinMesafe < 1.1) {
                    hedon.userData.can -= asker.userData.hasar;
                    let oran = hedon.userData.can / hedon.userData.maxCan;
                    hedon.userData.barCan.scale.x = Math.max(0, oran);

                    if (hedon.userData.can <= 0) {
                        hedon.userData.canli = false;
                        if (hedon.userData.tip === 'ana') {
                            macBitir(hedon.userData.taraf === 'bot' ? 'kazandin' : 'kaybettin');
                        } else if (hedon.userData.taraf === 'bot') {
                            if (hedon.userData.tip === 'sol') botSolKuleYikildi = true;
                            if (hedon.userData.tip === 'sag') botSagKuleYikildi = true;
                            scene.remove(hedon);
                        } else { scene.remove(hedon); }
                    }
                    return;
                }

                let hX = hedon.position.x; let hZ = hedon.position.z;
                if (!asker.userData.gecitKopru && ((asker.userData.taraf === 'oyuncu' && asker.position.z > 0) || (asker.userData.taraf === 'bot' && asker.position.z < 0))) {
                    hX = asker.userData.kopruHedef.x; hZ = asker.userData.kopruHedef.z;
                    if (Math.abs(asker.position.z - hZ) < 0.4) asker.userData.gecitKopru = true;
                }

                if (asker.position.x < hX) asker.position.x += asker.userData.hiz;
                if (asker.position.x > hX) asker.position.x -= asker.userData.hiz;
                if (asker.position.z < hZ) asker.position.z += asker.userData.hiz;
                if (asker.position.z > hZ) asker.position.z -= asker.userData.hiz;
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
