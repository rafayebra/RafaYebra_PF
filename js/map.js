

require(["esri/map",
"esri/layers/ArcGISDynamicMapServiceLayer",

"esri/dijit/HomeButton",
"esri/dijit/Legend",
"esri/dijit/BasemapGallery",
"esri/dijit/Search",
"esri/dijit/OverviewMap",
"esri/dijit/Scalebar",
"esri/toolbars/draw",
"esri/graphic",
"esri/layers/FeatureLayer",
"esri/tasks/query",

"esri/dijit/Popup",
"esri/dijit/PopupTemplate",
"esri/InfoTemplate",

"esri/symbols/SimpleFillSymbol",
"esri/symbols/SimpleLineSymbol",
"esri/symbols/SimpleMarkerSymbol",
"esri/Color",


"dojo/on",

"dojo/dom-construct",

"dijit/layout/TabContainer",
"dijit/layout/ContentPane",
"dijit/layout/BorderContainer",
"dojo/domReady!"],

function(
  Map, ArcGISDynamicMapServiceLayer, 
  HomeButton, Legend, BasemapGallery, Search, OverviewMap, Scalebar, Draw, Graphic, FeatureLayer, Query,
  Popup, PopupTemplate, InfoTemplate,
  SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, Color, 
   on, domConstruct,

) {


  

  var popupOptions = {
    fillSymbol: new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25])),
    marginLeft: "20",
    marginTop: "20"
  };
  //create a popup to replace the map's info window
  var popup = new Popup(popupOptions, domConstruct.create("div"));


  
  
  var mapMain = new Map("map", {
      basemap: "topo",
      infoWindow: popup         
    });


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

    mapMain.on("zoom",function(evt){
      popup.hide()
    });

    /*
    Añadir el USA map service al mapa
    */

   var lyrUSA = new ArcGISDynamicMapServiceLayer("http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/", {
    opacity: 0,
  });          

    /*
  Definir el feature layer del map service de forma independiente.
  */
  var lyrCities = new FeatureLayer("http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/0", {
    opacity: 0.5,
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


    mapMain.on("load",function(evt){
      mapMain.resize();
      mapMain.reposition();

    
      mapMain.addLayers([lyrCountries, lyrStates, lyrHighways, lyrCities]);

        
      /*
    Crear un widget Basemap Gallery. 
    Es preciso la creación del nodo "basemapGallery" dentro de "map" en el código HTML.
    */
    
    var basemapGallery = new BasemapGallery({
        showArcGISBasemaps: true,
        map: mapMain,
    }, "basemapGallery");

    basemapGallery.startup()

      /*
    Crear un widget Search. 
    Es preciso la creación del nodo "search" dentro de "map" en el código HTML.
    */

    var search = new Search({
        map: mapMain,
        autoComplete: true
    }, "search");

    search.startup();

      /*
    Crear un widget OverviewMap. 
    */

    var overviewMapDijit = new OverviewMap({
      map: mapMain,
      attachTo:"bottom-right",
      visible: true,
      color:" #224a54",
      opacity: 0.250      
     });

    overviewMapDijit.startup(); 

       /*
    Crear un widget de escala. 
    */

    var dijitScalebar = new Scalebar({
      map: mapMain,
      scalebarUnit: "dual",
      attachTo: "bottom-left",
    }); 

  






     //Create searchState widget
     var searchStates = new Search({
      map: mapMain,
      
      /*passing in empty source array to clear defaults such as "All" and the ArcGIS Online World Geocoding service
      pasando una matriz de origen vacía para borrar valores predeterminados como "All" y el ArcGIS Online World Geocoding service
      */
      sources: [],
     // zoomScale: 5000000
      enableInfoWindow: true,
      showInfoWindowOnSelect: true,
   }, "searchStates");

   /*listen for the load event and set the source properties. 
   Escuche el evento de carga y establezca las propiedades de la fuente.
   */
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

         /* Create an InfoTemplate and include three fields
         Cree una plantilla de información e incluya tres campos
         */
        // infoTemplate: new InfoTemplate("state_name")
       //  infoWindow: popup,
          infoTemplate: popupTemplate,


      });

      /*Set the sources above to the search widget
      Establecer las fuentes de arriba en el widget de búsqueda
      */
      searchStates.set("sources", sources);
      
      
   });
   searchStates.startup();
   







    
    
    
    



  


     /*
    Una vez que se hayan agregado todas las capas al mapa:
    */

    mapMain.on("layers-add-result", function(){         
      
      // Centrar el mapa en la extensión del USA map service.
      var extent = lyrUSA.fullExtent; 
      mapMain.setExtent(extent);

      // Agregar una leyenda.
      var dijitLegend = new Legend ({
        map: mapMain,
        arrangement: Legend.ALIGN_RIGHT,
        },"legendDiv");

      dijitLegend.startup();
    
      
        /*
      Crear un Home Botton. 
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


      on(dojo.byId("pintaYQuery"),"click",fPintaYQuery);
      
      // Se saca fuera la variable tbDraw para que también pueda leerla la función ffinPintaYQuery.
      var tbDraw = new Draw(mapMain);
      
      function fPintaYQuery() {

      mapMain.setInfoWindowOnClick(false);
        
        // var tbDraw = new Draw(mapMain);

          tbDraw.on("draw-end", displayPolygon);
          tbDraw.activate(Draw.POLYGON);
      };

      function displayPolygon(evt) {
        var geometryInput = evt.geometry;

      

              var tbDrawSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, 
                  new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([255, 255, 0]), 2), new Color([255, 255, 0, 0.2]));

              

              mapMain.graphics.clear();

            

              var graphicPolygon = new Graphic(geometryInput, tbDrawSymbol);
              mapMain.graphics.add(graphicPolygon);

              selectCities(geometryInput);
              };

              function selectCities(geometryInput) {

                
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


                
                lyrCities.setSelectionSymbol(symbolSelected);


                

                var queryCities = new Query();
                queryCities.geometry = geometryInput;  



                

                lyrCities.selectFeatures(queryCities, FeatureLayer.SELECTION_NEW)
                
            };
  
  
      on(dojo.byId("finPintaYQuery"),"click",ffinPintaYQuery); 

      
      function ffinPintaYQuery(){      
        lyrCities.clearSelection();
        mapMain.graphics.clear();
        tbDraw.deactivate();

        mapMain.setInfoWindowOnClick(true);
      };
      
      

      on(dojo.byId("progButtonNode"),"click",fQueryEstados);
       
      function fQueryEstados(){
       alert("Evento del botón Seleccionar ciudades");
      }
  
      
      







    });

  });

