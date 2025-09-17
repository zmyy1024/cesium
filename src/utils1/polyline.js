import * as Cesium from 'cesium';
export default function polylineCommunication (viewer, ntities1,entities2,width){
    return viewer.entities.add({
        polyline: {
          positions: new Cesium.CallbackProperty(function (time, result) {
              var sourpos = ntities1.position.getValue(time);
              var cartographic1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(sourpos);
              var lon1 = Cesium.Math.toDegrees(cartographic1.longitude);
              var lat1 = Cesium.Math.toDegrees(cartographic1.latitude);
              var height1 = cartographic1.height;

              var tarpos = entities2.position.getValue(time);
              var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(tarpos);
              var lon2 = Cesium.Math.toDegrees(cartographic.longitude);
              var lat2 = Cesium.Math.toDegrees(cartographic.latitude);
              var height2 = cartographic.height
              return  Cesium.Cartesian3.fromDegreesArrayHeights([lon1,lat1,height1,lon2, lat2, height2])
            }, false),
          width: width,
          material: Cesium.Color.CHARTREUSE ,
        },
      })
}

