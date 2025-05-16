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
define(["require", "exports", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "esri/views/MapView", "esri/WebMap", "esri/portal/PortalItem", "esri/identity/IdentityManager", "esri/identity/OAuthInfo", "esri/widgets/BasemapGallery", "esri/widgets/Measurement", "esri/widgets/Home", "esri/widgets/Search", "esri/widgets/ScaleBar", "esri/widgets/Expand", "esri/request", "esri/portal/Portal", "esri/layers/GeoJSONLayer", "esri/layers/GraphicsLayer", "esri/geometry/Circle", "esri/geometry/Polygon", "esri/geometry/geometryEngine", "esri/Graphic", "esri/geometry/SpatialReference", "esri/widgets/Sketch", "esri/portal/PortalGroup", "esri/renderers/UniqueValueRenderer", "esri/renderers/SimpleRenderer", "esri/widgets/FeatureForm", "esri/geometry/operators/reshapeOperator", "esri/geometry/operators/cutOperator", "esri/geometry/operators/areaOperator", "esri/geometry/operators/geodeticAreaOperator", "app/editor", "./captureImage", "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleMarkerSymbol", "esri/geometry/projection"], function (require, exports, decorators_1, Widget_1, widget_1, MapView_1, WebMap_1, PortalItem_1, IdentityManager_1, OAuthInfo_1, BasemapGallery_1, Measurement_1, Home_1, Search_1, ScaleBar_1, Expand_1, request_1, Portal_1, GeoJSONLayer_1, GraphicsLayer_1, Circle_1, Polygon_1, geometryEngine_1, Graphic_1, SpatialReference_1, Sketch_1, PortalGroup_1, UniqueValueRenderer_1, SimpleRenderer_1, FeatureForm_1, reshapeOperator_1, cutOperator_1, areaOperator_1, geodeticAreaOperator_1, editor_1, captureImage_1, PictureMarkerSymbol_1, SimpleFillSymbol_1, SimpleMarkerSymbol_1, projection_1) {
    "use strict";
    Widget_1 = __importDefault(Widget_1);
    MapView_1 = __importDefault(MapView_1);
    WebMap_1 = __importDefault(WebMap_1);
    PortalItem_1 = __importDefault(PortalItem_1);
    IdentityManager_1 = __importDefault(IdentityManager_1);
    OAuthInfo_1 = __importDefault(OAuthInfo_1);
    BasemapGallery_1 = __importDefault(BasemapGallery_1);
    Measurement_1 = __importDefault(Measurement_1);
    Home_1 = __importDefault(Home_1);
    Search_1 = __importDefault(Search_1);
    ScaleBar_1 = __importDefault(ScaleBar_1);
    Expand_1 = __importDefault(Expand_1);
    request_1 = __importDefault(request_1);
    Portal_1 = __importDefault(Portal_1);
    GeoJSONLayer_1 = __importDefault(GeoJSONLayer_1);
    GraphicsLayer_1 = __importDefault(GraphicsLayer_1);
    Circle_1 = __importDefault(Circle_1);
    Polygon_1 = __importDefault(Polygon_1);
    geometryEngine_1 = __importDefault(geometryEngine_1);
    Graphic_1 = __importDefault(Graphic_1);
    SpatialReference_1 = __importDefault(SpatialReference_1);
    Sketch_1 = __importDefault(Sketch_1);
    PortalGroup_1 = __importDefault(PortalGroup_1);
    UniqueValueRenderer_1 = __importDefault(UniqueValueRenderer_1);
    SimpleRenderer_1 = __importDefault(SimpleRenderer_1);
    FeatureForm_1 = __importDefault(FeatureForm_1);
    reshapeOperator_1 = __importDefault(reshapeOperator_1);
    cutOperator_1 = __importDefault(cutOperator_1);
    areaOperator_1 = __importDefault(areaOperator_1);
    geodeticAreaOperator_1 = __importDefault(geodeticAreaOperator_1);
    editor_1 = __importDefault(editor_1);
    captureImage_1 = __importDefault(captureImage_1);
    PictureMarkerSymbol_1 = __importDefault(PictureMarkerSymbol_1);
    SimpleFillSymbol_1 = __importDefault(SimpleFillSymbol_1);
    SimpleMarkerSymbol_1 = __importDefault(SimpleMarkerSymbol_1);
    projection_1 = __importDefault(projection_1);
    let Agricultural_Parcel_Editor = class Agricultural_Parcel_Editor extends Widget_1.default {
        constructor(params) {
            super(params);
            this.view = null;
            this.baseImageList = [];
            this.requestMade = {
                notes: false,
                comments: false,
            };
            this.farmerNotes = [];
            this.farmerComments = [];
            this.agencyRequests = [];
            this.parcelList = [];
            this.trackChanges = {
                undo: {},
                redo: {},
            };
            this.lastEditsInMemory = [];
            this.currFeature = null;
            this.locationClick = null;
            this.directionClick = null;
            this.loadCaptureImage = () => {
                const captureImage = new captureImage_1.default({
                    setCameraActive: (val) => this._updateState({ cameraActive: val }),
                    view: this.view,
                    layer: this._getLayer("farmer-photos"),
                    setFpFeatures: (val) => this._updateState({ fpFeatures: val }),
                    fpFeatures: this.state.fpFeatures,
                    formTemplate: this._getFormTemplate("farmer-photos"),
                    nls: this.nls,
                    currFeature: this.currFeature,
                    save: this.state.save,
                    setSave: (val) => this._updateState({ save: val }),
                });
                captureImage.container = document.getElementById("capture-image");
            };
            this._handleListChange = (e) => {
                var _a, _b, _c, _d;
                if ((_c = (_b = (_a = e.currentTarget) === null || _a === void 0 ? void 0 : _a.selectedItems) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.value) {
                    const value = (_d = e.currentTarget.selectedItems) === null || _d === void 0 ? void 0 : _d[0].value;
                    const [type, requestId] = value.split("-");
                    const layer = type === "required"
                        ? this._getLayer("required-photos")
                        : this._getLayer("farmer-photos");
                    this.openPopupForFeature(layer, requestId, e);
                }
                else
                    this._removeEditor(false);
            };
            this.openPopupForFeature = (layer, requestId, e) => __awaiter(this, void 0, void 0, function* () {
                const result = yield layer.queryFeatures({
                    where: `requestId = '${requestId.replace(/'/g, "''")}'`,
                    returnGeometry: true,
                    outFields: ["*"],
                });
                if (result.features.length) {
                    const feature = result.features[0];
                    yield this.view.goTo(feature.geometry);
                    const element = document.createElement("div");
                    layer.editingEnabled = true;
                    if (layer === this._getLayer("farmer-photos")) {
                        this._removeEditor(false);
                        this.currentEditor = this._editFeatureWidget(feature, layer);
                        setTimeout(() => {
                            const flow = this.currentEditor.container.querySelector("calcite-flow");
                            if (!flow) {
                                console.warn("calcite-flow not found");
                                return;
                            }
                            const flowItem = flow.querySelector("calcite-flow-item");
                            const secondFlowItem = flowItem;
                            const formTemplate = secondFlowItem.querySelector(".form-template");
                            if (formTemplate) {
                                const div = document.createElement("div");
                                div.innerHTML = `
              <calcite-button id='set-location' icon-start='pin'>${this.nls.setLocation}</calcite-button>
              <calcite-button id='set-direction'  icon-start='compass'> ${this.nls.setDirection} </calcite-button>
              `;
                                const setLocationBtn = div.querySelector("#set-location");
                                const setDirectionBtn = div.querySelector("#set-direction");
                                setLocationBtn.setAttribute("appearance", this.state.modifyLocation ? "solid" : "outline-fill");
                                setDirectionBtn.setAttribute("appearance", !this.state.setDirection ? "outline-fill" : "solid");
                                if (setLocationBtn) {
                                    setLocationBtn.addEventListener("click", () => {
                                        this.handleModifyLocation(feature);
                                    });
                                }
                                if (setDirectionBtn) {
                                    setDirectionBtn.addEventListener("click", () => {
                                        this.handleSetDirection(feature);
                                    });
                                }
                                div.style.display = "flex";
                                div.style.gap = "2px";
                                div.style.marginTop = "10px";
                                div.style.justifyContent = "center";
                                const img = document.createElement("img");
                                img.src = this.getBase64ImageSrc(feature.attributes.image);
                                img.style.height = "auto";
                                img.style.width = "auto";
                                img.style.margin = "0 10px 10px 10px";
                                formTemplate.insertBefore(div, formTemplate.firstChild);
                                formTemplate.appendChild(img);
                            }
                            else {
                                console.warn("form-template not found inside second flow-item");
                            }
                        }, 300);
                        this.layerEditHandler = layer.on("edits", (result) => {
                            if (result.edits.deleteFeatures.length > 0) {
                                this._updateState({
                                    fpFeatures: this.state.fpFeatures.filter((item) => item[layer.objectIdField] !==
                                        result.edits.deleteFeatures[0].objectId),
                                });
                            }
                            if (result.edits.updateFeatures.length > 0) {
                                this.handleUpdate(result.updatedFeatures[0].objectId, layer, feature.attributes.cameraHeading);
                            }
                            this._updateState({ save: Object.assign(Object.assign({}, this.state.save), { photos: true }) });
                        });
                    }
                    else {
                        this._removeEditor(false);
                        this.currentEditor = this._getFeatureWidget(feature);
                        let container = this.currentEditor.container;
                        const img = document.createElement("img");
                        img.src = this.getBase64ImageSrc(feature.attributes.image);
                        img.style.width = "270px";
                        img.style.marginBottom = "30px";
                        this.currentEditor.when().then(() => {
                            if (container.children.length >= 1) {
                                container.insertBefore(img, container.children[container.children.length - 1]);
                            }
                            else {
                                container.appendChild(img);
                            }
                        });
                    }
                }
            });
            this.handleUpdate = (id, layer, initialAngle) => {
                if (this.locationClick) {
                    this.locationClick.remove();
                    this.locationClick = null;
                }
                if (this.directionClick) {
                    this.directionClick.remove();
                    this.directionClick = null;
                }
                const newGraphic = new Graphic_1.default({
                    geometry: this.state.modifyLocation
                        ? this.state.imageData.location
                        : null,
                    attributes: {
                        cameraHeading: this.state.setDirection
                            ? this.state.imageData.cameraHeading
                            : 0,
                        [layer.objectIdField]: id,
                    },
                });
                layer
                    .applyEdits({
                    updateFeatures: [newGraphic],
                })
                    .then(() => __awaiter(this, void 0, void 0, function* () {
                    this.view.graphics.removeAll();
                    this.view.container.style.cursor = "auto";
                    this._updateState({ modifyLocation: false });
                    this._updateState({ setDirection: false });
                }))
                    .catch((error) => {
                    console.error("Error updating feature:", error);
                });
            };
            this.handleModifyLocation = (feature) => {
                const wasActive = this.state.modifyLocation;
                if (wasActive && this.locationClick) {
                    this.locationClick.remove();
                    this.locationClick = null;
                    const graphics = this.view.graphics.filter((graphic) => graphic.symbol.type === "simple-fill" ||
                        graphic.symbol.type === "simple-marker");
                    this.view.graphics.removeMany(graphics);
                    this.view.container.style.cursor = "auto";
                    this._updateState({ modifyLocation: false, setDirection: false });
                    this.updateButtonStyles();
                    return;
                }
                if (this.state.setDirection && this.directionClick) {
                    this.directionClick.remove();
                    this.directionClick = null;
                    const graphic = this.view.graphics.find((graphic) => graphic.symbol.type === "picture-marker");
                    this.view.graphics.remove(graphic);
                }
                this.view.container.style.cursor = "crosshair";
                this.view.goTo({
                    target: feature.geometry,
                    zoom: 18,
                });
                const circleGeometry = new Circle_1.default({
                    center: feature.geometry,
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
                this._updateState({ modifyLocation: true, setDirection: false });
                this.updateButtonStyles();
                this.locationClick = this.view.on("click", (event) => {
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
                        const graphics = this.view.graphics.filter((graphic) => graphic.symbol.type === "simple-fill" ||
                            graphic.symbol.type === "simple-marker");
                        this.view.graphics.removeMany(graphics);
                        this.view.graphics.add(circleGraphic);
                        this.view.graphics.add(newGraphic);
                        this._updateState({
                            imageData: Object.assign(Object.assign({}, this.state.imageData), { location: event.mapPoint }),
                        });
                    }
                    else {
                        const dialog = document.createElement("calcite-alert");
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
            this.handleSetDirection = (feature) => {
                const wasActive = this.state.setDirection;
                if (wasActive && this.directionClick) {
                    this.directionClick.remove();
                    this.directionClick = null;
                    const graphic = this.view.graphics.find((graphic) => graphic.symbol.type === "picture-marker");
                    this.view.graphics.remove(graphic);
                    this.view.container.style.cursor = "auto";
                    this._updateState({ setDirection: false, modifyLocation: false });
                    this.updateButtonStyles();
                    return;
                }
                if (this.state.modifyLocation && this.locationClick) {
                    this.locationClick.remove();
                    this.locationClick = null;
                    const graphics = this.view.graphics.filter((graphic) => graphic.symbol.type === "simple-fill" ||
                        graphic.symbol.type === "simple-marker");
                    this.view.graphics.removeMany(graphics);
                }
                this.view.container.style.cursor = "crosshair";
                this.view.goTo({
                    target: feature.geometry,
                    zoom: 18,
                });
                this._updateState({ setDirection: true, modifyLocation: false });
                this.updateButtonStyles();
                this.directionClick = this.view.on("click", (event) => {
                    event.stopPropagation();
                    const refPoint = feature.geometry;
                    const clickPoint = event.mapPoint;
                    const x1 = refPoint.x, y1 = refPoint.y;
                    const x2 = clickPoint.longitude, y2 = clickPoint.latitude;
                    const angle = this.getAngle(y1, x1, y2, x2);
                    console.log("Angle:", angle);
                    const newGraphic = new Graphic_1.default({
                        geometry: feature.geometry,
                        symbol: new PictureMarkerSymbol_1.default({
                            url: "app/images/direction.svg",
                            width: "140px",
                            height: "140px",
                            angle,
                        }),
                    });
                    const graphic = this.view.graphics.find((graphic) => graphic.symbol.type === "picture-marker");
                    this.view.graphics.remove(graphic);
                    this.view.graphics.add(newGraphic);
                    this._updateState({
                        imageData: Object.assign(Object.assign({}, this.state.imageData), { cameraHeading: angle }),
                    });
                });
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
            return __awaiter(this, void 0, void 0, function* () {
                let param, webmap, theme, farmerID;
                param = new URL(location.href).searchParams;
                webmap = param.get("webmap");
                theme = param.get("theme") || this._getBrowserTheme();
                this.options.webmap = webmap;
                this.state = {
                    error: "",
                    notification: "",
                    user: "",
                    theme: { menu: false, value: theme },
                    title: this.nls[this.options.appTitle.split("nls.")[1]],
                    farmerID: "loading",
                    rightTool: "parcels",
                    currentBasemap: "",
                    currentBaseImage: "",
                    referenceParcelsToggle: false,
                    agriculturalParcelsOutlineToggle: false,
                    agriculturalParcelsFillToggle: false,
                    agriculturalZonesToggle: false,
                    requestsLayerToggle: false,
                    requiredPhotosLayerToggle: false,
                    farmerPhotosLayerToggle: false,
                    notesLayerToggle: false,
                    currentMeasurementTool: "",
                    showDeleteConfirmation: false,
                    updateList: false,
                    selectParcels: true,
                    editBoundaryTool: "",
                    save: {
                        parcels: false,
                        notes: false,
                        comments: false,
                        photos: false,
                    },
                    confirmationDialog: {
                        comments: false,
                        review: false,
                        declare: false,
                    },
                    parcelEdit: {
                        undo: false,
                        redo: false,
                    },
                    declare: false,
                    apFeatures: [],
                    fpFeatures: [],
                    cameraActive: false,
                    modifyLocation: false,
                    setDirection: false,
                    imageData: {
                        location: null,
                        cameraHeading: 0,
                    },
                };
                this._toggleTheme(theme);
                if (this.options.appID) {
                    const oauthInfo = new OAuthInfo_1.default({
                        appId: this.options.appID,
                        portalUrl: this.options.portalURL,
                        popup: false,
                    });
                    IdentityManager_1.default.registerOAuthInfos([oauthInfo]);
                }
                this.portal = new Portal_1.default({
                    url: this.options.portalURL,
                });
                this.portal.authMode = "immediate";
                yield this.portal
                    .load()
                    .then(() => { })
                    .catch(() => { });
                yield this._loginUser();
                window.addEventListener("beforeunload", (e) => {
                    if (this.state.save.comments ||
                        this.state.save.parcels ||
                        this.state.save.notes ||
                        this.state.save.photos) {
                        e.preventDefault();
                        e.returnValue = "";
                    }
                });
            });
        }
        render() {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            let content, mainTemplate, loadingScrim, userPopup;
            if (this.state.farmerID && this.state.farmerID !== "loading") {
                let { currentBasemap, error, rightTool, currentBaseImage, notification } = this.state;
                let errorAlert, requestsAction, notesAction, requiredPhotosAction, farmerPhotosAction, baseImageAction, basemapActions, addRequestAction, addNoteAction, addImageAction, addRequestContainer, addImageContainer, addNoteContainer, deleteModal, parcelList, parcelBoundaryActions, selectParcelInfo, themeMenu, confirmationDialog, notificationAlert;
                if (this.state.theme.menu) {
                    themeMenu = ((0, widget_1.tsx)("calcite-flow-item", { heading: "Appearance", oncalciteFlowItemBack: this._themeMenu, bind: this, selected: true },
                        (0, widget_1.tsx)("calcite-action", { icon: "brightness", "text-enabled": "true", text: this.nls.light, bind: this, onclick: () => {
                                this._toggleTheme("light");
                            } }),
                        (0, widget_1.tsx)("calcite-action", { icon: "moon", "text-enabled": "true", text: this.nls.dark, bind: this, onclick: () => {
                                this._toggleTheme("dark");
                            } })));
                }
                if (error) {
                    errorAlert = ((0, widget_1.tsx)("calcite-alert", { open: "true", kind: "danger", scale: "m", placement: "bottom", slot: "alerts", oncalciteAlertClose: () => {
                            this._updateState({ error: "" });
                        }, bind: this },
                        (0, widget_1.tsx)("div", { slot: "title" }, this.nls.error),
                        (0, widget_1.tsx)("div", { slot: "message" }, error)));
                }
                if (notification) {
                    notificationAlert = ((0, widget_1.tsx)("calcite-alert", { open: "true", kind: "warning", scale: "m", placement: "bottom", slot: "alerts", oncalciteAlertClose: () => {
                            this._updateState({ notification: "" });
                        }, bind: this },
                        (0, widget_1.tsx)("div", { slot: "message" }, notification)));
                }
                userPopup = ((0, widget_1.tsx)("calcite-popover", { id: "settings-menu", label: "", "reference-element": "user-thumbnail", "auto-close": "true", "pointer-disabled": "true", "overlay-positioning": "fixed", placement: "bottom-leading" },
                    (0, widget_1.tsx)("calcite-flow", { id: "flow-panel" },
                        (0, widget_1.tsx)("calcite-flow-item", { selected: !themeMenu },
                            (0, widget_1.tsx)("calcite-block", { heading: (_a = this.user) === null || _a === void 0 ? void 0 : _a.fullName, description: (_b = this.user) === null || _b === void 0 ? void 0 : _b.username, class: "user-popup-block" },
                                (0, widget_1.tsx)("calcite-avatar", { scale: "m", slot: "icon", "full-name": (_c = this.user) === null || _c === void 0 ? void 0 : _c.username, thumbnail: this.user.getThumbnailUrl(150) })),
                            (0, widget_1.tsx)("calcite-block", { open: true, class: "user-popup-block disable-block-padding" },
                                (0, widget_1.tsx)("calcite-button", { class: "display-inline-flex", alignment: "icon-end-space-between", appearance: "transparent", kind: "neutral", scale: "l", "icon-end": "chevron-right", "icon-start": this.state.theme.value === "light" ? "brightness" : "moon", width: "full", bind: this, onclick: this._themeMenu },
                                    this.nls.appearance,
                                    ":",
                                    this.state.theme.value === "light"
                                        ? " " + this.nls.light
                                        : " " + this.nls.dark)),
                            (0, widget_1.tsx)("calcite-block", { open: true, class: "user-popup-block disable-block-padding" },
                                (0, widget_1.tsx)("calcite-button", { appearance: "transparent", scale: "l", alignment: "start", kind: "neutral", "icon-start": "sign-out", width: "full", onclick: this._signOut, bind: this }, this.nls.signOut))),
                        themeMenu)));
                if ((_f = (_e = (_d = this.basemapWidget) === null || _d === void 0 ? void 0 : _d.source) === null || _e === void 0 ? void 0 : _e.basemaps) === null || _f === void 0 ? void 0 : _f.length) {
                    let actions = this.basemapWidget.source.basemaps.map((basemap) => {
                        return ((0, widget_1.tsx)("calcite-action", { title: basemap.title, text: basemap.title, "text-enabled": "true", active: currentBasemap === basemap.title, onclick: () => {
                                this._updateBasemap(basemap.title);
                            } }));
                    });
                    basemapActions = ((0, widget_1.tsx)("calcite-action-menu", { key: "basemap-menu", placement: "trailing-start", scale: "m", "overlay-positioning": "fixed" },
                        (0, widget_1.tsx)("calcite-action", { slot: "trigger", title: this.nls.basemaps, text: this.nls.basemaps, icon: "basemap" }),
                        actions.items));
                }
                if (this.baseImageList.length) {
                    let actions = this.baseImageList.map((layer) => {
                        return ((0, widget_1.tsx)("calcite-action", { title: layer.title, text: layer.title, "text-enabled": "true", active: currentBaseImage === layer.title, onclick: () => {
                                this._updateBaseImage(layer.title);
                            } }));
                    });
                    baseImageAction = ((0, widget_1.tsx)("calcite-action-menu", { key: "base-image-menu", placement: "trailing-start", scale: "m", "overlay-positioning": "fixed" },
                        (0, widget_1.tsx)("calcite-action", { slot: "trigger", title: this.nls.baseImage, text: this.nls.baseImage, icon: "image-layer" }),
                        actions.items));
                }
                if (this._getLayer("agency-requests") ||
                    this._getLayer("farmer-comments")) {
                    let commentsList, requestsList;
                    if ((_g = this.farmerComments) === null || _g === void 0 ? void 0 : _g.length) {
                        commentsList = ((0, widget_1.tsx)("calcite-list-item-group", { heading: this.nls.comments, key: "comments-group" }, this.farmerComments.map((comment) => {
                            return ((0, widget_1.tsx)("calcite-list-item", { value: comment.attributes[comment.layer.objectIdField] +
                                    "_comments", label: comment.attributes[this._getFieldFromLayer(comment.layer, "name")], key: comment.attributes[comment.layer.objectIdField] +
                                    "_comments" }));
                        })));
                    }
                    if ((_h = this.agencyRequests) === null || _h === void 0 ? void 0 : _h.length) {
                        requestsList = ((0, widget_1.tsx)("calcite-list-item-group", { heading: this.nls.requests, key: "requests-group" }, this.agencyRequests.map((request) => {
                            return ((0, widget_1.tsx)("calcite-list-item", { value: request.attributes[request.layer.objectIdField] +
                                    "_requests", label: request.attributes[this._getFieldFromLayer(request.layer, "name")], key: request.attributes[request.layer.objectIdField] +
                                    "_requests" }));
                        })));
                    }
                    requestsAction = ((0, widget_1.tsx)("calcite-action", { active: this.state.requestsLayerToggle, "data-action-id": "requestsLayer", text: this.nls.requestsComments, scale: "m", title: this.nls.requestsComments, icon: "speech-bubble", onclick: this._requestsLayerToggle, bind: this }));
                    addRequestAction = ((0, widget_1.tsx)("calcite-action", { disabled: this.state.declare, active: this.state.rightTool === "requests", text: this.nls.requests, scale: "m", title: this.nls.requests, icon: "speech-bubble-plus", onclick: ({ target }) => {
                            this._toggleRightTool(target, "requests");
                        }, bind: this }));
                    addRequestContainer = ((0, widget_1.tsx)("calcite-panel", { class: "panel-height", heading: this.nls.requests, "height-scale": "l", closable: true, "data-panel-id": "requests", closed: rightTool !== "requests", hidden: rightTool !== "requests", oncalcitePanelClose: () => {
                            this._closeRightTool("requests");
                        }, bind: this },
                        (0, widget_1.tsx)("div", { id: "requests-container", class: "margin-panel" },
                            (0, widget_1.tsx)("calcite-button", { "icon-start": "plus", appearance: "solid", class: "btn-display-flex", kind: "brand", onclick: this._addComment, bind: this }, this.nls.newComment),
                            (0, widget_1.tsx)("calcite-list", { scale: "m", "selection-mode": "single", "selection-appearance": "border", "filter-enabled": "true", "filter-placeholder": this.nls.search, oncalciteListChange: this._selectRequestsComments, bind: this },
                                requestsList,
                                commentsList)),
                        (0, widget_1.tsx)("calcite-button", { slot: "footer", disabled: !this.state.save.comments, appearance: "solid", kind: "brand", onclick: ({ target }) => {
                                this._saveFile("farmer-comments", target);
                            }, bind: this }, this.nls.save)));
                }
                if (this._getLayer("farmer-notes")) {
                    let notesList;
                    if ((_j = this.farmerNotes) === null || _j === void 0 ? void 0 : _j.length) {
                        notesList = ((0, widget_1.tsx)("calcite-list", { scale: "m", "selection-appearance": "border", "selection-mode": "single", "filter-enabled": "true", "filter-placeholder": this.nls.search, oncalciteListChange: this._selectNotes, bind: this }, this.farmerNotes.map((note) => {
                            return ((0, widget_1.tsx)("calcite-list-item", { value: note.attributes[note.layer.objectIdField], label: note.attributes[this._getFieldFromLayer(note.layer, "name")], key: note.attributes[note.layer.objectIdField] + "_notes" }));
                        })));
                    }
                    else {
                        notesList = ((0, widget_1.tsx)("calcite-notice", { open: true, icon: "information" },
                            (0, widget_1.tsx)("div", { slot: "message" }, this.nls.noNotes)));
                    }
                    notesAction = ((0, widget_1.tsx)("calcite-action", { active: this.state.notesLayerToggle, "data-action-id": "notesLayer", text: this.nls.notes, scale: "m", title: this.nls.notes, icon: "notepad", onclick: this._notesLayerToggle, bind: this }));
                    addNoteAction = ((0, widget_1.tsx)("calcite-action", { disabled: this.state.declare, active: this.state.rightTool === "notes", text: this.nls.notes, scale: "m", title: this.nls.notes, icon: "notepad-add", onclick: ({ target }) => {
                            this._toggleRightTool(target, "notes");
                        }, bind: this }));
                    addNoteContainer = ((0, widget_1.tsx)("calcite-panel", { class: "panel-height", heading: this.nls.notes, "height-scale": "l", closable: true, "data-panel-id": "notes", closed: rightTool !== "notes", hidden: rightTool !== "notes", oncalcitePanelClose: () => {
                            this._closeRightTool("notes");
                        }, bind: this },
                        (0, widget_1.tsx)("div", { id: "notes-container", class: "margin-panel" },
                            (0, widget_1.tsx)("calcite-button", { "icon-start": "plus", appearance: "solid", kind: "brand", class: "btn-display-flex", onclick: this._addNewNote, bind: this }, this.nls.newNote),
                            notesList),
                        (0, widget_1.tsx)("calcite-button", { slot: "footer", disabled: !this.state.save.notes, appearance: "solid", kind: "brand", onclick: ({ target }) => {
                                this._saveFile("farmer-notes", target);
                            }, bind: this }, this.nls.save)));
                }
                if (this._getLayer("required-photos") ||
                    this._getLayer("farmer-photos")) {
                    requiredPhotosAction = ((0, widget_1.tsx)("calcite-action", { active: this.state.requiredPhotosLayerToggle, "data-action-id": "requiredPhotosLayer", text: this.nls.requiredPhotos, scale: "m", title: this.nls.requiredPhotos, icon: "camera", onclick: this._requiredPhotosLayerToggle, bind: this }));
                    addImageAction = ((0, widget_1.tsx)("calcite-action", { active: this.state.rightTool === "photos", text: this.nls.photos, scale: "m", title: this.nls.photos, icon: "image-plus", onclick: ({ target }) => {
                            this._toggleRightTool(target, "photos");
                        }, bind: this }));
                    addImageContainer = ((0, widget_1.tsx)("calcite-panel", { class: "panel-height", heading: this.nls.photos, "height-scale": "l", closable: true, "data-panel-id": "photos", closed: rightTool !== "photos", hidden: rightTool !== "photos", oncalcitePanelClose: () => {
                            this._closeRightTool("photos");
                        }, bind: this },
                        (0, widget_1.tsx)("div", { id: "photos-container", class: "margin-panel" },
                            (0, widget_1.tsx)("calcite-button", { "icon-start": "camera-plus", onclick: () => {
                                    this._removeEditor(false);
                                    this._updateState({ cameraActive: true });
                                }, appearance: "solid", kind: "brand", class: "btn-display-flex", bind: this }, this.nls.new),
                            (0, widget_1.tsx)("calcite-list", { scale: "m", "selection-mode": "single", "selection-appearance": "border", "filter-enabled": "true", "filter-placeholder": this.nls.search, oncalciteListChange: this._handleListChange },
                                (0, widget_1.tsx)("calcite-list-item-group", { heading: this.nls.listRequired }, this.state.apFeatures.map((feature) => ((0, widget_1.tsx)("calcite-list-item", { key: feature.requestId, label: feature.requestId, value: `required-${feature.requestId}` })))),
                                (0, widget_1.tsx)("calcite-list-item-group", { heading: this.nls.listTaken }, this.state.fpFeatures.map((feature) => ((0, widget_1.tsx)("calcite-list-item", { key: feature.requestId, label: feature.requestId, value: `taken-${feature.requestId}` })))))),
                        (0, widget_1.tsx)("calcite-button", { slot: "footer", disabled: !this.state.save.photos, appearance: "solid", kind: "brand", onclick: ({ target }) => {
                                this._saveFile("farmer-photos", target);
                            }, bind: this }, this.nls.save)));
                }
                if (this._getLayer("farmer-photos")) {
                    farmerPhotosAction = ((0, widget_1.tsx)("calcite-action", { active: this.state.farmerPhotosLayerToggle, "data-action-id": "farmerPhotosLayer", text: this.nls.farmerPhotos, scale: "m", title: this.nls.farmerPhotos, icon: "image", onclick: this._farmerPhotosLayerToggle, bind: this }));
                }
                if (this.state.showDeleteConfirmation) {
                    deleteModal = ((0, widget_1.tsx)("calcite-dialog", { slot: "dialogs", modal: true, scale: "s", "width-scale": "s", heading: this.nls.delete, width: "s", kind: "danger", open: this.state.showDeleteConfirmation, oncalciteDialogClose: () => {
                            this._updateState({ showDeleteConfirmation: false });
                        }, bind: this },
                        (0, widget_1.tsx)("div", null, this.nls.deleteText.replace("{$number}", this.parcelList.length)),
                        (0, widget_1.tsx)("calcite-button", { slot: "footer-end", kind: "brand", appearance: "outline", onclick: () => {
                                this._updateState({ showDeleteConfirmation: false });
                            }, bind: this }, this.nls.cancel),
                        (0, widget_1.tsx)("calcite-button", { slot: "footer-end", kind: "danger", appearance: "solid", onclick: () => {
                                this._removeFeature(this.parcelList);
                            }, bind: this }, this.nls.deleteAll)));
                }
                if (this.parcelList.length) {
                    parcelList = ((0, widget_1.tsx)("calcite-list", { class: "parcel-list-container", scale: "m", "selection-appearance": "border", "selection-mode": "none", "filter-enabled": false, "filter-placeholder": this.nls.search, oncalciteListChange: this._openParcelProperties, bind: this }, this.parcelList.map((parcel) => {
                        return ((0, widget_1.tsx)("calcite-list-item", { value: parcel.attributes[parcel.layer.objectIdField], label: "Parcel_" + parcel.attributes[parcel.layer.objectIdField], key: parcel.attributes[parcel.layer.objectIdField] + "_parcels" },
                            (0, widget_1.tsx)("calcite-action", { slot: "actions-end", icon: "x", title: this.nls.remove, onclick: () => {
                                    this._updateParcelSelection(parcel);
                                } })));
                    })));
                }
                if (this.state.selectParcels && !this.parcelList.length) {
                    selectParcelInfo = ((0, widget_1.tsx)("calcite-notice", { open: true, icon: "information" },
                        (0, widget_1.tsx)("div", { slot: "message" }, this.nls.selectParcels)));
                }
                if (this.state.confirmationDialog.comments) {
                    confirmationDialog = ((0, widget_1.tsx)("calcite-dialog", { slot: "dialogs", modal: true, scale: "s", "width-scale": "s", heading: this.nls.submit, width: "s", kind: "brand", open: true, oncalciteDialogClose: () => {
                            this._toggleConfirmationDialog("comments");
                        }, bind: this },
                        (0, widget_1.tsx)("div", null, this.state.save.comments
                            ? this.nls.unsavedChanges
                            : this.nls.submitCommentConfirmation),
                        (0, widget_1.tsx)("calcite-button", { slot: "footer-end", kind: "brand", appearance: "outline", onclick: () => {
                                this._toggleConfirmationDialog("comments");
                            }, bind: this }, this.nls.cancel),
                        (0, widget_1.tsx)("calcite-button", { slot: "footer-end", kind: "brand", appearance: "solid", onclick: () => {
                                this._submitComments();
                            }, bind: this }, this.nls.submit)));
                }
                if (this.state.confirmationDialog.review) {
                    confirmationDialog = ((0, widget_1.tsx)("calcite-dialog", { slot: "dialogs", modal: true, scale: "s", "width-scale": "s", heading: this.nls.submit, width: "s", kind: "brand", open: true, oncalciteDialogClose: () => {
                            this._toggleConfirmationDialog("review");
                        }, bind: this },
                        (0, widget_1.tsx)("div", null, this.state.save.parcels ||
                            this.state.save.comments ||
                            this.state.save.notes ||
                            this.state.save.photos
                            ? this.nls.unsavedChanges
                            : this.nls.submitReviewConfirmation),
                        (0, widget_1.tsx)("calcite-button", { slot: "footer-end", kind: "brand", appearance: "outline", onclick: () => {
                                this._toggleConfirmationDialog("review");
                            }, bind: this }, this.nls.cancel),
                        (0, widget_1.tsx)("calcite-button", { slot: "footer-end", kind: "brand", appearance: "solid", onclick: () => {
                                this._submitForReview();
                            }, bind: this }, this.nls.submit)));
                }
                if (this.state.confirmationDialog.declare) {
                    confirmationDialog = ((0, widget_1.tsx)("calcite-dialog", { slot: "dialogs", modal: true, scale: "s", "width-scale": "s", heading: this.nls.submit, width: "s", kind: "brand", open: true, oncalciteDialogClose: () => {
                            this._toggleConfirmationDialog("declare");
                        }, bind: this },
                        (0, widget_1.tsx)("div", null, this.state.save.parcels ||
                            this.state.save.comments ||
                            this.state.save.notes ||
                            this.state.save.photos
                            ? this.nls.unsavedChanges
                            : this.nls.submitDeclareConfirmation),
                        (0, widget_1.tsx)("calcite-button", { slot: "footer-end", kind: "brand", appearance: "outline", onclick: () => {
                                this._toggleConfirmationDialog("declare");
                            }, bind: this }, this.nls.cancel),
                        (0, widget_1.tsx)("calcite-button", { slot: "footer-end", kind: "brand", appearance: "solid", onclick: () => {
                                this._submitAsDeclaration();
                            }, bind: this }, this.nls.submit)));
                }
                parcelBoundaryActions = ((0, widget_1.tsx)("calcite-action-group", { class: "parcel-action-pad action-group-2", layout: "horizontal" },
                    (0, widget_1.tsx)("calcite-action", { scale: "m", disabled: !this.parcelList.length ||
                            (!this.state.selectParcels && !this.state.editBoundaryTool), class: "width-2", active: this.state.editBoundaryTool === "reshape", alignment: "center", title: this.nls.reshape, icon: "reshape-tool", onclick: ({ target }) => {
                            this._toggleEditBoundaryTool("reshape", target);
                        }, bind: this }),
                    (0, widget_1.tsx)("calcite-action", { scale: "m", disabled: !this.parcelList.length ||
                            (!this.state.selectParcels && !this.state.editBoundaryTool), class: "width-2", active: this.state.editBoundaryTool === "split", alignment: "center", title: this.nls.split, icon: "split-features", onclick: ({ target }) => {
                            this._toggleEditBoundaryTool("split", target);
                        }, bind: this }),
                    (0, widget_1.tsx)("calcite-action", { scale: "m", disabled: !this.state.parcelEdit.undo, class: "width-2", alignment: "center", title: this.nls.undo, icon: "undo", onclick: this._undoEdits, bind: this }),
                    (0, widget_1.tsx)("calcite-action", { scale: "m", disabled: !this.state.parcelEdit.redo, class: "width-2", alignment: "center", title: this.nls.redo, icon: "redo", onclick: this._redoEdits, bind: this }),
                    (0, widget_1.tsx)("calcite-action", { scale: "m", disabled: !this.parcelList.length ||
                            (!this.state.selectParcels && !this.state.editBoundaryTool), class: "width-2", alignment: "center", title: this.nls.clearSelection, icon: "clear-selection", onclick: this._removeParcelSelection, bind: this }),
                    (0, widget_1.tsx)("calcite-action", { scale: "m", disabled: !this.parcelList.length ||
                            (!this.state.selectParcels && !this.state.editBoundaryTool), class: "width-2", alignment: "center", title: this.nls.deleteAll, icon: "trash", onclick: () => {
                            this._updateState({ showDeleteConfirmation: true });
                        }, bind: this })));
                if (this.options.webmap) {
                    if (!((_k = this.view) === null || _k === void 0 ? void 0 : _k.ready) && !error) {
                        loadingScrim = ((0, widget_1.tsx)("calcite-scrim", null,
                            (0, widget_1.tsx)("calcite-loader", { scale: "l", text: this.nls.loading + "..." })));
                    }
                    mainTemplate = ((0, widget_1.tsx)("calcite-shell", { "content-behind": true },
                        (0, widget_1.tsx)("div", { slot: "header", class: "ape-header" },
                            (0, widget_1.tsx)("div", { class: "align-horizontal" },
                                (0, widget_1.tsx)("h2", { class: "ape-header-title" }, this.state.title),
                                (0, widget_1.tsx)("div", { class: "header-lineBreak" }),
                                (0, widget_1.tsx)("calcite-avatar", { scale: "m", id: "user-thumbnail", "full-name": (_l = this.user) === null || _l === void 0 ? void 0 : _l.username, thumbnail: this.user.getThumbnailUrl(150) }))),
                        (0, widget_1.tsx)("calcite-shell-panel", { class: "start-panel", slot: "panel-start", "height-scale": "l", position: "start", "width-scale": "m", collapsed: true },
                            (0, widget_1.tsx)("calcite-action-bar", { slot: "action-bar", id: "widget-bar" },
                                (0, widget_1.tsx)("calcite-action", { active: this.state.referenceParcelsToggle, "data-action-id": "referenceParcels", text: this.nls.referenceParcels, scale: "m", title: this.nls.referenceParcels, icon: "parcel-layer", onclick: this._referenceParcelsToggle, bind: this }),
                                (0, widget_1.tsx)("calcite-action", { active: this.state.agriculturalParcelsOutlineToggle, "data-action-id": "parcelsOutline", text: this.nls.agriculturalParcelsOutline, scale: "m", title: this.nls.agriculturalParcelsOutline, icon: "polygon", onclick: this._agriculturalParcelsOutlineToggle, bind: this }),
                                (0, widget_1.tsx)("calcite-action", { active: this.state.agriculturalParcelsFillToggle, "data-action-id": "parcelsFill", text: this.nls.agriculturalParcelsFill, scale: "m", title: this.nls.agriculturalParcelsFill, icon: "polygon-area", onclick: this._agriculturalParcelsFillToggle, bind: this }),
                                (0, widget_1.tsx)("calcite-action", { active: this.state.agriculturalZonesToggle, "data-action-id": "agriculturalZones", text: this.nls.agriculturalZones, scale: "m", title: this.nls.agriculturalZones, icon: "number-of-territories", onclick: this._agriculturalZonesToggle, bind: this }),
                                requestsAction,
                                notesAction,
                                requiredPhotosAction,
                                farmerPhotosAction,
                                baseImageAction,
                                basemapActions)),
                        (0, widget_1.tsx)("calcite-shell-panel", { class: "end-panel", slot: "panel-end", "height-scale": "l", position: "end", "width-scale": "m", collapsed: !rightTool, resizable: "true" },
                            (0, widget_1.tsx)("calcite-action-bar", { slot: "action-bar" },
                                addRequestAction,
                                (0, widget_1.tsx)("calcite-action", { disabled: this.state.declare, active: this.state.rightTool === "parcels", text: this.nls.parcels, scale: "m", title: this.nls.parcels, icon: "freehand-area", onclick: ({ target }) => {
                                        this._toggleRightTool(target, "parcels");
                                    }, bind: this }),
                                addNoteAction,
                                addImageAction,
                                (0, widget_1.tsx)("calcite-action", { active: this.state.rightTool === "measure", "data-action-id": "measure", text: this.nls.measure, scale: "m", title: this.nls.measure, icon: "measure", onclick: ({ target }) => {
                                        this._toggleRightTool(target, "measure");
                                    }, bind: this }),
                                (0, widget_1.tsx)("calcite-action", { disabled: this.state.declare, active: this.state.rightTool === "submit", text: this.nls.submit, scale: "m", title: this.nls.submit, icon: "submit", onclick: ({ target }) => {
                                        this._toggleRightTool(target, "submit");
                                    }, bind: this })),
                            (0, widget_1.tsx)("calcite-panel", { class: "panel-height", heading: this.nls.parcels, "height-scale": "l", closable: true, "data-panel-id": "parcels", closed: rightTool !== "parcels", hidden: rightTool !== "parcels", oncalcitePanelClose: () => {
                                    this._closeRightTool("parcels");
                                }, bind: this },
                                (0, widget_1.tsx)("div", { id: "parcels-container", class: "margin-panel" },
                                    (0, widget_1.tsx)("calcite-button", { "icon-start": "plus", appearance: "solid", class: "btn-display-flex", kind: "brand", onclick: this._addParcel, bind: this }, this.nls.newParcel),
                                    parcelBoundaryActions,
                                    selectParcelInfo,
                                    parcelList),
                                (0, widget_1.tsx)("calcite-button", { slot: "footer", disabled: !this.state.save.parcels, appearance: "solid", kind: "brand", onclick: ({ target }) => {
                                        this._saveFile("farmer-parcels", target);
                                    }, bind: this }, this.nls.save)),
                            addRequestContainer,
                            addNoteContainer,
                            addImageContainer,
                            (0, widget_1.tsx)("calcite-panel", { class: "panel-height", heading: this.nls.measure, "height-scale": "l", closable: "true", "data-panel-id": "measure", closed: rightTool !== "measure", hidden: rightTool !== "measure", oncalcitePanelClose: () => {
                                    this._closeRightTool("measure");
                                }, bind: this },
                                (0, widget_1.tsx)("div", { class: "margin-panel" },
                                    (0, widget_1.tsx)("calcite-action-group", { class: "action-group-2", layout: "horizontal" },
                                        (0, widget_1.tsx)("calcite-action", { alignment: "center", active: this.state.currentMeasurementTool === "distance", class: "width-2", "data-action-id": "direct-line", scale: "s", text: this.nls.distance, "text-enabled": "true", icon: "measure-line", onclick: () => {
                                                this._handleMeasurementClick("distance");
                                            }, bind: this }),
                                        (0, widget_1.tsx)("calcite-action", { alignment: "center", active: this.state.currentMeasurementTool === "area", class: "width-2", "data-action-id": "area", scale: "s", text: this.nls.area, "text-enabled": "true", icon: "measure-area", onclick: () => {
                                                this._handleMeasurementClick("area");
                                            }, bind: this })),
                                    (0, widget_1.tsx)("div", { id: "measure-container" }))),
                            (0, widget_1.tsx)("calcite-panel", { class: "panel-height", heading: this.nls.submit, "height-scale": "l", closable: true, "data-panel-id": "submit", closed: rightTool !== "submit", hidden: rightTool !== "submit", oncalcitePanelClose: () => {
                                    this._closeRightTool("submit");
                                }, bind: this },
                                (0, widget_1.tsx)("div", { id: "submit-container", class: "margin-panel" },
                                    (0, widget_1.tsx)("calcite-button", { appearance: "solid", class: "btn-display-flex", kind: "brand", onclick: () => {
                                            this._toggleConfirmationDialog("comments");
                                        }, bind: this }, this.nls.submitComments),
                                    (0, widget_1.tsx)("calcite-button", { appearance: "solid", class: "btn-display-flex", kind: "brand", onclick: () => {
                                            this._toggleConfirmationDialog("review");
                                        }, bind: this }, this.nls.submitReview),
                                    (0, widget_1.tsx)("calcite-button", { appearance: "solid", class: "btn-display-flex", kind: "brand", onclick: () => {
                                            this._toggleConfirmationDialog("declare");
                                        }, bind: this }, this.nls.submitDeclare)))),
                        (0, widget_1.tsx)("div", { class: "shell-content" },
                            (0, widget_1.tsx)("div", { class: "map", afterCreate: this._createMap, bind: this },
                                (0, widget_1.tsx)("div", { class: "parcel-transparency-slider", hidden: !this.state.agriculturalParcelsFillToggle },
                                    (0, widget_1.tsx)("calcite-label", null,
                                        this.nls.fillOpacity,
                                        (0, widget_1.tsx)("calcite-slider", { class: "slider-1", value: "100", "label-ticks": "true", "max-label": "100", "min-label": "0", ticks: "100", step: "1", oncalciteSliderChange: this._updateFillOpacity, bind: this }))))),
                        errorAlert,
                        notificationAlert,
                        deleteModal,
                        confirmationDialog));
                }
                else {
                    mainTemplate = ((0, widget_1.tsx)("calcite-shell", { "content-behind": true },
                        (0, widget_1.tsx)("calcite-alert", { slot: "alerts", open: "true", kind: "danger", scale: "m", placement: "bottom" },
                            (0, widget_1.tsx)("div", { slot: "title" }, this.nls.error),
                            (0, widget_1.tsx)("div", { slot: "message" }, this.nls.noWebmapURLParameter))));
                }
            }
            else if (!this.state.farmerID) {
                mainTemplate = ((0, widget_1.tsx)("calcite-shell", { "content-behind": true },
                    (0, widget_1.tsx)("calcite-alert", { slot: "alerts", open: "true", kind: "danger", scale: "m", placement: "bottom" },
                        (0, widget_1.tsx)("div", { slot: "title" }, this.nls.error),
                        (0, widget_1.tsx)("div", { slot: "message" }, this.nls.farmerIdError))));
            }
            let captureImageTemplate = ((0, widget_1.tsx)("div", { id: "capture-image", afterCreate: this.loadCaptureImage, bind: this }));
            content = ((0, widget_1.tsx)("div", null,
                !this.state.cameraActive ? mainTemplate : captureImageTemplate,
                loadingScrim,
                userPopup));
            return content;
        }
        getBase64ImageSrc(imageString, defaultType = "jpeg") {
            const prefixPattern = /^data:image\/[a-zA-Z]+;base64,/;
            if (prefixPattern.test(imageString)) {
                return imageString;
            }
            else {
                return `data:image/${defaultType};base64,${imageString}`;
            }
        }
        updateButtonStyles() {
            const setLocationBtn = document.querySelector("#set-location");
            const setDirectionBtn = document.querySelector("#set-direction");
            const { modifyLocation, setDirection } = this.state;
            if (setLocationBtn) {
                setLocationBtn.setAttribute("appearance", modifyLocation ? "solid" : "outline-fill");
            }
            if (setDirectionBtn) {
                setDirectionBtn.setAttribute("appearance", setDirection ? "solid" : "outline-fill");
            }
        }
        _createMap() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.view) {
                    let map, error;
                    let mapItem = this.options.webmap;
                    if (mapItem) {
                        let portalItem = new PortalItem_1.default({
                            id: mapItem,
                            portal: this.portal,
                        });
                        yield portalItem
                            .load()
                            .then((item) => {
                            map = new WebMap_1.default({ portalItem: portalItem });
                        })
                            .catch((e) => {
                            error = this.nls.invalidWebmap + " " + e.message;
                        });
                        if (map) {
                            yield map
                                .loadAll()
                                .then(() => {
                                error = this._checkRequiredLayers(map);
                            })
                                .catch((e) => __awaiter(this, void 0, void 0, function* () {
                                error = e.message;
                                map = null;
                            }));
                        }
                    }
                    else {
                        error = this.nls.noWebmap;
                    }
                    if (error)
                        this._updateState({ error: error });
                    else {
                        let properties = {
                            map: map,
                            container: document.querySelector(".map"),
                        };
                        this.view = new MapView_1.default(properties);
                        yield this.view.when();
                        this.view.watch("fatalError", (error) => {
                            if (error) {
                                this.view.tryFatalErrorRecovery();
                            }
                        });
                        this.view.popupEnabled = false;
                        this._loadMapWidgets();
                        this._checkOtherLayers();
                        this._agriculturalParcelsOutlineToggle();
                        yield this._getLatestGeoJSONFromPortal();
                        this._selectParcels(this.state.selectParcels);
                    }
                }
                if (!this.state.cameraActive && this.view)
                    this.view.container = document.querySelector(".map");
            });
        }
        _checkRequiredLayers(map) {
            let error = "";
            let requiredLayers = this.options.layerInfo.filter((l) => {
                return l.required;
            }) || [];
            for (let a = 0; a < requiredLayers.length; a++) {
                let layer = map.layers.find((l) => {
                    var _a;
                    return (_a = l.title) === null || _a === void 0 ? void 0 : _a.startsWith(requiredLayers[a].code + "_");
                });
                if (!layer) {
                    error =
                        this.nls[requiredLayers[a].title.split("nls.")[1]] +
                            " " +
                            this.nls.requiredLayerMissing;
                    break;
                }
                else {
                    layer.visible = false;
                    if (requiredLayers[a].type === "farmer-parcels")
                        layer.editingEnabled = true;
                }
            }
            return error;
        }
        _checkOtherLayers() {
            let map = this.view.map, biCode = this.options.layerInfo.find((l) => {
                return l.type === "base-image";
            }), ccLayer = this._getLayer("catch-crop"), otherLayers = this.options.layerInfo.filter((l) => {
                return !l.required;
            }) || [], currentBaseImage = "";
            if (ccLayer) {
                this.options.catchCropRenderer = ccLayer.renderer.toJSON();
                console.log(this.options.catchCropRenderer);
                map.remove(ccLayer);
            }
            if (biCode) {
                let baseImageList = map.layers.filter((layer) => {
                    return layer.title.startsWith(biCode.code + "_");
                });
                baseImageList.forEach((layer) => {
                    layer.visible = false;
                });
                this.baseImageList = baseImageList;
            }
            otherLayers.forEach((info) => {
                let l = this._getLayer(info.type);
                if (l) {
                    l.visible = false;
                    if (info.type === "farmer-notes" || info.type === "farmer-comments")
                        l.editingEnabled = true;
                }
            });
            this._updateState({ currentBaseImage: currentBaseImage });
        }
        _getLatestGeoJSONFromPortal() {
            return __awaiter(this, void 0, void 0, function* () {
                let iacsGroupItemID;
                this.farmerGroup = iacsGroupItemID = yield this._getIACSGroupOnPortal();
                if (iacsGroupItemID) {
                    let param = {
                        query: `type: "GeoJson"`,
                        sortField: "created",
                        sortOrder: "desc",
                        start: 1,
                        num: 1000,
                    }, groupItems = yield this._queryGroup(iacsGroupItemID, param);
                    this._replaceLayers(groupItems);
                }
            });
        }
        _getIACSGroupOnPortal() {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                let param = {
                    query: `title: "IACS_GAA" AND tags: "` + this.state.farmerID + `"`,
                    sortField: "created",
                    sortOrder: "desc",
                    start: 1,
                    num: 10,
                    searchUserAccess: "groupMember",
                };
                let items = yield this._queryPortalGroups(this.portal, param, []);
                return (_a = items[0]) === null || _a === void 0 ? void 0 : _a.id;
            });
        }
        _replaceLayers(items) {
            this.options.layerInfo.forEach((info) => {
                if (info.type !== "catch-crop" && info.type !== "base-image") {
                    let layer = this._getLayer(info.type);
                    let geojsonItem = items.find((itemInfo) => {
                        var _a;
                        return (_a = itemInfo.title) === null || _a === void 0 ? void 0 : _a.startsWith(info.code + "_");
                    });
                    if (geojsonItem && layer) {
                        let geojsonLayer = new GeoJSONLayer_1.default({
                            portalItem: {
                                id: geojsonItem.id,
                            },
                            renderer: layer.renderer,
                            popupTemplate: layer.popupTemplate,
                            visible: layer.visible,
                            editingEnabled: layer.editingEnabled,
                        });
                        geojsonLayer.load().then(() => {
                            let index = this.view.map.allLayers.findIndex((l) => {
                                return l.id === layer.id;
                            });
                            if (info.type === "farmer-parcels") {
                                geojsonLayer.fields.forEach((field) => {
                                    var _a, _b, _c, _d, _e, _f;
                                    if (field.name.toLowerCase() === "changedate") {
                                        field.type = "date-only";
                                    }
                                    if (field.name.toLowerCase() === ((_a = info.mainCropField) === null || _a === void 0 ? void 0 : _a.toLowerCase())) {
                                        let domain = {
                                            type: "coded-value",
                                            codedValues: [],
                                        };
                                        (_c = (_b = layer.renderer) === null || _b === void 0 ? void 0 : _b.uniqueValueInfos) === null || _c === void 0 ? void 0 : _c.forEach((uniqueValue) => {
                                            if (uniqueValue.value !== "<Null>") {
                                                domain.codedValues.push({
                                                    name: uniqueValue.label,
                                                    code: uniqueValue.value,
                                                });
                                            }
                                        });
                                        field.domain = domain;
                                    }
                                    if (field.name.toLowerCase() ===
                                        ((_d = info.catchCropField) === null || _d === void 0 ? void 0 : _d.toLowerCase())) {
                                        let domain = {
                                            type: "coded-value",
                                            codedValues: [],
                                        };
                                        (_f = (_e = this.options.catchCropRenderer) === null || _e === void 0 ? void 0 : _e.uniqueValueInfos) === null || _f === void 0 ? void 0 : _f.forEach((uniqueValue) => {
                                            if (uniqueValue.value !== "<Null>") {
                                                domain.codedValues.push({
                                                    name: uniqueValue.label,
                                                    code: uniqueValue.value,
                                                });
                                            }
                                        });
                                        field.domain = domain;
                                    }
                                });
                            }
                            this.view.map.add(geojsonLayer, index);
                            this.view.map.remove(layer);
                        });
                    }
                    else {
                        if (info.type === "farmer-parcels") {
                            layer.fields.forEach((field) => {
                                var _a, _b, _c, _d, _e, _f;
                                if (field.name.toLowerCase() === "changedate") {
                                    field.type = "date-only";
                                }
                                else if (field.name.toLowerCase() === ((_a = info.mainCropField) === null || _a === void 0 ? void 0 : _a.toLowerCase())) {
                                    let domain = {
                                        type: "coded-value",
                                        codedValues: [],
                                    };
                                    (_c = (_b = layer.renderer) === null || _b === void 0 ? void 0 : _b.uniqueValueInfos) === null || _c === void 0 ? void 0 : _c.forEach((uniqueValue) => {
                                        if (uniqueValue.value !== "<Null>") {
                                            domain.codedValues.push({
                                                name: uniqueValue.label,
                                                code: uniqueValue.value,
                                            });
                                        }
                                    });
                                    field.domain = domain;
                                }
                                else if (field.name.toLowerCase() === ((_d = info.catchCropField) === null || _d === void 0 ? void 0 : _d.toLowerCase())) {
                                    let domain = {
                                        type: "coded-value",
                                        codedValues: [],
                                    };
                                    (_f = (_e = this.options.catchCropRenderer) === null || _e === void 0 ? void 0 : _e.uniqueValueInfos) === null || _f === void 0 ? void 0 : _f.forEach((uniqueValue) => {
                                        if (uniqueValue.value !== "<Null>") {
                                            domain.codedValues.push({
                                                name: uniqueValue.label,
                                                code: uniqueValue.value,
                                            });
                                        }
                                    });
                                    field.domain = domain;
                                }
                            });
                        }
                    }
                }
            });
        }
        _selectParcels(toggle) {
            var _a, _b;
            if (toggle) {
                (_a = this.parcelClickHandler) === null || _a === void 0 ? void 0 : _a.remove();
                this.parcelClickHandler = this.view.on("click", (evt) => {
                    let parcelLayer = this._getLayer("farmer-parcels");
                    let otherLayer = this._getLayer("other-parcels");
                    let parcelLayerView = this.view.allLayerViews.find((lv) => {
                        return lv.layer.id === parcelLayer.id;
                    });
                    this.view
                        .hitTest(evt, { include: [parcelLayer, otherLayer] })
                        .then((response) => {
                        var _a;
                        if ((_a = response === null || response === void 0 ? void 0 : response.results) === null || _a === void 0 ? void 0 : _a.length) {
                            response.results.forEach((graphic) => {
                                var _a, _b;
                                if (((_a = graphic.layer) === null || _a === void 0 ? void 0 : _a.id) === parcelLayer.id) {
                                    let parcelIndex = this.parcelList.findIndex((parcel) => {
                                        return (parcel.attributes[parcelLayer.objectIdField] ===
                                            graphic.graphic.attributes[parcelLayer.objectIdField]);
                                    });
                                    if (parcelIndex !== -1) {
                                        this.parcelList.splice(parcelIndex, 1);
                                    }
                                    else {
                                        this.parcelList.push(graphic.graphic);
                                    }
                                    (_b = this.parcelViewHighlightHandler) === null || _b === void 0 ? void 0 : _b.remove();
                                    this.parcelViewHighlightHandler = parcelLayerView.highlight(this.parcelList);
                                    this._updateState({ updateList: !this.state.updateList });
                                }
                                else {
                                    this._updateState({
                                        notification: this.nls.parcelSelectionNotAllowed,
                                    });
                                }
                            });
                        }
                    });
                });
            }
            else {
                (_b = this.parcelClickHandler) === null || _b === void 0 ? void 0 : _b.remove();
            }
            this._updateState({ selectParcels: toggle });
        }
        _updateParcelSelection(parcel) {
            var _a;
            let parcelLayer = this._getLayer("farmer-parcels");
            let parcelLayerView = this.view.allLayerViews.find((lv) => {
                return lv.layer.id === parcelLayer.id;
            });
            let parcelIndex = this.parcelList.findIndex((p) => {
                return (p.attributes[parcelLayer.objectIdField] ===
                    parcel.attributes[parcelLayer.objectIdField]);
            });
            if (parcelIndex !== -1) {
                this.parcelList.splice(parcelIndex, 1);
                (_a = this.parcelViewHighlightHandler) === null || _a === void 0 ? void 0 : _a.remove();
                this.parcelViewHighlightHandler = parcelLayerView.highlight(this.parcelList);
            }
            if (!this.parcelList.length) {
                this._removeParcelSelection();
            }
        }
        _removeParcelSelection() {
            var _a;
            (_a = this.parcelViewHighlightHandler) === null || _a === void 0 ? void 0 : _a.remove();
            let { parcelEdit } = this.state;
            parcelEdit.undo = false;
            parcelEdit.redo = false;
            this.trackChanges = { undo: {}, redo: {} };
            this.parcelList = [];
            this._removeEditor(true);
            this._updateState({
                updateList: !this.state.updateList,
                editBoundaryTool: "",
                parcelEdit: parcelEdit,
            });
        }
        _toggleEditBoundaryTool(tool, target) {
            if (!target.active) {
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
                        polyline: true,
                        polygon: false,
                        rectangle: false,
                        circle: false,
                    },
                };
                this._removeEditor(false);
                let graphicsLayer = new GraphicsLayer_1.default({
                    id: "custom-graphicsLayer",
                    elevationInfo: {
                        mode: "on-the-ground",
                    },
                    listMode: "hide",
                });
                this.sketchTool = new Sketch_1.default({
                    layer: graphicsLayer,
                    view: this.view,
                    creationMode: "continuous",
                    defaultUpdateOptions: {
                        tool: "transform",
                        enableRotation: false,
                        enableScaling: false,
                        enableZ: false,
                        multipleSelectionEnabled: false,
                    },
                    visibleElements: visibleElements,
                });
                this.sketchTool.on("create", (evt) => __awaiter(this, void 0, void 0, function* () {
                    if (evt.state === "start") {
                    }
                    else if (evt.state === "complete") {
                        if (!geodeticAreaOperator_1.default.isLoaded())
                            yield geodeticAreaOperator_1.default.load();
                        if (this.state.editBoundaryTool === "reshape") {
                            let polylineExtent = Polygon_1.default.fromExtent(evt.graphic.geometry.extent);
                            let nearByFields = yield this._getNearByFields(this.parcelList.concat([{ geometry: polylineExtent }]));
                            let reshapeFlag = false;
                            let azLayer = this._getLayer("agricultural-zones");
                            let azAreas = nearByFields.filter((field) => {
                                var _a;
                                return ((_a = field.layer) === null || _a === void 0 ? void 0 : _a.id) === azLayer.id;
                            });
                            let azIntersect = false;
                            azAreas.forEach((az) => {
                                if (geometryEngine_1.default.intersects(evt.graphic.geometry, az.geometry))
                                    azIntersect = true;
                            });
                            this.trackChanges.undo = { updateFeatures: [] };
                            this.parcelList.forEach((selectedField) => {
                                this.trackChanges.undo.updateFeatures.push(selectedField.clone());
                                let reshapePolygon = reshapeOperator_1.default.execute(selectedField.geometry, evt.graphic.geometry);
                                if (reshapePolygon) {
                                    reshapePolygon = this._clipPolygon(reshapePolygon, nearByFields);
                                    if (reshapePolygon) {
                                        reshapeFlag = true;
                                        selectedField.geometry = reshapePolygon;
                                        let declaredAreaField = this._getFieldFromLayer(selectedField.layer, "declaredarea");
                                        selectedField.attributes[declaredAreaField] =
                                            selectedField.geometry.spatialReference.isWebMercator ||
                                                selectedField.geometry.spatialReference.isWGS84
                                                ? geodeticAreaOperator_1.default.execute(selectedField.geometry, {
                                                    unit: "hectares",
                                                })
                                                : areaOperator_1.default.execute(selectedField.geometry, {
                                                    unit: "hectares",
                                                });
                                        if (selectedField.attributes[declaredAreaField])
                                            selectedField.attributes[declaredAreaField] = Number(selectedField.attributes[declaredAreaField].toFixed(2));
                                    }
                                }
                            });
                            if (!reshapeFlag)
                                this._updateState({ notification: this.nls.reshapeNoResult });
                            else if (azIntersect)
                                this._updateState({
                                    notification: this.nls.agriculturalZoneClip,
                                });
                            yield this.parcelList[0].layer
                                .applyEdits({ updateFeatures: this.parcelList })
                                .then(() => {
                                let changes = [];
                                this.parcelList.forEach((pl) => {
                                    changes.push(pl.clone());
                                });
                                this.trackChanges.redo = { updateFeatures: changes };
                                let { save, parcelEdit } = this.state;
                                save.parcels = true;
                                parcelEdit.undo = true;
                                parcelEdit.redo = false;
                                this._updateState({
                                    editBoundaryTool: "",
                                    save: save,
                                    parcelEdit: parcelEdit,
                                });
                                this._selectParcels(true);
                            })
                                .catch((e) => {
                                this._updateState({ error: e.message });
                            });
                            this.sketchTool.destroy();
                            this.sketchTool = null;
                        }
                        else if (this.state.editBoundaryTool === "split") {
                            let newFields = [];
                            let splitFlag = false;
                            this.trackChanges.undo = { updateFeatures: [] };
                            this.parcelList.forEach((selectedField) => {
                                this.trackChanges.undo.updateFeatures.push(selectedField.clone());
                                let splitPolygons = cutOperator_1.default.execute(selectedField.geometry, evt.graphic.geometry);
                                let newPolygons = [];
                                if (splitPolygons === null || splitPolygons === void 0 ? void 0 : splitPolygons.length) {
                                    splitFlag = true;
                                    splitPolygons === null || splitPolygons === void 0 ? void 0 : splitPolygons.forEach((g) => {
                                        g.rings.forEach((r) => {
                                            let poly = new Polygon_1.default({
                                                rings: [r],
                                                spatialReference: g.spatialReference,
                                            });
                                            newPolygons.push({
                                                geometry: poly,
                                                area: poly.spatialReference.isWebMercator ||
                                                    poly.spatialReference.isWGS84
                                                    ? geodeticAreaOperator_1.default.execute(poly, {
                                                        unit: "hectares",
                                                    })
                                                    : areaOperator_1.default.execute(poly, { unit: "hectares" }),
                                            });
                                        });
                                    });
                                    newPolygons.sort((a, b) => {
                                        return b.area - a.area;
                                    });
                                    let declaredAreaField = this._getFieldFromLayer(selectedField.layer, "declaredarea");
                                    let idField = this._getFieldFromLayer(selectedField.layer, "id");
                                    selectedField.attributes[declaredAreaField] = Number(newPolygons[0].area.toFixed(2));
                                    selectedField.geometry = newPolygons[0].geometry;
                                    let currentDate = new Date();
                                    let dateSuffix = currentDate.getFullYear() +
                                        "" +
                                        this._addZero(currentDate.getMonth() + 1) +
                                        "" +
                                        this._addZero(currentDate.getDate()) +
                                        "" +
                                        this._addZero(currentDate.getHours()) +
                                        "" +
                                        this._addZero(currentDate.getSeconds());
                                    dateSuffix = Number(dateSuffix);
                                    for (let a = 1; a < newPolygons.length; a++) {
                                        let grap = new Graphic_1.default({
                                            attributes: JSON.parse(JSON.stringify(selectedField.attributes)),
                                            geometry: newPolygons[a].geometry,
                                        });
                                        grap.attributes[declaredAreaField] = Number(newPolygons[a].area.toFixed(2));
                                        grap.attributes[idField] = "NFP_" + (dateSuffix + a - 1);
                                        newFields.push(grap);
                                    }
                                }
                            });
                            if (!splitFlag)
                                this._updateState({ notification: this.nls.splitNoResult });
                            yield this.parcelList[0].layer
                                .applyEdits({
                                updateFeatures: this.parcelList,
                                addFeatures: newFields,
                            })
                                .then((edits) => {
                                var _a;
                                if ((_a = edits.addFeatureResults) === null || _a === void 0 ? void 0 : _a.length) {
                                    this.trackChanges.undo.deleteFeatures =
                                        edits.addFeatureResults;
                                }
                                let changes = [];
                                this.parcelList.forEach((pl) => {
                                    changes.push(pl.clone());
                                });
                                this.trackChanges.redo = {
                                    updateFeatures: changes,
                                    addFeatures: newFields,
                                };
                                let { save, parcelEdit } = this.state;
                                save.parcels = true;
                                parcelEdit.undo = true;
                                parcelEdit.redo = false;
                                this._updateState({
                                    editBoundaryTool: "",
                                    save: save,
                                    parcelEdit: parcelEdit,
                                });
                                this._selectParcels(true);
                            })
                                .catch((e) => {
                                this._updateState({ error: e.message });
                            });
                            this.sketchTool.destroy();
                            this.sketchTool = null;
                        }
                    }
                }));
                this.sketchTool.create("polyline", { mode: "click" });
                this._updateState({ editBoundaryTool: tool });
            }
            else {
                this._removeEditor(true);
                this._updateState({ editBoundaryTool: "" });
            }
        }
        _getNearByFields(parcels) {
            var _a, _b;
            return __awaiter(this, void 0, void 0, function* () {
                let selectedParcels = parcels.map((p) => {
                    return p.geometry;
                }), mergeParcels = geometryEngine_1.default.union(selectedParcels), fpLayer = this._getLayer("farmer-parcels"), opLayer = this._getLayer("other-parcels"), azLayer = this._getLayer("agricultural-zones"), nearByParcels = [];
                if (mergeParcels) {
                    yield fpLayer
                        .queryFeatures({
                        geometry: mergeParcels,
                        outFields: [((_b = (_a = this.parcelList[0]) === null || _a === void 0 ? void 0 : _a.layer) === null || _b === void 0 ? void 0 : _b.objectIdField) || "OBJECTID"],
                        returnGeometry: true,
                    })
                        .then((response) => {
                        var _a;
                        if ((_a = response === null || response === void 0 ? void 0 : response.features) === null || _a === void 0 ? void 0 : _a.length) {
                            response.features.forEach((feature) => {
                                let exist = this.parcelList.find((p) => {
                                    return (p.attributes[fpLayer.objectIdField] ===
                                        feature.attributes[fpLayer.objectIdField]);
                                });
                                if (!exist)
                                    nearByParcels.push(feature);
                            });
                        }
                    });
                    yield opLayer
                        .queryFeatures({
                        geometry: mergeParcels,
                        returnGeometry: true,
                    })
                        .then((response) => {
                        var _a;
                        if ((_a = response === null || response === void 0 ? void 0 : response.features) === null || _a === void 0 ? void 0 : _a.length) {
                            response.features.forEach((feature) => {
                                nearByParcels.push(feature);
                            });
                        }
                    });
                    let azAllowedField = this._getFieldFromLayer(azLayer, "az_allowed");
                    yield azLayer
                        .queryFeatures({
                        geometry: mergeParcels,
                        where: azAllowedField + " = 0",
                        returnGeometry: true,
                    })
                        .then((response) => {
                        var _a;
                        if ((_a = response === null || response === void 0 ? void 0 : response.features) === null || _a === void 0 ? void 0 : _a.length) {
                            response.features.forEach((feature) => {
                                nearByParcels.push(feature);
                            });
                        }
                    });
                }
                return nearByParcels;
            });
        }
        _addParcel({ target }) {
            var _a;
            target.disabled = true;
            let layer = this._getLayer("farmer-parcels");
            this._removeEditor(false);
            this.currentEditor = this._createFeatureWidget(layer, null, target);
            (_a = this.layerEditHandler) === null || _a === void 0 ? void 0 : _a.remove();
            this.layerEditHandler = layer.on("edits", (result) => {
                this._removeEditor(true);
                target.disabled = false;
                let { save } = this.state;
                save.parcels = true;
                this._updateState({ save: save });
            });
            this.view.ui.add(this.currentEditor, "top-right");
        }
        _openParcelProperties() { }
        _addComment({ target }) {
            var _a;
            target.disabled = true;
            let layer = this._getLayer("farmer-comments"), initialFeature;
            this._removeEditor(false);
            this.currentEditor = this._createFeatureWidget(layer, initialFeature, target);
            (_a = this.layerEditHandler) === null || _a === void 0 ? void 0 : _a.remove();
            this.layerEditHandler = layer.on("edits", (result) => {
                var _a, _b;
                this._removeEditor(false);
                if ((_b = (_a = result === null || result === void 0 ? void 0 : result.edits) === null || _a === void 0 ? void 0 : _a.addFeatures) === null || _b === void 0 ? void 0 : _b.length) {
                    layer
                        .queryFeatures({
                        returnGeometry: true,
                        outFields: ["*"],
                        objectIds: [result.addedFeatures[0].objectId],
                    })
                        .then((response) => {
                        var _a;
                        if ((_a = response === null || response === void 0 ? void 0 : response.features) === null || _a === void 0 ? void 0 : _a.length) {
                            this.farmerComments.splice(0, 0, response.features[0]);
                            let { save } = this.state;
                            save.comments = true;
                            this._updateState({
                                updateList: !this.state.updateList,
                                save: save,
                            });
                        }
                    });
                }
            });
            this.view.ui.add(this.currentEditor, "top-right");
        }
        _addReply({ target }) {
            var _a;
            let arLayer = this._getLayer("agency-requests"), layer = this._getLayer("farmer-comments"), feature = this.agencyRequests.find((ar) => {
                return (ar.attributes[arLayer.objectIdField] ===
                    Number(this.selectedListNode.value.split("_")[0]));
            }), attributes = {}, initialFeature;
            attributes[this._getFieldFromLayer(layer, "name")] =
                feature.attributes[this._getFieldFromLayer(arLayer, "name")];
            initialFeature = new Graphic_1.default({
                attributes: attributes,
                geometry: feature.geometry,
                layer: layer,
            });
            this.view.ui.remove(this.featureWidget);
            this._removeEditor(false);
            this.currentEditor = this._createFeatureWidget(layer, initialFeature, target);
            (_a = this.layerEditHandler) === null || _a === void 0 ? void 0 : _a.remove();
            this.layerEditHandler = layer.on("edits", (result) => {
                var _a, _b;
                this._removeEditor(false);
                if ((_b = (_a = result === null || result === void 0 ? void 0 : result.edits) === null || _a === void 0 ? void 0 : _a.addFeatures) === null || _b === void 0 ? void 0 : _b.length) {
                    layer
                        .queryFeatures({
                        returnGeometry: true,
                        outFields: ["*"],
                        objectIds: [result.addedFeatures[0].objectId],
                    })
                        .then((response) => {
                        var _a;
                        if ((_a = response === null || response === void 0 ? void 0 : response.features) === null || _a === void 0 ? void 0 : _a.length) {
                            this.farmerComments.splice(0, 0, response.features[0]);
                            let { save } = this.state;
                            save.comments = true;
                            this._updateState({
                                updateList: !this.state.updateList,
                                save: save,
                            });
                        }
                    });
                }
            });
            this.view.ui.add(this.currentEditor, "top-right");
        }
        _selectRequestsComments(e) {
            var _a, _b, _c, _d;
            if ((_c = (_b = (_a = e.currentTarget) === null || _a === void 0 ? void 0 : _a.selectedItems) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.value) {
                let value = e.currentTarget.selectedItems[0].value, layer, feature;
                this.selectedListNode = e.currentTarget.selectedItems[0];
                if (value === null || value === void 0 ? void 0 : value.includes("_requests")) {
                    (layer = this._getLayer("agency-requests")),
                        (feature = this.agencyRequests.find((ar) => {
                            return (ar.attributes[layer.objectIdField] === Number(value.split("_")[0]));
                        }));
                    this._removeEditor(false);
                    this.featureWidget = this._getFeatureWidget(feature);
                }
                else {
                    (layer = this._getLayer("farmer-comments")),
                        (feature = this.farmerComments.find((fc) => {
                            return (fc.attributes[layer.objectIdField] === Number(value.split("_")[0]));
                        }));
                    this._removeEditor(false);
                    this.currentEditor = this._editFeatureWidget(feature, layer);
                    (_d = this.layerEditHandler) === null || _d === void 0 ? void 0 : _d.remove();
                    this.layerEditHandler = layer.on("edits", (result) => {
                        var _a, _b, _c, _d;
                        this._removeEditor(false);
                        let index = this.farmerComments.findIndex((f) => {
                            return (f.attributes[layer.objectIdField] ===
                                feature.attributes[layer.objectIdField]);
                        });
                        if ((_b = (_a = result === null || result === void 0 ? void 0 : result.edits) === null || _a === void 0 ? void 0 : _a.updateFeatures) === null || _b === void 0 ? void 0 : _b.length) {
                            this.farmerComments[index].geometry =
                                result.edits.updateFeatures[0].geometry;
                            this.farmerComments[index].attributes =
                                result.edits.updateFeatures[0].attributes;
                        }
                        else if ((_d = (_c = result === null || result === void 0 ? void 0 : result.edits) === null || _c === void 0 ? void 0 : _c.deleteFeatures) === null || _d === void 0 ? void 0 : _d.length)
                            this.farmerComments.splice(index, 1);
                        let { save } = this.state;
                        save.comments = true;
                        this._updateState({ updateList: !this.state.updateList, save: save });
                    });
                }
                this.view.goTo(feature);
            }
            else {
                this._removeEditor(false);
            }
        }
        _addNewNote({ target }) {
            var _a;
            target.disabled = true;
            let layer = this._getLayer("farmer-notes");
            this._removeEditor(false);
            this.currentEditor = this._createFeatureWidget(layer, null, target);
            (_a = this.layerEditHandler) === null || _a === void 0 ? void 0 : _a.remove();
            this.layerEditHandler = layer.on("edits", (result) => {
                var _a, _b;
                this._removeEditor(false);
                target.disabled = false;
                if ((_b = (_a = result === null || result === void 0 ? void 0 : result.edits) === null || _a === void 0 ? void 0 : _a.addFeatures) === null || _b === void 0 ? void 0 : _b.length) {
                    layer
                        .queryFeatures({
                        returnGeometry: true,
                        outFields: ["*"],
                        objectIds: [result.addedFeatures[0].objectId],
                    })
                        .then((response) => {
                        var _a;
                        if ((_a = response === null || response === void 0 ? void 0 : response.features) === null || _a === void 0 ? void 0 : _a.length) {
                            this.farmerNotes.splice(0, 0, response.features[0]);
                            let { save } = this.state;
                            save.notes = true;
                            this._updateState({
                                updateList: !this.state.updateList,
                                save: save,
                            });
                        }
                    });
                }
            });
            this.view.ui.add(this.currentEditor, "top-right");
        }
        _selectNotes(e) {
            var _a, _b, _c, _d;
            if ((_c = (_b = (_a = e.currentTarget) === null || _a === void 0 ? void 0 : _a.selectedItems) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.value) {
                let value = e.currentTarget.selectedItems[0].value, layer = this._getLayer("farmer-notes"), feature = this.farmerNotes.find((note) => {
                    return note.attributes[layer.objectIdField] === Number(value);
                });
                this.selectedListNode = e.currentTarget.selectedItems[0];
                this.view.goTo(feature);
                this.currentEditor && this.currentEditor.destroy();
                this.currentEditor = this._editFeatureWidget(feature, layer);
                (_d = this.layerEditHandler) === null || _d === void 0 ? void 0 : _d.remove();
                this.layerEditHandler = layer.on("edits", (result) => {
                    var _a, _b, _c, _d;
                    this._removeEditor(false);
                    let index = this.farmerNotes.findIndex((f) => {
                        return (f.attributes[layer.objectIdField] ===
                            feature.attributes[layer.objectIdField]);
                    });
                    if ((_b = (_a = result === null || result === void 0 ? void 0 : result.edits) === null || _a === void 0 ? void 0 : _a.updateFeatures) === null || _b === void 0 ? void 0 : _b.length) {
                        this.farmerNotes[index].attributes =
                            result.edits.updateFeatures[0].attributes;
                        this.farmerNotes[index].geometry =
                            result.edits.updateFeatures[0].geometry;
                    }
                    else if ((_d = (_c = result === null || result === void 0 ? void 0 : result.edits) === null || _c === void 0 ? void 0 : _c.deleteFeatures) === null || _d === void 0 ? void 0 : _d.length)
                        this.farmerNotes.splice(index, 1);
                    let { save } = this.state;
                    save.notes = true;
                    this._updateState({ updateList: !this.state.updateList, save: save });
                });
            }
            else {
                this._removeEditor(false);
            }
        }
        _createFeatureWidget(layer, feature, target) {
            let element = document.createElement("div"), fpLayer = this._getLayer("farmer-parcels"), fnLayer = this._getLayer("farmer-notes"), fcLayer = this._getLayer("farmer-comments"), tpLayer = this._getLayer("farmer-photos"), formTemplate, heading;
            if ((fpLayer === null || fpLayer === void 0 ? void 0 : fpLayer.id) === layer.id) {
                heading = this.nls.newParcel;
                formTemplate = this._getFormTemplate("farmer-parcels");
            }
            else if (layer.id === (fnLayer === null || fnLayer === void 0 ? void 0 : fnLayer.id)) {
                heading = this.nls.newNote;
                formTemplate = this._getFormTemplate("farmer-notes");
            }
            else if (layer.id === (fcLayer === null || fcLayer === void 0 ? void 0 : fcLayer.id)) {
                heading = this.nls.newComment;
                formTemplate = this._getFormTemplate("farmer-comments");
            }
            else if (layer.id === (tpLayer === null || tpLayer === void 0 ? void 0 : tpLayer.id)) {
                heading = this.nls.addPhoto;
                formTemplate = this._getFormTemplate("farmer-photos");
            }
            if (formTemplate) {
                formTemplate.elements.forEach((element) => {
                    var _a, _b;
                    let fieldName = this._getFieldFromLayer(layer, element.fieldName);
                    if (fieldName)
                        element.fieldName = fieldName;
                    if ((_a = element.label) === null || _a === void 0 ? void 0 : _a.includes("nls."))
                        element.label = this.nls[element.label.split("nls.")[1]];
                    if ((_b = element.hint) === null || _b === void 0 ? void 0 : _b.includes("nls."))
                        element.hint = this.nls[element.hint.split("nls.")[1]];
                });
            }
            let editor = new editor_1.default({
                view: this.view,
                layer: layer,
                container: element,
                nls: this.nls,
                options: {
                    heading: heading,
                    formTemplate: formTemplate,
                },
            });
            this.view.ui.add(element, "top-right");
            editor.when().then(() => {
                if (fpLayer.id === layer.id) {
                    editor.draw();
                }
                else
                    editor.create(feature, { updateGeometry: true });
            });
            editor.on("draw", (graphic) => __awaiter(this, void 0, void 0, function* () {
                let nearByFields = yield this._getNearByFields([graphic]);
                let geometry = this._clipPolygon(graphic.geometry, nearByFields);
                if (!geometry) {
                    editor.draw();
                    this._updateState({ notification: this.nls.newParcelNoResult });
                }
                else {
                    let attributes = {};
                    let declaredAreaField = this._getFieldFromLayer(layer, "declaredarea");
                    if (!geodeticAreaOperator_1.default.isLoaded())
                        yield geodeticAreaOperator_1.default.load();
                    attributes[declaredAreaField] =
                        geometry.spatialReference.isWebMercator ||
                            geometry.spatialReference.isWGS84
                            ? geodeticAreaOperator_1.default.execute(geometry, { unit: "hectares" })
                            : areaOperator_1.default.execute(geometry, { unit: "hectares" });
                    if (attributes[declaredAreaField])
                        attributes[declaredAreaField] = Number(attributes[declaredAreaField].toFixed(2));
                    let newGraphic = new Graphic_1.default({
                        geometry: geometry,
                        attributes: attributes,
                    });
                    editor.create(newGraphic);
                }
            }));
            editor.on("destroy", () => {
                target.disabled = false;
                console.log("create is discarded.");
            });
            return editor;
        }
        _editFeatureWidget(feature, layer) {
            let element = document.createElement("div"), fnLayer = this._getLayer("farmer-notes"), fcLayer = this._getLayer("farmer-comments"), apLayer = this._getLayer("required-photos"), tpLayer = this._getLayer("farmer-photos"), formTemplate, heading;
            if (layer.id === (fnLayer === null || fnLayer === void 0 ? void 0 : fnLayer.id)) {
                heading = this.nls.editNote;
                formTemplate = this._getFormTemplate("farmer-notes");
            }
            else if (layer.id === (fcLayer === null || fcLayer === void 0 ? void 0 : fcLayer.id)) {
                heading = this.nls.editComment;
                formTemplate = this._getFormTemplate("farmer-comments");
            }
            else if (layer.title === (apLayer === null || apLayer === void 0 ? void 0 : apLayer.title)) {
                heading = this.nls.editPhoto;
                formTemplate = this._getFormTemplate("required-photos");
            }
            else if (layer.title === (tpLayer === null || tpLayer === void 0 ? void 0 : tpLayer.title)) {
                heading = this.nls.editPhoto;
                formTemplate = this._getFormTemplate("farmer-photos");
            }
            if (formTemplate) {
                formTemplate.elements.forEach((element) => {
                    var _a, _b, _c;
                    let fieldName = this._getFieldFromLayer(layer, element.fieldName);
                    if (fieldName)
                        element.fieldName = fieldName;
                    if ((_a = element.label) === null || _a === void 0 ? void 0 : _a.includes("nls."))
                        element.label = this.nls[element.label.split("nls.")[1]];
                    if ((_b = element.hint) === null || _b === void 0 ? void 0 : _b.includes("nls."))
                        element.hint = this.nls[element.hint.split("nls.")[1]];
                    if ((_c = element.text) === null || _c === void 0 ? void 0 : _c.includes("nls.")) {
                        let text = this.nls[element.text.split("nls.")[1]];
                        text = text.replace("[startdate]", new Date(feature.attributes.startdate).toLocaleDateString("en-GB"));
                        text = text.replace("[enddate]", new Date(feature.attributes.enddate).toLocaleDateString("en-GB"));
                        element.text = text;
                    }
                });
            }
            let editor = new editor_1.default({
                view: this.view,
                layer: layer,
                container: element,
                nls: this.nls,
                options: {
                    heading: heading,
                    formTemplate: formTemplate,
                },
            });
            this.view.ui.add(element, "top-right");
            editor.when().then(() => {
                editor.update(feature);
            });
            editor.on("destroy", () => {
                this._updateState({ modifyLocation: false, setDirection: false });
                this.view.container.style.cursor = "auto";
                if (this.locationClick) {
                    this.locationClick.remove();
                    this.locationClick = null;
                }
                if (this.directionClick) {
                    this.directionClick.remove();
                    this.directionClick = null;
                }
                this.view.graphics.removeAll();
                this._removeEditor(false);
            });
            return editor;
        }
        _getFeatureWidget(feature) {
            let featureWidget, replyBtn = document.createElement("calcite-button");
            replyBtn.innerHTML = this.nls.reply;
            replyBtn.setAttribute("width", "full");
            replyBtn.addEventListener("click", feature.layer.id !== this._getLayer("required-photos").id
                ? this._addReply.bind(this)
                : () => {
                    this.currFeature = feature;
                    this._removeEditor(false);
                    this._updateState({ cameraActive: true });
                });
            const formTemplate = this._getFormTemplate("required-photos");
            if (formTemplate) {
                formTemplate.elements.forEach((element) => {
                    var _a, _b, _c;
                    let fieldName = this._getFieldFromLayer(this._getLayer("required-photos"), element.fieldName);
                    if (fieldName)
                        element.fieldName = fieldName;
                    if ((_a = element.label) === null || _a === void 0 ? void 0 : _a.includes("nls."))
                        element.label = this.nls[element.label.split("nls.")[1]];
                    if ((_b = element.hint) === null || _b === void 0 ? void 0 : _b.includes("nls."))
                        element.hint = this.nls[element.hint.split("nls.")[1]];
                    if ((_c = element.text) === null || _c === void 0 ? void 0 : _c.includes("nls.")) {
                        let text = this.nls[element.text.split("nls.")[1]];
                        text = text.replace("[startdate]", new Date(feature.attributes.startdate).toLocaleDateString("en-GB"));
                        text = text.replace("[enddate]", new Date(feature.attributes.enddate).toLocaleDateString("en-GB"));
                        element.text = text;
                    }
                });
            }
            featureWidget = new FeatureForm_1.default({
                feature: feature,
                disabled: true,
                container: document.createElement("div"),
                formTemplate: feature.layer.title === this._getLayer("required-photos").title
                    ? formTemplate
                    : null,
            });
            featureWidget.when(() => {
                featureWidget.container.appendChild(replyBtn);
            });
            this.view.ui.add(featureWidget, "top-right");
            return featureWidget;
        }
        _getFieldFromLayer(layer, fieldName) {
            let name = "", field = layer.fields.find((field) => {
                return field.name.toLowerCase() === (fieldName === null || fieldName === void 0 ? void 0 : fieldName.toLowerCase());
            });
            if (field)
                name = field.name;
            return name;
        }
        _loadMapWidgets() {
            var _a, _b;
            const search = new Search_1.default({
                view: this.view,
                container: document.createElement("div"),
            });
            const searchExpand = new Expand_1.default({
                view: this.view,
                content: search,
                mode: "floating",
                expandTooltip: "Search",
            });
            this.basemapWidget = new BasemapGallery_1.default({
                view: this.view,
                container: document.createElement("div"),
            });
            const home = new Home_1.default({
                view: this.view,
            });
            const scaleBar = new ScaleBar_1.default({
                view: this.view,
                unit: "metric",
                style: "ruler",
            });
            this.measurementTool = new Measurement_1.default({
                view: this.view,
                container: "measure-container",
            });
            this.view.ui.add(searchExpand, "top-right");
            this.view.ui.add(home, "top-left");
            this.view.ui.add(scaleBar, "bottom-left");
            this._updateState({
                currentBasemap: ((_b = (_a = this.basemapWidget) === null || _a === void 0 ? void 0 : _a.activeBasemap) === null || _b === void 0 ? void 0 : _b.title) || "",
            });
        }
        _referenceParcelsToggle() {
            let toggle = !this.state.referenceParcelsToggle, layer = this._getLayer("reference-parcels");
            layer.visible = toggle;
            this._updateState({ referenceParcelsToggle: toggle });
        }
        _agriculturalParcelsOutlineToggle() {
            var _a;
            let toggle = !this.state.agriculturalParcelsOutlineToggle, farmerLayer = this._getLayer("farmer-parcels"), otherLayer = this._getLayer("other-parcels"), element = (_a = document.getElementsByClassName("slider-1")) === null || _a === void 0 ? void 0 : _a[0], opacity = (element === null || element === void 0 ? void 0 : element.value) / 100 || 1;
            farmerLayer.visible = toggle;
            otherLayer.visible = toggle;
            farmerLayer.renderer = this._updateRenderer(farmerLayer.renderer.toJSON(), {
                outline: true,
                fill: false,
                opacity: opacity,
            });
            otherLayer.renderer = this._updateRenderer(otherLayer.renderer.toJSON(), {
                outline: true,
                fill: false,
                opacity: opacity,
            });
            this._updateState({
                agriculturalParcelsOutlineToggle: toggle,
                agriculturalParcelsFillToggle: false,
            });
        }
        _agriculturalParcelsFillToggle() {
            var _a;
            let toggle = !this.state.agriculturalParcelsFillToggle, farmerLayer = this._getLayer("farmer-parcels"), otherLayer = this._getLayer("other-parcels"), element = (_a = document.getElementsByClassName("slider-1")) === null || _a === void 0 ? void 0 : _a[0], opacity = (element === null || element === void 0 ? void 0 : element.value) / 100 || 1;
            farmerLayer.visible = toggle;
            otherLayer.visible = toggle;
            farmerLayer.renderer = this._updateRenderer(farmerLayer.renderer.toJSON(), {
                outline: true,
                fill: true,
                opacity: opacity,
            });
            otherLayer.renderer = this._updateRenderer(otherLayer.renderer.toJSON(), {
                outline: true,
                fill: true,
                opacity: opacity,
            });
            this._updateState({
                agriculturalParcelsOutlineToggle: false,
                agriculturalParcelsFillToggle: toggle,
            });
        }
        _updateFillOpacity({ target }) {
            let farmerLayer = this._getLayer("farmer-parcels"), otherLayer = this._getLayer("other-parcels");
            farmerLayer.renderer = this._updateRenderer(farmerLayer.renderer.toJSON(), {
                outline: true,
                fill: true,
                opacity: target.value / 100,
            });
            otherLayer.renderer = this._updateRenderer(otherLayer.renderer.toJSON(), {
                outline: true,
                fill: true,
                opacity: target.value / 100,
            });
        }
        _agriculturalZonesToggle() {
            let toggle = !this.state.agriculturalZonesToggle, layer = this._getLayer("agricultural-zones");
            layer.visible = toggle;
            this._updateState({ agriculturalZonesToggle: toggle });
        }
        _requestsLayerToggle() {
            let toggle = !this.state.requestsLayerToggle, arlayer = this._getLayer("agency-requests"), fclayer = this._getLayer("farmer-comments");
            if (arlayer)
                arlayer.visible = toggle;
            if (fclayer)
                fclayer.visible = toggle;
            this._updateState({ requestsLayerToggle: toggle });
        }
        _notesLayerToggle() {
            let toggle = !this.state.notesLayerToggle, layer = this._getLayer("farmer-notes");
            if (layer)
                layer.visible = toggle;
            this._updateState({ notesLayerToggle: toggle });
        }
        _requiredPhotosLayerToggle() {
            let toggle = !this.state.requiredPhotosLayerToggle, layer = this._getLayer("required-photos");
            if (layer)
                layer.visible = toggle;
            this._updateState({ requiredPhotosLayerToggle: toggle });
        }
        _farmerPhotosLayerToggle() {
            let toggle = !this.state.farmerPhotosLayerToggle, layer = this._getLayer("farmer-photos");
            if (layer)
                layer.visible = toggle;
            this._updateState({ farmerPhotosLayerToggle: toggle });
        }
        _getLayer(layerType) {
            let layer = "", code = this.options.layerInfo.find((l) => {
                return l.type === layerType;
            });
            if (this.view) {
                layer = this.view.map.layers.find((l) => {
                    var _a;
                    return (_a = l.title) === null || _a === void 0 ? void 0 : _a.startsWith(code.code + "_");
                });
            }
            return layer;
        }
        _updateRenderer(renderer, options) {
            if (renderer.type === "uniqueValue") {
                renderer = UniqueValueRenderer_1.default.fromJSON(renderer);
                for (let a = 0; a < renderer.uniqueValueInfos.length; a++) {
                    if (renderer.uniqueValueInfos[a].symbol.data)
                        renderer.uniqueValueInfos[a].symbol.data.symbol = this._updateSymbol(renderer.uniqueValueInfos[a].symbol.data.symbol, options);
                    else
                        renderer.uniqueValueInfos[a].symbol = this._updateSymbol(renderer.uniqueValueInfos[a].symbol, options);
                }
            }
            else if (renderer.type === "simple") {
                renderer = SimpleRenderer_1.default.fromJSON(renderer);
                if (renderer.symbol.symbol)
                    renderer.symbol.symbol = this._updateSymbol(renderer.symbol.symbol, options);
                else if (renderer.symbol)
                    renderer.symbol = this._updateSymbol(renderer.symbol, options);
            }
            return renderer;
        }
        _updateSymbol(symbol, options) {
            if ((symbol === null || symbol === void 0 ? void 0 : symbol.type) === "CIMPolygonSymbol") {
                for (let a = 0; a < symbol.symbolLayers.length; a++) {
                    if (symbol.symbolLayers[a].type === "CIMSolidStroke")
                        symbol.symbolLayers[a].enable = options.outline;
                    else if (symbol.symbolLayers[a].type === "CIMSolidFill") {
                        symbol.symbolLayers[a].color[3] = options.fill
                            ? options.opacity * 255
                            : 0;
                    }
                }
            }
            else if ((symbol === null || symbol === void 0 ? void 0 : symbol.type) === "simple-fill") {
                symbol.color.a = options.fill ? options.opacity : 0;
                symbol.outline.color.a = options.outline ? 1 : 0;
            }
            return symbol;
        }
        _toggleRightTool(target, type) {
            if (target.active) {
                this._closeRightTool(type);
            }
            else
                this._openRightTool(type);
        }
        _openRightTool(tool) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                (_a = this.measurementTool) === null || _a === void 0 ? void 0 : _a.clear();
                this._removeEditor(tool === "parcels");
                if (tool === "parcels") {
                    if (!this.state.agriculturalParcelsOutlineToggle) {
                        this._agriculturalParcelsOutlineToggle();
                    }
                }
                else if (tool === "requests") {
                    if (!this.state.requestsLayerToggle) {
                        this._requestsLayerToggle();
                    }
                    if (!this.requestMade.comments) {
                        this.requestMade.comments = true;
                        this._getCommentsRequests();
                    }
                }
                else if (tool === "notes") {
                    if (!this.state.notesLayerToggle) {
                        this._notesLayerToggle();
                    }
                    if (!this.requestMade.notes) {
                        this.requestMade.notes = true;
                        this._getFarmerNotes();
                    }
                }
                else if (tool === "photos") {
                    if (!this.state.requiredPhotosLayerToggle) {
                        this._requiredPhotosLayerToggle();
                    }
                    if (!this.state.farmerPhotosLayerToggle) {
                        this._farmerPhotosLayerToggle();
                    }
                    if (!this.requestMade.photos) {
                        this.requestMade.photos = true;
                        this._getApFeatures();
                        this._getFpFeatures();
                    }
                }
                this._updateState({ rightTool: tool, currentMeasurementTool: "" });
            });
        }
        _closeRightTool(tool) {
            var _a;
            (_a = this.measurementTool) === null || _a === void 0 ? void 0 : _a.clear();
            this._removeEditor(false);
            this._updateState({ rightTool: "", currentMeasurementTool: "" });
        }
        _removeEditor(bool) {
            var _a, _b, _c;
            (_a = this.layerEditHandler) === null || _a === void 0 ? void 0 : _a.remove();
            (_b = this.stateHandler) === null || _b === void 0 ? void 0 : _b.remove();
            (_c = this.selectedListNode) === null || _c === void 0 ? void 0 : _c.removeAttribute("selected");
            this._selectParcels(bool);
            if (this.currentEditor) {
                this.currentEditor.destroy();
            }
            if (this.featureWidget) {
                this.view.ui.remove(this.featureWidget);
                this.featureWidget.destroy();
                this.featureWidget = null;
            }
            if (this.sketchTool) {
                this.sketchTool.destroy();
                this.sketchTool = null;
            }
            this._updateState({ editBoundaryTool: "" });
        }
        _getCommentsRequests() {
            return __awaiter(this, void 0, void 0, function* () {
                let layer = this._getLayer("farmer-comments"), arLayer = this._getLayer("agency-requests");
                this.farmerComments = yield this._getFeatures(layer, null);
                this.agencyRequests = yield this._getFeatures(arLayer, null);
                this._updateState({ updateList: !this.state.updateList });
            });
        }
        _getFarmerNotes() {
            return __awaiter(this, void 0, void 0, function* () {
                let layer = this._getLayer("farmer-notes");
                this.farmerNotes = yield this._getFeatures(layer, null);
                this._updateState({ updateList: !this.state.updateList });
            });
        }
        _getApFeatures() {
            return __awaiter(this, void 0, void 0, function* () {
                const layer = this._getLayer("required-photos");
                let features = yield this._getFeatures(layer, null);
                features = features.map((feature) => {
                    return Object.assign(Object.assign({}, feature.attributes), { geometry: feature.geometry });
                });
                this._updateState({ apFeatures: features });
            });
        }
        _getFpFeatures() {
            return __awaiter(this, void 0, void 0, function* () {
                const layer = this._getLayer("farmer-photos");
                let features = yield this._getFeatures(layer, null);
                features = features.map((feature) => {
                    return Object.assign(Object.assign({}, feature.attributes), { geometry: feature.geometry });
                });
                this._updateState({
                    fpFeatures: features.map((feature) => ({
                        requestId: feature.requestId,
                        [layer.objectIdField]: feature[layer.objectIdField],
                    })),
                });
            });
        }
        _updateBaseImage(baseImage) {
            if (this.state.currentBaseImage === baseImage)
                baseImage = "";
            this.baseImageList.forEach((imageLayer) => {
                if (imageLayer.title === baseImage)
                    imageLayer.visible = true;
                else
                    imageLayer.visible = false;
            });
            this._updateState({ currentBaseImage: baseImage });
        }
        _updateBasemap(basemap) {
            var _a, _b, _c;
            if (basemap && ((_c = (_b = (_a = this.basemapWidget) === null || _a === void 0 ? void 0 : _a.source) === null || _b === void 0 ? void 0 : _b.basemaps) === null || _c === void 0 ? void 0 : _c.length)) {
                let bm = this.basemapWidget.source.basemaps.find((b) => {
                    return b.title === basemap;
                });
                if (bm) {
                    this.basemapWidget.activeBasemap = bm;
                    this._updateState({ currentBasemap: basemap });
                }
            }
        }
        _showDeleteConfirmation(feature, type) {
            this._updateState({ showDeleteConfirmation: true });
        }
        _removeFeature(features) {
            if (features.length) {
                let layer = features[0].layer, featureIds = features.map((feature) => {
                    return { objectId: feature.attributes[feature.layer.objectIdField] };
                });
                layer
                    .applyEdits({ deleteFeatures: featureIds })
                    .then((response) => {
                    this._removeParcelSelection();
                    let { save } = this.state;
                    save.parcels = true;
                    this._updateState({ showDeleteConfirmation: false, save: save });
                })
                    .catch((e) => {
                    this._updateState({
                        error: e.message,
                        showDeleteConfirmation: false,
                    });
                });
            }
        }
        _getFeatures(layer, outSR) {
            return __awaiter(this, void 0, void 0, function* () {
                let query, count = 0;
                query = layer.createQuery();
                query.where = "1=1";
                yield layer.queryFeatureCount(query).then((c) => {
                    count = c;
                });
                query.returnGeometry = true;
                query.outFields = ["*"];
                query.orderByFields = [layer.objectIdField + " DESC"];
                query.maxRecordCountFactor = 5;
                query.start = 0;
                query.num = 10000;
                if (outSR) {
                    query.outSpatialReference = outSR;
                }
                let collection = yield this._queryFeatures([], query, layer, count);
                return collection;
            });
        }
        _queryFeatures(response, query, layer, count) {
            return __awaiter(this, void 0, void 0, function* () {
                if (query.start < count) {
                    let error;
                    if (layer.type === "feature" || layer.type === "geojson") {
                        yield layer
                            .queryFeatures(query)
                            .then((res) => {
                            response = response.concat(res.features);
                        })
                            .catch((e) => {
                            error = e;
                            console.error(e);
                        });
                    }
                    else {
                        yield layer
                            .queryRasters(query)
                            .then((res) => {
                            response = response.concat(res.features);
                        })
                            .catch((e) => {
                            error = e;
                            console.error(e);
                        });
                    }
                    if (!error) {
                        query.start = response.length;
                        return yield this._queryFeatures(response, query, layer, count);
                    }
                    else
                        return response;
                }
                else {
                    return response;
                }
            });
        }
        _handleMeasurementClick(type) {
            this.measurementTool.clear();
            let state = {
                currentMeasurementTool: this.state.currentMeasurementTool,
            };
            if (state.currentMeasurementTool === type) {
                state.currentMeasurementTool = "";
            }
            else {
                state.currentMeasurementTool = type;
                this.measurementTool.activeTool = type;
            }
            this._updateState(state);
        }
        _themeMenu() {
            let { theme } = this.state;
            theme.menu = !theme.menu;
            this._updateState({ theme: theme });
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
            if ((theme === "light" && darkTheme !== -1) ||
                (theme === "dark" && darkTheme === -1)) {
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
                let stateTheme = this.state.theme;
                stateTheme.value = theme;
                this._updateState({ theme: stateTheme });
            }
        }
        _updateState(properties) {
            let state = JSON.parse(JSON.stringify(this.state));
            Object.keys(properties).forEach((p) => {
                state[p] = properties[p];
            });
            this.state = state;
        }
        _loginUser() {
            return __awaiter(this, void 0, void 0, function* () {
                let user, role = "";
                if (this.portal) {
                    if (this.portal.user) {
                        user = this.portal.user;
                    }
                    else {
                        yield IdentityManager_1.default.getCredential(this.portal.restUrl, {
                            oAuthPopupConfirmation: false,
                        }).then((e) => __awaiter(this, void 0, void 0, function* () {
                            yield this.portal
                                .queryUsers({
                                query: "username:" + e.userId,
                            })
                                .then((queryResults) => {
                                if (queryResults.results.length) {
                                    user = queryResults.results[0];
                                }
                            });
                        }));
                    }
                }
                this.user = user;
                this._updateState({ farmerID: user.username });
            });
        }
        _signOut() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.portal) {
                    let credential;
                    yield IdentityManager_1.default.checkSignInStatus(this.portal.restUrl).then((queryResult) => {
                        credential = queryResult;
                    });
                    if (credential)
                        credential.destroy();
                    this.portal.user = null;
                    this._updateState({ user: "" });
                    yield this._loginUser();
                }
            });
        }
        _getBrowserTheme() {
            let theme = "light";
            if (window.matchMedia) {
                let mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
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
        _addZero(i) {
            if (i < 10) {
                i = "0" + i;
            }
            return i;
        }
        _queryPortalGroups(portal, param, items) {
            return __awaiter(this, void 0, void 0, function* () {
                let queryResult, error;
                yield portal
                    .queryGroups(param)
                    .then((res) => {
                    queryResult = res;
                })
                    .catch((e) => {
                    error = { title: e.name, message: e.message };
                });
                if (!error) {
                    items = items.concat(queryResult.results);
                    if (queryResult.total > items.length) {
                        return yield this._queryPortalGroups(portal, queryResult.nextQueryParams, items);
                    }
                    else
                        return items;
                }
                else
                    return items;
            });
        }
        _queryPortalItems(portal, param, items) {
            return __awaiter(this, void 0, void 0, function* () {
                let queryResult, error;
                yield portal
                    .queryItems(param)
                    .then((res) => {
                    queryResult = res;
                })
                    .catch((e) => {
                    error = { title: e.name, message: e.message };
                });
                if (!error) {
                    items = items.concat(queryResult.results);
                    if (queryResult.total > items.length) {
                        return yield this._queryPortalItems(portal, queryResult.nextQueryParams, items);
                    }
                    else
                        return items;
                }
                else
                    return items;
            });
        }
        _queryGroup(groupItemID, queryParams) {
            return __awaiter(this, void 0, void 0, function* () {
                let portalGroup, items = [];
                portalGroup = new PortalGroup_1.default({
                    portal: this.portal,
                    id: groupItemID,
                });
                items = yield this._queryGroupRequest(portalGroup, queryParams, []);
                return items;
            });
        }
        _queryGroupRequest(portalGroup, param, items) {
            return __awaiter(this, void 0, void 0, function* () {
                let queryResult, error;
                yield portalGroup
                    .queryItems(param)
                    .then((res) => {
                    queryResult = res;
                })
                    .catch((e) => {
                    error = { title: e.name, message: e.message };
                });
                if (!error) {
                    items = items.concat(queryResult.results);
                    if (queryResult.total > items.length) {
                        return yield this._queryGroupRequest(portalGroup, queryResult.nextQueryParams, items);
                    }
                    else
                        return items;
                }
                else
                    return items;
            });
        }
        _saveFile(contentType, target) {
            return __awaiter(this, void 0, void 0, function* () {
                target.loading = true;
                let layer = this._getLayer(contentType), features = yield this._getFeatures(layer, new SpatialReference_1.default({ wkid: 4326 })), geojson = this._convertFeatureCollectionToGeoJSON(features), portalToken = yield this._getToken(this.portal.restUrl), { save, parcelEdit } = this.state, dateSuffix, title, error;
                const file = new Blob([JSON.stringify(geojson)], {
                    type: "application/json",
                }), date = new Date();
                dateSuffix =
                    date.getFullYear() +
                        "" +
                        this._addZero(date.getMonth() + 1) +
                        "" +
                        this._addZero(date.getDate()) +
                        "" +
                        this._addZero(date.getHours()) +
                        "" +
                        this._addZero(date.getMinutes()) +
                        "" +
                        this._addZero(date.getSeconds());
                if (contentType === "farmer-parcels") {
                    save.parcels = false;
                    title = "FP_" + dateSuffix;
                }
                else if (contentType === "farmer-comments") {
                    save.comments = false;
                    title = "FC_" + dateSuffix;
                }
                else if (contentType === "farmer-notes") {
                    save.notes = false;
                    title = "FN_" + dateSuffix;
                }
                else if (contentType === "farmer-photos") {
                    save.photos = false;
                    title = "FN_" + dateSuffix;
                }
                const formData = new FormData();
                formData.append("file", file, `${title}.json`);
                yield (0, request_1.default)(this.portal.user.userContentUrl + "/addItem", {
                    body: formData,
                    query: {
                        f: "json",
                        token: portalToken,
                        type: "GeoJson",
                        tags: "",
                        title: title,
                        description: "",
                        typeKeywords: "GeoJson",
                        fileName: title,
                        async: true,
                    },
                    responseType: "json",
                    method: "post",
                })
                    .then((response) => __awaiter(this, void 0, void 0, function* () {
                    if (response.data.success) {
                        let status = yield this._checkFileStatus({ status: "processing", itemId: response.data.id }, portalToken);
                        if (status !== "completed")
                            error = status;
                        else {
                            let param = {
                                f: "json",
                                token: portalToken,
                                groups: this.farmerGroup,
                            };
                            if (this.farmerGroup)
                                error = yield this._shareItemWithGroup(response.data.id, param);
                        }
                    }
                    else
                        error = this.nls.saveError;
                }))
                    .catch((e) => {
                    error = e.message;
                });
                target.loading = false;
                parcelEdit.undo = false;
                parcelEdit.redo = false;
                this.trackChanges = { undo: {}, redo: {} };
                this._updateState({ save: save, error: error, parcelEdit: parcelEdit });
            });
        }
        _checkFileStatus(response, portalToken) {
            return __awaiter(this, void 0, void 0, function* () {
                if (response.status === "processing") {
                    let error;
                    yield (0, request_1.default)(this.portal.user.userContentUrl +
                        "/items/" +
                        response.itemId +
                        "/status", {
                        query: {
                            f: "json",
                            token: portalToken,
                        },
                        responseType: "json",
                        method: "auto",
                    })
                        .then((res) => {
                        if (res.data.status === "failed")
                            error = res.data.statusMessage;
                        response = res.data;
                    })
                        .catch((e) => {
                        error = e.message;
                    });
                    if (!error) {
                        return yield this._checkFileStatus(response, portalToken);
                    }
                    else
                        return error;
                }
                else {
                    return response.status;
                }
            });
        }
        _shareItemWithGroup(itemId, param) {
            return __awaiter(this, void 0, void 0, function* () {
                let error = "";
                yield (0, request_1.default)(this.portal.user.userContentUrl + "/items/" + itemId + "/share", {
                    query: param,
                    responseType: "json",
                    method: "post",
                })
                    .then((res) => {
                    if (res.data.notSharedWith.length)
                        error = this.nls.sharingError;
                })
                    .catch((e) => {
                    error = e.message;
                });
                return error;
            });
        }
        _convertFeatureCollectionToGeoJSON(featureCollection) {
            if (!featureCollection || !featureCollection.length)
                return null;
            let geoJSON = {
                type: "FeatureCollection",
                crs: {
                    type: "name",
                    properties: {
                        name: "EPSG:4326",
                    },
                },
                features: [],
            };
            for (var a = 0; a < featureCollection.length; a++) {
                let geom;
                if (featureCollection[a].geometry.hasOwnProperty("x")) {
                    geom = {
                        type: "Point",
                        coordinates: featureCollection[a].geometry.hasOwnProperty("z") &&
                            !isNaN(featureCollection[a].geometry.z)
                            ? [
                                featureCollection[a].geometry.x,
                                featureCollection[a].geometry.y,
                                featureCollection[a].geometry.z,
                            ]
                            : [
                                featureCollection[a].geometry.x,
                                featureCollection[a].geometry.y,
                            ],
                    };
                }
                else if (featureCollection[a].geometry.hasOwnProperty("paths")) {
                    geom = {
                        type: "MultiLineString",
                        coordinates: featureCollection[a].geometry.paths,
                    };
                }
                else if (featureCollection[a].geometry.hasOwnProperty("rings")) {
                    geom = {
                        type: "Polygon",
                        coordinates: featureCollection[a].geometry.rings,
                    };
                }
                geoJSON.features.push({
                    type: "Feature",
                    geometry: geom,
                    properties: featureCollection[a].attributes,
                });
            }
            return geoJSON;
        }
        _toggleConfirmationDialog(type) {
            let confirmationDialog = this.state.confirmationDialog;
            confirmationDialog[type] = !confirmationDialog[type];
            this._updateState({ confirmationDialog: confirmationDialog });
        }
        _submitComments() {
            this._toggleConfirmationDialog("comments");
        }
        _submitForReview() {
            this._toggleConfirmationDialog("review");
        }
        _submitAsDeclaration() {
            let confirmationDialog = this.state.confirmationDialog;
            confirmationDialog.declare = !confirmationDialog.declare;
            this._updateState({
                confirmationDialog: confirmationDialog,
                declare: true,
                rightTool: "",
            });
        }
        _getToken(url) {
            return __awaiter(this, void 0, void 0, function* () {
                let credential = IdentityManager_1.default.findCredential(url);
                if (credential) {
                    return credential.token;
                }
                else {
                    yield (0, request_1.default)(url, {
                        query: { f: "json" },
                        responseType: "json",
                    })
                        .then(() => {
                        credential = IdentityManager_1.default.findCredential(url);
                        if (credential)
                            return credential.token;
                        else
                            return "";
                    })
                        .catch((e) => {
                        return "";
                    });
                }
            });
        }
        _clipPolygon(polygon, clipPolygons) {
            if (polygon) {
                let intersectedFields = [];
                clipPolygons.forEach((cp) => {
                    if (geometryEngine_1.default.intersects(polygon, cp.geometry)) {
                        let intersectGeo = geometryEngine_1.default.intersect(polygon, cp.geometry);
                        intersectGeo && intersectedFields.push(intersectGeo);
                    }
                });
                if (intersectedFields.length) {
                    let subtractor = intersectedFields.length > 1
                        ? geometryEngine_1.default.union(intersectedFields)
                        : intersectedFields[0];
                    if (subtractor)
                        polygon = geometryEngine_1.default.difference(polygon, subtractor);
                }
            }
            return polygon;
        }
        _getFormTemplate(layerType) {
            var _a, _b;
            let layer = "", layerInfo = this.options.layerInfo.find((l) => {
                return l.type === layerType;
            }), formTemplate;
            if ((_b = (_a = layerInfo.formTemplate) === null || _a === void 0 ? void 0 : _a.elements) === null || _b === void 0 ? void 0 : _b.length) {
                formTemplate = layerInfo.formTemplate;
            }
            return formTemplate;
        }
        _undoEdits({ target }) {
            return __awaiter(this, void 0, void 0, function* () {
                target.loading = true;
                let fpLayer = this._getLayer("farmer-parcels"), error;
                yield fpLayer
                    .applyEdits(this.trackChanges.undo)
                    .then(() => { })
                    .catch((e) => {
                    error = e.message;
                });
                let { parcelEdit, save } = this.state;
                save.parcels = false;
                parcelEdit.undo = false;
                parcelEdit.redo = true;
                target.loading = false;
                this._updateState({ parcelEdit: parcelEdit, error: error, save: save });
            });
        }
        _redoEdits({ target }) {
            return __awaiter(this, void 0, void 0, function* () {
                target.loading = true;
                let fpLayer = this._getLayer("farmer-parcels"), error;
                yield fpLayer
                    .applyEdits(this.trackChanges.redo)
                    .then((edits) => {
                    var _a;
                    if ((_a = edits.addFeatureResults) === null || _a === void 0 ? void 0 : _a.length) {
                        this.trackChanges.undo.deleteFeatures = edits.addFeatureResults;
                    }
                })
                    .catch((e) => {
                    error = e.message;
                });
                let { parcelEdit, save } = this.state;
                save.parcels = true;
                parcelEdit.undo = true;
                parcelEdit.redo = false;
                target.loading = false;
                this._updateState({ parcelEdit: parcelEdit, error: error, save: save });
            });
        }
    };
    __decorate([
        (0, decorators_1.property)()
    ], Agricultural_Parcel_Editor.prototype, "options", void 0);
    __decorate([
        (0, decorators_1.property)()
    ], Agricultural_Parcel_Editor.prototype, "state", void 0);
    Agricultural_Parcel_Editor = __decorate([
        (0, decorators_1.subclass)("esri.widgets.Agricultural_Parcel_Editor")
    ], Agricultural_Parcel_Editor);
    return Agricultural_Parcel_Editor;
});
