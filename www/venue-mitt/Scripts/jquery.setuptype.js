// 各种摆台方式查看说明插件
;(function($){
    var runtime = {
        domId: '#setype_float_tip',
        theatre: {
            tit: '剧院式摆台',
            img: '/img/setup_type/theatre.png',
            info: {
                description: '在会议厅内面向讲台摆放一排排的座椅，中间留有较宽的过道。',
                feature: '在留有过道的情况下，最大程度地摆放座椅，最大限度地将空间利用起来，在有限的空间里可以最大限度容纳人数；但参会者没有地方放资料，也没有桌子可用来记笔记。'
            }
        },
        desk: {
            tit: '课桌式摆台',
            img: '/img/setup_type/desk.png',
            info: {
                description: '这种布置与学校教室一样，在椅子前面有桌子，方便与会者作记录，每个座位的空间将根据桌子的大小而有所不同。',
                feature: '这种布置也要求中间留有走道，每一排的长度取决于会议室的大小及出席会议的人数，布置上具有一定的灵活性；参会者可以有放置资料及记笔记的桌子。'
            }
        },
        fishbone: {
            tit: '鱼骨式摆台',
            img: '/img/setup_type/fishbone.png',
            info: {
                description: '会议室的桌子按照鱼骨架即八字形依次摆开，并在桌子的周围摆放座椅，组与组之间留出走路的间隔。',
                feature: '使整体样式显现出一种鱼骨的形状，比较适合于研讨和小组讨论结合的会议内容，在增加小组间交流的同时，还可以聆听会议主持人的发言。'
            }
        },
        ushape: {
            tit: 'U型摆台',
            img: '/img/setup_type/ushape.png',
            info: {
                description: '将与会者的桌子与主席台桌子垂直相连在两旁摆成U型，椅子摆在桌子外围，通常开口处会摆放放置投影仪的桌子。',
                feature: '中间通常会放置绿色植物以做装饰；不设会议主持人的位置以营造比较轻松的氛围；多摆设几个麦克风以便自由发言。'
            }
        },
        backshape: {
            tit: '回型摆台',
            img: '/img/setup_type/backshape.png',
            info: {
                description: '将会议室里的桌子摆成方形中空，前后不留缺口，椅子摆在桌子外围，投影仪会有一个专用的小桌子放置在最前端。',
                feature: '此种类型的摆桌常用于学术研讨会一类型的会议，前方设置主持人的位置，可分别在各个位置上摆放上麦克风，以方便不同位置的参会者发言；此种台型容纳人数较少，对会议室空间有一定的要求。'
            }
        },
        banquet: {
            tit: '宴会式摆台',
            img: '/img/setup_type/banquet.png',
            info: {
                description: '多张圆形桌组成，周围摆放座椅。以宴会形式摆桌。',
                feature: '布局较为随意，有利于调动参会者发言的积极性，适合小组讨论。与会人员之间距离较近，容易产生近距离的交流感。'
            }
        }
    };

    // 鼠标移入
    var itemHoverIn = function() {
        var $span = $(this), name = $span.attr('class');
        if (!$span.get(0) || !name || typeof(runtime[name]) == 'undefined') return false;
        var data = runtime[name], $dom = createTipDom(data);

        var position = $span.position();
            position.top += parseInt($span.outerHeight()) + 10;
            position.left -= 18; // 箭头偏移量

        $dom.css({left: position.left, top: position.top, zIndex: 999999999}).fadeIn();
    };

    // 鼠标移出
    var itemHoverOut = function() {
        var $span = $(this), name = $span.attr('class');
        if (!$span.get(0) || !name || typeof(runtime[name]) == 'undefined') return false;
        var data = runtime[name], $dom = createTipDom(data);

        if (runtime.timer) {
            clearTimeout(runtime.timer);
        }

        runtime.timer = setTimeout(function(){
            $dom.fadeOut();
        }, 1000);
    };

    // 根据数据创建DOM
    var createTipDom = function(data) {
        if (typeof(data) == 'undefined') return false;
        var $box = $(runtime.domId);
        if (!$box.get(0)) {
            $box = $('<div class="arrow_box clearfix">'
                +'<div class="setype_thumb">'
                    +'<h5>摆台方式</h5>'
                    +'<img src="about:blank">'
                +'</div>'
                +'<div class="setype_detail">'
                    +'<dl>'
                        +'<dt>桌型摆设</dt>'
                        +'<dd class="description"></dd>'
                    +'</dl>'
                    +'<dl>'
                        +'<dt>特点</dt>'
                        +'<dd class="feature"></dd>'
                    +'</dl>'
                +'</div>'
            +'</div>');

            $box.attr({id: runtime.domId.substr(1)});

            $box.hover(function(){
                if (runtime.timer) {
                    clearTimeout(runtime.timer);
                }
            }, function(){
                runtime.timer = setTimeout(function(){
                    $box.fadeOut();
                }, 1000);
            });

            $('body').append($box.hide());
        }

        if (runtime.timer) {
            clearTimeout(runtime.timer);
        }

        if (data.tit && data.img) {
            $box.find('.setype_thumb > h5').text(data.tit);
            $box.find('.setype_thumb > img').attr({src: data.img});
        }

        if (data.info) {
            $box.find('.setype_detail .description').text(data.info.description);
            $box.find('.setype_detail .feature').text(data.info.feature);
        }

        return $box;
    };

    $(document).scroll(function(){
        if (runtime.timer) {
            clearTimeout(runtime.timer);
        }
        $(runtime.domId).hide();
    });

    $.fn.extend({
        setupType: function(args) {
            var $all = this, option = {};

            if (typeof args == 'object') {
                option = $.extend(option, args);
            }

            return $all.each(function(){
                var $span = $(this), name = $span.attr('class');
                $span.hover(itemHoverIn, itemHoverOut);
                $span.removeAttr('title');
                return this;
            });
        }
    });
})(jQuery);