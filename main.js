 $(function() {
     var $switch = $('#switch'),
         $count = $('h2'),
         $section = $('section'),
         $center = $('.center'),
         $pilotLamp = $('.pilot-lamp'),
         $colorBlock = $section.find('div'),
         $audio = $('audio'),
         roundTimer = null, // 间歇调用ID
         flickerTimer = null,
         game = function() {
             var status = {
                 strict: 0, // strict模式指示 
                 reset: {
                     click: function() { status.click = 0; },
                     count: function() { status.count = 1; },
                     all: function() {
                         status.click = 0; // 玩家已点击次数
                         status.count = 1; // COUNT计数
                         status.order = getOrder(); // 亮灯顺序
                         clearInterval(roundTimer);
                         clearInterval(flickerTimer);
                     }
                 }
             };
             return {
                 get: function(pro) {
                     pro = pro || 'count';
                     return status[pro];
                 },
                 reset: function(pro) {
                     pro = pro || 'all';
                     status.reset[pro]();
                 },
                 increase: function(pro) {
                     pro = pro || 'count';
                     status[pro]++;
                 },
                 changeMode: function() {
                     if (!$switch.attr('class')) return;
                     $pilotLamp.toggleClass('light');
                     status.strict = status.strict ? 0 : 1;
                 }
             };
         }();
     // 监听控制区点击事件
     $center.click(function(e) {
         var tg = e.target.id;
         performance = {
             switch: power,
             strict: game.changeMode,
             start: gameStart
         };
         if (performance[tg]) performance[tg]();
     });
     // 监听游戏区(色块)鼠标事件
     $section.mousedown(function(e) {
         var tg = e.target,
             length = game.get(),
             index = game.get('click');
         $(tg).addClass('light');
         if (tg.id == game.get('order')[index]) { //  玩家点击正确
             $audio[tg.id].play();
             correctClick(index, length);
         } else {
             wrongClick();
         }
     }).mouseup(function(e) {
         $(e.target).removeClass('light');
         if (!game.get('click')) { $section.addClass('unclickable'); } // 玩家点完一轮且松开鼠标，禁用点击
     });
     // 开关游戏
     function power() {
         $switch.toggleClass('on');
         $count.toggleClass('light');
         if (!$switch.attr('class')) {
             location.reload();
         }
     }
     // 游戏开始/重置
     function gameStart() {
         if (!$switch.attr('class')) return;
         $colorBlock.removeClass('light');
         game.reset();
         refreshCount('- -');
     }
     //  生成亮灯顺序数组
     function getOrder() {
         var lightOrder = [],
             i = 0;
         for (; i < 20; i++) {
             var num = Math.round(Math.random() * 3);
             lightOrder.push(num);
         }
         return lightOrder;
     }
     // COUNT区闪烁    
     function flicker() {
         var lightCount = 0;

         function light() {
             lightCount++;
             $count.toggleClass('light');
             if (lightCount == 4) {
                 clearInterval(flickerTimer);
                 refreshCount();
             }
         }
         flickerTimer = setInterval(light, 250);
     }
     //  更新COUNT
     function refreshCount(content) {
         var count = game.get();
         if (content) {
             $count.text(content);
             flicker();
         } else {
             if (count > 9) $count.text(count);
             else $count.text('0' + count);
             roundStart();
         }
     }
     //  每回合顺序亮灯
     function roundStart() {
         var lightCount = 0;

         function round() {
             var index = game.get('order')[lightCount],
                 audio = $audio[index];
             if (lightCount == game.get()) {
                 //  亮灯完毕,玩家可以开始操作
                 clearInterval(roundTimer);
                 lightCount = 0;
                 $section.removeClass('unclickable').addClass('clickable');
                 return;
             }
             $colorBlock.eq(index).addClass('light');
             audio.play();
             audio.onended = function() {
                 $colorBlock.removeClass('light');
             };
             lightCount++;
         }
         roundTimer = setInterval(round, 1500);
     }
     // 玩家点错
     function wrongClick() {
         $audio[3].play(); //  可替换成警告音效
         game.reset('click');
         if (game.get('strict')) { game.reset('count'); }
         refreshCount('! !');
     }
     // 玩家点击正确
     function correctClick(index, length) {
         game.increase('click');
         if (index == length - 1) {
             //  玩家胜利
             if (length == 20) {
                 alert('YOU WIN');
                 location.reload();
             }
             //  玩家点完一轮
             game.reset('click');
             game.increase();
             refreshCount();
         }
     }
 });
