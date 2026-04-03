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

    // Canvas menu (use delegated handlers so newly-rendered elements work)
    $(document).off('click', '.canvas__open').on('click', '.canvas__open', function () {
        $(".offcanvas-menu-wrapper").addClass("active");
        $(".offcanvas-menu-overlay").addClass("active");
    });
    $(document).off('click', '.offcanvas-menu-overlay').on('click', '.offcanvas-menu-overlay', function () {
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

    // Slicknav (mobile menu) — initialize reliably even if React renders markup later
    (function ensureSlicknavInit() {
        var attempts = 0;
        var maxAttempts = 20;
        function tryInit() {
            attempts++;
            if (typeof $.fn.slicknav !== 'function') {
                // plugin not loaded yet, retry
                if (attempts < maxAttempts) setTimeout(tryInit, 150);
                return;
            }
            if ($('.header__menu').length > 0 && $('#mobile-menu-wrap').length > 0) {
                if ($('.slicknav_menu').length === 0) {
                    $(".header__menu").slicknav({
                        prependTo: '#mobile-menu-wrap',
                        allowParentLinks: true
                    });
                } else if ($('#mobile-menu-wrap').find('.slicknav_menu').length === 0) {
                    // move existing slicknav markup into the mobile wrapper
                    $('#mobile-menu-wrap').append($('.slicknav_menu'));
                }
            } else if (attempts < maxAttempts) {
                setTimeout(tryInit, 150);
            }
        }
        tryInit();
    })();

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

    // Mobile: when user taps the filter Search/Apply button, hide the filter
    // and scroll to results so carousel is visible. Run after any React handler
    // by using a short timeout to avoid interfering with SPA logic.
    $(document).off('click.mobileFilter', '.car__filter__btn .site-btn').on('click.mobileFilter', '.car__filter__btn .site-btn', function (e) {
        if ($(window).width() <= 767) {
            setTimeout(function () {
                var $sidebar = $('.car__sidebar');
                var $results = $('.car');
                if ($sidebar.length && $results.length) {
                    $sidebar.slideUp(250);
                    // Add a small floating button to reopen filter
                    if ($('#mobile-filter-toggle').length === 0) {
                        var $btn = $('<button id="mobile-filter-toggle" class="site-btn" style="position:fixed;left:16px;bottom:16px;z-index:99999;padding:10px 14px;border-radius:6px;">Filter</button>');
                        $btn.appendTo('body').on('click', function () {
                            $sidebar.slideDown(250);
                            $(this).remove();
                            // ensure focus on first input
                            $sidebar.find('input, select, textarea').first().focus();
                        });
                    }
                    $('html,body').animate({ scrollTop: $results.offset().top - 10 }, 450);
                }
            }, 60);
        }
    });

    // Inject explicit mobile 'Search' button at top of filter for reliable UX
    function ensureMobileHideBtn() {
        if ($('.car__filter').length === 0) return;
        if ($('#mobile-hide-filter').length === 0) {
            var $mobileBtn = $('<button id="mobile-hide-filter" class="site-btn" style="display:none;margin-bottom:10px;">Search</button>');
            $('.car__filter form').prepend($mobileBtn);
            $mobileBtn.on('click', function () {
                var $sidebar = $('.car__sidebar');
                var $results = $('.car');
                if ($sidebar.length) {
                    $sidebar.slideUp(250);
                }
                if ($('#mobile-filter-toggle').length === 0) {
                    var $t = $('<button id="mobile-filter-toggle" class="site-btn" style="position:fixed;left:16px;bottom:16px;z-index:99999;padding:10px 14px;border-radius:6px;">Filter</button>');
                    $t.appendTo('body').on('click', function () {
                        $('.car__sidebar').slideDown(250);
                        $(this).remove();
                        $('.car__sidebar').find('input, select, textarea').first().focus();
                    });
                }
                if ($results.length) {
                    $('html,body').animate({ scrollTop: $results.offset().top - 10 }, 450);
                }
            });
        }

        function updateBtnVisibility() {
            if ($(window).width() <= 767) {
                $('#mobile-hide-filter').show();
            } else {
                $('#mobile-hide-filter').hide();
            }
        }

        updateBtnVisibility();
        $(window).off('resize.mobileHide').on('resize.mobileHide', updateBtnVisibility);
    }

        ensureMobileHideBtn();

        // Mobile language switcher: inject a simple language selector into the
        // offcanvas menu so users can change locale on small screens.
        function ensureMobileLanguage() {
            if ($('.offcanvas-menu-wrapper').length === 0) return;
            if ($('#mobile-language-switch').length) return;
            var $switch = $('<div id="mobile-language-switch" style="margin-bottom:20px;"></div>');
            var $inner = $('<div style="display:flex;gap:8px;flex-wrap:wrap;"></div>');
            $inner.append('<button class="site-btn mobile-lang" data-lang="en">EN</button>');
            $inner.append('<button class="site-btn mobile-lang" data-lang="ps">پښتو</button>');
            $inner.append('<button class="site-btn mobile-lang" data-lang="fa">دری</button>');
            $switch.append($inner);
            $('.offcanvas-menu-wrapper').prepend($switch);

            $(document).off('click', '.mobile-lang').on('click', '.mobile-lang', function () {
                var lang = $(this).data('lang');
                var pathname = window.location.pathname || '';
                var newPath;
                if (/^\/[a-z]{2,3}(\/|$)/i.test(pathname)) {
                    newPath = pathname.replace(/^\/[^\/]+/, '/' + lang);
                } else {
                    newPath = '/' + lang + pathname;
                }
                window.location.href = newPath;
            });

            function updateLangVisibility() {
                if ($(window).width() <= 767) {
                    $('#mobile-language-switch').show();
                } else {
                    $('#mobile-language-switch').hide();
                }
            }

            updateLangVisibility();
            $(window).off('resize.mobileLang').on('resize.mobileLang', updateLangVisibility);
        }

        ensureMobileLanguage();
}

// Run on initial page load
$(document).ready(function () {
    initTemplate();
});

// Expose globally so React can call it again
window.initTemplate = initTemplate;