import { subclass, property } from "esri/core/accessorSupport/decorators";
import Widget from "esri/widgets/Widget";
// import { init } from "esri/core/watchUtils";
import { tsx } from "esri/widgets/support/widget";
import Map from "esri/Map";
import MapView from "esri/views/MapView";
import WebMap from "esri/WebMap";
import PortalItem from "esri/portal/PortalItem";
import IdentityManager from "esri/identity/IdentityManager";
import OAuthInfo from "esri/identity/OAuthInfo";
import BasemapGallery from "esri/widgets/BasemapGallery";
import Measurement from "esri/widgets/Measurement";
import Home from "esri/widgets/Home";
import Search from "esri/widgets/Search";
import ScaleBar from "esri/widgets/ScaleBar";
import Expand from "esri/widgets/Expand";
import esriRequest from "esri/request";
import arcgisPortal from "esri/portal/Portal";
import PortalUser from "esri/portal/PortalUser";
import GeoJSONLayer from "esri/layers/GeoJSONLayer";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import Circle from "esri/geometry/Circle";
import Polygon from "esri/geometry/Polygon";
import geometryEngine from "esri/geometry/geometryEngine";
import Graphic from "esri/Graphic";
import SpatialReference from "esri/geometry/SpatialReference";
import Sketch from "esri/widgets/Sketch";
import PortalGroup from "esri/portal/PortalGroup";
import UniqueValueRenderer from "esri/renderers/UniqueValueRenderer";
import SimpleRenderer from "esri/renderers/SimpleRenderer";
import FeatureForm from "esri/widgets/FeatureForm";
import reshapeOperator from "esri/geometry/operators/reshapeOperator";
import cutOperator from "esri/geometry/operators/cutOperator";
import areaOperator from "esri/geometry/operators/areaOperator";
import geodeticAreaOperator from "esri/geometry/operators/geodeticAreaOperator";
import CustomEditor from "app/editor";
import CaptureImage from "./captureImage";
import PictureMarkerSymbol from "esri/symbols/PictureMarkerSymbol";
import SimpleFillSymbol from "esri/symbols/SimpleFillSymbol";
import SimpleMarkerSymbol from "esri/symbols/SimpleMarkerSymbol";
import projection from "esri/geometry/projection";
interface MainParams extends __esri.WidgetProperties {
  options: any;
  nls: any;
  container: any;
}
interface State {
  error: any;
  notification: any;
  user: any;
  title: string;
  theme: any;
  farmerID: string;
  rightTool: string;
  currentBasemap: string;
  currentBaseImage: string;
  referenceParcelsToggle: boolean;
  agriculturalParcelsOutlineToggle: boolean;
  agriculturalParcelsFillToggle: boolean;
  agriculturalZonesToggle: boolean;
  requestsLayerToggle: boolean;
  requiredPhotosLayerToggle: boolean;
  farmerPhotosLayerToggle: boolean;
  notesLayerToggle: boolean;
  currentMeasurementTool: string;
  showDeleteConfirmation: boolean;
  updateList: boolean;
  selectParcels: boolean;
  editBoundaryTool: string;
  save: any;
  confirmationDialog: any;
  declare: boolean;
  parcelEdit: any;
  // --Himanshu-start--
  apFeatures: [];
  fpFeatures: [];
  cameraActive: boolean;
  modifyLocation: boolean;
  setDirection: boolean;
  imageData: { location: any; cameraHeading: number };
  // --Himanshu-end--
}
@subclass("esri.widgets.Agricultural_Parcel_Editor")
class Agricultural_Parcel_Editor extends Widget {
  constructor(params?: MainParams) {
    super(params);
  }
  view: any = null;
  portal: arcgisPortal;
  user: PortalUser;
  basemapWidget: BasemapGallery;
  baseImageList: any = [];
  measurementTool: any;
  currentEditor: any;
  requestMade: any = {
    notes: false,
    comments: false,
  };
  layerEditHandler: any;
  farmerNotes: any[] = [];
  farmerComments: any[] = [];
  agencyRequests: any[] = [];
  selectedListNode: any;
  featureWidget: any;
  stateHandler: any;
  parcelList: any[] = [];
  trackChanges: any = {
    undo: {},
    redo: {},
  };
  parcelClickHandler: any;
  parcelViewHighlightHandler: any;
  sketchTool: any;
  farmerGroup: any;
  lastEditsInMemory: any[] = [];
  // --Himanshu-start--
  currFeature: any = null;
  locationClick: any = null;
  directionClick: any = null;
  // --Himanshu-end--
  override async postInitialize() {
    let param, webmap, theme, farmerID;
    param = new URL(location.href).searchParams;
    webmap = param.get("webmap");
    theme = param.get("theme") || this._getBrowserTheme();
    //farmerID = param.get("farmerid")
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
        // --Himanshu-start--
        photos: false,
        // --Himanshu-end--
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
      // --Himanshu-start--
      apFeatures: [],
      fpFeatures: [],
      cameraActive: false,
      modifyLocation: false,
      setDirection: false,
      imageData: {
        location: null,
        cameraHeading: 0,
      },
      // --Himanshu-end--
    };
    this._toggleTheme(theme);
    if (this.options.appID) {
      const oauthInfo = new OAuthInfo({
        appId: this.options.appID,
        portalUrl: this.options.portalURL,
        popup: false,
      });
      IdentityManager.registerOAuthInfos([oauthInfo]);
    }
    this.portal = new arcgisPortal({
      url: this.options.portalURL,
    });
    this.portal.authMode = "immediate";
    await this.portal
      .load()
      .then(() => {})
      .catch(() => {});
    await this._loginUser();
    window.addEventListener("beforeunload", (e) => {
      if (
        this.state.save.comments ||
        this.state.save.parcels ||
        this.state.save.notes ||
        this.state.save.photos
      ) {
        e.preventDefault();
        e.returnValue = "";
      }
    });
  }

  @property()
  options: any;
  nls: any;
  container: any;
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
    let content, mainTemplate, loadingScrim, userPopup;
    if (this.state.farmerID && this.state.farmerID !== "loading") {
      let { currentBasemap, error, rightTool, currentBaseImage, notification } =
        this.state;
      let errorAlert,
        requestsAction,
        notesAction,
        requiredPhotosAction,
        farmerPhotosAction,
        baseImageAction,
        basemapActions,
        addRequestAction,
        addNoteAction,
        addImageAction,
        addRequestContainer,
        addImageContainer,
        addNoteContainer,
        deleteModal,
        parcelList,
        parcelBoundaryActions,
        selectParcelInfo,
        themeMenu,
        confirmationDialog,
        notificationAlert;
      if (this.state.theme.menu) {
        themeMenu = (
          <calcite-flow-item
            heading="Appearance"
            oncalciteFlowItemBack={this._themeMenu}
            bind={this}
            selected
          >
            <calcite-action
              icon="brightness"
              text-enabled="true"
              text={this.nls.light}
              bind={this}
              onclick={() => {
                this._toggleTheme("light");
              }}
            ></calcite-action>
            <calcite-action
              icon="moon"
              text-enabled="true"
              text={this.nls.dark}
              bind={this}
              onclick={() => {
                this._toggleTheme("dark");
              }}
            ></calcite-action>
          </calcite-flow-item>
        );
      }
      if (error) {
        errorAlert = (
          <calcite-alert
            open="true"
            kind="danger"
            scale="m"
            placement="bottom"
            slot="alerts"
            oncalciteAlertClose={() => {
              this._updateState({ error: "" });
            }}
            bind={this}
          >
            <div slot="title">{this.nls.error}</div>
            <div slot="message">{error}</div>
          </calcite-alert>
        );
      }
      if (notification) {
        notificationAlert = (
          <calcite-alert
            open="true"
            kind="warning"
            scale="m"
            placement="bottom"
            slot="alerts"
            oncalciteAlertClose={() => {
              this._updateState({ notification: "" });
            }}
            bind={this}
          >
            <div slot="message">{notification}</div>
          </calcite-alert>
        );
      }
      userPopup = (
        <calcite-popover
          id="settings-menu"
          label=""
          reference-element="user-thumbnail"
          auto-close="true"
          pointer-disabled="true"
          overlay-positioning="fixed"
          placement="bottom-leading"
        >
          <calcite-flow id="flow-panel">
            <calcite-flow-item selected={!themeMenu}>
              <calcite-block
                heading={this.user?.fullName}
                description={this.user?.username}
                class="user-popup-block"
              >
                <calcite-avatar
                  scale="m"
                  slot="icon"
                  full-name={this.user?.username}
                  thumbnail={this.user.getThumbnailUrl(150)}
                ></calcite-avatar>
              </calcite-block>
              <calcite-block
                open
                class="user-popup-block disable-block-padding"
              >
                <calcite-button
                  class="display-inline-flex"
                  alignment="icon-end-space-between"
                  appearance="transparent"
                  kind="neutral"
                  scale="l"
                  icon-end="chevron-right"
                  icon-start={
                    this.state.theme.value === "light" ? "brightness" : "moon"
                  }
                  width="full"
                  bind={this}
                  onclick={this._themeMenu}
                >
                  {this.nls.appearance}:
                  {this.state.theme.value === "light"
                    ? " " + this.nls.light
                    : " " + this.nls.dark}
                </calcite-button>
              </calcite-block>
              <calcite-block
                open
                class="user-popup-block disable-block-padding"
              >
                <calcite-button
                  appearance="transparent"
                  scale="l"
                  alignment="start"
                  kind="neutral"
                  icon-start="sign-out"
                  width="full"
                  onclick={this._signOut}
                  bind={this}
                >
                  {this.nls.signOut}
                </calcite-button>
              </calcite-block>
            </calcite-flow-item>
            {themeMenu}
          </calcite-flow>
        </calcite-popover>
      );
      if (this.basemapWidget?.source?.basemaps?.length) {
        let actions: any = this.basemapWidget.source.basemaps.map(
          (basemap: any) => {
            return (
              <calcite-action
                title={basemap.title}
                text={basemap.title}
                text-enabled="true"
                active={currentBasemap === basemap.title}
                onclick={() => {
                  this._updateBasemap(basemap.title);
                }}
              ></calcite-action>
            );
          }
        );
        basemapActions = (
          <calcite-action-menu
            key="basemap-menu"
            placement="trailing-start"
            scale="m"
            overlay-positioning="fixed"
          >
            <calcite-action
              slot="trigger"
              title={this.nls.basemaps}
              text={this.nls.basemaps}
              icon="basemap"
            ></calcite-action>
            {actions.items}
          </calcite-action-menu>
        );
      }
      if (this.baseImageList.length) {
        let actions: any = this.baseImageList.map((layer: any) => {
          return (
            <calcite-action
              title={layer.title}
              text={layer.title}
              text-enabled="true"
              active={currentBaseImage === layer.title}
              onclick={() => {
                this._updateBaseImage(layer.title);
              }}
            ></calcite-action>
          );
        });
        baseImageAction = (
          <calcite-action-menu
            key="base-image-menu"
            placement="trailing-start"
            scale="m"
            overlay-positioning="fixed"
          >
            <calcite-action
              slot="trigger"
              title={this.nls.baseImage}
              text={this.nls.baseImage}
              icon="image-layer"
            ></calcite-action>
            {actions.items}
          </calcite-action-menu>
        );
      }
      if (
        this._getLayer("agency-requests") ||
        this._getLayer("farmer-comments")
      ) {
        let commentsList: any, requestsList: any;
        if (this.farmerComments?.length) {
          commentsList = (
            <calcite-list-item-group
              heading={this.nls.comments}
              key="comments-group"
            >
              {this.farmerComments.map((comment: any) => {
                return (
                  <calcite-list-item
                    value={
                      comment.attributes[comment.layer.objectIdField] +
                      "_comments"
                    }
                    label={
                      comment.attributes[
                        this._getFieldFromLayer(comment.layer, "name")
                      ]
                    }
                    key={
                      comment.attributes[comment.layer.objectIdField] +
                      "_comments"
                    }
                  ></calcite-list-item>
                );
              })}
            </calcite-list-item-group>
          );
        }
        if (this.agencyRequests?.length) {
          requestsList = (
            <calcite-list-item-group
              heading={this.nls.requests}
              key="requests-group"
            >
              {this.agencyRequests.map((request: any) => {
                return (
                  <calcite-list-item
                    value={
                      request.attributes[request.layer.objectIdField] +
                      "_requests"
                    }
                    label={
                      request.attributes[
                        this._getFieldFromLayer(request.layer, "name")
                      ]
                    }
                    key={
                      request.attributes[request.layer.objectIdField] +
                      "_requests"
                    }
                  ></calcite-list-item>
                );
              })}
            </calcite-list-item-group>
          );
        }
        requestsAction = (
          <calcite-action
            active={this.state.requestsLayerToggle}
            data-action-id="requestsLayer"
            text={this.nls.requestsComments}
            scale="m"
            title={this.nls.requestsComments}
            icon="speech-bubble"
            onclick={this._requestsLayerToggle}
            bind={this}
          ></calcite-action>
        );
        addRequestAction = (
          <calcite-action
            disabled={this.state.declare}
            active={this.state.rightTool === "requests"}
            text={this.nls.requests}
            scale="m"
            title={this.nls.requests}
            icon="speech-bubble-plus"
            onclick={({ target }: any) => {
              this._toggleRightTool(target, "requests");
            }}
            bind={this}
          ></calcite-action>
        );
        addRequestContainer = (
          <calcite-panel
            class="panel-height"
            heading={this.nls.requests}
            height-scale="l"
            closable
            data-panel-id="requests"
            closed={rightTool !== "requests"}
            hidden={rightTool !== "requests"}
            oncalcitePanelClose={() => {
              this._closeRightTool("requests");
            }}
            bind={this}
          >
            <div id="requests-container" class="margin-panel">
              <calcite-button
                icon-start="plus"
                appearance="solid"
                class="btn-display-flex"
                kind="brand"
                onclick={this._addComment}
                bind={this}
              >
                {this.nls.newComment}
              </calcite-button>
              <calcite-list
                scale="m"
                selection-mode="single"
                selection-appearance="border"
                filter-enabled="true"
                filter-placeholder={this.nls.search}
                oncalciteListChange={this._selectRequestsComments}
                bind={this}
              >
                {requestsList}
                {commentsList}
              </calcite-list>
            </div>
            <calcite-button
              slot="footer"
              disabled={!this.state.save.comments}
              appearance="solid"
              kind="brand"
              onclick={({ target }: any) => {
                this._saveFile("farmer-comments", target);
              }}
              bind={this}
            >
              {this.nls.save}
            </calcite-button>
          </calcite-panel>
        );
      }
      if (this._getLayer("farmer-notes")) {
        let notesList: any;
        if (this.farmerNotes?.length) {
          notesList = (
            <calcite-list
              scale="m"
              selection-appearance="border"
              selection-mode="single"
              filter-enabled="true"
              filter-placeholder={this.nls.search}
              oncalciteListChange={this._selectNotes}
              bind={this}
            >
              {this.farmerNotes.map((note: any) => {
                return (
                  <calcite-list-item
                    value={note.attributes[note.layer.objectIdField]}
                    label={
                      note.attributes[
                        this._getFieldFromLayer(note.layer, "name")
                      ]
                    }
                    key={note.attributes[note.layer.objectIdField] + "_notes"}
                  ></calcite-list-item>
                );
              })}
            </calcite-list>
          );
        } else {
          notesList = (
            <calcite-notice open icon="information">
              <div slot="message">{this.nls.noNotes}</div>
            </calcite-notice>
          );
        }
        notesAction = (
          <calcite-action
            active={this.state.notesLayerToggle}
            data-action-id="notesLayer"
            text={this.nls.notes}
            scale="m"
            title={this.nls.notes}
            icon="notepad"
            onclick={this._notesLayerToggle}
            bind={this}
          ></calcite-action>
        );
        addNoteAction = (
          <calcite-action
            disabled={this.state.declare}
            active={this.state.rightTool === "notes"}
            text={this.nls.notes}
            scale="m"
            title={this.nls.notes}
            icon="notepad-add"
            onclick={({ target }: any) => {
              this._toggleRightTool(target, "notes");
            }}
            bind={this}
          ></calcite-action>
        );
        addNoteContainer = (
          <calcite-panel
            class="panel-height"
            heading={this.nls.notes}
            height-scale="l"
            closable
            data-panel-id="notes"
            closed={rightTool !== "notes"}
            hidden={rightTool !== "notes"}
            oncalcitePanelClose={() => {
              this._closeRightTool("notes");
            }}
            bind={this}
          >
            <div id="notes-container" class="margin-panel">
              <calcite-button
                icon-start="plus"
                appearance="solid"
                kind="brand"
                class="btn-display-flex"
                onclick={this._addNewNote}
                bind={this}
              >
                {this.nls.newNote}
              </calcite-button>
              {notesList}
            </div>
            <calcite-button
              slot="footer"
              disabled={!this.state.save.notes}
              appearance="solid"
              kind="brand"
              onclick={({ target }: any) => {
                this._saveFile("farmer-notes", target);
              }}
              bind={this}
            >
              {this.nls.save}
            </calcite-button>
          </calcite-panel>
        );
      }
      // --Himanshu-start--
      if (
        this._getLayer("required-photos") ||
        this._getLayer("farmer-photos")
      ) {
        requiredPhotosAction = (
          <calcite-action
            active={this.state.requiredPhotosLayerToggle}
            data-action-id="requiredPhotosLayer"
            text={this.nls.requiredPhotos}
            scale="m"
            title={this.nls.requiredPhotos}
            icon="camera"
            onclick={this._requiredPhotosLayerToggle}
            bind={this}
          ></calcite-action>
        );
        addImageAction = (
          <calcite-action
            active={this.state.rightTool === "photos"}
            text={this.nls.photos}
            scale="m"
            title={this.nls.photos}
            icon="image-plus"
            onclick={({ target }: any) => {
              this._toggleRightTool(target, "photos");
            }}
            bind={this}
          ></calcite-action>
        );
        addImageContainer = (
          <calcite-panel
            class="panel-height"
            heading={this.nls.photos}
            height-scale="l"
            closable
            data-panel-id="photos"
            closed={rightTool !== "photos"}
            hidden={rightTool !== "photos"}
            oncalcitePanelClose={() => {
              this._closeRightTool("photos");
            }}
            bind={this}
          >
            <div id="photos-container" class="margin-panel">
              <calcite-button
                icon-start="camera-plus"
                onclick={() => {
                  this._removeEditor(false);
                  this._updateState({ cameraActive: true });
                }}
                appearance="solid"
                kind="brand"
                class="btn-display-flex"
                bind={this}
              >
                {this.nls.new}
              </calcite-button>
              <calcite-list
                scale="m"
                selection-mode="single"
                selection-appearance="border"
                filter-enabled="true"
                filter-placeholder={this.nls.search}
                oncalciteListChange={this._handleListChange}
              >
                <calcite-list-item-group heading={this.nls.listRequired}>
                  {this.state.apFeatures.map((feature: any) => (
                    <calcite-list-item
                      key={feature.requestId}
                      label={feature.requestId}
                      value={`required-${feature.requestId}`}
                    />
                  ))}
                </calcite-list-item-group>

                <calcite-list-item-group heading={this.nls.listTaken}>
                  {this.state.fpFeatures.map((feature: any) => (
                    <calcite-list-item
                      key={feature.requestId}
                      label={feature.requestId}
                      value={`taken-${feature.requestId}`}
                    />
                  ))}
                </calcite-list-item-group>
              </calcite-list>
            </div>
            <calcite-button
              slot="footer"
              disabled={!this.state.save.photos}
              appearance="solid"
              kind="brand"
              onclick={({ target }: any) => {
                this._saveFile("farmer-photos", target);
              }}
              bind={this}
            >
              {this.nls.save}
            </calcite-button>
          </calcite-panel>
        );
      }
      if (this._getLayer("farmer-photos")) {
        farmerPhotosAction = (
          <calcite-action
            active={this.state.farmerPhotosLayerToggle}
            data-action-id="farmerPhotosLayer"
            text={this.nls.farmerPhotos}
            scale="m"
            title={this.nls.farmerPhotos}
            icon="image"
            onclick={this._farmerPhotosLayerToggle}
            bind={this}
          ></calcite-action>
        );
      }
      // --Himanshu-end--


      //   addImageAction = (
      //     <calcite-action
      //       active={this.state.rightTool === "photos"}
      //       text={this.nls.photos}
      //       scale="m"
      //       title={this.nls.photos}
      //       icon="image-plus"
      //       onclick={({ target }: any) => {
      //         this._toggleRightTool(target, "photos");
      //       }}
      //       bind={this}
      //     ></calcite-action>
      //   );
      //   addImageContainer = (
      //     <calcite-panel
      //       class="panel-height"
      //       heading={this.nls.photos}
      //       height-scale="l"
      //       closable
      //       data-panel-id="photos"
      //       closed={rightTool !== "photos"}
      //       hidden={rightTool !== "photos"}
      //       oncalcitePanelClose={() => {
      //         this._closeRightTool("photos");
      //       }}
      //       bind={this}
      //     >
      //       <div id="photos-container" class="margin-panel">
      //         <calcite-button
      //           icon-start="camera-plus"
      //           onclick={() => {
      //             this._updateState({ cameraActive: true });
      //           }}
      //           appearance="solid"
      //           kind="brand"
      //           class="btn-display-flex"
      //           bind={this}
      //         >
      //           {this.nls.new}
      //         </calcite-button>
      //         <calcite-list
      //           scale="m"
      //           selection-mode="single"
      //           selection-appearance="border"
      //           filter-enabled="true"
      //           filter-placeholder={this.nls.search}
      //         >
      //           <calcite-list-item-group
      //             heading={this.nls.listRequired}
      //             key="list-required"
      //           >
      //             {this.state.apFeatures.length > 0 &&
      //               this.state.apFeatures.map((feature: any) => (
      //                 <calcite-list-item
      //                   oncalciteListItemSelect={() =>
      //                     this.openPopupForFeature(
      //                       this._getLayer("required-photos"),
      //                       feature.requestId
      //                     )
      //                   }
      //                   key={feature.requestId}
      //                   label={feature.requestId}
      //                 />
      //               ))}
      //           </calcite-list-item-group>
      //           <calcite-list-item-group heading={this.nls.listTaken}>
      //             {this.state.fpFeatures.length > 0 &&
      //               this.state.fpFeatures.map((feature: any) => (
      //                 <calcite-list-item
      //                   key={feature.requestId}
      //                   label={feature.requestId}
      //                   oncalciteListItemSelect={() =>
      //                     this.openPopupForFeature(
      //                       this._getLayer("farmer-photos"),
      //                       feature.requestId
      //                     )
      //                   }
      //                 />
      //               ))}
      //           </calcite-list-item-group>
      //         </calcite-list>
      //       </div>
      //       <calcite-button
      //         slot="footer"
      //         //   class="save"
      //         //   disabled={this.state.fpFeatures.length === 0}
      //       >
      //         {this.nls.save}{" "}
      //       </calcite-button>
      //     </calcite-panel>
      //   );
      // }
      if (this.state.showDeleteConfirmation) {
        deleteModal = (
          <calcite-dialog
            slot="dialogs"
            modal
            scale="s"
            width-scale="s"
            heading={this.nls.delete}
            width="s"
            kind="danger"
            open={this.state.showDeleteConfirmation}
            oncalciteDialogClose={() => {
              this._updateState({ showDeleteConfirmation: false });
            }}
            bind={this}
          >
            <div>
              {this.nls.deleteText.replace("{$number}", this.parcelList.length)}
            </div>
            <calcite-button
              slot="footer-end"
              kind="brand"
              appearance="outline"
              onclick={() => {
                this._updateState({ showDeleteConfirmation: false });
              }}
              bind={this}
            >
              {this.nls.cancel}
            </calcite-button>
            <calcite-button
              slot="footer-end"
              kind="danger"
              appearance="solid"
              onclick={() => {
                this._removeFeature(this.parcelList);
              }}
              bind={this}
            >
              {this.nls.deleteAll}
            </calcite-button>
          </calcite-dialog>
        );
      }
      if (this.parcelList.length) {
        parcelList = (
          <calcite-list
            class="parcel-list-container"
            scale="m"
            selection-appearance="border"
            selection-mode="none"
            filter-enabled={false}
            filter-placeholder={this.nls.search}
            oncalciteListChange={this._openParcelProperties}
            bind={this}
          >
            {this.parcelList.map((parcel: any) => {
              return (
                <calcite-list-item
                  value={parcel.attributes[parcel.layer.objectIdField]}
                  label={
                    "Parcel_" + parcel.attributes[parcel.layer.objectIdField]
                  }
                  key={
                    parcel.attributes[parcel.layer.objectIdField] + "_parcels"
                  }
                >
                  <calcite-action
                    slot="actions-end"
                    icon="x"
                    title={this.nls.remove}
                    onclick={() => {
                      this._updateParcelSelection(parcel);
                    }}
                  ></calcite-action>
                </calcite-list-item>
              );
            })}
          </calcite-list>
        );
      }
      if (this.state.selectParcels && !this.parcelList.length) {
        selectParcelInfo = (
          <calcite-notice open icon="information">
            <div slot="message">{this.nls.selectParcels}</div>
          </calcite-notice>
        );
      }
      if (this.state.confirmationDialog.comments) {
        confirmationDialog = (
          <calcite-dialog
            slot="dialogs"
            modal
            scale="s"
            width-scale="s"
            heading={this.nls.submit}
            width="s"
            kind="brand"
            open
            oncalciteDialogClose={() => {
              this._toggleConfirmationDialog("comments");
            }}
            bind={this}
          >
            <div>
              {this.state.save.comments
                ? this.nls.unsavedChanges
                : this.nls.submitCommentConfirmation}
            </div>
            <calcite-button
              slot="footer-end"
              kind="brand"
              appearance="outline"
              onclick={() => {
                this._toggleConfirmationDialog("comments");
              }}
              bind={this}
            >
              {this.nls.cancel}
            </calcite-button>
            <calcite-button
              slot="footer-end"
              kind="brand"
              appearance="solid"
              onclick={() => {
                this._submitComments();
              }}
              bind={this}
            >
              {this.nls.submit}
            </calcite-button>
          </calcite-dialog>
        );
      }
      if (this.state.confirmationDialog.review) {
        confirmationDialog = (
          <calcite-dialog
            slot="dialogs"
            modal
            scale="s"
            width-scale="s"
            heading={this.nls.submit}
            width="s"
            kind="brand"
            open
            oncalciteDialogClose={() => {
              this._toggleConfirmationDialog("review");
            }}
            bind={this}
          >
            <div>
              {this.state.save.parcels ||
              this.state.save.comments ||
              this.state.save.notes ||
              this.state.save.photos
                ? this.nls.unsavedChanges
                : this.nls.submitReviewConfirmation}
            </div>
            <calcite-button
              slot="footer-end"
              kind="brand"
              appearance="outline"
              onclick={() => {
                this._toggleConfirmationDialog("review");
              }}
              bind={this}
            >
              {this.nls.cancel}
            </calcite-button>
            <calcite-button
              slot="footer-end"
              kind="brand"
              appearance="solid"
              onclick={() => {
                this._submitForReview();
              }}
              bind={this}
            >
              {this.nls.submit}
            </calcite-button>
          </calcite-dialog>
        );
      }
      if (this.state.confirmationDialog.declare) {
        confirmationDialog = (
          <calcite-dialog
            slot="dialogs"
            modal
            scale="s"
            width-scale="s"
            heading={this.nls.submit}
            width="s"
            kind="brand"
            open
            oncalciteDialogClose={() => {
              this._toggleConfirmationDialog("declare");
            }}
            bind={this}
          >
            <div>
              {this.state.save.parcels ||
              this.state.save.comments ||
              this.state.save.notes ||
              this.state.save.photos
                ? this.nls.unsavedChanges
                : this.nls.submitDeclareConfirmation}
            </div>
            <calcite-button
              slot="footer-end"
              kind="brand"
              appearance="outline"
              onclick={() => {
                this._toggleConfirmationDialog("declare");
              }}
              bind={this}
            >
              {this.nls.cancel}
            </calcite-button>
            <calcite-button
              slot="footer-end"
              kind="brand"
              appearance="solid"
              onclick={() => {
                this._submitAsDeclaration();
              }}
              bind={this}
            >
              {this.nls.submit}
            </calcite-button>
          </calcite-dialog>
        );
      }
      parcelBoundaryActions = (
        <calcite-action-group
          class="parcel-action-pad action-group-2"
          layout="horizontal"
        >
          <calcite-action
            scale="m"
            disabled={
              !this.parcelList.length ||
              (!this.state.selectParcels && !this.state.editBoundaryTool)
            }
            class="width-2"
            active={this.state.editBoundaryTool === "reshape"}
            alignment="center"
            title={this.nls.reshape}
            icon="reshape-tool"
            onclick={({ target }: any) => {
              this._toggleEditBoundaryTool("reshape", target);
            }}
            bind={this}
          ></calcite-action>
          <calcite-action
            scale="m"
            disabled={
              !this.parcelList.length ||
              (!this.state.selectParcels && !this.state.editBoundaryTool)
            }
            class="width-2"
            active={this.state.editBoundaryTool === "split"}
            alignment="center"
            title={this.nls.split}
            icon="split-features"
            onclick={({ target }: any) => {
              this._toggleEditBoundaryTool("split", target);
            }}
            bind={this}
          ></calcite-action>
          <calcite-action
            scale="m"
            disabled={!this.state.parcelEdit.undo}
            class="width-2"
            alignment="center"
            title={this.nls.undo}
            icon="undo"
            onclick={this._undoEdits}
            bind={this}
          ></calcite-action>
          <calcite-action
            scale="m"
            disabled={!this.state.parcelEdit.redo}
            class="width-2"
            alignment="center"
            title={this.nls.redo}
            icon="redo"
            onclick={this._redoEdits}
            bind={this}
          ></calcite-action>
          <calcite-action
            scale="m"
            disabled={
              !this.parcelList.length ||
              (!this.state.selectParcels && !this.state.editBoundaryTool)
            }
            class="width-2"
            alignment="center"
            title={this.nls.clearSelection}
            icon="clear-selection"
            onclick={this._removeParcelSelection}
            bind={this}
          ></calcite-action>
          <calcite-action
            scale="m"
            disabled={
              !this.parcelList.length ||
              (!this.state.selectParcels && !this.state.editBoundaryTool)
            }
            class="width-2"
            alignment="center"
            title={this.nls.deleteAll}
            icon="trash"
            onclick={() => {
              this._updateState({ showDeleteConfirmation: true });
            }}
            bind={this}
          ></calcite-action>
        </calcite-action-group>
      );
      if (this.options.webmap) {
        if (!this.view?.ready && !error) {
          loadingScrim = (
            <calcite-scrim>
              <calcite-loader
                scale="l"
                text={this.nls.loading + "..."}
              ></calcite-loader>
            </calcite-scrim>
          );
        }
        mainTemplate = (
          <calcite-shell content-behind>
            <div slot="header" class="ape-header">
              <div class="align-horizontal">
                <h2 class="ape-header-title">{this.state.title}</h2>
                <div class="header-lineBreak"></div>
                <calcite-avatar
                  scale="m"
                  id="user-thumbnail"
                  full-name={this.user?.username}
                  thumbnail={this.user.getThumbnailUrl(150)}
                ></calcite-avatar>
              </div>
            </div>
            <calcite-shell-panel
              class="start-panel"
              slot="panel-start"
              height-scale="l"
              position="start"
              width-scale="m"
              collapsed
            >
              <calcite-action-bar slot="action-bar" id="widget-bar">
                <calcite-action
                  active={this.state.referenceParcelsToggle}
                  data-action-id="referenceParcels"
                  text={this.nls.referenceParcels}
                  scale="m"
                  title={this.nls.referenceParcels}
                  icon="parcel-layer"
                  onclick={this._referenceParcelsToggle}
                  bind={this}
                ></calcite-action>
                <calcite-action
                  active={this.state.agriculturalParcelsOutlineToggle}
                  data-action-id="parcelsOutline"
                  text={this.nls.agriculturalParcelsOutline}
                  scale="m"
                  title={this.nls.agriculturalParcelsOutline}
                  icon="polygon"
                  onclick={this._agriculturalParcelsOutlineToggle}
                  bind={this}
                ></calcite-action>
                <calcite-action
                  active={this.state.agriculturalParcelsFillToggle}
                  data-action-id="parcelsFill"
                  text={this.nls.agriculturalParcelsFill}
                  scale="m"
                  title={this.nls.agriculturalParcelsFill}
                  icon="polygon-area"
                  onclick={this._agriculturalParcelsFillToggle}
                  bind={this}
                ></calcite-action>
                <calcite-action
                  active={this.state.agriculturalZonesToggle}
                  data-action-id="agriculturalZones"
                  text={this.nls.agriculturalZones}
                  scale="m"
                  title={this.nls.agriculturalZones}
                  icon="number-of-territories"
                  onclick={this._agriculturalZonesToggle}
                  bind={this}
                ></calcite-action>
                {requestsAction}
                {notesAction}
                {requiredPhotosAction}
                {farmerPhotosAction}
                {baseImageAction}
                {basemapActions}
              </calcite-action-bar>
            </calcite-shell-panel>
            <calcite-shell-panel
              class="end-panel"
              slot="panel-end"
              height-scale="l"
              position="end"
              width-scale="m"
              collapsed={!rightTool}
              resizable="true"
            >
              <calcite-action-bar slot="action-bar">
                {addRequestAction}
                <calcite-action
                  disabled={this.state.declare}
                  active={this.state.rightTool === "parcels"}
                  text={this.nls.parcels}
                  scale="m"
                  title={this.nls.parcels}
                  icon="freehand-area"
                  onclick={({ target }: any) => {
                    this._toggleRightTool(target, "parcels");
                  }}
                  bind={this}
                ></calcite-action>
                {addNoteAction}
                {addImageAction}
                <calcite-action
                  active={this.state.rightTool === "measure"}
                  data-action-id="measure"
                  text={this.nls.measure}
                  scale="m"
                  title={this.nls.measure}
                  icon="measure"
                  onclick={({ target }: any) => {
                    this._toggleRightTool(target, "measure");
                  }}
                  bind={this}
                ></calcite-action>
                <calcite-action
                  disabled={this.state.declare}
                  active={this.state.rightTool === "submit"}
                  text={this.nls.submit}
                  scale="m"
                  title={this.nls.submit}
                  icon="submit"
                  onclick={({ target }: any) => {
                    this._toggleRightTool(target, "submit");
                  }}
                  bind={this}
                ></calcite-action>
              </calcite-action-bar>
              <calcite-panel
                class="panel-height"
                heading={this.nls.parcels}
                height-scale="l"
                closable
                data-panel-id="parcels"
                closed={rightTool !== "parcels"}
                hidden={rightTool !== "parcels"}
                oncalcitePanelClose={() => {
                  this._closeRightTool("parcels");
                }}
                bind={this}
              >
                <div id="parcels-container" class="margin-panel">
                  <calcite-button
                    icon-start="plus"
                    appearance="solid"
                    class="btn-display-flex"
                    kind="brand"
                    onclick={this._addParcel}
                    bind={this}
                  >
                    {this.nls.newParcel}
                  </calcite-button>
                  {parcelBoundaryActions}
                  {selectParcelInfo}
                  {parcelList}
                </div>
                <calcite-button
                  slot="footer"
                  disabled={!this.state.save.parcels}
                  appearance="solid"
                  kind="brand"
                  onclick={({ target }: any) => {
                    this._saveFile("farmer-parcels", target);
                  }}
                  bind={this}
                >
                  {this.nls.save}
                </calcite-button>
              </calcite-panel>
              {addRequestContainer}
              {addNoteContainer}
              {addImageContainer}
              <calcite-panel
                class="panel-height"
                heading={this.nls.measure}
                height-scale="l"
                closable="true"
                data-panel-id="measure"
                closed={rightTool !== "measure"}
                hidden={rightTool !== "measure"}
                oncalcitePanelClose={() => {
                  this._closeRightTool("measure");
                }}
                bind={this}
              >
                <div class="margin-panel">
                  <calcite-action-group
                    class="action-group-2"
                    layout="horizontal"
                  >
                    <calcite-action
                      alignment="center"
                      active={this.state.currentMeasurementTool === "distance"}
                      class="width-2"
                      data-action-id="direct-line"
                      scale="s"
                      text={this.nls.distance}
                      text-enabled="true"
                      icon="measure-line"
                      onclick={() => {
                        this._handleMeasurementClick("distance");
                      }}
                      bind={this}
                    ></calcite-action>
                    <calcite-action
                      alignment="center"
                      active={this.state.currentMeasurementTool === "area"}
                      class="width-2"
                      data-action-id="area"
                      scale="s"
                      text={this.nls.area}
                      text-enabled="true"
                      icon="measure-area"
                      onclick={() => {
                        this._handleMeasurementClick("area");
                      }}
                      bind={this}
                    ></calcite-action>
                  </calcite-action-group>
                  <div id="measure-container"></div>
                </div>
              </calcite-panel>
              <calcite-panel
                class="panel-height"
                heading={this.nls.submit}
                height-scale="l"
                closable
                data-panel-id="submit"
                closed={rightTool !== "submit"}
                hidden={rightTool !== "submit"}
                oncalcitePanelClose={() => {
                  this._closeRightTool("submit");
                }}
                bind={this}
              >
                <div id="submit-container" class="margin-panel">
                  <calcite-button
                    appearance="solid"
                    class="btn-display-flex"
                    kind="brand"
                    onclick={() => {
                      this._toggleConfirmationDialog("comments");
                    }}
                    bind={this}
                  >
                    {this.nls.submitComments}
                  </calcite-button>
                  <calcite-button
                    appearance="solid"
                    class="btn-display-flex"
                    kind="brand"
                    onclick={() => {
                      this._toggleConfirmationDialog("review");
                    }}
                    bind={this}
                  >
                    {this.nls.submitReview}
                  </calcite-button>
                  <calcite-button
                    appearance="solid"
                    class="btn-display-flex"
                    kind="brand"
                    onclick={() => {
                      this._toggleConfirmationDialog("declare");
                    }}
                    bind={this}
                  >
                    {this.nls.submitDeclare}
                  </calcite-button>
                </div>
              </calcite-panel>
            </calcite-shell-panel>
            <div class="shell-content">
              <div class="map" afterCreate={this._createMap} bind={this}>
                <div
                  class="parcel-transparency-slider"
                  hidden={!this.state.agriculturalParcelsFillToggle}
                >
                  <calcite-label>
                    {this.nls.fillOpacity}
                    <calcite-slider
                      class="slider-1"
                      value="100"
                      label-ticks="true"
                      max-label="100"
                      min-label="0"
                      ticks="100"
                      step="1"
                      oncalciteSliderChange={this._updateFillOpacity}
                      bind={this}
                    ></calcite-slider>
                  </calcite-label>
                </div>
              </div>
            </div>
            {errorAlert}
            {notificationAlert}
            {deleteModal}
            {confirmationDialog}
          </calcite-shell>
        );
      } else {
        mainTemplate = (
          <calcite-shell content-behind>
            <calcite-alert
              slot="alerts"
              open="true"
              kind="danger"
              scale="m"
              placement="bottom"
            >
              <div slot="title">{this.nls.error}</div>
              <div slot="message">{this.nls.noWebmapURLParameter}</div>
            </calcite-alert>
          </calcite-shell>
        );
      }
    } else if (!this.state.farmerID) {
      mainTemplate = (
        <calcite-shell content-behind>
          <calcite-alert
            slot="alerts"
            open="true"
            kind="danger"
            scale="m"
            placement="bottom"
          >
            <div slot="title">{this.nls.error}</div>
            <div slot="message">{this.nls.farmerIdError}</div>
          </calcite-alert>
        </calcite-shell>
      );
    }
    // --Himanshu-start--
    let captureImageTemplate = (
      <div
        id="capture-image"
        afterCreate={this.loadCaptureImage}
        bind={this}
      ></div>
    );
    content = (
      <div>
        {!this.state.cameraActive ? mainTemplate : captureImageTemplate}
        {loadingScrim}
        {userPopup}
      </div>
    );
    // --Himanshu-end--
    return content;
  }
  //-------------------------------------------------------------------
  //
  //  Private methods
  //
  //-------------------------------------------------------------------

  // --Himanshu-start--

  private loadCaptureImage = () => {
    const captureImage = new CaptureImage({
      setCameraActive: (val: boolean) =>
        this._updateState({ cameraActive: val }),
      view: this.view,
      layer: this._getLayer("farmer-photos"),
      setFpFeatures: (val: any) => this._updateState({ fpFeatures: val }),
      fpFeatures: this.state.fpFeatures,
      formTemplate: this._getFormTemplate("farmer-photos"),
      nls: this.nls,
      currFeature: this.currFeature,
      save: this.state.save,
      setSave: (val: any) => this._updateState({ save: val }),
    });
    captureImage.container = document.getElementById("capture-image");
  };
  private getBase64ImageSrc(imageString: string, defaultType = "jpeg"): string {
    const prefixPattern = /^data:image\/[a-zA-Z]+;base64,/;
    if (prefixPattern.test(imageString)) {
      return imageString;
    } else {
      return `data:image/${defaultType};base64,${imageString}`;
    }
  }

  private _handleListChange = (e: any) => {
    if (e.currentTarget?.selectedItems?.[0]?.value) {
      const value = e.currentTarget.selectedItems?.[0].value;
      const [type, requestId] = value.split("-");

      const layer =
        type === "required"
          ? this._getLayer("required-photos")
          : this._getLayer("farmer-photos");

      this.openPopupForFeature(layer, requestId, e);
    } else this._removeEditor(false);
  };

  private openPopupForFeature = async (
    layer: any,
    requestId: string,
    e: any
  ) => {
    const result = await layer.queryFeatures({
      where: `requestId = '${requestId.replace(/'/g, "''")}'`,
      returnGeometry: true,
      outFields: ["*"],
    });
    if (result.features.length) {
      const feature = result.features[0];

      await this.view.goTo(feature.geometry);
      const element = document.createElement("div");
      layer.editingEnabled = true;
      if (layer === this._getLayer("farmer-photos")) {
        this._removeEditor(false);
        this.currentEditor = this._editFeatureWidget(feature, layer);
        setTimeout(() => {
          const flow =
            this.currentEditor.container.querySelector("calcite-flow");
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

            setLocationBtn.setAttribute(
              "appearance",
              this.state.modifyLocation ? "solid" : "outline-fill"
            );
            setDirectionBtn.setAttribute(
              "appearance",
              !this.state.setDirection ? "outline-fill" : "solid"
            );

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
          } else {
            console.warn("form-template not found inside second flow-item");
          }
        }, 300);
        this.layerEditHandler = layer.on("edits", (result: any) => {
          if (result.edits.deleteFeatures.length > 0) {
            this._updateState({
              fpFeatures: this.state.fpFeatures.filter(
                (item: any) =>
                  item[layer.objectIdField] !==
                  result.edits.deleteFeatures[0].objectId
              ),
            });
          }
          if (result.edits.updateFeatures.length > 0) {
            this.handleUpdate(
              result.updatedFeatures[0].objectId,
              layer,
              feature.attributes.cameraHeading
            );
          }
          this._updateState({ save: { ...this.state.save, photos: true } });
        });
      } else {
        this._removeEditor(false);

        this.currentEditor = this._getFeatureWidget(feature);
        let container = this.currentEditor.container;
        const img = document.createElement("img");

        img.src = this.getBase64ImageSrc(feature.attributes.image);

        img.style.width = "270px";
        img.style.marginBottom = "30px";
        this.currentEditor.when().then(() => {
          if (container.children.length >= 1) {
            container.insertBefore(
              img,
              container.children[container.children.length - 1]
            );
          } else {
            container.appendChild(img);
          }
        });
      }
    }
  };
  private handleUpdate = (id: number, layer: any, initialAngle: number) => {
    if (this.locationClick) {
      this.locationClick.remove();
      this.locationClick = null;
    }
    if (this.directionClick) {
      this.directionClick.remove();
      this.directionClick = null;
    }
    const newGraphic = new Graphic({
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
      .then(async () => {
        this.view.graphics.removeAll();
        this.view.container.style.cursor = "auto";
        this._updateState({ modifyLocation: false });
        this._updateState({ setDirection: false });
      })
      .catch((error: any) => {
        console.error("Error updating feature:", error);
      });
  };
  private handleModifyLocation = (feature: any) => {
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
      this._updateState({ modifyLocation: false, setDirection: false });
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
      target: feature.geometry,
      zoom: 18,
    });

    const circleGeometry = new Circle({
      center: feature.geometry,
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

    this._updateState({ modifyLocation: true, setDirection: false });
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
        const graphics = this.view.graphics.filter(
          (graphic: any) =>
            graphic.symbol.type === "simple-fill" ||
            graphic.symbol.type === "simple-marker"
        );
        this.view.graphics.removeMany(graphics);
        this.view.graphics.add(circleGraphic);
        this.view.graphics.add(newGraphic);
        this._updateState({
          imageData: { ...this.state.imageData, location: event.mapPoint },
        });
      } else {
        const dialog = document.createElement(
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

  private handleSetDirection = (feature: any) => {
    const wasActive = this.state.setDirection;

    if (wasActive && this.directionClick) {
      this.directionClick.remove();
      this.directionClick = null;
      const graphic = this.view.graphics.find(
        (graphic: any) => graphic.symbol.type === "picture-marker"
      );
      this.view.graphics.remove(graphic);
      this.view.container.style.cursor = "auto";
      this._updateState({ setDirection: false, modifyLocation: false });
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
      target: feature.geometry,
      zoom: 18,
    });

    this._updateState({ setDirection: true, modifyLocation: false });
    this.updateButtonStyles();

    this.directionClick = this.view.on("click", (event: any) => {
      event.stopPropagation();
      const refPoint = feature.geometry;
      const clickPoint = event.mapPoint;
      const x1 = refPoint.x,
        y1 = refPoint.y;
      const x2 = clickPoint.longitude,
        y2 = clickPoint.latitude;

      const angle = this.getAngle(y1, x1, y2, x2);
      console.log("Angle:", angle);

      const newGraphic = new Graphic({
        geometry: feature.geometry,
        symbol: new PictureMarkerSymbol({
          url: "app/images/direction.svg",
          width: "140px",
          height: "140px",
          angle,
        }),
      });

      const graphic = this.view.graphics.find(
        (graphic: any) => graphic.symbol.type === "picture-marker"
      );
      this.view.graphics.remove(graphic);
      this.view.graphics.add(newGraphic);
      this._updateState({
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
// --Himanshu-end--

  private async _createMap() {
    if (!this.view) {
      let map: any, error;
      let mapItem: any = this.options.webmap;
      if (mapItem) {
        let portalItem = new PortalItem({
          id: mapItem,
          portal: this.portal,
        });
        await portalItem
          .load()
          .then((item) => {
            map = new WebMap({ portalItem: portalItem });
          })
          .catch((e) => {
            error = this.nls.invalidWebmap + " " + e.message;
          });
        if (map) {
          await map
            .loadAll()
            .then(() => {
              error = this._checkRequiredLayers(map);
            })
            .catch(async (e: any) => {
              error = e.message;
              map = null;
            });
        }
      } else {
        error = this.nls.noWebmap;
      }

      if (error) this._updateState({ error: error });
      else {
        let properties: any = {
          map: map,
          container: document.querySelector(".map"),
        };

        this.view = new MapView(properties);
        await this.view.when();

        this.view.watch("fatalError", (error: any) => {
          if (error) {
            this.view.tryFatalErrorRecovery();
          }
        });
        this.view.popupEnabled = false;
        this._loadMapWidgets();
        this._checkOtherLayers();
        this._agriculturalParcelsOutlineToggle();
        await this._getLatestGeoJSONFromPortal();
        this._selectParcels(this.state.selectParcels);
      }
    }
    if (!this.state.cameraActive && this.view)
      this.view.container = document.querySelector(".map");
  }
  private _checkRequiredLayers(map: Map) {
    let error: string = "";
    let requiredLayers =
      this.options.layerInfo.filter((l: any) => {
        return l.required;
      }) || [];
    for (let a = 0; a < requiredLayers.length; a++) {
      let layer: any = map.layers.find((l: any) => {
        return l.title?.startsWith(requiredLayers[a].code + "_");
      });
      if (!layer) {
        error =
          this.nls[requiredLayers[a].title.split("nls.")[1]] +
          " " +
          this.nls.requiredLayerMissing;
        break;
      } else {
        layer.visible = false;
        if (requiredLayers[a].type === "farmer-parcels")
          layer.editingEnabled = true;
      }
    }
    return error;
  }
  private _checkOtherLayers() {
    let map: Map = this.view.map,
      biCode = this.options.layerInfo.find((l: any) => {
        return l.type === "base-image";
      }),
      ccLayer = this._getLayer("catch-crop"),
      otherLayers =
        this.options.layerInfo.filter((l: any) => {
          return !l.required;
        }) || [],
      currentBaseImage: string = "";
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
    otherLayers.forEach((info: any) => {
      let l = this._getLayer(info.type);
      if (l) {
        l.visible = false;
        if (info.type === "farmer-notes" || info.type === "farmer-comments")
          l.editingEnabled = true;
      }
    });
    this._updateState({ currentBaseImage: currentBaseImage });
  }
  private async _getLatestGeoJSONFromPortal() {
    let iacsGroupItemID: any;
    this.farmerGroup = iacsGroupItemID = await this._getIACSGroupOnPortal();
    if (iacsGroupItemID) {
      let param: any = {
          query: `type: "GeoJson"`,
          sortField: "created",
          sortOrder: "desc",
          start: 1,
          num: 1000,
        },
        groupItems: any[] = await this._queryGroup(iacsGroupItemID, param);
      this._replaceLayers(groupItems);
    }
  }
  private async _getIACSGroupOnPortal() {
    let param: any = {
      query: `title: "IACS_GAA" AND tags: "` + this.state.farmerID + `"`,
      sortField: "created",
      sortOrder: "desc",
      start: 1,
      num: 10,
      searchUserAccess: "groupMember",
    };
    let items: any[] = await this._queryPortalGroups(this.portal, param, []);
    return items[0]?.id;
  }
  private _replaceLayers(items: any[]) {
    this.options.layerInfo.forEach((info: any) => {
      if (info.type !== "catch-crop" && info.type !== "base-image") {
        let layer: any = this._getLayer(info.type);
        let geojsonItem = items.find((itemInfo: any) => {
          return itemInfo.title?.startsWith(info.code + "_");
        });
        if (geojsonItem && layer) {
          let geojsonLayer = new GeoJSONLayer({
            portalItem: {
              id: geojsonItem.id,
            },
            renderer: layer.renderer,
            popupTemplate: layer.popupTemplate,
            visible: layer.visible,
            editingEnabled: layer.editingEnabled,
          });
          geojsonLayer.load().then(() => {
            let index = this.view.map.allLayers.findIndex((l: any) => {
              return l.id === layer.id;
            });
            if (info.type === "farmer-parcels") {
              geojsonLayer.fields.forEach((field: any) => {
                if (field.name.toLowerCase() === "changedate") {
                  field.type = "date-only";
                }
                if (
                  field.name.toLowerCase() === info.mainCropField?.toLowerCase()
                ) {
                  let domain: any = {
                    type: "coded-value",
                    codedValues: [],
                  };
                  layer.renderer?.uniqueValueInfos?.forEach(
                    (uniqueValue: any) => {
                      if (uniqueValue.value !== "<Null>") {
                        domain.codedValues.push({
                          name: uniqueValue.label,
                          code: uniqueValue.value,
                        });
                      }
                    }
                  );
                  field.domain = domain;
                }
                if (
                  field.name.toLowerCase() ===
                  info.catchCropField?.toLowerCase()
                ) {
                  let domain: any = {
                    type: "coded-value",
                    codedValues: [],
                  };
                  this.options.catchCropRenderer?.uniqueValueInfos?.forEach(
                    (uniqueValue: any) => {
                      if (uniqueValue.value !== "<Null>") {
                        domain.codedValues.push({
                          name: uniqueValue.label,
                          code: uniqueValue.value,
                        });
                      }
                    }
                  );
                  field.domain = domain;
                }
              });
            }
            this.view.map.add(geojsonLayer, index);
            this.view.map.remove(layer);
          });
        } else {
          if (info.type === "farmer-parcels") {
            layer.fields.forEach((field: any) => {
              if (field.name.toLowerCase() === "changedate") {
                field.type = "date-only";
              } else if (
                field.name.toLowerCase() === info.mainCropField?.toLowerCase()
              ) {
                let domain: any = {
                  type: "coded-value",
                  codedValues: [],
                };
                layer.renderer?.uniqueValueInfos?.forEach(
                  (uniqueValue: any) => {
                    if (uniqueValue.value !== "<Null>") {
                      domain.codedValues.push({
                        name: uniqueValue.label,
                        code: uniqueValue.value,
                      });
                    }
                  }
                );
                field.domain = domain;
              } else if (
                field.name.toLowerCase() === info.catchCropField?.toLowerCase()
              ) {
                let domain: any = {
                  type: "coded-value",
                  codedValues: [],
                };
                this.options.catchCropRenderer?.uniqueValueInfos?.forEach(
                  (uniqueValue: any) => {
                    if (uniqueValue.value !== "<Null>") {
                      domain.codedValues.push({
                        name: uniqueValue.label,
                        code: uniqueValue.value,
                      });
                    }
                  }
                );
                field.domain = domain;
              }
            });
          }
        }
      }
    });
  }
  private _selectParcels(toggle: boolean) {
    if (toggle) {
      this.parcelClickHandler?.remove();
      this.parcelClickHandler = this.view.on("click", (evt: any) => {
        let parcelLayer: any = this._getLayer("farmer-parcels");
        let otherLayer: any = this._getLayer("other-parcels");
        let parcelLayerView: any = this.view.allLayerViews.find((lv: any) => {
          return lv.layer.id === parcelLayer.id;
        });
        this.view
          .hitTest(evt, { include: [parcelLayer, otherLayer] })
          .then((response: any) => {
            if (response?.results?.length) {
              response.results.forEach((graphic: any) => {
                if (graphic.layer?.id === parcelLayer.id) {
                  let parcelIndex = this.parcelList.findIndex((parcel: any) => {
                    return (
                      parcel.attributes[parcelLayer.objectIdField] ===
                      graphic.graphic.attributes[parcelLayer.objectIdField]
                    );
                  });
                  if (parcelIndex !== -1) {
                    this.parcelList.splice(parcelIndex, 1);
                  } else {
                    this.parcelList.push(graphic.graphic);
                  }
                  this.parcelViewHighlightHandler?.remove();
                  this.parcelViewHighlightHandler = parcelLayerView.highlight(
                    this.parcelList
                  );
                  this._updateState({ updateList: !this.state.updateList });
                } else {
                  this._updateState({
                    notification: this.nls.parcelSelectionNotAllowed,
                  });
                }
              });
            }
          });
      });
    } else {
      this.parcelClickHandler?.remove();
    }
    this._updateState({ selectParcels: toggle });
  }
  private _updateParcelSelection(parcel: any) {
    let parcelLayer: any = this._getLayer("farmer-parcels");
    let parcelLayerView: any = this.view.allLayerViews.find((lv: any) => {
      return lv.layer.id === parcelLayer.id;
    });
    let parcelIndex = this.parcelList.findIndex((p: any) => {
      return (
        p.attributes[parcelLayer.objectIdField] ===
        parcel.attributes[parcelLayer.objectIdField]
      );
    });
    if (parcelIndex !== -1) {
      this.parcelList.splice(parcelIndex, 1);
      this.parcelViewHighlightHandler?.remove();
      this.parcelViewHighlightHandler = parcelLayerView.highlight(
        this.parcelList
      );
    }
    if (!this.parcelList.length) {
      this._removeParcelSelection();
    }
  }
  private _removeParcelSelection() {
    this.parcelViewHighlightHandler?.remove();
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
  private _toggleEditBoundaryTool(tool: string, target: any) {
    if (!target.active) {
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
          polyline: true,
          polygon: false,
          rectangle: false,
          circle: false,
        },
      };
      this._removeEditor(false);
      let graphicsLayer = new GraphicsLayer({
        id: "custom-graphicsLayer",
        elevationInfo: {
          mode: "on-the-ground",
        },
        listMode: "hide",
      });
      this.sketchTool = new Sketch({
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
      this.sketchTool.on("create", async (evt: any) => {
        if (evt.state === "start") {
        } else if (evt.state === "complete") {
          if (!geodeticAreaOperator.isLoaded())
            await geodeticAreaOperator.load();
          if (this.state.editBoundaryTool === "reshape") {
            let polylineExtent = Polygon.fromExtent(
              evt.graphic.geometry.extent
            );
            let nearByFields = await this._getNearByFields(
              this.parcelList.concat([{ geometry: polylineExtent }])
            );
            let reshapeFlag: boolean = false;
            let azLayer: any = this._getLayer("agricultural-zones");
            let azAreas = nearByFields.filter((field: any) => {
              return field.layer?.id === azLayer.id;
            });
            let azIntersect: boolean = false;
            azAreas.forEach((az) => {
              if (geometryEngine.intersects(evt.graphic.geometry, az.geometry))
                azIntersect = true;
            });
            this.trackChanges.undo = { updateFeatures: [] };
            this.parcelList.forEach((selectedField) => {
              this.trackChanges.undo.updateFeatures.push(selectedField.clone());
              let reshapePolygon = reshapeOperator.execute(
                selectedField.geometry,
                evt.graphic.geometry
              );
              if (reshapePolygon) {
                reshapePolygon = this._clipPolygon(
                  reshapePolygon,
                  nearByFields
                );
                if (reshapePolygon) {
                  reshapeFlag = true;
                  selectedField.geometry = reshapePolygon;
                  let declaredAreaField = this._getFieldFromLayer(
                    selectedField.layer,
                    "declaredarea"
                  );
                  selectedField.attributes[declaredAreaField] =
                    selectedField.geometry.spatialReference.isWebMercator ||
                    selectedField.geometry.spatialReference.isWGS84
                      ? geodeticAreaOperator.execute(selectedField.geometry, {
                          unit: "hectares",
                        })
                      : areaOperator.execute(selectedField.geometry, {
                          unit: "hectares",
                        });
                  if (selectedField.attributes[declaredAreaField])
                    selectedField.attributes[declaredAreaField] = Number(
                      selectedField.attributes[declaredAreaField].toFixed(2)
                    );
                }
              }
            });
            if (!reshapeFlag)
              this._updateState({ notification: this.nls.reshapeNoResult });
            else if (azIntersect)
              this._updateState({
                notification: this.nls.agriculturalZoneClip,
              });
            await this.parcelList[0].layer
              .applyEdits({ updateFeatures: this.parcelList })
              .then(() => {
                let changes: any[] = [];
                this.parcelList.forEach((pl: any) => {
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
              .catch((e: any) => {
                this._updateState({ error: e.message });
              });
            this.sketchTool.destroy();
            this.sketchTool = null;
          } else if (this.state.editBoundaryTool === "split") {
            let newFields: any[] = [];
            let splitFlag: boolean = false;
            this.trackChanges.undo = { updateFeatures: [] };
            this.parcelList.forEach((selectedField) => {
              this.trackChanges.undo.updateFeatures.push(selectedField.clone());
              let splitPolygons = cutOperator.execute(
                selectedField.geometry,
                evt.graphic.geometry
              );
              let newPolygons: any[] = [];
              if (splitPolygons?.length) {
                splitFlag = true;
                splitPolygons?.forEach((g: any) => {
                  g.rings.forEach((r: any) => {
                    let poly = new Polygon({
                      rings: [r],
                      spatialReference: g.spatialReference,
                    });
                    newPolygons.push({
                      geometry: poly,
                      area:
                        poly.spatialReference.isWebMercator ||
                        poly.spatialReference.isWGS84
                          ? geodeticAreaOperator.execute(poly, {
                              unit: "hectares",
                            })
                          : areaOperator.execute(poly, { unit: "hectares" }),
                    });
                  });
                });
                newPolygons.sort((a, b) => {
                  return b.area - a.area;
                });
                let declaredAreaField = this._getFieldFromLayer(
                  selectedField.layer,
                  "declaredarea"
                );
                let idField = this._getFieldFromLayer(
                  selectedField.layer,
                  "id"
                );
                selectedField.attributes[declaredAreaField] = Number(
                  newPolygons[0].area.toFixed(2)
                );
                selectedField.geometry = newPolygons[0].geometry;
                let currentDate = new Date();
                let dateSuffix: any =
                  currentDate.getFullYear() +
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
                  let grap = new Graphic({
                    attributes: JSON.parse(
                      JSON.stringify(selectedField.attributes)
                    ),
                    geometry: newPolygons[a].geometry,
                  });
                  grap.attributes[declaredAreaField] = Number(
                    newPolygons[a].area.toFixed(2)
                  );
                  grap.attributes[idField] = "NFP_" + (dateSuffix + a - 1);
                  newFields.push(grap);
                }
              }
            });
            if (!splitFlag)
              this._updateState({ notification: this.nls.splitNoResult });
            await this.parcelList[0].layer
              .applyEdits({
                updateFeatures: this.parcelList,
                addFeatures: newFields,
              })
              .then((edits: any) => {
                if (edits.addFeatureResults?.length) {
                  this.trackChanges.undo.deleteFeatures =
                    edits.addFeatureResults;
                }
                let changes: any[] = [];
                this.parcelList.forEach((pl: any) => {
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
              .catch((e: any) => {
                this._updateState({ error: e.message });
              });
            this.sketchTool.destroy();
            this.sketchTool = null;
          }
        }
      });
      this.sketchTool.create("polyline", { mode: "click" });
      this._updateState({ editBoundaryTool: tool });
    } else {
      this._removeEditor(true);
      this._updateState({ editBoundaryTool: "" });
    }
  }
  private async _getNearByFields(parcels: any) {
    let selectedParcels: any[] = parcels.map((p: any) => {
        return p.geometry;
      }),
      mergeParcels = geometryEngine.union(selectedParcels),
      fpLayer = this._getLayer("farmer-parcels"),
      opLayer = this._getLayer("other-parcels"),
      azLayer = this._getLayer("agricultural-zones"),
      nearByParcels: any[] = [];
    if (mergeParcels) {
      await fpLayer
        .queryFeatures({
          geometry: mergeParcels,
          outFields: [this.parcelList[0]?.layer?.objectIdField || "OBJECTID"],
          returnGeometry: true,
        })
        .then((response: any) => {
          if (response?.features?.length) {
            response.features.forEach((feature: any) => {
              let exist = this.parcelList.find((p: any) => {
                return (
                  p.attributes[fpLayer.objectIdField] ===
                  feature.attributes[fpLayer.objectIdField]
                );
              });
              if (!exist) nearByParcels.push(feature);
            });
          }
        });
      await opLayer
        .queryFeatures({
          geometry: mergeParcels,
          returnGeometry: true,
        })
        .then((response: any) => {
          if (response?.features?.length) {
            response.features.forEach((feature: any) => {
              nearByParcels.push(feature);
            });
          }
        });
      let azAllowedField = this._getFieldFromLayer(azLayer, "az_allowed");
      await azLayer
        .queryFeatures({
          geometry: mergeParcels,
          where: azAllowedField + " = 0",
          returnGeometry: true,
        })
        .then((response: any) => {
          if (response?.features?.length) {
            response.features.forEach((feature: any) => {
              nearByParcels.push(feature);
            });
          }
        });
    }
    return nearByParcels;
  }
  private _addParcel({ target }: any) {
    target.disabled = true;
    let layer: any = this._getLayer("farmer-parcels");
    this._removeEditor(false);
    this.currentEditor = this._createFeatureWidget(layer, null, target);
    this.layerEditHandler?.remove();
    this.layerEditHandler = layer.on("edits", (result: any) => {
      this._removeEditor(true);
      target.disabled = false;
      let { save } = this.state;
      save.parcels = true;
      this._updateState({ save: save });
    });
    this.view.ui.add(this.currentEditor, "top-right");
  }
  private _openParcelProperties() {}
  private _addComment({ target }: any) {
    target.disabled = true;
    let layer: any = this._getLayer("farmer-comments"),
      initialFeature: any;
    this._removeEditor(false);
    this.currentEditor = this._createFeatureWidget(
      layer,
      initialFeature,
      target
    );
    this.layerEditHandler?.remove();
    this.layerEditHandler = layer.on("edits", (result: any) => {
      this._removeEditor(false);
      if (result?.edits?.addFeatures?.length) {
        layer
          .queryFeatures({
            returnGeometry: true,
            outFields: ["*"],
            objectIds: [result.addedFeatures[0].objectId],
          })
          .then((response: any) => {
            if (response?.features?.length) {
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
  private _addReply({ target }: any) {
    let arLayer: any = this._getLayer("agency-requests"),
      layer: any = this._getLayer("farmer-comments"),
      feature = this.agencyRequests.find((ar: any) => {
        return (
          ar.attributes[arLayer.objectIdField] ===
          Number(this.selectedListNode.value.split("_")[0])
        );
      }),
      attributes: any = {},
      initialFeature: any;
    attributes[this._getFieldFromLayer(layer, "name")] =
      feature.attributes[this._getFieldFromLayer(arLayer, "name")];
    initialFeature = new Graphic({
      attributes: attributes,
      geometry: feature.geometry,
      layer: layer,
    });
    this.view.ui.remove(this.featureWidget);
    this._removeEditor(false);
    this.currentEditor = this._createFeatureWidget(
      layer,
      initialFeature,
      target
    );
    this.layerEditHandler?.remove();
    this.layerEditHandler = layer.on("edits", (result: any) => {
      this._removeEditor(false);
      if (result?.edits?.addFeatures?.length) {
        layer
          .queryFeatures({
            returnGeometry: true,
            outFields: ["*"],
            objectIds: [result.addedFeatures[0].objectId],
          })
          .then((response: any) => {
            if (response?.features?.length) {
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
  private _selectRequestsComments(e: any) {
    if (e.currentTarget?.selectedItems?.[0]?.value) {
      let value: string = e.currentTarget.selectedItems[0].value,
        layer: any,
        feature: any;
      this.selectedListNode = e.currentTarget.selectedItems[0];
      if (value?.includes("_requests")) {
        (layer = this._getLayer("agency-requests")),
          (feature = this.agencyRequests.find((ar: any) => {
            return (
              ar.attributes[layer.objectIdField] === Number(value.split("_")[0])
            );
          }));
        this._removeEditor(false);
        this.featureWidget = this._getFeatureWidget(feature);
      } else {
        (layer = this._getLayer("farmer-comments")),
          (feature = this.farmerComments.find((fc: any) => {
            return (
              fc.attributes[layer.objectIdField] === Number(value.split("_")[0])
            );
          }));
        this._removeEditor(false);
        this.currentEditor = this._editFeatureWidget(feature, layer);
        this.layerEditHandler?.remove();
        this.layerEditHandler = layer.on("edits", (result: any) => {
          this._removeEditor(false);
          let index = this.farmerComments.findIndex((f: any) => {
            return (
              f.attributes[layer.objectIdField] ===
              feature.attributes[layer.objectIdField]
            );
          });
          if (result?.edits?.updateFeatures?.length) {
            this.farmerComments[index].geometry =
              result.edits.updateFeatures[0].geometry;
            this.farmerComments[index].attributes =
              result.edits.updateFeatures[0].attributes;
          } else if (result?.edits?.deleteFeatures?.length)
            this.farmerComments.splice(index, 1);
          let { save } = this.state;
          save.comments = true;
          this._updateState({ updateList: !this.state.updateList, save: save });
        });
      }
      this.view.goTo(feature);
    } else {
      this._removeEditor(false);
    }
  }
  private _addNewNote({ target }: any) {
    target.disabled = true;
    let layer: any = this._getLayer("farmer-notes");
    this._removeEditor(false);
    this.currentEditor = this._createFeatureWidget(layer, null, target);
    this.layerEditHandler?.remove();
    this.layerEditHandler = layer.on("edits", (result: any) => {
      this._removeEditor(false);
      target.disabled = false;
      if (result?.edits?.addFeatures?.length) {
        layer
          .queryFeatures({
            returnGeometry: true,
            outFields: ["*"],
            objectIds: [result.addedFeatures[0].objectId],
          })
          .then((response: any) => {
            if (response?.features?.length) {
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
  private _selectNotes(e: any) {
    if (e.currentTarget?.selectedItems?.[0]?.value) {
      let value: string = e.currentTarget.selectedItems[0].value,
        layer: any = this._getLayer("farmer-notes"),
        feature = this.farmerNotes.find((note: any) => {
          return note.attributes[layer.objectIdField] === Number(value);
        });
      //feature = new Graphic(feature)
      this.selectedListNode = e.currentTarget.selectedItems[0];
      this.view.goTo(feature);
      this.currentEditor && this.currentEditor.destroy();
      this.currentEditor = this._editFeatureWidget(feature, layer);
      this.layerEditHandler?.remove();
      this.layerEditHandler = layer.on("edits", (result: any) => {
        this._removeEditor(false);
        let index = this.farmerNotes.findIndex((f: any) => {
          return (
            f.attributes[layer.objectIdField] ===
            feature.attributes[layer.objectIdField]
          );
        });
        if (result?.edits?.updateFeatures?.length) {
          this.farmerNotes[index].attributes =
            result.edits.updateFeatures[0].attributes;
          this.farmerNotes[index].geometry =
            result.edits.updateFeatures[0].geometry;
        } else if (result?.edits?.deleteFeatures?.length)
          this.farmerNotes.splice(index, 1);
        let { save } = this.state;
        save.notes = true;
        this._updateState({ updateList: !this.state.updateList, save: save });
      });
    } else {
      this._removeEditor(false);
    }
  }
  private _createFeatureWidget(layer: any, feature: any, target: any) {
    let element: any = document.createElement("div"),
      fpLayer: any = this._getLayer("farmer-parcels"),
      fnLayer: any = this._getLayer("farmer-notes"),
      fcLayer: any = this._getLayer("farmer-comments"),
      tpLayer: any = this._getLayer("farmer-photos"),
      formTemplate: any,
      heading: string;
    if (fpLayer?.id === layer.id) {
      heading = this.nls.newParcel;
      formTemplate = this._getFormTemplate("farmer-parcels");
    } else if (layer.id === fnLayer?.id) {
      heading = this.nls.newNote;
      formTemplate = this._getFormTemplate("farmer-notes");
    } else if (layer.id === fcLayer?.id) {
      heading = this.nls.newComment;
      formTemplate = this._getFormTemplate("farmer-comments");
    } else if (layer.id === tpLayer?.id) {
      heading = this.nls.addPhoto;
      formTemplate = this._getFormTemplate("farmer-photos");
    }

    if (formTemplate) {
      formTemplate.elements.forEach((element: any) => {
        let fieldName: any = this._getFieldFromLayer(layer, element.fieldName);
        if (fieldName) element.fieldName = fieldName;
        if (element.label?.includes("nls."))
          element.label = this.nls[element.label.split("nls.")[1]];
        if (element.hint?.includes("nls."))
          element.hint = this.nls[element.hint.split("nls.")[1]];
      });
    }

    let editor: any = new CustomEditor({
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
      } else editor.create(feature, { updateGeometry: true });
    });
    editor.on("draw", async (graphic: any) => {
      let nearByFields = await this._getNearByFields([graphic]);
      let geometry = this._clipPolygon(graphic.geometry, nearByFields);
      if (!geometry) {
        editor.draw();
        this._updateState({ notification: this.nls.newParcelNoResult });
      } else {
        let attributes: any = {};
        let declaredAreaField = this._getFieldFromLayer(layer, "declaredarea");
        if (!geodeticAreaOperator.isLoaded()) await geodeticAreaOperator.load();
        attributes[declaredAreaField] =
          geometry.spatialReference.isWebMercator ||
          geometry.spatialReference.isWGS84
            ? geodeticAreaOperator.execute(geometry, { unit: "hectares" })
            : areaOperator.execute(geometry, { unit: "hectares" });
        if (attributes[declaredAreaField])
          attributes[declaredAreaField] = Number(
            attributes[declaredAreaField].toFixed(2)
          );
        let newGraphic = new Graphic({
          geometry: geometry,
          attributes: attributes,
        });
        editor.create(newGraphic);
      }
    });
    editor.on("destroy", () => {
      target.disabled = false;
      console.log("create is discarded.");
    });
    return editor;
  }

  private _editFeatureWidget(feature: any, layer: any) {

    
    let element: any = document.createElement("div"),
      fnLayer: any = this._getLayer("farmer-notes"),
      fcLayer: any = this._getLayer("farmer-comments"),
      apLayer: any = this._getLayer("required-photos"),
      tpLayer: any = this._getLayer("farmer-photos"),
      formTemplate: any,
      heading: string;
    if (layer.id === fnLayer?.id) {
      heading = this.nls.editNote;
      formTemplate = this._getFormTemplate("farmer-notes");
    } else if (layer.id === fcLayer?.id) {
      heading = this.nls.editComment;
      formTemplate = this._getFormTemplate("farmer-comments");
    } else if (layer.title === apLayer?.title) {
      heading = this.nls.editPhoto;
      // --Himanshu-start--
      formTemplate = this._getFormTemplate("required-photos");
    } else if (layer.title === tpLayer?.title) {
      heading = this.nls.editPhoto;
      formTemplate = this._getFormTemplate("farmer-photos");
    }
    if (formTemplate) {
      formTemplate.elements.forEach((element: any) => {
        let fieldName: any = this._getFieldFromLayer(layer, element.fieldName);
        if (fieldName) element.fieldName = fieldName;
        if (element.label?.includes("nls."))
          element.label = this.nls[element.label.split("nls.")[1]];
        if (element.hint?.includes("nls."))
          element.hint = this.nls[element.hint.split("nls.")[1]];
        if (element.text?.includes("nls.")) {
          let text = this.nls[element.text.split("nls.")[1]];
          text = text.replace(
            "[startdate]",
            new Date(feature.attributes.startdate).toLocaleDateString("en-GB")
          );
          text = text.replace(
            "[enddate]",
            new Date(feature.attributes.enddate).toLocaleDateString("en-GB")
          );
          element.text = text;
        }
      });
    }
    let editor: any = new CustomEditor({
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
    // --Himanshu-end--
    return editor;
  }
  private _getFeatureWidget(feature: any) {
    let featureWidget: any,
      replyBtn = document.createElement("calcite-button");
    replyBtn.innerHTML = this.nls.reply;
    replyBtn.setAttribute("width", "full");
    // --Himanshu-start--
    replyBtn.addEventListener(
      "click",
      feature.layer.id !== this._getLayer("required-photos").id
        ? this._addReply.bind(this)
        : () => {
            this.currFeature = feature;
            this._removeEditor(false);
            this._updateState({ cameraActive: true });
          }
    );

    const formTemplate = this._getFormTemplate("required-photos");
    if (formTemplate) {
      formTemplate.elements.forEach((element: any) => {
        let fieldName: any = this._getFieldFromLayer(
          this._getLayer("required-photos"),
          element.fieldName
        );
        if (fieldName) element.fieldName = fieldName;
        if (element.label?.includes("nls."))
          element.label = this.nls[element.label.split("nls.")[1]];
        if (element.hint?.includes("nls."))
          element.hint = this.nls[element.hint.split("nls.")[1]];
        if (element.text?.includes("nls.")) {
          let text = this.nls[element.text.split("nls.")[1]];
          text = text.replace(
            "[startdate]",
            new Date(feature.attributes.startdate).toLocaleDateString("en-GB")
          );
          text = text.replace(
            "[enddate]",
            new Date(feature.attributes.enddate).toLocaleDateString("en-GB")
          );
          element.text = text;
        }
      });
    }
    featureWidget = new FeatureForm({
      feature: feature,
      disabled: true,
      container: document.createElement("div"),
      formTemplate:
        feature.layer.title === this._getLayer("required-photos").title
          ? formTemplate
          : null,
    });

    //--Himanshu-end--
    featureWidget.when(() => {
      featureWidget.container.appendChild(replyBtn);
    });

    this.view.ui.add(featureWidget, "top-right");
    return featureWidget;
  }
  private _getFieldFromLayer(layer: any, fieldName: string) {
    let name: any = "",
      field: any = layer.fields.find((field: any) => {
        return field.name.toLowerCase() === fieldName?.toLowerCase();
      });
    if (field) name = field.name;
    return name;
  }
  private _loadMapWidgets() {
    const search = new Search({
      view: this.view,
      container: document.createElement("div"),
    });
    const searchExpand = new Expand({
      view: this.view,
      content: search,
      mode: "floating",
      expandTooltip: "Search",
    });
    this.basemapWidget = new BasemapGallery({
      view: this.view,
      container: document.createElement("div"),
    });

    const home = new Home({
      view: this.view,
    });
    const scaleBar = new ScaleBar({
      view: this.view,
      unit: "metric",
      style: "ruler",
    });
    this.measurementTool = new Measurement({
      view: this.view,
      container: "measure-container",
    });
    this.view.ui.add(searchExpand, "top-right");
    this.view.ui.add(home, "top-left");
    this.view.ui.add(scaleBar, "bottom-left");
    this._updateState({
      currentBasemap: this.basemapWidget?.activeBasemap?.title || "",
    });
  }
  private _referenceParcelsToggle() {
    let toggle: boolean = !this.state.referenceParcelsToggle,
      layer = this._getLayer("reference-parcels");
    layer.visible = toggle;
    this._updateState({ referenceParcelsToggle: toggle });
  }
  private _agriculturalParcelsOutlineToggle() {
    let toggle: boolean = !this.state.agriculturalParcelsOutlineToggle,
      farmerLayer = this._getLayer("farmer-parcels"),
      otherLayer = this._getLayer("other-parcels"),
      element: any = document.getElementsByClassName("slider-1")?.[0],
      opacity = element?.value / 100 || 1;
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
  private _agriculturalParcelsFillToggle() {
    let toggle: boolean = !this.state.agriculturalParcelsFillToggle,
      farmerLayer = this._getLayer("farmer-parcels"),
      otherLayer = this._getLayer("other-parcels"),
      element: any = document.getElementsByClassName("slider-1")?.[0],
      opacity = element?.value / 100 || 1;
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
  private _updateFillOpacity({ target }: any) {
    let farmerLayer = this._getLayer("farmer-parcels"),
      otherLayer = this._getLayer("other-parcels");
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
  private _agriculturalZonesToggle() {
    let toggle: boolean = !this.state.agriculturalZonesToggle,
      layer = this._getLayer("agricultural-zones");
    layer.visible = toggle;
    this._updateState({ agriculturalZonesToggle: toggle });
  }
  private _requestsLayerToggle() {
    let toggle: boolean = !this.state.requestsLayerToggle,
      arlayer = this._getLayer("agency-requests"),
      fclayer = this._getLayer("farmer-comments");
    if (arlayer) arlayer.visible = toggle;
    if (fclayer) fclayer.visible = toggle;
    this._updateState({ requestsLayerToggle: toggle });
  }
  private _notesLayerToggle() {
    let toggle: boolean = !this.state.notesLayerToggle,
      layer = this._getLayer("farmer-notes");
    if (layer) layer.visible = toggle;
    this._updateState({ notesLayerToggle: toggle });
  }
  private _requiredPhotosLayerToggle() {
    let toggle: boolean = !this.state.requiredPhotosLayerToggle,
      layer = this._getLayer("required-photos");
    if (layer) layer.visible = toggle;
    this._updateState({ requiredPhotosLayerToggle: toggle });
  }
  private _farmerPhotosLayerToggle() {
    let toggle: boolean = !this.state.farmerPhotosLayerToggle,
      layer = this._getLayer("farmer-photos");
    if (layer) layer.visible = toggle;
    this._updateState({ farmerPhotosLayerToggle: toggle });
  }
  private _getLayer(layerType: string) {
    let layer: any = "",
      code = this.options.layerInfo.find((l: any) => {
        return l.type === layerType;
      });
    if (this.view) {
      layer = this.view.map.layers.find((l: any) => {
        return l.title?.startsWith(code.code + "_");
      });
    }
    return layer;
  }
  private _updateRenderer(renderer: any, options: any) {
    if (renderer.type === "uniqueValue") {
      renderer = UniqueValueRenderer.fromJSON(renderer);
      for (let a = 0; a < renderer.uniqueValueInfos.length; a++) {
        if (renderer.uniqueValueInfos[a].symbol.data)
          renderer.uniqueValueInfos[a].symbol.data.symbol = this._updateSymbol(
            renderer.uniqueValueInfos[a].symbol.data.symbol,
            options
          );
        else
          renderer.uniqueValueInfos[a].symbol = this._updateSymbol(
            renderer.uniqueValueInfos[a].symbol,
            options
          );
      }
    } else if (renderer.type === "simple") {
      renderer = SimpleRenderer.fromJSON(renderer);
      if (renderer.symbol.symbol)
        renderer.symbol.symbol = this._updateSymbol(
          renderer.symbol.symbol,
          options
        );
      else if (renderer.symbol)
        renderer.symbol = this._updateSymbol(renderer.symbol, options);
    }
    return renderer;
  }
  private _updateSymbol(symbol: any, options: any) {
    if (symbol?.type === "CIMPolygonSymbol") {
      for (let a = 0; a < symbol.symbolLayers.length; a++) {
        if (symbol.symbolLayers[a].type === "CIMSolidStroke")
          symbol.symbolLayers[a].enable = options.outline;
        else if (symbol.symbolLayers[a].type === "CIMSolidFill") {
          //symbol.symbolLayers[a].enable = options.fill
          symbol.symbolLayers[a].color[3] = options.fill
            ? options.opacity * 255
            : 0;
        }
      }
    } else if (symbol?.type === "simple-fill") {
      symbol.color.a = options.fill ? options.opacity : 0;
      symbol.outline.color.a = options.outline ? 1 : 0;
    }
    return symbol;
  }
  private _toggleRightTool(target: any, type: string) {
    if (target.active) {
      this._closeRightTool(type);
    } else this._openRightTool(type);
  }
  private async _openRightTool(tool: string) {
    this.measurementTool?.clear();
    this._removeEditor(tool === "parcels");
    if (tool === "parcels") {
      if (!this.state.agriculturalParcelsOutlineToggle) {
        this._agriculturalParcelsOutlineToggle();
      }
    } else if (tool === "requests") {
      if (!this.state.requestsLayerToggle) {
        this._requestsLayerToggle();
      }
      if (!this.requestMade.comments) {
        this.requestMade.comments = true;
        this._getCommentsRequests();
      }
    } else if (tool === "notes") {
      if (!this.state.notesLayerToggle) {
        this._notesLayerToggle();
      }
      if (!this.requestMade.notes) {
        this.requestMade.notes = true;
        this._getFarmerNotes();
      }
    } else if (tool === "photos") {
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
  }
  private _closeRightTool(tool: string) {
    this.measurementTool?.clear();
    this._removeEditor(false);
    this._updateState({ rightTool: "", currentMeasurementTool: "" });
  }
  private _removeEditor(bool: boolean) {
    this.layerEditHandler?.remove();
    this.stateHandler?.remove();
    this.selectedListNode?.removeAttribute("selected");
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
  private async _getCommentsRequests() {
    let layer = this._getLayer("farmer-comments"),
      arLayer = this._getLayer("agency-requests");
    this.farmerComments = await this._getFeatures(layer, null);
    this.agencyRequests = await this._getFeatures(arLayer, null);
    this._updateState({ updateList: !this.state.updateList });
  }
  private async _getFarmerNotes() {
    let layer = this._getLayer("farmer-notes");
    this.farmerNotes = await this._getFeatures(layer, null);
    this._updateState({ updateList: !this.state.updateList });
  }

  private async _getApFeatures() {
    const layer = this._getLayer("required-photos");
    let features = await this._getFeatures(layer, null);
    features = features.map((feature) => {
      return {
        ...feature.attributes,
        geometry: feature.geometry,
      };
    });

    this._updateState({ apFeatures: features });
  }

  private async _getFpFeatures() {
    const layer = this._getLayer("farmer-photos");
    let features = await this._getFeatures(layer, null);
    features = features.map((feature) => {
      return {
        ...feature.attributes,
        geometry: feature.geometry,
      };
    });
    this._updateState({
      fpFeatures: features.map((feature) => ({
        requestId: feature.requestId,
        [layer.objectIdField]: feature[layer.objectIdField],
      })),
    });
  }

  private _updateBaseImage(baseImage: string) {
    if (this.state.currentBaseImage === baseImage) baseImage = "";
    this.baseImageList.forEach((imageLayer: any) => {
      if (imageLayer.title === baseImage) imageLayer.visible = true;
      else imageLayer.visible = false;
    });
    this._updateState({ currentBaseImage: baseImage });
  }
  private _updateBasemap(basemap: string) {
    if (basemap && this.basemapWidget?.source?.basemaps?.length) {
      let bm = this.basemapWidget.source.basemaps.find((b: any) => {
        return b.title === basemap;
      });
      if (bm) {
        this.basemapWidget.activeBasemap = bm;
        this._updateState({ currentBasemap: basemap });
      }
    }
  }
  private _showDeleteConfirmation(feature: any, type: string) {
    this._updateState({ showDeleteConfirmation: true });
  }

  private _removeFeature(features: any[]) {
    if (features.length) {
      let layer = features[0].layer,
        featureIds: any[] = features.map((feature: any) => {
          return { objectId: feature.attributes[feature.layer.objectIdField] };
        });
      layer
        .applyEdits({ deleteFeatures: featureIds })
        .then((response: any) => {
          this._removeParcelSelection();
          let { save } = this.state;
          save.parcels = true;
          this._updateState({ showDeleteConfirmation: false, save: save });
        })
        .catch((e: any) => {
          this._updateState({
            error: e.message,
            showDeleteConfirmation: false,
          });
        });
    }
  }
  private async _getFeatures(layer: any, outSR: any) {
    let query: any,
      count: number = 0;
    query = layer.createQuery();
    query.where = "1=1";
    await layer.queryFeatureCount(query).then((c: number) => {
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
    let collection: any[] = await this._queryFeatures([], query, layer, count);
    return collection;
  }
  private async _queryFeatures(
    response: any[],
    query: any,
    layer: any,
    count: number
  ): Promise<any> {
    if (query.start < count) {
      let error;
      if (layer.type === "feature" || layer.type === "geojson") {
        await layer
          .queryFeatures(query)
          .then((res: any) => {
            response = response.concat(res.features);
          })
          .catch((e: any) => {
            error = e;
            console.error(e);
          });
      } else {
        await layer
          .queryRasters(query)
          .then((res: any) => {
            response = response.concat(res.features);
          })
          .catch((e: any) => {
            error = e;
            console.error(e);
          });
      }
      if (!error) {
        query.start = response.length;
        return await this._queryFeatures(response, query, layer, count);
      } else return response;
    } else {
      return response;
    }
  }
  private _handleMeasurementClick(type: string) {
    this.measurementTool.clear();
    let state: any = {
      currentMeasurementTool: this.state.currentMeasurementTool,
    };
    if (state.currentMeasurementTool === type) {
      state.currentMeasurementTool = "";
    } else {
      state.currentMeasurementTool = type;
      this.measurementTool.activeTool = type;
    }
    this._updateState(state);
  }
  private _themeMenu() {
    let { theme } = this.state;
    theme.menu = !theme.menu;
    this._updateState({ theme: theme });
  }
  private _toggleTheme(theme: string) {
    let darkTheme: any;
    if (document.body.classList) {
      darkTheme = Array.from(document.body.classList).findIndex((className) => {
        return className === "calcite-mode-dark";
      });
    } else darkTheme = -1;
    if (
      (theme === "light" && darkTheme !== -1) ||
      (theme === "dark" && darkTheme === -1)
    ) {
      const dark: any = document.querySelector("#jsapi-theme-dark");
      const light: any = document.querySelector("#jsapi-theme-light");
      if (theme === "light") {
        document.body.classList.remove("calcite-mode-dark");
        dark.disabled = true;
        light.disabled = false;
      } else {
        document.body.classList.add("calcite-mode-dark");
        dark.disabled = false;
        light.disabled = true;
      }
      let stateTheme = this.state.theme;
      stateTheme.value = theme;
      this._updateState({ theme: stateTheme });
    }
  }

  private _updateState(properties: any) {
    let state = JSON.parse(JSON.stringify(this.state));
    Object.keys(properties).forEach((p) => {
      state[p] = properties[p];
    });
    this.state = state;
  }
  private async _loginUser() {
    let user: any,
      role: any = "";
    if (this.portal) {
      if (this.portal.user) {
        user = this.portal.user;
      } else {
        await IdentityManager.getCredential(this.portal.restUrl, {
          oAuthPopupConfirmation: false,
        }).then(async (e) => {
          await this.portal
            .queryUsers({
              query: "username:" + e.userId,
            })
            .then((queryResults) => {
              if (queryResults.results.length) {
                user = queryResults.results[0];
              }
            });
        });
      }
    }
    this.user = user;
    this._updateState({ farmerID: user.username });
  }
  private async _signOut() {
    if (this.portal) {
      let credential: any;
      await IdentityManager.checkSignInStatus(this.portal.restUrl).then(
        (queryResult) => {
          credential = queryResult;
        }
      );
      if (credential) credential.destroy();
      this.portal.user = null;
      this._updateState({ user: "" });
      await this._loginUser();
    }
  }
  private _getBrowserTheme() {
    let theme = "light";
    if (window.matchMedia) {
      let mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      if (mediaQuery.matches) theme = "dark";
      else theme = "light";
    } else if (localStorage.getItem("xoople-color-theme")) {
      theme = localStorage.getItem("xoople-color-theme");
    }
    return theme;
  }
  private _addZero(i: any) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }
  private async _queryPortalGroups(
    portal: arcgisPortal,
    param: any,
    items: any[]
  ): Promise<any> {
    let queryResult: any, error: any;
    await portal
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
        return await this._queryPortalGroups(
          portal,
          queryResult.nextQueryParams,
          items
        );
      } else return items;
    } else return items;
  }
  private async _queryPortalItems(
    portal: arcgisPortal,
    param: any,
    items: any[]
  ): Promise<any> {
    let queryResult: any, error: any;
    await portal
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
        return await this._queryPortalItems(
          portal,
          queryResult.nextQueryParams,
          items
        );
      } else return items;
    } else return items;
  }
  private async _queryGroup(groupItemID: string, queryParams: any) {
    let portalGroup: any,
      items: any[] = [];
    portalGroup = new PortalGroup({
      portal: this.portal,
      id: groupItemID,
    });

    items = await this._queryGroupRequest(portalGroup, queryParams, []);
    return items;
  }
  private async _queryGroupRequest(
    portalGroup: any,
    param: any,
    items: any[]
  ): Promise<any> {
    let queryResult: any, error: any;
    await portalGroup
      .queryItems(param)
      .then((res: any) => {
        queryResult = res;
      })
      .catch((e: any) => {
        error = { title: e.name, message: e.message };
      });
    if (!error) {
      items = items.concat(queryResult.results);
      if (queryResult.total > items.length) {
        return await this._queryGroupRequest(
          portalGroup,
          queryResult.nextQueryParams,
          items
        );
      } else return items;
    } else return items;
  }
  private async _saveFile(contentType: string, target: any) {
    target.loading = true;
    let layer = this._getLayer(contentType),
      features = await this._getFeatures(
        layer,
        new SpatialReference({ wkid: 4326 })
      ),
      geojson = this._convertFeatureCollectionToGeoJSON(features),
      portalToken = await this._getToken(this.portal.restUrl),
      { save, parcelEdit } = this.state,
      dateSuffix: string,
      title: string,
      error: any;
    const file = new Blob([JSON.stringify(geojson)], {
        type: "application/json",
      }),
      date = new Date();
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
    } else if (contentType === "farmer-comments") {
      save.comments = false;
      title = "FC_" + dateSuffix;
    } else if (contentType === "farmer-notes") {
      save.notes = false;
      title = "FN_" + dateSuffix;
    } else if (contentType === "farmer-photos") {
      save.photos = false;
      title = "FN_" + dateSuffix;
    }
    const formData = new FormData();
    formData.append("file", file, `${title}.json`);
    await esriRequest(this.portal.user.userContentUrl + "/addItem", {
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
      .then(async (response) => {
        if (response.data.success) {
          let status = await this._checkFileStatus(
            { status: "processing", itemId: response.data.id },
            portalToken
          );
          if (status !== "completed") error = status;
          else {
            let param: any = {
              f: "json",
              token: portalToken,
              groups: this.farmerGroup,
            };
            if (this.farmerGroup)
              error = await this._shareItemWithGroup(response.data.id, param);
          }
        } else error = this.nls.saveError;
      })
      .catch((e) => {
        error = e.message;
      });
    target.loading = false;
    parcelEdit.undo = false;
    parcelEdit.redo = false;
    this.trackChanges = { undo: {}, redo: {} };
    this._updateState({ save: save, error: error, parcelEdit: parcelEdit });
  }
  private async _checkFileStatus(
    response: any,
    portalToken: any
  ): Promise<any> {
    if (response.status === "processing") {
      let error;
      await esriRequest(
        this.portal.user.userContentUrl +
          "/items/" +
          response.itemId +
          "/status",
        {
          query: {
            f: "json",
            token: portalToken,
          },
          responseType: "json",
          method: "auto",
        }
      )
        .then((res: any) => {
          if (res.data.status === "failed") error = res.data.statusMessage;
          response = res.data;
        })
        .catch((e) => {
          error = e.message;
        });

      if (!error) {
        return await this._checkFileStatus(response, portalToken);
      } else return error;
    } else {
      return response.status;
    }
  }
  private async _shareItemWithGroup(itemId: string, param: any) {
    let error: any = "";
    await esriRequest(
      this.portal.user.userContentUrl + "/items/" + itemId + "/share",
      {
        query: param,
        responseType: "json",
        method: "post",
      }
    )
      .then((res: any) => {
        if (res.data.notSharedWith.length) error = this.nls.sharingError;
      })
      .catch((e) => {
        error = e.message;
      });
    return error;
  }
  private _convertFeatureCollectionToGeoJSON(featureCollection: any[]) {
    if (!featureCollection || !featureCollection.length) return null;
    let geoJSON: any = {
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
          coordinates:
            featureCollection[a].geometry.hasOwnProperty("z") &&
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
      } else if (featureCollection[a].geometry.hasOwnProperty("paths")) {
        geom = {
          type: "MultiLineString",
          coordinates: featureCollection[a].geometry.paths,
        };
      } else if (featureCollection[a].geometry.hasOwnProperty("rings")) {
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
  private _toggleConfirmationDialog(type: string) {
    let confirmationDialog = this.state.confirmationDialog;
    confirmationDialog[type] = !confirmationDialog[type];
    this._updateState({ confirmationDialog: confirmationDialog });
  }
  private _submitComments() {
    this._toggleConfirmationDialog("comments");
  }
  private _submitForReview() {
    this._toggleConfirmationDialog("review");
  }
  private _submitAsDeclaration() {
    let confirmationDialog = this.state.confirmationDialog;
    confirmationDialog.declare = !confirmationDialog.declare;
    this._updateState({
      confirmationDialog: confirmationDialog,
      declare: true,
      rightTool: "",
    });
  }
  private async _getToken(url: string) {
    let credential = IdentityManager.findCredential(url);
    if (credential) {
      return credential.token;
    } else {
      await esriRequest(url, {
        query: { f: "json" },
        responseType: "json",
      })
        .then(() => {
          credential = IdentityManager.findCredential(url);
          if (credential) return credential.token;
          else return "";
        })
        .catch((e) => {
          return "";
        });
    }
  }
  private _clipPolygon(polygon: any, clipPolygons: any[]) {
    if (polygon) {
      let intersectedFields: any[] = [];
      clipPolygons.forEach((cp: any) => {
        if (geometryEngine.intersects(polygon, cp.geometry)) {
          let intersectGeo: any = geometryEngine.intersect(
            polygon,
            cp.geometry
          );
          intersectGeo && intersectedFields.push(intersectGeo);
        }
      });
      if (intersectedFields.length) {
        let subtractor =
          intersectedFields.length > 1
            ? geometryEngine.union(intersectedFields)
            : intersectedFields[0];
        if (subtractor)
          polygon = geometryEngine.difference(polygon, subtractor);
      }
    }
    return polygon;
  }
  private _getFormTemplate(layerType: string) {
    let layer: any = "",
      layerInfo = this.options.layerInfo.find((l: any) => {
        return l.type === layerType;
      }),
      formTemplate: any;
    if (layerInfo.formTemplate?.elements?.length) {
      formTemplate = layerInfo.formTemplate;
    }
    return formTemplate;
  }
  private async _undoEdits({ target }: any) {
    target.loading = true;
    let fpLayer: any = this._getLayer("farmer-parcels"),
      error: any;
    await fpLayer
      .applyEdits(this.trackChanges.undo)
      .then(() => {})
      .catch((e: any) => {
        error = e.message;
      });
    let { parcelEdit, save } = this.state;
    save.parcels = false;
    parcelEdit.undo = false;
    parcelEdit.redo = true;
    target.loading = false;
    this._updateState({ parcelEdit: parcelEdit, error: error, save: save });
  }
  private async _redoEdits({ target }: any) {
    target.loading = true;
    let fpLayer: any = this._getLayer("farmer-parcels"),
      error: any;
    await fpLayer
      .applyEdits(this.trackChanges.redo)
      .then((edits: any) => {
        if (edits.addFeatureResults?.length) {
          this.trackChanges.undo.deleteFeatures = edits.addFeatureResults;
        }
      })
      .catch((e: any) => {
        error = e.message;
      });
    let { parcelEdit, save } = this.state;
    save.parcels = true;
    parcelEdit.undo = true;
    parcelEdit.redo = false;
    target.loading = false;
    this._updateState({ parcelEdit: parcelEdit, error: error, save: save });
  }
}
export = Agricultural_Parcel_Editor;
