"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
exports.__esModule = true;
exports.CloseCashComponent = void 0;
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var dialog_1 = require("@angular/material/dialog");
var CloseCashComponent = /** @class */ (function () {
    function CloseCashComponent(fb, dialogRef, afs, snackBar, router, data) {
        this.fb = fb;
        this.dialogRef = dialogRef;
        this.afs = afs;
        this.snackBar = snackBar;
        this.router = router;
        this.data = data;
        this.disableSelect = new forms_1.FormControl(false);
        this.checked = false;
        this.balaceDetail = false;
        this.hidePass = true;
        this.displayedColumns = ['money', 'count', 'total'];
        this.dataSource = [
            { index: 1, money: 'Billete S/. 200', valor: 200, count: 0, total: 0 },
            { index: 2, money: 'Billete S/. 100', valor: 100, count: 0, total: 0 },
            { index: 3, money: 'Billete S/. 50', valor: 50, count: 0, total: 0 },
            { index: 4, money: 'Billete S/. 20', valor: 20, count: 0, total: 0 },
            { index: 5, money: 'Billete S/.10', valor: 10, count: 0, total: 0 },
            { index: 6, money: 'Moneda S/.5', valor: 5, count: 0, total: 0 },
            { index: 7, money: 'Moneda S/.2', valor: 2, count: 0, total: 0 },
            { index: 8, money: 'Otras Monedas', valor: 1, count: 0, total: 0 },
        ];
    }
    CloseCashComponent.prototype.ngOnInit = function () {
        this.dataFormGroup = this.fb.group({
            closureBalance: ['', forms_1.Validators.required],
            pass: ['', forms_1.Validators.required]
        });
    };
    CloseCashComponent.prototype.totalCashOpening = function () {
        var value = this.data.opening.openingBalance;
        var importInit = parseInt(value);
        return importInit + this.data.totalIncomes - this.data.totalExpenses;
    };
    CloseCashComponent.prototype.changeValue = function (value) {
        this.checked = !value;
    };
    CloseCashComponent.prototype.applyFilter = function (filterValue) {
        filterValue = filterValue.trim();
        filterValue = filterValue.toLowerCase();
    };
    CloseCashComponent.prototype.closeCash = function () {
        var closureBalance = this.dataFormGroup.value['closureBalance'];
        var password = this.dataFormGroup.value['pass'];
        var passwordCurrentUser = this.data.user.currentCash.password;
        if (password == passwordCurrentUser) {
            this.updateUserCashBox();
            this.updateOpening();
            this.updateUser();
            this.snackBar.open("la caja se cerró correcta", "Cerrar");
            this.router.navigateByUrl('main');
            this.dialogRef.close();
        }
        else {
            this.snackBar.open("la Contraseña es incorrecta", "Cerrar");
        }
        // }
    };
    CloseCashComponent.prototype.updateUser = function () {
        var batch = this.afs.firestore.batch();
        var userRef = this.afs.firestore.collection("/users").doc(this.data.user.uid);
        var updateUser = {
            currentCash: null
        };
        batch.update(userRef, updateUser);
        batch.commit()
            .then(function () {
        })["catch"](function (err) {
        });
    };
    CloseCashComponent.prototype.updateUserCashBox = function () {
        var batch = this.afs.firestore.batch();
        var cashBoxRef = this.afs.firestore.collection("/db/minimarketBoom/cashBox").doc(this.data.user.currentCash.uid);
        var cashData = {
            open: false,
            currentOwner: null,
            lastClosure: new Date(),
            currentOpening: null
        };
        batch.update(cashBoxRef, cashData);
        batch.commit()
            .then(function () {
        })["catch"](function (err) {
        });
    };
    CloseCashComponent.prototype.updateOpening = function () {
        var batch = this.afs.firestore.batch();
        var openingRef = this.afs.firestore.collection("/db/minimarketBoom/cashBox/" + this.data.user.currentCash.uid + "/openings").doc(this.data.user.currentCash.currentOpening);
        var openingData = {
            closedBy: this.data.user.displayName,
            closedByUid: this.data.user.uid,
            closureDate: new Date(),
            closureBalance: this.dataFormGroup.value['closureBalance'],
            detailMoneyDistribution: this.dataSource,
            totalBalance: this.totalCashOpening(),
            totalIncome: this.data.totalIncomes,
            totalExpenses: this.data.totalExpenses
        };
        batch.update(openingRef, openingData);
        batch.commit().then(function () {
        })["catch"](function (err) {
        });
    };
    CloseCashComponent.prototype.changeInput = function (input, data) {
        var inputValue = input.target.value;
        var closureBalance = this.dataFormGroup.value['closureBalance'];
        console.log('Monto Total : ', this.getTotalMoney());
        console.log('closureBalance : ', closureBalance);
        var totalMoney = this.getTotalMoney();
        if (inputValue >= 0 && totalMoney <= closureBalance) {
            this.balaceDetail = false;
            var index = data.index;
            var valor = data.valor;
            var newCount = inputValue;
            var newTotal = valor * newCount;
            for (var i = 0; i < this.dataSource.length; i++) {
                if (this.dataSource[i].index == index) {
                    this.dataSource[i].count = inputValue;
                    this.dataSource[i].total = newTotal;
                }
            }
        }
        else {
            this.balaceDetail = true;
            this.snackBar.open("no puedes ingresar numeros negativos y el monto total no debe mayor al importe ingresado", "Cerrar");
        }
    };
    CloseCashComponent.prototype.getTotalMoney = function () {
        return this.dataSource.map(function (t) { return t.total; }).reduce(function (acc, value) { return acc + value; }, 0);
    };
    CloseCashComponent = __decorate([
        core_1.Component({
            selector: 'app-close-cash',
            templateUrl: './close-cash.component.html',
            styleUrls: ['./close-cash.component.scss']
        }),
        __param(5, core_1.Inject(dialog_1.MAT_DIALOG_DATA))
    ], CloseCashComponent);
    return CloseCashComponent;
}());
exports.CloseCashComponent = CloseCashComponent;
