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

// 📱 TELEFON EKRANI İÇİN KAMERA OPTİMİZASYONU: Daha yukarıda (Y: 24) ve daha geride (Z: 14)
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 24, 14); 
camera.lookAt(0, 0, -1.5); // Tam harita merkezinin biraz üstüne odaklanıyor

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1.4);
light.position.set(4, 25, 6);
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

// Zemin Tıklama Alanı (Kamera açısı değiştiği için tıklamayı geniş tuttuk)
const groundGeo = new THREE.PlaneGeometry(40, 40);
const groundMat = new THREE.MeshBasicMaterial({ visible: false });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// DİNAMİK BEYAZ SINIR GÖSTERGESİ
const sinirGeo = new THREE.PlaneGeometry(13, 8.5); 
const sinirMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
const sinirIzgarasi = new THREE.Mesh(sinirGeo, sinirMat);
sinirIzgarasi.rotation.x = -Math.PI / 2;
sinirIzgarasi.position.set(0, 0.06, 4.5); 
sinirIzgarasi.visible = false; 
scene.add(sinirIzgarasi);

// --- KULELER VE LİSTELER ---
const kuleler = [];
const askerler = [];
const oklar = [];
let botSolKuleYikildi = false;
let botSagKuleYikildi = false;

const OYUNCU_ANA = 0x2e86de;
const OYUNCU_DETAY = 0x54a0ff;
const BOT_ANA = 0xee5253;
const BOT_DETAY = 0xff6b6b;

function kuleKoruyucuEkle(renk, tip, kuleGrup, taraf) {
    const matAna = new THREE.MeshLambertMaterial({ color: renk });
    const matDetay = new THREE.MeshLambertMaterial({ color: (taraf === 'oyuncu' ? OYUNCU_DETAY : BOT_DETAY) });
    const koruyucu = new THREE.Group();

    if (tip === 'okcu') {
        koruyucu.add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.25), matAna));
        const kafa = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.25, 8), matDetay); kafa.position.y = 0.3; koruyucu.add(kafa);
        const yay = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 4, 8, Math.PI), new THREE.MeshLambertMaterial({color: 0xffb142})); yay.position.set(0.2, 0.15, -0.05); yay.rotation.y = Math.PI/2; koruyucu.add(yay);
    } else {
        koruyucu.add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.45), matAna));
        const kafa = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), matDetay); kafa.position.y = 0.45; koruyucu.add(kafa);
        const tac = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.15, 8, 1, true), new THREE.MeshBasicMaterial({color: 0xffcc00})); tac.position.y = 0.65; koruyucu.add(tac);
    }

    koruyucu.position.set(0, 1.1, 0);
    koruyucu.rotation.y = (taraf === 'oyuncu') ? Math.PI : 0;
    kuleGrup.add(koruyucu);
    return koruyucu;
}

function kuleOlustur(x, z, maxCan, taraf, tip) {
    const kuleGrup = new THREE.Group();
    const renk = (taraf === 'oyuncu' ? OYUNCU_ANA : BOT_ANA);
    
    const geo = new THREE.CylinderGeometry(0.65, 0.85, 1.5, 8);
    const mat = new THREE.MeshLambertMaterial({ color: renk });
    const govde = new THREE.Mesh(geo, mat);
    govde.position.y = 0.75;
    kuleGrup.add(govde);

    const koruyucuTip = (tip === 'ana' ? 'kral' : 'okcu');
    const koruyucuFigur = kuleKoruyucuEkle(renk, koruyucuTip, kuleGrup, taraf);

    const barArkaGeo = new THREE.BoxGeometry(1.6, 0.16, 0.1);
    const barArka = new THREE.Mesh(barArkaGeo, new THREE.MeshBasicMaterial({ color: 0x000000 }));
    barArka.position.set(0, 2.1, 0);
    kuleGrup.add(barArka);

    const barCanGeo = new THREE.BoxGeometry(1.55, 0.11, 0.12);
    const barCan = new THREE.Mesh(barCanGeo, new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
    barCan.position.set(0, 2.1, 0.02);
    kuleGrup.add(barCan);

    kuleGrup.position.set(x, 0, z);
    scene.add(kuleGrup);

    kuleGrup.userData = { 
        taraf: taraf, tip: tip, can: maxCan, maxCan: maxCan, 
        x: x, z: z, barCan: barCan, canli: true, 
        koruyucu: koruyucuFigur, koruyucuTip: koruyucuTip, 
        kralUyanik: (tip === 'ana' ? false : true),
        hasar: (tip === 'ana' ? 35 : 22), 
        menzil: (tip === 'ana' ? 5.0 : 6.0),
        sonAtesZamani: 0
    };
    kuleler.push(kuleGrup);
}

// Harita yerleşim z mesafeleri yeni kameraya göre tam hizalı duracak
kuleOlustur(-3.5, 5.5, 800, 'oyuncu', 'sol');
kuleOlustur(3.5, 5.5, 800, 'oyuncu', 'sag');
kuleOlustur(0, 6.8, 1600, 'oyuncu', 'ana');
kuleOlustur(-3.5, -5.5, 800, 'bot', 'sol');
kuleOlustur(3.5, -5.5, 800, 'bot', 'sag');
kuleOlustur(0, -6.8, 1600, 'bot', 'ana');

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
        if (botSolKuleYikildi && botSagKuleYikildi) {
            sinirIzgarasi.geometry = new THREE.PlaneGeometry(13, 14);
            sinirIzgarasi.position.set(0, 0.06, 1.8);
        } else if (botSolKuleYikildi || botSagKuleYikildi) {
            sinirIzgarasi.geometry = new THREE.PlaneGeometry(13, 14); 
            sinirIzgarasi.position.set(0, 0.06, 1.8);
        } else {
            sinirIzgarasi.geometry = new THREE.PlaneGeometry(13, 8.5);
            sinirIzgarasi.position.set(0, 0.06, 4.5);
        }
        sinirIzgarasi.visible = true;
    }
}

function sınırlarıGizle() {
    sinirIzgarasi.visible = false;
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
}

function okFirlat(baslangicPos, healerNesne, hasar) {
    const okGeo = new THREE.SphereGeometry(0.09, 4, 4);
    const okMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
    const okMesh = new THREE.Mesh(okGeo, okMat);
    okMesh.position.copy(baslangicPos);
    okMesh.position.y += 0.8;
    scene.add(okMesh);
    oklar.push({ mesh: okMesh, hedef: healerNesne, hasar: hasar, hiz: 0.22 });
}

// --- ASKER MOTORU ---
function askerIndir(x, z, kartAdi, taraf) {
    const askerGrup = new THREE.Group();
    let geo, matAna, matDetay, hız, hasar, maxCan, menzil;

    if (kartAdi === 'Dev') {
        geo = new THREE.BoxGeometry(0.65, 1.1, 0.65);
        hız = 0.02; hasar = 28; maxCan = 320; menzil = 1.2;
    } else if (kartAdi === 'Okcu') {
        geo = new THREE.CylinderGeometry(0.2, 0.2, 0.7, 8);
        hız = 0.042; hasar = 14; maxCan = 75; menzil = 3.8;
    } else {
        geo = new THREE.BoxGeometry(0.45, 0.7, 0.45);
        hız = 0.036; hasar = 22; maxCan = 140; menzil = 1.1;
    }

    if (taraf === 'oyuncu') {
        matAna = new THREE.MeshLambertMaterial({ color: OYUNCU_ANA });
        matDetay = new THREE.MeshLambertMaterial({ color: OYUNCU_DETAY });
    } else {
        matAna = new THREE.MeshLambertMaterial({ color: BOT_ANA });
        matDetay = new THREE.MeshLambertMaterial({ color: BOT_DETAY });
    }

    const govde = new THREE.Mesh(geo, matAna);
    govde.position.y = 0.45;
    askerGrup.add(govde);

    const kafaMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), matDetay);
    kafaMesh.position.y = (kartAdi === 'Dev' ? 1.1 : 0.9);
    askerGrup.add(kafaMesh);

    const bacakSol = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.35, 0.1), matDetay);
    bacakSol.position.set(-0.14, 0.18, 0);
    const bacakSag = bacakSol.clone();
    bacakSag.position.x = 0.14;
    askerGrup.add(bacakSol);
    askerGrup.add(bacakSag);

    const bArka = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.07, 0.04), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    bArka.position.set(0, 1.35, 0);
    askerGrup.add(bArka);

    const bCan = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.04, 0.05), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
    bCan.position.set(0, 1.35, 0.01);
    askerGrup.add(bCan);

    askerGrup.position.set(x, 0, z);
    scene.add(askerGrup);

    askerGrup.userData = { 
        taraf: taraf, hiz: hız, hasar: hasar, can: maxCan, maxCan: maxCan, menzil: menzil,
        tip: kartAdi, gecitKopru: false, kopruHedef: (x < 0) ? kopruler[0] : kopruler[1], 
        barCan: bCan, canli: true, bSol: bacakSol, bSag: bacakSag, adim: Math.random() * 10,
        sonAtesZamani: 0
    };
    askerler.push(askerGrup);
}

// YENİ KAMERA AÇISINA GÖRE GÜNCELLENMİŞ DOKUNMA MANTIĞI
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('pointerdown', (e) => {
    if (!oyunBasladi || !seciliKart) return;
    if (e.clientY > window.innerHeight - 130) return; 

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(ground);
    if (intersects.length > 0) {
        const nokta = intersects[0].point;
        
        let izinVerildi = false;
        if (nokta.z > 0.2 && nokta.z < 8.5 && Math.abs(nokta.x) < 6.5) {
            izinVerildi = true; 
        } else if (botSolKuleYikildi && nokta.x < 0 && nokta.z > -5.0 && nokta.z <= 0.2 && nokta.x > -6.5) {
            izinVerildi = true; 
        } else if (botSagKuleYikildi && nokta.x > 0 && nokta.z > -5.0 && nokta.z <= 0.2 && nokta.x < 6.5) {
            izinVerildi = true; 
        }

        if (izinVerildi && oyuncuIksir >= seciliKartMaliyet) {
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
        const botX = (Math.random() * 6) - 3;
        askerIndir(botX, -5.5, kartlar[r], 'bot');
        botIksir -= maliyetler[r];
    }
}, 3500);

// --- ANA MOTOR DÖNGÜSÜ ---
function animate() {
    requestAnimationFrame(animate);
    iksirDoldur();
    
    if (oyunBasladi) {
        kuleler.forEach(k => {
            if (k.userData.canli) {
                let oran = k.userData.can / k.userData.maxCan;
                k.userData.barCan.scale.x = Math.max(0.001, oran);
            }
        });

        for (let i = askerler.length - 1; i >= 0; i--) {
            if (!askerler[i].userData.canli) {
                scene.remove(askerler[i]);
                askerler.splice(i, 1);
            }
        }

        for (let i = oklar.length - 1; i >= 0; i--) {
            let ok = oklar[i];
            if (!ok.hedef.userData.canli) { scene.remove(ok.mesh); oklar.splice(i, 1); continue; }
            
            let hPos = new THREE.Vector3();
            ok.hedef.getWorldPosition(hPos);
            if(ok.hedef.userData.maxCan > 500) hPos.y = 0.6;

            let yon = new THREE.Vector3().subVectors(hPos, ok.mesh.position).normalize();
            ok.mesh.position.addScaledVector(yon, ok.hiz);

            if (ok.mesh.position.distanceTo(hPos) < 0.3) {
                ok.hedef.userData.can -= ok.hasar;
                
                if(ok.hedef.userData.maxCan < 500 && ok.hedef.userData.barCan) {
                    let aOran = ok.hedef.userData.can / ok.hedef.userData.maxCan;
                    ok.hedef.userData.barCan.scale.x = Math.max(0.001, aOran);
                }

                if(ok.hedef.userData.tip === 'ana' && !ok.hedef.userData.kralUyanik) {
                    ok.hedef.userData.kralUyanik = true;
                }

                if (ok.hedef.userData.can <= 0) {
                    ok.hedef.userData.canli = false;
                    if (ok.hedef.userData.tip === 'ana') { 
                        macBitir(ok.hedef.userData.taraf === 'bot' ? 'kazandin' : 'kaybettin'); 
                    } else {
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
                    okFirlat(kule.position, hedon, kule.userData.hasar);
                    kule.userData.sonAtesZamani = simdi;
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
                        if (d < enYakinMesafe && d < 4.5) { enYakinMesafe = d; hedon = rakip; }
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
            }

            if (hedon) {
                if (enYakinMesafe <= asker.userData.menzil) {
                    asker.userData.bSol.rotation.x = 0; asker.userData.bSag.rotation.x = 0;
                    
                    let tPos = new THREE.Vector3(hedon.position.x, asker.position.y, hedon.position.z);
                    asker.lookAt(tPos);

                    if (asker.userData.tip === 'Okcu') {
                        let simdi = Date.now();
                        if (simdi - asker.userData.sonAtesZamani > 1200) {
                            okFirlat(asker.position, hedon, asker.userData.hasar);
                            asker.userData.sonAtesZamani = simdi;
                        }
                    } else {
                        hedon.userData.can -= asker.userData.hasar / 45;
                        
                        if(hedon.userData.maxCan < 500 && hedon.userData.barCan) {
                            let hOran = hedon.userData.can / hedon.userData.maxCan;
                            hedon.userData.barCan.scale.x = Math.max(0.001, hOran);
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
                    if (Math.abs(asker.position.z - hZ) < 0.3) asker.userData.gecitKopru = true;
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
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
