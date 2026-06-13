## Szerver Indítási Lépések a VPS-en

- Hozza létre a lenti három fájlt (Dockerfile, docker-compose.yml, nginx.conf) a projekt gyökérkönyvtárában.
- Töltse fel a teljes forráskódot a VPS szerverre (pl. Git-tel vagy SCP-vel).
- A projekt mappájában futtassa a következő parancsot az indításhoz kedvező háttér üzemmódban:

```sh
docker compose up --build -d
```
Terminál parancs: 

• A Docker image lefordul, és az alkalmazás elérhetővé válik a

```sh
http://<VPS_IP>:3000
```

címen!
