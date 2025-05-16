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
define(["require", "exports", "esri/Graphic", "esri/core/accessorSupport/decorators", "esri/geometry/Point", "esri/geometry/projection", "esri/widgets/Widget", "esri/widgets/support/widget", "./editor", "esri/geometry/geometryEngine", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/geometry/Circle", "esri/symbols/SimpleFillSymbol"], function (require, exports, Graphic_1, decorators_1, Point_1, projection_1, Widget_1, widget_1, editor_1, geometryEngine_1, SimpleMarkerSymbol_1, PictureMarkerSymbol_1, Circle_1, SimpleFillSymbol_1) {
    "use strict";
    Graphic_1 = __importDefault(Graphic_1);
    Point_1 = __importDefault(Point_1);
    projection_1 = __importDefault(projection_1);
    Widget_1 = __importDefault(Widget_1);
    editor_1 = __importDefault(editor_1);
    geometryEngine_1 = __importDefault(geometryEngine_1);
    SimpleMarkerSymbol_1 = __importDefault(SimpleMarkerSymbol_1);
    PictureMarkerSymbol_1 = __importDefault(PictureMarkerSymbol_1);
    Circle_1 = __importDefault(Circle_1);
    SimpleFillSymbol_1 = __importDefault(SimpleFillSymbol_1);
    let CaptureImage = class CaptureImage extends Widget_1.default {
        constructor(params) {
            super(params);
            this.editHandler = null;
            this.canvasRef = null;
            this.videoRef = null;
            this.stream = null;
            this.locationClick = null;
            this.directionClick = null;
            this.feature = null;
            this.handleOrientation = (event) => {
                let absoluteHeading = null;
                if (event.absolute && typeof event.alpha === "number") {
                    absoluteHeading = 360 - event.alpha;
                }
                else if (typeof event.webkitCompassHeading === "number") {
                    absoluteHeading = event.webkitCompassHeading;
                }
                if (absoluteHeading !== null) {
                    this.state.heading = parseFloat(absoluteHeading.toFixed(2));
                }
            };
            this.handleSavingImageAndLocation = () => __awaiter(this, void 0, void 0, function* () {
                if (!this.canvasRef) {
                    console.warn("Canvas not ready");
                    return;
                }
                const dataUrl = this.canvasRef.toDataURL("image/jpeg", 1);
                this.setCameraActive(false);
                this.layer.editingEnabled = true;
                navigator.geolocation.getCurrentPosition((position) => __awaiter(this, void 0, void 0, function* () {
                    const geoJSON = {
                        attributes: {
                            description: "",
                            image: dataUrl,
                            cameraHeading: this.state.heading,
                            requestId: this.currFeature
                                ? this.currFeature.attributes.requestId
                                : this.createRequestId(),
                            captureDate: this.state.captureDate,
                        },
                        geometry: new Point_1.default({
                            longitude: position.coords.longitude,
                            latitude: position.coords.latitude,
                        }),
                    };
                    this.feature = geoJSON;
                    yield this.view.goTo(geoJSON.geometry);
                    const container = document.createElement("div");
                    if (this.formTemplate) {
                        this.formTemplate.elements.forEach((element) => {
                            var _a, _b;
                            let fieldName = this._getFieldFromLayer(this.layer, element.fieldName);
                            if (fieldName)
                                element.fieldName = fieldName;
                            if ((_a = element.label) === null || _a === void 0 ? void 0 : _a.includes("nls."))
                                element.label = this.nls[element.label.split("nls.")[1]];
                            if ((_b = element.hint) === null || _b === void 0 ? void 0 : _b.includes("nls."))
                                element.hint = this.nls[element.hint.split("nls.")[1]];
                        });
                    }
                    const editor = new editor_1.default({
                        view: this.view,
                        layer: this.layer,
                        container,
                        nls: this.nls,
                        options: {
                            heading: this.nls.addPhoto,
                            formTemplate: this.formTemplate,
                        },
                    });
                    this.view.ui.add(container, "top-right");
                    editor.when().then(() => {
                        editor.create(new Graphic_1.default({
                            attributes: geoJSON.attributes,
                            geometry: geoJSON.geometry,
                        }), { updateGeometry: false, drawInActive: true });
                        editor.on("destroy", () => {
                            this._updateAppState({
                                modifyLocation: false,
                                setDirection: false,
                            });
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
                        });
                        setTimeout(() => {
                            const flow = container.querySelector("calcite-flow");
                            if (!flow) {
                                console.warn("calcite-flow not found");
                                return;
                            }
                            console.log("calcite-flow", flow);
                            const flowItem = flow.querySelector("calcite-flow-item");
                            const formTemplate = flowItem.querySelector(".form-template");
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
                                    setLocationBtn.addEventListener("click", this.handleModifyLocation);
                                }
                                if (setDirectionBtn) {
                                    setDirectionBtn.addEventListener("click", this.handleSetDirection);
                                }
                                div.style.display = "flex";
                                div.style.marginTop = "10px";
                                div.style.justifyContent = "center";
                                const img = document.createElement("img");
                                img.src = this.getBase64ImageSrc(geoJSON.attributes.image);
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
                    });
                    this.view.ui.add(editor, "top-right");
                    this.editHandler = this.layer.on("edits", (result) => __awaiter(this, void 0, void 0, function* () {
                        this.setSave(Object.assign(Object.assign({}, this.save), { photos: true }));
                        if (this.state.imageData.location ||
                            this.state.imageData.cameraHeading)
                            this.handleSave(result.addedFeatures[0].objectId);
                        if (result.edits.addFeatures.length > 0)
                            this.setFpFeatures(this.updateFpFeatures(this.fpFeatures, result.edits.addFeatures[0].attributes.requestId, result.addedFeatures[0].objectId, "Create"));
                        else if (result.edits.deleteFeatures.length > 0)
                            this.setFpFeatures(this.updateFpFeatures(this.fpFeatures, null, result.deletedFeatures[0].objectId, "Delete"));
                    }));
                }), (err) => console.error(err), {
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 5000,
                });
            });
            this.updateFpFeatures = (prev, id, featureId, method) => {
                if (method === "Create") {
                    const newFeature = {
                        requestId: id,
                        [this.layer.objectIdField]: featureId,
                    };
                    return [...prev, newFeature];
                }
                else if (method === "Delete")
                    return prev.filter((feature) => feature.requestId !== id);
            };
            this.handleSave = (featureId) => {
                if (this.locationClick) {
                    this.locationClick.remove();
                    this.locationClick = null;
                }
                if (this.directionClick) {
                    this.directionClick.remove();
                    this.directionClick = null;
                }
                const newGraphic = new Graphic_1.default({
                    geometry: this.state.modifyLocation ? this.state.imageData.location : null,
                    attributes: {
                        cameraHeading: this.state.setDirection ? this.state.imageData.cameraHeading : 0,
                        captureDate: this.state.captureDate,
                        [this.layer.objectIdField]: featureId,
                    },
                });
                this.layer
                    .applyEdits({
                    updateFeatures: [newGraphic],
                })
                    .then(() => __awaiter(this, void 0, void 0, function* () {
                    this.view.graphics.removeAll();
                    this.view.container.style.cursor = "auto";
                    this._updateAppState({ modifyLocation: false });
                    this._updateAppState({ setDirection: false });
                }))
                    .catch((error) => {
                    console.error("Error updating feature:", error);
                });
            };
            this.handleModifyLocation = () => {
                const wasActive = this.state.modifyLocation;
                if (wasActive && this.locationClick) {
                    this.locationClick.remove();
                    this.locationClick = null;
                    const graphics = this.view.graphics.filter((graphic) => graphic.symbol.type === "simple-fill" ||
                        graphic.symbol.type === "simple-marker");
                    this.view.graphics.removeMany(graphics);
                    this.view.container.style.cursor = "auto";
                    this._updateAppState({ modifyLocation: false, setDirection: false });
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
                this._updateAppState({ modifyLocation: true, setDirection: false });
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
                        let graphics = this.view.graphics.filter((graphic) => graphic.symbol.type === "simple-fill" ||
                            graphic.symbol.type === "simple-marker");
                        this.view.graphics.removeMany(graphics);
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
                const wasActive = this.state.setDirection;
                if (wasActive && this.directionClick) {
                    this.directionClick.remove();
                    this.directionClick = null;
                    const graphic = this.view.graphics.find((graphic) => graphic.symbol.type === "picture-marker");
                    this.view.graphics.remove(graphic);
                    this.view.container.style.cursor = "auto";
                    this._updateAppState({ setDirection: false, modifyLocation: false });
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
                    target: this.feature.geometry,
                    zoom: 18,
                });
                this._updateAppState({ setDirection: true, modifyLocation: false });
                this.updateButtonStyles();
                this.directionClick = this.view.on("click", (event) => {
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
                    let graphic = this.view.graphics.find((graphic) => graphic.symbol.type === "picture-marker");
                    this.view.graphics.remove(graphic);
                    this.view.graphics.add(newGraphic);
                    this._updateAppState({
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
            this.handleCapture = () => __awaiter(this, void 0, void 0, function* () {
                if (typeof DeviceOrientationEvent !== "undefined" &&
                    typeof DeviceOrientationEvent.requestPermission === "function") {
                    try {
                        const response = yield DeviceOrientationEvent.requestPermission();
                        if (response !== "granted") {
                            alert("Permission for device orientation was denied.");
                            return;
                        }
                    }
                    catch (err) {
                        console.error("Error requesting orientation permission:", err);
                        return;
                    }
                }
                this._updateAppState({ captureDate: Date.now() });
                const canvas = this.canvasRef;
                const ctx = canvas.getContext("2d");
                if (!this.stream)
                    return;
                this.canvasRef.width = this.videoRef.videoWidth;
                this.canvasRef.height = this.videoRef.videoHeight;
                ctx.drawImage(this.videoRef, 0, 0, this.canvasRef.width, this.canvasRef.height);
                if (this.stream) {
                    this.stream.getTracks().forEach((track) => track.stop());
                    this.videoRef.srcObject = null;
                    this.stream = null;
                }
                this._updateAppState({ captured: true });
            });
            this.addNewFeature = (geoJSON) => {
                const newGraphic = new Graphic_1.default({
                    attributes: geoJSON.attributes,
                    geometry: geoJSON.geometry,
                });
                return this.layer
                    .applyEdits({
                    addFeatures: [newGraphic],
                })
                    .then((result) => __awaiter(this, void 0, void 0, function* () {
                    return result.addFeatureResults[0].objectId;
                }))
                    .catch((err) => console.error(err));
            };
        }
        startCapturing() {
            return __awaiter(this, void 0, void 0, function* () {
                const video = this.videoRef;
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    alert("Camera not supported on this device/browser.");
                    return;
                }
                try {
                    this.stream = yield navigator.mediaDevices.getUserMedia({
                        video: { facingMode: "environment" },
                    });
                    if (video) {
                        video.srcObject = this.stream;
                    }
                }
                catch (err) {
                    alert("Could not access the camera. Permission denied or device issue.");
                    console.error(err);
                }
            });
        }
        postInitialize() {
            this.state = {
                recaptureCount: 0,
                captured: false,
                heading: 0,
                modifyLocation: false,
                setDirection: false,
                imageData: {
                    location: null,
                    cameraHeading: 0,
                },
                captureDate: null,
            };
            window.addEventListener("deviceorientationabsolute", this.handleOrientation, true);
            window.addEventListener("deviceorientation", this.handleOrientation, true);
        }
        destroy() {
            window.removeEventListener("deviceorientationabsolute", this.handleOrientation);
            window.removeEventListener("deviceorientation", this.handleOrientation);
            if (this.stream) {
                this.stream.getTracks().forEach((track) => track.stop());
            }
            if (this.editHandler) {
                this.editHandler.remove();
                this.editHandler = null;
            }
            super.destroy();
        }
        render() {
            return ((0, widget_1.tsx)("div", { class: "capture-image" },
                (0, widget_1.tsx)("canvas", { id: "canvas", afterCreate: (node) => (this.canvasRef = node), class: `screen-style ${this.state.captured ? "display-block" : "display-none"}` }),
                (0, widget_1.tsx)("video", { id: "video", afterCreate: (video) => {
                        this.videoRef = video;
                        this.startCapturing();
                    }, bind: this, autoplay: true, playsinline: true, class: `screen-style ${this.state.captured ? "display-none" : "display-block"}` }),
                (0, widget_1.tsx)("div", { class: "close-capture", onclick: () => {
                        this.setCameraActive(false);
                        this.videoRef.srcObject = null;
                        this.stream = null;
                    }, bind: this },
                    (0, widget_1.tsx)("img", { src: "app/images/close.svg", alt: "close", width: 20, height: 20 })),
                (0, widget_1.tsx)("div", { class: "capture-panel" },
                    this.state.captured ? ((0, widget_1.tsx)("calcite-button", { scale: "l", onclick: () => {
                            this._updateAppState({
                                recaptureCount: this.state.recaptureCount + 1,
                            });
                            this._updateAppState({ captured: false });
                            this.startCapturing();
                        }, bind: this },
                        " ",
                        "Re capture")) : ((0, widget_1.tsx)("div", { class: "capture-btn", title: "Click to Capture", onclick: this.handleCapture, onmouseDown: (e) => (e.currentTarget.style.transform = "scale(0.95)"), onmouseUp: (e) => (e.currentTarget.style.transform = "scale(1)"), onmouseLeave: (e) => (e.currentTarget.style.transform = "scale(1)"), bind: this })),
                    this.state.captured && ((0, widget_1.tsx)("calcite-button", { scale: "l", onclick: this.handleSavingImageAndLocation, bind: this }, "Done")))));
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
        createRequestId() {
            const now = new Date();
            const pad = (num) => num.toString().padStart(2, "0");
            const day = pad(now.getDate());
            const month = pad(now.getMonth() + 1);
            const year = now.getFullYear();
            const hours = pad(now.getHours());
            const minutes = pad(now.getMinutes());
            const timestamp = `${day}${month}${year}${hours}${minutes}`;
            return `TP_${timestamp}`;
        }
        _getFieldFromLayer(layer, fieldName) {
            let name = "", field = layer.fields.find((field) => {
                return field.name.toLowerCase() === (fieldName === null || fieldName === void 0 ? void 0 : fieldName.toLowerCase());
            });
            if (field)
                name = field.name;
            return name;
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
    ], CaptureImage.prototype, "setCameraActive", void 0);
    __decorate([
        (0, decorators_1.property)()
    ], CaptureImage.prototype, "state", void 0);
    CaptureImage = __decorate([
        (0, decorators_1.subclass)("esri.widgets.CaptureImage")
    ], CaptureImage);
    return CaptureImage;
});
