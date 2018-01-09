// 获取手机验证码
var is_hotelgg_get_mobile_code_ing = 0;

/**
 * @param mobile_input 手机号码输入框的id
 * @param mobile_button 获取短信验证码按钮的id
 * @param mobile_button_class 发送验证码后按钮的样式名
 * @param captcha 数字验证码输入框的id
 * @param img_captcha 数字验证码图片的id
 * @param captcha_box 数字验证码外框id
 * @param type 手机短信验证码用途
 */
function send_mobile_auth_code(mobile_input, mobile_button, mobile_button_class, captcha, img_captcha, captcha_box, type) {
    if (is_hotelgg_get_mobile_code_ing)
        return false;

    var data = {};
    
    var mobile = $.trim($('#' + mobile_input).val());
    
    if (!/^(0|86|17951)?(1[3578]\d|14[57])[0-9]{8}$/.test(mobile)) {
        window.alert('手机号码无效');
        return false;
    }
    
    data['mobile'] = mobile;
    data['type'] = type;
    
    // 如果需要验证数字验证码
    //if (captcha != undefined && $('#' + captcha).length) {
    if (captcha != '' && $('#' + captcha).length && !$('#'+captcha_box).is(':hidden')) {
        var captcha = $.trim($('#' + captcha).val());
        
        if (!captcha) {
            window.alert('请输入数字验证码');
            return false;
        }
        
        data['captcha'] = captcha;
    }
    
    $('#' + mobile_button).addClass(mobile_button_class);
    
    is_hotelgg_get_mobile_code_ing = 1;

    $.ajax({
        url: '/mobile/auth',
        type: 'GET',
        data: data,
        dataType: 'json',
        error: function(XHR) {
            is_hotelgg_get_mobile_code_ing = 0;
            
            if (XHR.status == '403') {
                window.alert('操作频率太快');
                $('#' + mobile_button).removeClass(mobile_button_class);
                return false;
            } else if (XHR.status == '401') {
                window.alert('数字验证码不正确');
                $('#' + img_captcha).attr('src', '/captcha?t'+(new Date()).valueOf());
                $('#' + mobile_button).removeClass(mobile_button_class);
                $('#' + captcha_box).show();
                return false;
            }
            
            window.alert('系统错误');
        },
        success: function() {
            $('#' + mobile_button).addClass(mobile_button_class).text('120秒后再次获取').data('time', '120');

            if(type)
                click_tongji(type);

            var hotelgg_get_mobile_code_ing = setInterval(function() {
                var time = $('#' + mobile_button).data('time') - 1;

                if (time == 0) {
                    $('#' + mobile_button).removeClass(mobile_button_class).text('获取短信验证码');
                    clearInterval(hotelgg_get_mobile_code_ing);

                    is_hotelgg_get_mobile_code_ing = 0;

                    return false;
                }
                $('#' + mobile_button).text(time + '秒后再次获取');
                $('#' + mobile_button).data('time', time);
            }, 1000);
        }
    });
}

function click_tongji(type) {
    switch(type) {
        case 'index_IQ':
            if(typeof(_hmt) != "undefined") _hmt.push(['_trackEvent', 'index_IQ', 'index_getmsg', 'index_btn_getmsg']);
            break;
        case 'yqbj':
            if(typeof(_hmt) != "undefined") _hmt.push(['_trackEvent', 'yqbj', 'get_msg', 'yqbj_getmsg']);
            break;
        case 'detail_RFP':
            if(typeof(_hmt) != "undefined") _hmt.push(['_trackEvent', 'detail_rfp', 'detail_rfp_getmsg', 'detail_rfp_getmsg_hid'+$.cookie('hotels')]);
            break;
        case 'tender_HT':
            if(typeof(_hmt) != "undefined") _hmt.push(['_trackEvent', 'tender_HT', 'tender_msg', 'tender_getmsgnow']);
            break;
        case 'dmc_SP':
            if(typeof(_hmt) != "undefined") _hmt.push(['_trackEvent', 'dmc_SP', 'dmc_sp_getmsg', 'dmc_getmsg']);
            break;
        case 'dmc_NOSP':
            if(typeof(_hmt) != "undefined") _hmt.push(['_trackEvent', 'dmc_nosp', 'dmc_nosp_getmsg', 'dmc_btn_getmsg']);
            break;
        case 'dmc_askplan':
            if(typeof(_hmt) != "undefined") _hmt.push(['_trackEvent', 'dmc_askplan', 'dmc_askplan_msg', 'dmc_askplan_btn_msg']);
            break;
        case 'planer_askplan':
            if(typeof(_hmt) != "undefined") _hmt.push(['_trackEvent', 'planer_askplan', 'planer_askplan_getmsg', 'planer_askplan_btn_getmsg']);
            break;
        default:
            break;
    }
}
