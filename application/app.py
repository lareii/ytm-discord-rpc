import asyncio
import websockets
import functools
import pypresence
import json
import pystray
import threading
from PIL import Image

connections = []

async def update_presence(rpc, msg):
    await rpc.update(
        large_image=msg['thumbnail'],
        large_text="ytm-discord-rpc",
        small_image='ytmusic',
        state="by " + msg['singer'].replace(' - Topic', ''),
        details=msg['title'],
        buttons=[
            {'label': 'Play on YouTube Music', 'url': msg['url']}
        ]
    )

async def handler(ws, *, rpc):
    print("New connection established.")
    connections.append(ws)

    if len(connections) > 1:  # checks if one or more connection
        for conn in connections[:len(connections) - 1]:
            await conn.close()
            connections.remove(conn)
            print("Old connections closed.")

        ws = connections[0]

    try:
        async for msg in ws:
            print(msg)
            await update_presence(rpc, json.loads(msg)['data'])

    except websockets.exceptions.ConnectionClosed:
        for conn in connections:
            await conn.close()

        connections.clear()
        await rpc.clear(  )
        print("Disconnected.")

async def run():
    rpc = pypresence.AioPresence(client_id="984883198959943790")
    await rpc.connect()
    
    async with websockets.serve(
        functools.partial(handler, rpc=rpc),
        "localhost", 
        5675
    ):
        await asyncio.Future()

p = pystray.Icon(
    'test',
    Image.open("ytmusic.png"),
    menu=pystray.Menu(
        pystray.MenuItem("Running on background", action=None, enabled=False),
        pystray.MenuItem("Exit", action=lambda: exit())
    )
)

t = threading.Thread(target=p.run).start()
asyncio.run(run())