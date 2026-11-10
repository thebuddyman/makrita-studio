---
episode: 001-matcha
title: "matcha kini boleh, matcha depan gimana?"
status: draft            # Steve sets this to approved at gate 1
copy_source: DRAFT — rebuilt from the PRD. Replace lines and on-screen copy with the
  exact text from the HTML prototype (drop it in prototype/) before approving.
---

# 001 · Matcha

Target length ±38 s · 9:16 · Mak voice: see `pipeline/config/models.yaml → voice.mak`

## Numbers (source of truth — every on-screen figure must match)

| Key | Value | Working |
|---|---|---|
| price_per_cup | Rp45 rb | one café matcha latte |
| cups_per_month | 20 gelas | |
| monthly | Rp900 rb | 20 × Rp45 rb |
| yearly | Rp10,8 jt | Rp900 rb × 12 |
| cups_after | 8 gelas | café cups kept per month |
| yearly_after | Rp4,32 jt | 8 × Rp45 rb × 12 |
| saving_yearly | Rp6,48 jt | Rp10,8 jt − Rp4,32 jt (jar cost not counted → fine print) |

## Scenes

### 0 · Hook (2.9 s) — infographic, no Mak on screen
- VO (Mak, off-screen): "Segelas matcha empat puluh lima ribu. Setahun? Sepuluh koma delapan juta."
- On screen: wobbling matcha cup, counter climbing to **Rp10,8 jt**.

### 0b · Kenalin, Mak Rita (3.6 s) — Mak: waves, smiles
- VO: "Kenalin, Mak Rita. Mak yang bantu kamu hidup frugal."
- On screen: name tag "Mak Rita", line reveal "Mak yang bantu kamu hidup frugal".

### 1 · Mak marah (3.8 s) — Mak: slams table, points (hero beat)
- VO: "NAK. Duduk. Mak mau ngomong."
- On screen: red glow, anger mark.

### 2 · 20 gelas (6.0 s) — Mak: squints at phone
- VO: "Dua puluh gelas matcha sebulan? Ini rekening atau kebun teh?"
- On screen: grid of 20 cups, counter to **Rp900 rb** ("20 gelas matcha × Rp45 rb, sebulan").

### 3 · Setahun (5.2 s) — Mak: sighs, shakes head
- VO: "Setahun sepuluh koma delapan juta, Nak. Itu tiket ke Jepang. Ke kebun tehnya langsung."
- On screen: counter to **Rp10,8 jt**, Japan ticket.

### 4 · Pun (4.8 s) — Mak: arms crossed
- VO: "Matcha kini boleh. Tapi matcha depan gimana? Mak serius."
- On screen: "masa depan" with **masa** struck through → **matcha**.

### 5 · Solusi (7.0 s) — Mak: explains, counting on fingers
- VO: "Gampang. Ke kafe delapan kali aja sebulan, sisanya bikin sendiri. Hemat enam koma empat delapan juta setahun."
- On screen: 8 cups vs a jar of matcha powder, **Rp6,48 jt**, frugal tip "Beli bubuk matcha, seduh di rumah".

### 6 · Punchline (5.2 s) — Mak: sips matcha, winks (hero beat)
- VO: "Matcha kini boleh, matcha depan juga harus."
- On screen: tagline, comment prompt "Sebulan kamu berapa gelas? Jujur ke Mak di komen.",
  fine print "Hitungan Rp45 rb/gelas. Harga bubuk matcha belum dihitung."
- No "Mulai, Mak" button.
