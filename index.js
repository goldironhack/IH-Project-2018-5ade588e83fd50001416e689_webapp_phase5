 //variables globales
const INFO_URL="https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/nycd/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=geojson";

var districtshapes=[];
var distritos=[[],[[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[]]];
var centros=[[],[[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[]]];
var distancias=[];
var map;
var nyu={lat: 40.7291, lng: -73.9965};
var markersArray=[];
class datico {
    constructor(distancia, boro) {
        this.distancia = distancia;
        this.boro = boro;
    }
}
//================================================================
 //funcion que obtiene los datos del geojason
function getData(URL) {
    var data= $.get(URL,function(){
    })
    .done(function(){
        var json = JSON.parse(data.responseText);
        //console.log(json);
        for(var i=0; i<json.features.length;i++){
            if(json.features[i].geometry.coordinates.length==1){
                districtshapes.push(json.features[i].geometry.coordinates[0]);
                for(var j=0;j<districtshapes[i].length;j++){
                    var distrito=districtshapes[i];
                    districtshapes[i][j]=new google.maps.LatLng(distrito[j][1],distrito[j][0]);
                }
                dibujar(districtshapes[i],json.features[i].properties.BoroCD);
            }else{
                districtshapes.push(json.features[i].geometry.coordinates);
                for(var k=0;k<districtshapes[i].length;k++){
                    var distrito1=districtshapes[i][k][0];
                    for(var l=0;l<distrito1.length;l++){
                        districtshapes[i][k][0][l]=new google.maps.LatLng(distrito1[l][1],distrito1[l][0]);
                    }
                    dibujar(districtshapes[i][k][0],json.features[i].properties.BoroCD);
                }
            }
        }
        centro();
    })
    .fail(function(error){
        console.log(error);
    });
}
//================================================================
    // Funcion que dibuja los distritos
    function dibujar(coords,boroCD){
        var color='#0fff00';
        if(boroCD<113){
            color= '#FF0000';
        }
        if(boroCD>200 && boroCD<213){
            color= '#fffb00';
        }
        if(boroCD>300 && boroCD<319){
            color= '#00b9ff';
        }
        if(boroCD>400 && boroCD<415){
            color= '#7c00ff';
        }
        if(boroCD>=500 && boroCD<504){
            color= '#ff9700';
        }
        var poligonodistrito = new google.maps.Polygon({
            paths: coords,
            strokeColor: '#000000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: color,
            fillOpacity: 0.35
        });
        poligonodistrito.setMap(map);
        llenado(poligonodistrito,boroCD);
    }
//================================================================
    //funcion que llena el arreglo distritos con la informacion de los distritos habitables
    function llenado(poligo,boro){
        boro=String(boro);
        var bigboro = boro.substr(0, 1);
        var ltboro = boro.substr(1, 2);
        if((ltboro.substr(0, 1).localeCompare("0"))===0){
            ltboro = ltboro.substr(1, 1);
        }
        if(ltboro<19){
            if(distritos[(bigboro)][(ltboro)].length===0){
                distritos[bigboro][ltboro]=poligo;
            }else{
                if(google.maps.geometry.spherical.computeArea(distritos[(bigboro)][(ltboro)].getPath())<google.maps.geometry.spherical.computeArea(poligo.getPath())){
                    distritos[bigboro][ltboro]=poligo;
                }
            }
        }
    }
    //console.log(distritos);
//================================================================
//funcion que calcula el centro de todos los distritos y les pone un marcador
    
    function centro(){
        for(var i=1;i<6;i++){
            for(var k=1;k<distritos[i].length;k++){
            centros[i][k] = distritos[i][k].getApproximateCenter();
                service = new google.maps.DistanceMatrixService();
                service.getDistanceMatrix({
                    origins: [nyu],
                    unitSystem: google.maps.UnitSystem.METRIC,
                    destinations: [centros[i][k]],
                    travelMode: google.maps.TravelMode.DRIVING,
                    avoidHighways: false,
                    avoidTolls: false
                    }, 
                    callback
                );
                //distancias[conta].boro=String(i).concat(k);
                //conta++;
                //console.log(distancia);
            }
        }
        //console.log(distancias);
        //console.log(centro);
    }
//================================================================
   var distri=101;
    function callback(response, status) {
        //distri=101;
        if (status == 'OK') {
            var origins = response.originAddresses;
            var destinations = response.destinationAddresses;
            for (var i = 0; i < origins.length; i++) {
                var results = response.rows[i].elements;
                for (var j = 0; j < results.length; j++) {
                    var element = results[j];
                    var distance = element.distance.value;
                    //var duration = element.duration.text;
                    //var from = origins[i];
                    var to = destinations[j];
                    var tempo=new datico(distance,String(distri));
                    distancias.push(tempo);
                    distri++;
                    if(distri==113){
                        distri=201;
                    }else{
                        if(distri==213){
                            distri=301;
                        }else{
                            if(distri==319){
                                distri=401;
                            }else{
                                if(distri==415){
                                    distri=501;
                                }else{
                                    if(distri==504){
                                        distancias.sort(function(a, b){return a.distancia-b.distancia});
                                        console.log(distancias);
                                        for(var a=0;a<10;a++){
                                            var key1=Number(distancias[a].boro.substr(0,1));
                                            var key2=Number(distancias[a].boro.substr(1,2));
                                            addMarker(centros[key1][key2],distancias[a].boro);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }   
    }

//================================================================
    //funcion que agregar un marcador con una etiqueta
    function addMarker(pos,bor) {
        var marker = new google.maps.Marker({
            position: pos,
            label: bor,
            map: map
        });
        //markersArray.push(marker);
    }
    
//================================================================
//inicilizacion del mapa
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10.3,
        center: nyu
    });
    //================================================================
    //funcion que calcula el centro de un poligono
    google.maps.Polygon.prototype.getApproximateCenter = function() {
        var boundsHeight = 0,
        boundsWidth = 0,
        centerPoint,
        heightIncr = 0,
        maxSearchLoops,
        maxSearchSteps = 10,
        n = 1,
        northWest,
        polygonBounds = this.getBoundingBox(),
        testPos,
        widthIncr = 0;

        // Get polygon Centroid
        centerPoint = polygonBounds.getCenter();

        if (google.maps.geometry.poly.containsLocation(centerPoint, this)){
            // Nothing to do Centroid is in polygon use it as is
            return centerPoint;
        } else {
            maxSearchLoops = maxSearchSteps / 2;

            // Calculate NorthWest point so we can work out 
            // height of polygon NW->SE
            northWest = new google.maps.LatLng(polygonBounds.getNorthEast().lat(),polygonBounds.getSouthWest().lng());

            // Work out how tall and wide the bounds are and what our search
            // increment will be
            boundsHeight =google.maps.geometry.spherical.computeDistanceBetween(northWest,polygonBounds.getSouthWest());

            heightIncr = boundsHeight / maxSearchSteps;

            boundsWidth = 
            google.maps.geometry.spherical.computeDistanceBetween(northWest,polygonBounds.getNorthEast());

            widthIncr = boundsWidth / maxSearchSteps;

            // Expand out from Centroid and find a point within polygon at
            // 0, 90, 180, 270 degrees
            for (; n <= maxSearchSteps; n++) {
                // Test point North of Centroid
                testPos = google.maps.geometry.spherical.computeOffset(centerPoint,(heightIncr * n),0);

                if (google.maps.geometry.poly.containsLocation(testPos, this)) {
                    break;
                }

                // Test point East of Centroid
                testPos = google.maps.geometry.spherical.computeOffset(centerPoint,(widthIncr * n),90);

                if (google.maps.geometry.poly.containsLocation(testPos, this)) {
                    break;
                }

                // Test point South of Centroid
                testPos = google.maps.geometry.spherical.computeOffset(centerPoint,(heightIncr * n),180);

                if (google.maps.geometry.poly.containsLocation(testPos, this)) {
                    break;
                }

                // Test point West of Centroid
                testPos = google.maps.geometry.spherical.computeOffset(centerPoint,(widthIncr * n),270);

                if (google.maps.geometry.poly.containsLocation(testPos, this)) {
                    break;
                }
            }
            return(testPos);
        }
    };
//================================================================
    //funcion de la que hace uso la funcion que calcula el centro de un poligono
    google.maps.Polygon.prototype.getBoundingBox = function() {
        var bounds = new google.maps.LatLngBounds();
        this.getPath().forEach(function(element,index) {
            bounds.extend(element);
        });
        return(bounds);
    };
    //================================================================
    getData(INFO_URL);
/*google.maps.event.addListenerOnce(map, 'idle', function(){
    // do something only the first time the map is loaded
    //llamado a la funcion getdata, que es la que desencadena todo el proceso
    getData(INFO_URL);
});*/
}


function holita(){
        console.log("holita");
    }