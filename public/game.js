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
scene.add(new THREE.AmbientLight(0x777777));

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

const sinirGeo = new THREE.PlaneGeometry(12, 8.5); 
const sinirMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, side: THREE.DoubleSide });
const sinirIzgarasi = new THREE.Mesh(sinirGeo, sinirMat);
sinirIzgarasi.rotation.x = -Math.PI / 2;
sinirIzgarasi.position.set(0, 0.06, 4.75); 
sinirIzgarasi.visible = false; 
scene.add(sinirIzgarasi);

// --- KULE SİSTEMİ ---
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

    kuleGrup.userData = { taraf: taraf, tip: tip, can: maxCan, maxCan: maxCan, x: x, z: z, barCan: barCan, canYazisi: canYazisi, canli: true };
    kuleler.push(kuleGrup);
}

kuleOlustur(-3.5, 5.5, 0x2980b9, 800, 'oyuncu', 'sol');
kuleOlustur(3.5, 5.5, 0x2980b9, 800, 'oyuncu', 'sag');
kuleOlustur(0, 7, 0x1f4068, 1600, 'oyuncu', 'ana');
kuleOlustur(-3.5, -5.5, 0xe74c3c, 800, 'bot', 'sol');
kuleOlustur(3.5, -5.5, 0xe74c3c, 800, 'bot', 'sag');
kuleOlustur(0, -7, 0xb13131, 1600, 'bot', 'ana');

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

        if (!botSolKuleYikildi && !botSagKuleYikildi) { sinirIzgarasi.geometry = new THREE.PlaneGeometry(12, 8.5); sinirIzgarasi.position.set(0, 0.06, 4.75); } 
        else if (botSolKuleYikildi && !botSagKuleYikildi) { sinirIzgarasi.geometry = new THREE.PlaneGeometry(12, 13); sinirIzgarasi.position.set(-2, 0.06, 2.5); } 
        else if (!botSolKuleYikildi && botSagKuleYikildi) { sinirIzgarasi.geometry = new THREE.PlaneGeometry(12, 13); sinirIzgarasi.position.set(2, 0.06, 2.5); } 
        else { sinirIzgarasi.geometry = new THREE.PlaneGeometry(12, 13); sinirIzgarasi.position.set(0, 0.06, 2.5); }
        sinirIzgarasi.visible = true;
    }
}

function sınırlarıGizle() {
    sinirIzgarasi.visible = false;
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
}

// --- TAMAMEN KODLA OLUŞAN 3D ROBOT MOTORU ---
function askerIndir(x, z, kartAdi, taraf) {
    const askerGrup = new THREE.Group();
    let hız, hasar, maxCan, anaRenk, detayRenk;

    if (kartAdi === 'Dev') { hız = 0.018; hasar = 4; maxCan = 250; } 
    else if (kartAdi === 'Okcu') { hız = 0.045; hasar = 1.2; maxCan = 70; } 
    else { hız = 0.035; hasar = 2.2; maxCan = 120; }

    // Takım Renkleri
    if (taraf === 'oyuncu') { anaRenk = 0x2e86de; detayRenk = 0x54a0ff; } 
    else { anaRenk = 0xee5253; detayRenk = 0xff6b6b; }

    const matAna = new THREE.MeshLambertMaterial({ color: anaRenk });
    const matDetay = new THREE.MeshLambertMaterial({ color: detayRenk });
    const matGoz = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // 1. GÖVDE
    let govdeGeo = new THREE.BoxGeometry(0.5, 0.6, 0.4);
    if (kartAdi === 'Dev') govdeGeo = new THREE.BoxGeometry(0.8, 1.0, 0.7);
    if (kartAdi === 'Okcu') govdeGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.5, 8);
    const govde = new THREE.Mesh(govdeGeo, matAna);
    govde.position.y = 0.6;
    if (kartAdi === 'Dev') govde.position.y = 0.9;
    askerGrup.add(govde);

    // 2. KAFA
    let kafaGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    if (kartAdi === 'Dev') kafaGeo = new THREE.BoxGeometry(0.45, 0.45, 0.45);
    const kafa = new THREE.Mesh(kafaGeo, matDetay);
    kafa.position.y = govde.position.y + (kartAdi === 'Dev' ? 0.7 : 0.45);
    askerGrup.add(kafa);

    // Gözler
    const gozGeo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
    const gozSol = new THREE.Mesh(gozGeo, matGoz);
    gozSol.position.set(-0.08, kfa = kafa.position.y + 0.05, (kartAdi === 'Dev' ? -0.24 : -0.16));
    const gozSag = gozSol.clone();
    gozSag.position.x = 0.08;
    askerGrup.add(gozSol);
    askerGrup.add(gozSag);

    // 3. BACAKLAR (Animasyon için ayrı ayrı tutulmalı)
    let bacakGeo = new THREE.BoxGeometry(0.12, 0.4, 0.12);
    if (kartAdi === 'Dev') bacakGeo = new THREE.BoxGeometry(0.2, 0.6, 0.2);
    
    const bacakSol = new THREE.Mesh(bacakGeo, matDetay);
    bacakSol.position.set(-0.15, (kartAdi === 'Dev' ? 0.3 : 0.2), 0);
    const bacakSag = bacakSol.clone();
    bacakSag.position.x = 0.15;
    
    askerGrup.add(bacakSol);
    askerGrup.add(bacakSag);

    // 4. SİLAHLAR / KOLLAR
    if (kartAdi === 'Sovalye') {
        const kılıcGeo = new THREE.BoxGeometry(0.06, 0.6, 0.1);
        const kılıc = new THREE.Mesh(kılıcGeo, new THREE.MeshLambertMaterial({ color: 0xdcdde1 }));
        kılıc.position.set(0.35, 0.6, -0.2);
        kılıc.rotation.x = -Math.PI / 4;
        askerGrup.add(kılıc);
    } else if (kartAdi === 'Okcu') {
        const yayGeo = new THREE.TorusGeometry(0.2, 0.03, 4, 8, Math.PI);
        const yay = new THREE.Mesh(yayGeo, new THREE.MeshLambertMaterial({ color: 0xffb142 }));
        yay.position.set(0.25, 0.6, -0.1);
        yay.rotation.y = Math.PI / 2;
        askerGrup.add(yay);
    }

    // Can Barları
    const bArka = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.05), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    bArka.position.set(0, (kartAdi === 'Dev' ? 1.9 : 1.4), 0);
    askerGrup.add(bArka);

    const bCan = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.05, 0.06), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
    bCan.position.set(0, (kartAdi === 'Dev' ? 1.9 : 1.4), 0.01);
    askerGrup.add(bCan);

    askerGrup.position.set(x, 0, z);
    scene.add(askerGrup);

    // Botlar yukarı bakmalı, Oyuncular aşağı bakmalı
    askerGrup.rotation.y = (taraf === 'bot') ? 0 : Math.PI;

    askerGrup.userData = { 
        taraf: taraf, hiz: hız, hasar: hasar, can: maxCan, maxCan: maxCan, 
        tip: kartAdi, gecitKopru: false, kopruHedef: (x < 0) ? kopruler[0] : kopruler[1], 
        barCan: bCan, canli: true, bSol: bacakSol, bSag: bacakSag, adim: Math.random() * 10 
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

function kuleCanlariniGuncelle() {
    kuleler.forEach(kule => {
        if (!kule.userData.canli) { kule.userData.canYazisi.style.display = 'none'; return; }
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

// --- ANA LOOP VE YÜRÜME ANİMASYON SİMÜLASYONU ---
function animate() {
    requestAnimationFrame(animate);
    iksirDoldur();
    if (oyunBasladi) kuleCanlariniGuncelle();

    if (oyunBasladi) {
        for (let i = askerler.length - 1; i >= 0; i--) {
            if (!askerler[i].userData.canli) {
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

                    // Saldırırken bacak sallanmasını sıfırla
                    asker.userData.bSol.rotation.x = 0;
                    asker.userData.bSag.rotation.x = 0;

                    if (hedon.userData.can <= 0) {
                        hedon.userData.canli = false;
                        if (hedon.userData.tip === 'ana') { macBitir(hedon.userData.taraf === 'bot' ? 'kazandin' : 'kaybettin'); } 
                        else if (hedon.userData.taraf === 'bot') {
                            if (hedon.userData.tip === 'sol') botSolKuleYikildi = true;
                            if (hedon.userData.tip === 'sag') botSagKuleYikildi = true;
                            scene.remove(hedon);
                        } else { scene.remove(hedon); }
                    }
                    return;
                }

                // --- PROSESSEL YÜRÜME ANİMASYONU ---
                asker.userData.adim += 0.18;
                let sallanti = Math.sin(asker.userData.adim) * 0.5;
                asker.userData.bSol.rotation.x = sallanti;
                asker.userData.bSag.rotation.x = -sallanti;

                let hX = hedon.position.x; let hZ = hedon.position.z;
                if (!asker.userData.gecitKopru && ((asker.userData.taraf === 'oyuncu' && asker.position.z > 0) || (asker.userData.taraf === 'bot' && asker.position.z < 0))) {
                    hX = asker.userData.kopruHedef.x; hZ = asker.userData.kopruHedef.z;
                    if (Math.abs(asker.position.z - hZ) < 0.4) asker.userData.gecitKopru = true;
                }

                if (asker.position.x < hX) { asker.position.x += asker.userData.hiz; asker.rotation.y = (asker.userData.taraf === 'bot') ? -Math.PI/4 : Math.PI*1.25; }
                if (asker.position.x > hX) { asker.position.x -= asker.userData.hiz; asker.rotation.y = (asker.userData.taraf === 'bot') ? Math.PI/4 : Math.PI*0.75; }
                if (asker.position.z < hZ) { asker.position.z += asker.userData.hiz; if(Math.abs(asker.position.x - hX) < 0.1) asker.rotation.y = 0; }
                if (asker.position.z > hZ) { asker.position.z -= asker.userData.hiz; if(Math.abs(asker.position.x - hX) < 0.1) asker.rotation.y = Math.PI; }
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
