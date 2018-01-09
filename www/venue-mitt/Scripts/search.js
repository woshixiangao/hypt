// 搜索列表页所需脚本
$(function(){
    // 是否开启快速点击体验
    var open_fast_click = true;
    var default_cookie_path = '/venue/';
    var default_jump_url = '/venue/m/'; // 清空条件

    // 封装一下 jQuery Cookie 函数
    window.cookie = function(k, v) {
        var option = {path: default_cookie_path};
        if (arguments.length === 1) {
            return $.cookie(k);
        }
        if (arguments.length === 2) {
            if (k && (v === '' || v === null)) {
                $.cookie(k, '', option);
            } else if (k && v) {
                $.cookie(k, v, option);
            }
        }
        return true;
    };

    // 设置 Cookie 中 cityId 和 cityName
    window.setCurrCookieCityIdName = function($trigger) {
        if ($trigger.data('city_id')) {
            var cityId = $trigger.data('city_id');
            var cityName = $.trim($trigger.text());
            $.cookie('curr_cookie_city_name', cityName, {path: '/', expires: 365});
            $.cookie('curr_cookie_city_id', cityId, {path: '/', expires: 365});
            return true;
        }
        return false;
    };

    // 大图展示弹层
    $('#search_result .photos img.img_url').click(function(){
        var $parent = $(this).parents('.photos');
        var curr_img_src = $(this).attr('src'), img_list = [];
            curr_img_src = curr_img_src.split('@')[0];

        var $box = $('<div class="photo_box clearfix">');
        var $list = $('<div class="thumb">');
        var $big = $('<img class="large">').attr('src', curr_img_src);

        $parent.find('img.img_url').each(function(){
            img_list.push($(this).attr('src'));
        });

        $.each(img_list, function(i, v){
            var src = v.split('@')[0];
            var $img = $('<img class="small">').attr('src', src);
            var focus = "$(this).addClass('on').siblings('img.on').removeClass('on')";
            $img.attr('onclick', "$(this).parent().next().attr(\'src\', \''+src+'\');"+focus);
            if (src == curr_img_src) { $img.addClass('on'); }
            $list.append($img);
        });

        $box.append($list).append($big);

        layer.open({
            type: 1, title: false, closeBtn: true, shadeClose: true,
            area: ['auto', 'auto'], skin: 'show_mroom_images',
            content: $box.prop('outerHTML')
        });
    });

    // 筛选链接点击后立即给其加上 class .on 使其高亮，解决刷新前感觉反映不及时问题
    if (open_fast_click) {
        $('#query_filter li[class] a[href]').click(function(){
            var $curr = $(this), $parent_li = $curr.parents('li[class]');
            // 城市选择的优化处理
            if ($parent_li.hasClass('city_id')) {
                // 设置当前选择的城市 cookie
                setCurrCookieCityIdName($curr);
                var $location = $('#query_filter li.location');
                var $on = $parent_li.find('a.on');
                if ($on.index() == 1 || $curr.index() === 1) {
                    $location.toggle();
                    $on.removeClass('on'), $curr.addClass('on');
                }
                if ($curr.index() > 1) {
                    if (!$location.get(0)) {
                        $curr.css('border-width', '1px 1px 1px 1px');
                    }
                    $on.removeClass('on'), $curr.addClass('on');
                }
            }
            // 场地类型多选处理
            else if ($parent_li.hasClass('category_id')) {
                var $on = $parent_li.find('a.on');
                $curr.toggleClass('on');
                if ($curr.index() > 1) {
                    $parent_li.find('a:first').removeClass('on');
                } else if ($curr.index() == 1) {
                    $on.removeClass('on');
                }
            }
            // 其他情况点击处理
            else {
                $curr.parents('li[class]').find('a.on').removeClass('on');
                $curr.addClass('on');
            }
        });
    }

    // 其他城市点击
    $('#query_filter li.city_id a.other').popCity(function(city_id, item, $obj){
        $obj.addClass('on');
        $.cookie('curr_cookie_city_name', item.name, {path: '/', expires: 365});
        $.cookie('curr_cookie_city_id', city_id, {path: '/', expires: 365});
        var url = [null, 'venue', item.url, null].join('/');
        window.location.href = url;
    });

    // 商圈大项点击
    $('#query_filter > li.location > strong').click(function(){
        var $curr = $(this), class_name = $curr.attr('target');
        if (!class_name) {
            var href = $curr.attr('href');
            $('#query_filter > li.location > div[class]').hide();
            window.location.href = href;
        }
        $('#query_filter > li.location > div.'+class_name).show().siblings('div[class]').hide();
        $curr.addClass('on').siblings('strong.on').removeClass('on');
    });

    // 地铁周边点击
    $('#query_filter > li.location > div.388499bd46db25c10f76b051a6a2835b > em').click(function(){
        var $curr = $(this), target = $curr.attr('target'), $parent = $curr.parent();
        $curr.addClass('on').siblings('em.on').removeClass('on');
        $parent.find('div.'+target).show().siblings('div[class]').hide();
        // 点击几号线后默认打开第一个站点
        var href = $curr.attr('href');
        if (href && $parent.get(0)) {
            $parent.find('div.'+target+ ' > a:first-child').addClass('on');
            window.location.href = href;
        }
    });

    // 检查本地 cookie，自动调整高亮
    $('#query_filter > li[class]').each(function(){
        var $li = $(this), arg_key = $li.attr('class');
        var area = cookie(arg_key);
        // 点击固有链接时，清空自定义筛选条件
        $li.find('a').click(function(){
            cookie(arg_key, null);
        });
        // 发现存在自定义筛选条件时，取消高亮
        if (area && typeof(area) != 'undefined') {
            var split = area.split('~');
            $li.find('a.on').removeClass('on');
            $li.find('input[name=min]').val(split[0]);
            $li.find('input[name=max]').val(split[1]);
            $li.find('.custom').addClass('focus');
        }
    });

    // 区间筛选条件自定义
    $('#query_filter > li .custom span.handle').click(function(){
        var $curr = $(this), $form = $curr.next('span.form');
        var $min = $form.find('input[name=min]'), $max = $form.find('input[name=max]');
        var $li = $curr.parents('li[class]'), arg_key = $li.attr('class');

        // 隐藏自定义操作块时，清 cookie
        if ($(this).parent('.custom').hasClass('focus')) {
            $min.val('') && $max.val('');
            cookie(arg_key, null);
        }

        // 显示、隐藏自定义操作块
        $(this).parent('.custom').toggleClass('focus');

        // 统计埋点
        if (typeof(HGG) != 'undefined' && HGG.trackEvent) {
            var event_list = {
                'ejhDvr' : 'meetingroom_space',
                '8gv6CI' : 'meetingroom_people_num',
                'G8iRQQ' : 'guestroom_price',
                'nP3s6X' : 'meetingroom_price'
            };
            $.each(event_list, function(k, v){
                if ($li.hasClass(v)) HGG.trackEvent(k);
            });
        }

        return false;
    });

    // 区间筛选条件确定
    $('#query_filter > li .custom span.form button').click(function(){
        var $curr = $(this), $form = $curr.parent('span.form');
        var $min = $form.find('input[name=min]'), $max = $form.find('input[name=max]');
        var min = Math.abs(parseInt($min.val())), max = Math.abs(parseInt($max.val()));
        var $li = $curr.parents('li[class]'), arg_key = $li.attr('class');

        if (!min || !max || min + max == 0) {
            layer.alert('请填写大于零的正整数区间值');
            if (!min) { $min.focus(); return false; }
            if (!max) { $max.focus(); return false; }
            return false;
        }

        if (min > max) {
            var tmp = min, min = max, max = tmp;
        }

        $min.val(min) && $max.val(max);

        var find = false;
        var area = [min, max].join('~'), range = [min+1, max].join('~');

        // 用户填写的区间（或min+1）在列表中有的，则跳转已有链接
        $.each([area, range], function(i, v){
            var $target = $li.find('a[data-area="'+v+'"]');
            if ($target.get(0)) {
                cookie(arg_key, null) && $target.trigger('click');
                window.location.href = $target.attr('href');
                find = true; return false;
            }
        });

        if (!find) {
            cookie(arg_key, area);
            window.location.reload();
        }

        // 统计埋点
        if (typeof(HGG) != 'undefined' && HGG.trackEvent) {
            var event_list = {
                'Dc6rku' : 'meetingroom_space',
                'BlMx3M' : 'meetingroom_people_num',
                'OWNlRH' : 'guestroom_price',
                'N63E5p' : 'meetingroom_price'
            };
            $.each(event_list, function(k, v){
                if ($li.hasClass(v)) HGG.trackEvent(k);
            });
        }

        return false;
    });

    // 查看会议厅详情按钮
    $('.meetingroom_info td span.view_detail').click(function(){
        var $curr = $(this), $tr = $curr.parents('tr');
        $curr.text(!$curr.hasClass('spread') ? '收起详情' : '查看详情').toggleClass('spread');
        $tr.next('tr.details').toggle().toggleClass('noline');

        // 统计埋点
        if (typeof(HGG) != 'undefined' && HGG.trackEvent) {
            HGG.trackEvent('bA4lbF');
        }
    });

    // 查看全部会议厅按钮
    $('.meetingroom_info tr.foot span.view_all').click(function(){
        var $curr = $(this), $table = $curr.parents('table.meetingroom_info');
        if (!$curr.data('old-text')) { $curr.data('old-text', $curr.text()); }
        $curr.text(!$curr.hasClass('spread') ? '收起' : $curr.data('old-text')).toggleClass('spread');
        $table.find('tr.details').hide();
        $table.find('tr.hide').toggle();

        // 统计埋点
        if (typeof(HGG) != 'undefined' && HGG.trackEvent) {
            HGG.trackEvent('STdVnH');
        }
    });

    // 查看全部场地类型筛选条件
    $('#query_filter li.category_id .select_block span.view_more').click(function(){
        var $curr = $(this), index = $curr.data('index'), $target = $curr.parents('.select_block');
        $curr.html(!$curr.hasClass('spread') ? '收起<i class="hggfont hgg-up-arrow02-copy">' : '更多<i class="hggfont hgg-xiaojiantou_xia">').toggleClass('spread');
        $target.find('a:gt('+index+')').toggle();
        $curr.attr('title', $curr.text());
    });

    // 收集用户筛选条件
    var $target = $('#serach_stat_info .args');
    var $searchArgsLabel = $('label.js-search-args');
    $('#query_filter a.on').each(function(){
        var $curr = $(this), name = $.trim($curr.text());
        if (name == '不限') return true;
        var href = $curr.siblings('a').first().attr('href');
        if ($curr.parents('li[class]').hasClass('category_id')) {
            href = $curr.attr('href');
        }
        if ($curr.parents('li[class]').hasClass('location')) {
            href = $curr.parents('li[class]').find('strong[href]').attr('href');
        }
        var $link = $('<a>').text(name).attr({
            href: href, title: ['移除', name, '筛选条件'].join('')
        });
        $searchArgsLabel.append(' + '+name);
        $target.append($link);
    });

    // 如有自定义项，则加入到筛选条件中
    if (!$('#query_filter li[class] .custom .form').is(':hidden')) {
        var $customForms = $('#query_filter li[class] .custom .form');
        $customForms.each(function(){
            var $form = $(this), unit = $form.data('unit');
            var min = $form.find('input[name=min]').val();
            var max = $form.find('input[name=max]').val();
            if (min && max) {
                var $li = $form.parents('li[class]');
                var name = [min, max].join('-')+unit;
                var href = $li.find('a:contains("不限")').attr('href');
                var $link = $('<a>').text(name).attr({
                    href: href, title: ['移除', name, '筛选条件'].join('')
                });
                $link.click(function(){
                    // 注意，这里 li 可能会有多个 class
                    cookie($li.attr('class'), '');
                });
                $target.append($link);
            }
        });
    }

    // 清空条件按钮
    if ($.trim($target.html())) {
        $target.append($('<button>').text('清空条件').click(function(){
            window.location.href = default_jump_url;
        }));
    }

    // 给指定 DOM 应用分页器
    if (typeof($.fn.pagination) == 'function') {
        $('#rightSlider > ul.item_block').pagination();
    }

    // 随滚动条固定位置
    if (typeof($.fn.scrollToFixed) == 'function') {
        // 右侧地图浮动固定
        if ($('.hotel_list').length == 0) return false;
        var hotelListHeight = $('.hotel_list').offset().top + $('.hotel_list').height();
            rightSliderHeight = $('#rightSlider').height();
        var headerHeight = $('body > .hgg-header').outerHeight();
        $('#rightSlider').scrollToFixed({
            marginTop: headerHeight + 10, limit: hotelListHeight - rightSliderHeight - 60
        });
        $('#rightSlider').next('div').remove();

        // 列表页的Header固定在顶部
        var $hggHeader = $('body > .hgg-header .hgg-header-box');
        $hggHeader.scrollToFixed({
            zIndex: 9999
        });

        // 增加、删除阴影样式
        $(document).on('scroll', function(){
            var scrollTop = $(document).scrollTop();
            $hggHeader.toggleClass('header-active', !!scrollTop);
            $hggHeader.find('input[name=keywords]').trigger('blur');
        });
    }

    // 摆台方式悬浮说明
    if (typeof($.fn.setupType) == 'function') {
        $('#search_result .hotel_list .meetingroom_info th.setup_type span').setupType();
    }
});

// 右侧地图找酒店
$(function(){
    var map_dom_id = 'baiduMapBox', $alink = false, markers = [];
    var icons = '/img/markers_new2_4ab0bc5.png';
    var $map_box = $('#'+map_dom_id); if (!$map_box.get(0)) { return; }
    var $link = $map_box.find('.findByMap').clone();
    var lon_lat = typeof(window.lon_lat) != 'undefined' ? window.lon_lat : false;
    var map = new BMap.Map(map_dom_id); // 创建Map实例
    var $first_lines = $('#search_result .hotel_list .first_line');
    // 酒店标题或索引ID在hover事件时候定位中心点
    $first_lines.find('.index,.title').mouseover(function(){
        var $curr = $(this), index = $curr.data('index');
        if (typeof(index) == 'undefined') {
            index = $curr.prev('.index').data('index');
        }
        var data = window.lon_lat[index-1];
        if (data && data.lon && data.lat) {
            // 移动到指定位置的中心点
            map.panTo(new BMap.Point(data.lon, data.lat));
            // 覆盖物弹跳动画
            if (typeof(markers[index-1]) != 'undefined') {
                var marker = markers[index-1];
                marker.setAnimation(BMAP_ANIMATION_BOUNCE);
                setTimeout(function(){
                    marker.setAnimation(null);
                }, 1000);
            }
        }
    }).click(function(){
        if (typeof(window.search_args) != 'undefined') {
            var hotel_id = $(this).data('hotel_id'), pageData = window.search_args;
            if (hotel_id && pageData && typeof(pageData) == 'object') {
                pageData.href = window.location.href, pageData.hotel_id = hotel_id;
                Cookies.set('list_jump_detail', pageData, {expires: 365*10, path: '/'});
            }
        }
    });

    // 通过 label 事件获取酒店信息
    var getHotelInfoByLabel = function(e) {
        var result = false;
        var p = e.target, lng = p.getPosition().lng, lat = p.getPosition().lat;
        var title = e.target.content.replace(new RegExp(prefix,'gm'), '');
            title = title.replace(new RegExp(endfix,'gm'), '');
        $.each(window.lon_lat, function(i, item){
            if (item.title == title) result = item;
        });
        return result;
    }
    // 设置地图默认城市和缩放级别
    if (false == lon_lat || lon_lat.length == 0) {
        map.centerAndZoom('北京', 10);
    }
    if (map_dom_id && lon_lat && lon_lat.length) {
        var prefix = '&#8194;', endfix = '&#8194;', pointArray = [];
        var first_lon = lon_lat[0].lon, first_lat = lon_lat[0].lat;
        map.centerAndZoom(new BMap.Point(first_lon, first_lat), 10); // 设置中心点和缩放级别
        map.enableScrollWheelZoom(true); // 允许鼠标滚轮缩放地图
        $.each(lon_lat, function(i, v) {
            var lon = v.lon, lat = v.lat, point = new BMap.Point(lon, lat);
            var icon_width = 18, icon_height = 27, max_zIndex = 999999999;
            var icon = new BMap.Icon(icons, new BMap.Size(icon_width, icon_height));
                icon.setImageOffset(new BMap.Size(-(i*icon_width), -166));
            var marker = new BMap.Marker(point, {icon: icon}); // 创建标注
            var label_txt = prefix+prefix+prefix+v.title+endfix;
            var label = new BMap.Label(label_txt, {offset: new BMap.Size(0, 0)});
            // 设置 label 样式
            label.setStyle({
                color : '#5a6c7e', fontSize : '12px', borderRadius: '16px', borderColor: '#63b8ff',
                height : '20px', lineHeight : '16px', fontFamily: '微软雅黑', zIndex: -1
            });
            // 给 label 绑定鼠标移入事件
            label.addEventListener('mouseover', function(e){
                var hotel = getHotelInfoByLabel(e);
                var $label = $(e.currentTarget.V), $marker = $label.parents('.BMap_Marker');
                $marker.css('z-index', max_zIndex-1).siblings('.BMap_Marker').css('z-index', max_zIndex-2);
                var label_style = {
                    backgroundColor: 'none', zIndex: max_zIndex, borderRadius: 20,
                    width: $label.outerWidth(), height: $label.outerHeight(),
                    position: 'absolute', display: 'block', overflow: 'hidden',
                    left: 0, top: 0
                }
                if (false == $alink) {
                    $alink = $('<a target="_blank"></a>').css(label_style)
                    .mouseover(function(){ $(this).addClass('in'); })
                    .mouseout(function(){ $(this).remove(); $alink = false; })
                    .click(function(){ $(this).remove(); $alink = false; });
                    $alink.appendTo($('body'));
                }
                $alink.attr({href: '/view-'+hotel.hotel_id+'.html'});
            });
            pointArray.push(point); // 添加到点集合中
            marker.setTop(true); // 将标注置于其他标注之上
            marker.setLabel(label); // 给点添加 label
            map.addOverlay(marker); // 添加覆盖物
            markers.push(marker); // 添加到集合中
        });
        if (pointArray.length) {
            map.setViewport(pointArray); // 让所有点都在视野范围内
        }
    }
    // 地图加载完毕后隐藏
    map.addEventListener('tilesloaded', function(){
        $('.BMap_cpyCtrl').hide();
    });
    // 添加地图找酒店链接
    $map_box.append($link);

    /////////////////////////////////////////////////////////////////////////

    // 定时器
    var timer = false;

    // 获取可视范围内的酒店
    var getVisibleHotel = function() {
        var result = [];
        $first_lines.each(function(){
            var $curr = $(this).find('h3.title'), offsetTop = $curr.offset().top;
            if (offsetTop >= $(window).scrollTop() && offsetTop < ($(window).scrollTop()+$(window).height())) {
                result.push($curr);
            }
        });
        return result;
    };

    // 显示或隐藏酒店定位点
    var toggleHotel = function(){
        var pointArray = [];
        var hotels = getVisibleHotel();
        var indexs = $(hotels).map(function(index, $dom){ return $dom.prev('.index').data('index'); }).get();
        if (!indexs.length) return;
        $.each(markers, function(idx, marker){
            if (-1 != $.inArray(idx+1, indexs)) {
                marker.show();
                pointArray.push(marker.getPosition());
            } else {
                marker.hide();
            }
        });
        // 让所有点都在视野范围内
        if (pointArray.length) {
            map.setViewport(pointArray);
        }
    };

    // 页面滚动事件，绑定处理函数
    $(document).scroll(function(){
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(function(){
            toggleHotel();
        }, 500);
    });

    // 页面载入后先执行一次
    toggleHotel();
});

$(function(){
    // 搜索不到结果时提交表单
    $('#search_result_empty button').click(function(){
        var search_args = '';
        var date = new Date().toLocaleDateString().replace('/', '-');
        var $input = $('#search_result_empty .form_step1 input[type=text]');
        var phone = $.trim($input.val());
        var city_name = $('#query_filter li.city_id a:not(.leader).on').text();
        if (!city_name) { city_name = $input.data('city'); }

        // 判断 city_name 是否存在
        if (!city_name) {
            layer.alert('提交失败，取法获取城市名称！');
            return false;
        }

        // 判断手机号是否填写
        if (!phone) {
            layer.tips('请填写手机号码', $input, {tips:[2,'#ffb300']});
            $input.focus().select();
            return false;
        }

        // 校验手机号码格式
        if (!/^(0|86|17951)?(1[3578]\d|14[57])[0-9]{8}$/.test(phone)) {
            layer.tips('手机号码格式不正确', $input, {tips:[2,'#ffb300']});
            $input.focus().select();
            return false;
        }

        // 搜索关键词
        if ($.trim($('input[name=keywords]').val())) {
            var keywords = $.trim($('input[name=keywords]').val());
            search_args += ['搜索关键词', keywords].join('：') + '；';
        }

        // 获取筛选条件
        $('#query_filter > li').each(function(){
            var $li = $(this), names = [];
            var title = $.trim($li.children('label').text());
            if (!title) {
                title = $.trim($li.children('strong.on').attr('title'));
            }
            $li.find('a.on').each(function(){
                var text = $.trim($(this).text());
                if (text == '不限') return true;
                names.push(text);
            });
            if (title && names.length) {
                search_args += [title, names.join('、')].join('：') + '；';
            }
        });

        // 拼装要发送的数据
        var data = {
            action: 'city_search',
            city_name: city_name,
            mobile_phone: phone,
            search_args: search_args,
        };

        $.ajax({
            url: '/index/intent', type: 'POST', dataType: 'json', data: data,
            success: function(resp, textStatus, xhr) {
                if (resp.ret == 1) {
                    $('#search_result_empty .result_image').addClass('submit_yes');
                    $('#search_result_empty .form_step1').hide('on');
                    $('#search_result_empty .form_step2').show('on');
                } else {
                    layer.alert(resp.msg);
                }
            }
        });
        return false;
    });
});

$(function(){
    // 高亮位置选项卡
    if (/^#pos=/.test(window.location.hash)) {
        var target = window.location.hash.replace('#pos=', '');
        var pos_rel = {
            a_area: 'region_id',
            business: '5b157b8cd9ac233e53fab00d9499c27b',
            subway: '388499bd46db25c10f76b051a6a2835b',
            airport: '03e91bc3c23c86160a54363f2a013ab5',
            attractions: '3f6ac5db6efad41c0688161a55ac6e0f',
            hall: '498d00b2d1314b59ce4dc27445f52488'
        };
        if (target && pos_rel[target]) {
            var $target = $('#query_filter li.location strong[target='+pos_rel[target]+']');
            if ($target.get(0)) {
                $target.trigger('click');
            }
        }
    }

    // 埋点统计
    // if (typeof(HGG) != 'undefined' && HGG.trackPage) HGG.trackPage('Hyi0oJ');
    // setTimeout(function(){
    //     if (typeof(HGG) != 'undefined' && HGG.trackEvent) HGG.trackEvent('Hyi0oJ');
    // }, 200);
});

// 查看市场参考价和vip参考价
$(function(){
    var runtime = {};

    // 注册手机号登录后回调函数
    $(document).on('login_success', function() {
        window.location.href = window.location.href;
    });

    // 查看价格按钮
    var $view_price = $('.hotel_list .meetingroom_info span.view_price');

    // 当用户没有登录时，给按钮加上 .need_mobile
    if (USER_ID == 0) {
        $view_price.each(function(){
            var $curr = $(this);
            if ($curr.hasClass('usr')) { $curr.addClass('need_mobile'); }
        });
    }

    // 查看价格按钮点击事件
    var view_price_click = function($curr) {
        if (!$curr) return;
        var meetingroom_id = $curr.data('id'), $td = $curr.parent('td');
        var action = $curr.hasClass('vip') ? 'price' : 'alldayprice';
        var query = [null, 'meetingroom', action, meetingroom_id].join('/');
        if ($curr.data('clicked')) return false;

        var showNeedVipDialog = function() {
            var $firstTigger = $($('.need_vip').get(0));
                $firstTigger.trigger('click');
        }

        var callback = {
            alldayprice: function(resp) {
                if (resp.ret == -1) { // 没有登录
                    //layer.msg('没有登录');
                } else if (resp.ret == -4) { // 账号被冻结
                    //layer.msg('您的账号被冻结');
                } else if (resp.ret == -5) { // 会议室不存在
                    //layer.msg('该会议室不存在');
                } else if (resp.ret == 1) { // 正常返回
                    // 获取返回数据并分析
                    var $span = $('<span class="show_price">').text(resp.data.allday_price);
                    $td.html('').append($span);
                    // 记录自身被点击过了
                    $curr.data('clicked', true);
                    // 所有同类按钮点一遍
                    setTimeout(function(){
                        var $other = $td.parents('table.meetingroom_info');
                        $other.find('span.view_price.usr').each(function(){
                            if ($(this).hasClass('usr') && !$(this).data('clicked')) {
                                $(this).click();
                            }
                        });
                    }, 50);
                }
            },
            price: function(resp) {
                if (resp.ret == -1) { // 没有登录
                    showNeedVipDialog();
                } else if (resp.ret == -2) { // 不是VIP
                    showNeedVipDialog();
                } else if (resp.ret == -3) { // 没有验证邮箱
                    $('#vip_need_auth_email_trigger').fancybox({
                        href: '#vip_need_auth_email',
                        showCloseButton: true,
                        hideOnOverlayClick: false,
                        scrolling: false,
                        margin: 0,
                        padding: 0,
                        onClosed: function() {
                            window.location.reload();
                        }
                    }).trigger('click');
                } else if (resp.ret == -4) { // 账号被冻结
                    $('#vip_frozen_phone').text(resp.data.phone);
                    $('#vip_frozen_trigger').fancybox({
                        href: '#vip_frozen',
                        showCloseButton: true,
                        hideOnOverlayClick: false,
                        scrolling: false,
                        margin: 0,
                        padding: 0,
                        onClosed: function() {
                            window.location.reload();
                        }
                    }).trigger('click');
                } else if (resp.ret == -5) { // 会议室不存在
                    //layer.msg('该会议室不存在');
                } else if (resp.ret == -6) { // 没有申请VIP
                    showNeedVipDialog();
                } else if (resp.ret == 1) { // 正常返回
                    // 获取返回数据并分析
                    var $span = $('<span class="show_price">').text(resp.data.vip_allday_price);
                    $td.html('').append($span);
                    // 记录自身被点击过了
                    $curr.data('clicked', true);
                    // 所有同类按钮点一遍
                    setTimeout(function(){
                        var $other = $td.parents('table.meetingroom_info');
                        $other.find('span.view_price.vip').each(function(){
                            if ($(this).hasClass('vip') && !$(this).data('clicked')) {
                                $(this).click();
                            }
                        });
                    }, 50);
                } else {
                    showNeedVipDialog();
                }
            }
        };

        $.ajax({
            url: query, type: 'GET', async : false, dataType : 'json',
            success : function(resp) {
                callback[action](resp);
                cookie('last_view_vip_price', '');
                cookie('last_view_price', '');
            }
        });
    }

    // 检查有没有遗留任务需要做
    if (USER_ID > 0) {
        var last_view_price = cookie('last_view_price');
        if (typeof(last_view_price) != 'undefined' && last_view_price > 0) {
            var $find = $('.view_price.usr[data-id='+last_view_price+']');
            if ($find.get(0)) { view_price_click($find); }
            cookie('last_view_price', '');
        }
        var last_view_vip_price  = cookie('last_view_vip_price');
        if (typeof(last_view_vip_price) != 'undefined' && last_view_vip_price > 0) {
            var $find = $('.view_price.vip[data-id='+last_view_vip_price+']');
            if ($find.get(0)) { view_price_click($find); }
            cookie('last_view_vip_price', '');
        }
    }

    // 查看价格按钮触摸和点击事件
    $view_price.mouseover(function(){
        var $curr = $(this), meetingroom_id = $curr.data('id');
        // 只存储最后触发的查看价格按钮
        if ($curr.hasClass('usr')) {
            cookie('last_view_price', meetingroom_id);
            cookie('last_view_vip_price', '');
        }
    }).click(function(){
        var $curr = $(this), meetingroom_id = $curr.data('id');
        // vip 查看价格只有在点击时记录
        if ($curr.hasClass('vip')) {
            cookie('last_view_vip_price', meetingroom_id);
            cookie('last_view_price', '');
        }
        view_price_click($curr);
        return false;
    });
});

// 页面滚动时，隐藏弹出的浮层
$(document).scroll(function(){
    $('input:focus').blur(), $('#hgg_selectbox').hide();
});

$(function() {
    $('.filter-more').on('click', function() {
        if ($('.filter-more-item').hasClass('force-hidden')) {
            $('.filter-more-item').removeClass('force-hidden');
            $.cookie('filtermore', '1', {
                path : '/',
                expires : 365
            });
            $('.js-filter-more').text('收起选项');
            $(this).find('.hggfont').removeClass('hgg-xiaojiantou_xia').addClass('hgg-up-arrow02-copy');
        } else {
            $('.filter-more-item').addClass('force-hidden');
            $.cookie('filtermore', '0', {
                path : '/',
                expires : 365
            });
            $('.js-filter-more').text('更多选项（如会场面积、容纳人数等）');
            $(this).find('.hggfont').removeClass('hgg-up-arrow02-copy').addClass('hgg-xiaojiantou_xia');
        }
    });
});
