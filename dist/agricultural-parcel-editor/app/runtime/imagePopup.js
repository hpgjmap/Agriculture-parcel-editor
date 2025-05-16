var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/Graphic", "esri/core/accessorSupport/decorators", "esri/geometry/Circle", "esri/geometry/projection", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleMarkerSymbol", "esri/widgets/Widget", "esri/widgets/support/widget", "esri/geometry/geometryEngine", "esri/symbols/PictureMarkerSymbol"], function (require, exports, Graphic_1, decorators_1, Circle_1, projection_1, SimpleFillSymbol_1, SimpleMarkerSymbol_1, Widget_1, widget_1, geometryEngine_1, PictureMarkerSymbol_1) {
    "use strict";
    Graphic_1 = __importDefault(Graphic_1);
    Circle_1 = __importDefault(Circle_1);
    projection_1 = __importDefault(projection_1);
    SimpleFillSymbol_1 = __importDefault(SimpleFillSymbol_1);
    SimpleMarkerSymbol_1 = __importDefault(SimpleMarkerSymbol_1);
    Widget_1 = __importDefault(Widget_1);
    geometryEngine_1 = __importDefault(geometryEngine_1);
    PictureMarkerSymbol_1 = __importDefault(PictureMarkerSymbol_1);
    let ImagePopup = class ImagePopup extends Widget_1.default {
        constructor(params) {
            super(params);
            this.clickHandlerRef = null;
            this.handleImageDataChange = (e) => {
                const { name, value } = e.target;
                if (name === "title") {
                    this._updateAppState({ isInvalid: value.trim() === "" });
                }
                this._updateAppState({
                    imageData: Object.assign(Object.assign({}, this.state.imageData), { [name]: value }),
                });
            };
            this.handleSave = () => {
                if (this.clickHandlerRef) {
                    this.clickHandlerRef.remove();
                    this.clickHandlerRef = null;
                }
                const checkDuplicate = this.fpFeatures.some((item) => item.title !== this.feature.attributes.title &&
                    item.title === this.state.imageData.title);
                if (checkDuplicate) {
                    this._updateAppState({ IsTitleDuplicate: true });
                    return;
                }
                this.setFpFeatures(this.updateFpFeatures(this.fpFeatures, this.featureId, this.state.imageData));
                const newGraphic = new Graphic_1.default({
                    geometry: this.state.imageData.location,
                    attributes: {
                        comment: this.state.imageData.comment,
                        title: this.state.imageData.title,
                        direction: this.state.imageData.direction,
                        [this.layer.objectIdField]: this.featureId,
                    },
                });
                this.layer
                    .applyEdits({
                    updateFeatures: [newGraphic],
                })
                    .then(() => {
                    console.log("Feature Updated.");
                    this.view.graphics.removeAll();
                    this.view.container.style.cursor = "auto";
                    this._updateAppState({ modifyLocation: false });
                    this.view.popup.close();
                })
                    .catch((error) => {
                    console.error("Error updating feature:", error);
                });
            };
            this.handleDelete = () => {
                this.layer
                    .applyEdits({
                    deleteFeatures: [{ objectId: this.featureId }],
                })
                    .then((result) => {
                    this.setFpFeatures(this.fpFeatures.filter((item) => item.id !== this.featureId));
                    console.log("Deleted feature with ID:", result);
                    this.view.popup.close();
                })
                    .catch((error) => {
                    console.error("Error deleting feature:", error);
                });
            };
            this.handleModifyLocation = () => {
                if (this.state.setDirection || this.state.modifyLocation) {
                    if (this.clickHandlerRef) {
                        this.clickHandlerRef.remove();
                        this.clickHandlerRef = null;
                    }
                    this.view.graphics.removeAll();
                    this.view.container.style.cursor = "auto";
                    this._updateAppState({ setDirection: false });
                    this._updateAppState({ modifyLocation: false });
                    return;
                }
                this.view.container.style.cursor = "crosshair";
                this.view.goTo({
                    target: this.feature.geometry,
                    zoom: 18,
                });
                const circleGeometry = new Circle_1.default({
                    center: this.feature.geometry,
                    radius: 50,
                    radiusUnit: "meters",
                    geodesic: true,
                });
                const circleGraphic = new Graphic_1.default({
                    geometry: circleGeometry,
                    symbol: new SimpleFillSymbol_1.default({
                        color: [0, 122, 194, 0.1],
                        outline: {
                            color: [0, 122, 194],
                            width: 2,
                        },
                    }),
                });
                this.view.graphics.add(circleGraphic);
                this._updateAppState({ modifyLocation: true });
                this.clickHandlerRef = this.view.on("click", (event) => {
                    event.stopPropagation();
                    const newGraphic = new Graphic_1.default({
                        geometry: event.mapPoint,
                        symbol: new SimpleMarkerSymbol_1.default({
                            color: [255, 0, 0],
                            size: 6,
                            outline: {
                                width: 1,
                                color: [255, 0, 0],
                            },
                        }),
                    });
                    const projectedCircle = projection_1.default.project(circleGeometry, event.mapPoint.spatialReference);
                    if (geometryEngine_1.default.contains(projectedCircle, event.mapPoint)) {
                        this.view.graphics.removeAll();
                        this.view.graphics.add(circleGraphic);
                        this.view.graphics.add(newGraphic);
                        this._updateAppState({
                            imageData: Object.assign(Object.assign({}, this.state.imageData), { location: event.mapPoint }),
                        });
                    }
                    else {
                        let dialog = document.createElement("calcite-alert");
                        dialog.open = true;
                        dialog.kind = "danger";
                        dialog.innerHTML = `<div slot="message" class="alert">
        <p class="text-18 weight-500">
          Modified point must be within the circle.
        </p>
        <p class="text-14 weight-normal color-83">
          The circle is of radius 50 meters.
        </p>
      </div>`;
                        document.body.appendChild(dialog);
                    }
                });
            };
            this.handleSetDirection = () => {
                this.view.goTo({
                    target: this.feature.geometry,
                    zoom: 18,
                });
                if (this.state.setDirection || this.state.modifyLocation) {
                    if (this.clickHandlerRef.current) {
                        this.clickHandlerRef.current.remove();
                        this.clickHandlerRef.current = null;
                    }
                    this.view.graphics.removeAll();
                    this.view.container.style.cursor = "auto";
                    this._updateAppState({ setDirection: false });
                    this._updateAppState({ modifyLocation: false });
                    return;
                }
                this.view.container.style.cursor = "crosshair";
                this._updateAppState({ setDirection: true });
                this.clickHandlerRef = this.view.on("click", (event) => {
                    event.stopPropagation();
                    const refPoint = this.feature.geometry;
                    const clickPoint = event.mapPoint;
                    const x1 = refPoint.x, y1 = refPoint.y;
                    const x2 = clickPoint.longitude, y2 = clickPoint.latitude;
                    const angle = this.getAngle(y1, x1, y2, x2);
                    console.log("Angle:", angle);
                    const newGraphic = new Graphic_1.default({
                        geometry: this.feature.geometry,
                        symbol: new PictureMarkerSymbol_1.default({
                            url: "app/images/direction.svg",
                            width: "140px",
                            height: "140px",
                            angle,
                        }),
                    });
                    this.view.graphics.removeAll();
                    this.view.graphics.add(newGraphic);
                    this._updateAppState({
                        imageData: Object.assign(Object.assign({}, this.state.imageData), { direction: angle }),
                    });
                });
            };
            this.updateFpFeatures = (prev, id, imageData) => {
                const existingIndex = prev.findIndex((item) => item.id === id);
                if (existingIndex !== -1) {
                    const updated = [...prev];
                    updated[existingIndex] = Object.assign(Object.assign({}, updated[existingIndex]), { title: imageData.title });
                    return updated;
                }
                else {
                    return [...prev, { id: id, title: imageData.title }];
                }
            };
            this.getAngle = (lat1, lon1, lat2, lon2) => {
                const toRadians = (deg) => deg * (Math.PI / 180);
                const toDegrees = (rad) => rad * (180 / Math.PI);
                const φ1 = toRadians(lat1);
                const φ2 = toRadians(lat2);
                const Δλ = toRadians(lon2 - lon1);
                const y = Math.sin(Δλ) * Math.cos(φ2);
                const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
                let θ = Math.atan2(y, x);
                θ = toDegrees(θ);
                return (θ + 360) % 360;
            };
        }
        postInitialize() {
            this.state = {
                imageData: {
                    title: this.title ? this.title : `Image_${this.featureId}`,
                    comment: this.comment
                        ? this.comment
                        : `This is Image_${this.featureId}`,
                    location: this.feature.geometry,
                    direction: this.feature.attributes.direction != null
                        ? this.feature.attributes.direction
                        : null,
                },
                confirmDelete: false,
                isInvalid: false,
                modifyLocation: false,
                setDirection: false,
                isTitleDuplicate: false,
            };
            projection_1.default.load();
            this.popupWatcher = this.view.popup.watch("visible", (v) => {
                if (!v) {
                    this.view.graphics.removeAll();
                    if (!this.title)
                        this.handleSave();
                }
            });
        }
        destroy() {
            var _a;
            (_a = this.popupWatcher) === null || _a === void 0 ? void 0 : _a.remove();
            super.destroy();
        }
        render() {
            return ((0, widget_1.tsx)("div", { class: "flex flex-column justify-between gap-10 w-full" },
                (0, widget_1.tsx)("div", { class: "flex gap-10" },
                    (0, widget_1.tsx)("calcite-button", { class: "w-half", onclick: this.handleModifyLocation, appearance: this.state.modifyLocation ? "solid" : "outline-fill", scale: "m", iconStart: "pin" }, "Set Location"),
                    (0, widget_1.tsx)("calcite-button", { onclick: this.handleSetDirection, scale: "m", appearance: !this.state.setDirection ? "outline-fill" : "solid", iconStart: "compass", style: {
                            "--calcite-button-background-color": this.state.setDirection
                                ? "rgb(87, 90, 88)"
                                : "white",
                            "--calcite-button-border-color": "rgb(87,90,88)",
                            "--calcite-button-text-color": this.state.setDirection
                                ? "white"
                                : "rgb(87,90,88)",
                            width: "50%",
                        }, class: `w-half ${this.state.setDirection
                            ? "set-direction-active"
                            : "set-direction-not-active"}` }, "Set Direction")),
                (0, widget_1.tsx)("div", { class: `flex flex-column w-full gap-10 justify-between ${this.state.confirmDelete || this.state.isTitleDuplicate
                        ? "opacity-40"
                        : "opacity-100"}` },
                    (0, widget_1.tsx)("div", { class: "flex flex-column gap-5" },
                        (0, widget_1.tsx)("span", { class: "text-16 weight-bold" }, "Title"),
                        (0, widget_1.tsx)("calcite-input", { disabled: this.state.confirmDelete || this.state.isTitleDuplicate, placeholder: "Enter the title", name: "title", value: this.state.imageData.title, oncalciteInputInput: this.handleImageDataChange })),
                    (0, widget_1.tsx)("div", { class: "flex flex-column gap-5" },
                        (0, widget_1.tsx)("span", { class: "text-16 weight-bold" }, "Comment"),
                        (0, widget_1.tsx)("calcite-input", { disabled: this.state.confirmDelete || this.state.isTitleDuplicate, name: "comment", placeholder: "Enter the comment", value: this.state.imageData.comment, oncalciteInputInput: this.handleImageDataChange })),
                    (0, widget_1.tsx)("div", { class: "flex flex-column gap-5" },
                        (0, widget_1.tsx)("span", { class: "text-16 weight-bold" }, "Captured Image"),
                        (0, widget_1.tsx)("img", { src: this.imageUrl, alt: "image" }))),
                this.state.confirmDelete ? ((0, widget_1.tsx)("calcite-notice", { kind: "danger", open: true, class: "confirm-delete" },
                    (0, widget_1.tsx)("calcite-label", { slot: "title", class: "weight-normal", scale: "m" }, "Are you sure you want to delete this item? This action is permanent and cannot be undone."),
                    (0, widget_1.tsx)("div", { slot: "message", class: "flex gap-10" },
                        (0, widget_1.tsx)("calcite-button", { slot: "secondary", width: "full", appearance: "outline", onclick: () => this._updateAppState({ confirmDelete: false }) }, "Cancel"),
                        (0, widget_1.tsx)("calcite-button", { slot: "primary", width: "full", kind: "danger", onclick: this.handleDelete }, "Delete")))) : ((0, widget_1.tsx)("div", null,
                    this.state.isTitleDuplicate && ((0, widget_1.tsx)("calcite-notice", { kind: "danger", open: true, class: "confirm-delete w-full", closable: true, oncalciteNoticeBeforeClose: () => this._updateAppState({ isTitleDuplicate: false }) },
                        (0, widget_1.tsx)("calcite-label", { slot: "title", class: "weight-normal", scale: "m" }, "This title is already in use. Please choose a different one."))),
                    (0, widget_1.tsx)("div", { class: "flex gap-5" },
                        (0, widget_1.tsx)("calcite-button", { class: "mt-15 w-full", onclick: this.handleSave, disabled: this.state.isInvalid || this.state.isTitleDuplicate }, this.title ? "Update" : "Save"),
                        (0, widget_1.tsx)("calcite-button", { class: "mt-15 w-full", slot: "secondary", width: "full", kind: "danger", appearance: "outline", onclick: () => {
                                this._updateAppState({ confirmDelete: true });
                            } }, "Delete"))))));
        }
        _updateAppState(properties) {
            let state = JSON.parse(JSON.stringify(this.state));
            Object.keys(properties).forEach((p) => {
                state[p] = properties[p];
            });
            this.state = state;
        }
    };
    __decorate([
        (0, decorators_1.property)()
    ], ImagePopup.prototype, "container", void 0);
    __decorate([
        (0, decorators_1.property)()
    ], ImagePopup.prototype, "state", void 0);
    ImagePopup = __decorate([
        (0, decorators_1.subclass)("esri.widgets.ImagePopup")
    ], ImagePopup);
    return ImagePopup;
});
