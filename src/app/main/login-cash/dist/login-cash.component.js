"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.LoginCashComponent = void 0;
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var confirmation_component_1 = require("./confirmation/confirmation.component");
var operators_1 = require("rxjs/operators");
var LoginCashComponent = /** @class */ (function () {
    function LoginCashComponent(dialog, fb, dbs, route, snackbar) {
        this.dialog = dialog;
        this.fb = fb;
        this.dbs = dbs;
        this.route = route;
        this.snackbar = snackbar;
        this.hidePass = true;
        this.validatorPass = false;
        this.currentCash = null;
    }
    LoginCashComponent.prototype.ngOnChanges = function (changes) {
        this.ngOnInit();
    };
    LoginCashComponent.prototype.ngOnInit = function () {
        this.dbs.changeTitle('Login');
        this.navigate = this.route.snapshot.paramMap.get("login");
        console.log('this.navigate : ', this.navigate);
        this.loginForm = this.fb.group({
            caja: ['', forms_1.Validators.required],
            pass: ['', forms_1.Validators.required],
            openingBalance: ['', forms_1.Validators.required]
        });
        this.boxList$ = this.dbs.getCashierValueChanges().pipe(operators_1.tap(function (res) {
            return res;
        }));
    };
    LoginCashComponent.prototype.login = function (data) {
        var _this = this;
        this.dbs.loginCash(this.loginForm.get('caja').value, this.loginForm.get('pass').value).pipe(operators_1.take(1))
            .subscribe(function (user) {
            _this.currentCash = user['0'];
            // If the cashbox is open, you cant open it again. Just one person can use it at time
            if (_this.currentCash.open) {
                _this.snackbar.open('🚨 No puede acceder a esta caja, ya se encuentra en uso!', 'Aceptar', {
                    duration: 6000
                });
                return;
            }
            if (user.length >= 1) {
                _this.dialog.open(confirmation_component_1.ConfirmationComponent, {
                    data: {
                        cashBox: _this.currentCash,
                        openingBalance: _this.loginForm.value['openingBalance'],
                        login: _this.navigate
                    }
                });
            }
            else {
                _this.validatorPass = true;
            }
        });
    };
    LoginCashComponent = __decorate([
        core_1.Component({
            selector: 'app-login-cash',
            templateUrl: './login-cash.component.html',
            styleUrls: ['./login-cash.component.scss']
        })
    ], LoginCashComponent);
    return LoginCashComponent;
}());
exports.LoginCashComponent = LoginCashComponent;
