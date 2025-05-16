import { subclass, property } from "esri/core/accessorSupport/decorators";
import Widget from "esri/widgets/Widget";
// import { init } from "esri/core/watchUtils";
import { tsx } from "esri/widgets/support/widget";
import arcgisPortal from "esri/portal/Portal";
import PortalUser from "esri/portal/PortalUser";


interface MainParams extends __esri.WidgetProperties {
    appConfig: any,
    container: any
}
interface State {
    error: any
    user: any
}

@subclass("esri.widgets.Agricultural_Parcel_Editor")
class Agricultural_Parcel_Editor extends Widget {
    constructor(params?: MainParams) {
        super(params);
    }
    portal: arcgisPortal;
    user: PortalUser;
    override async postInitialize() {
        this.state = {
            error: "",
            user: ""
        }
        this.portal = new arcgisPortal({
            url: this.appConfig.portalURL
        });
        this.portal.authMode = "auto"
        await this.portal.load().then(() => {
        }).catch(() => {

        })
        this._toggleTheme(this._getBrowserTheme())
        setTimeout(() => {
            this._updateAppState({user: "load"})
        }, 2000)
    }
      
      
    @property()
      appConfig: any;
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
        let content
         if(this.state.user) {
            let error
            if(this.state.error?.message) {
                error = (<calcite-alert open="true" kind="danger" scale="m" placement="bottom">
                            <div slot="title">{this.state.error.name}</div>
                            <div slot="message">{this.state.error.message}</div>
                        </calcite-alert>)
            }
            let mainTemplate, cards
            if(this.appConfig.appLinks?.length) {
                cards = this.appConfig.appLinks.map((app:any) => {
                    return (
                                <calcite-card class="xoople-card" onclick={() => {this._loadLink(app.url)}} bind={this}>
                                    <img slot="thumbnail" alt={app.title} src={app.thumbnail} />
                                    <span slot="title">{app.title}</span>
                                    <span slot="subtitle">{app.description}</span>
                                </calcite-card>
                            )
                })
            } else {
                cards = (
                            <calcite-notice open kind="warning" scale="m" icon="exclamation-mark-circle">
                                <div slot="message">No apps found.</div>
                            </calcite-notice>
                        )
            }
            
               mainTemplate = (<calcite-shell content-behind>
                                <div class="xoople-header" slot="header">           
                                    <img src="app/images/logo.PNG" class="xoople-logo"/>
                                    <div class="xoople-header-title">
                                        <h2 class="xoople-header-title-1">{this.appConfig.appTitle}</h2>
                                    </div>    
                                </div>
                                <div class="xoople-card-container">
                                    {cards}
                                </div>
                               </calcite-shell>
                            )
            
            content = (<div>
                        {mainTemplate}
                        {error}
                      </div>)
         } else
            content = (<div><calcite-scrim class="xoople-loader" loading></calcite-scrim></div>)
        
        return content;
       }
  //-------------------------------------------------------------------
  //
  //  Private methods
  //
  //-------------------------------------------------------------------
    private _loadLink(url:any) {
        let link = document.createElement("a")
        link.href = url
        link.target = "_blank"
        link.click()
    }
    private _toggleTheme(theme:string) {
        let darkTheme:any
        if (document.body.classList) {
            darkTheme = Array.from(document.body.classList).findIndex((className) => {
                return className === "calcite-mode-dark"
            });
        } else
            darkTheme = -1;
        if ((theme === "light" && darkTheme !== -1) || (theme === "dark" && darkTheme === -1)) {
            const dark:any = document.querySelector("#jsapi-theme-dark");
            const light:any = document.querySelector("#jsapi-theme-light");
            if (theme === "light") {
                document.body.classList.remove("calcite-mode-dark");
                dark.disabled = true;
                light.disabled = false;
            } else {
                document.body.classList.add("calcite-mode-dark");
                dark.disabled = false;
                light.disabled = true;
            }
            this._updateAppState({theme: theme})
        }
    }
   
    private _updateAppState(properties:any) {
        let state = JSON.parse(JSON.stringify(this.state))
        Object.keys(properties).forEach((p) => {
            state[p] = properties[p]
        })
        this.state = state
    }
    private _getBrowserTheme() {
        let theme = "light"
        if(window.matchMedia) {
            let mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
            if(mediaQuery.matches)
                theme = "dark"
            else
                theme = "light"
        } else if(localStorage.getItem("xoople-color-theme")){
            theme = localStorage.getItem("xoople-color-theme")
        }
        return theme
    }
    
}
export = Agricultural_Parcel_Editor

