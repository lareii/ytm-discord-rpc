import asyncio
import websockets
import os
import pypresence
import json
import pystray
import threading
from PIL import Image
from urllib.request import urlopen

connections = []

async def update_presence(rpc, msg):
    if msg['type'] == 'started_music':
        await rpc.update(
            large_image=msg['data']['thumbnail'],
            large_text=msg['data']['title'],
            small_image='ytmusic',
            small_text='YouTube Music',
            state="by " + msg['data']['singer'],
            details=msg['data']['title'],
            buttons=[
                {'label': 'Play on YouTube Music', 'url': msg['data']['url']},
                {'label': 'Try ytm-discord-rpc', 'url': 'https://github.com/lareithen/ytm-discord-rpc'}
            ],
        )
    else:
        await rpc.clear()

async def handler(ws):
    global rpc, p

    print("New connection established.")
    connections.append(ws)
    p.notify(message='Connected to extension.', title='ytm-discord-rpc')

    if len(connections) > 1:  # checks if one or more connection
        for conn in connections[:len(connections) - 1]:
            await conn.close()
            connections.remove(conn)
            print("Old connections closed.")

        ws = connections[0]

    try:
        async for msg in ws:
            print(msg)
            await update_presence(rpc, json.loads(msg))

    except websockets.exceptions.ConnectionClosed:
        for conn in connections:
            await conn.close()

        connections.clear()
        await rpc.clear()
        p.notify(message='Disconnected from extension.', title='ytm-discord-rpc')
        print("Disconnected.")

async def run():
    global rpc

    await rpc.connect()
    
    async with websockets.serve(
        handler,
        "localhost", 
        5675
    ):
        await asyncio.Future()

rpc = pypresence.AioPresence(client_id="984883198959943790") # do not change this

icon = "https://raw.githubusercontent.com/lareithen/ytm-discord-rpc/master/assets/ytmusic.png"

p = pystray.Icon(
    "ytm-discord-rpc",
    Image.open(urlopen(icon)),
    menu=pystray.Menu(
        pystray.MenuItem("Running on background", action=None, enabled=False),
        pystray.MenuItem("Exit", action=lambda: os._exit(1))
    )
)

t = threading.Thread(target=p.run).start()
asyncio.run(run())
