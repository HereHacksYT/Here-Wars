let oyunBasladi = false;
let oyunModu = 'bot'; // 'online', 'bot', 'friend'
let kalanSure = 180;
let sureZamanlayici = null;

let seciliKart = 'Sovalye';
let seciliKartMaliyet = 3;

// --- Gelişmiş Lobi ve Mod Seçimi ---
function oyunModuSec(mod) {
    document.querySelectorAll('.mod-btn').forEach(b => b.classList.remove('active'));
    oyunModu = mod;
    
    document.getElementById('mod-' + mod).classList.add('active');
    
    // Arkadaşa karşı ise şifreli oda kurma/katılma alanını aç
    const odaPaneli = document.getElementById('oda-paneli');
    if(mod === 'friend') {
        odaPaneli.style.display = 'flex';
    } else {
        odaPaneli.style.display = 'none';
    }
}

function odaEylemi(eylem) {
    const odaKod = document.getElementById('oda-kod-input').value.trim();
    const odaSifre = document.getElementById('oda-sifre-input').value.trim();
    
    if(!odaKod || !odaSifre) {
        alert("Lütfen Oda Kodu ve Şifre alanlarını doldurun, reis!");
        return;
    }
    
    if(eylem === 'kur') {
        alert(`Başarılı! ${odaKod} numaralı oda şifreli olarak kuruldu. Arkadaşının katılması bekleniyor...`);
    } else {
        alert(`${odaKod} odasına şifre doğrulanarak başarıyla bağlanılıyor!`);
    }
}

function menudeKartSec(kartAdi, maliyet) {
    document.querySelectorAll('.menu-card-btn').forEach(b => {
        b.style.border = '2px solid #ccc';
        b.style.background = 'white';
    });
    
    seciliKart = kartAdi;
    seciliKartMaliyet = maliyet;
    
    const aktifButon = document.getElementById('menu-btn-' + kartAdi);
    if(aktifButon) {
        aktifButon.style.border = '3px solid #2ecc71';
        aktifButon.style.background = '#e8f8f5';
    }
}

function oyunuBaslat() {
    if(oyunModu === 'online') {
        alert("Online Savaş modu aranıyor... Rakip bekleniyor!");
    }
    
    document.getElementById('menu-ekrani').style.display = 'none';
    document.getElementById('oyun-ui').style.display = 'block';
    document.getElementById('sure-sayaci').style.display = 'block';
    
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
    const aktifOyunKarti = document.getElementById('card-' + seciliKart);
    if(aktifOyunKarti) aktifOyunKarti.classList.add('active');
    
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

// --- DOKU ÜRETİCİLERİ ---
function createGrassTexture() {
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#4caf50'; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 8000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#388e3c' : '#81c784';
        ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 6);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(4, 4);
    return texture;
}

function createStoneTexture() {
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#7f8c8d'; ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#34495e'; ctx.lineWidth = 3;
    for(let y=0; y<256; y+=32) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); stroke();
        let offset = (y % 64 === 0) ? 0 : 32;
        for(let x=offset; x<=256; x+=64) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y+32); ctx.stroke(); }
    }
    return new THREE.CanvasTexture(canvas);
}

function createWaterTexture() {
    const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#2980b9'; ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#3498db';
    for (let i = 0; i < 20; i++) { ctx.fillRect(Math.random() * 128, Math.random() * 128, 40, 4); }
    return new THREE.CanvasTexture(canvas);
}

function createAskerTexture(anaRenk, tip) {
    const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = anaRenk; ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    if (tip === 'Dev') {
        ctx.fillRect(0, 50, 128, 25); ctx.fillStyle = '#d35400'; ctx.fillRect(50, 45, 28, 35);
    } else if (tip === 'Okcu') {
        ctx.lineWidth = 12; ctx.strokeStyle = '#5c3d2e'; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(128,128); ctx.stroke();
    } else {
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(64,0); ctx.lineTo(64,128); ctx.stroke();
    }
    return new THREE.CanvasTexture(canvas);
}

// --- THREE.JS KURULUMU ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x27ae60);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 22, 26); 
camera.lookAt(0, -1, -3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1.4);
light.position.set(6, 35, 15);
scene.add(light);
scene.add(new THREE.AmbientLight(0x999999));

const grassTex = createGrassTexture();
const stoneTex = createStoneTexture();
const waterTex = createWaterTexture();

// Arena
const arenaGeo = new THREE.PlaneGeometry(30, 40);
const arenaMat = new THREE.MeshLambertMaterial({ map: grassTex });
const arena = new THREE.Mesh(arenaGeo, arenaMat);
arena.rotation.x = -Math.PI / 2;
scene.add(arena);

const groundGeo = new THREE.PlaneGeometry(70, 70);
const groundMat = new THREE.MeshBasicMaterial({ visible: false });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Nehir
const riverGeo = new THREE.BoxGeometry(24, 0.1, 3.0);
const riverMat = new THREE.MeshLambertMaterial({ map: waterTex });
const river = new THREE.Mesh(riverGeo, riverMat);
river.position.set(0, 0.05, 0);
scene.add(river);

const kopruler = [{ x: -5.5, z: 0 }, { x: 5.5, z: 0 }];
function kopruCiz(x) {
    const geo = new THREE.BoxGeometry(3.0, 0.2, 3.8);
    const mat = new THREE.MeshLambertMaterial({ map: stoneTex });
    const msh = new THREE.Mesh(geo, mat);
    msh.position.set(x, 0.12, 0);
    scene.add(msh);
}
kopruCiz(-5.5); kopruCiz(5.5);

// Engel Duvarları
const suDuvarlari = [];
function suDuvariOlustur(x, genislik) {
    const dGeo = new THREE.BoxGeometry(genislik, 4.0, 2.8);
    const dMat = new THREE.MeshBasicMaterial({ visible: false });
    const dMesh = new THREE.Mesh(dGeo, dMat);
    dMesh.position.set(x, 2.0, 0);
    scene.add(dMesh);
    suDuvarlari.push(dMesh);
}
suDuvariOlustur(-9.5, 5.0); 
suDuvariOlustur(0, 8.0);    
suDuvariOlustur(9.5, 5.0);  

// Dinamik Sınır Izgarası
const sinirGeo = new THREE.PlaneGeometry(20, 13.5); 
const sinirMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });
const sinirIzgarasi = new THREE.Mesh(sinirGeo, sinirMat);
sinirIzgarasi.rotation.x = -Math.PI / 2;
sinirIzgarasi.position.set(0, 0.07, 7.5); 
sinirIzgarasi.visible = false; 
scene.add(sinirIzgarasi);

// Taraftarlar
const taraftarlar = [];
function tribünVeTaraftarEkle(xYonu) {
    const tribünGeo = new THREE.BoxGeometry(2.0, 1.5, 36);
    const tribünMat = new THREE.MeshLambertMaterial({ color: 0x7f8c8d });
    const tribün = new THREE.Mesh(tribünGeo, tribünMat);
    tribün.position.set(xYonu * 11.2, 0.75, 0);
    scene.add(tribün);

    const renkler = [0xe74c3c, 0x3498db, 0xf1c40f, 0x9b59b6, 0xffffff];
    for (let z = -17; z <= 17; z += 2.0) {
        const tGrup = new THREE.Group();
        const tMat = new THREE.MeshLambertMaterial({ color: renkler[Math.floor(Math.random() * renkler.length)] });
        
        const gövde = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.8, 0.55), tMat); gövde.position.y = 0.4; tGrup.add(gövde);
        const kafa = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), new THREE.MeshLambertMaterial({ color: 0xffdbac })); kafa.position.y = 0.9; tGrup.add(kafa);
        
        tGrup.position.set(xYonu * 11.2, 1.5, z);
        scene.add(tGrup);
        taraftarlar.push({ mesh: tGrup, hiz: 0.12 + Math.random() * 0.18, offset: Math.random() * 10 });
    }
}
tribünVeTaraftarEkle(-1); 
tribünVeTaraftarEkle(1);  

// Kuleler
const kuleler = [];
const askerler = [];
const oklar = [];
let botSolKuleYikildi = false;
let botSagKuleYikildi = false;

const OYUNCU_ANA = '#2e86de';
const OYUNCU_DETAY = 0x54a0ff;
const BOT_ANA = '#ee5253';
const BOT_DETAY = 0xff6b6b;

function kuleKoruyucuEkle(renkStr, tip, kuleGrup, taraf) {
    const matAna = new THREE.MeshLambertMaterial({ color: new THREE.Color(renkStr) });
    const matDetay = new THREE.MeshLambertMaterial({ color: (taraf === 'oyuncu' ? OYUNCU_DETAY : BOT_DETAY) });
    const koruyucu = new THREE.Group();

    if (tip === 'okcu') {
        koruyucu.add(new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.45), matAna));
        const kafa = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.4, 8), matDetay); kafa.position.y = 0.5; koruyucu.add(kafa);
        const yay = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 4, 8, Math.PI), new THREE.MeshLambertMaterial({color: 0xffb142})); yay.position.set(0.35, 0.25, -0.05); yay.rotation.y = Math.PI/2; koruyucu.add(yay);
    } else {
        koruyucu.add(new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.0, 0.75), matAna));
        const kafa = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), matDetay); kafa.position.y = 0.8; koruyucu.add(kafa);
        const tac = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, 0.25, 8, 1, true), new THREE.MeshBasicMaterial({color: 0xffcc00})); tac.position.y = 1.2; koruyucu.add(tac);
    }

    koruyucu.position.set(0, 1.8, 0);
    koruyucu.rotation.y = (taraf === 'oyuncu') ? Math.PI : 0;
    kuleGrup.add(koruyucu);
    return koruyucu;
}

function kuleOlustur(x, z, maxCan, taraf, tip) {
    const kuleGrup = new THREE.Group();
    
    const govde = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.55, 2.5, 8), new THREE.MeshLambertMaterial({ map: stoneTex }));
    govde.position.y = 1.25;
    kuleGrup.add(govde);

    const bantMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(taraf === 'oyuncu' ? OYUNCU_ANA : BOT_ANA) });
    const bant = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.25, 0.4, 8), bantMat);
    bant.position.y = 2.2;
    kuleGrup.add(bant);

    const koruyucuTip = (tip === 'ana' ? 'kral' : 'okcu');
    const koruyucuFigur = kuleKoruyucuEkle(taraf === 'oyuncu' ? OYUNCU_ANA : BOT_ANA, koruyucuTip, kuleGrup, taraf);

    const uiGrup = new THREE.Group();
    uiGrup.position.set(0, 3.6, 0);

    const barArka = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.26, 0.02), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    uiGrup.add(barArka);

    const barCan = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.18, 0.03), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
    barCan.position.z = 0.01;
    uiGrup.add(barCan);
    kuleGrup.add(uiGrup);

    kuleGrup.position.set(x, 0, z);
    scene.add(kuleGrup);

    kuleGrup.userData = { 
        taraf: taraf, tip: tip, can: maxCan, maxCan: maxCan, 
        uiGrup: uiGrup, barCan: barCan, canli: true, 
        koruyucu: koruyucuFigur, koruyucuTip: koruyucuTip, 
        kralUyanik: (tip === 'ana' ? false : true),
        hasar: (tip === 'ana' ? 35 : 22), 
        menzil: (tip === 'ana' ? 8.5 : 10.0),
        sonAtesZamani: 0
    };
    kuleler.push(kuleGrup);
}

kuleOlustur(-5.5, 8.5, 800, 'oyuncu', 'sol');
kuleOlustur(5.5, 8.5, 800, 'oyuncu', 'sag');
kuleOlustur(0, 10.5, 1600, 'oyuncu', 'ana');
kuleOlustur(-5.5, -8.5, 800, 'bot', 'sol');
kuleOlustur(5.5, -8.5, 800, 'bot', 'sag');
kuleOlustur(0, -10.5, 1600, 'bot', 'ana');

let oyuncuIksir = 0; let botIksir = 0; const maxIksir = 10;

function iksirDoldur() {
    if (!oyunBasladi) return;
    if (oyuncuIksir < maxIksir) {
        oyuncuIksir += 0.025;
        document.getElementById('iksir-doluluk').style.width = (oyuncuIksir / maxIksir * 100) + '%';
        document.getElementById('iksir-metin').innerText = Math.floor(oyuncuIksir) + " / " + maxIksir;
    }
    if (botIksir < maxIksir) botIksir += 0.025;
}

// Oyun içi tıklamayla kart seçince sınır ızgarasını güncelleme alanı
function kartSec(kartAdi, maliyet) {
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
    if (oyuncuIksir >= maliyet) {
        seciliKart = kartAdi;
        seciliKartMaliyet = maliyet;
        document.getElementById('card-' + kartAdi).classList.add('active');

        sinirIzgarasi.geometry.dispose();
        
        // 👑 TAM ÇÖZÜM: Yıkılan kulelere göre sınır çizgilerini dinamik genişletiyoruz!
        if (botSolKuleYikildi && botSagKuleYikildi) {
            // İki kule de yıkıldıysa sınır tam köprünün ötesine (-4.5'e kadar) genişler!
            sinirIzgarasi.geometry = new THREE.PlaneGeometry(20, 25); 
            sinirIzgarasi.position.set(0, 0.06, 2.0);
        } else {
            sinirIzgarasi.geometry = new THREE.PlaneGeometry(20, 13.5); 
            sinirIzgarasi.position.set(0, 0.07, 7.5);
        }
        sinirIzgarasi.visible = true;
    }
}

function sınırlarıGizle() {
    sinirIzgarasi.visible = false;
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
}

function okFirlat(baslangicPos, healerNesne, hasar) {
    const okGeo = new THREE.SphereGeometry(0.18, 4, 4);
    const okMesh = new THREE.Mesh(okGeo, new THREE.MeshBasicMaterial({ color: 0xffcc00 }));
    okMesh.position.copy(baslangicPos); okMesh.position.y += 1.4;
    scene.add(okMesh);
    oklar.push({ mesh: okMesh, hedef: healerNesne, hasar: hasar, hiz: 0.38 });
}

function askerIndir(x, z, kartAdi, taraf) {
    const askerGrup = new THREE.Group();
    let geo, hız, hasar, maxCan, menzil;

    if (kartAdi === 'Dev') {
        geo = new THREE.BoxGeometry(1.2, 2.0, 1.2); hız = 0.028; hasar = 28; maxCan = 320; menzil = 2.0;
    } else if (kartAdi === 'Okcu') {
        geo = new THREE.CylinderGeometry(0.4, 0.4, 1.3, 8); hız = 0.055; hasar = 14; maxCan = 75; menzil = 6.5;
    } else {
        geo = new THREE.BoxGeometry(0.85, 1.3, 0.85); hız = 0.05; hasar = 22; maxCan = 140; menzil = 1.8;
    }

    const anaRenk = (taraf === 'oyuncu' ? OYUNCU_ANA : BOT_ANA);
    const matDetay = new THREE.MeshLambertMaterial({ color: (taraf === 'oyuncu' ? OYUNCU_DETAY : BOT_DETAY) });
    const matDoku = new THREE.MeshLambertMaterial({ map: createAskerTexture(anaRenk, kartAdi) });

    const govde = new THREE.Mesh(geo, matDoku);
    govde.position.y = 0.85;
    askerGrup.add(govde);

    const kafaMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), matDetay);
    kafaMesh.position.y = (kartAdi === 'Dev' ? 2.0 : 1.6);
    askerGrup.add(kafaMesh);

    const bacakSol = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.2), matDetay);
    bacakSol.position.set(-0.25, 0.3, 0);
    const bacakSag = bacakSol.clone(); bacakSag.position.x = 0.25;
    askerGrup.add(bacakSol); askerGrup.add(bacakSag);

    const uiGrup = new THREE.Group();
    uiGrup.position.set(0, 2.4, 0);

    const bArka = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.12, 0.02), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    uiGrup.add(bArka);

    const bCan = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.07, 0.03), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
    bCan.position.z = 0.01;
    uiGrup.add(bCan);
    askerGrup.add(uiGrup);

    askerGrup.position.set(x, 0, z);
    scene.add(askerGrup);

    askerGrup.userData = { 
        taraf: taraf, hiz: hız, hasar: hasar, can: maxCan, maxCan: maxCan, menzil: menzil,
        tip: kartAdi, gecitKopru: false, kopruHedef: (x < 0) ? kopruler[0] : kopruler[1], 
        uiGrup: uiGrup, barCan: bCan, canli: true, bSol: bacakSol, bSag: bacakSag, adim: Math.random() * 10,
        sonAtesZamani: 0
    };
    askerler.push(askerGrup);
}

const raycaster = new THREE.Raycaster(); const mouse = new THREE.Vector2();
window.addEventListener('pointerdown', (e) => {
    if (!oyunBasladi || !seciliKart) return;
    if (e.clientY > window.innerHeight - 130) return; 

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1; mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(ground);
    if (intersects.length > 0) {
        const nokta = intersects[0].point;
        let izinVerildi = false;
        
        // 👑 TAM ÇÖZÜM: Kuleler yıkıldıkça tıklama ile haritaya yerleştirme sınırlarını da genişletiyoruz!
        if (nokta.z > 0.2 && nokta.z < 13.5 && Math.abs(nokta.x) < 10.0) {
            izinVerildi = true; 
        } else if (botSolKuleYikildi && nokta.x < 0 && nokta.z > -5.0 && nokta.z <= 0.2 && nokta.x > -10.0) {
            izinVerildi = true; // Sol kule yıkıldıysa nehrin ilerisine asker atılabilir
        } else if (botSagKuleYikildi && nokta.x > 0 && nokta.z > -5.0 && nokta.z <= 0.2 && nokta.x < 10.0) {
            izinVerildi = true; // Sağ kule yıkıldıysa nehrin ilerisine asker atılabilir
        }

        if (izinVerildi && oyuncuIksir >= seciliKartMaliyet) {
            askerIndir(nokta.x, nokta.z, seciliKart, 'oyuncu');
            oyuncuIksir -= seciliKartMaliyet; seciliKart = null; sınırlarıGizle();
        }
    }
});

setInterval(() => {
    if (!oyunBasladi || oyunModu !== 'bot') return;
    const kartlar = ['Sovalye', 'Okcu', 'Dev']; const maliyetler = [3, 2, 5];
    const r = Math.floor(Math.random() * kartlar.length);
    if (botIksir >= maliyetler[r]) {
        askerIndir((Math.random() * 10) - 5, -8.5, kartlar[r], 'bot');
        botIksir -= maliyetler[r];
    }
}, 3500);

function animate() {
    requestAnimationFrame(animate);
    iksirDoldur();
    
    taraftarlar.forEach(t => {
        t.mesh.position.y = 1.5 + Math.abs(Math.sin(Date.now() * 0.004 * t.hiz + t.offset)) * 0.4;
    });

    if (oyunBasladi) {
        kuleler.forEach(k => {
            if (k.userData.canli && k.userData.uiGrup) {
                let oran = k.userData.can / k.userData.maxCan;
                k.userData.barCan.scale.x = Math.max(0.001, oran);
                k.userData.uiGrup.lookAt(camera.position);
            }
        });

        for (let i = askerler.length - 1; i >= 0; i--) {
            if (!askerler[i].userData.canli) { scene.remove(askerler[i]); askerler.splice(i, 1); }
        }

        askerler.forEach(asker => {
            if (asker.userData.canli && asker.userData.uiGrup) {
                asker.userData.uiGrup.lookAt(camera.position);
            }
        });

        for (let i = oklar.length - 1; i >= 0; i--) {
            let ok = oklar[i];
            if (!ok.hedef.userData.canli) { scene.remove(ok.mesh); oklar.splice(i, 1); continue; }
            let hPos = new THREE.Vector3(); ok.hedef.getWorldPosition(hPos);
            if(ok.hedef.userData.maxCan > 500) hPos.y = 1.1;
            let yon = new THREE.Vector3().subVectors(hPos, ok.mesh.position).normalize();
            ok.mesh.position.addScaledVector(yon, ok.hiz);

            if (ok.mesh.position.distanceTo(hPos) < 0.5) {
                ok.hedef.userData.can -= ok.hasar;
                if(ok.hedef.userData.maxCan < 500 && ok.hedef.userData.barCan) {
                    ok.hedef.userData.barCan.scale.x = Math.max(0.001, ok.hedef.userData.can / ok.hedef.userData.maxCan);
                }
                if(ok.hedef.userData.tip === 'ana' && !ok.hedef.userData.kralUyanik) ok.hedef.userData.kralUyanik = true;

                if (ok.hedef.userData.can <= 0) {
                    ok.hedef.userData.canli = false;
                    if (ok.hedef.userData.tip === 'ana') { macBitir(ok.hedef.userData.taraf === 'bot' ? 'kazandin' : 'kaybettin'); }
                    else {
                        if (ok.hedef.userData.tip === 'sol' && ok.hedef.userData.taraf === 'bot') botSolKuleYikildi = true;
                        if (ok.hedef.userData.tip === 'sag' && ok.hedef.userData.taraf === 'bot') botSagKuleYikildi = true;
                        scene.remove(ok.hedef);
                    }
                }
                scene.remove(ok.mesh); oklar.splice(i, 1);
            }
        }

        kuleler.forEach(kule => {
            if (!kule.userData.canli) return;
            let hedon = null; let enYakinMesafe = 999;
            askerler.forEach(rakip => {
                if (rakip.userData.canli && rakip.userData.taraf !== kule.userData.taraf) {
                    let d = kule.position.distanceTo(rakip.position);
                    if (d < enYakinMesafe && d <= kule.userData.menzil) { enYakinMesafe = d; hedon = rakip; }
                }
            });
            if (hedon && (kule.userData.koruyucuTip === 'okcu' || kule.userData.kralUyanik)) {
                let simdi = Date.now();
                if (simdi - kule.userData.sonAtesZamani > (kule.userData.koruyucuTip === 'okcu' ? 1000 : 1400)) { 
                    okFirlat(kule.position, hedon, kule.userData.hasar); kule.userData.sonAtesZamani = simdi;
                }
            }
        });

        askerler.forEach(asker => {
            if (!asker.userData.canli) return;
            let hedon = null; let enYakinMesafe = 999;

            if (asker.userData.tip === 'Dev') {
                kuleler.forEach(kule => {
                    if (kule.userData.canli && kule.userData.taraf !== asker.userData.taraf) {
                        let d = asker.position.distanceTo(kule.position);
                        if (d < enYakinMesafe) { enYakinMesafe = d; hedon = kule; }
                    }
                });
            } else {
                askerler.forEach(rakip => {
                    if (rakip.userData.canli && rakip.userData.taraf !== asker.userData.taraf) {
                        let d = asker.position.distanceTo(rakip.position);
                        if (d < enYakinMesafe && d < 8.0) { enYakinMesafe = d; hedon = rakip; }
                    }
                });
                if (!hedon) {
                    kuleler.forEach(kule => {
                        if (kule.userData.canli && kule.userData.taraf !== asker.userData.taraf) {
                            let d = kule.position.distanceTo(kule.position);
                            if (d < enYakinMesafe) { enYakinMesafe = d; hedon = kule; }
                        }
                    });
                }
            }

            if (hedon) {
                if (enYakinMesafe <= asker.userData.menzil) {
                    asker.userData.bSol.rotation.x = 0; asker.userData.bSag.rotation.x = 0;
                    let tPos = new THREE.Vector3(hedon.position.x, asker.position.y, hedon.position.z);
                    asker.lookAt(tPos);

                    if (asker.userData.tip === 'Okcu') {
                        let simdi = Date.now();
                        if (simdi - asker.userData.sonAtesZamani > 1200) {
                            okFirlat(asker.position, hedon, asker.userData.hasar); asker.userData.sonAtesZamani = simdi;
                        }
                    } else {
                        hedon.userData.can -= asker.userData.hasar / 45;
                        if(hedon.userData.maxCan < 500 && hedon.userData.barCan) {
                            hedon.userData.barCan.scale.x = Math.max(0.001, hedon.userData.can / hedon.userData.maxCan);
                        }
                        if (hedon.userData.can <= 0) {
                            hedon.userData.canli = false;
                            if (hedon.userData.tip === 'ana') { macBitir(hedon.userData.taraf === 'bot' ? 'kazandin' : 'kaybettin'); }
                            else { scene.remove(hedon); }
                        }
                    }
                    return;
                }

                asker.userData.adim += 0.2;
                let sallanti = Math.sin(asker.userData.adim) * 0.5;
                asker.userData.bSol.rotation.x = sallanti; asker.userData.bSag.rotation.x = -sallanti;

                let hX = hedon.position.x; let hZ = hedon.position.z;
                if (!asker.userData.gecitKopru && ((asker.userData.taraf === 'oyuncu' && asker.position.z > 0) || (asker.userData.taraf === 'bot' && asker.position.z < 0))) {
                    hX = asker.userData.kopruHedef.x; hZ = asker.userData.kopruHedef.z;
                    if (Math.abs(asker.position.z - hZ) < 0.5) asker.userData.gecitKopru = true;
                }

                let hareketYonu = new THREE.Vector3(hX - asker.position.x, 0, hZ - asker.position.z).normalize();
                asker.position.addScaledVector(hareketYonu, asker.userData.hiz);
                let bakilacakNokta = new THREE.Vector3(asker.position.x + hareketYonu.x, asker.position.y, asker.position.z + hareketYonu.z);
                asker.lookAt(bakilacakNokta);
            }
        });
    }
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
