import { getUser } from './tools/githubUser.js';

let userAvatar = document.getElementsByClassName('user-avatar')[0];
let user = await getUser('bluesbaker');

if(user) {
  userAvatar.src = user.avatar_url;
};