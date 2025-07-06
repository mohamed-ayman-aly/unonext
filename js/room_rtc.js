const APP_ID = "3a0d297529e1449384e7ebf506d756b6"

let UID = sessionStorage.getItem('uid')
if (!UID) {
    UID = GUID()
    sessionStorage.setItem('uid', UID)
}
let token = null
let client

let rtmClient
let channel

const querystring = window.location.search
const urlParams = new URLSearchParams(querystring)
let roomID = urlParams.get('room')

if (!roomID) {
    window.location = `index.html`
}

let displayName = localStorage.getItem("displayName")
if (!displayName) {
    window.location = `index.html?room=${roomID}`
}

let localTracks = []
let remoteUsers = {}
let localScreanTracks
let sharingScrean = false
const USER_ATTRIBUTES = { name: displayName, deviceType: divice, mic: "mute" };
let joinRoomInit = async () => {
    setBtnsDisabled(true);
    rtmClient = await AgoraRTM.createInstance(APP_ID)
    await rtmClient.login({ uid: UID, token })
    await rtmClient.addOrUpdateLocalUserAttributes(USER_ATTRIBUTES)
    channel = await rtmClient.createChannel(roomID)
    await channel.join()
    getMembers()
    channel.on('MemberJoined', handleMemberJoined)
    channel.on('MemberLeft', handleMemberLeft)
    channel.on('ChannelMessage', handlechannelMessage)
    addBotMessageToDom(`Welcome to the room <strong class="message__author">${displayName}</strong>`)
    client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
    await client.join(APP_ID, roomID, token, UID)
    client.on('user-published', handleUserPublished)
    client.on('user-left', handleUserleaving)
    setBtnsDisabled(false);
}
let setBtnsDisabled = (disabled) => {
    document.getElementById('join-btn').disabled = disabled;
    document.getElementById('leave-btn').disabled = disabled;
    document.getElementById('screan-btn').disabled = disabled;
    document.getElementById('mic-btn').disabled = disabled;
    document.getElementById('cam-btn').disabled = disabled;
}
let joinstream = async (e) => {
    setBtnsDisabled(true);
    document.getElementById('join-btn').style.display = 'none'

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks({}, {
        encoderConfig: {
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 }
        }
    })
    let player;
    if (divice == 'phone') {
        player = `<div class="video__container phone" id="user-container-${UID}">
                        <div class="video-player" id="user-${UID}"></div>
                        <div class="audio-player" id="user-audio-${UID}"><img src="./images/icons/mic.svg" alt="Site Logo"></div>
                    </div>`
    } else {
        player = `<div class="video__container" id="user-container-${UID}">
                        <div class="video-player" id="user-${UID}"></div>
                        <div class="audio-player" id="user-audio-${UID}"><img src="./images/icons/mic.svg" alt="Site Logo"></div>
                    </div>`
    }
    USER_ATTRIBUTES.mic = "mic"
    await rtmClient.addOrUpdateLocalUserAttributes(USER_ATTRIBUTES)
    videosFrames.insertAdjacentHTML("beforeend", player)
    var name = await getMemberName(UID);
    document.getElementById(`user-audio-${UID}`).innerHTML += name;
    document.getElementById(`user-container-${UID}`).addEventListener('click', expandvideoFrame)
    document.getElementById(`user-container-${UID}`).addEventListener("dblclick", fullscreenvideoFrame)
    await client.publish([localTracks[0]])
    document.getElementById('streamactions').style.display = 'flex'
    setBtnsDisabled(false);
}
var handlingUserPublished = [];
let handleUserPublished = async (user, mediaType) => {
    if (handlingUserPublished.indexOf(user.uid) != -1) {
        setTimeout(() => {
            handleUserPublished(user, mediaType)
        }, 1);
        return
    }
    var index = handlingUserPublished.length;
    handlingUserPublished[handlingUserPublished.length] = user.uid;
    remoteUsers[user.uid] = user

    await client.subscribe(user, mediaType)

    let player = document.getElementById(`user-container-${user.uid}`)
    if (player === null) {
        let remoteUserdivice = await getMemberdivice(user.uid)
        let remoteUsermic = await getMembermic(user.uid);
        
        var img = `<img src="./images/icons/mic.svg">`
        if (remoteUsermic == "mute") {
            img = `<img src="./images/icons/micmute.svg">`
        }

        if (remoteUserdivice == 'phone') {
            player = `<div class="video__container phone remoteUser" id="user-container-${user.uid}">
                            <div class="video-player" id="user-${user.uid}"></div>
                            <div class="audio-player" id="user-audio-${user.uid}">${img}</div>
                        </div>`
        } else {
            player = `<div class="video__container remoteUser" id="user-container-${user.uid}">
                            <div class="video-player" id="user-${user.uid}"></div>
                            <div class="audio-player" id="user-audio-${user.uid}">${img}</div>
                        </div>`
        }
        videosFrames.insertAdjacentHTML("beforeend", player)
        var name = await getMemberName(user.uid);
        document.getElementById(`user-audio-${user.uid}`).innerHTML += name;
        document.getElementById(`user-container-${user.uid}`).addEventListener('click', expandvideoFrame)
        document.getElementById(`user-container-${user.uid}`).addEventListener("dblclick", fullscreenvideoFrame);
    }
    if (mediaType === 'video') {
        await user.videoTrack.play(`user-${user.uid}`)
    }

    if (mediaType === 'audio') {
        user.audioTrack.play()
    }
    
    handlingUserPublished.splice(index, 1);
}

let handleUserleaving = async (user) => {
    delete remoteUsers[user.uid]
    let useritem = document.getElementById(`user-container-${user.uid}`)
    if (useritem) {
        useritem.remove()
    }
    if (userIdIndisplayFrame === `user-container-${user.uid}`) {
        displayFrame.style.removeProperty('display')
        videosFrames.classList.remove('min')
    }
}
let amIpublishcam = false
let togglecamera = async (e) => {
    setBtnsDisabled(true);
    let btn = document.getElementById('cam-btn')
    if (!amIpublishcam) {
        await client.publish([localTracks[1]])
        amIpublishcam = true
        let player = document.getElementById(`user-container-${UID}`)
        if (player === null) {
            if (divice == 'phone') {
                player = `<div class="video__container phone" id="user-container-${UID}">
                                <div class="video-player" id="user-${UID}"></div>
                                <div class="audio-player" id="user-audio-${UID}"><img src="./images/icons/mic.svg" alt="Site Logo"></div>
                            </div>`
            } else {
                player = `<div class="video__container" id="user-container-${UID}">
                                <div class="video-player" id="user-${UID}"></div>
                                <div class="audio-player" id="user-audio-${UID}"><img src="./images/icons/mic.svg" alt="Site Logo"></div>
                            </div>`
            }
            videosFrames.insertAdjacentHTML("beforeend", player)
            var name = await getMemberName(UID);
            document.getElementById(`user-audio-${UID}`).innerHTML += name;
            document.getElementById(`user-container-${UID}`).addEventListener('click', expandvideoFrame)
            document.getElementById(`user-container-${UID}`).addEventListener("dblclick", fullscreenvideoFrame);
        }
        await localTracks[1].play(`user-${UID}`)
        btn.classList.add('active')
        setBtnsDisabled(false);
        return
    }
    if (localTracks[1].muted) {
        await localTracks[1].setMuted(false)
        btn.classList.add('active')
    } else {
        await localTracks[1].setMuted(true)
        btn.classList.remove('active')
    }
    setBtnsDisabled(false);
}
let toggleMic = async (e) => {
    setBtnsDisabled(true);
    let btn = document.getElementById('mic-btn')
    if (localTracks[0].muted) {
        await localTracks[0].setMuted(false)
        btn.classList.add('active')
        document.getElementById(`user-audio-${UID}`).children[0].src = "./images/icons/mic.svg"
        channel.sendMessage({ text: JSON.stringify({ 'type': 'mic', 'message': "mic", 'uid': UID }) })
        USER_ATTRIBUTES.mic = "mic"
        await rtmClient.addOrUpdateLocalUserAttributes(USER_ATTRIBUTES)
    } else {
        await localTracks[0].setMuted(true)
        btn.classList.remove('active')
        document.getElementById(`user-audio-${UID}`).children[0].src = "./images/icons/micmute.svg"
        channel.sendMessage({ text: JSON.stringify({ 'type': 'mic', 'message': "micmute", 'uid': UID }) })
        USER_ATTRIBUTES.mic = "mute"
        await rtmClient.addOrUpdateLocalUserAttributes(USER_ATTRIBUTES)
    }
    setBtnsDisabled(false);
}
let toggleScrean = async (e) => {
    setBtnsDisabled(true);
    let Screanbtn = document.getElementById('screan-btn')
    let cambtn = document.getElementById('cam-btn')
    if (!sharingScrean) {
        try {
            localScreanTracks = await AgoraRTC.createScreenVideoTrack()
            sharingScrean = true
            Screanbtn.classList.add('active')
            cambtn.classList.remove('active')
            cambtn.style.display = 'none'
            document.getElementById(`user-container-${UID}`).remove()
            displayFrame.style.display = 'block'
            let player;
            let remoteUsermic = USER_ATTRIBUTES.mic;
            var img = `<img src="./images/icons/mic.svg">`
            if (remoteUsermic == "mute") {
                img = `<img src="./images/icons/micmute.svg">`
            }
            if (divice == 'phone') {
                player = `<div class="video__container phone" id="user-container-${UID}">
                                <div class="video-player" id="user-${UID}"></div>
                                <div class="audio-player" id="user-audio-${UID}">${img}</div>
                            </div>`
            } else {
                player = `<div class="video__container" id="user-container-${UID}">
                                <div class="video-player" id="user-${UID}"></div>
                                <div class="audio-player" id="user-audio-${UID}">${img}</div>
                            </div>`
            }
            displayFrame.insertAdjacentHTML('beforeend', player)
            var name = await getMemberName(UID);
            document.getElementById(`user-audio-${UID}`).innerHTML += name;
            document.getElementById(`user-container-${UID}`).addEventListener('click', expandvideoFrame)
            document.getElementById(`user-container-${UID}`).addEventListener("dblclick", fullscreenvideoFrame);
            userIdIndisplayFrame = `user-container-${UID}`
            await localScreanTracks.play(`user-${UID}`)
            await client.unpublish([localTracks[1]])
            await client.publish([localScreanTracks])
            videosFrames.classList.add('min')
        } catch { }
    } else {
        sharingScrean = false
        cambtn.style.display = 'block'
        Screanbtn.classList.remove('active')
        videosFrames.classList.remove('min')
        displayFrame.style.removeProperty('display')
        document.getElementById(`user-container-${UID}`).remove()
        await client.unpublish([localScreanTracks])
        let player;
        let remoteUsermic = USER_ATTRIBUTES.mic;
        var img = `<img src="./images/icons/mic.svg">`
        if (remoteUsermic == "mute") {
            img = `<img src="./images/icons/micmute.svg">`
        }
        if (divice == 'phone') {
            player = `<div class="video__container phone" id="user-container-${UID}">
                            <div class="video-player" id="user-${UID}"></div>
                            <div class="audio-player" id="user-audio-${UID}">${img}</div>
                        </div>`
        } else {
            player = `<div class="video__container" id="user-container-${UID}">
                            <div class="video-player" id="user-${UID}"></div>
                            <div class="audio-player" id="user-audio-${UID}">${img}</div>
                        </div>`
        }
        videosFrames.insertAdjacentHTML("beforeend", player)
        var name = await getMemberName(UID);
        document.getElementById(`user-audio-${UID}`).innerHTML += name;
        document.getElementById(`user-container-${UID}`).addEventListener('click', expandvideoFrame)
        document.getElementById(`user-container-${UID}`).addEventListener("dblclick", fullscreenvideoFrame);
    }
    setBtnsDisabled(false);
}
let leaveStream = async (e) => {
    setBtnsDisabled(true);
    document.getElementById('join-btn').style.display = 'block'
    document.getElementById('streamactions').style.display = 'none'
    amIpublishcam = false;
    if (document.getElementById('cam-btn').className.indexOf('active') != -1) {
        document.getElementById('cam-btn').classList.remove('active')
    }
    if (document.getElementById('mic-btn').className.indexOf('active') == -1) {
        document.getElementById('mic-btn').classList.add('active')
    }
    if (sharingScrean) {
        toggleScrean()
    }
    for (let i = 0; i < localTracks.length; i++) {
        localTracks[i].stop()
        localTracks[i].close()
        await client.unpublish([localTracks[i]])
    }
    document.getElementById(`user-container-${UID}`).remove()
    if (userIdIndisplayFrame == `user-container-${UID}`) {
        displayFrame.style.removeProperty('display')
        videosFrames.classList.remove('min')
    }
    channel.sendMessage({ text: JSON.stringify({ 'type': 'user_left', 'uid': UID }) })
    setBtnsDisabled(false);
}
document.getElementById('cam-btn').addEventListener('click', togglecamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
document.getElementById('screan-btn').addEventListener('click', toggleScrean)
document.getElementById('join-btn').addEventListener('click', joinstream)
document.getElementById('leave-btn').addEventListener('click', leaveStream)
joinRoomInit()
