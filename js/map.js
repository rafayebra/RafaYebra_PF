

require(["esri/map",
"esri/layers/ArcGISDynamicMapServiceLayer",
"esri/layers/FeatureLayer",

"esri/dijit/HomeButton",
"esri/dijit/Legend",
"esri/dijit/BasemapGallery",
"esri/dijit/Search",
"esri/dijit/OverviewMap",
"esri/dijit/Scalebar",

"esri/toolbars/draw",
"esri/graphic",
"esri/tasks/query",

"dojo/store/Memory",
"dojo/_base/declare",
"dgrid/OnDemandGrid",
"dgrid/Selection",
"dojo/_base/array",

"esri/dijit/Popup",
"esri/dijit/PopupTemplate",
"dojo/dom-construct",

"esri/symbols/SimpleFillSymbol",
"esri/symbols/SimpleLineSymbol",
"esri/symbols/SimpleMarkerSymbol",
"esri/Color",

"dojo/on",

"dijit/layout/TabContainer",
"dijit/layout/ContentPane",
"dijit/layout/BorderContainer",
"dojo/domReady!"],

function(
  Map, ArcGISDynamicMapServiceLayer, FeatureLayer,
  HomeButton, Legend, BasemapGallery, Search, OverviewMap, Scalebar, 
  Draw, Graphic, Query,
  Memory, declare, Grid, Selection, array,
  Popup, PopupTemplate, domConstruct,
  SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, Color, 
  on, 

) {




// Iniciar el dgrid.

var gridCities = new (declare([Grid, Selection]))({
  bufferRows: Infinity,
  columns: {
    areaname: "CIUDAD",
    class:"CLASE",
    st: "ESTADO",
    capital: "CAPITAL"
      
  }
}, "tablaCities");


/* Definir las opciones de los popups.
Definir la simbología de las entidades seleccionadas para mostrar popups.
*/

var popupOptions = {
  fillSymbol: new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
              new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
              new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25])),
  marginLeft: "20",
  marginTop: "20"
};


// Crear un popup para reemplazar la ventana de información del mapa infoWindows.

var popup = new Popup(popupOptions, domConstruct.create("div"));


// Crear el mapa.

var mapMain = new Map("map", {
  basemap: "topo",
  infoWindow: popup         
});


// Definir el contenido de los popups.

var popupTemplate = new PopupTemplate({

  title: "Estados: {STATE_NAME}",
  fieldInfos: [{
    fieldName: "st_area(shape)",
    label: "Área:",
    visible: true,
    format: { places: 2 }
  }, {
    fieldName: "POP2000",
    label: "Población:",
    visible:true
  }, {
    fieldName: "POP00_sqmi",
    label: "Población por milla cuadrada:",
    visible: true                     
  }]
});


// Se llama al método on del mapa para que al ser cargado el mapa se ejecute la función: esconder los popups al modificar el zoom.

mapMain.on("zoom",function(evt){
  popup.hide()
});


// Se declara una variable con un array que contenga los siguientes campos, introducidos como cadenas de texto.

var outFieldsCities = ["areaname", "class", "st", "capital"];


/* Se añade el USA map service al mapa.
Este va a ser solo empleado para delimitar la extensión inicial del mapa, para el resto de la aplicación se utilizarán los feature layers
que contienen, los cuales se proceden a llamar a continuación.
*/

var lyrUSA = new ArcGISDynamicMapServiceLayer("http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/", {
opacity: 0,
});          


// Se definen los feature layers que contiene el map service de forma independiente.

var lyrCities = new FeatureLayer("http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/0", {
  opacity: 0.5,
  outFields: outFieldsCities,
}); 

var lyrHighways = new FeatureLayer("http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/1", {
  opacity: 0.5,
});

var lyrStates = new FeatureLayer("http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2", {
  opacity: 0.5,
  mode: FeatureLayer.MODE_SNAPSHOT,
  infoTemplate: popupTemplate,
  outFields: ["*"],
});

var lyrCountries = new FeatureLayer("http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/3", {
  opacity: 0.5,
});




// Se llama al método on del mapa para que al ser cargado el mapa se ejecute la función: todo lo contenido entre los corchetes.

mapMain.on("load",function(evt){

  mapMain.resize();
  mapMain.reposition();


  // Añadir las feature layers al mapa.

  mapMain.addLayers([lyrCountries, lyrStates, lyrHighways, lyrCities]);


  /* Crear un widget Basemap Gallery. 
  Es preciso la creación del nodo "basemapGallery" dentro de "map" en el código HTML.
  Se inicia mediante el método startup.
  */
  
  var basemapGallery = new BasemapGallery({
      showArcGISBasemaps: true,
      map: mapMain,
  }, "basemapGallery");

  basemapGallery.startup()


  /* Crear un widget Search. 
  Es preciso la creación del nodo "search" dentro de "map" en el código HTML.
  Se inicia mediante el método startup.
  */

  var search = new Search({
      map: mapMain,
      autoComplete: true
  }, "search");

  search.startup();

  /* Crear un widget OverviewMap. 
  */

  var overviewMapDijit = new OverviewMap({
    map: mapMain,
    attachTo:"bottom-right",
    visible: true,
    color:" #224a54",
    opacity: 0.250,
    height: 150,
    width:250      
    });

  overviewMapDijit.startup(); 

  /* Crear un widget de escala. 
  */

  var dijitScalebar = new Scalebar({
    map: mapMain,
    scalebarUnit: "dual",
    attachTo: "bottom-left",
  }); 

  

  /* Se define la herramienta Buscador de Estados, searchState widget.
  Esta herramienta consiste en un search personalizado.
  En source una matriz de origen vacía para borrar valores predeterminados como "All" y el ArcGIS Online World Geocoding service
  */

  var searchStates = new Search({
    map: mapMain,
    sources: [],
    enableInfoWindow: true,
    showInfoWindowOnSelect: true,
    }, "searchStates");


   // Se llama al método on () de searchWidget para que al ejecutarse el evento load se ejecute la función que defina las propiedades de source.
   
   searchStates.on("load", function () {

    var sources = searchStates.sources;
    sources.push({
      featureLayer: lyrStates,
      placeholder: "Ohio",
      enableLabel: true,
      searchFields: ["state_name"],
      displayField: "state_name",
      exactMatch: false,
      outFields: ["*"],
      infoTemplate: popupTemplate,
    });

      
    // Se establece la variable source definida como source en el widget searchStates.

    searchStates.set("sources", sources);
      
  });

  searchStates.startup();
   

  
  // Una vez que se hayan agregado todas las capas al mapa:
  
  mapMain.on("layers-add-result", function(){ 

    
    // Centrar el mapa en la extensión del USA map service.

    var extent = lyrUSA.fullExtent; 
    mapMain.setExtent(extent);


    // Agregar una leyenda.

    var dijitLegend = new Legend ({
      map: mapMain,
      arrangement: Legend.ALIGN_LEFT,
      },"legendDiv");

    dijitLegend.startup();
  
    
    /* Crear un Home Botton. 
    Es preciso la creación del nodo "basemapGallery" dentro de "map" en el código HTML.
    */

    var homeButton = new HomeButton({
      theme: "HomeButton",
      map: mapMain,
      extent: extent,
      visible: true
    }, "homeBottom");

    homeButton.startup();

  });


  // La función fPintaYQuery se iniciará al hacer click sobre el botón "pintaYQuery".

  on(dojo.byId("pintaYQuery"),"click",fPintaYQuery);
  
  
    // Se saca fuera la variable tbDraw para que también pueda leerla la función ffinPintaYQuery.
  
    var tbDraw = new Draw(mapMain);
    
    
    /* Se define la función fPintaYQuery 
    Esta función desarrolla la herramienta de selección y consulta de ciudades.
    */

    function fPintaYQuery() {

      // Al entrar en la función se desactivan las popups para evitar que al dibujar los poligonos estas puedan molestar al ususario.

      mapMain.setInfoWindowOnClick(false);

      
      /* Implementar el Draw toolbar
      Al terminar de dibujar el polígono se inicia la función "displayPoligon"
      */
        
        tbDraw.on("draw-end", displayPolygon);
        tbDraw.activate(Draw.POLYGON);
    };


    // Se define la función displayPolygon

    function displayPolygon(evt) {


      // evt.geometry es la geometría proporcionada por el evento de la toolbar Draw.
      
      var geometryInput = evt.geometry;

    
      // Definición del símbolo de selección.

      var tbDrawSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, 
          new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([255, 255, 0]), 2), new Color([255, 255, 0, 0.2]));

            
      // Limpiar la graphic layer al iniciar la creación de un polígono.
      
      mapMain.graphics.clear();


      // Se construlle y se añade al mapa la grahic layer de polígonos.

      var graphicPolygon = new Graphic(geometryInput, tbDrawSymbol);
      mapMain.graphics.add(graphicPolygon);

      
      // Se llama a la siguiente función, selectCities, encargada de seleccionar las ciudades.
      
      selectCities(geometryInput);

    };


    // Se define la función selectCities

    function selectCities(geometryInput) {


      // Se establece la simbología que tendrá el símbolo seleccionado.

      var symbolSelected = new SimpleMarkerSymbol({
          "type": "esriSMS",
          "style": "esriSMSCircle",
          "color": [255, 115, 0, 128],
          "size": 6,
          "outline": {
              "color": [255, 0, 0, 214],
              "width": 1
          }
      });


      // Se llama al método setSelectionSymbol para aplicar la simbologia definida para la selección de entidades. 
      
      lyrCities.setSelectionSymbol(symbolSelected);


      /* Se construye una nueva instancia de consulta, Query.         
      Se accede a la propiedad geometry y y asígnala el valor geometryInput.
      */

      var queryCities = new Query();
      queryCities.geometry = geometryInput;  


      // Se llama al método on de lyrCities para que al completar el polígono haga un grid con la selección.

      lyrCities.on("selection-complete", populateGrid)

              
      // Realizar la selección.

      lyrCities.selectFeatures(queryCities, FeatureLayer.SELECTION_NEW)

    };

    
    // Se define la función populateGrid

    function populateGrid(results) {

              
      // Se define un array que contiene el nombre de los campos a mostrar y valores asociados a una fila en el data grid.

      var dataCities = array.map(results.features, function (feature) {
        return {

          "areaname": feature.attributes[outFieldsCities[0]],
          "class": feature.attributes[outFieldsCities[1]],
          "st": feature.attributes[outFieldsCities[2]],
          "capital": feature.attributes[outFieldsCities[3]],
        }

      });


      // Pasar los datos al grid

      var memStore = new Memory({
        data: dataCities
      });
      gridCities.set("store", memStore);
                      
  };
  

  // La función ffinPintaYQuery que se iniciará al hacer click sobre el botón "finPintaYQuery".
  
  on(dojo.byId("finPintaYQuery"),"click",ffinPintaYQuery); 

    
    // Se define la función ffinPintaYQuery:

    function ffinPintaYQuery(){ 

      
      // Limpiar las selecciones hechas sobre lyrCities.

      lyrCities.clearSelection();


      // Limpiar la graphic layer.

      mapMain.graphics.clear();


      // Desactivar la herramienta dibujar.

      tbDraw.deactivate();
        

      // Volver a activar los popups.

      mapMain.setInfoWindowOnClick(true);
     
    };
    
  });

});

