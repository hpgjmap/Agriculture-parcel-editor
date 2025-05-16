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
define(["require", "exports", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "esri/layers/GraphicsLayer", "esri/widgets/Sketch", "esri/widgets/FeatureForm", "esri/form/FormTemplate", "esri/form/elements/FieldElement"], function (require, exports, decorators_1, Widget_1, widget_1, GraphicsLayer_1, Sketch_1, FeatureForm_1, FormTemplate_1, FieldElement_1) {
    "use strict";
    Widget_1 = __importDefault(Widget_1);
    GraphicsLayer_1 = __importDefault(GraphicsLayer_1);
    Sketch_1 = __importDefault(Sketch_1);
    FeatureForm_1 = __importDefault(FeatureForm_1);
    FormTemplate_1 = __importDefault(FormTemplate_1);
    FieldElement_1 = __importDefault(FieldElement_1);
    let Editor = class Editor extends Widget_1.default {
        constructor(params) {
            super(params);
            this.mode = "";
            this.loading = false;
        }
        postInitialize() {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                console.log(this.options);
                this.state = {
                    error: "",
                    drawActive: false,
                    formActive: false,
                    confirmActive: false,
                    loading: false,
                    updateDrawHelp: false,
                };
                if (this.layer &&
                    this.layer.editingEnabled &&
                    this.view &&
                    this.container) {
                    let visibleElements = {
                        selectionTools: {
                            "lasso-selection": false,
                            "rectangle-selection": false,
                        },
                        undoRedoMenu: false,
                        duplicateButton: false,
                        snappingControls: false,
                        settingsMenu: false,
                        createTools: {
                            point: false,
                            polyline: false,
                            polygon: true,
                            rectangle: false,
                            circle: false,
                        },
                    };
                    let graphicsLayer = new GraphicsLayer_1.default({
                        id: "custom-graphicsLayer",
                        elevationInfo: {
                            mode: "on-the-ground",
                        },
                        listMode: "hide",
                    });
                    this.view.map.add(graphicsLayer);
                    this.sketchTool = new Sketch_1.default({
                        layer: graphicsLayer,
                        view: this.view,
                        creationMode: "update",
                        defaultUpdateOptions: {
                            tool: "transform",
                            enableRotation: true,
                            enableScaling: true,
                            enableZ: false,
                            multipleSelectionEnabled: false,
                        },
                        visibleElements: visibleElements,
                    });
                    this.sketchTool.on("create", (evt) => __awaiter(this, void 0, void 0, function* () {
                        if (evt.state === "start") {
                            this._updateState({ updateDrawHelp: false });
                        }
                        else if (evt.state === "active") {
                            !this.state.updateDrawHelp &&
                                this._updateState({ updateDrawHelp: true });
                        }
                        else if (evt.state === "complete") {
                            if (this.mode === "create") {
                                this._updateState({ formActive: true, drawActive: true });
                            }
                            else {
                                this.emit("draw", evt.graphic);
                            }
                        }
                        else if (evt.state === "cancel") {
                            this._destroy();
                        }
                    }));
                    this.sketchTool.on("update", (evt) => __awaiter(this, void 0, void 0, function* () {
                        if (evt.state === "complete") {
                        }
                    }));
                    this.sketchTool.on("delete", (evt) => __awaiter(this, void 0, void 0, function* () {
                        this.sketchTool.layer.add(evt.graphics[0]);
                        this.sketchTool.update(evt.graphics[0]);
                        this._updateState({ confirmActive: true });
                    }));
                    this.sketchTool.viewModel.polygonSymbol =
                        this.layer.renderer.defaultSymbol ||
                            ((_a = this.layer.renderer.symbol) === null || _a === void 0 ? void 0 : _a.symbol) ||
                            this.layer.renderer.symbol;
                }
                else {
                    this._updateState({ error: this.nls.editorInitializeError });
                }
            });
        }
        draw() {
            this.mode = "draw";
            this.sketchTool.layer.removeAll();
            this.sketchTool.creationMode = "create";
            this.sketchTool.create("polygon", { mode: "click" });
            this._updateState({
                drawActive: true,
                formActive: false,
                updateDrawHelp: false,
            });
        }
        create(graphic, options) {
            if (!graphic) {
                this.mode = "create";
                this.sketchTool.layer.removeAll();
                this.sketchTool.creationMode = "update";
                this.sketchTool.create("polygon", { mode: "click" });
                this._updateState({
                    drawActive: true,
                    formActive: false,
                    updateDrawHelp: false,
                });
            }
            else {
                this.sketchTool.layer.removeAll();
                let newGraphic = graphic.clone();
                newGraphic.layer = this.sketchTool.layer;
                this.sketchTool.layer.add(newGraphic);
                if (options === null || options === void 0 ? void 0 : options.updateGeometry)
                    this.sketchTool.update([newGraphic]);
                if (options === null || options === void 0 ? void 0 : options.drawInActive)
                    this._updateState({ drawActive: false, formActive: true });
                else
                    this._updateState({ drawActive: true, formActive: true });
            }
        }
        update(graphic) {
            this.mode = "update";
            this.sketchTool.layer.removeAll();
            let newGraphic = graphic.clone();
            newGraphic.layer = this.sketchTool.layer;
            this.sketchTool.layer.add(newGraphic);
            this.sketchTool.update([newGraphic]);
            let definitionExpression = this.layer.definitionExpression || "";
            if (definitionExpression)
                definitionExpression += " AND ";
            definitionExpression += this.layer.objectIdField + " <> " + graphic.attributes[this.layer.objectIdField];
            this.layer.definitionExpression = definitionExpression;
            this._updateState({ drawActive: false, formActive: true });
        }
        destroy() {
            this._destroy();
        }
        render() {
            let drawPanel, formPanel, confirmBox;
            if (this.state.drawActive) {
                drawPanel = ((0, widget_1.tsx)("calcite-flow-item", { selected: !this.state.formActive, loading: this.state.loading, heading: this.options.heading, closable: "true", oncalciteFlowItemClose: () => {
                        this._destroy();
                    }, bind: this },
                    (0, widget_1.tsx)("div", { class: "editor-draw-help" }, this.state.updateDrawHelp
                        ? this.nls.drawHelpText2
                        : this.nls.drawHelpText)));
            }
            if (this.state.formActive) {
                let action, secondAction;
                if (this.mode === "update") {
                    action = ((0, widget_1.tsx)("div", { slot: "footer", class: "edit-form-footer" },
                        (0, widget_1.tsx)("calcite-button", { kind: "brand", title: this.nls.update, width: "half", onclick: ({ target }) => {
                                this._submitForm(target);
                            }, bind: this }, this.nls.update),
                        (0, widget_1.tsx)("calcite-button", { kind: "danger", appearance: "outline", width: "half", title: this.nls.delete, onclick: this._deleteFeature, bind: this }, this.nls.delete)));
                }
                else {
                    action = ((0, widget_1.tsx)("calcite-button", { slot: "footer", kind: "brand", title: this.nls.create, onclick: ({ target }) => {
                            this._submitForm(target);
                        }, bind: this }, this.nls.create));
                }
                formPanel = ((0, widget_1.tsx)("calcite-flow-item", { selected: true, closable: false, loading: this.state.loading, heading: this.options.heading, bind: this, oncalciteFlowItemBack: () => {
                        this.mode === "draw" ? this.draw() : this.create(null, null);
                    } },
                    (0, widget_1.tsx)("calcite-action", { slot: "header-actions-end", icon: "x", title: this.nls.close, onclick: () => {
                            this._updateState({ confirmActive: true });
                        } }),
                    (0, widget_1.tsx)("div", { class: "form-template", afterCreate: this._createForm, bind: this }),
                    action));
            }
            if (this.state.confirmActive) {
                confirmBox = ((0, widget_1.tsx)("calcite-scrim", { class: "editor-prompt-scrim" },
                    (0, widget_1.tsx)("div", { class: "editor-prompt-danger" },
                        (0, widget_1.tsx)("div", { class: "editor-prompt-header" },
                            (0, widget_1.tsx)("calcite-icon", { icon: "exclamation-mark-triangle", scale: "m" }),
                            (0, widget_1.tsx)("h4", { class: "editor-prompt-header-title" }, this.nls.discardEdits)),
                        (0, widget_1.tsx)("div", { class: "editor-prompt-message" }, this.nls.unsavedChanges),
                        (0, widget_1.tsx)("div", { class: "editor-prompt-divider" }),
                        (0, widget_1.tsx)("div", { class: "editor-prompt-actions" },
                            (0, widget_1.tsx)("calcite-button", { kind: "danger", appearance: "outline", title: this.nls.continueEditing, width: "half", onclick: () => {
                                    this._updateState({ confirmActive: false });
                                }, bind: this }, this.nls.continueEditing),
                            (0, widget_1.tsx)("calcite-button", { kind: "danger", appearance: "solid", width: "half", title: this.nls.discardEdits, onclick: this._destroy, bind: this }, this.nls.discardEdits)))));
            }
            return ((0, widget_1.tsx)("div", { class: "editor-panel" },
                (0, widget_1.tsx)("calcite-flow", null,
                    drawPanel,
                    formPanel),
                confirmBox));
        }
        _createForm(dom) {
            var _a, _b;
            let graphic = (_a = this.sketchTool.layer.graphics.getItemAt(0)) === null || _a === void 0 ? void 0 : _a.clone(), template;
            if (graphic) {
                let div = document.createElement("div");
                dom.appendChild(div);
                if (this.options.formTemplate) {
                    template = this.options.formTemplate;
                }
                else {
                    let elements = [];
                    this.layer.fields.forEach((field) => {
                        if (field.type !== "oid" &&
                            field.type !== "guid" &&
                            field.name.toLowerCase() !== "objectid") {
                            let param = {
                                fieldName: field.name,
                                label: field.alias,
                            };
                            if (field.type.includes("date")) {
                                param.input = {
                                    type: "datetime-picker",
                                };
                            }
                            elements.push(new FieldElement_1.default(param));
                        }
                    });
                    template = new FormTemplate_1.default({
                        title: "",
                        description: "",
                        elements: elements,
                    });
                }
                (_b = this.featureForm) === null || _b === void 0 ? void 0 : _b.destroy();
                this.featureForm = new FeatureForm_1.default({
                    container: div,
                    feature: graphic,
                    formTemplate: template,
                    layer: this.layer,
                });
                this.featureForm.on("submit", (updatedGraphic) => {
                    this.mode === "update"
                        ? this._updateFeature(updatedGraphic.values)
                        : this._createFeature(updatedGraphic.values);
                });
            }
        }
        _createFeature(attributes) {
            return __awaiter(this, void 0, void 0, function* () {
                let graphic = this.sketchTool.layer.graphics.getItemAt(0);
                if (graphic) {
                    graphic.attributes = attributes;
                    yield this.layer.applyEdits({ addFeatures: [graphic] }).then(() => { });
                }
                this._destroy();
            });
        }
        _updateFeature(attributes) {
            return __awaiter(this, void 0, void 0, function* () {
                let graphic = this.sketchTool.layer.graphics.getItemAt(0);
                if (graphic) {
                    attributes[this.layer.objectIdField] =
                        graphic.attributes[this.layer.objectIdField];
                    graphic.attributes = attributes;
                    yield this.layer.applyEdits({ updateFeatures: [graphic] }).then(() => { });
                }
                this._destroy();
                let definitionExpression = this.layer.definitionExpression || "";
                let replaceString = this.layer.objectIdField +
                    " <> " +
                    graphic.attributes[this.layer.objectIdField];
                if (definitionExpression.includes(" AND " + replaceString))
                    this.layer.definitionExpression = definitionExpression.replace(" AND " + replaceString, "");
                else
                    this.layer.definitionExpression = definitionExpression.replace(replaceString, "");
            });
        }
        _deleteFeature({ target }) {
            return __awaiter(this, void 0, void 0, function* () {
                target.loading = true;
                let graphic = this.sketchTool.layer.graphics.getItemAt(0);
                if (graphic) {
                    yield this.layer
                        .applyEdits({
                        deleteFeatures: [
                            { objectId: graphic.attributes[this.layer.objectIdField] },
                        ],
                    })
                        .then(() => { });
                }
                this._destroy();
                let definitionExpression = this.layer.definitionExpression || "";
                let replaceString = this.layer.objectIdField +
                    " <> " +
                    graphic.attributes[this.layer.objectIdField];
                if (definitionExpression.includes(" AND " + replaceString))
                    this.layer.definitionExpression = definitionExpression.replace(" AND " + replaceString, "");
                else
                    this.layer.definitionExpression = definitionExpression.replace(replaceString, "");
                target.loading = false;
            });
        }
        _submitForm(target) {
            var _a;
            target.loading = true;
            (_a = this.featureForm) === null || _a === void 0 ? void 0 : _a.submit();
        }
        _destroy() {
            var _a, _b, _c;
            (_a = this.container) === null || _a === void 0 ? void 0 : _a.remove();
            this.view.map.remove((_b = this.sketchTool) === null || _b === void 0 ? void 0 : _b.layer);
            (_c = this.sketchTool) === null || _c === void 0 ? void 0 : _c.destroy();
            this.emit("destroy");
        }
        _updateState(properties) {
            let state = JSON.parse(JSON.stringify(this.state));
            Object.keys(properties).forEach((p) => {
                state[p] = properties[p];
            });
            this.state = state;
        }
    };
    __decorate([
        (0, decorators_1.property)()
    ], Editor.prototype, "options", void 0);
    __decorate([
        (0, decorators_1.property)()
    ], Editor.prototype, "state", void 0);
    Editor = __decorate([
        (0, decorators_1.subclass)("esri.widgets.editor")
    ], Editor);
    return Editor;
});
