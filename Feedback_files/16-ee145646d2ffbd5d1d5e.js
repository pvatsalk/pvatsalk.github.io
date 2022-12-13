(window.webpackJsonp=window.webpackJsonp||[]).push([[16],{"7pcG":function(e,t,r){"use strict";r.d(t,"a",(function(){return y})),r.d(t,"b",(function(){return R}));var n=r("Llzl"),s=r("ZQFV"),o=r("0JpG"),i=r("fYJU"),a=r("go4a"),l=r("VdDF"),u=r("jhBu"),d=r("Sa5G"),c=r("P2dS"),m=r("pjml"),h=r("wgY5"),p=r("8jzW"),v=r("TnpK"),b=r("vhkR"),g=r("9hUw"),f=r("Is+C"),I=r("z6Q5"),C=r("zGdY"),w=r("IbyE");const y="ultra.components.services.calendar",R="bbCalendar";var S;!function(e){e.Institution="Institution",e.Personal="Personal",e.Course="Course",e.ExternalCourse="ExternalCourse",e.OfficeHoursForAllCourses="OfficeHoursForAllCourses"}(S||(S={}));class P{constructor(e,t,r,n,s,o,i,a,l,u,d,c,m,h,p,v){this.$q=e,this.batchService=t,this.localize=r,this.contextUser=n,this.CourseModel=s,this.CourseMembershipModel=o,this.ExternalCourseModel=i,this.InstitutionCalendarItemModel=a,this.UserModel=l,this.entitlementService=u,this.categoryService=d,this.scoreProviderHelper=c,this.ultraState=m,this.ltiService=h,this.peerReview=p,this.scormService=v}mixinColorIndexToCalendarItems(e,t){const r={};e.forEach((e=>{const t=e.calendarId;(r[t]=r[t]||[]).push(e)}));const n=r[C.KnownCalendarIdentifier.Institution];n&&n.forEach((e=>{e.ui.courseColorClass="institution-color"}));const s=r[C.KnownCalendarIdentifier.Personal];s&&s.forEach((e=>{e.ui.courseColorClass="personal-color"}));const o=[];return this.batchService.performBatch((()=>{Object.keys(r).filter((e=>!Object.values(C.KnownCalendarIdentifier).includes(e))).forEach((e=>{o.push(this.CourseModel.$new(e).users.$find(t).$asPromise())}))})),this.$q.all(o).then((e=>{e.forEach((e=>{const t=r[e.course.$pk];if(!t)return;const n=a.a(e);t.forEach((e=>{e.ui.courseColorClass=n}))}))})).then((()=>e))}updateCalendarItemTime(e,t,r){const n=this.getCalendarItem({calendarId:e.calendarId,itemSourceId:e.itemSourceId,itemSourceType:e.itemSourceType,recurRules:{repeatRuleType:e.recurRules&&e.recurRules.repeatRuleType,repeatRuleCourseId:e.recurRules&&e.recurRules.repeatRuleCourseId,repeatRuleUserId:e.recurRules&&e.recurRules.repeatRuleUserId},startDate:t,endDate:r});e.recurRules&&e.recurRules.repeatRuleType&&(n.startDate=new Date(t.getTime()-e.startDate.getTime()+e.recurRules.originalStart.getTime()),n.endDate=new Date(r.getTime()-e.endDate.getTime()+e.recurRules.originalEnd.getTime()));const s=["startDate","endDate"];return e.recurRules&&(n.recurRules={...e.recurRules,count:e.recurRules.count>=0?e.recurRules.count:null,originalStart:n.startDate,originalEnd:n.endDate,timeZoneId:l.a.getCurrentTimeZoneId()},Object.keys(n.recurRules).forEach((e=>{s.push(`recurRules.${e}`)}))),n.$save(s).$asPromise()}findCalendarItem(e){return this.getCalendarItem(e).$fetch().$asPromise()}getCalendarItem(e){var t,r;const n={itemSourceId:e.itemSourceId,itemSourceType:e.itemSourceType};return e.calendarId===C.KnownCalendarIdentifier.Institution?this.InstitutionCalendarItemModel.$new(n):C.CalendarItemRepeatRuleType.OfficeHours===(null===(t=e.recurRules)||void 0===t?void 0:t.repeatRuleType)?this.CourseModel.$new(e.recurRules.repeatRuleCourseId).users.$new(e.recurRules.repeatRuleUserId).officeHours.$new(n):e.calendarId===C.KnownCalendarIdentifier.Personal?this.UserModel.$new(this.contextUser.userId).calendarItems.$new(n):C.CalendarItemRepeatRuleType.ClassSchedule===(null===(r=e.recurRules)||void 0===r?void 0:r.repeatRuleType)?this.CourseModel.$new(e.calendarId).schedule.$new(n):this.CourseModel.$new(e.calendarId).calendars.calendarItems.$new(n)}getNextEventForDailyRepeat(e,t){if(!e||C.CalendarRecurFrequency.Daily!==e.freq)return null;let r=e.interval;if(null==r&&(r=1),Number.isNaN(Number(r))||r!==Math.floor(r)||r<1||r>100)return null;const n=h(e.originalStart);let s=h(t);s.hours(n.hours()).minutes(n.minutes()).seconds(n.seconds()).milliseconds(n.milliseconds());const o=s.diff(n,"days");let i=Math.floor(o/r);o<=0?s=n:i*r!==o&&(s.add({days:(i+1)*r-o}),i++),i++;let a=!1;if(e.endsBy)a=e.until&&s.isBefore(e.until);else{const t=e.count;t>0&&t===Math.floor(t)&&(a=i<=e.count)}return a?s.toDate():null}getNextEventForWeeklyRepeat(e,t){var r;if(!e||C.CalendarRecurFrequency.Weekly!==e.freq)return null;const n=null!==(r=e.interval)&&void 0!==r?r:1;if(Number.isNaN(Number(n))||n!==Math.floor(n)||n<1||n>100)return null;const s=h(e.originalStart),o=h(t);o.hours(s.hours()).minutes(s.minutes()).seconds(s.seconds()).milliseconds(s.milliseconds());const i=h(e.until),a=e.byWeekDay;let l=[],u=!1;a&&a.forEach((t=>{const r=h(s.days(t).toDate());o.diff(r,"days")<=0?l.push(s.toDate()):this.getNextEventDatesForWeeklyInterval(r,e,l)})),l=l.sort(((e,t)=>e.valueOf()-t.valueOf()));const d=l.find((e=>h(e)>=o));if(e.endsBy)u=e.until&&h(d)<i;else{const t=e.count;t>0&&t===Math.floor(t)&&a&&(u=a.length<=t)}return u?d:null}getNextEventDatesForWeeklyInterval(e,t,r){if(r.push(e.toDate()),t.endsBy)for(;e.add({days:7*t.interval})<h(t.until);)r.push(e.toDate());else for(let n=1;n<t.count;n++)e.add({days:7*t.interval}),r.push(e.toDate())}getNextEventForMonthlyRepeat(e,t){if(!e||C.CalendarRecurFrequency.Monthly!==e.freq)return null;const r=e.monthRepeatBy?this.getNextEventForByMonthDayRepeat(e,t):this.getNextEventForBySetPosRepeat(e,t);if(!r)return null;const n=e.monthRepeatBy?this.getNextEventForByMonthDayRepeat(e,e.originalStart):this.getNextEventForBySetPosRepeat(e,e.originalStart);if(!n)return null;let s=!1;if(e.endsBy)s=e.until&&r.isBefore(e.until);else{const t=e.count;let o=e.interval;if(null==o&&(o=1),Number.isNaN(Number(o))||o!==Math.floor(o)||o<1||o>100)return null;t>0&&t===Math.floor(t)&&(s=e.monthRepeatBy&&e.byMonthDay>28?this.isWithinOccurrences(n,r,e.byMonthDay,t,o):r.diff(n,"months")<(t-1)*o+1)}return s?r.toDate():null}getNextEventForByMonthDayRepeat(e,t){const r=e.byMonthDay;if(Number.isNaN(Number(r))||r!==Math.floor(r)||r<=0||r>31)return null;const n=e.interval||1;if(Number.isNaN(Number(n))||n!==Math.floor(n))return null;const s=h(e.originalStart);let o=h(t);o.hours(s.hours()).minutes(s.minutes()).seconds(s.seconds()).milliseconds(s.milliseconds());const i=o.date();o.date(1),i>r&&o.add({months:1});const a=s.clone().date(1),l=o.diff(a,"months"),u=Math.floor(l/n);l<=0?o=s:l!==n*u&&o.add({months:(u+1)*n-l});for(let e=0;e<6;e++){if(o.clone().endOf("month").date()>=r)return o.date(r);o.add({months:n})}return null}getNextEventForBySetPosRepeat(e,t){const r=m.g.RecurWeekDay.parse(e.byDay),n=e.bySetPos;if(!r||Number.isNaN(Number(n))||n!==Math.floor(n)||0===n||n<-1||n>4)return null;const s=h(e.originalStart),o=h(t),i=o.date();let a,l;return o.date(1).hours(s.hours()).minutes(s.minutes()).seconds(s.seconds()).milliseconds(s.milliseconds()),n>0?(a=o.day(),l=r.dayOfWeek-a,l<0&&(l+=7),l+=7*(n-1),o.add({days:l})):(o.add({months:1}),a=o.day(),l=r.dayOfWeek-a,l>=0&&(l-=7),o.add({days:l})),o.date()>=i?o:this.getNextEventForBySetPosRepeat(e,o.date(1).add({months:1}).toDate())}isWithinOccurrences(e,t,r,n,s){if(e.isSame(t,"day")&&n>=1)return!0;let o=1;const i=e.clone().date(1);for(;o<n;){if(i.add({months:s}).endOf("month"),i.date()>=r&&(o++,i.date(r),!i.isBefore(t,"day")))return!0;i.date(1)}return!1}getSampleDateForDayOfWeek(e){return Number.isNaN(Number(e))||e!==Math.floor(e)||e<0||e>6?null:new Date(2015,3,5+e)}mixinMetadataToCalendarItems(e,t){const r={};e.forEach((e=>{let t;t=e.calendarId===C.KnownCalendarIdentifier.Personal?e.recurRules&&C.CalendarItemRepeatRuleType.OfficeHours===e.recurRules.repeatRuleType?S.OfficeHoursForAllCourses:e.recurRules&&C.CalendarItemRepeatRuleType.ExternalCourseSchedule===e.recurRules.repeatRuleType?S.ExternalCourse:S.Personal:e.calendarId===C.KnownCalendarIdentifier.Institution?S.Institution:S.Course,r[t]=r[t]||[],r[t].push(e)}));const n=[];n.push(this.localize.loadBundle("components/services/calendar").then((()=>{const e=r[S.OfficeHoursForAllCourses];e&&e.forEach((e=>{e.ui.calendarName=this.localize.translateSync({locale:t,key:"components.services.calendar.allCourses"})}));const n=r[S.Personal];n&&n.forEach((e=>{e.ui.calendarName=this.localize.translateSync({locale:t,key:"components.services.calendar.personal"})}));const s=r[S.Institution];s&&s.forEach((e=>{e.ui.calendarName=this.localize.translateSync({locale:t,key:"components.services.calendar.institution"})}))})));const s=r[S.Course];s&&s.forEach((e=>{e.calendarNameLocalizable&&e.calendarNameLocalizable.rawValue&&(e.ui.calendarName=e.calendarNameLocalizable.rawValue,e.ui.linkType=m.g.MetadataOnCalendarItemCardLinkType.Course)}));const o=r[S.ExternalCourse];return o&&n.push(this.batchService.performBatch((()=>this.$q.all(o.map((e=>this.ExternalCourseModel.$new(e.recurRules.repeatRuleExternalCourseId).$fetch().$asPromise()))))).then((e=>{e.forEach((e=>{o.forEach((t=>{t.ui.calendarName=e.title,t.ui.linkType=m.g.MetadataOnCalendarItemCardLinkType.External,t.ui.externalCourseUrl=e.url}))}))}))),this.$q.all(n)}calculateDateToPersist(e,t,r){if(e&&h(t).isSame(r,"day"))return t;if(e){const e=h(r).clone().toDate();return e.setHours(t.getHours(),t.getMinutes(),t.getSeconds(),t.getMilliseconds()),e}return r}viewDueCalendarItem(e){e&&e.isDueItem()&&this.CourseModel.$new(e.calendarId).$fetch().$then((t=>{var r;if(t.isUltra())t.gradebook.columns.$new(e.itemSourceId).$fetch({expand:"collectExternalSubmissions"}).$then((e=>{if(e.isOffline())this.entitlementService.hasCourseEntitlement(s.GradebookEntitlement.ModifyGradebook,t.id).then((r=>{r&&this.ultraState.goPeekState("gradebook-item.offline",{columnId:e.id,courseId:t.id,gradeitemView:"students"})}));else{const r=w.ScoreProviderHandle.parse(e.scoreProviderHandle.toString());if(r){const n=r.getContentHandlers()[0];this.ltiService.isLTILink(e)?this.ltiService.ltiLaunch({courseId:e.courseId,contentId:e.contentId,linkType:d.f.parse(e.scoreProviderHandle.toString()),linkRefId:e.linkId}):e.isScorm()?this.scormService.scormLaunch({courseId:e.courseId,contentId:e.contentId,showPreLaunchPanel:!0}):this.scoreProviderHelper.openStateRef(n,{isCollectExternalSubmissions:e.isCollectExternalSubmissions(),contentId:e.contentId,courseId:t.id},p.a.GoToState)}}}));else{const n=e.permissions&&e.permissions.edit;(n||(null===(r=e.dynamicCalendarItemProps)||void 0===r?void 0:r.attemptable))&&this.ultraState.goPeekState("course.outline",{courseId:t.id,legacyUrl:n?"/webapps/calendar/launch/modify/_"+e.itemSourceType+"-"+e.itemSourceId:"/webapps/calendar/launch/attempt/_"+e.itemSourceType+"-"+e.itemSourceId})}}))}getCalendarItemIcon(e){if(!e.dynamicCalendarItemProps)return this.$q.when("");const{categoryId:t,handle:r}=e.dynamicCalendarItemProps;return this.categoryService.getOrLoadCategoriesForCourse(e.calendarId).then((e=>{let n="";const s=e.find((e=>e.id===t));return s?n=this.categoryService.getCategoryIcon(s):r&&(n=w.ScoreProviderHandle.parse(r).iconClass),this.$q.when(n)}))}getCalendarItemTitle(e,t){var r;return this.peerReview.isPeerEvaluationItem(null===(r=null==e?void 0:e.dynamicCalendarItemProps)||void 0===r?void 0:r.handle)?this.peerReview.wrapPeerEvaluationItemTitle(e.title,t):null==e?void 0:e.title}}P.$inject=["$q",I.b,o.serviceName,i.b,m.m.serviceName,m.t.serviceName,m.z.serviceName,m.H.serviceName,m.Jb.serviceName,u.b,c.c,p.c,v.d,b.b,g.b,f.c];n.module(y,[I.a,o.moduleName,i.a,m.N,c.b,p.b,v.b,b.a,g.a,f.b]).service(R,P)},"9hUw":function(e,t,r){"use strict";r.d(t,"a",(function(){return y})),r.d(t,"b",(function(){return R}));var n=r("D57K"),s=r("VdDF"),o=r("DN+C"),i=r("Llzl"),a=r("VAMW"),l=r("6fZB"),u=r("IbyE"),d=r("zGdY"),c=r("nsO7"),m=r("9OUN"),h=r("aHpC"),p=r("nmzr"),v=r("TnpK"),b=r("fYJU"),g=r("12mu"),f=r("0JpG"),I=r("Fvsw"),C=r("U50L"),w=r("aPUy");const y="ultra.components.services.assessment.peerReview",R="peerReview";let S=class{constructor(e,t,r,n,s,o,i,a,l,u,d){this.$rootScope=e,this.$ngRedux=t,this.localizeService=r,this.contextUser=n,this.modal=s,this.ultraState=o,this.context=i,this.$q=a,this.courseId=l,this.contentId=u,this.columnId=d,this.reviewableAttemptsOnly=[],this.deletedAttemptsOnly=[],this.hasLoadedReviewableAttempts=!1}initPeerContentObject(){this.subscribeToReduxStore();const{courseId:e,contentId:t,columnId:r}=this,n=[];return this.content||n.push(this.loadContents({courseId:e,contentId:t}).then((()=>this))),this.column||n.push(this.loadGradebookColumn({courseId:e,columnId:r}).then((()=>this))),this.$q.all(n).then((()=>this))}subscribeToReduxStore(){this.unsubscribeFromReduxStore=this.$ngRedux.connect((e=>{var t;const r=this.courseId,n=this.columnId,s=this.contextUser.userId;return{reviewableAttemptsOnly:Object(c.sortBy)(u.select.gradebookAttempt.getReviewableGradebookAttempts(e,r,n,s),["delegatedGraderOrder"]),deletedAttemptsOnly:u.select.gradebookAttempt.getDeletedReviewableGradebookAttempts(e,n),content:u.select.content.getContentById(e,this.contentId),column:u.select.gradebookColumn.getGradebookColumnById(e,n),assessmentHasEnoughSubmissions:null===(t=u.select.assessment.getAssessmentByContentId(e,this.contentId))||void 0===t?void 0:t.hasEnoughPeerSubmissions}}),(e=>Object(m.bindActionCreators)({assignNewAttemptForPeerReview:u.actions.gradebookAttempt.assignNewAttemptForPeerReview,loadGradebookAttemptsByColumnId:u.actions.gradebookAttempt.loadGradebookAttemptsByColumnId,loadGradebookColumn:u.actions.gradebookColumn.loadGradebookColumn,loadContents:u.actions.content.loadContents},e)))(this)}canPeerViewAttempt(e,t){if(!this.peerGrading||!t)return!1;const r=this.reviewableAttempts.some((e=>e.id===t.id)),n=this.contextUser.userId===t.userId;return!!(r||n)}canDelegatedReconcileAttempt(e){return e.delegatedGrading&&e.isUserReconciler(this.contextUser.userId)}canPeerReviewAttempt(e,t){return this.canPeerViewAttempt(e,t)&&t.userId!==this.contextUser.userId&&!this.canDelegatedReconcileAttempt(e)}canPeerAddFeedbackToAttempt(e,t){return this.canPeerReviewAttempt(e,t)&&!t.isReconciled()&&d.AttemptStatus.Completed!==t.status}get completedPeerReviews(){return this.peerGrading?this.reviewableAttempts.filter((e=>d.AttemptStatus.Completed===(null==e?void 0:e.status))).length:0}openNotEnoughStudentSubmissionsModal(){const e=this.$rootScope.$new();e.translateOpts={title:{key:"components.services.peer-review.modal.error-not-enough-submissions.title"}},e.descriptionKey="components.services.peer-review.modal.error-not-enough-submissions.description";const t={scope:e,template:C,resolve:{translations:[f.serviceName,e=>e.loadBundle("components/services/peer-review")]}};this.modal.open(t)}getReviewableAttemptByDelegatedGraderOrder(e){return this.reviewableAttempts.find((t=>t.delegatedGraderOrder===e))}assignNewPeerReview(){if(!this.peerGrading||this.reviewableAttempts.length===this.numOfPeerReviewsToComplete)return this.$q.resolve(null);const e=this.hasDeletedAttempts?this.deletedAttempts[0].delegatedGraderOrder:null;return this.$q.when(this.assignNewAttemptForPeerReview({courseId:this.column.courseId,columnId:this.column.id,userId:this.contextUser.userId})).then((()=>{const t=null!=e?e:this.reviewableAttempts.length-1;return Object(w.a)(this.$rootScope,{listIndex:t,reviewableAttempt:this.reviewableAttempts[t]}),this.reviewableAttempts[t]})).catch((e=>{throw e instanceof u.AssessmentConflictNotEnoughPeerReviews&&this.openNotEnoughStudentSubmissionsModal(),e}))}navigateToPeerReview(e){if(!this.peerGrading)return this.$q.resolve();if(null===this.getReviewableAttemptByDelegatedGraderOrder(e))return this.$q.reject(new Error("Cannot navigate to a row that does not exist"));const t=this.getReviewableAttemptByDelegatedGraderOrder(e),r={courseId:this.column.courseId,columnId:this.column.id,userId:this.contextUser.userId,attemptId:null==t?void 0:t.id,gradeId:null==t?void 0:t.gradeId,initialPeerIndex:e};return this.ultraState.goPeekState(`${p.AssessmentRoutes.ASSESSMENT_PEER_GRADING}`,r)}loadReviewableAttempts(){var e;return!this.peerGrading||this.loadReviewableAttemptsPromise||this.hasLoadedReviewableAttempts?null!==(e=this.loadReviewableAttemptsPromise)&&void 0!==e?e:this.$q.resolve(this):(this.loadReviewableAttemptsPromise=this.$q.when(this.loadGradebookAttemptsByColumnId({courseId:this.column.courseId,columnId:this.column.id,reviewableAttemptsOnly:!0})).then((()=>(this.hasLoadedReviewableAttempts=!0,this))),this.loadReviewableAttemptsPromise)}get reviewableAttempts(){var e;return this.peerGrading&&null!==(e=this.reviewableAttemptsOnly)&&void 0!==e?e:[]}get deletedAttempts(){var e;return this.peerGrading&&null!==(e=this.deletedAttemptsOnly)&&void 0!==e?e:[]}get hasEnoughSubmissionsForPeerAssessment(){var e;return null!==(e=this.assessmentHasEnoughSubmissions)&&void 0!==e&&e}get hasDeletedAttempts(){return this.deletedAttempts.length>0}get numberOfLatePeerReviews(){return this.peerGrading?this.reviewableAttempts.filter((e=>this.isAfterPeerReviewDueDate(e.attemptLastGradedDate)&&d.AttemptStatus.Completed===e.status)).length:null}get numberOfStartedPeerReviews(){if(!this.peerGrading)return null;return this.reviewableAttempts.filter((e=>d.AttemptStatus.NeedsGrading===e.status)).length+this.deletedAttempts.length}get peerGrading(){var e;return!!(null===(e=this.column)||void 0===e?void 0:e.peerGrading)}get numOfPeerReviewsToComplete(){var e;return this.peerGrading?null===(e=this.content.peerSettings)||void 0===e?void 0:e.peerReviewsPerStudent:null}parseCurrentStringToDateAndMemoize(e){return s.a.parseStringToDate(e)}get peerSubmissionDueDate(){return this.peerGrading?this.parseCurrentStringToDateAndMemoize(this.column.dueDate):null}get peerReviewDueDate(){var e;return this.peerGrading?this.parseCurrentStringToDateAndMemoize(null===(e=this.content.peerSettings)||void 0===e?void 0:e.peerReviewDueDate):null}get allowLatePeerReviews(){return!!this.peerGrading&&!!this.content.peerSettings.allowLatePeerReviews}get isPeerGradingConfigured(){return!!this.peerGrading&&(null!=this.numOfPeerReviewsToComplete&&null!=this.peerReviewDueDate)}get isInPeerReviewWindow(){return!this.isAfterPeerReviewDueDate()&&this.isAfterPeerSubmissionDueDate()}get isAfterPeerReviewWindow(){return this.isAfterPeerReviewDueDate()}isAfterPeerReviewDueDate(e){var t;if(!this.peerGrading)return!1;const r=null!==(t=s.a.parseStringToDate(e))&&void 0!==t?t:new Date;return s.a.isWithinDateRange(r,{end:null,start:this.peerReviewDueDate},!1)}isAfterPeerSubmissionDueDate(e){var t;if(!this.peerGrading)return!1;const r=null!==(t=s.a.parseStringToDate(e))&&void 0!==t?t:new Date;return s.a.isWithinDateRange(r,{end:null,start:this.peerSubmissionDueDate},!1)}};Object(n.__decorate)([Object(o.LRUMemoize)()],S.prototype,"parseCurrentStringToDateAndMemoize",null),S=Object(n.__decorate)([Object(n.__param)(0,Object(h.b)("$rootScope")),Object(n.__param)(1,Object(h.b)("$ngRedux")),Object(n.__param)(2,Object(h.b)(f.serviceName)),Object(n.__param)(3,Object(h.b)(b.b)),Object(n.__param)(4,Object(h.b)(g.b)),Object(n.__param)(5,Object(h.b)(v.d)),Object(n.__param)(6,Object(h.b)(I.b)),Object(n.__param)(7,Object(h.b)("$q")),Object(n.__param)(8,Object(h.b)("courseId")),Object(n.__param)(9,Object(h.b)("contentId")),Object(n.__param)(10,Object(h.b)("columnId"))],S);class P{constructor(e){this.service=e,this.key=a.TransitService.PeerReview}getOrCreatePeerContentFromContent(e){return Object(l.a)(this.service.getOrCreatePeerContentFromContent(e))}}let D=class{constructor(e,t,r){this.$injector=e,this.$q=t,this.localizeService=r,this.peerContentMap=new Map,Object(a.registerService)(new P(this))}getPeerContent(e){return this.peerContentMap.get(e)}createPeerContent(e,t,r){const n=this.$injector.instantiate(S,{courseId:e,contentId:t,columnId:r});return this.peerContentMap.set(t,n),n.initPeerContentObject()}getOrCreatePeerContent(e,t,r){const n=this.getPeerContent(t);return n?this.$q.resolve(n):this.createPeerContent(e,t,r)}getDeployedAssessment(e){return(null==e?void 0:e.contentDetail)&&e.getDeployedAssessment()}getOrCreatePeerContentFromContent(e){var t,r;if(!e)return this.$q.resolve(null);const{courseId:n,id:s}=e,o=null===(r=null===(t=this.getDeployedAssessment(e))||void 0===t?void 0:t.gradingColumn)||void 0===r?void 0:r.id;return n&&s&&o?this.getOrCreatePeerContent(n,s,o):this.$q.resolve(null)}getOrCreatePeerContentWithAttemptsFromContent(e){return this.getOrCreatePeerContentFromContent(e).then((e=>null==e?void 0:e.loadReviewableAttempts()))}getOrCreatePeerContentFromColumn(e){if(!e)return this.$q.resolve(null);const{courseId:t,contentId:r,id:n}=e;return t&&r&&n?this.getOrCreatePeerContent(t,r,n):this.$q.resolve(null)}getOrCreatePeerContentWithAttemptsFromColumn(e){return this.getOrCreatePeerContentFromColumn(e).then((e=>null==e?void 0:e.loadReviewableAttempts()))}isPeerEvaluationItem(e){return u.ScoreProviderHandle.PeerEvaluationTest.isEqualTo(e)}wrapPeerEvaluationItemTitle(e,t){return this.localizeService.translateSync({locale:t,key:"components.services.peer-review.peerEvaluationTitleWrapper",params:{itemTitle:e},noWrap:!0,noEscape:!0})}};D=Object(n.__decorate)([Object(n.__param)(0,Object(h.b)("$injector")),Object(n.__param)(1,Object(h.b)("$q")),Object(n.__param)(2,Object(h.b)(f.serviceName))],D);i.module(y,[f.moduleName,b.a,g.a,v.b,I.a]).service(R,D)},U50L:function(e,t){e.exports='<bb-modal id="notification-modal-api-error"\n          class="notification"\n          modal-aria-type="alertdialog"\n          modal-translate-options="translateOpts"\n          analytics-id-tag-prefix="components.services.error-modal.error-not-enough-submissions">\n  <div name="modal-contents">\n    <p bb-translate>{{::descriptionKey}}</p>\n  </div>\n  <button name="modal-footer-button-primary"\n          ng-click="$parent.$dismiss()"\n          class="button js-primary-button"\n          bb-translate\n          analytics-id="components.services.error-modal.dismiss">components.services.error-modal.dismiss</button>\n</bb-modal>\n'},aPUy:function(e,t,r){"use strict";r.d(t,"a",(function(){return s})),r.d(t,"b",(function(){return o}));const n="peer-review-assigned";function s(e,t){return e.$broadcast(n,t.listIndex,t.reviewableAttempt)}function o(e,t){return e.$on(n,t)}}}]);