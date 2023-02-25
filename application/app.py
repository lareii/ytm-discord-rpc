import asyncio
import websockets
import functools
import pypresence
import json

connections = []

async def update_presence(rpc, msg):
    await rpc.update(
        state=msg
    )

async def handler(ws, rpc):
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
            await update_presence(rpc, json.loads(msg)['data']['title'])

    except websockets.exceptions.ConnectionClosed:
        for conn in connections:
            await conn.close()

        connections.clear()
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

asyncio.run(run())