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
    userAvatar.src = data.pfp;

    followLink.href = `https://pikidiary.lol/@${data.username}`;
    userContainer.style.background = data.banner ? `url(${data.banner})` : background;

    addBadge(usernameText, data.badges);
    displayPosts(data);
}

function displayPosts(data) {

    /*
    const post = document.createElement('div');
    post.innerHTML = `<div class="post">
                    <img src="https://pikidiary.lol/uploads/avatars/resized-1746850786028.jpg" alt="pfp" class="avatar-small">
                    <div class="post-content" style="display: flex;flex-direction: column;overflow: hidden;">ok</div>
                </div>`;

    postsContainer.appendChild(post);
    */
}

getUserInfo();