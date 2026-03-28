'use strict';

// ================== ONE‑TIME SETUP (runs only on page load) ==================
$(window).on('load', function () {
    $(".loader").fadeOut();
    $("#preloder").delay(200).fadeOut("slow");

    // Car filter (mixitup)
    $('.filter__controls li').on('click', function () {
        $('.filter__controls li').removeClass('active');
        $(this).addClass('active');
    });
    if ($('.car-filter').length > 0) {
        var containerEl = document.querySelector('.car-filter');
        var mixer = mixitup(containerEl);
    }
});

// ================== REUSABLE INIT FUNCTION (runs on every page) ==================
function initTemplate() {
    // Background images
    $('.set-bg').each(function () {
        var bg = $(this).data('setbg');
        $(this).css('background-image', 'url(' + bg + ')');
    });

    // Canvas menu
    $(".canvas__open").off('click').on('click', function () {
        $(".offcanvas-menu-wrapper").addClass("active");
        $(".offcanvas-menu-overlay").addClass("active");
    });
    $(".offcanvas-menu-overlay").off('click').on('click', function () {
        $(".offcanvas-menu-wrapper").removeClass("active");
        $(".offcanvas-menu-overlay").removeClass("active");
    });

    // Search switch
    $('.search-switch').off('click').on('click', function () {
        $('.search-model').fadeIn(400);
    });
    $('.search-close-switch').off('click').on('click', function () {
        $('.search-model').fadeOut(400, function () {
            $('#search-input').val('');
        });
    });

    // Slicknav (mobile menu)
    $(".header__menu").slicknav({
        prependTo: '#mobile-menu-wrap',
        allowParentLinks: true
    });

    // Owl Carousels
    $(".car__item__pic__slider").owlCarousel({
        loop: true,
        margin: 0,
        items: 1,
        dots: true,
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: false
    });

    var testimonialSlider = $(".testimonial__slider");
    testimonialSlider.owlCarousel({
        loop: true,
        margin: 0,
        items: 2,
        dots: true,
        nav: true,
        navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: false,
        responsive: {
            768: { items: 2 },
            0: { items: 1 }
        }
    });

    $(".car__thumb__slider").owlCarousel({
        loop: true,
        margin: 25,
        items: 5,
        dots: false,
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true,
        mouseDrag: false,
        responsive: {
            768: { items: 5 },
            320: { items: 3 },
            0: { items: 2 }
        }
    });

    // Price range sliders (jQuery UI)
    var rangeSlider = $(".price-range");
    rangeSlider.slider({
        range: true,
        min: 1,
        max: 4000,
        values: [1000, 3200],
        slide: function (event, ui) {
            $("#amount").val("$" + ui.values[0] + " - $" + ui.values[1] + ".100");
        }
    });
    $("#amount").val("$" + $(".price-range").slider("values", 0) + " - $" + $(".price-range").slider("values", 1) + ".100");

    var carSlider = $(".car-price-range");
    carSlider.slider({
        range: true,
        min: 1,
        max: 4000,
        values: [900, 3000],
        slide: function (event, ui) {
            $("#caramount").val("$" + ui.values[0] + " - $" + ui.values[1] + ".100");
        }
    });
    $("#caramount").val("$" + $(".car-price-range").slider("values", 0) + " - $" + $(".car-price-range").slider("values", 1) + ".100");

    var filterSlider = $(".filter-price-range");
    filterSlider.slider({
        range: true,
        min: 1,
        max: 1200000,
        values: [180000, 1000000],
        slide: function (event, ui) {
            $("#filterAmount").val("[ " + "$" + ui.values[0] + " - $" + ui.values[1] + " ]");
        }
    });
    $("#filterAmount").val("[ " + "$" + $(".filter-price-range").slider("values", 0) + " - $" + $(".filter-price-range").slider("values", 1) + " ]");

    // Nice Select
    $('select').niceSelect('destroy');
    $('select').niceSelect();

    // Magnific Popup
    $('.video-popup').magnificPopup({
        type: 'iframe'
    });

    // Single product thumb switcher
    $('.car-thumbs-track .ct').off('click').on('click', function () {
        $('.car-thumbs-track .ct').removeClass('active');
        var imgurl = $(this).data('imgbigurl');
        var bigImg = $('.car-big-img').attr('src');
        if (imgurl != bigImg) {
            $('.car-big-img').attr({
                src: imgurl
            });
        }
    });

    // Counter Up
    $('.counter-num').each(function () {
        $(this).prop('Counter', 0).animate({
            Counter: $(this).text()
        }, {
            duration: 4000,
            easing: 'swing',
            step: function (now) {
                $(this).text(Math.ceil(now));
            }
        });
    });
}

// Run on initial page load
$(document).ready(function () {
    initTemplate();
});

// Expose globally so React can call it again
window.initTemplate = initTemplate;