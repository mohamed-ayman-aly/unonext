let form = document.getElementById('lobby__form')

let displayName = localStorage.getItem("displayName")
if (displayName) {
    form.name.value = displayName;
}

const querystring = window.location.search
const urlParams = new URLSearchParams(querystring)
let roomID = urlParams.get('room')

if (roomID&&roomID!='null') {
    form.room.value=roomID;
    form.room.disabled='disabled'
}

function GUID() {
    let guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.floor(Math.random() * 16)
        const v = c == 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
    return guid
}

form.addEventListener("submit", (e) => {
    e.preventDefault()

    localStorage.setItem("displayName", e.target.name.value)
    let room = e.target.room.value
    if (!room) {
        room = GUID()
    }
    window.location = `room.html?room=${room}`
})