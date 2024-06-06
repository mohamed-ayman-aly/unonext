let messagesContainer = document.getElementById('messages')
messagesContainer.scrollTop = messagesContainer.scrollHeight

const memberContainer = document.getElementById('members__container')
const memberButton = document.getElementById('members__button')

const chatContainer = document.getElementById('messages__container')
const chatButton = document.getElementById('chat__button')
let activeMemberContainer, activeChatContainer, divice = getDeviceType()
if (divice == 'phone') {
  memberContainer.style.display = 'none'
  chatContainer.style.display = 'none'
  document.getElementById('screan-btn').style.display = 'none'
} else {
  memberContainer.style.display = 'flex'
  chatContainer.style.display = 'flex'
  document.getElementById('screan-btn').style.display = 'block'
}
if (window.innerWidth >= 1200) {
  memberContainer.style.display = 'flex'
  chatContainer.style.display = 'flex'
  memberContainer.style.removeProperty("position")
  chatContainer.style.removeProperty("position")
  chatContainer.style.removeProperty("right")
}
if (window.innerWidth < 1200) {
  memberContainer.style.display = 'none'
  chatContainer.style.display = 'flex'
  memberContainer.style.position = 'absolute'
  chatContainer.style.removeProperty("position")
  chatContainer.style.removeProperty("right")
}
if (window.innerWidth < 980) {
  memberContainer.style.display = 'none'
  chatContainer.style.display = 'none'
  memberContainer.style.position = 'absolute'
  chatContainer.style.position = 'absolute'
  chatContainer.style.right = '0'
}
addEventListener("resize", () => {
  if (window.innerWidth >= 1200) {
    memberContainer.style.display = 'flex'
    chatContainer.style.display = 'flex'
    memberContainer.style.removeProperty("position")
    chatContainer.style.removeProperty("position")
    chatContainer.style.removeProperty("right")
  }
  if (window.innerWidth < 1200) {
    memberContainer.style.display = 'none'
    chatContainer.style.display = 'flex'
    memberContainer.style.position = 'absolute'
    chatContainer.style.removeProperty("position")
    chatContainer.style.removeProperty("right")
  }
  if (window.innerWidth < 980) {
    memberContainer.style.display = 'none'
    chatContainer.style.display = 'none'
    memberContainer.style.position = 'absolute'
    chatContainer.style.position = 'absolute'
    chatContainer.style.right = '0'
  }
});
memberButton.addEventListener('click', () => {
  if (memberContainer.style.display == 'flex') {
    memberContainer.style.display = 'none'
  } else {
    memberContainer.style.display = 'flex'
  }
})

chatButton.addEventListener('click', () => {
  if (chatContainer.style.display == 'flex') {
    chatContainer.style.display = 'none'
  } else {
    chatContainer.style.display = 'flex'
  }
})

let displayFrame = document.getElementById('stream__box')
let closedisplayFrame = document.getElementById('close__stream__box')
let videoFrames = document.getElementsByClassName('video__container')
let videosFrames = document.getElementById("streams__container")
let userIdIndisplayFrame = null

let expandvideoFrame = (e) => {
  let child = displayFrame.children[1]
  let videocontainer = e.target
  while (videocontainer.className.indexOf('video__container') == -1) {
    videocontainer = videocontainer.parentElement
  }
  if (child) {
    videosFrames.appendChild(child)
  }
  displayFrame.appendChild(videocontainer)
  userIdIndisplayFrame = videocontainer.id
  videosFrames.classList.add('min')
}
let fullscreenvideoFrame = (e) => {
  expandvideoFrame(e)
  if (e.target.requestFullscreen) {
    e.target.requestFullscreen();
  } else if (e.target.webkitRequestFullscreen) {
    e.target.webkitRequestFullscreen();
  } else if (e.target.msRequestFullscreen) {
    e.target.msRequestFullscreen();
  }
}
for (var element in videoFrames) {
  try {
    videoFrames[element].addEventListener('click', expandvideoFrame)
    videoFrames[element].addEventListener("dblclick", fullscreenvideoFrame);
  } catch { }
}
let closedisplayFramefun = () => {
  userIdIndisplayFrame = null
  displayFrame.style.removeProperty('display')
  videosFrames.classList.remove('min')
  videosFrames.appendChild(displayFrame.children[1])
}
closedisplayFrame.addEventListener('click', closedisplayFramefun)
displayFrame.addEventListener('click', closedisplayFramefun)
function GUID() {
  let guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.floor(Math.random() * 16)
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
  return guid
}
function getDeviceType() {
  const userAgent = navigator.userAgent.toLowerCase()
  const isMobile = /iphone|ipad|ipod|android|blackberry|windows phone/.test(userAgent)
  const isTablet = /ipad/.test(userAgent)
  const isDesktop = !isMobile && !isTablet

  if (isMobile || isTablet) {
    return 'phone'
  } else {
    return 'desktop'
  }
}