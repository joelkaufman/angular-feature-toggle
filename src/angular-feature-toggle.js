(function() {
  'use strict';
  angular.module('featureToggle', [])
    .config(initFeatures)
    .config(overrideUIRouterStateFn)
    .provider('featureToggle', featureToggle)
    .directive('feature', showIfFeature)
    .directive('hideIfFeature', hideIfFeature);


  function initFeatures(featureToggleProvider) {
    if(! window.angularFeaturesConf){
      window.console.warn('could not detect features');
      return false;
    }

    featureToggleProvider.init(window.angularFeaturesConf);
  }

///////////////
// config ui router
  function overrideUIRouterStateFn($injector, featureToggleProvider) {
    try {
      var $stateProvider = $injector.get('$stateProvider');

      // the app uses ui.router, configure it
      var oldStateFn = $stateProvider.state;
      $stateProvider.state = function(name, conf) {
        // enable state if feature version is satisfied or undefined
        if (featureToggleProvider.isEnabled(conf.feature)) {
          try {
            return oldStateFn.call($stateProvider, name, conf);
          }
          catch(e) {
            window.console && window.console.warn('state ' + name + ' is already defined'); // jshint ignore:line
            return $stateProvider;
          }
        }
        // else return stateProvider for further state declaration chaining
        else {
          return $stateProvider;
        }
      };
    } catch(e) {
        // the app doesnt use ui.router - silent failure
    }
  }


// factory
  function featureToggle() {

    var features = [];

    var service = {
      init: init,
      features: features,
      isEnabled: isEnabled,
      $get: featureToggleFactory
    };
    return service;

    ////////////

    function init(featuresArr) {
      features = featuresArr;
    }


    function isEnabled(feature) {
      return features.indexOf(feature) != -1;
    }

    function featureToggleFactory() {
      return {
        isEnabled: isEnabled
      };
    }
  }


  function showIfFeature(featureToggle) {
    var ddo = {
      restrict: 'AE',
      transclude: 'element',
      terminal: true,
      priority: 999,
      link: link
    };

    return ddo;

    function link(scope, element, attrs, ctrl, $transclude) {
      var featureEl, childScope, featureName = attrs.feature;

      if (featureToggle.isEnabled(featureName)) {
          childScope = scope.$new();
          $transclude(childScope, function(clone) {
              featureEl = clone;
              element.after(featureEl).remove();
          });
      } else {
          if(childScope) {
              childScope.$destroy();
              childScope = null;
          }
          if(featureEl) {
              featureEl.after(element).remove();
              featureEl = null;
          }
      }
    }
  }

  function hideIfFeature(featureToggle) {
    var ddo = {
      restrict: 'AE',
      transclude: 'element',
      terminal: true,
      priority: 999,
      link: link
    };

    return ddo;

    function link(scope, element, attrs, ctrl, $transclude) {
      var featureEl, childScope, featureName = attrs.hideIfFeature;

      if (featureToggle.isEnabled(featureName)) {
        if(childScope) {
            childScope.$destroy();
            childScope = null;
        }
        if(featureEl) {
            featureEl.after(element).remove();
            featureEl = null;
        }
      } else {
        childScope = scope.$new();
        $transclude(childScope, function(clone) {
            featureEl = clone;
            element.after(featureEl).remove();
        });
      }
    }
  }
})();
