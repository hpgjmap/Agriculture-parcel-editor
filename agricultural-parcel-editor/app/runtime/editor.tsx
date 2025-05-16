import { subclass, property } from "esri/core/accessorSupport/decorators";
import Widget from "esri/widgets/Widget";
import { tsx } from "esri/widgets/support/widget";
import MapView from "esri/views/MapView";
import esriRequest from "esri/request";
import GeoJSONLayer from "esri/layers/GeoJSONLayer";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import reactiveUtils from "esri/core/reactiveUtils";
import Extent from "esri/geometry/Extent";
import Point from "esri/geometry/Point";
import Circle from "esri/geometry/Circle";
import Polyline from "esri/geometry/Polyline";
import Polygon from "esri/geometry/Polygon";
import geometryEngine from "esri/geometry/geometryEngine";
import Graphic from "esri/Graphic";
import SpatialReference from "esri/geometry/SpatialReference";
import Query from "esri/rest/support/Query";
import Sketch from "esri/widgets/Sketch";
import Feature from "esri/widgets/Feature";
import FeatureForm from "esri/widgets/FeatureForm";
import FormTemplate from "esri/form/FormTemplate";
import FieldElement from "esri/form/elements/FieldElement";

interface EditorParams extends __esri.WidgetProperties {
  options: any;
  nls: any;
  container: any;
  layer: any;
  view: MapView;
}
interface State {
  error: any;
  drawActive: boolean;
  formActive: boolean;
  confirmActive: boolean;
  loading: boolean;
  updateDrawHelp: boolean;
}
@subclass("esri.widgets.editor")
class Editor extends Widget {
  constructor(params?: EditorParams) {
    super(params);
  }
  sketchTool: any;
  mode: string = "";
  loading: boolean = false;
  featureForm: any;
  override async postInitialize() {
    console.log(this.options);
    this.state = {
      error: "",
      drawActive: false,
      formActive: false,
      confirmActive: false,
      loading: false,
      updateDrawHelp: false,
    };
    if (
      this.layer &&
      this.layer.editingEnabled &&
      this.view &&
      this.container
    ) {
      let visibleElements: any = {
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
      let graphicsLayer = new GraphicsLayer({
        id: "custom-graphicsLayer",
        elevationInfo: {
          mode: "on-the-ground",
        },
        listMode: "hide",
      });
      this.view.map.add(graphicsLayer);
      this.sketchTool = new Sketch({
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
      this.sketchTool.on("create", async (evt: any) => {
        if (evt.state === "start") {
          this._updateState({ updateDrawHelp: false });
        } else if (evt.state === "active") {
          !this.state.updateDrawHelp &&
            this._updateState({ updateDrawHelp: true });
        } else if (evt.state === "complete") {
          if (this.mode === "create") {
            this._updateState({ formActive: true, drawActive: true });
          } else {
            this.emit("draw", evt.graphic);
          }
        } else if (evt.state === "cancel") {
          this._destroy();
        }
      });
      this.sketchTool.on("update", async (evt: any) => {
        if (evt.state === "complete") {
        }
      });
      this.sketchTool.on("delete", async (evt: any) => {
        this.sketchTool.layer.add(evt.graphics[0]);
        this.sketchTool.update(evt.graphics[0]);
        this._updateState({ confirmActive: true });
      });
      this.sketchTool.viewModel.polygonSymbol =
        this.layer.renderer.defaultSymbol ||
        this.layer.renderer.symbol?.symbol ||
        this.layer.renderer.symbol;
    } else {
      this._updateState({ error: this.nls.editorInitializeError });
    }
  }

  @property()
  options: any;
  nls: any;
  container: any;
  layer: any;
  view: MapView;

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

  create(graphic: any, options: any) {
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
    } else {
      this.sketchTool.layer.removeAll();
      let newGraphic = graphic.clone();
      newGraphic.layer = this.sketchTool.layer;
      this.sketchTool.layer.add(newGraphic);
      if (options?.updateGeometry) this.sketchTool.update([newGraphic]);
      if(options?.drawInActive) this._updateState({drawActive: false, formActive: true}); // Himanshu Added this condition
      else this._updateState({ drawActive: true, formActive: true });
    }
  }
  update(graphic: any) {
    this.mode = "update";
    this.sketchTool.layer.removeAll();
    let newGraphic = graphic.clone();
    newGraphic.layer = this.sketchTool.layer;
    this.sketchTool.layer.add(newGraphic);
    this.sketchTool.update([newGraphic]);
    let definitionExpression = this.layer.definitionExpression || ""
    if(definitionExpression)
        definitionExpression += " AND "
    definitionExpression += this.layer.objectIdField + " <> " + graphic.attributes[this.layer.objectIdField]
    this.layer.definitionExpression = definitionExpression
    this._updateState({ drawActive: false, formActive: true });
  }
  destroy() {
    this._destroy();
  }
  override render() {
    let drawPanel, formPanel, confirmBox;
    if (this.state.drawActive) {
      drawPanel = (
        <calcite-flow-item
          selected={!this.state.formActive}
          loading={this.state.loading}
          heading={this.options.heading}
          closable="true"
          oncalciteFlowItemClose={() => {
            this._destroy();
          }}
          bind={this}
        >
          <div class="editor-draw-help">
            {this.state.updateDrawHelp
              ? this.nls.drawHelpText2
              : this.nls.drawHelpText}
          </div>
        </calcite-flow-item>
      );
    }
    if (this.state.formActive) {
      let action: any, secondAction: any;
      if (this.mode === "update") {
        action = (
          <div slot="footer" class="edit-form-footer">
            <calcite-button
              kind="brand"
              title={this.nls.update}
              width="half"
              onclick={({ target }: any) => {
                this._submitForm(target);
              }}
              bind={this}
            >
              {this.nls.update}
            </calcite-button>
            <calcite-button
              kind="danger"
              appearance="outline"
              width="half"
              title={this.nls.delete}
              onclick={this._deleteFeature}
              bind={this}
            >
              {this.nls.delete}
            </calcite-button>
          </div>
        );
      } else {
        action = (
          <calcite-button
            slot="footer"
            kind="brand"
            title={this.nls.create}
            onclick={({ target }: any) => {
              this._submitForm(target);
            }}
            bind={this}
          >
            {this.nls.create}
          </calcite-button>
        );
      }

      formPanel = (
        <calcite-flow-item
          selected
          closable={false}
          loading={this.state.loading}
          heading={this.options.heading}
          bind={this}
          oncalciteFlowItemBack={() => {
            this.mode === "draw" ? this.draw() : this.create(null, null);
          }}
        >
          <calcite-action
            slot="header-actions-end"
            icon="x"
            title={this.nls.close}
            onclick={() => {
              this._updateState({ confirmActive: true });
            }}
          ></calcite-action>
          <div
            class="form-template"
            afterCreate={this._createForm}
            bind={this}
          ></div>
          {action}
        </calcite-flow-item>
      );
    }
    if (this.state.confirmActive) {
      confirmBox = (
        <calcite-scrim class="editor-prompt-scrim">
          <div class="editor-prompt-danger">
            <div class="editor-prompt-header">
              <calcite-icon
                icon="exclamation-mark-triangle"
                scale="m"
              ></calcite-icon>
              <h4 class="editor-prompt-header-title">
                {this.nls.discardEdits}
              </h4>
            </div>
            <div class="editor-prompt-message">{this.nls.unsavedChanges}</div>
            <div class="editor-prompt-divider"></div>
            <div class="editor-prompt-actions">
              <calcite-button
                kind="danger"
                appearance="outline"
                title={this.nls.continueEditing}
                width="half"
                onclick={() => {
                  this._updateState({ confirmActive: false });
                }}
                bind={this}
              >
                {this.nls.continueEditing}
              </calcite-button>
              <calcite-button
                kind="danger"
                appearance="solid"
                width="half"
                title={this.nls.discardEdits}
                onclick={this._destroy}
                bind={this}
              >
                {this.nls.discardEdits}
              </calcite-button>
            </div>
          </div>
        </calcite-scrim>
      );
    }

    return (
      <div class="editor-panel">
        <calcite-flow>
          {drawPanel}
          {formPanel}
        </calcite-flow>
        {confirmBox}
      </div>
    );
  }
  //-------------------------------------------------------------------
  //
  //  Private methods
  //
  //-------------------------------------------------------------------
  private _createForm(dom: any) {
    let graphic = this.sketchTool.layer.graphics.getItemAt(0)?.clone(),
      template: any;
    if (graphic) {
      let div = document.createElement("div");
      dom.appendChild(div);
      if (this.options.formTemplate) {
        template = this.options.formTemplate;
      } else {
        let elements: any[] = [];
        this.layer.fields.forEach((field: any) => {
          if (
            field.type !== "oid" &&
            field.type !== "guid" &&
            field.name.toLowerCase() !== "objectid"
          ) {
            let param: any = {
              fieldName: field.name,
              label: field.alias,
            };
            if (field.type.includes("date")) {
              param.input = {
                type: "datetime-picker",
              };
            }
            elements.push(new FieldElement(param));
          }
        });
        template = new FormTemplate({
          title: "",
          description: "",
          elements: elements,
        });
      }
      this.featureForm?.destroy();
      this.featureForm = new FeatureForm({
        container: div,
        feature: graphic,
        formTemplate: template,
        layer: this.layer,
        //map: this.view.map
      });

      this.featureForm.on("submit", (updatedGraphic: any) => {
        this.mode === "update"
          ? this._updateFeature(updatedGraphic.values)
          : this._createFeature(updatedGraphic.values);
      });
    }
  }
  private async _createFeature(attributes: any) {
    let graphic = this.sketchTool.layer.graphics.getItemAt(0);
    if (graphic) {
      graphic.attributes = attributes;
      await this.layer.applyEdits({ addFeatures: [graphic] }).then(() => {});
    }
    this._destroy();
  }
  private async _updateFeature(attributes: any) {
    let graphic = this.sketchTool.layer.graphics.getItemAt(0);
    if (graphic) {
      attributes[this.layer.objectIdField] =
        graphic.attributes[this.layer.objectIdField];
      graphic.attributes = attributes;
      await this.layer.applyEdits({ updateFeatures: [graphic] }).then(() => {});
    }
    this._destroy();
    let definitionExpression = this.layer.definitionExpression || "";
    let replaceString =
      this.layer.objectIdField +
      " <> " +
      graphic.attributes[this.layer.objectIdField];
    if (definitionExpression.includes(" AND " + replaceString))
      this.layer.definitionExpression = definitionExpression.replace(
        " AND " + replaceString,
        ""
      );
    else
      this.layer.definitionExpression = definitionExpression.replace(
        replaceString,
        ""
      );
  }
  private async _deleteFeature({ target }: any) {
    target.loading = true;
    let graphic = this.sketchTool.layer.graphics.getItemAt(0);
    if (graphic) {
      await this.layer
        .applyEdits({
          deleteFeatures: [
            { objectId: graphic.attributes[this.layer.objectIdField] },
          ],
        })
        .then(() => {});
    }
    this._destroy();
    let definitionExpression = this.layer.definitionExpression || "";
    let replaceString =
      this.layer.objectIdField +
      " <> " +
      graphic.attributes[this.layer.objectIdField];
    if (definitionExpression.includes(" AND " + replaceString))
      this.layer.definitionExpression = definitionExpression.replace(
        " AND " + replaceString,
        ""
      );
    else
      this.layer.definitionExpression = definitionExpression.replace(
        replaceString,
        ""
      );
    target.loading = false;
  }
  private _submitForm(target: any) {
    target.loading = true;
    this.featureForm?.submit();
  }
  private _destroy() {
    this.container?.remove();
    this.view.map.remove(this.sketchTool?.layer);
    this.sketchTool?.destroy();
    this.emit("destroy");
  }
  private _updateState(properties: any) {
    let state = JSON.parse(JSON.stringify(this.state));
    Object.keys(properties).forEach((p) => {
      state[p] = properties[p];
    });
    this.state = state;
  }
}
export = Editor;
