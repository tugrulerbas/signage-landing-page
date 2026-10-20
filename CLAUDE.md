# Mlink Signage — One-pager Landing Page

Mlink Signage (eski çalışma adı: bonmlink), Mimeda'ya ait bir **digital signage** (dijital ekran yönetimi) ürünüdür.
Bu repo, ürünün tek sayfalık tanıtım (landing) sitesidir. Site dili: **İngilizce** (kod yorumları Türkçe olabilir).

## Yapı

```
index.html            # Tek sayfa; tüm bölümler burada (section id'leri nav ile eşleşir)
assets/css/tokens.css # Renk, tipografi, spacing token'ları — renkleri SADECE buradan kullan
assets/css/style.css  # Bileşen ve bölüm stilleri
assets/js/main.js     # Mağaza sahnesi (sabah/öğle/akşam), yayın örneği, form
assets/img/           # Görseller (mağaza sahnesi index.html içinde SVG olarak çiziliyor)
PRODUCT.md            # Ürün gerçekleri (impeccable formatında)
.claude/skills/impeccable/  # Tasarım skill'i + AI-görünüm dedektörü
docs/research.md      # Landing page araştırması ve kararlar
serve.mjs             # Bağımlılıksız Node önizleme sunucusu (PORT env veya argüman)
.claude/launch.json   # Önizleme sunucusu: `landing` → node serve.mjs
```

Build adımı yok: saf HTML/CSS/JS. Harici bağımlılık sadece Google Fonts (Schibsted Grotesk).

## Çalıştırma

```bash
node serve.mjs 5173
```
(Not: `python3 -m http.server` macOS'ta Desktop izni yüzünden bu klasörde açılmıyor; Node sunucusu kullanılıyor.)
Claude Code içinde: `preview_start` ile `landing` konfigürasyonu.

## Marka / Renk paleti (mimeda.com.tr'den alındı)

| Token            | Değer     | Kaynak / kullanım                         |
|------------------|-----------|-------------------------------------------|
| `--mm-blue`      | `#009FE3` | Mimeda ana mavi; üstünde koyu metin        |
| `--mm-blue-deep` | `#0077B6` | Mavinin koyu tonu (hover, gradient)       |
| `--mm-orange`    | `#FF6600` | Mimeda turuncu (buton/zemin); üstünde koyu metin |
| `--mm-orange-text` | `#C94C00` | Beyaz zemin üstünde turuncu yazı         |
| `--mm-orange-2`  | `#F06C22` | Footer/ikincil turuncu                    |
| `--mm-ink`       | `#414042` | Logo koyu grisi, başlıklar                |
| `--mm-ink-2`     | `#333333` | Gövde metni                               |
| `--mm-ink-soft`  | `#5C5B5C` | İkincil metin                             |
| `--mm-paper`     | `#F4F4F4` | Açık zemin                                |

Font: **Schibsted Grotesk** (Outfit marka zorunluluğu değil; impeccable aşırı kullanılan fontlardan sayıyor).
Kontrast: turuncu ve mavi zeminlerde beyaz değil koyu (`--mm-ink-night`) metin kullan; beyaz üstünde 2.9:1 kalıyor.

## Kurallar

- Yeni renk eklemeden önce `tokens.css`'e token olarak ekle; bileşenlerde hex kullanma.
- Bölüm ekle/çıkar → `index.html` içindeki nav linklerini de güncelle.
- Animasyonlar `prefers-reduced-motion`'a saygı göstermeli.
- Mobil öncelikli; 360px genişlikte yatay scroll olmamalı.
- Uydurma rakam, müşteri adı, referans yok. Mağaza sahnesindeki fiyatlar "örnek mağaza" olarak etiketli.
- Metin dili sade ve somut: slogan kalıbı, retorik soru, "akıllı / sınırsız / kendiliğinden / anında",
  gereksiz İngilizce (playlist, feed, proof-of-play), uzun tire ve başlık üstü etiket kullanma.
- Sahte arayüz süsü ekleme (canlı sayaç balonu, eşleştirme kodu, dosya adları, sahte rapor paneli).
- Değişiklikten sonra: `.claude/skills/impeccable/scripts/impeccable detect --json http://localhost:<port>/`
  (işlenmiş sayfa üzerinde; dosya üzerinde çalıştırınca clamp() yüzünden yanlış "cramped-padding" verebiliyor).
- Sayfada form ve demo butonu yok. Tüm CTA'lar "Login" → https://staging.bonmlink.com
- Tasarım dili referansı: mixpanel.com/home (açık zemin, pill butonlar, sağda renkli panel + ürün görseli, 4 sütun "neden", ortalanmış kapanış).
- Hero sade tutulmalı: metin temiz beyaz zeminde, mağaza sahnesi hemen altında ve üst kenarı beyaza eriyor (`.hero__stage::before`). Metnin arkasına şerit/desen koyma.
- Tur bölümü (`.tour`): Mixpanel tarzı sticky; soldaki menü tıklanınca ilgili konuma kaydırır, her kaydırma hareketi (tekerlek, dokunma, klavye) tam bir adım ilerletir; yumuşak geçiş JS tween ile, trackpad ataleti kilitle yutulur (main.js). 900px altında üst üste dizilir.
- Akış bölümü (`.flow`): Advertisers ↔ Mlink Signage ↔ Screen owners. Hatlar JS ile düğüm konumlarından hesaplanır (ResizeObserver), paketler CSS `offset-path` + WAAPI ile hareket eder; 5 adım otomatik döner, adımlar tıklanabilir.
- Animasyonlar: başlık kelime kelime girer, bölümler `data-reveal` + `.in` ile scroll'da açılır (main.js IntersectionObserver).
- Logo: Mimeda logosu mimeda.com.tr CDN'inden (`mimedalayout/mimeda-logo.png`) yükleniyor; footer'da CSS filter ile beyaza çevriliyor. Ürün adı her yerde "Mlink Signage"; logoda "Mlink" kısmı mimeda.com.tr`deki Mlink logosu (`mimedalayout/MlinkLogo1.png`), yanında "Signage" yazısı.
- SSS metinleri kullanıcı tarafından ileride güncellenecek; dokunma.
