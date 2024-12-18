

export function JoinSpace({data, ws, spaces}: any) {
    
    if(spaces.has(data.spaceId)) {
                    
        const space = spaces.get(data.spaceId);
        
        space?.users.push({
            userDetails: {
                name: data.name,
                userId: data.userId,
            },
            ws
        });
        
        space?.users.map((user: any) => {
            
            if(user.ws != ws) {
                
                ws.send(JSON.stringify({
                    type: "USER_JOINED",
                    user: user.userDetails
                }))

            }

        })

        space?.users.map((user: any) => {

            if(user.ws != ws) {
                
                user.ws.send(JSON.stringify({
                    type: "USER_JOINED",
                    user: {
                        name: data.name,
                        userId: data.userId
                    }
                }))

            }
            
        })



    } else {

        spaces.set(data.spaceId, { 
            users: [
                {
                    userDetails: {
                        name: data.name,
                        userId: data.userId,
                    },
                    ws
                }
            ]
        })


    }

}

export function ChangePosition({data, spaces, ws}: any) {

    const space = spaces.get(data.spaceId);

    space?.users.map((user: any) => {

        if(user.ws == ws) return
        
        user.ws.send(JSON.stringify({
            type: "CHANGE_POSITION",
            user: {
                userId: data.userId
            },
            direction: data.direction,
            x: data.x,
            y: data.y

        }))
    })
}