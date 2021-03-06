﻿var bgGeo = window.BackgroundGeolocation;

if (bgGeo) {
    //This callback will be executed every time a geolocation is recorded in the background. 
    var callbackFn = function (location, taskId) {
        var coords = location.coords;
        var lat = coords.latitude;
        var lng = coords.longitude;
        console.log('- Location: ', JSON.stringify(location));
        DevExpress.ui.notify({ closeOnClick: true, message: JSON.stringify(location), type: 'error' }, 'error', 5000);

        // Must signal completion of your callbackFn. 
        bgGeo.finish(taskId);
    };

    // This callback will be executed if a location-error occurs.  Eg: this will be called if user disables location-services. 
    var failureFn = function (errorCode) {
        console.warn('- BackgroundGeoLocation error: ', errorCode);
        DevExpress.ui.notify({ closeOnClick: true, message: scanError, type: 'error' }, 'error', 5000); 
    };

    // Listen to location events & errors. 
    bgGeo.on('location', callbackFn, failureFn);

    // Fired whenever state changes from moving->stationary or vice-versa. 
    bgGeo.on('motionchange', function (isMoving) {
        console.log('- onMotionChange: ', isMoving);
    });

    // Fired whenever a geofence transition occurs. 
    bgGeo.on('geofence', function (geofence) {
        console.log('- onGeofence: ', geofence.identifier, geofence.location);
    });

    // Fired whenever an HTTP response is received from your server. 
    bgGeo.on('http', function (response) {
        console.log('http success: ', response.responseText);
    }, function (response) {
        console.log('http failure: ', response);
    });

    var deviceInfo = {
        model: device.model,
        platform: device.platform,
        uuid: device.uuid,
        version: device.version,
        manufacturer: device.manufacturer,
        framework: 'Cordova'
    };

    var sendLocationUrl = $global.ServiceUrl.replace('DataService.svc', 'GeolocationProcessingService.svc') + '/AddLocation';

    // BackgroundGeoLocation is highly configurable. 
    bgGeo.configure({
        // Geolocation config 
        desiredAccuracy: 0,
        distanceFilter: 10,
        stationaryRadius: 25,

        // Activity Recognition config 
        activityRecognitionInterval: 10000,
        stopTimeout: 5,

        // Application config 
        debug: true,  // <-- Debug sounds & notifications. 
        stopOnTerminate: false,
        startOnBoot: true,

        // HTTP / SQLite config  
        url: sendLocationUrl,
        method: 'POST',
        autoSync: true,
        maxDaysToPersist: 3,
        params: {
            device: deviceInfo
        },
    }, function (state) {
        // This callback is executed when the plugin is ready to use. 
        console.log('BackgroundGeolocation ready: ', state);
        if (!state.enabled) {
            bgGeo.start();
        }
    });
}