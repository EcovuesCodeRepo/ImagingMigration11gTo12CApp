/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your application specific code will go here
 */
define(['knockout','default','configs', 'ojs/ojmodule-element-utils', 'ojs/ojknockouttemplateutils', 'ojs/ojrouter', 'ojs/ojresponsiveutils', 'ojs/ojresponsiveknockoututils', 'ojs/ojarraydataprovider',
        'ojs/ojoffcanvas', 'ojs/ojmodule-element', 'ojs/ojknockout'],
  function(ko, defaults, configs, moduleUtils, KnockoutTemplateUtils, Router, ResponsiveUtils, ResponsiveKnockoutUtils, ArrayDataProvider, OffcanvasUtils) {
     function ControllerViewModel() {
      var self = this;
     defaults.fromUser('Admin');
      this.KnockoutTemplateUtils = KnockoutTemplateUtils;

      // Handle announcements sent when pages change, for Accessibility.
      self.manner = ko.observable('polite');
      self.message = ko.observable();
      self.waitForAnnouncement = false;
      self.navDrawerOn = false;

      document.getElementById('globalBody').addEventListener('announce', announcementHandler, false);
     
      /*
        @waitForAnnouncement - set to true when the announcement is happening.
        If the nav-drawer is ON, it is reset to false in 'ojclose' event handler of nav-drawer.
        If the nav-drawer is OFF, then the flag is reset here itself in the timeout callback.
      */
      function announcementHandler(event) {
        self.waitForAnnouncement = true;
        setTimeout(function() {
          self.message(event.detail.message);
          self.manner(event.detail.manner);
          if (!self.navDrawerOn) {
            self.waitForAnnouncement = false;
          }
        }, 200);
      };

      // Media queries for repsonsive layouts
      var smQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);
      self.smScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);
      var mdQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.MD_UP);
      self.mdScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(mdQuery);

       // Router setup
       self.router = Router.rootInstance;
       self.router.configure({
         'dashboard': {label: 'Dashboard'},
         'incidents': {label: 'Incidents'},
         'customers': {label: 'Customers'},
         'about': {label: 'About'},
         'imaging': {label: 'Imaging', isDefault: true}
       });
      Router.defaults['urlAdapter'] = new Router.urlParamAdapter();

      self.loadModule = function () {
        self.moduleConfig = ko.pureComputed(function () {
          var name = self.router.moduleConfig.name();
          var viewPath = 'views/' + name + '.html';
          var modelPath = 'viewModels/' + name;
          return moduleUtils.createConfig({ viewPath: viewPath,
            viewModelPath: modelPath, params: { parentRouter: self.router } });
        });
      };

      // Navigation setup
      var navData = [
     /* {name: 'Dashboard', id: 'dashboard',
       iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-chart-icon-24'},
      {name: 'Incidents', id: 'incidents',
       iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-fire-icon-24'},
      {name: 'Customers', id: 'customers',
       iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-people-icon-24'},
      {name: 'About', id: 'about',
       iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-info-icon-24'},*/
       {name: 'Imaging', id: 'imaging',
       iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-chart-icon-24'}
      ];
      self.navDataProvider = new ArrayDataProvider(navData, {keyAttributes: 'id'});

      // Drawer
      // Close offcanvas on medium and larger screens
      self.mdScreen.subscribe(function() {OffcanvasUtils.close(self.drawerParams);});
      self.drawerParams = {
        displayMode: 'push',
        selector: '#navDrawer',
        content: '#pageContent'
      };
      // Called by navigation drawer toggle button and after selection of nav drawer item
      self.toggleDrawer = function() {
        self.navDrawerOn = true;
        return OffcanvasUtils.toggle(self.drawerParams);
      }
      // Add a close listener so we can move focus back to the toggle button when the drawer closes
      document.getElementById('navDrawer').addEventListener("ojclose", onNavDrawerClose);
      
       
      self.logout = function() {
				//  window.location.href='logout.jsp';
				window.location.href=configs.contextUrl+'logout';
			};
                        
     // Header
      // Application Name used in Branding Area
      self.appName = ko.observable("Imaging Migration");
      // User Info used in Global Navigation area
      self.userLogin = ko.observable(defaults.userName());
      
      self.loggerStatus = ko.observable(false);
                        self.loggerFlag = ko.observable(false);
                        self.currentLoggerType = ko.observable("OFF");
            console.log('In AppController: ' + configs.javadebug);
            
			self.loggerTypes = ko.observableArray([{
					id: "WARNING",
					value: "WARN",
					label: "WARNING"
				},
				{
					id: "ERROR",
					value: "ERROR",
					label: "ERROR"
				},
				{
					id: "INFO",
					value: "INFO",
					label: "INFO"
				},
				{
					id: "DEBUG",
					value: "DEBUG",
					label: "DEBUG"
				}
			]);
			self.loggerChanged = function(event, data) {
				console.log(event);
				self.loggerFlag(event.detail.value);
			}
      
      //prferences dialog box
			
			self.loggerSaveAndClose = function() {
                                var loglevel;
                                if(self.loggerStatus() == true){
                                loglevel = self.currentLoggerType();
                                }else{
                                loglevel = "OFF";                        
                                }
                                
                                $.ajax({
                                        //url: self.configsURL + self.schemaName + 'dashboard/hrorgs?username=' + defaults.userName(),
                                        url: configs.url + 'logging/loglevel/'+loglevel,
                                        type: 'GET',
                                        dataType: 'json',
                                        success: function(result) {
                                        console.log('Logging level: '+result);
                                        },
                                        error: function(data, e) {
                                                //window.location.href = configs.weblogicServerUrl+"dashboard/logout";
                                                //console.log("Error");
                                        }
                                });
                                        $("#loggerDialog").ojDialog("close");
			};
			self.loggerCancelAndClose = function() {
				$("#loggerDialog").ojDialog("close");
			};
			
			//Logger Settings Dialog box                        
			self.openLoggerSettings = function() {
				$("#loggerDialog").ojDialog("open");
			};

      /*
        - If there is no aria-live announcement, bring focus to the nav-drawer button immediately.
        - If there is any aria-live announcement in progress, add timeout to bring focus to the nav-drawer button.
        - When the nav-drawer is ON and annoucement happens, then after nav-drawer closes reset 'waitForAnnouncement' property to false.
      */
      function onNavDrawerClose(event) {
        self.navDrawerOn = false;
        if(!self.waitForAnnouncement) {
          document.getElementById('drawerToggleButton').focus();
          return;
        }

        setTimeout(function() {
          document.getElementById('drawerToggleButton').focus();
          self.waitForAnnouncement = false;
        }, 2500);
      }

      // Header
      // Application Name used in Branding Area
     

      // Footer
      function footerLink(name, id, linkTarget) {
        this.name = name;
        this.linkId = id;
        this.linkTarget = linkTarget;
      }
            self.footerLinks = ko.observableArray([
       new footerLink("About Ecovues", 'aboutEcovues', 'http://ecovues.com/company.html'),
	new footerLink("Contact US", 'contactUs', 'http://ecovues.com/contact.html')
      ]);
     }

     return new ControllerViewModel();
  }
);
