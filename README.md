# DragonBoundRE

DragonboundRE is an educational project to learn more about Reverse Engineering. The main goal of this project is to create a client with the latest technologies. Also, to add missing improvements to the original game, such as animations, mobiles, game modes, etc.

> **Why dragonbound?**
> Because Dragonbound is a childhood game based on Gunbound, fun and “old”. Another reason is that it has a long way to go to be like Gunbound.

## Comunity

Be part of the discord community [Discord](https://discord.gg/aNDdAzgt)

## How to run the web server?

Run the following command: `npm run dev:web` if you are running in development mode.
To run in productive mode, you must run the following: `npm run start:web`

![image](https://github.com/user-attachments/assets/d1c2735d-fd8f-42d5-9ba1-07370aefbba1)

## Docker Compose

## Configuration

Add the .env file based on .env.example
Replace

```
DB_HOST=localhost
```

To

```
DB_HOST=mysql
```

### Start

docker compose up -d

### Stop

docker compose down

### Delete Volumes

docker compose down -v
