const paramsString = window.location.search;
const searchParams = new URLSearchParams(paramsString);

const cardContainer = document.querySelector('#cardContainer');
const userContainer = document.querySelector('#userContainer');
const postsContainer = document.querySelector('#postsContainer');
const usernameText = document.querySelector('#username-text');
const userAvatar = document.querySelector('#avatar');
const followLink = document.querySelector('#follow-link');

const username = searchParams.get("username") || 'No username...';

let background = searchParams.has("bg") ? `#${searchParams.get("bg")}` : 'pink';
let showPosts = searchParams.has("showPosts") ? searchParams.get("showPosts") == 'true' : true;
let textColor = searchParams.has("textColor") ? `${searchParams.get("textColor")}` : 'white';
let hideReplies = searchParams.has("hideReplies") ? searchParams.get("hideReplies") == 'true' : false;
let hideMentions = searchParams.has("hideMentions") ? searchParams.get("hideMentions") == 'true' : false;

function addBadge(usernameSpan, badges) {
    badges.forEach((badge) => {
        const img = document.createElement('img');
        img.src = badge.iconUrl;
        img.title = badge.name;
        img.alt = badge.name;
        img.style.height = '16px';
        img.style.marginLeft = '2px';
        img.style.verticalAlign = 'middle';
        usernameSpan.appendChild(img);
    });
}

async function getUserInfo() {
    try {
        const response = await fetch(`https://pikidiary-api.vercel.app?username=${username}`);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const data = await response.json();
        displayCard(data);

    } catch (error) {
        console.error(error.message);
    }
}

function displayCard(data) {
    usernameText.textContent = data.username;
    usernameText.style.color = textColor;
    userAvatar.src = `https://corsproxy.io/?${data.pfp}`;

    followLink.href = `https://pikidiary.lol/@${data.username}`;

    let userBackground = (data.background?.trim() || '').startsWith("#") 
    ? data.background 
    : data.background ? `url(${data.background})` : background;
    
    if (searchParams.get("bg") == 'userBackground') userContainer.style.background = data.background ? userBackground : background;
    else if (searchParams.has("bg")) userContainer.style.background = background;
    else userContainer.style.background = data.banner ? `url(${data.banner})` : background;

    userContainer.style.backgroundRepeat = 'no-repeat';
    userContainer.style.backgroundSize = 'cover';
    userContainer.style.backgroundPosition = 'center';

    addBadge(usernameText, data.badges);
    displayPosts(data);
}

function displayPosts(data) {
    if (!showPosts) {
        cardContainer.style.background = 'none';
        return;
    }

    data.posts.forEach((post) => {
        if (hideReplies && post.isReply) return;
        if (hideMentions && post.content.trim().startsWith("@")) return;

        const postLink = document.createElement('a');
        postLink.href = post.url;
        postLink.target = '_blank';
        postLink.style.textDecoration = 'none';
        postLink.style.color = 'inherit';

        const postDiv = document.createElement('div');
        postDiv.classList.add('post');

        const avatar = document.createElement('img');
        avatar.src = userAvatar.src;
        avatar.alt = "pfp";
        avatar.className = "avatar-small";

        const postHeader = document.createElement('div');
        postHeader.className = "post-header";

        const authorEl = document.createElement('b');
        authorEl.textContent = post.author;

        const postContent = document.createElement('div');
        postContent.className = "post-content";
        postContent.style.display = 'flex';
        postContent.style.flexDirection = 'column';
        postContent.style.overflow = 'hidden';
        postContent.style.borderRadius = '2px';

        postContent.textContent = post.content;

        postHeader.appendChild(authorEl);
        postHeader.appendChild(postContent);

        postDiv.appendChild(avatar);
        postDiv.appendChild(postHeader);

        if (Array.isArray(post.media)) {
            if (post.media.length > 0) {
                const postImages = document.createElement('div');
                postImages.className = 'post-images';

                const postEmotes = document.createElement('div');
                postEmotes.className = "post-emotes";
                postEmotes.style.display = 'flex';

                post.media.forEach((media) => {
                    if (media.type == 'image') {
                        const img = document.createElement('img');
                        img.src = media.url;
                        img.className = "image";
                        img.style.maxWidth = '100%';
                        postContent.appendChild(img);
                    } else if (media.type == 'video') {
                        const video = document.createElement('video');
                        video.src = media.url;
                        video.controls = true;
                        video.style.maxWidth = '100%';
                        video.style.maxHeight = '300px';
                        postContent.appendChild(video);
                    }
                    else if (media.type == 'emote') {
                        const img = document.createElement('img');
                        img.src = `https://corsproxy.io/?https://pikidiary.lol${media.url}`;
                        img.style.maxWidth = '16px';
                        postEmotes.appendChild(img);
                    }
                });
                postContent.appendChild(postImages);
                postContent.appendChild(postEmotes);
            }
        }

        postLink.appendChild(postDiv);
        postsContainer.appendChild(postLink);
    });
}


getUserInfo();
