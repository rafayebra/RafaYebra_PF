
    var mapMain;
    var tb;
    var lyrUSA;
    var lyrCities;

   

    require(["esri/map",
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "esri/dijit/Legend",
        "esri/dijit/BasemapGallery",
        "esri/dijit/Search",
        "esri/dijit/OverviewMap",
        "esri/dijit/Scalebar",
        "esri/toolbars/draw",
        "esri/graphic",
        "esri/layers/FeatureLayer",
        "esri/tasks/query",

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
          Map, ArcGISDynamicMapServiceLayer, Legend, BasemapGallery, Search, OverviewMap, Scalebar, Draw, Graphic, FeatureLayer, Query,
          SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, Color, 
          on

        ) {


        on(dojo.byId("pintaYQuery"),"click",fPintaYQuery);
        on(dojo.byId("progButtonNode"),"click",fQueryEstados);

        
          

          

            function fPintaYQuery() {
                var tbDraw = new Draw(mapMain);

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


              
        
         
        function fQueryEstados(){
         alert("Evento del botón Seleccionar ciudades");
        }

        
        

        mapMain = new Map("map", {
          basemap: "topo",         
        });

      
        mapMain.on("load",function(evt){
          mapMain.resize();
          mapMain.reposition();

        
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

      

        
        
        
        
          /*
        Añadir el USA map service al mapa
        */

        lyrUSA = new ArcGISDynamicMapServiceLayer("http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/", {
          opacity: 0.5,
        });          

        // mapMain.addLayers([lyrUSA]);

          /*
        Definir el feature layer de ciudades.
        */
        lyrCities = new FeatureLayer("http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/0", {
          opacity: 0.5,
        }
        
        );

        mapMain.addLayers([lyrUSA, lyrCities]);


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
          });


  







        });

      });


