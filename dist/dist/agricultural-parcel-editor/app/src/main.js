var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "esri/portal/Portal"], function (require, exports, decorators_1, Widget_1, widget_1, Portal_1) {
    "use strict";
    Widget_1 = __importDefault(Widget_1);
    Portal_1 = __importDefault(Portal_1);
    let Agricultural_Parcel_Editor = class Agricultural_Parcel_Editor extends Widget_1.default {
        constructor(params) {
            super(params);
        }
        postInitialize() {
            return __awaiter(this, void 0, void 0, function* () {
                this.state = {
                    error: "",
                    user: ""
                };
                this.portal = new Portal_1.default({
                    url: this.appConfig.portalURL
                });
                this.portal.authMode = "auto";
                yield this.portal.load().then(() => {
                }).catch(() => {
                });
                this._toggleTheme(this._getBrowserTheme());
                setTimeout(() => {
                    this._updateAppState({ user: "load" });
                }, 2000);
            });
        }
        render() {
            var _a, _b;
            let content;
            if (this.state.user) {
                let error;
                if ((_a = this.state.error) === null || _a === void 0 ? void 0 : _a.message) {
                    error = ((0, widget_1.tsx)("calcite-alert", { open: "true", kind: "danger", scale: "m", placement: "bottom" },
                        (0, widget_1.tsx)("div", { slot: "title" }, this.state.error.name),
                        (0, widget_1.tsx)("div", { slot: "message" }, this.state.error.message)));
                }
                let mainTemplate, cards;
                if ((_b = this.appConfig.appLinks) === null || _b === void 0 ? void 0 : _b.length) {
                    cards = this.appConfig.appLinks.map((app) => {
                        return ((0, widget_1.tsx)("calcite-card", { class: "xoople-card", onclick: () => { this._loadLink(app.url); }, bind: this },
                            (0, widget_1.tsx)("img", { slot: "thumbnail", alt: app.title, src: app.thumbnail }),
                            (0, widget_1.tsx)("span", { slot: "title" }, app.title),
                            (0, widget_1.tsx)("span", { slot: "subtitle" }, app.description)));
                    });
                }
                else {
                    cards = ((0, widget_1.tsx)("calcite-notice", { open: true, kind: "warning", scale: "m", icon: "exclamation-mark-circle" },
                        (0, widget_1.tsx)("div", { slot: "message" }, "No apps found.")));
                }
                mainTemplate = ((0, widget_1.tsx)("calcite-shell", { "content-behind": true },
                    (0, widget_1.tsx)("div", { class: "xoople-header", slot: "header" },
                        (0, widget_1.tsx)("img", { src: "app/images/logo.PNG", class: "xoople-logo" }),
                        (0, widget_1.tsx)("div", { class: "xoople-header-title" },
                            (0, widget_1.tsx)("h2", { class: "xoople-header-title-1" }, this.appConfig.appTitle))),
                    (0, widget_1.tsx)("div", { class: "xoople-card-container" }, cards)));
                content = ((0, widget_1.tsx)("div", null,
                    mainTemplate,
                    error));
            }
            else
                content = ((0, widget_1.tsx)("div", null,
                    (0, widget_1.tsx)("calcite-scrim", { class: "xoople-loader", loading: true })));
            return content;
        }
        _loadLink(url) {
            let link = document.createElement("a");
            link.href = url;
            link.target = "_blank";
            link.click();
        }
        _toggleTheme(theme) {
            let darkTheme;
            if (document.body.classList) {
                darkTheme = Array.from(document.body.classList).findIndex((className) => {
                    return className === "calcite-mode-dark";
                });
            }
            else
                darkTheme = -1;
            if ((theme === "light" && darkTheme !== -1) || (theme === "dark" && darkTheme === -1)) {
                const dark = document.querySelector("#jsapi-theme-dark");
                const light = document.querySelector("#jsapi-theme-light");
                if (theme === "light") {
                    document.body.classList.remove("calcite-mode-dark");
                    dark.disabled = true;
                    light.disabled = false;
                }
                else {
                    document.body.classList.add("calcite-mode-dark");
                    dark.disabled = false;
                    light.disabled = true;
                }
                this._updateAppState({ theme: theme });
            }
        }
        _updateAppState(properties) {
            let state = JSON.parse(JSON.stringify(this.state));
            Object.keys(properties).forEach((p) => {
                state[p] = properties[p];
            });
            this.state = state;
        }
        _getBrowserTheme() {
            let theme = "light";
            if (window.matchMedia) {
                let mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                if (mediaQuery.matches)
                    theme = "dark";
                else
                    theme = "light";
            }
            else if (localStorage.getItem("xoople-color-theme")) {
                theme = localStorage.getItem("xoople-color-theme");
            }
            return theme;
        }
    };
    __decorate([
        (0, decorators_1.property)()
    ], Agricultural_Parcel_Editor.prototype, "appConfig", void 0);
    __decorate([
        (0, decorators_1.property)()
    ], Agricultural_Parcel_Editor.prototype, "state", void 0);
    Agricultural_Parcel_Editor = __decorate([
        (0, decorators_1.subclass)("esri.widgets.Agricultural_Parcel_Editor")
    ], Agricultural_Parcel_Editor);
    return Agricultural_Parcel_Editor;
});
