// 查看档期和报价
;(function($){
    // 插件内部全局公共存储
    var runtime = {
        // 弹层唯一DOM结构ID
        dialogId: '#sendrfp_dialog',
        // 列表页统计点定义
        listPage: {
            sendRfpClick: 'Mx56jk',
            sendRfpSubmit: 'J9v5pS',
            sendRfpSuccess: 'D3Hj89',
            sendRfpFailed: 'S2Ijk4'
        },
        // 详情页统计点定义
        detailPage: {
            sendRfpClick: 'Gfd5l9',
            sendRfpSubmit: 'Kmlfg4',
            sendRfpSuccess: 'd3f8tm',
            sendRfpFailed: 'Ps9uVz'
        }
    };

    // 判断当前页面是列表页还是详情页
    var isListPage = function() {
        var path = location.pathname;
        if (path && /^\/venue\//.test(path)) { return true; }
        return false;
    }

    // 获取事件ID
    var getEventID = function(action) {
        if (!action) return null;
        var itemName = isListPage() ? 'listPage' : 'detailPage';
        var object = runtime[itemName] ? runtime[itemName] : null;
        if (object && object[action]) { return object[action]; }
        return null;
    }

    // 统计对象中单元个数
    var countObjectSize = function(obj) {
        var count = 0;
        $.each(obj, function(){ count++; });
        return count;
    }

    // 开始日期回调
    window.startDateSelected = function($handle){
        var className = '.form-group.form-group-level';
        var $parents = $handle.parents(className);
        var $next = $parents.next(className);

        window.endPicker.setMinDate(new Date($('.js-start-date').val()));
        window.endPicker.gotoDate(new Date($('.js-start-date').val()));

        var endDate = $('.js-start-date').val();
        if ($next.get(0)) {
            $next.find('input[type="text"]').val(endDate).trigger('click');
        }
    }

    // 结束日期回调
    window.endDateSelected = function($handle){
        var className = '.form-group-row';
        var $parents = $handle.parents(className);
        var $next = $parents.next(className);
        var $sub = $next.find('.form-group.form-group-level').first();

        if ($sub.get(0)) {
            var $input = $sub.find('input[type="text"]');
            if (!$input.val()) {
                $input.trigger('click');
            }
        }
    }

    // 会议需求回调
    window.peopleNumSelected = function($handle){
        var className = '.form-group.form-group-level';
        var $parents = $handle.parents(className);
        var $next = $parents.next(className);
        if ($next.get(0)) {
            $next.find('input[type="text"]').trigger('click');
        }
    }

    // 点击询价按钮
    var bunClickEvent = function () {
        var $btn = $(this), prop = $btn.data();
        if (!$btn.get(0)) return false;
        // 添加酒店信息到运行时中
        runtime.hotel_info = { id: prop.hotel_id, title: prop.hotel_name };
        // 添加会议厅信息
        if (prop.room_id && prop.room_name) {
            var mroom_obj = {}; mroom_obj[prop.room_id] = prop.room_name;
            runtime.hotel_info['meetingroom'] = mroom_obj;
        }

        // 统计埋点
        if (typeof(HGG) != 'undefined' && HGG.trackEvent) {
            HGG.trackEvent(getEventID('sendRfpClick'));
        }
        // 检查是否已经通知过酒店
        if ($btn.hasClass('sent')) {
            var tip = '已通知过该酒店报价，是否有其它会议需要该酒店再次报价？';
            layer.confirm(tip, {title: false, closeBtn: false, btn: ['是，有其它会议', '取消']}, function(index){
                layer.close(index); createDialogForm($btn, prop, true);
            });
            return false;
        }
        return createDialogForm($btn, prop);
    }

    $('body').on('click', '.item_block_item_edit', function() {
        createDialogForm($(this), $(this).data(), true)
    });

    //数字验证码更改
    $(document).on('click', '.js-pic-code', function () {
        $(this).find('img').attr('src', '/captcha?' + (new Date()).valueOf());
    });

    // 展示提交询价单表单
    var createDialogForm = function ($trigger_button, prop, editable) {
        // 引用触发按钮对象
        runtime.trigger_button = $trigger_button;
        // 获取最后的询价单
        getLastRfpData(function(data){
            // 表单默认填充值
            var default_data = {
                hotels: prop.hotel_id
            };

            if ($.trim(prop.room_id) && $.trim(prop.hotel_id)) default_data[choose_meetingroom] = [prop.hotel_id, prop.room_id].join(':');

            // 使用旧数据填充
            if (data && data.start_date) {
                if (data.tel_call) { default_data.tel_call = data.tel_call; }
                if (data.start_date) { default_data.start_date = data.start_date; }
                if (data.end_date) { default_data.end_date = data.end_date; }
                if (data.people_num) { default_data.people_num = data.people_num; }
                if (data.contact_name) { default_data.contact_name = data.contact_name; }
                if (data.meetingroom) { default_data.meetingroom = data.meetingroom; }
                if (data.meetingroom_budget) { default_data.meetingroom_budget = data.meetingroom_budget; }
                if (data.guestroom) { default_data.guestroom = data.guestroom; }
                if (data.catering) { default_data.catering = data.catering; }
                if (data.teabreak) { default_data.teabreak = data.teabreak; }
                if (data.other_requirements) {
                    default_data.other_requirements = data.other_requirements;
                }
            }

            var $dialog = createDialog(default_data, editable);

            // 生成弹层，并将索引存储起来
            runtime.dg_index = layer.open({
                type: 1, title: '免费查档期和报价', area: ['auto'],
                content: $dialog, end: function(index) {
                    // 关闭弹层同时销毁dialog
                    $('#sendlist').remove(), $(runtime.dialogId).remove();
                    $('#layui-layer'+runtime.dg_index).remove();
                }
            });

            // 默认设置会议日期为当前日期的后7天
            if (typeof(window.default_start_date) != 'undefined') {
                var $input = $dialog.find('input[name="start_date"]');
                if (!$input.val()) {
                    //$input.val(window.default_start_date);
                }
            }
        });
    }

    // 创建DOM
    var createDialog = function(data, editable) {
        var $dialog = $(runtime.dialogId);

        if (!$dialog.get(0)) {
            $dialog = $($('#js-new-offer').html());

            // 给弹层绑定ID（去掉第一个#字符）
            $dialog.attr('id', runtime.dialogId.substr(1));

            // 绑定日期选择器和下拉选择器组件
            bindDateBox($dialog), bindSelectBox($dialog);
            window.endPicker.setMinDate(new Date(data.start_date));

            // 绑定确定按钮点击事件
            $dialog.find('button.ok').click(function(){
                var data = getFormData();

                if (!data.start_date) {
                    var $input = $dialog.find('input[name=start_date]');
                    // layer.tips('会议开始日期必填', $input, {tips:[2,'#ffb300']});
                    $input.trigger('click');
                    return false;
                }

                if (data.start_date && data.end_date && data.start_date > data.end_date) {
                    var $input = $dialog.find('input[name=start_date]');
                    layer.tips('会议开始日期不能晚于结束日期', $input, {tips:[2,'#ffb300']});
                    $input.focus().select();
                    return false;
                }

                if (!data.people_num) {
                    var $input = $dialog.find('input[name=people_num]');
                    // layer.tips('参会人数必填', $input, {tips:[2,'#ffb300']});
                    $input.trigger('click');
                    return false;
                }

                // 校验手机号码格式
                if (!data.tel_call || !/^(0|86|17951)?(1[3578]\d|14[57])[0-9]{8}$/.test(data.tel_call)) {
                    var $input = $dialog.find('input[name=tel_call]');
                    layer.tips('请填写正确的手机号', $input, {tips:[2,'#ffb300']});
                    $input.focus().select();
                    return false;
                }

                window.is_small_city = isSmallCity(data.hotels) ? true : false;
                if (window.is_login) {
                    window.sendDemands(data);
                } else {
                    secureCode.set_src('hotel');
                    secureCode.verification(data.tel_call);
                }
            });

            $dialog.appendTo($('body'));
        }

        // 可以设置初始值
        if (data && !$.isEmptyObject(data)) {
            $dialog = setFormData($dialog, data);
        }

        // 设置表单是否可编辑
        $dialog = setEditable($dialog, editable);

        $dialog.find('.send_success_qrcode').hide();
        $dialog.find('form').show();

        return $dialog;
    }

    // 判断是否小城市
    var isSmallCity = function (hotel_id) {
        var flag = false;
        var small_data = {
            action: 'isSmallCityByHotelId',
            hotel_id: hotel_id
        };
        $.ajax({
            url: '/landingpage',
            type: 'GET',
            data: small_data,
            dataType: 'json',
            async: false,
            success: function (res) {
                if (res.ret == 1) {
                    flag = true;
                }
            }
        });
        return flag;
    };

    // 发送rfp
    window.sendDemands = function (data) {
        var $dialog = $(runtime.dialogId);
        var method = getAjaxMethodByData(data);
        var $btn = runtime.trigger_button;
        // 发送 RFP
        var loading = layer.load(2);
        var flag = false;
        sendRfpData(data, method, function(resp, textStatus, xhr) {
            // 统计埋点
            if (typeof(HGG) != 'undefined' && HGG.trackEvent) {
                HGG.trackEvent(getEventID('sendRfpSuccess'));
            }
            layer.close(loading)
            // 创建订单行为，移除其他按钮的 sent 标记
            if (method == 'POST') {
                $('button.send_rfp.sent').text('查档期和报价').removeClass('sent');
                window.sent_hotel = {};

                if (resp.ret == 0 && resp.data) {
                    flag = true;
                    window.keepEntering = resp.data;
                    setTimeout(function(){
                        addSentHotelList(runtime.hotel_info);
                        layer.close(loading);
                        (window.isSupportVue() && window.keepEntering.need_keep_entering) ? demandHook($dialog, resp.data) : showSuccessQRcode($dialog, resp.data);
                        $btn.addClass('sent').text('等待酒店报价');
                        $dialog.removeClass('view_model');
                        $dialog.find('.cover_block').remove();
                    }, 80);
                } else {
                    runtime.lastRfpData = null;
                    if (resp.error) {
                        layer.msg(resp.error);
                    }

                    if (resp.msg) {
                        layer.msg(resp.msg);
                    }
                }
            }

            // 修改订单行为，显示已通知酒店
            if (method == 'PUT') {
                if (resp.ret == 1) {
                    layer.msg(resp.msg);
                    return false;
                }
                flag = true;
                setTimeout(function(){
                    addSentHotelList(runtime.hotel_info);
                    layer.close(runtime.dg_index), layer.msg(resp.msg);
                    $btn.addClass('sent').text('等待酒店报价');
                    $dialog.removeClass('view_model');
                    $dialog.find('.cover_block').remove();
                }, 80);
            }

        });

        // 统计埋点
        if (typeof(HGG) != 'undefined' && HGG.trackEvent) {
            HGG.trackEvent(getEventID('sendRfpSubmit'));
        }

        return flag;
    }

    // 添加酒店信息到已发送酒店列表中
    var addSentHotelList = function(obj) {
        if (typeof(window.sent_hotel) != 'undefined') {

            if (obj && obj.id && obj.title) {
                // 会议厅信息累加
                if (typeof(window.sent_hotel[obj.id]) != 'undefined') {
                    var mroom = window.sent_hotel[obj.id].meetingroom;
                    if (mroom) {
                        obj.meetingroom = $.extend(mroom, obj.meetingroom);
                    }
                }
                window.sent_hotel[obj.id] = obj; // 保存酒店以及会议厅信息

                var count = countObjectSize(window.sent_hotel);
                var $target = $(runtime.dialogId+' .view_count strong');
                $target.text(count);
            }
        }
    }

    // 展示或隐藏已发送的酒店详情列表
    var toggleSentInfo = function() {
        var $dialog = $(runtime.dialogId);
        var size = {
            width: $dialog.outerWidth(), height: $dialog.outerHeight()
        };

        var $sendlist = $('#sendlist');
        if (!$sendlist.get(0)) {
            var $subdom = showSentHotelDetailDialog(true);
            var $rollback = $('<span class="rollback"><i class="i">&#xe603;</i>返回会议需求</span>');
            // 点击【返回会议需求】按钮
            $rollback.click(function(){
                layer.title('查档期和报价', runtime.dg_index);
                $dialog.animate({marginLeft: 0}, 500);
                $sendlist.animate({left: size.width}, 500, function(){
                    $dialog.parent('.layui-layer-content').css({width: 'auto', height: 'auto'}).css({overflow: 'visible'});
                    $sendlist.remove();
                });
            });
            $subdom.prepend($rollback);
            $sendlist = $('<div id="sendlist">').css(size).css({position:'absolute', top: 0, left: size.width});
            $sendlist.append($subdom);
            $dialog.after($sendlist);
        }

        layer.title('已通知以下酒店报价', runtime.dg_index);
        $dialog.parent('.layui-layer-content').css(size).css({overflow: 'hidden'});
        $dialog.animate({marginLeft: -parseInt(size.width)}, 500);
        $sendlist.animate({left: 0}, 500);
    }

    // 展示已发送的酒店详情列表
    var showSentHotelDetailDialog = function(justgethtml) {
        if (typeof(window.sent_hotel) != 'undefined') {
            var $list = $('<ul class="sent_hotel_list">');
            $.each(window.sent_hotel, function(hotel_id, detail) {
                var href = '/view-'+hotel_id+'.html';
                var $a = $('<a>').attr({href: href, target: '_blank'}).text(detail.title);
                var $li = $('<li>').append($a);
                if (detail.meetingroom) {
                    var $div = $('<div>');
                    $.each(detail.meetingroom, function(mid, name){
                        $div.append($('<span>').text(name));
                    });
                    $li.append($div);
                }
                $list.append($li);
            });

            // 如果明确指出需要返回 html，则返回 JQDOM 对象
            if (justgethtml) { return $list; }

            layer.open({
                title: '已通知以下酒店报价', btn: false, padding: 10, area: ['auto'],
                content: $list.prop('outerHTML')
            });
        }
    }

    // 根据新老数据是否相同，和是否已经发送过判断请求方法
    var getAjaxMethodByData = function (data) {
        var $btn = runtime.trigger_button;
        var method = $btn.hasClass('sent') ? 'PUT' : 'POST';
        var is_same = isSameRfpSendData(data);
        if (method == 'POST' && is_same) {
            method = 'PUT';
        } else if (method == 'PUT' && !is_same) {
            method = 'POST';
        }
        return method;
    }

    // 判断数据是否和最后提交的RfP数据相同
    var isSameRfpSendData = function (data) {
        if (typeof(runtime.lastRfpData) == 'undefined') return false;
        if (!runtime.lastRfpData) return false;
        var old = runtime.lastRfpData;
        if (old.start_date == data.start_date
            && old.meetingroom_budget == data.meetingroom_budget
            && old.people_num == data.people_num
            && old.tel_call == data.tel_call
            && (old.guestroom ? old.guestroom : false) == (data.guestroom ? data.guestroom : false)
            && (old.catering ? old.catering : false) == (data.catering ? data.catering : false)
            && (old.teabreak ? old.teabreak : false) == (data.teabreak ? data.teabreak : false)
            && (old.meetingroom ? old.meetingroom : false) == (data.meetingroom ? data.meetingroom : false)
            && old.other_requirements == data.other_requirements) {
            return true;
        }
        return false;
    }

    // 设置表单预览模式和编辑模式
    var setEditable = function($dialog, editable) {
        // 如果没有设置编辑模式，且无旧数据，则起用初始模式
        if (typeof(editable) == 'undefined' && typeof(runtime.lastRfpData) == 'undefined') {
            return $dialog;
        }
        var $viewMode = $dialog.find('.view-mode'),
            $form = $dialog.find('form'),
            $goEdit = $dialog.find('.go-edit-mode');
        if (editable !== true) {
            $form.addClass('force-hidden');
            $viewMode.removeClass('force-hidden');
            $goEdit.on('click', function() {
                $form.removeClass('force-hidden');
                $viewMode.addClass('force-hidden');
            });

        } else {
            $form.removeClass('force-hidden');
            $viewMode.addClass('force-hidden');
        }

        return $dialog;
    }

    // 预览模式下多选项处理
    var setCheckBoxView = function ($dialog) {
        var has_checked = false, $parent_p = false;
        $dialog.find('form > p input[type="checkbox"]').each(function(){
            var $checkbox = $(this), $label = $checkbox.parent('label');
            if (!$parent_p) {
                $parent_p = $checkbox.parents('p');
            }
            if ($checkbox.is(':checked')) {
                has_checked = true;
                if (!$label.find('span').get(0)) {
                    $label.prepend('<span>需要</span>');
                }
                $label.addClass('exp');
                $checkbox.hide();
            } else {
                $label.removeClass('exp');
                $label.hide();
            }
        });
        if (!has_checked && $parent_p.get(0)) {
            $parent_p.next('p').css({position: 'relative', top: -($parent_p.outerHeight()+10)});
            $parent_p.next('p').next('p').css({position: 'relative', top: -($parent_p.outerHeight()+10)});
            $parent_p.next('p').next('p').next('p').css({position: 'relative', top: -($parent_p.outerHeight()+10)});
            $parent_p.css({visibility: 'hidden'});
        }
        $dialog.find('label.item.exp').last().removeClass('exp');
        return $dialog;
    }

    // 撤销预览模式下多选项处理
    var unsetCheckBoxView = function ($dialog) {
        var $parent_p = false;
        $dialog.find('form > p input[type="checkbox"]').each(function(){
            var $checkbox = $(this), $label = $checkbox.parent('label');
            if (!$parent_p) {
                $parent_p = $checkbox.parents('p');
            }
            $checkbox.show();
            $label.find('span').remove();
            $label.show();
        });
        if ($parent_p.get(0)) {
            $parent_p.next('p').css({position: 'static', top: 0});
            $parent_p.next('p').next('p').css({position: 'static', top: 0});
            $parent_p.next('p').next('p').next('p').css({position: 'static', top: 0});
            $parent_p.css({visibility: 'visible'});
        }
        return $dialog;
    }

    // 获取当前用户最后提交的询价单数据
    var getLastRfpData = function(callback) {
        var hasCallback = typeof(callback) == 'function';
        if (typeof(runtime.lastRfpData) == 'undefined') {
            var time = new Date().getTime();
            $.ajax({
                url: '/venue', type: 'GET', dataType: 'json', data: {t:time, act: 'get_user_lastrfp', from: 'list'},
                success: function(resp, textStatus, xhr) {
                    if (resp && resp.ret == 0 && resp.msg == 'success') {
                        runtime.lastRfpData = resp.data;
                    }
                    if (hasCallback) {
                        var data = resp && resp.data ? resp.data : null;
                        callback(data);
                    }
                }
            });
        } else {
            if (hasCallback) {
                callback(runtime.lastRfpData);
            }
        }
        return true;
    };

    var demandHook = function($dialog, data) {
        var form_data = getFormData();
        hggtrack.track('list-detail', {
            'action': '打开优化弹出窗'
        })
        window.showHookDialog();

        $('#customer_service .js-service-wait, #customer_service .close-btn').click(function (){
            hggtrack.track('list-detail', {
                'action': '我愿意等待'
            })
            layer.closeAll();
            showSuccessQRcode($dialog, data);
        });

        $('#customer_service .js-step-perfect').click(function(){
            hggtrack.track('list-detail', {
                'action': '完善信息'
            })
        })
    }

    // 提交成功后展示二维码
    var showSuccessQRcode = function($dialog, data) {
        var form_data = getFormData();

        layer.closeAll();
        var layerQrcode = layer.open({
            type: 1,
            title: false,
            closeBtn: 0,
            area: '624px',
            content: $('#js-offer-success').html(),
            success: function () {
                $('#layui-layer' + layerQrcode).find('.layui-layer-content').css({'overflow': 'hidden'});
                // 更新数据
                if (data.qrcode_img) {
                    $('.submit-success').find('img').attr('src', data.qrcode_img);
                }
            }
        });

        //判断是否绑定二维码
        $(document).on('click', '.js-focus-close', function(){
            isBindWechat(form_data.tel_call);
        });
    }

    // 获取表单数据
    window.getFormData = function() {
        var data = {}, $dialog = $(runtime.dialogId);

        $dialog.find('[name]').each(function(){
            var val = $(this).val(), key = $(this).attr('name');
            data[key] = val;
        });

        var $checked = $dialog.find('input[type=checkbox]');
        $checked.each(function(){
            var key = $(this).attr('name');
            if (!$(this).is(':checked')) {
                delete data[key];
            }
        });

        return data;
    }

    // 绑定微信二维码
    $(document).on('click', '.js-nofocus .close', function(){
        layer.closeAll();
        window.location.reload();
    });

    var ajax_status = false;
    var isBindWechat = function (mobile) {
        if (is_login) {
            if (is_bind) {
                layer.closeAll();
                window.location.reload();
            } else {
                $('.js-focus-default').hide();
                $('.js-nofocus').show();
            }
            return false;
        }

        var form_data = {
            action: 'isBindWechat',
            mobile: mobile
        };

        if (ajax_status) return false;
        ajax_status = true;
        $.ajax({
            url: '/leadsmarket/major',
            type: 'GET',
            dataType: 'json',
            data: form_data,
            success: function (data) {
                ajax_status = false;
                $('.js-focus-default').hide();
                if (data.ret == 1) {
                    layer.closeAll();
                    window.location.reload();
                } else {
                    $('.js-nofocus').show();
                }

            },
            error: function (xhr, status, err) {
                ajax_status = false;
                $('.js-focus-default').hide();
                $('.js-nofocus').show();
            }

        })
    }

    // 填充表单数据
    var setFormData = function($dialog, data) {
        if (!data || $.isEmptyObject(data)) {
            return $dialog;
        }
        var demands = [];

        $.each(data, function(k, v) {
            var $target = $dialog.find('[name='+k+']');
            if (!$target.get(0)) { return true; }
            if ($target.is('input[type=checkbox]')) {
                $target.prop('checked', 'checked');
                demands.push(v);
            } else if (k == 'start_date') {
                var dateRange = v + (data.end_date ? (' ~ ' + data.end_date) : '');
                $('.js-view-' + k).html(dateRange.replace(/(\d{4})-(\d{2})-(\d{2})/g, '$1年$2月$3日'));
                $target.val(v);
            } else {
                $target.val(v);
                $('.js-view-' + k).html(v || '无');
            }
        });

        $('.js-view-demands').html(demands.join('、'));
        return $dialog;
    }

    // 日期选择器
    var bindDateBox = function ($dialog) {
        $dialog.find('input.datepicker').each(function(){

        });

        var now = new Date();
        var dft = new Date();
        dft.setDate(dft.getDate() + 7);

        var dayStr = [now.getFullYear(), (now.getMonth() + 1), now.getDate()].join('-');
        var dft_day = [dft.getFullYear(), (dft.getMonth() + 1), dft.getDate()].join('-');

        var $startDate = $dialog.find('.datepicker[name=start_date]'),
            $endDate = $dialog.find('.datepicker[name=end_date]');

        window.startPicker = null;
        window.endPicker = null;

        window.startPicker = new Pikaday({
            field: $startDate.get(0),
            firstDay: 1,
            minDate: new Date(dayStr),
            maxDate: new Date('2020-12-31'),
            yearRange: [2000, 2020],
            defaultDate: new Date(dft_day),
            // 修正弹层位置
            onOpen: function() {
                var $pickerbox = $(startPicker.el);
                var pos = $startDate.offset();
                pos.top += $startDate.outerHeight();
                $pickerbox.css(pos);
            },
            // 触发下一项弹层
            onSelect: function(selectDate) {
                var callFuncName = $startDate.attr('callback');

                var timeStamp = (new Date(now.getFullYear(), now.getMonth(), now.getDate())).getTime() / 1000;
                var selectDateTime = selectDate.getTime() / 1000;
                if (timeStamp > selectDateTime) {
                    layer.msg('日期不能早于今天');
                    return false;
                }

                if ($startDate && callFuncName && typeof(window[callFuncName]) == 'function') {
                    setTimeout(function(){
                        window[callFuncName]($startDate);
                    }, 50);
                }
            },
            i18n: {
                previousMonth : '上月',
                nextMonth     : '下月',
                months        : '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
                weekdays      : '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
                weekdaysShort : '日_一_二_三_四_五_六'.split('_')
            }
        });

        window.endPicker = new Pikaday({
            field: $endDate.get(0),
            firstDay: 1,
            minDate: new Date(dayStr),
            maxDate: new Date('2020-12-31'),
            yearRange: [2000, 2020],
            defaultDate: new Date(dft_day),
            // 修正弹层位置
            onOpen: function() {
                var $pickerbox = $(endPicker.el);
                var pos = $endDate.offset();
                pos.top += $endDate.outerHeight();
                $pickerbox.css(pos);
            },
            // 触发下一项弹层
            onSelect: function(selectDate) {
                var callFuncName = $endDate.attr('callback');
                var timeStamp = (new Date(now.getFullYear(), now.getMonth(), now.getDate())).getTime() / 1000;
                var selectDateTime = selectDate.getTime() / 1000;
                if (timeStamp > selectDateTime) {
                    layer.msg('日期不能早于今天');
                    return false;
                }
                if ($endDate && callFuncName && typeof(window[callFuncName]) == 'function') {
                    window[callFuncName]($endDate);
                }
            },
            i18n: {
                previousMonth : '上月',
                nextMonth     : '下月',
                months        : '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
                weekdays      : '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
                weekdaysShort : '日_一_二_三_四_五_六'.split('_')
            }
        });
    }

    // 下拉框选择器
    var bindSelectBox = function ($dialog) {
        $dialog.find('input.selectbox').selectbox({
            befor_run: function(){
                $('.pop_city_box,#hgg_selectbox').hide();
            },
            onSelect: function($handle){
                var callFuncName = $handle.attr('callback');
                if ($handle && callFuncName && typeof(window[callFuncName]) == 'function') {
                    window[callFuncName]($handle);
                }
            }
        });
    }

    // 执行 AJAX 发送
    var sendRfpData = function (data, method, callback) {
        runtime.lastRfpData = data;

        // 打 source_tags
        if (window.source_tags) {
            data.source_tags = data.source_tags ? data.source_tags + ',' + window.source_tags : window.source_tags;
        }

        $.ajax({
            url: '/sendrfp', type: method, dataType: 'json', data: data, async: false,
            error: function(xhr) {
                layer.closeAll();
                if (typeof(HGG) != 'undefined' && HGG.trackEvent) {
                    HGG.trackEvent(getEventID('sendRfpFailed')); // 统计埋点
                }
                layer.alert('操作失败，如需帮助请联系客服：4008-213-148');
                return false;
            },
            success: function(resp, textStatus, xhr) {
                if (resp.ret < 0 && resp.msg == 'need_verification_code') {
                    // 弹窗要求你确认身份输入验证码
                    layer.open({
                        type: 2,
                        title: resp.data.title,
                        shadeClose: true,
                        shade: 0.8,
                        area: ['380px', '200px'],
                        content: resp.data.redirect,
                        close: false
                    });
                    // 注册一个验证成功后的回调函数
                    window.verificationSuccess = function() {
                        return $('#sendrfp_dialog div.view-mode-footer button').trigger('click');
                    };
                    return false;
                }
                return callback(resp, textStatus, xhr);
            }
        });
        return true;
    }

    $.fn.extend({
        sendrfp: function(args) {
            var $all = this, option = { };

            if (typeof args == 'object') {
                option = $.extend(option, args);
            }

            return $all.each(function(){
                var $button = $(this);
                $button.click(bunClickEvent);
                return this;
            });
        }
    });
})(jQuery);