const paramsString = window.location.search;
const searchParams = new URLSearchParams(paramsString);

if (!paramsString) window.location.href = 'landing.html';

const cardContainer = document.querySelector('#cardContainer');
const userContainer = document.querySelector('#userContainer');
const postsContainer = document.querySelector('#postsContainer');
const usernameText = document.querySelector('#username-text');
const userAvatar = document.querySelector('#avatar');
const followLink = document.querySelector('#follow-link');

const username = searchParams.get("username") || 'No username...';

let background = searchParams.has("bg") ? `#${searchParams.get("bg")}` : 'pink';
let cardBackground = searchParams.has("cardBg") ? `#${searchParams.get("cardBg")}` : 'black';
let showPosts = searchParams.has("showPosts") ? searchParams.get("showPosts") == 'true' : true;
let textColor = searchParams.has("textColor") ? `${searchParams.get("textColor")}` : 'white';
let postUsernameColor = searchParams.has("postUsernameColor") ? `${searchParams.get("postUsernameColor")}` : 'white';
let hideReplies = searchParams.has("hideReplies") ? searchParams.get("hideReplies") == 'true' : false;
let hideMentions = searchParams.has("hideMentions") ? searchParams.get("hideMentions") == 'true' : false;
let postLimit = searchParams.has("postLimit") ? parseInt(searchParams.get("postLimit")) : 6;

function addBadge(usernameSpan, badges) {
    if (!badges) return;
    badges.forEach((badge) => {
        const img = document.createElement('img');
        img.src = `https://allowcors.nomaakip.workers.dev/?url=${badge.iconUrl}`;
        img.title = badge.name;
        img.alt = badge.name;
        img.style.height = '16px';
        img.style.marginLeft = '2px';
        img.style.verticalAlign = 'middle';
        usernameSpan.appendChild(img);
    });
}

function sanitizePostContent(html) {
    const allowedClasses = ['nametag-wrapper', 'ping'];
    const temp = document.createElement('div');
    temp.innerHTML = html;

    temp.querySelectorAll('img.emote').forEach(img => img.remove());

    temp.querySelectorAll('.nametag-wrapper a, .ping').forEach(a => {
        let targetPath = a.getAttribute('href') || a.textContent;
        if (targetPath.startsWith('/')) targetPath = targetPath.slice(1);

        a.setAttribute('href', `https://pikidiary.lol/${targetPath}`);
        a.setAttribute('target', '_blank');
    });

    function escapeHTML(str) {
        return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function sanitizeNode(node) {
        if (node.nodeType === Node.TEXT_NODE) return node.textContent;

        if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();
            const classList = Array.from(node.classList || []);
            const isAllowed = allowedClasses.some(cls => classList.includes(cls));
            const allowedTags = ['strong', 'i', 'u', 'em', 'a'];
            if (isAllowed || allowedTags.includes(tagName)) return node.outerHTML;
            else return escapeHTML(node.outerHTML);

        }

        return '';
    }

    let result = '';
    for (const child of temp.childNodes) {
        result += sanitizeNode(child);
    }
    return result;
}

async function getUserInfo() {
    try {
        const response = await fetch(`https://pikiapi-pikicards.vercel.app?username=${username}`);
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
    userAvatar.src = `https://allowcors.nomaakip.workers.dev/?url=${data.pfp}`;

    followLink.href = `https://pikidiary.lol/@${data.username}`;

    let userBackground = (data.background?.trim() || '').startsWith("#")
        ? data.background
        : data.background ? `url(https://allowcors.nomaakip.workers.dev/?url=${data.background})` : background;

    if (searchParams.get("bg") == 'userBackground') userContainer.style.background = data.background ? userBackground : `https://allowcors.nomaakip.workers.dev/?url=${background}`;
    else if (searchParams.has("bg")) userContainer.style.background = background;
    else userContainer.style.background = data.banner ? `url(https://allowcors.nomaakip.workers.dev/?url=${data.banner})` : background;

    if (searchParams.get("cardBg") == 'userBackground') cardContainer.style.background = data.background ? userBackground : cardBackground;
    else if (searchParams.get("cardBg") == 'userBanner') cardContainer.style.background = data.banner ? `url(https://allowcors.nomaakip.workers.dev/?url=${data.banner})` : cardBackground;
    else cardContainer.style.background = cardBackground;

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

    data.posts.slice(0, postLimit).forEach((post) => {
        if (hideReplies && post.isReply) return;
        if (hideMentions && post.content.trim().startsWith("@")) return;

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
        authorEl.style.color = postUsernameColor;

        const postContent = document.createElement('div');
        postContent.className = "post-content";
        postContent.style.display = 'flex';
        postContent.style.flexDirection = 'column';
        postContent.style.overflow = 'hidden';
        postContent.style.borderRadius = '2px';

        const postContentSpan = document.createElement('span');
        postContentSpan.innerHTML = sanitizePostContent(post.content);

        postHeader.appendChild(authorEl);
        postHeader.appendChild(postContent);

        postDiv.appendChild(avatar);
        postDiv.appendChild(postHeader);

        postContent.appendChild(postContentSpan);

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
                        img.src = `https://allowcors.nomaakip.workers.dev/?url=https://monian.lol${media.url}`;
                        img.style.maxWidth = '16px';
                        postEmotes.appendChild(img);
                    }
                });
                postContent.appendChild(postImages);
                postContent.appendChild(postEmotes);
            }
        }

        const postActions = document.createElement('span');
        postActions.className = 'post-actions';

        const timeSpan = document.createElement('span');
        timeSpan.style.lineHeight = '11px';
        timeSpan.style.marginTop = '-1px';
        timeSpan.textContent = post.createdAt || 'unknown time';

        const likeSpan = document.createElement('span');
        likeSpan.style.display = 'inline';
        likeSpan.style.float = 'right';
        likeSpan.style.fontSize = '11px';
        likeSpan.innerHTML = `<a href="https://pikidiary.lol/posts/${post.id}" class="post-button" style="float:right;margin-right:10px;font-size:11px;text-decoration:none" target="_blank"><img src="https://allowcors.nomaakip.workers.dev/?url=https://monian.lol/img/icons/like.png" alt="Like">&nbsp;<span class="like-count">${post.likes || 0}</span></a>`;
        postActions.appendChild(timeSpan);
        postActions.appendChild(likeSpan);

        if (!post.isReply && post.comments !== undefined) {
            const commentSpan = document.createElement('span');
            commentSpan.style.float = 'right';
            commentSpan.style.marginRight = '10px';
            commentSpan.style.fontSize = '11px';
            commentSpan.innerHTML = `<a href="https://pikidiary.lol/posts/${post.id}" class="post-button" style="text-decoration:none" target="_blank"><img src="https://allowcors.nomaakip.workers.dev/?url=https://monian.lol/img/icons/comment.png" alt="Comment">&nbsp;${post.comments}</a>`;
            postActions.appendChild(commentSpan);
        }

        if (post.isReply && post.replyInfo) {
            const parentSpan = document.createElement('span');
            parentSpan.style.float = 'right';
            parentSpan.style.marginRight = '10px';
            parentSpan.style.fontSize = '11px';
            parentSpan.innerHTML = `<a href="https://pikidiary.lol/posts/${post.id}" class="post-button" style="text-decoration:none" target="_blank"><img src="https://allowcors.nomaakip.workers.dev/?url=https://monian.lol/img/icons/parent.png" alt="Parent"></a>`;
            postActions.appendChild(parentSpan);
        }

        postHeader.appendChild(postActions);
        postsContainer.appendChild(postDiv);
    });
}

getUserInfo();





