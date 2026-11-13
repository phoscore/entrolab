const sky=document.getElementById('cosmicBackground');
const sync=()=>sky.classList.toggle('is-hidden',document.hidden);
document.addEventListener('visibilitychange',sync);
sync();
