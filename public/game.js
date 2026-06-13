let oyunBasladi = false;
let oyunModu = 'bot';
let kalanSure = 180; // 3 dakika
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
        document.getElementById('sure-sayaci').innerText = 
            (dk < 10 ? "0" + dk : dk) + ":" + (sn < 10 ? "0" + sn : sn);

        if (kalanSure <= 0) {
            macBitir('beraberlik');
        }
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

    setTimeout(() => {
        location.reload(); // Sayfayı yenileyerek lobiye temiz dönüş sağlar
    }, 4000);
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

// --- KULELER VE LİSTELER ---
const kuleler = [];
const askerler = [];
const oklar = []; // Uçan oklar için dizi

// Takım Renkleri
const OYUNCU_ANA = 0x2e86de;
const OYUNCU_DETAY = 0x54a0ff;
const BOT_ANA = 0xee5253;
const BOT_DETAY = 0xff6b6b;
const MAT_GOZ = new THREE.MeshBasicMaterial({ color: 0xffffff });
const MAT_METAL = new THREE.MeshLambertMaterial({ color: 0xdcdde1 });

// --- KULE KORUYUCU EKLEME (OKÇU/KRAL) ---
function kuleKoruyucuEkle(x, y, z, renk, tip, kuleGrup) {
    const matAna = new THREE.MeshLambertMaterial({ color: renk });
    const matDetay = new THREE.MeshLambertMaterial({ color: (renk === BOT_ANA ? BOT_DETAY : OYUNCU_DETAY) });
    const koruyucu = new THREE.Group();

    if (tip === 'okcu') {
        // Okçu (Yan Kuleler)
        koruyucu.add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.25), matAna)); // Gövde
        const kafa = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.25, 8), matDetay); kafa.position.y = 0.3; koruyucu.add(kafa); // Kafa
        const goz = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.04), MAT_GOZ); goz.position.set(-0.06, 0.32, (renk === BOT_ANA ? 0.13 : -0.13)); koruyucu.add(goz); // Göz Sol
        const gozS = goz.clone(); gozS.position.x = 0.06; koruyucu.add(gozS); // Göz Sağ
        const yay = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 4, 8, Math.PI), new THREE.MeshLambertMaterial({color: 0xffb142})); yay.position.set(0.2, 0.15, -0.05); yay.rotation.y = Math.PI/2; koruyucu.add(yay); // Yay
    } else {
        // Kral Robot (Ana Kule)
        koruyucu.add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.45), matAna)); // Gövde
        const kafa = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), matDetay); kafa.position.y = 0.45; koruyucu.add(kafa); // Kafa
        const tac = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.15, 8, 1, true), new THREE.MeshBasicMaterial({color: 0xffcc00})); tac.position.y = 0.65; koruyucu.add(tac); // Taç
        const pelerin = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.1), matDetay); pelerin.position.set(0, 0.15, (renk === BOT_ANA ? -0.25 : 0.25)); pelerin.rotation.x = Math.PI/12; koruyucu.add(pelerin); // Pelerin
        const goz = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.06), MAT_GOZ); goz.position.set(-0.08, 0.48, (renk === BOT_ANA ? 0.18 : -0.18)); koruyucu.add(goz); // Göz Sol
        const gozS = goz.clone(); gozS.position.x = 0.08; koruyucu.add(gozS); // Göz Sağ
        // Silah (Kılıç) - Uyuyorken kınında
        const kılıc = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.1), MAT_METAL); kılıc.position.set(0.3, 0.15, 0); kılıc.rotation.x = Math.PI/6; koruyucu.add(kılıc);
    }

    koruyucu.position.set(0, y + (tip === 'okcu' ? 0.2 : 0.3), 0); // Kule üzerine yerleştir
    koruyucu.rotation.y = (renk === BOT_ANA ? 0 : Math.PI); // Bot aşağı, Oyuncu yukarı bakar
    kuleGrup.add(koruyucu);
    return koruyucu;
}

function kuleOlustur(x, z, maxCan, taraf, tip) {
    const kuleGrup = new THREE.Group();
    const renk = (taraf === 'oyuncu' ? OYUNCU_ANA : BOT_ANA);
    
    // Kule Gövdesi
    const geo = new THREE.CylinderGeometry(0.7, 0.9, 1.8, 8);
    const mat = new THREE.MeshLambertMaterial({ color: renk });
    const govde = new THREE.Mesh(geo, mat);
    govde.position.y = 0.9;
    kuleGrup.add(govde);

    // Kule Üzerine Koruyucu Ekle
    const koruyucuTip = (tip === 'ana' ? 'kral' : 'okcu');
    const koruyucuFigur = kuleKoruyucuEkle(x, 1.8, z, renk, koruyucuTip, kuleGrup);

    // Can Barı Arkalığı (Siyah)
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

    // Kule verilerini userData içine kaydet
    kuleGrup.userData = { 
        taraf: taraf, tip: tip, can: maxCan, maxCan: maxCan, 
        x: x, z: z, barCan: barCan, canli: true, 
        koruyucu: koruyucuFigur, koruyucuTip: koruyucuTip, 
        kralUyanik: (tip === 'ana' ? false : true), // Kral maç başında uykuda
        hasar: (tip === 'ana' ? 12 : 5), // Kral uyanınca daha çok vurur
        menzil: (tip === 'ana' ? 4.5 : 5), // Okçular daha uzaktan vurur
        sonAtesZamani: 0
    };
    kuleler.push(kuleGrup);
}

// Kuleleri Yerleştir (z mesafeleri dik ekrana sığacak şekilde daraltıldı)
kuleOlustur(-3.5, 5.5, 800, 'oyuncu', 'yan');
kuleOlustur(3.5, 5.5, 800, 'oyuncu', 'yan');
kuleOlustur(0, 7, 1600, 'oyuncu', 'ana'); // Ana kule

kuleOlustur(-3.5, -5.5, 800, 'bot', 'yan');
kuleOlustur(3.5, -5.5, 800, 'bot', 'yan');
kuleOlustur(0, -7, 1600, 'bot', 'ana'); // Ana kule

// İksir Mekaniği
let oyuncuIksir = 0;
let botIksir = 0;
const maxIksir = 10;
let seciliKart = null;
let seciliKartMaliyet = 0;

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
    }
}

// Ok Fırlatma Efekti
function okFirlat(baslangicPos, hedefNesne, hasar) {
    const okGeo = new THREE.BoxGeometry(0.1, 0.1, 0.6);
    const okMat = new THREE.MeshBasicMaterial({ color: 0xffdb58 });
    const okMesh = new THREE.Mesh(okGeo, okMat);
    okMesh.position.copy(baslangicPos);
    okMesh.position.y += 0.2; // Göğüs hizasından çıksın
    scene.add(okMesh);

    oklar.push({
        mesh: okMesh,
        hedef: hedefNesne,
        hasar: hasar,
        hiz: 0.15
    });
}

// --- ASKER OLUŞTURMA VE HAREKET MANTIĞI ---
function askerIndir(x, z, kartAdi, taraf) {
    const askerGrup = new THREE.Group();
    let geo, matAna, matDetay, hız, hasar, maxCan;

    if (kartAdi === 'Dev') {
        geo = new THREE.BoxGeometry(0.7, 1.2, 0.7);
        hız = 0.018; hasar = 4; maxCan = 250;
    } else if (kartAdi === 'Okcu') {
        geo = new THREE.CylinderGeometry(0.23, 0.23, 0.8, 8);
        hız = 0.045; hasar = 1.2; maxCan = 70;
    } else { // Şövalye
        geo = new THREE.ConeGeometry(0.35, 0.9, 8);
        hız = 0.035; hasar = 2.2; maxCan = 120;
    }

    // Takım Renkleri
    if (taraf === 'oyuncu') {
        matAna = new THREE.MeshLambertMaterial({ color: OYUNCU_ANA });
        matDetay = new THREE.MeshLambertMaterial({ color: OYUNCU_DETAY });
    } else {
        matAna = new THREE.MeshLambertMaterial({ color: BOT_ANA });
        matDetay = new THREE.MeshLambertMaterial({ color: BOT_DETAY });
    }

    const govde = new THREE.Mesh(geo, matAna);
    govde.position.y = 0.4;
    askerGrup.add(govde);

    // Kafa
    const kafaMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), matDetay);
    kafaMesh.position.y = (kartAdi === 'Dev' ? 1.1 : 0.85);
    askerGrup.add(kafaMesh);

    // Bacaklar (Animasyon için ayrı ayrı)
    const bacakSol = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.4, 0.12), matDetay);
    bacakSol.position.set(-0.15, 0.2, 0);
    const bacakSag = bacakSol.clone();
    bacakSag.position.x = 0.15;
    askerGrup.add(bacakSol);
    askerGrup.add(bacakSag);

    // Can Barları
    const bArka = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.05), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    bArka.position.set(0, 1.4, 0);
    askerGrup.add(bArka);

    const bCan = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.05, 0.06), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
    bCan.position.set(0, 1.4, 0.01);
    askerGrup.add(bCan);

    askerGrup.position.set(x, 0, z);
    scene.add(askerGrup);

    // Botlar yukarı bakmalı, Oyuncular aşağı bakmalı (Rota Düzeltme)
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

// --- OYUN DÖNGÜSÜ VE HAREKET MOTORU ---
function animate() {
    requestAnimationFrame(animate);
    iksirDoldur();
    if (oyunBasladi) {
        // Can Barlarını Güncelle (Sayısal Canlar kalktı)
        kuleler.forEach(k => {
            if (k.userData.canli) {
                let oran = k.userData.can / k.userData.maxCan;
                k.userData.barCan.scale.x = Math.max(0, oran);
            }
        });

        // 1. Uçan Okları Güncelle
        for (let i = oklar.length - 1; i >= 0; i--) {
            let ok = oklar[i];
            if (!ok.hedef.userData.canli) { scene.remove(ok.mesh); oklar.splice(i, 1); continue; }
            let hedefPos = new THREE.Vector3();
            ok.hedef.getWorldPosition(hedefPos);
            if(ok.hedef.userData.maxCan > 500) hedefPos.y = 0.9; // Kule ise ortasına gitsin
            let yon = new THREE.Vector3().subVectors(hedefPos, ok.mesh.position).normalize();
            ok.mesh.position.addScaledVector(yon, ok.hiz);
            if (ok.mesh.position.distanceTo(hedefPos) < 0.3) {
                // HASAR ALMA VE KRAL UYANMA KONTROLÜ
                ok.hedef.userData.can -= ok.hasar;
                // Ana kule ise ve hasar yediyse kral uyanır
                if(ok.hedef.userData.tip === 'ana' && !ok.hedef.userData.kralUyanik) { ok.hedef.userData.kralUyanik = true; console.log("Kral Uyandı!"); }
                
                if (ok.hedef.userData.can <= 0) {
                    ok.hedef.userData.canli = false;
                    if (ok.hedef.userData.tip === 'ana') { macBitir(ok.hedef.userData.taraf === 'bot' ? 'kazandin' : 'kaybettin'); } 
                    else if (ok.hedef.userData.taraf === 'bot') {
                        if (ok.hedef.userData.tip === 'sol') botSolKuleYikildi = true;
                        if (ok.hedef.userData.tip === 'sag') botSagKuleYikildi = true;
                        scene.remove(ok.hedef);
                    } else { scene.remove(ok.hedef); }
                }
                scene.remove(ok.mesh); oklar.splice(i, 1);
            }
        }

        // 2. Kule Korumalarını Güncelle (Okçular Saldırır, Kral Robot Uyanır)
        kuleler.forEach(kule => {
            if (!kule.userData.canli) return;
            // Kral robot animasyon (uyanık ise)
            if(kule.userData.tip === 'ana' && kule.userData.kralUyanik) {
                kule.userData.koruyucu.adim += 0.05;
                kule.userData.koruyucu.rotation.y = (kule.userData.taraf === 'bot' ? 0 : Math.PI) + Math.sin(kule.userData.koruyucu.adim) * 0.1;
            }

            // Kule Saldırı Mantığı
            let hedon = null; let enYakinMesafe = 999;
            askerler.forEach(rakip => {
                if (rakip.userData.canli && rakip.userData.taraf !== kule.userData.taraf) {
                    let d = kule.position.distanceTo(rakip.position);
                    if (d < enYakinMesafe && d <= kule.userData.menzil) { enYakinMesafe = d; hedon = rakip; }
                }
            });

            if (hedon) {
                // Eğer okçu kulesi ise ok fırlatır
                if(kule.userData.koruyucuTip === 'okcu' || kule.userData.kralUyanik) {
                    let simdi = Date.now();
                    if (simdi - kule.userData.sonAtesZamani > (kule.userData.koruyucuTip === 'okcu' ? 1400 : 1800)) { // 1.4sn okçu, 1.8sn kral
                        okFirlat(kule.position, hedon, kule.userData.hasar);
                        // Koruyucuyu hedefe çevir (görsel)
                        let yonVec = new THREE.Vector3().subVectors(hedon.position, kule.position);
                        kule.userData.koruyucu.rotation.y = Math.atan2(yonVec.x, yonVec.z);
                        kule.userData.sonAtesZamani = simdi;
                    }
                }
            } else {
                // Hedef yoksa kule koruyucusu eski yönüne döner
                kule.userData.koruyucu.rotation.y = (kule.userData.taraf === 'bot' ? 0 : Math.PI);
            }
        });

        // 3. Askerlerin Savaş Mantığı ve Yürüme Ekseni Düzeltmesi
        askerler.forEach(asker => {
            if (!asker.userData.canli) return;
            let hedon = null; let enYakinMesafe = 999;
            askerler.forEach(rakip => {
                if (rakip.userData.canli && rakip.userData.taraf !== asker.userData.taraf) {
                    let d = asker.position.distanceTo(rakip.position);
                    if (d < enYakinMesafe && d < 4) { enYakinMesafe = d; hedon = rakip; }
                }
            });
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
                    hedon.userData.can -= asker.userData.hasar / 60; // Savaşırken dur
                    asker.userData.bSol.rotation.x = 0; asker.userData.bSag.rotation.x = 0;
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
                // HAREKET VE YÖN DÜZELTME MOTORU (Yön sorununu çözen yer)
                let adimVektörü = new THREE.Vector3();
                let adimHizi = asker.userData.hiz;

                asker.userData.adim += 0.18;
                let sallanti = Math.sin(asker.userData.adim) * 0.5;
                asker.userData.bSol.rotation.x = sallanti; asker.userData.bSag.rotation.x = -sallanti;

                let hX = hedon.position.x; let hZ = hedon.position.z;
                if (!asker.userData.gecitKopru && ((asker.userData.taraf === 'oyuncu' && asker.position.z > 0) || (asker.userData.taraf === 'bot' && asker.position.z < 0))) {
                    hX = asker.userData.kopruHedef.x; hZ = asker.userData.kopruHedef.z;
                    if (Math.abs(asker.position.z - hZ) < 0.3) asker.userData.gecitKopru = true;
                }

                if (asker.position.x < hX) { adimVektörü.x = 1; }
                if (asker.position.x > hX) { adimVektörü.x = -1; }
                if (asker.position.z < hZ) { adimVektörü.z = 1; }
                if (asker.position.z > hZ) { adimVektörü.z = -1; }

                // Yüzünü yürüdüğü yöne çevir
                if (adimVektörü.x !== 0 || adimVektörü.z !== 0) {
                    asker.position.addScaledVector(adimVektörü.normalize(), adimHizi);
                    let yürümeAcisi = Math.atan2(adimVektörü.x, adimVektörü.z);
                    asker.rotation.y = yürümeAcisi;
                }
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
