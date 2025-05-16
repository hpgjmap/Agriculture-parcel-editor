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
define(["require", "exports", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "esri/Map", "esri/views/MapView", "esri/portal/PortalItem", "esri/widgets/Expand", "esri/symbols/SimpleMarkerSymbol", "esri/layers/GeoJSONLayer", "esri/widgets/Popup", "esri/renderers/SimpleRenderer", "esri/symbols/PictureMarkerSymbol", "esri/widgets/LayerList", "esri/renderers/visualVariables/RotationVariable", "esri/renderers/UniqueValueRenderer", "./imagePopup", "./captureImage"], function (require, exports, decorators_1, Widget_1, widget_1, Map_1, MapView_1, PortalItem_1, Expand_1, SimpleMarkerSymbol_1, GeoJSONLayer_1, Popup, SimpleRenderer, PictureMarkerSymbol, LayerList, RotationVariable, UniqueValueRenderer, ImagePopup, CaptureImage) {
    "use strict";
    Widget_1 = __importDefault(Widget_1);
    Map_1 = __importDefault(Map_1);
    MapView_1 = __importDefault(MapView_1);
    PortalItem_1 = __importDefault(PortalItem_1);
    Expand_1 = __importDefault(Expand_1);
    SimpleMarkerSymbol_1 = __importDefault(SimpleMarkerSymbol_1);
    GeoJSONLayer_1 = __importDefault(GeoJSONLayer_1);
    let Photos = class Photos extends Widget_1.default {
        constructor(params) {
            super(params);
            this.mapRef = null;
            this.viewRef = null;
            this.apLayer = null;
            this.fpLayer = null;
            this.portal = null;
            this.activeLayer = null;
            this.customPopup = (feature) => {
                const div = document.createElement("div");
                const content = `
      <div>
         <p><strong>${feature.attributes.comment}</strong></p>
<p>Please respond between <strong>${new Date(feature.attributes.startdate).toLocaleDateString()}</strong> and <strong>${new Date(feature.attributes.enddate).toLocaleDateString()}</strong>.</p>
        <calcite-button
          id='reply'
          scale="m"
          color="primary"
        >
          Reply
        </calcite-button>
      </div>`;
                div.innerHTML = content;
                const replyButton = div.querySelector("#reply");
                if (replyButton) {
                    replyButton.addEventListener("click", () => {
                        this._updateAppState({ cameraActive: true });
                        this.activeLayer = this.apLayer;
                    });
                }
                return div;
            };
            this.loadCaptureImage = () => {
                const captureImage = new CaptureImage({
                    setCameraActive: (val) => this._updateAppState({ cameraActive: val }),
                    view: this.viewRef,
                    layer: this.activeLayer,
                    setFpFeatures: (val) => this._updateAppState({ fpFeatures: val }),
                    fpFeatures: this.state.fpFeatures,
                });
                captureImage.container = document.getElementById("capture-image");
            };
            this._loadMap = (container) => __awaiter(this, void 0, void 0, function* () {
                if (!this.viewRef) {
                    this.mapRef = new Map_1.default({
                        basemap: "streets-vector",
                    });
                    this.viewRef = new MapView_1.default({
                        container: "map-view",
                        map: this.mapRef,
                        center: [80.5929, 16.4937],
                        zoom: 11,
                    });
                    this.portal.load().then((item) => {
                        const renderer = new SimpleRenderer({
                            symbol: new PictureMarkerSymbol({
                                width: "40px",
                                height: "40px",
                                url: "app/images/arrow.svg",
                            }),
                            visualVariables: [
                                new RotationVariable({
                                    field: "direction",
                                    rotationType: "geographic",
                                }),
                            ],
                        });
                        const geojsonlayer = new GeoJSONLayer_1.default({
                            portalItem: item,
                            renderer: renderer,
                            popupTemplate: {
                                title: "{title}",
                                content: (feature) => this.customPopup(feature.graphic),
                            },
                        });
                        const initialGeoJSON = {
                            type: "FeatureCollection",
                            features: [],
                        };
                        const blob = new Blob([JSON.stringify(initialGeoJSON)], {
                            type: "application/json",
                        });
                        const url = URL.createObjectURL(blob);
                        this.fpLayer = new GeoJSONLayer_1.default({
                            url,
                            editingEnabled: true,
                            title: "FP Layer",
                            geometryType: "point",
                            fields: [
                                { name: "comment", type: "string", alias: "Comment" },
                                { name: "title", type: "string", alias: "Title" },
                                { name: "image", type: "string", alias: "Image URL" },
                                { name: "direction", type: "double", alias: "Direction" },
                                { name: "photoId", type: "string", alias: "Photo ID" },
                            ],
                            renderer: new UniqueValueRenderer({
                                valueExpression: `
    IIF(
      IsEmpty($feature.direction) || $feature.direction == null,
      'no-dir',
      'has-dir'
    )
  `,
                                uniqueValueInfos: [
                                    {
                                        value: "has-dir",
                                        symbol: new PictureMarkerSymbol({
                                            width: "40px",
                                            height: "40px",
                                            url: "app/images/fparrow.svg",
                                        }),
                                    },
                                    {
                                        value: "no-dir",
                                        symbol: new SimpleMarkerSymbol_1.default({
                                            style: "circle",
                                            color: [0, 122, 194],
                                            size: 6,
                                            outline: {
                                                color: [0, 122, 194],
                                                width: 1,
                                            },
                                        }),
                                    },
                                ],
                                visualVariables: [
                                    new RotationVariable({
                                        field: "direction",
                                        rotationType: "geographic",
                                    }),
                                ],
                            }),
                            popupTemplate: {
                                title: "Captured Image",
                                content: [
                                    {
                                        type: "fields",
                                        fieldInfos: [
                                            { fieldName: "comment", label: "Comment" },
                                            { fieldName: "direction", label: "Direction" },
                                        ],
                                    },
                                    {
                                        type: "media",
                                        mediaInfos: [
                                            {
                                                title: "{title}",
                                                type: "image",
                                                value: {
                                                    sourceURL: "{image}",
                                                },
                                            },
                                        ],
                                    },
                                ],
                            },
                        });
                        this.apLayer = geojsonlayer;
                        if (geojsonlayer && this.viewRef) {
                            const layerList = new LayerList({
                                view: this.viewRef,
                            });
                            const expandList = new Expand_1.default({
                                content: layerList,
                                view: this.viewRef,
                            });
                            this.viewRef.ui.add(expandList, "top-right");
                        }
                        geojsonlayer.queryFeatures().then((result) => {
                            const features = result.features.map((feature) => {
                                return Object.assign(Object.assign({}, feature.attributes), { geometry: feature.geometry });
                            });
                            this._updateAppState({ apFeatures: features });
                        });
                        this.mapRef.add(geojsonlayer);
                        this.mapRef.add(this.fpLayer);
                    });
                }
                if (!this.state.cameraActive && this.viewRef)
                    this.viewRef.container = "map-view";
            });
            this.openPopupForFeature = (layer, title) => __awaiter(this, void 0, void 0, function* () {
                this._updateAppState({ photosActive: false });
                const result = yield layer.queryFeatures({
                    where: `title = '${title.replace(/'/g, "''")}'`,
                    returnGeometry: true,
                    outFields: ["*"],
                });
                if (result.features.length) {
                    const feature = result.features[0];
                    yield this.viewRef.goTo(feature.geometry);
                    if (layer.title === "FP Layer") {
                        const popupContainer = document.createElement("div");
                        const imagePopup = new ImagePopup({
                            container: popupContainer,
                            imageUrl: feature.attributes.image,
                            view: this.viewRef,
                            layer: layer,
                            featureId: feature.attributes[layer.objectIdField],
                            setFpFeatures: (val) => this._updateAppState({ fpFeatures: val }),
                            title: feature.attributes.title,
                            comment: feature.attributes.comment,
                            feature: feature,
                            fpFeatures: this.state.fpFeatures,
                        });
                        const popup = new Popup({
                            title: "Captured Image",
                            location: feature.geometry,
                            content: popupContainer,
                            dockEnabled: true,
                            dockOptions: {
                                buttonEnabled: true,
                                breakpoint: false,
                                position: "top-right",
                            },
                        });
                        this.viewRef.popup = popup;
                        this.viewRef.openPopup();
                    }
                    else {
                        this.viewRef.openPopup({
                            features: [feature],
                            location: feature.geometry,
                        });
                    }
                }
            });
        }
        postInitialize() {
            return __awaiter(this, void 0, void 0, function* () {
                this.state = {
                    photosActive: false,
                    cameraActive: false,
                    fpFeatures: [],
                    apFeatures: [],
                };
                const params = new URLSearchParams(window.location.search);
                this.portal = new PortalItem_1.default({
                    id: params.get("id"),
                });
            });
        }
        render() {
            return ((0, widget_1.tsx)("calcite-shell", { class: "shell" }, !this.state.cameraActive ? ((0, widget_1.tsx)("div", { class: "shell" },
                (0, widget_1.tsx)("div", { slot: "header", class: "header" },
                    (0, widget_1.tsx)("h2", null, "Agriculture Land"),
                    (0, widget_1.tsx)("calcite-avatar", { fullName: "Ravi Kishan", scale: "l" })),
                (0, widget_1.tsx)("div", { class: "flex flex-1" },
                    (0, widget_1.tsx)("calcite-shell-panel", { slot: "panel-start", "width-scale": "auto" },
                        (0, widget_1.tsx)("calcite-panel", null,
                            (0, widget_1.tsx)("calcite-action", { icon: "home" }),
                            (0, widget_1.tsx)("calcite-action", { icon: "home" }))),
                    (0, widget_1.tsx)("div", { class: "flex flex-1" },
                        (0, widget_1.tsx)("div", { id: "map-view", class: "flex-1", afterCreate: this._loadMap, bind: this }),
                        this.state.photosActive && ((0, widget_1.tsx)("calcite-shell-panel", { "width-scale": "m" },
                            (0, widget_1.tsx)("calcite-panel", { heading: "Photos" },
                                (0, widget_1.tsx)("calcite-button", { onclick: () => {
                                        this._updateAppState({ cameraActive: true });
                                        this.activeLayer = this.fpLayer;
                                    }, bind: this }, "New"),
                                (0, widget_1.tsx)("calcite-list", null,
                                    (0, widget_1.tsx)("calcite-list-item-group", { heading: "List Required" }, this.state.apFeatures.length > 0 &&
                                        this.state.apFeatures.map((feature) => ((0, widget_1.tsx)("calcite-list-item", { oncalciteListItemSelect: () => this.openPopupForFeature(this.apLayer, feature.title), key: feature.title, label: feature.title })))),
                                    (0, widget_1.tsx)("calcite-list-item-group", { heading: "List Taken" }, this.state.fpFeatures.length > 0 &&
                                        this.state.fpFeatures.map((feature) => ((0, widget_1.tsx)("calcite-list-item", { key: feature.id, label: feature.title, oncalciteListItemSelect: () => this.openPopupForFeature(this.fpLayer, feature.title) }))))),
                                (0, widget_1.tsx)("div", { slot: "footer", class: "flex gap-10" },
                                    (0, widget_1.tsx)("calcite-button", { slot: "footer", class: "save", disabled: this.state.fpFeatures.length === 0 }, "Save to Portal")))))),
                    (0, widget_1.tsx)("calcite-shell-panel", { slot: "panel-end", "width-scale": "auto" },
                        (0, widget_1.tsx)("calcite-action", { icon: "images", onclick: () => this._updateAppState({
                                photosActive: !this.state.photosActive,
                            }), bind: this, active: this.state.photosActive }))))) : ((0, widget_1.tsx)("div", { id: "capture-image", afterCreate: this.loadCaptureImage, bind: this }))));
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
    ], Photos.prototype, "options", void 0);
    __decorate([
        (0, decorators_1.property)()
    ], Photos.prototype, "state", void 0);
    Photos = __decorate([
        (0, decorators_1.subclass)("esri.widgets.Photos")
    ], Photos);
    return Photos;
});
