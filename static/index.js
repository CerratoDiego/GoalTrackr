"use strict"

$(document).ready(function () {
    // Puntatori HTML
    let _wrapper = $("#wrapper");
    let _navbar = $("#accordionSidebar");
    let _dashboard = $("#dashboard");
    let _calendar = $("#calendar");

    // Visibilità
    _dashboard.show();

    $("#sidebarToggle").on("click", function () {
        _navbar.toggleClass("toggled");
    });

});