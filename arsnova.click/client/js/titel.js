/**
 * Created by antoschka on 08.03.16.
 */

Template.titel.onRendered(function () {
    $(window).resize(function () {

        var final_height = $(window).height() - $(".navbar-fixed-top").outerHeight() - $(".navbar-fixed-bottom").outerHeight() - $(".fixed-bottom").outerHeight();
        $(".container").css("height", final_height);
        $(".container").css("margin-top", $(".navbar-fixed-top").outerHeight());

        $(".kill-session-switch-wrapper").css("top", $(".arsnova-logo").height() * 0.4);
    });
});


Template.titel.rendered = function () {
    var final_height = $(window).height() - $(".navbar-fixed-top").outerHeight() - $(".navbar-fixed-bottom").outerHeight() - $(".fixed-bottom").outerHeight();

    $(".container").css("height", final_height);
    $(".container").css("margin-top", $(".navbar-fixed-top").outerHeight());

    $(".kill-session-switch-wrapper").css("top", $(".arsnova-logo").height() * 0.4);
};