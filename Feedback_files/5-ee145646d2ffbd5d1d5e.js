(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{LdA1:function(t,e,i){"use strict";i.d(e,"a",(function(){return b}));var s=i("D57K"),n=(i("KCTV"),i("Llzl")),a=i("wgY5"),l=i("IbyE"),o=i("0JpG"),r=i("Fvsw"),d=i("hqh6"),c=i("gZZS"),m=i("aHpC"),h=i("e6jQ"),u=i("q0yA");const b="ultra.directives.contentVisibilityRulesOptions";let p=class{constructor(t,e,i,s,n,a){this.$ngRedux=t,this.scope=e,this.element=i,this.form=s,this.context=n,this.bbLocalize=a,this.id=Object(h.a)(),this.scope.contentVisibilityRulesOptions=this,this.dateFrom=s.dateFrom,this.timeFrom=s.timeFrom,this.dateUntil=s.dateUntil,this.timeUntil=s.timeUntil,this.subscribeToReduxChanges();const l=this.bbLocalize.getAppLocaleISO();this.getLocaleSettings&&this.getLocaleSettings({locale:l}),this.startDateSelect=!!this.scope.startDate,this.untilDateSelect=!!this.scope.endDate,this.setWatchers(),this.setValidators();const o=Object(h.a)();this.dateFromContainer=`${o}-date-from-container`,this.dateUntilContainer=`${o}-date-until-container`}shouldFocus(t){return void 0!==this.scope.dateFieldFocus&&"undefined"!==this.scope.dateFieldFocus&&this.scope.dateFieldFocus===t}handleCheckClick(t){const e=this.startDateSelect,i=this.untilDateSelect;this.scope.$emit("date-selection-changed",e,i),this.scope.isAllowedEmpty?e||i||this.form.dateFrom.$setValidity("startAndOrEndDate",!0):e||i?this.form.dateFrom.$setValidity("startAndOrEndDate",!0):(this.form.dateFrom.$setTouched(),this.form.dateFrom.$setValidity("startAndOrEndDate",!1)),this.form.dateUntil.$validate(),this.form.timeUntil.$validate(),this.form.dateFrom.$validate(),this.form.timeFrom.$validate(),"from-check"===t&&e?(this.scope.startDate=this.context.getServerTime(),this.scope.startTime=this.context.getServerTime()):"until-check"===t&&i&&this.setInitialEndDateTime(),this.updateStartAndEndTime()}setInitialEndDateTime(){var t;let e;e=this.scope.subsequentDueDate||this.scope.dueDate?this.addDays(new Date(null!==(t=this.scope.subsequentDueDate)&&void 0!==t?t:this.scope.dueDate),1):this.addDays(this.scope.startDate>this.context.getServerTime()?this.scope.startDate:this.context.getServerTime(),1),this.scope.endDate=e,this.scope.endTime=e}addDays(t,e){return new Date(t.getTime()+24*e*60*60*1e3)}setErrorString(t,e){const i=(e?"start":"end")+(t?"DateValidationError":"TimeValidationError");return this.bbLocalize.translateSync({locale:this.bbLocalize.getLocale(this.scope),key:"components.directives.content-visibility."+i})}isDateRequired(t){const e=this.element.find("#from-check-"+this.id).prop("checked"),i=this.element.find("#until-check-"+this.id).prop("checked");return!!(t?e:i)}setWatchers(){this.scope.$watch("startDate",(t=>{this.isValidDate(t)&&this.scope.startTime!==t&&(this.scope.startTime=t),this.doValidation(),this.onChange()})),this.scope.$watch("startTime",(t=>{this.isValidDate(t)&&this.scope.startDate!==t&&(this.scope.startDate=t),this.doValidation(),this.onChange()})),this.scope.$watch("endDate",(t=>{this.isValidDate(t)&&this.scope.endTime!==t&&(this.scope.endTime=t),this.doValidation(),this.onChange()})),this.scope.$watch("endTime",(t=>{this.isValidDate(t)&&this.scope.endDate!==t&&(this.scope.endDate=t),this.doValidation(),this.onChange()})),this.scope.$watch("startDateSelect",(t=>{this.scope.isAllowedEmpty&&(this.startDateSelect=t),!1===t&&this.scope.isAllowedEmpty&&(this.scope.startTime=null,this.scope.startDate=null)})),this.scope.$watch("untilDateSelect",(t=>{this.scope.isAllowedEmpty&&(this.untilDateSelect=t),!1===t&&this.scope.isAllowedEmpty&&(this.scope.endTime=null,this.scope.endDate=null)}))}setValidators(){const t=this.scope.$watch("form.dateFrom",((e,i)=>{this.form.dateFrom&&(this.scope.isAllowedEmpty?this.form.dateFrom.$validators.required=t=>!this.startDateSelect||this.startDateSelect&&null!=t||this.scope.isAllowedEmpty&&null===t:this.form.dateFrom.$validators.required=t=>!this.startDateSelect||this.startDateSelect&&null!=t,this.form.timeFrom.$validators.required=t=>!!(!this.startDateSelect||this.startDateSelect&&this.timeFrom.$viewValue),this.scope.isAllowedEmpty?this.form.dateUntil.$validators.required=t=>!this.untilDateSelect||this.untilDateSelect&&null!=t||this.scope.isAllowedEmpty&&null===t:this.form.dateUntil.$validators.required=t=>!this.untilDateSelect||this.untilDateSelect&&null!=t,this.form.timeUntil.$validators.required=()=>!!(!this.untilDateSelect||this.untilDateSelect&&this.timeUntil.$viewValue),this.form.dateFrom.$validators.untilAfterStart=t=>(this.form.dateUntil.$setTouched(),this.form.dateUntil.$validate(),!0),this.form.dateFrom.$validators.startBeforeDueDate=t=>!this.startDateSelect||t&&this.isDueDateAfterStartDate(t),this.form.dateUntil.$validators.untilAfterStart=t=>!this.untilDateSelect||!this.startDateSelect||!this.isStartDateValid()||t&&this.isValidDateOrder(this.scope.startDate,t),this.scope.subsequentDueDate?this.form.dateUntil.$validators.subsequentDueDate=t=>!this.untilDateSelect||t&&this.isDueDateBeforeEndDate(t):this.form.dateUntil.$validators.untilDueDate=t=>!this.untilDateSelect||t&&this.isDueDateBeforeEndDate(t),this.element.find(".restricted-form").focusout((()=>{this.doValidation()})),this.onChange(),t())}))}doValidation(){this.form.$setDirty(),this.form.dateFrom.$validate(),this.form.timeFrom.$validate(),this.form.dateUntil.$validate(),this.form.timeUntil.$validate()}onChange(){this.scope.onchangeFunc&&this.scope.onchangeFunc()}onBlur(){this.scope.onblurFunc&&this.scope.onblurFunc()}noDateErrorsExist(){return this.isStartDateValid()&&this.isEndDateValid()}isStartDateError(){return this.startDateSelect&&!this.scope.startDate}isStartAndOrEndDateError(){return!this.startDateSelect&&!this.untilDateSelect&&!this.scope.endDate}isStartDateValid(){return!this.isStartDateError()&&!this.isStartAndOrEndDateError()&&this.isDueDateAfterStartDate(this.scope.startDate)}isEndDateError(){return this.untilDateSelect&&!this.scope.endDate}isEndDateBeforeError(){return this.untilDateSelect&&this.scope.endDate&&this.startDateSelect&&!this.isValidDateOrder(this.scope.startDate,this.scope.endDate)}isEndDateValid(){return!this.isEndDateError()&&!this.isEndDateBeforeError()&&!this.isDueDateBeforeEndDate(this.scope.endDate)}isValidDate(t){return t&&!Number.isNaN(t.getTime())}updateStartAndEndTime(){this.startDateSelect||(this.scope.startDate=null,this.scope.startTime=null),this.untilDateSelect||(this.scope.endDate=null,this.scope.endTime=null),this.noDateErrorsExist()&&(this.onChange(),this.onBlur())}isValidDateOrder(t,e){if(null==t||null==e)return!1;const i=new Date(t.getTime()),s=new Date(e.getTime());return i.setSeconds(0,0),s.setSeconds(0,0),a(s).isAfter(i)}isDueDateBeforeEndDate(t){return null==this.scope.dueDate||(this.scope.subsequentDueDate?a(this.scope.subsequentDueDate).isBefore(t):a(this.scope.dueDate).isBefore(t))}isDueDateAfterStartDate(t){return null==this.scope.dueDate||a(this.scope.dueDate).isAfter(t)}subscribeToReduxChanges(){const t=this.$ngRedux.connect((t=>({localeSettings:l.select.locale.getLocaleSettings(t,this.bbLocalize.getAppLocaleISO())})),(t=>({getLocaleSettings:e=>t(l.actions.locale.getLocaleSettings(e))})))(this);this.scope.$on("$destroy",t)}get timeDateFromDisabled(){var t;return!this.startDateSelect||(null===(t=this.scope)||void 0===t?void 0:t.isReadOnlyMode())}get timeDateUntilDisabled(){var t;return!this.untilDateSelect||(null===(t=this.scope)||void 0===t?void 0:t.isReadOnlyMode())}};p=Object(s.__decorate)([Object(s.__param)(0,Object(m.b)("$ngRedux")),Object(s.__param)(1,Object(m.b)("scope")),Object(s.__param)(2,Object(m.b)("element")),Object(s.__param)(3,Object(m.b)("form")),Object(s.__param)(4,Object(m.b)(r.b)),Object(s.__param)(5,Object(m.b)(o.serviceName))],p);class D{constructor(t){this.$injector=t,this.restrict="E",this.require="^form",this.scope={startDate:"=?",startTime:"=?",startDateSelect:"=?",endDate:"=?",endTime:"=?",untilDateSelect:"=?",onblurFunc:"&?",onchangeFunc:"&?",isReadOnlyMode:"&?",dateFieldFocus:"@?",isAllowedEmpty:"=?",dueDate:"<",subsequentDueDate:"<?"},this.template=u,this.transclude={customStartDateAndTimeValidationMessages:"?bbContentVisibilityCustomStartDateAndTimeValidationMessages",customEndDateAndTimeValidationMessages:"?bbContentVisibilityCustomEndDateAndTimeValidationMessages"},this.link=(t,e,i,s)=>{t.contentVisibilityRulesOptions=this.$injector.instantiate(p,{scope:t,element:e,form:s})}}}D.$inject=["$injector"],n.module(b,[r.a,d.a,c.a]).directive("bbContentVisibilityRulesOptions",["$injector",t=>t.instantiate(D)])},gZZS:function(t,e,i){"use strict";i.d(e,"a",(function(){return h}));var s=i("D57K"),n=i("ERkP"),a=i("7nmT"),l=i("AuQm"),o=i("yC9S"),r=i("aHpC"),d=i("4JTD"),c=i("0JpG"),m=i("tN4z");const h="ultra.components.directives.timePicker",u=angular.module(h,[c.moduleName]);let b=class{constructor(t,e,i){this.$scope=t,this.$element=e,this.localizeService=i,this.isValid=!0,this.onChange=(t,e)=>{e?(this.onViewValueCleared&&this.onViewValueCleared(this.ngModel.$name,this.ngModel.$isEmpty(t)),this.ngModel.$setViewValue(t),this.render()):this.ngModel.$setPristine()},this.onValidate=t=>{this.isValid=t,this.invalidValidationKey&&this.ngModel.$setValidity(this.invalidValidationKey,t),this.render()},this.render=()=>{const{analyticsId:t,errorEmptyMessage:e,disabled:i,readonly:s,placeholder:o,ngModel:r}=this,c={onChangeValue:t=>this.onChange(t,t!==r.$viewValue),analyticsId:t,value:r.$viewValue,onValidateCallback:this.onValidate,isValueValid:this.isValid,errorFormatMessage:this.errorFormatMessage,errorEmptyMessage:e,disabled:i,readonly:s,placeholder:o,ariaLabel:this.$element.attr("aria-label")},{locale:h,babelfishInstance:u,babelfishFormatter:b,isRtl:p}=this.localizeService.getReactBabelfishParams(this.$scope);a.render(n.createElement(d.a,{babelfishFormatInstance:b,babelfishInstance:u,locale:h,isRtl:p},n.createElement(m.AnalyticsJssThemeProvider,{isRtl:this.localizeService.isRTL(this.$scope)},n.createElement(l.TimePicker,{...c}))),this.$element[0])}}$postLink(){this.render()}$onChanges(){this.render()}$onDestroy(){a.unmountComponentAtNode(this.$element[0])}$onInit(){this.ngModel.$render=()=>this.render()}};b=Object(s.__decorate)([Object(o.a)({module:u,componentName:"bbTimePicker",bindings:{analyticsId:"@",errorFormatMessage:"@?",errorEmptyMessage:"@?",disabled:"<?",readonly:"<?",name:"@?",onViewValueCleared:"<?",placeholder:"@?",invalidValidationKey:"@?"},require:{ngModel:"ngModel"}}),Object(s.__param)(0,Object(r.b)("$scope")),Object(s.__param)(1,Object(r.b)("$element")),Object(s.__param)(2,Object(r.b)(c.serviceName))],b)},q0yA:function(t,e){t.exports='<div bb-foundation-defer bb-load-bundle="components/directives/content-visibility" dev-suppress-hide="true">\n  <div class="panel-block restricted-form content-visibility-rules-container">\n    <div class="row collapse">\n      <div class="columns small-12 js-from-checkbox">\n        <input type="checkbox"\n               ng-model="contentVisibilityRulesOptions.startDateSelect"\n               class="from-check"\n               id="from-check-{{contentVisibilityRulesOptions.id}}"\n               name="fromCheck"\n               ng-change="contentVisibilityRulesOptions.handleCheckClick(\'from-check\')"\n               ng-show="!isReadOnlyMode()"\n               analytics-id="content.visibility.rules.options.startDateSelect.input.checkbox"/>\n        <label class="date-time-label" for="from-check-{{contentVisibilityRulesOptions.id}}" ng-show="!isReadOnlyMode()"\n          bb-translate>components.directives.content-visibility.startDate</label>\n        <label class="date-time-label"\n          ng-show="isReadOnlyMode() && (contentVisibilityRulesOptions.startDateSelect || isAllowedEmpty)"\n          bb-translate>\n          components.directives.content-visibility.startDate\n        </label>\n      </div>\n      <div\n        ng-show="contentVisibilityRulesOptions.startDateSelect || !isReadOnlyMode() || (isAllowedEmpty && isReadOnlyMode())"\n        class="columns small-12">\n        <div class="row collapse date-time-inputs" ng-class="{\'read-only-fields\': isReadOnlyMode()}">\n          <div class="columns small-6 js-date-input-container {{contentVisibilityRulesOptions.dateFromContainer}}"\n            ng-class="{\'read-only-form-field\': isReadOnlyMode(), \'form-field-disabled\': contentVisibilityRulesOptions.timeDateFromDisabled}">\n            \x3c!-- htmlhint:analytics-id:disable --\x3e\n            <input id="date-from"\n                   bb-date-picker\n                   orientation="auto left"\n                   container=".{{contentVisibilityRulesOptions.dateFromContainer}}"\n                   ng-model="startDate" name="dateFrom" aria-describedby="date-from-error"\n                   ng-model-options="{ allowInvalid: true }"\n                   first-day-of-week="contentVisibilityRulesOptions.localeSettings.calendar.firstDayOfWeek"\n                   bb-validate-date\n                   ng-class="{\'read-only-field\': isReadOnlyMode()}"\n                   ng-attr-bb-focus="contentVisibilityRulesOptions.shouldFocus(\'start-date\')"\n                   ng-blur="contentVisibilityRulesOptions.updateStartAndEndTime()"\n                   ng-required="contentVisibilityRulesOptions.isDateRequired(true)"\n                   ng-change="contentVisibilityRulesOptions.updateStartAndEndTime()"\n                   ng-disabled="contentVisibilityRulesOptions.timeDateFromDisabled"\n                   bb-translate-attrs="{\'aria-label\': \'components.directives.content-visibility.startDateAria\',\n                       \'placeholder\': \'components.directives.content-visibility.datePlaceholder\'}"\n                   analytics-id="content.visibility.rules.options.startDate.input.text"/>\n              \x3c!-- htmlhint:analytics-id:enable --\x3e\n          </div>\n          <div class="columns small-6 input group"\n            ng-class="{\'read-only-form-field\': isReadOnlyMode(), \'form-field-disabled\': contentVisibilityRulesOptions.timeDateFromDisabled}">\n            <bb-time-picker name="timeFrom"\n                            id="time-from"\n                            aria-describedby="time-from-error"\n                            invalid-validation-key="time"\n                            analytics-id="content.visibility.rules.options.startDate.input.text"\n                            ng-model="startTime"\n                            disabled="contentVisibilityRulesOptions.timeDateFromDisabled"\n                            bb-translate-attrs="{\'aria-label\': \'components.directives.content-visibility.startTimeAria\',\n                                \'placeholder\': \'components.directives.content-visibility.timePlaceholder\'}"\n            ></bb-time-picker>\n          </div>\n        </div>\n      </div>\n    </div>\n    <div class="row collapse">\n      <div class="columns small-12">\n        <div bb-validation-messages for="dateFrom" class="row collapse" id="date-from-error">\n            <span ng-message="required">\n                <bb-translate>components.directives.content-visibility.startDateError</bb-translate>\n              </span>\n          <span ng-message="date" bb-translate>\n            {{::contentVisibilityRulesOptions.setErrorString(true, true)}}\n          </span>\n          <span ng-message="startAndOrEndDate">\n            <bb-translate>components.directives.content-visibility.startAndOrEndDateError</bb-translate>\n          </span>\n          <span ng-message="startAndOrEndDateOnsubmit">\n            <bb-translate>components.directives.content-visibility.startAndOrEndDateError</bb-translate>\n          </span>\n          <span ng-message="startBeforeDueDate">\n            <bb-translate>components.directives.content-visibility.dueDateBeforeError</bb-translate>\n          </span>\n          <span ng-transclude="customStartDateAndTimeValidationMessages"></span>\n        </div>\n      </div>\n      <div bb-validation-messages for="timeFrom" class="row collapse" id="time-from-error">\n          <span ng-message="required">\n              <bb-translate>components.directives.content-visibility.startTimeError</bb-translate>\n          </span>\n        <span ng-message="time">\n            {{::contentVisibilityRulesOptions.setErrorString(false, true)}}\n        </span>\n        <span ng-message="required">\n          <bb-translate>components.directives.content-visibility.startTimeError</bb-translate>\n        </span>\n        <span ng-transclude="customStartDateAndTimeValidationMessages"></span>\n      </div>\n    </div>\n    <div class="row collapse">\n      <div class="columns small-12 js-until-checkbox">\n        <input type="checkbox"\n               ng-model="contentVisibilityRulesOptions.untilDateSelect"\n               class="until-check"\n               id="until-check-{{contentVisibilityRulesOptions.id}}"\n               name="untilCheck"\n               ng-change="contentVisibilityRulesOptions.handleCheckClick(\'until-check\')"\n               ng-show="!isReadOnlyMode()"\n               analytics-id="content.visibility.rules.options.untilDate.input.checkbox"/>\n        <label class="date-time-label" for="until-check-{{contentVisibilityRulesOptions.id}}"\n          ng-show="!isReadOnlyMode()" bb-translate>components.directives.content-visibility.endDate</label>\n        <label class="date-time-label"\n          ng-show="isReadOnlyMode() && (contentVisibilityRulesOptions.untilDateSelect || isAllowedEmpty)" bb-translate>\n          components.directives.content-visibility.endDate\n        </label>\n      </div>\n      <div\n        ng-show="contentVisibilityRulesOptions.untilDateSelect || !isReadOnlyMode() || (isAllowedEmpty && isReadOnlyMode())"\n        class="columns small-12">\n        <div class="row collapse date-time-inputs" ng-class="{\'read-only-fields\': isReadOnlyMode()}">\n          <div class="columns small-6 js-date-input-container {{contentVisibilityRulesOptions.dateUntilContainer}}"\n            ng-class="{\'read-only-form-field\': isReadOnlyMode(), \'form-field-disabled\': contentVisibilityRulesOptions.timeDateUntilDisabled}">\n            \x3c!-- htmlhint:analytics-id:disable --\x3e\n            <input id="date-until"\n                   bb-date-picker\n                   orientation="auto left"\n                   container=".{{contentVisibilityRulesOptions.dateUntilContainer}}"\n                   ng-model="endDate"\n                   ng-model-options="{ allowInvalid: true }"\n                   first-day-of-week="contentVisibilityRulesOptions.localeSettings.calendar.firstDayOfWeek"\n                   bb-validate-date\n                   name="dateUntil"\n                   aria-describedby="date-until-error" ng-class="{\'read-only-field\': isReadOnlyMode()}"\n                   ng-attr-bb-focus="contentVisibilityRulesOptions.shouldFocus(\'end-date\')"\n                   ng-blur="contentVisibilityRulesOptions.updateStartAndEndTime()"\n                   ng-change="contentVisibilityRulesOptions.updateStartAndEndTime()"\n                   ng-required="contentVisibilityRulesOptions.isDateRequired(false)"\n                   ng-disabled="contentVisibilityRulesOptions.timeDateUntilDisabled"\n                   bb-translate-attrs="{\'aria-label\': \'components.directives.content-visibility.endDateAria\',\n                       \'placeholder\': \'components.directives.content-visibility.datePlaceholder\'}"\n                   analytics-id="content.visiblity.rules.options.endDate.input.input.text"/>\n            \x3c!-- htmlhint:analytics-id:enable --\x3e\n          </div>\n          <div class="columns small-6 input group"\n            ng-class="{\'read-only-form-field\': isReadOnlyMode(), \'form-field-disabled\': contentVisibilityRulesOptions.timeDateUntilDisabled}">\n            <bb-time-picker name="timeUntil"\n                            id="time-until"\n                            aria-describedby="time-until-error"\n                            analytics-id="content.visibility.rules.options.endDate.input.text"\n                            ng-model="endTime"\n                            disabled="contentVisibilityRulesOptions.timeDateUntilDisabled"\n                            invalid-validation-key="time"\n                            bb-translate-attrs="{\'aria-label\': \'components.directives.content-visibility.endTimeAria\',\n                                \'placeholder\': \'components.directives.content-visibility.timePlaceholder\'}"\n            ></bb-time-picker>\n          </div>\n        </div>\n      </div>\n    </div>\n    <div class="row collapse">\n      <div class="columns small-12">\n        <div bb-validation-messages for="dateUntil" class="row collapse" id="date-until-error">\n          <span ng-message="required">\n            <bb-translate>components.directives.content-visibility.endDateError</bb-translate>\n          </span>\n          <span ng-message="date">\n            {{::contentVisibilityRulesOptions.setErrorString(true, false)}}\n          </span>\n          <span ng-message="requiredOnsubmit">\n            <bb-translate>components.directives.content-visibility.endDateError</bb-translate>\n          </span>\n          <span ng-message="untilAfterStart">\n            <bb-translate>components.directives.content-visibility.endDateBeforeError</bb-translate>\n          </span>\n          <span ng-message="untilAfterStartOnsubmit">\n            <bb-translate>components.directives.content-visibility.endDateBeforeError</bb-translate>\n          </span>\n          <span ng-message="untilDueDate">\n            <bb-translate>components.directives.content-visibility.dueDateAfterError</bb-translate>\n          </span>\n          <span ng-message="subsequentDueDate">\n            <bb-translate>components.directives.content-visibility.subsequentDueDateAfterError</bb-translate>\n          </span>\n          <span ng-transclude="customEndDateAndTimeValidationMessages"></span>\n        </div>\n      </div>\n      <div bb-validation-messages for="timeUntil" class="row collapse" id="time-until-error">\n        <span ng-message="time">\n           {{::contentVisibilityRulesOptions.setErrorString(false, false)}}\n        </span>\n        <span ng-message="required">\n          <bb-translate>components.directives.content-visibility.endTimeError</bb-translate>\n        </span>\n        <span ng-transclude="customEndDateAndTimeValidationMessages"></span>\n      </div>\n    </div>\n  </div>\n</div>\n'}}]);