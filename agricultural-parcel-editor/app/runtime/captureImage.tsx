import Graphic from "esri/Graphic";
import { subclass, property } from "esri/core/accessorSupport/decorators";
import Point from "esri/geometry/Point";
import projection from "esri/geometry/projection";
import MapView from "esri/views/MapView";
import Widget from "esri/widgets/Widget";
import { tsx } from "esri/widgets/support/widget";
import CustomEditor from "./editor";
import geometryEngine from "esri/geometry/geometryEngine";
import SimpleMarkerSymbol from "esri/symbols/SimpleMarkerSymbol";
import PictureMarkerSymbol from "esri/symbols/PictureMarkerSymbol";
import Circle from "esri/geometry/Circle";
import SimpleFillSymbol from "esri/symbols/SimpleFillSymbol";
interface CaptureImageParams extends __esri.WidgetProperties {
  setCameraActive: any;
  view: MapView;
  layer: any;
  setFpFeatures: any;
  fpFeatures: [];
  formTemplate: any;
  nls: any;
  currFeature: any;
  save: any;
  setSave: any;
}
interface ImageData {
  location: any;
  cameraHeading: number;
}

interface State {
  recaptureCount: number;
  captured: boolean;
  heading: any;
  modifyLocation: any;
  setDirection: any;
  imageData: ImageData;
  captureDate: number;
}

@subclass("esri.widgets.CaptureImage")
class CaptureImage extends Widget {
  editHandler: any = null;
  canvasRef: HTMLCanvasElement = null;
  videoRef: HTMLVideoElement = null;
  stream: any = null;
  locationClick: any = null;
  directionClick: any = null;
  feature: any = null;
  constructor(params?: CaptureImageParams) {
    super(params);
  }
  private handleOrientation = (event: any) => {
    let absoluteHeading: number | null = null;

    if (event.absolute && typeof event.alpha === "number") {
      absoluteHeading = 360 - event.alpha; // alpha is clockwise from north
    } else if (typeof event.webkitCompassHeading === "number") {
      absoluteHeading = event.webkitCompassHeading;
    }

    if (absoluteHeading !== null) {
      this.state.heading = parseFloat(absoluteHeading.toFixed(2)); // rounded to 2 decimal places
    }
  };

  // Start capturing video
  private async startCapturing() {
    const video = this.videoRef;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Camera not supported on this device/browser.");
      return;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // rear camera on phone
      });
      if (video) {
        video.srcObject = this.stream;
      }
    } catch (err) {
      alert("Could not access the camera. Permission denied or device issue.");
      console.error(err);
    }
  }
  override postInitialize() {
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
    window.addEventListener(
      "deviceorientationabsolute",
      this.handleOrientation,
      true
    );
    window.addEventListener("deviceorientation", this.handleOrientation, true);

    // Start video capture
  }
  override destroy() {
    // Remove orientation event listeners
    window.removeEventListener(
      "deviceorientationabsolute",
      this.handleOrientation
    );
    window.removeEventListener("deviceorientation", this.handleOrientation);

    // Stop video stream if it's active
    if (this.stream) {
      this.stream.getTracks().forEach((track: any) => track.stop());
    }
    if (this.editHandler) {
      this.editHandler.remove();
      this.editHandler = null;
    }
    super.destroy(); // Don't forget to call super.destroy() for proper cleanup.
  }

  @property()
  setCameraActive: any;
  view: MapView;
  layer: any;
  setFpFeatures: any;
  fpFeatures: [];
  formTemplate: any;
  nls: any;
  currFeature: any;
  save: any;
  setSave: any;
  //----------------------------------
  //  state
  //----------------------------------

  @property()
  state: State;
  //-------------------------------------------------------------------
  //
  //  Public methods
  //
  //-------------------------------------------------------------------

  override render() {
    return (
      <div class="capture-image">
        <canvas
          id="canvas"
          afterCreate={(node: any) => (this.canvasRef = node)}
          class={`screen-style ${
            this.state.captured ? "display-block" : "display-none"
          }`}
        ></canvas>

        <video
          id="video"
          afterCreate={(video: HTMLVideoElement) => {
            this.videoRef = video;
            this.startCapturing(); // ⬅️ Camera setup starts here
          }}
          bind={this}
          autoplay
          playsinline
          class={`screen-style ${
            this.state.captured ? "display-none" : "display-block"
          }`}
        ></video>
        <div
          class="close-capture"
          onclick={() => {
            this.setCameraActive(false);
            this.videoRef.srcObject = null;
            this.stream = null;
          }}
          bind={this}
        >
          <img src="app/images/close.svg" alt="close" width={20} height={20} />
        </div>
        <div class="capture-panel">
          {this.state.captured ? (
            <calcite-button
              scale="l"
              onclick={() => {
                this._updateAppState({
                  recaptureCount: this.state.recaptureCount + 1,
                });
                this._updateAppState({ captured: false });
                this.startCapturing();
              }}
              bind={this}
            >
              {" "}
              Re capture
            </calcite-button>
          ) : (
            <div
              class="capture-btn"
              title="Click to Capture"
              onclick={this.handleCapture}
              onmouseDown={(e: any) =>
                (e.currentTarget.style.transform = "scale(0.95)")
              }
              onmouseUp={(e: any) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
              onmouseLeave={(e: any) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
              bind={this}
            ></div>
          )}

          {this.state.captured && (
            <calcite-button
              scale="l"
              onclick={this.handleSavingImageAndLocation}
              bind={this}
            >
              Done
            </calcite-button>
          )}
        </div>
      </div>
    );
  }
  //-------------------------------------------------------------------
  //
  //  Private methods
  //
  //-------------------------------------------------------------------

  private handleSavingImageAndLocation = async () => {
    if (!this.canvasRef) {
      console.warn("Canvas not ready");
      return;
    }
    const dataUrl = this.canvasRef.toDataURL("image/jpeg", 1);

    this.setCameraActive(false);
    this.layer.editingEnabled = true;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
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
          geometry: new Point({
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
          }),
        };

        this.feature = geoJSON;
        await this.view.goTo(geoJSON.geometry);

        const container: any = document.createElement("div");
        if (this.formTemplate) {
          this.formTemplate.elements.forEach((element: any) => {
            let fieldName: any = this._getFieldFromLayer(
              this.layer,
              element.fieldName
            );
            if (fieldName) element.fieldName = fieldName;
            if (element.label?.includes("nls."))
              element.label = this.nls[element.label.split("nls.")[1]];
            if (element.hint?.includes("nls."))
              element.hint = this.nls[element.hint.split("nls.")[1]];
          });
        }
        const editor: any = new CustomEditor({
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
          editor.create(
            new Graphic({
              attributes: geoJSON.attributes,
              geometry: geoJSON.geometry,
            }),
            { updateGeometry: false, drawInActive: true }
          );
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

              setLocationBtn.setAttribute(
                "appearance",
                this.state.modifyLocation ? "solid" : "outline-fill"
              );
              setDirectionBtn.setAttribute(
                "appearance",
                !this.state.setDirection ? "outline-fill" : "solid"
              );

              if (setLocationBtn) {
                setLocationBtn.addEventListener(
                  "click",
                  this.handleModifyLocation
                );
              }
              if (setDirectionBtn) {
                setDirectionBtn.addEventListener(
                  "click",
                  this.handleSetDirection
                );
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
            } else {
              console.warn("form-template not found inside second flow-item");
            }
          }, 300);
        });

        this.view.ui.add(editor, "top-right");
        this.editHandler = this.layer.on("edits", async (result: any) => {
          this.setSave({ ...this.save, photos: true });
          if (
            this.state.imageData.location ||
            this.state.imageData.cameraHeading
          )
            this.handleSave(result.addedFeatures[0].objectId);

          if (result.edits.addFeatures.length > 0)
            this.setFpFeatures(
              this.updateFpFeatures(
                this.fpFeatures,
                result.edits.addFeatures[0].attributes.requestId,
                result.addedFeatures[0].objectId,
                "Create"
              )
            );
          else if (result.edits.deleteFeatures.length > 0)
            this.setFpFeatures(
              this.updateFpFeatures(
                this.fpFeatures,
                null,
                result.deletedFeatures[0].objectId,
                "Delete"
              )
            );
        });
      },
      (err) => console.error(err),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );
  };

  private getBase64ImageSrc(imageString: string, defaultType = "jpeg"): string {
    const prefixPattern = /^data:image\/[a-zA-Z]+;base64,/;
    if (prefixPattern.test(imageString)) {
      return imageString;
    } else {
      return `data:image/${defaultType};base64,${imageString}`;
    }
  }

  private updateButtonStyles() {
    const setLocationBtn = document.querySelector("#set-location");
    const setDirectionBtn = document.querySelector("#set-direction");

    const { modifyLocation, setDirection } = this.state;

    if (setLocationBtn) {
      setLocationBtn.setAttribute(
        "appearance",
        modifyLocation ? "solid" : "outline-fill"
      );
    }

    if (setDirectionBtn) {
      setDirectionBtn.setAttribute(
        "appearance",
        setDirection ? "solid" : "outline-fill"
      );
    }
  }

  private createRequestId(): string {
    const now = new Date();

    const pad = (num: number): string => num.toString().padStart(2, "0");

    const day = pad(now.getDate());
    const month = pad(now.getMonth() + 1); // Months are 0-indexed
    const year = now.getFullYear();
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());

    const timestamp = `${day}${month}${year}${hours}${minutes}`;

    return `TP_${timestamp}`;
  }

  private updateFpFeatures = (
    prev: any[],
    id: string,
    featureId: number,
    method: string
  ) => {
    if (method === "Create") {
      const newFeature = {
        requestId: id,
        [this.layer.objectIdField]: featureId,
      };
      return [...prev, newFeature];
    } else if (method === "Delete")
      return prev.filter((feature) => feature.requestId !== id);
  };
  private handleSave = (featureId: number) => {
    if (this.locationClick) {
      this.locationClick.remove();
      this.locationClick = null;
    }
    if (this.directionClick) {
      this.directionClick.remove();
      this.directionClick = null;
    }
    const newGraphic = new Graphic({
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
      .then(async () => {
        this.view.graphics.removeAll();
        this.view.container.style.cursor = "auto";
        this._updateAppState({ modifyLocation: false });
        this._updateAppState({ setDirection: false });
      })
      .catch((error: any) => {
        console.error("Error updating feature:", error);
      });
  };
  private handleModifyLocation = () => {
    const wasActive = this.state.modifyLocation;

    // Cleanup if already active
    if (wasActive && this.locationClick) {
      this.locationClick.remove();
      this.locationClick = null;
      const graphics = this.view.graphics.filter(
        (graphic: any) =>
          graphic.symbol.type === "simple-fill" ||
          graphic.symbol.type === "simple-marker"
      );
      this.view.graphics.removeMany(graphics);
      this.view.container.style.cursor = "auto";
      this._updateAppState({ modifyLocation: false, setDirection: false });
      this.updateButtonStyles();
      return;
    }

    // Deactivate setDirection if active
    if (this.state.setDirection && this.directionClick) {
      this.directionClick.remove();
      this.directionClick = null;
      const graphic = this.view.graphics.find(
        (graphic: any) => graphic.symbol.type === "picture-marker"
      );
      this.view.graphics.remove(graphic);
    }

    this.view.container.style.cursor = "crosshair";
    this.view.goTo({
      target: this.feature.geometry,
      zoom: 18,
    });

    const circleGeometry = new Circle({
      center: this.feature.geometry,
      radius: 50,
      radiusUnit: "meters",
      geodesic: true,
    });

    const circleGraphic = new Graphic({
      geometry: circleGeometry,
      symbol: new SimpleFillSymbol({
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
    this.locationClick = this.view.on("click", (event: any) => {
      event.stopPropagation();
      const newGraphic = new Graphic({
        geometry: event.mapPoint,
        symbol: new SimpleMarkerSymbol({
          color: [255, 0, 0],
          size: 6,
          outline: {
            width: 1,
            color: [255, 0, 0],
          },
        }),
      });

      const projectedCircle = projection.project(
        circleGeometry,
        event.mapPoint.spatialReference
      );

      if (
        geometryEngine.contains(
          projectedCircle as __esri.Geometry,
          event.mapPoint
        )
      ) {
        let graphics = this.view.graphics.filter(
          (graphic) =>
            graphic.symbol.type === "simple-fill" ||
            graphic.symbol.type === "simple-marker"
        );
        this.view.graphics.removeMany(graphics);
        this.view.graphics.add(circleGraphic);
        this.view.graphics.add(newGraphic);
        this._updateAppState({
          imageData: { ...this.state.imageData, location: event.mapPoint },
        });
      } else {
        let dialog = document.createElement(
          "calcite-alert"
        ) as HTMLCalciteAlertElement;
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
  private handleSetDirection = () => {
    const wasActive = this.state.setDirection;

    if (wasActive && this.directionClick) {
      this.directionClick.remove();
      this.directionClick = null;
      const graphic = this.view.graphics.find(
        (graphic: any) => graphic.symbol.type === "picture-marker"
      );
      this.view.graphics.remove(graphic);
      this.view.container.style.cursor = "auto";
      this._updateAppState({ setDirection: false, modifyLocation: false });
      this.updateButtonStyles();
      return;
    }

    // Deactivate modifyLocation if active
    if (this.state.modifyLocation && this.locationClick) {
      this.locationClick.remove();
      this.locationClick = null;
      const graphics = this.view.graphics.filter(
        (graphic: any) =>
          graphic.symbol.type === "simple-fill" ||
          graphic.symbol.type === "simple-marker"
      );
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
      const x1 = refPoint.x,
        y1 = refPoint.y;
      const x2 = clickPoint.longitude,
        y2 = clickPoint.latitude;

      const angle = this.getAngle(y1, x1, y2, x2);
      console.log("Angle:", angle);
      const newGraphic = new Graphic({
        geometry: this.feature.geometry,
        symbol: new PictureMarkerSymbol({
          url: "app/images/direction.svg",
          width: "140px",
          height: "140px",
          angle,
        }),
      });
      let graphic = this.view.graphics.find(
        (graphic) => graphic.symbol.type === "picture-marker"
      );
      this.view.graphics.remove(graphic);
      this.view.graphics.add(newGraphic);
      this._updateAppState({
        imageData: { ...this.state.imageData, cameraHeading: angle },
      });
    });
  };

  private getAngle = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const toRadians = (deg: number) => deg * (Math.PI / 180);
    const toDegrees = (rad: number) => rad * (180 / Math.PI);

    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δλ = toRadians(lon2 - lon1);

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x =
      Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    let θ = Math.atan2(y, x);
    θ = toDegrees(θ);
    return (θ + 360) % 360;
  };

  private _getFieldFromLayer(layer: any, fieldName: string) {
    let name: any = "",
      field: any = layer.fields.find((field: any) => {
        return field.name.toLowerCase() === fieldName?.toLowerCase();
      });
    if (field) name = field.name;
    return name;
  }
  private handleCapture = async () => {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      try {
        const response = await (
          DeviceOrientationEvent as any
        ).requestPermission();
        if (response !== "granted") {
          alert("Permission for device orientation was denied.");
          return;
        }
      } catch (err) {
        console.error("Error requesting orientation permission:", err);
        return;
      }
    }
    this._updateAppState({ captureDate: Date.now() });
    const canvas = this.canvasRef;
    const ctx = canvas.getContext("2d");

    if (!this.stream) return;

    this.canvasRef.width = this.videoRef.videoWidth;
    this.canvasRef.height = this.videoRef.videoHeight;

    ctx.drawImage(
      this.videoRef,
      0,
      0,
      this.canvasRef.width,
      this.canvasRef.height
    );
    if (this.stream) {
      this.stream.getTracks().forEach((track: any) => track.stop());
      this.videoRef.srcObject = null;
      this.stream = null;
    }
    this._updateAppState({ captured: true });
  };

  private addNewFeature = (geoJSON: any) => {
    const newGraphic = new Graphic({
      attributes: geoJSON.attributes,
      geometry: geoJSON.geometry,
    });
    return this.layer
      .applyEdits({
        addFeatures: [newGraphic],
      })
      .then(async (result: any) => {
        return result.addFeatureResults[0].objectId;
      })
      .catch((err: any) => console.error(err));
  };

  private _updateAppState(properties: any) {
    let state = JSON.parse(JSON.stringify(this.state));
    Object.keys(properties).forEach((p) => {
      state[p] = properties[p];
    });
    this.state = state;
  }
}
export = CaptureImage;
