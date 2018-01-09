
// 本地存储
function setSessionStorage (k, v) {
    if (typeof v === "object") {
        sessionStorage.setItem(k,JSON.stringify(v));
    }
}

function getSessionStorage (k) {
    var item = sessionStorage.getItem(k);

    try {
        item = (null === item)? null:JSON.parse(item);
    } catch(e) {
        item = null;
    }

    return item;
}

function setLocalStorage(k, v) {
    if (typeof v === "object") {
        localStorage.setItem(k,JSON.stringify(v));
    }
}

function getLocalStorage(k) {
    var item = localStorage.getItem(k);
    try {
        item = (null === item)? null:JSON.parse(item);
    } catch(e) {
        item = null;
    }

    return item;
}

function clearAllStorage(type) {
    window[type].clear();
}

/////////////////////////////////////////////////////////////////////////////

// 获取红点提醒
function getRemind(param) {
    var position = 'nav';
    if($('#member_menu').length>0) {
        position = 'nav,menu:rfp_hotel,menu:rfp_dmc,menu:rfp_tender';
    }
    window.position = position;
    window.remind_param = param;
    if(position) {
        window.getRemindAjax = function(){
            $.ajax({
                url: '/remind/hgg',
                type: 'GET',
                cache : false,
                data: {'position': position, 'param':remind_param},
                dataType: 'json',
                success: function(resp, status, xhr) {
                    if (!resp) {

                    } else if(resp.ret == 1) {
                        var remind_cache_time = resp.data.remind_cache_time;
                        window.remind_cache_timeout = setTimeout('getRemindAjax()', remind_cache_time);
                        if(resp.data.nav > 0) {
                            $('.new_head .login_2 a.new_icon_box i.new_icon').show();
                            $('.new_head .login_2 a.new_icon_box').addClass('new_tips');
                        } else {
                            $('.new_head .login_2 a.new_icon_box i.new_icon').hide();
                            $('.new_head .login_2 a.new_icon_box').removeClass('new_tips');
                        }

                        if(resp.data.menu_rfp_hotel > 0) {
                            $('#member_menu .order2 dd#remind_hotel a .remind_new').show();
                        } else {
                            $('#member_menu .order2 dd#remind_hotel a .remind_new').hide();
                        }

                        if(resp.data.menu_rfp_dmc > 0) {
                            $('#member_menu .order2 dd#remind_dmc a .remind_new').show();
                        } else {
                            $('#member_menu .order2 dd#remind_dmc a .remind_new').hide();
                        }

                        if(resp.data.menu_rfp_tender > 0) {
                            $('#member_menu .order2 dd#remind_tender a .remind_new').show();
                        } else {
                            $('#member_menu .order2 dd#remind_tender a .remind_new').hide();
                        }
                    }
                }
            });
        }
        getRemindAjax();
    }
}

// 清除红点提醒
function clearRemind(position, order_number, organizer_id) {
    $.ajax({
        url: '/remind/hgg?position='+position+'&order_number='+order_number+'&organizer_id='+organizer_id,
        type: 'DELETE',
        cache : false,
        data: {},
        dataType: 'json',
        success: function(resp, status, xhr) {
            if(resp.ret == 1) {
                if(window.remind_cache_timeout != undefined) {
                    clearTimeout(window.remind_cache_timeout);
                }
                getRemindAjax(); // 清除成功后立即触发获取一次
            }
        }
    });
}