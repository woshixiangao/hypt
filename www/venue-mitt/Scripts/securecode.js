// 安全校验码弹窗
function SecureCode() {
    this.cfg = {
        mobile: null,
        can_click_sms: true, // 能否点击获取短信验证码
        need_num_verification: false, // 是否需要数字验证码
        need_token_verification: false, // 是否需要token验证码
        dialog_open_count: 0, // 弹窗打开次数: 超过3次,显示数字验证码
        sms_btn_count: 0, // 获取短信验证码次数: 超过3次,显示数字验证码
        retry_btn_count: 0, // 重新获取次数: 超过2次,显示token验证码
        max_count: 3,
        src: null, // 页面来源
    }
}

SecureCode.prototype = {
    init: function () {
        this.__append_layer();
        this.__bind_ui();
    },
    __bind_ui: function () {
        var self = this;
        // 数字验证码
        $('.js-pic-code').click(function () {
            $(this).find('img').attr('src', '/captcha?' + (new Date()).valueOf());
        });

        // 获取短信验证码
        $('#js-get-verifycode').click(function () {
            self.get_sms();
        });

        // 发送需求
        $('#js-small-demand, #js-token-submit').click(function () {
            self.rfp_submit();
        });

        $('.js-secure-close, #js-secure-cancel').on('click', function() {
            layer.close(window.small_layer);
        })

        $('.js-token-close, #js-token-cancel').on('click', function () {
            layer.close(window.token_layer);
            self.cfg.need_token_verification = false;
        })

        $('#js-not-getcode,.js-not-get').click(function () {
            layer.close(window.small_layer);
            clearInterval(window.sms_timer);
            self.__get_token();
            window.token_layer = layer.open({
                type: 1,
                title: false,
                area: '520px',
                skin: 'small-token',
                closeBtn: 0,
                content: $('#token-layer')
            })
            self.cfg.need_token_verification = true;
        })
    },
    set_src: function (src) {
        this.cfg.src = src;
    },
    collectingDemand: function (demand) {
        demand.action = 'collectingDemand';
        $.post('/draft', demand);
    },
    verification: function (mobile) {
        if (!/^1[34578]{1}\d{9}$/.test(mobile)) {
            layer.msg('请输入手机号');
            return false;
        }
        this.cfg.mobile = mobile;
        this.cfg.need_num_verification = false;

        var mobile_deal = mobile.slice(0,3) + '-' + mobile.slice(3,7) + '-' + mobile.slice(7,11);
        $('.js-sms-notice strong').html('');
        $('.js-sms-notice strong').append(mobile_deal);
        $('.js-num-verification').hide();
        this.__is_need_num_verification(mobile);
        this.__open_secure_layer();
    },
    // 获取短信
    get_sms: function () {
        if (!this.cfg.can_click_sms) {
            return false;
        }

        this.cfg.sms_btn_count += 1;
        if (this.cfg.sms_btn_count > this.cfg.max_count) {
            this.cfg.need_num_verification = true;
            if ($('.js-num-verification').is(':hidden')) {
                $('.js-sms-notice').find('i').text('将');
                $('.js-num-verification').show();
                $('.secure-notice').hide();
                return false;
            }
        }
        var $captcha = $('#small-city-layer').find('input[name=captcha]');
        var img_code = $captcha.val();
        var self = this;

        if (this.cfg.need_num_verification) {
            $('.js-sms-notice').find('i').text('将');
            if (img_code == ''){
                layer.tips('请输入数字验证码', $captcha, {tips: 1, time: 1000});
                return false;
            }

            if (img_code.length != 5 || !/\d+/.test(img_code)) {
                layer.tips('数字验证码不正确', $captcha, {tips: 1, time: 1000})
                return false;
            }

            if (img_code.length == 5) {
                var sendData = { action: 'verifyCaptcha', mobile: this.cfg.mobile, captcha: img_code };
                $.post('/index', sendData, function(data){
                    if (data.ret != 1) {
                        layer.tips('数字验证码不正确', $captcha, {tips: 1, time: 1000})
                    }
                    if (data.ret == 1) {
                        self.__send_sms();
                        $('.secure-notice').show();
                    }
                }, 'json');
                return false;
            }
        } else {
            self.__send_sms();
        }
    },
    // 安全弹层提交
    rfp_submit: function () {
        var data = this.__get_data();
        if (window.is_small_city) {
            data.source_tags += ',auto-plunder';
        }
        data.captcha = $('#small-city-layer').find('input[name=captcha]').val();
        data.code = $('#small-city-layer').find('input[name=code]').val();

        // 表单提交检查
        if (this.cfg.need_token_verification) {
            data.source_tags = data.source_tags ? data.source_tags + ',secure_token' : 'secure_token';
            data.token = $('#js-token').html();
            if ($('input[name=token_code]').val() == '') {
                layer.tips('请输入数字码', $('input[name=token_code]'), {tips: 1, time: 1000})
                return false;
            }
            if ($('#js-token').html() != $('input[name=token_code]').val()) {
                layer.tips('数字码不正确', $('input[name=token_code]'), {tips: 1, time: 1000})
                return false;
            }
        } else {
            if (this.__check_data(data)) {
                return false;
            }
        }

        var rs = this.__submit_data(data);
        if (rs) {
            layer.close(window.small_layer);
            layer.close(window.token_layer);
        }
    },
    __get_data: function () {
        var data = null;
        if (this.cfg.src == 'lp') {
            data = lp.getData();
        }

        if (this.cfg.src == 'home') {
            data = window.getFormData($('.tabs-content.search-help'));
        }

        if (this.cfg.src == 'hotel') {
            data = window.getFormData();
        }

        if (this.cfg.src == 'planner') {
            data = window.getFormData();
        }

        return data;
    },
    __submit_data: function (data) {
        var rs = null;
        if (this.cfg.src == 'lp') {
            rs = lp.sendDemand(data);
        }

        if (this.cfg.src == 'home') {
            rs = window.formStepCityPost(data);
        }

        if (this.cfg.src == 'hotel') {
            rs = window.sendDemands(data);
        }

        if (this.cfg.src == 'planner') {
            rs = window.sendPlanner(data);
        }

        return rs;
    },
    // 是否需要数字验证码
    __is_need_num_verification: function (mobile) {
        var self = this;
        $.ajax({
            url: '/lp8?action=isNeedNumVerification&mobile=' + mobile,
            type: 'GET',
            dataType: 'json',
            async: false,
            success: function (res) {
                if (res.ret == 1) {
                    self.cfg.need_num_verification = true;
                    $('.js-num-verification').show();
                }
            }
        });
        return true;
    },
    __get_token: function () {
        $.ajax({
            url: '/lp8?action=getSecureToken&mobile=' + this.cfg.mobile,
            type: 'GET',
            dataType: 'json',
            async: false,
            success: function (res) {
                if (res.ret == 1) {
                    $('#js-token').html(res.data);
                    $('#token-layer').find('input[name=token_code]').val(res.data);
                }
            }
        })
    },
    // 打开安全验证弹窗
    __open_secure_layer: function () {
        $('#small-city-layer').find('input[name=captcha]').val('');
        $('#small-city-layer').find('input[name=code]').val('');
        clearInterval(window.sms_timer);
        $('#js-get-verifycode').removeClass('disabled');
        this.cfg.can_click_sms = true;
        this.cfg.retry_btn_count = 0; // 每次打开弹窗初始化为0
        if (this.cfg.need_num_verification) {
            $('.js-sms-notice').find('i').text('将');
        } else {
            $('.js-sms-notice').show();
        }
        $('#js-get-verifycode').show();
        $('#js-not-getcode').hide();
        window.small_layer = layer.open({
            type: 1,
            title: false,
            area: '520px',
            closeBtn: 0,
            content: $('#small-city-layer')
        })
        if (!this.cfg.need_num_verification) {
            this.cfg.dialog_open_count += 1;
            if (this.cfg.dialog_open_count > this.cfg.max_count) {
                this.cfg.need_num_verification = true;
                $('.js-sms-notice').find('i').text('将');
                $('.js-num-verification').show();
                $('.secure-notice').hide();
            } else {
                $('#js-get-verifycode').trigger('click');
                $('.secure-notice').show();
            }
        }
        this.cfg.need_num_verification ? $('#js-get-verifycode').text('获取验证码') : $('#js-get-verifycode').text('重新获取') ;
    },
    // 调用接口发短信
    __send_sms: function () {
        var sec = 59;
        var $dom = $('#js-get-verifycode');
        var self = this;
        if (!/^1[34578]{1}\d{9}$/.test(self.cfg.mobile) || !self.cfg.can_click_sms) {
            return false;
        }
        var smsData = { action: 'sendSms', mobile: self.cfg.mobile };
        $.post('/index', smsData, function(res){
            if (res.ret == 1) {
                $dom.addClass('disabled');
                self.cfg.can_click_sms = false;
                self.cfg.retry_btn_count += 1;
                window.sms_timer = setInterval(function() {
                    $dom.text(sec + 's后重新获取');
                    sec --;
                    if (sec <= 0) {
                        clearInterval(window.sms_timer);
                        $dom.text('重新获取');
                        $dom.removeClass('disabled');
                        self.cfg.can_click_sms = true;
                        $('.secure-notice').hide();
                        // 触发token弹窗
                        self.__open_token_layer();
                    }
                }, 1000);
            } else {
                return layer.msg(res.msg);
            }
        }, 'json')
    },
    // 打开token弹窗
    __open_token_layer: function () {
        if (this.cfg.retry_btn_count > 0) {
            if ($('input[name=code]').val()) {
                $('#js-get-verifycode').hide();
                $('#js-not-getcode').show();
            } else {
                layer.close(window.small_layer);
                this.__get_token();
                window.token_layer = layer.open({
                    type: 1,
                    title: false,
                    area: '520px',
                    skin: 'small-token',
                    closeBtn: 0,
                    content: $('#token-layer')
                });
                this.cfg.need_token_verification = true;
                return false;
            }
        }
    },
    // 检测数据
    __check_data: function () {
        var $captcha = $('#small-city-layer').find('input[name=captcha]');
        var $sms_code = $('#small-city-layer').find('input[name=code]');
        var img_code = $.trim($captcha.val());

        if (this.cfg.need_num_verification) {
            if (img_code == '') {
                layer.tips('请输入数字验证码', $captcha, {tips: 1, time: 1000});
                return true;
            } else {
                var flag = false;
                var sendData = { action: 'verifyCaptcha', mobile: this.cfg.mobile, captcha: img_code };
                $.ajax({
                    url: '/index',
                    type: 'POST',
                    data: sendData,
                    dataType: 'json',
                    async: false,
                    success: function (data) {
                        if (data.ret != 1) {
                            layer.tips('数字验证码不正确', $captcha, {tips: 1, time: 1000})
                            flag = true;
                        }
                    }
                });
                if (flag) {
                    return true;
                }
            }
        }

        if ($sms_code.val() == '') {
            layer.tips('请输入短信验证码', $sms_code, {tips: 1, time: 1000});
            return true;
        }

        return false;
    },
    // append弹窗dom
    __append_layer: function () {
        var css = '<style>\
                .small-city { width: 520px; padding: 0; text-align: center; background: #fff; }\
                .small-city .required {margin-right: 4px;color: #ee2b2a;}\
                .small-city .title { position: relative; padding: 10px 16px; text-align: left; border-bottom: 1px solid #e6e6e6; }\
                .small-city .title h3 { font-size: 14px; line-height: 26px; font-weight: bold; color: #666; }\
                .small-city .title .small-close { position: absolute; right: 16px; top: 50%; width: 20px; height: 20px; margin-top: -10px; }\
                .small-city .title .small-close .hgg-cha { display: inline-block; width: 20px; height: 20px; line-height: 20px; font-size: 20px; text-align: center; color: #b2b2b2; }\
                .small-city .title .small-close:hover .hgg-cha { color: #929292; }\
                .small-city .content { padding: 32px 40px; }\
                .small-city .small-notice { padding: 8px 12px; text-align: left; font-size: 14px; color: #ff9800; line-height: 24px; border: 1px solid #fed886; background: #fffff6; }\
                .small-city .small-notice strong { margin: 0 4px; color: #333; }\
                .small-city .form-group { margin-top: 16px; padding-left: 96px; }\
                .small-city .form-title { width: 96px; margin: 10px 0 10px -96px; text-align: left;}\
                .small-city .form-details { width: 100%; }\
                .small-city .form-message .form-field { height: 40px; padding: 10px 12px; padding-right: 78px; }\
                .small-city .form-message .btn { position: absolute; right: 1px; top: 1px; padding: 9px 14px; color: #666; font-size: 12px; line-height: 20px; border-color: #ddd; border-width: 0 0 0 1px; border-radius: 0; background: #f4f4f4;}\
                .small-city .form-message .disabled { border-color: #ddd; background: #ddd; color: #b2b2b2; cursor: default;}\
                .small-city .form-captcha .captcha-box-small { padding-top: 12px; }\
                .small-city .form-captcha .captcha-box-small img { left: -97px; width: 80px; height: 38px; }\
                .small-city .form-btn { margin-top: 0; padding: 12px 16px; border-top: 1px solid #e6e6e6; text-align: right; }\
                .small-city .form-btn .btn { margin-left: 4px; padding: 6px 22px; font-size: 14px; line-height: 20px; border: none; }\
                .small-city .form-btn .btn-solid-gray { color: #333; background: none; border: 1px solid #ddd; }\
                .small-city .form-btn .btn-solid-gray:hover { background: #f4f4f4; }\
                .small-city .secure-notice { margin-top: 8px; text-align: right; font-size: 12px; color: #999; line-height: 16px; }\
                .small-city .secure-notice i.hgg-gou_yuan { display: inline-block; width: 16px; height: 16px; margin-right: 2px; line-height: 16px; text-align: center; color: #48d2a0; vertical-align: top; font-size: 16px; }\
                \
                .small-city .form-btn .not-get {font-size:12px; color:#0067ff;float: left; margin: 12px 0 0 20px;text-decoration: underline;}\
                .small-token .small-city { width: 520px; text-align: center; background: #fff;}\
                .small-token .content { padding: 32px 40px; }\
                .small-token .small-notice { padding: 0; font-size: 14px; color: #333; line-height: 20px; background: none; border: none; }\
                .small-token .form-group { padding-left: 0; }\
                .small-token .form-group .token-num { top: 50%; right: 0; margin-top: -12px; padding: 0 26px; font-size: 18px; line-height: 24px; border-left: 1px solid #e6e6e6; color: #48d2a0; background: none; }\
                .small-token .form-group .captcha-change { position: absolute; right: 0; top: 50%; margin-top: -9px; font-size: 12px; color: #207bee; line-height: 18px; }\
                .small-token .form-btn .btn { padding: 8px 44px; }\
            </style>';
        var smallCityLayer = css + '<div id="small-city-layer" class="dn">\
                <div class="small-city">\
                    <div class="title">\
                        <h3>安全验证</h3>\
                        <a href="javascript:;" class="small-close js-secure-close">\
                            <i class="hggfont hgg-cha"></i>\
                        </a>\
                    </div>\
                    <div class="content">\
                        <div class="small-notice js-sms-notice">短信验证码<i>已</i>发送到你<strong></strong>手机上</div>\
                        <div class="form-group form-message js-num-verification dn">\
                            <label class="form-title"><strong class="required">*</strong>数字验证码</label>\
                            <div class="form-details">\
                                <label class="form-block form-captcha">\
                                    <input type="text" class="form-field" name="captcha">\
                                    <span class="captcha-box captcha-box-small js-pic-code">\
                                        <img src="/captcha" id="captcha">\
                                        <a href="javascript:;">换一张</a>\
                                    </span>\
                                </label>\
                            </div>\
                        </div>\
                        <div class="form-group">\
                            <label class="form-title"><strong class="required">*</strong>短信验证码</label>\
                            <div class="form-details">\
                                <label class="form-block form-message js-form-message">\
                                    <input type="text" class="form-field" name="code" placeholder="请输入短信验证码">\
                                    <a href="javascript:;" class="btn" id="js-get-verifycode">获取验证码</a>\
                                    <a href="javascript:;" class="btn" id="js-not-getcode">验证码收不到？</a>\
                                </label>\
                            </div>\
                        </div>\
                        <p class="secure-notice dn"><i class="hggfont hgg-gou_yuan"></i>短信验证码已发送，请查收</p>\
                    </div>\
                    <div class="form-btn">\
                        <a href="javascript:;" class="btn btn-small btn-solid-gray" id="js-secure-cancel">取消</a>\
                        <a href="javascript:;" class="btn btn-small" id="js-small-demand">确定</a>\
                        <a href="javascript:;" class="not-get js-not-get">验证码收不到？</a>\
                    </div>\
                </div>\
            </div>\
            <div id="token-layer" class="dn">\
                <div class="small-city">\
                    <div class="title">\
                        <h3>安全验证</h3>\
                        <a href="javascript:;" class="small-close js-token-close">\
                            <i class="hggfont hgg-cha"></i>\
                        </a>\
                    </div>\
                    <div class="content">\
                        <div class="small-notice">无法收到短信验证码？输入以下数字即可</div>\
                        <div class="form-group">\
                            <div class="form-details">\
                                <label class="form-block form-message">\
                                    <input type="text" class="form-field" name="token_code" placeholder="请输入右侧数字">\
                                    <a href="javascript:;" class="btn token-num" id="js-token"></a>\
                                </label>\
                            </div>\
                        </div>\
                    </div>\
                    <div class="form-btn">\
                        <a href="javascript:;" class="btn btn-small btn-solid-gray" id="js-token-cancel">取消</a>\
                        <a href="javascript:;" class="btn btn-small" id="js-token-submit">确定</a>\
                    </div>\
                </div>\
            </div>';
        $('body').append(smallCityLayer);
    },
}

secureCode = new SecureCode();
secureCode.init();
