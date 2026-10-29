try{const prefs=JSON.parse(localStorage.getItem('atlas-attack-prefs-v1')||'null');document.body.classList.toggle('dark',prefs?.theme==='dark')}catch{}
function revealSection(){const id=decodeURIComponent(location.hash.slice(1));const target=document.getElementById(id);if(!target)return;const details=target.closest('details');if(details)details.open=true;target.scrollIntoView({block:'start'})}
window.addEventListener('hashchange',revealSection);if(location.hash)revealSection();
