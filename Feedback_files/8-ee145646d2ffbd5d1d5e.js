(window.webpackJsonp=window.webpackJsonp||[]).push([[8],{"3Jgm":function(e,t,s){"use strict";var o=s("Llzl"),i=s("pjml"),n=s("Qbdf"),r=s("k9iv"),a=s("0JpG"),c=s("TnpK"),l=s("Sa5G"),h=s("FBBZ"),d=s("71td");var u=s("Q/M7");s.d(t,"a",(function(){return p})),s.d(t,"b",(function(){return m}));const p="ultra.components.services.partner",m="partner";class b{constructor(e,t,s,o,i,n,r,a,c,l,h,d){this.$q=e,this.$rootScope=t,this.$stateParams=s,this.$window=o,this.cacheFactory=i,this.contextCourse=n,this.errorModalService=r,this.localizeService=a,this.ultraStateService=c,this.PartnerCourseModel=l,this.PartnerModel=h,this.PartnerStatusModel=d,this.shortMaxAge=5e3,this.partnerStatusCache=i.createCache("PartnerStatusCache",{deleteOnExpire:"passive",maxAge:this.shortMaxAge}),this.partnersCache=i.createCache("PartnersCache",{deleteOnExpire:"passive",maxAge:this.shortMaxAge}),this.partnerLinkedCoursesCache=i.createCache("PartnerLinkedCoursesCache",{deleteOnExpire:"passive",maxAge:this.shortMaxAge})}getPartnerCloudStatus(e,t=!1){if(d("body").hasClass("bb-within-uia-test"))return this.$q.when({enabled:!1,userCloudProvisioned:!1});if(t)return this.PartnerStatusModel.getStatus(e);let s=this.partnerStatusCache.get("status");return s||(s={promise:this.PartnerStatusModel.getStatus(e)},this.partnerStatusCache.put("status",s)),s.promise}resetPartnerCloudStatus(){this.partnerStatusCache.removeAll()}getPartners(e,t=!1){if(t)return this.PartnerModel.getPartnersByType(e);let s=this.partnersCache.get(e);return s||(s={promise:this.PartnerModel.getPartnersByType(e)},this.partnersCache.put(e,s)),s.promise}getLinkedPartners(e,t=!1){if(t)return this.PartnerCourseModel.$new(e).partnerLinkedCourses.$search().$allow(["400-599"]).$asPromise();let s=this.partnerLinkedCoursesCache.get(e);return s||(s={promise:this.PartnerCourseModel.$new(e).partnerLinkedCourses.$search().$allow(["400-599"]).$asPromise()},this.partnerLinkedCoursesCache.put(e,s)),s.promise}launchPartner(e,t){e.toolProvider.available?h.o(e)?this._launchBrowseLink(e.browseContentLink):this._checkProvisioningAndLaunch(e,t):e.toolProvider.compatible?this.errorModalService.handleError(this.localizeService.translateSync({locale:this.localizeService.getLocale(this.$rootScope),key:"course.partnerList.errorProviderNotConfigured"})):this.errorModalService.handleError(this.localizeService.translateSync({locale:this.localizeService.getLocale(this.$rootScope),key:"course.partnerList.errorProviderIncompatible"}))}_checkProvisioningAndLaunch(e,t){this._getProvisioningCheckResult(e.providerId,t).then((t=>{let s;t.status?(s={partnerId:e.providerId,toolType:"browse",partnerTitle:h.h(e)},l.o.Inline.isEqualTo(this.$stateParams.mode)?s.mode=this.$stateParams.mode:(s.partnerParentId=this.$stateParams.parentId,s.position=this.$stateParams.position)):(s={partnerId:e.providerId,toolType:"partnerProvisioning",partnerTitle:this.localizeService.translateSync({locale:this.localizeService.getLocale(this.$rootScope),key:"course.partnerList.partnerProvisioning"}),partnerParentId:this.$stateParams.parentId},this.ultraStateService.current.name.indexOf("peek.books-and-tools")>=0&&(s.returnState="base.courses.peek.course.outline.peek.books-and-tools")),this.ultraStateService.goPeekState("partner-tool.tool",s)}))}_getProvisioningCheckResult(e,t){return o.isDefined(t)?this.$q.when({status:t}):this.PartnerCourseModel.$new(this.contextCourse.courseId).updateProvisioning(e)}_launchBrowseLink(e){let t=u.c(e.url);switch(this.$stateParams.parentId&&(t=u.a(t,"content_id",this.$stateParams.parentId)),e.target){case"_self":this._windowLocationAssign(t);break;case"_blank":this.$window.open(t)}}_windowLocationAssign(e){this.$window.location.assign(e)}}b.$inject=["$q","$rootScope","$stateParams","$window","DSCacheFactory",n.e,r.d,a.serviceName,c.d,i.T.serviceName,i.R.serviceName,i.V.serviceName];o.module(p,[n.b,r.c,a.moduleName,c.b,i.N]).service(m,b)},HjsN:function(e,t,s){"use strict";var o=s("D57K"),i=s("dCrD"),n=s("Oyr+"),r=s("aHpC");s.d(t,"a",(function(){return a})),s.d(t,"b",(function(){return c}));const a="allCloudUploadsCompleteEvent";let c=class extends i.a{constructor(e,t,s){super(e,t,s),this.cloudUploadPromises=[],this.onFilesSelectedHandler=e=>{const t=[];e.forEach((e=>{const s={id:e.id,deferred:this.$q.defer()};t.push(s.deferred),this.cloudUploadPromises.push(s)})),this.$q.all(t.map((e=>e.promise))).then((()=>{this.scope.$emit(a)}),(e=>{this.scope.$emit(a,e)}))},this.resolveFileUploadDeferred=(e,t)=>{const s=this.cloudUploadPromises.findIndex((t=>t.id===e));return s>=0&&(t?this.cloudUploadPromises[s].deferred.reject(t):this.cloudUploadPromises[s].deferred.resolve(),this.cloudUploadPromises.splice(s,1),!0)},this.cloudUploadAttachHandler=(e,t,s,o)=>{const i=this.scope.attachHandler||this.defaultAttachHandler,n=this.$q.defer();return i(e,t,s,o).then((()=>{this.resolveFileUploadDeferred(t.ui.fileId)&&n.resolve()})),n.promise},t.$on(n.e,((e,t,s,o,i)=>{o===n.c.Error?this.resolveFileUploadDeferred(t,"failed"):o===n.c.Cancel&&this.resolveFileUploadDeferred(t)}))}};c.$inject=[],c=Object(o.__decorate)([Object(o.__param)(0,Object(r.b)("$injector")),Object(o.__param)(1,Object(r.b)("scope")),Object(o.__param)(2,Object(r.b)("element"))],c)},RPq7:function(e,t,s){"use strict";s.d(t,"b",(function(){return a})),s.d(t,"a",(function(){return c}));var o=s("Llzl"),i=s("nbDY"),n=s.n(i),r=s("lEL+");const a="ultra.directives.contentItemMouseover";class c extends n.a{}c.Top=new c("TOP"),c.Bottom=new c("BOTTOM"),c.Default=new c("DEFAULT");class l{constructor(e,t,s){this.scope=e,this.element=t,this.timeout=s,this.lastPosition=c.Default,this.lastTime=0,t.mouseover((()=>{this.recalculatePosition()})),t.mousemove((e=>{Date.now()-this.lastTime>1e3?(this.timeout.cancel(this.lastMousemoveTimeout),this.handleMousemove(e)):(this.timeout.cancel(this.lastMousemoveTimeout),this.lastMousemoveTimeout=this.timeout((()=>{this.handleMousemove(e)}),this.scope,100,!1))})),t.mouseleave((()=>{this.timeout.cancel(this.lastMousemoveTimeout),this.lastPosition=c.Default})),e.$on("content-outline-hover-end",(()=>{this.timeout.cancel(this.lastMousemoveTimeout),this.lastPosition=c.Default}))}handleMousemove(e){null!=this.elementOffset&&null!=this.elementHeight||this.recalculatePosition(),this.lastTime=Date.now(),e.pageY-this.elementOffset>this.elementHeight/2?(this.lastPosition.isEqualTo(c.Bottom)||this.broadcastPosition(c.Bottom),this.lastPosition=c.Bottom):(this.lastPosition.isEqualTo(c.Top)||this.broadcastPosition(c.Top),this.lastPosition=c.Top)}broadcastPosition(e){this.scope.$emit("content-item-mouseover",{element:this.element,relativeMousePosition:e})}recalculatePosition(){this.elementHeight=this.element.outerHeight(),this.elementOffset=this.element.offset().top}}l.$inject=["scope","element",r.b];class h{constructor(e){this.$injector=e,this.restrict="A",this.scope={canCreate:"&"},this.link=(e,t)=>{e.canCreate&&e.canCreate()&&(e.contentItemMouseover=this.$injector.instantiate(l,{scope:e,element:t}))}}}h.$inject=["$injector"],o.module(a,[r.a]).directive("bbContentItemMouseover",["$injector",e=>e.instantiate(h)])},dCrD:function(e,t,s){"use strict";s.d(t,"a",(function(){return B}));var o=s("D57K"),i=s("nbDY"),n=s.n(i),r=s("Oyr+"),a=s("0JpG"),c=s("RPq7"),l=s("Qbdf"),h=s("nYZ0"),d=s("Vsv2"),u=s("jx5I"),p=s("A+IJ"),m=s("+4Px"),b=s("pjml"),f=s("3Jgm"),v=s("e6jQ"),C=s("lEL+"),g=s("TnpK"),$=s("PoQW"),w=s("aHpC"),M=s("zGdY"),P=s("Y+9S");class S extends n.a{}S.Unzip=new S("Unzip"),S.Website=new S("Website"),S.Default=new S("Default");let B=class{constructor(e,t,s){this.scope=t,this.element=s,this.alwaysShow=!1,this.isButtonVisible=!1,this.isMobile=!1,this.isUploadMultipleFiles=!1,this.removeDefaultRenderClass=!1,this.uuid=Object(v.b)(),this.downloadFile=e=>{this.scope.$broadcast("downloadFile",e,this.positionForFiles)},this.defaultAttachHandler=(e,t,s,o,i)=>{const n=o||this.$q.defer();let r={parentId:void 0,positionBefore:"start",positionAfter:void 0,depth:0};return this.isUploadMultipleFiles=s,this.insertLocation=i||this.getInsertLocationData(),r=t.ui&&t.ui.parentId?{parentId:t.ui.parentId,positionBefore:t.ui.positionBefore,positionAfter:t.ui.positionAfter,depth:t.ui.depth}:this.insertLocation,"folder"===t.type?(this.closeMenu(),!t.ui||t.ui.depth<=p.l?this._addFolderToCourseOutline(t,r).then((e=>{t.ui={parentId:e.id,positionBefore:"start",depth:1+Number(e.depth)},n.resolve(t)}),(e=>{n.reject(e)})):n.resolve()):this._addContentToCourseOutline(t,e,r).then((e=>{const s=null==i?void 0:i.positionAfter;this.scope.$root.$broadcast("uploadComplete",t,s),e.$save().$then((s=>{t.ui&&t.ui.needUnzip&&(e=s),n.resolve()}))})),n.promise},this.toggleAddContentMenu=()=>{this.isEmptyFolder()?this.scope.$emit("toggle-folder-by-id",this.scope.content.id):this.isMenuVisible=!this.isMenuVisible,this.timeout((()=>{this.scope.$apply()}),this.scope)},this.hideAddContentMenu=e=>{null===e.target.closest(`#${this.getButtonWrapperId()}`)&&(this.isMenuVisible=!1,this.timeout((()=>{this.scope.$apply()}),this.scope))},this.$q=e.get("$q"),this.$rootScope=e.get("$rootScope"),this.bbLocalize=e.get(a.serviceName),this.cloudDriveService=e.get(d.b),this.fileUploadSettingsService=e.get(u.b),this.timeout=e.get(C.b),this.contentSvc=e.get(h.f),this.CourseModel=e.get(b.m.serviceName),this.PartnerService=e.get(f.b),this.ultraState=e.get(g.d),this.contextCourse=e.get(l.e),this.scope.addMenuId=v.a(),this.showMenuOverride=this.scope.showMenuOverride,this.alwaysShow=this.scope.alwaysShow,this.currentCourse=this.contextCourse.course,this.isCloudServiceAvailablePromise=this.cloudDriveService.isCloudServiceAvailable().then((e=>this.isCloudServiceAvailable=e)),this.bbLocalize.loadBundle("components/directives/add-content-button").then((()=>{let e="content";this.scope.itemIndex&&null!=this.scope.itemIndex()?e="item-index":"grades"===this.scope.contextArea?e="grades":"course-group"===this.scope.contextArea?e="group":"bbml-editor-single-file"===this.scope.contextArea&&(this.scope.addContentButton.isMenuVisible=!0),this.isMenuVisible=!1,this.addButtonAriaLabel=this.bbLocalize.translateSync({locale:this.bbLocalize.getLocale(this.scope),key:"components.directives.add-content-button.aria-label."+e+".add-button-label"});const t="components.directives.add-content-button.aria-label.content."+(this.isMobile?"yourDevice":"yourComputer");if(this.uploadAriaLabel=this.bbLocalize.translateSync({locale:this.bbLocalize.getLocale(this.scope),key:t}),this.scope.itemName||this.scope.itemType){const t=t=>{const[s,o,i]=t;if(s||o){const t=o?o+"-":"",n=this.scope.positionAfter?"after":"before";this.addButtonAriaLabel=this.bbLocalize.translateSync({locale:this.bbLocalize.getLocale(this.scope),key:"components.directives.add-content-button.aria-label."+e+".add-button-label-item-name-"+t+n,params:{itemName:s,itemIndex:i},noWrap:!0,noEscape:!0})}};this.scope.$watchGroup(["itemName()","itemType()","itemIndex()"],t)}})),s.mouseover((()=>{this.$rootScope.$broadcast("mouseover-add-content-button"),this.scope.$apply((()=>{this.scope.addContentButton.showButton()}))})),this.scope.$on("close-all-add-menus",(()=>{this.showMenuOverride?this.isEmptyFolder()&&this.scope.content.ui.isOpen&&(this.scope.addContentButton.isMenuVisible=!0):this.scope.addContentButton.isMenuVisible=!1})),this.scope.showBothButtons&&this.scope.showBothButtons()||this.scope.$on("mouseover-add-content-button",(()=>{this.scope.addContentButton.hideButton()})),this.scope.$on("content-item-hover",((e,t)=>{this.scope.addContentButton.hideButton();const o=()=>{let e;return e=s.closest(".folder-contents").find("bb-add-content-button").first().is(s)?s.closest(".folder-contents").find(".js-content-div .element-list-row").first():s.closest(".js-content-div").next(".js-content-div").find(".element-list-row").first(),e.hasClass("element-list-row")||(e=s.next().find(".js-content-div").first().find(".element-list-row")),!!e.is(t.element)&&this.scope.addContentButton.showButton()},i=()=>{let e=!1;s.closest(".js-content-div").find(".element-list-row").first().is(t.element)&&(e=!0),s.closest(".folder").is(t.element.parent(".folder"))&&(e=!1),t.element.hasClass("js-parent")&&t.element.hasClass("open")&&(e=!1),this.scope.addContentButton.isButtonVisible!==e&&(this.scope.addContentButton.isButtonVisible=e)};this.scope.showBothButtons&&this.scope.showBothButtons()?o()||i():t.relativeMousePosition.isEqualTo(c.a.Top)?o():i()})),this.scope.$on("content-outline-hover-end",(()=>{this.scope.addContentButton.hideButton()})),this.scope.$watch("alwaysShow",(e=>{this.alwaysShow=e})),s.on("drop",(e=>{this.closeMenu(),this.scope.$emit(r.e,this.scope.parentId(),this.scope.positionBefore&&this.scope.positionBefore(),this.scope.positionAfter&&this.scope.positionAfter(),this.scope.depth(),void 0,this.scope.content,r.c.AssignDropTarget)})),this.scope.$on("$stateChangeStart",(()=>{this.ultraState.includes("**.content-manage.import.**")?this.isMenuVisible=this.isEmptyFolder():this.isEmptyFolder()?this.isMenuVisible=!0:this.isMenuVisible=!1,this.timeout((()=>{this.scope.$apply()}),this.scope)})),this.scope.$on(r.b,(()=>{this.closeMenu()})),this.isMenuVisible=this.scope.showMenuOverride,null!=this.scope.showMenuOverride&&this.scope.$watch((()=>this.scope.showMenuOverride),(e=>{this.scope.addContentButton.isMenuVisible=e,this.showMenuOverride=e})),this.getInsertLocationData()}onKeydown(e){e.keyCode===m.g&&this.isMenuVisible&&(this.closeMenu(),this.element.find("a.js-show-add-options").focus(),e.stopPropagation(),e.preventDefault())}showButton(){this.isButtonVisible=!0}hideButton(){this.isButtonVisible=!1}turnOffAlwaysShow(){this.alwaysShow=!1}toggleMenu(){if(this.showMenuOverride)this.showMenuOverride&&this.isEmptyFolder()&&this.scope.$emit("toggle-folder-by-id",this.scope.content.id);else{const e=this.isMenuVisible;e||this.$rootScope.$broadcast("close-all-add-menus"),this.isMenuVisible||this.timeout((()=>{this.element.scrollintoview({duration:250})}),this.scope,0,!1),this.isMenuVisible=!e}}isForceShowAddButton(){return this.scope.forceShowAddButton}closeMenu(){this.isMenuVisible&&this.toggleMenu()}getInsertLocationData(){return this.insertLocation={parentId:this.scope.parentId(),positionBefore:this.scope.positionBefore&&this.scope.positionBefore(),positionAfter:this.scope.positionAfter&&this.scope.positionAfter(),depth:this.scope.depth(),contentId:"create"}}assignPosition(){Object(P.notifyMobileApp)(P.MessageType.CloudStorageOpened),this.closeMenu(),this.scope.$emit("bb-bbml-editor-assign-position",this.getInsertLocationData())}_addFolderToCourseOutline(e,t){return this.contentSvc.makeContentInContentTree(this.scope.rootContent&&this.scope.rootContent(),this.contextCourse.courseId,t.parentId,t.positionBefore,t.positionAfter,!0).then((s=>{const o=s.content;return o.parentId=t.parentId,o.positionBefore=t.positionBefore,o.positionAfter=t.positionAfter,o.isAvailable=!1,o.depth=t.depth,o.description="",o.title=e.name,o.contentDetail={"resource/x-bb-folder":{isFolder:!0}},o.courseId=this.contextCourse.courseId,o.contentHandler=b.p.ContentHandler.Folder,o.$save().$asPromise()}))}_addContentToCourseOutline(e,t,s){return this.contentSvc.makeContentInContentTree(this.scope.rootContent&&this.scope.rootContent(),this.contextCourse.courseId,s.parentId,s.positionBefore,s.positionAfter,!0).then((e=>e.content)).then((o=>(o.parentId=s.parentId,o.positionBefore=s.positionBefore,o.positionAfter=s.positionAfter,o.isAvailable=!1,o.depth=s.depth,o.description="",o.title=t.fileName,o.contentHandler=b.p.ContentHandler.File,o.contentDetail={"resource/x-bb-file":{file:{fileName:t.fileName,fileLocation:t.fileLocation},fileAssociationMode:M.FileAssociationMode.Embed}},e.ui&&e.ui.needUnzip&&(o.contentDetail["resource/x-bb-file"].action=S.Unzip.toString()),o.courseId=this.contextCourse.courseId,o.$asPromise())))}getTargetId(){return`addContentButton-${this.uuid}`}getButtonWrapperId(){return`addContentButtonWrapper-${this.uuid}`}getDirectionalHint(){return $.DirectionalHint.bottomCenter}isEmptyFolder(){const{content:e,folderNestedButton:t}=this.scope;return!!(e&&e.isFolder()&&e.children&&0===e.children.length&&t&&t())}};B=Object(o.__decorate)([Object(o.__param)(0,Object(w.b)("$injector")),Object(o.__param)(1,Object(w.b)("scope")),Object(o.__param)(2,Object(w.b)("element"))],B)}}]);