
interface HandleSocketMessage {
    socket: WebSocket,
    data: string
}


async function HandleSocketMessage({socket, data}: HandleSocketMessage) {

    const parshedData = await JSON.parse(data);

    
}