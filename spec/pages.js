
'use strict';

exports.login = LoginModal;

function LoginModal() {
    this.username = element(by.model('username'));
    this.password = element(by.model('password'));
    this.btn = $('#login-btn');

    this.login = function(username, password) {
        this.username.clear();
        this.username.sendKeys(username);
        this.password.sendKeys(password);
        this.btn.click();
    };
}
