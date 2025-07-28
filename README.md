[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#table-of-contents)
<p align="center">
    <img src="/storage/crydr.jpg" width="100%" style="margin-left: auto;margin-right: auto;display: block;">
</p>

<h1 align="center">Cerydra Bot</h1>

<p align="center">
    <a href="#"><img src="https://img.shields.io/badge/Whatshapp BOT-green?colorA=%23ff0000&colorB=%23017e40&style=for-the-badge"></a>
</p>

<p align="center">
<a href="https://github.com/alisaadev"><img title="Author" src="https://img.shields.io/badge/AUTHOR-alisaadev-green.svg?style=for-the-badge&logo=github"></a>


## Konfigurasi ⚙️
Edit nomor owner & nama bot di [`config.js`](https://github.com/alisaadev/cerydra_bot/blob/main/storage/config.js)

## Untuk user termux/ubuntu/ssh

```bash
apt update && apt upgrade -y
apt install nodejs imagemagick ffmpeg -y

git clone https://github.com/alisaadev/cerydra_bot
cd cerydra_bot
npm install
```

## Run ⏳

```bash
npm start
```

## Contoh membuat plugin
```js
export default {
    //kosongkan saja jika ingin mematikan
    command: [""],
    name: "",
    tags: "",

    //ubah ke true jika ingin menyalakan
    admin: false,
    botAdmin: false,
    group: false,
    owner: false,
    private: false,

    run: async(m, { conn, text, args, command }) => {
        //your script code
    }
}
```

## 📮 S&K
1. Tidak untuk dijual
2. Jangan lupa beri bintang pada repo ini
3. Jika Anda memiliki masalah, hubungi saya [`WhatsApp`](https://wa.me/6287760363490)