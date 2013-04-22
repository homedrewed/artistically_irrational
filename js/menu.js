function openMenu(event) {
    var menu = document.getElementById("exhibitmenu");
    menu.style.display = "block";
    document.addEventListener("mousedown", closeMenu, false);
    event.preventDefault();
    event.stopPropagation();
}

function closeMenu(event) {
    if (notMenu(event.target)) {
        document.removeEventListener("mousedown", closeMenu, false);
        var menu = document.getElementById("exhibitmenu");
        menu.style.display = "none";
        event.preventDefault();
    }
}

function notMenu(node) {
    if (node.tagName == 'BODY') return true;
    if (node.id && node.id == 'exhibitmenu') return false;
    return notMenu(node.parentNode);
}

window.onload = function() {
    var menuLink = document.getElementById("artmenu").children[0];
    menuLink.addEventListener("click", openMenu, false);
}