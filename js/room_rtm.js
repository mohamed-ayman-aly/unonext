let MembersWrapper = document.getElementById("member__list")
let membercounter = document.getElementById('members__count')
let messageWrapper = document.getElementById("messages")
let handleMemberJoined = async (MemberId) => {
    await addMemberToDom(MemberId)
    membercounter.innerHTML = Number(membercounter.innerHTML) + 1
    let name = await getMemberName(MemberId)
    await addBotMessageToDom(`<strong class="message__author">${name}</strong> just entered the room!`)
}
let handleMemberLeft = async (MemberId) => {
    removeMemberFromDom(MemberId)
    membercounter.innerHTML = Number(membercounter.innerHTML) - 1
}
let getMemberName = async (MemberId) => {
    const member = await rtmClient.getUserAttributes(MemberId);
    return member['name'];
}
let getMemberdivice = async (MemberId) => {
    const member = await rtmClient.getUserAttributes(MemberId);
    return member['deviceType'];
}
let getMembermic = async (MemberId) => {
    const member = await rtmClient.getUserAttributes(MemberId);
    return member['mic'];
}
let addMemberToDom = async (MemberId) => {
    let name  = await getMemberName(MemberId)
    let MemberItem = `<div class="member__wrapper" id="member__${MemberId}__wrapper">
                        <span class="green__icon"></span>
                        <p class="member_name">${name}</p>
                    </div>`;
    MembersWrapper.insertAdjacentHTML("beforeend", MemberItem)
}
let removeMemberFromDom = async (MemberId) => {
    let member = document.getElementById(`member__${MemberId}__wrapper`)
    let name = member.getElementsByClassName('member_name')[0].innerHTML
    await addBotMessageToDom(`<strong class="message__author">${name}</strong> has left the room`)
    member.remove();
}
let getMembers = async () => {
    let members = await channel.getMembers()
    membercounter.innerHTML = members.length
    for (let i = 0; i < members.length; i++) {
        addMemberToDom(members[i])
    }
}
let handlechannelMessage = async (Message, MemberId) => {
    let data = JSON.parse(Message.text)
    if (data.type === 'chat') {
        addMessageToDom(data.displayName, data.message)
    }
    if (data.type === 'user_left') {
        document.getElementById(`user-container-${data.uid}`).remove()
        if (userIdIndisplayFrame == `user-container-${UID}`) {
            displayFrame.style.removeProperty('display')
            videosFrames.classList.remove('min')
        }
    }
    debugger
    if (data.type === 'mic') {
        if(data.message=="mic"){
            document.getElementById(`user-audio-${data.uid}`).children[0].src="./images/icons/mic.svg"
        }else{
            document.getElementById(`user-audio-${data.uid}`).children[0].src="./images/icons/micmute.svg"
        }
    }
}
let sendMessage = async (e) => {
    e.preventDefault()
    let message = e.target.message.value
    channel.sendMessage({ text: JSON.stringify({ 'type': 'chat', 'message': message, 'displayName': displayName }) })
    addMessageToDom(displayName, message)
    e.target.reset()
}
let addMessageToDom = async (name, message) => {
    let newmessage = `<div class="message__wrapper">
                        <div class="message__body">
                            <strong class="message__author">${name}</strong>
                            <p class="message__text">${message}</p>
                        </div>
                    </div>`
    messageWrapper.insertAdjacentHTML('beforeend', newmessage)
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
let addBotMessageToDom = async (Botmessage) => {
    let newmessage = `<div class="message__wrapper">
                        <div class="message__body__bot">
                            <strong class="message__author__bot">🤖 Chat Bot</strong>
                            <p class="message__text__bot">${Botmessage}</p>
                        </div>
                    </div>`
    messageWrapper.insertAdjacentHTML('beforeend', newmessage)
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
document.getElementById('message__form').addEventListener('submit', sendMessage)
let leveingChannel = async () => {
    await channel.leave()
    await rtmClient.logout()
}
window.addEventListener('beforeunload', leveingChannel)

let leveingChannelphone = async (evt) => {
    if (evt.prevState === "CONNECTED" && evt.state === "DISCONNECTED") {
        await rtmClient.logout()
        await channel.leave();
    }
}