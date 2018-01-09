function getLoginedId(ok_acx, notify_msg,callback) {
    var that = this;
    $.get('/member/ping?' + Math.random(), function(data) {
        if (typeof data.id != 'undefined' && data.id > 0) {
            if (typeof ok_acx == 'function') {
                return ok_acx(data.id);
            }
            return data.id;
        } else {
            return that.autoLogin();
        }
    });

    autoLogin = function() {
        var sM = $('#hotelggautoLogin');

        if (!sM.length) {
            var showText = "用来查看酒店回复的详细报价单";
            if (document.URL.indexOf("leadsmarket") > 0) {
                showText = "可以更方便报价或查找会场";
            }

            if (notify_msg)
                showText = notify_msg;

            var tempLoginString = "<div style='display:none;' id='hotelggautoLogin'><a href='javascript:void(0);' id='login_register_trigger' style='display:none;'></a><div id='login_register_pop' class='popup' style='width:550px;'><p class='title'>注册或登录</p><div id='div_register' style='display:none;' class='dialog'><div class='notice'>请<span class='hot'>花5秒钟注册</span>一个帐号，" + showText + "。已有帐号的请<a href='javascript:void(0);' id='login_show'>直接登录</a></div><form id='form_register'><table width='96%' align='center' cellpadding='8' cellspacing='0'><tr><td align='right'>注册Email:</td><td><input type='text' name='email' class='text' placeholder='请输入邮箱' /></td></tr><tr><td align='right'>设置密码:</td><td><input type='password' name='passwd' class='text' /></td></tr><tr><td align='right'></td><td><button type='submit' name='register' class='orange'>注册</button></td></tr></table></form></div><div id='div_login' class='dialog'><div class='notice'>请直接登录，若还没注册请花5秒钟注册一下<a href='javascript:void(0);' id='register_show'>点击注册</a></div><form id='form_login'><table width='96%' align='center' cellpadding='8' cellspacing='0'><tr><td align='right'>Email:</td><td><input type='text' name='email' class='text' placeholder='请输入您注册时候的邮箱' /></td></tr><tr><td align='right'>密码:</td><td><input type='password' name='passwd' class='text' /></td></tr><tr><td align='right'></td><td><button type='submit' name='login' class='orange'>登录</button></td></tr></table></form></div></div></div>";
            $(window.document.body).append($(tempLoginString));
            sM = $('#hotelggautoLogin');
            placeholder(sM);
        }

        $('#login_show').click(function() {
            $('#div_register').hide();
            $('#div_login').show();
        });

        $('#register_show').click(function() {
            $('#div_login').hide();
            $('#div_register').show();
        });

        // 提交注册表单
        $('button[name="register"]').click(function(event) {
            event.preventDefault();
            var data = {};
            data['email'] = $.trim($('#form_register input[name="email"]').val());
            data['password'] = $.trim($('#form_register input[name="passwd"]').val());
            data['repassword'] = data['password'];
            $.ajax({
                url: '/member/reg',
                type: 'POST',
                data: data,
                dataType: "json",
                async: false,
                success: function(resp) {
                    acx_back(resp);
                }
            });
        });

        // 提交登录表单
        $('button[name="login"]').click(function(event) {
            event.preventDefault();

            var data = {};
            data['email'] = $.trim($('#form_login input[name="email"]').val());
            data['password'] = $.trim($('#form_login input[name="passwd"]').val());

            $.ajax({
                url: '/member/login',
                type: 'POST',
                data: data,
                dataType: "json",
                async: false,
                success: function(resp) {
                    acx_back(resp);
                }
            });
        });

        $('#login_register_trigger').fancybox({
            href: '#login_register_pop',
            showCloseButton: true,
            hideOnOverlayClick: false,
            scrolling: false,
            margin: 0,
            padding: 0
        }).trigger('click');
        //sM.children('.login_register_trigger').show();
    
            if (typeof callback == 'function') {
                return callback();
            }

    };

    function acx_back(d) {
        if (typeof d.id == 'undefined' || !d.id) {
            if (typeof d.html != 'undefined') {
                alert(d.html);
            }
            return;
        }
        $('#hotelggautoLogin').hide();
        if (typeof ok_acx == 'function') {
            return ok_acx(d.id);
        }
    }

}

var getinput = function(obj, name) {
    return obj.find('[name=' + name + ']');
};
$(function() {
    var db = {
        table: $('#update_vip'),
        getdb: function(name) {
            return this.table.find('[name=' + name + ']');
        },
        db: {}
    };
	
    db.table.find('input').each(function(index) {
        db.db[$(this).attr('name')] = db.getdb($(this).attr('name'));
    });
	
	db.table.find('select').each(function(index) {
		db.db[$(this).attr('name')] = db.getdb($(this).attr('name'));
	});
	
    db.table.find('a.btn_org').click(function() {
        var url = '/member/vip?';
        for (x in db.db) {
            url += x + '=' + db.db[x].val() + '&';
        }
        location.href = url;
    });

    var form = $('#change_pwd');
    var oldpassword = form.find('input[name=oldpassword]');
    var newpassword = form.find('input[name=newpassword]');
    var renewpassword = form.find('input[name=renewpassword]');
    $('#submit_change_passwd').click(function() {
        var db = {
            oldpassword: oldpassword.val(),
            newpassword: newpassword.val(),
            renewpassword: renewpassword.val()
        };
        if (db.oldpassword.length < 6 || !db.oldpassword) {
            oldpassword.next('span.e').text('原密码不正确！');
            return false;
        }
        if (db.newpassword.length < 6) {
            newpassword.next('span.e').text('请输入6位以上的密码！');
            return false;
        }
        if (db.renewpassword !== db.newpassword || !db.renewpassword) {
            renewpassword.next('span.e').text('两次密码不一致。');
            return false;
        }

        $.ajax({
            url: '/member/password/change',
            data: db,
            dataType: 'json',
            success: function(data) {
                if (data.result) {
                    $.fancybox.close();
                    alert('密码修改成功!');
                } else {
                    var obj = eval(data.error);
                    obj.next('span.e').text(data.msg);
                }
            },
            type: 'post'
        });
    });
    newpassword.blur(function() {
        if ($(this).val() < 6) {
            $(this).next('span.e').text('请输入6位以上的密码！');
            return false;
        }
    }).focus(function() {
        $(this).next('span.e').text('');
    });
    renewpassword.blur(function() {
        if ($(this).val() !== newpassword.val()) {
            $(this).next('span.e').text('两次密码不一致。');
            return false;
        }
    }).focus(function() {
        $(this).next('span.e').text('');
    });
    oldpassword.blur(function() {
        if (oldpassword.val().length < 6 || !oldpassword.val()) {
            oldpassword.next('span.e').text('原密码不正确！');
            return false;
        }
    }).focus(function() {
        $(this).next('span.e').text('');
    });
    $('i.date').click(function() {
        $(this).prev().focus();
    });
    $('#update_vip').find('td:odd').css({
        'text-align': 'left'
    });


});