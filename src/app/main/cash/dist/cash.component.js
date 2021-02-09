"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.CashComponent = void 0;
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var rxjs_1 = require("rxjs");
var table_1 = require("@angular/material/table");
var show_total_cash_component_1 = require("./show-total-cash/show-total-cash.component");
var show_history_cash_component_1 = require("./show-history-cash/show-history-cash.component");
var add_money_cash_component_1 = require("./add-money-cash/add-money-cash.component");
var retrieve_money_cash_component_1 = require("./retrieve-money-cash/retrieve-money-cash.component");
var edit_initial_import_component_1 = require("./edit-initial-import/edit-initial-import.component");
var close_cash_component_1 = require("./close-cash/close-cash.component");
var operators_1 = require("rxjs/operators");
var show_product_list_component_1 = require("./show-product-list/show-product-list.component");
var XLSX = require("xlsx");
var show_description_component_1 = require("./show-description/show-description.component");
var CashComponent = /** @class */ (function () {
    function CashComponent(fb, dialog, auth, dbs, router) {
        this.fb = fb;
        this.dialog = dialog;
        this.auth = auth;
        this.dbs = dbs;
        this.router = router;
        this.barChartData = 'Prueba';
        this.ingreso = 'Ingreso';
        this.egreso = 'Egreso';
        this.totalIncome = 0;
        this.totalExpenses = 0;
        this.loadingCash = new rxjs_1.BehaviorSubject(true);
        this.loadingCash$ = this.loadingCash.asObservable();
        this.dataSourceCash = new table_1.MatTableDataSource();
        this.displayedColumnsCash = ['index', 'date', 'type', 'description', 'nTicket', 'import', 'payType', 'productList', 'actions'];
        this.counter = 0;
    }
    Object.defineProperty(CashComponent.prototype, "content", {
        set: function (paginator) {
            this.dataSourceCash.paginator = paginator;
        },
        enumerable: false,
        configurable: true
    });
    CashComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.dbs.changeTitle('Caja');
        /* this.dbs.currentTitle$.subscribe(res => {
          console.log(res);
          this.title = res
        }); */
        this.searchBoxForm = this.fb.group({
            search: ['', forms_1.Validators.required]
        });
        this.auth.user$.pipe(operators_1.take(1)).subscribe(function (user) {
            _this.userCash = user;
        });
        this.dbs.getOpeningById(this.userCash.currentCash.uid, this.userCash.currentCash.currentOpening).subscribe(function (opening) {
            _this.opening = opening;
            _this.openingBalace = _this.opening.openingBalance;
        });
        this.cash$ = rxjs_1.combineLatest(this.dbs.getTransactionsById(this.userCash.currentCash.uid, this.userCash.currentCash.currentOpening), this.searchBoxForm.get('search').valueChanges.pipe(operators_1.filter(function (input) { return input !== null; }), operators_1.startWith(''), operators_1.map(function (value) { return typeof value === 'string' ? value.toLowerCase() : value.description.toLowerCase(); }))).pipe(operators_1.map(function (_a) {
            var cash = _a[0], name = _a[1];
            return cash
                .filter(function (el) { return name ? el.description.toLowerCase().includes(name) : true; })
                .map(function (el, i) {
                return __assign(__assign({}, el), { index: i + 1 });
            });
        }), operators_1.tap(function (res) {
            _this.dataSourceCash.data = res;
            _this.loadingCash.next(false);
            var transactions = _this.dataSourceCash.data;
            for (var i = 0; i < transactions.length; i++) {
                if (transactions[i]['movementType'] === _this.ingreso) {
                    _this.totalIncome += transactions[i]['ticket']['total'];
                }
                if (transactions[i]['movementType'] === _this.egreso) {
                    _this.totalExpenses += transactions[i]['ticket']['total'];
                }
            }
        }));
    };
    //Dialog
    CashComponent.prototype.showTotal = function () {
        this.dialog.open(show_total_cash_component_1.ShowTotalCashComponent, {
            data: {
                userCash: this.userCash,
                opening: this.opening
            }
        });
    };
    CashComponent.prototype.showHistory = function () {
        this.dialog.open(show_history_cash_component_1.ShowHistoryCashComponent, {
            data: {
                userCash: this.userCash
            }
        });
    };
    CashComponent.prototype.addMoney = function () {
        this.dialog.open(add_money_cash_component_1.AddMoneyCashComponent);
    };
    CashComponent.prototype.retriveMoney = function () {
        this.dialog.open(retrieve_money_cash_component_1.RetrieveMoneyCashComponent);
    };
    CashComponent.prototype.editImport = function () {
        this.dialog.open(edit_initial_import_component_1.EditInitialImportComponent, {
            data: {
                idOpening: this.userCash.currentCash.currentOpening,
                cashier: this.userCash.currentCash.cashier,
                idCashBox: this.userCash.currentCash.uid
            }
        });
    };
    CashComponent.prototype.closeCash = function () {
        this.dialog.open(close_cash_component_1.CloseCashComponent, {
            data: {
                user: this.userCash,
                opening: this.opening,
                totalIncomes: this.totalIncome,
                totalExpenses: this.totalExpenses
            }
        });
    };
    CashComponent.prototype.showDescription = function (description) {
        this.dialog.open(show_description_component_1.ShowDescriptionComponent, {
            data: {
                description: description
            }
        });
    };
    CashComponent.prototype.showProductList = function (product) {
        this.dialog.open(show_product_list_component_1.ShowProductListComponent, {
            data: {
                product: product
            }
        });
    };
    CashComponent.prototype.editCash = function () {
    };
    CashComponent.prototype.deleteCash = function () {
    };
    CashComponent.prototype.downloadXls = function () {
        var table_xlsx = [];
        var headersXlsx = [
            'Fecha', 'Tipo', 'Descripcion', 'N° ticket', 'Importe', 'Tipo de Pago'
        ];
        table_xlsx.push(headersXlsx);
        this.dataSourceCash.filteredData.forEach(function (item) {
            var temp = [
                item['createdAt'],
                item['movementType'],
                item['description'],
                item['correlative'],
                item['ticket']['total'],
                item['paymentMethod']['name']
            ];
            table_xlsx.push(temp);
        });
        /* generate worksheet */
        var ws = XLSX.utils.aoa_to_sheet(table_xlsx);
        /* generate workbook and add the worksheet */
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Lista_transaciones');
        /* save to file */
        var name = 'Lista_transaciones' + '.xlsx';
        XLSX.writeFile(wb, name);
    };
    __decorate([
        core_1.ViewChild("paginatorCash", { static: false })
    ], CashComponent.prototype, "content");
    CashComponent = __decorate([
        core_1.Component({
            selector: 'app-cash',
            templateUrl: './cash.component.html',
            styleUrls: ['./cash.component.scss']
        })
    ], CashComponent);
    return CashComponent;
}());
exports.CashComponent = CashComponent;
