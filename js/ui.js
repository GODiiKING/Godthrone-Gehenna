function toggleMenu() {
    const menu = document.getElementById('menuContent');
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
}

window.onscroll = function() {
    const btn = document.getElementById("scrollToTop");
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        btn.style.display = "flex"; 
        btn.style.background = "#000000";
        btn.style.border = "1px solid #ff6b9d";
        btn.style.color = "#ff6b9d";
    } else {
        btn.style.display = "none";
    }
};

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}