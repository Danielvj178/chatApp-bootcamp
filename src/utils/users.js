const users = [];

const addUser = ({ id, username, room }) => {
    //Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //Valdiate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    //Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user);
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        //Elimina del arreglo y envia lo que queda en el arreglo
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const user = users.find((user) => user.id === id)

    return user
}

const getUserInRoom = (roomName) => {
    roomName = roomName.trim().toLowerCase()

    return users.filter((user) => user.room === roomName)
}

addUser({
    id: 22,
    username: 'Danieeeel   ',
    room: '       Medellin prima'
})

const res = addUser({
    id: 33,
    username: 'Danielit   ',
    room: '       Medellin prima'
})

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}