$(function() {
    var $switch = $("#switch"),
        $pilotlamp = $(".pilot-lamp"),
        $count = $("h2"),
        $section = $("section"),
        $audio = $("audio"),
        strict = 0,
        lightTimer = null,
        roundTimer = null,
        order = [], // 亮灯顺序数组  
        clickCount = 0, // 点击计数
        orderCount = 0, // 亮灯计数
        lightCount = 0,
        roundCount = 1; // 回合计数
    $("main").click(function(e) {
        var tg = e.target,
            $tg = $(tg);
        if (tg.id == "switch") {
            $tg.toggleClass("on");
            $count.toggleClass("light");
            if (!$switch[0].className) {
                location.reload();
            }
        }
        if ($switch[0].className) {
            switch (tg.id) {
                case "strict":
                    $pilotlamp.toggleClass("light");
                    strict = 1;
                    break;
                case "start":
                    order = [];
                    clickCount = 0;
                    orderCount = 0;
                    lightCount = 0;
                    roundCount = 1;
                    $("section div").removeClass("light");
                    clearInterval(roundTimer);
                    clearInterval(lightTimer);
                    $section.removeClass("unclickable clickable").unbind();
                    getOrder();
                    startGame();
                    break;
            }
        }
    });

    function getOrder() {
        for (var i = 0; i < 20; i++) {
            var num = Math.round(Math.random() * 3);
            order.push(num);
        }
    }

    function startGame() {
        $count.text("- -");
        lightTimer = setInterval(light, 250);
    }

    function light() {
        lightCount++;
        $count.toggleClass('light');
        if (lightCount == 4) {
            clearInterval(lightTimer);
            lightCount = 0;
            if (roundCount > 9) { $count.text(roundCount); } else { $count.text("0" + roundCount); }
            roundTimer = setInterval(round, 2000);
        }
    }

    function round() {
        if (orderCount > 0) { $("#" + order[orderCount - 1]).removeClass('light'); }
        if (orderCount == roundCount) {
            console.log("可以点了");
            clearInterval(roundTimer);
            orderCount = 0;
            $section.removeClass('unclickable').addClass("clickable").mousedown(function(e) {
                $(e.target).addClass('light');
                if (e.target.id == order[clickCount]) {
                    console.log("点对了");
                    $audio[e.target.id].play();
                    clickCount++;
                    if (clickCount == roundCount) {
                        console.log("点完一轮");
                        clickCount = 0;
                        roundCount++;
                        if (roundCount > 9) { $count.text(roundCount); } else { $count.text("0" + roundCount); }
                        roundTimer = setInterval(round, 2000);
                    }
                } else {
                    console.log("点错了");
                    $count.text("! !");
                    $audio[0].play();
                    lightTimer = setInterval(light, 250);
                    clickCount = 0;
                    if (strict) { roundCount = 1; }
                }
            }).mouseup(function(e) {
                $(e.target).removeClass('light');
                if (!clickCount) { $section.addClass("unclickable").unbind(); }
            });
            return;
        }
        $("#" + order[orderCount]).addClass('light');
        $audio[order[orderCount]].play();
        orderCount++;
    }
});
