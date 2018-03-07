# Final Project Data, Topic, and Objectives
## 1. Data Source
The basis for my maps comes from the PDFs [here](https://www.pilgrimageoffaith.org/trail-maps--directions.html). To convert these routes to a usable format, I used [geojson.io](geojson.io) to draw the routes and save them as a GeoJSON [file](data/trails.geojson). I may also use the parish data at http://www.catholiccincinnati.org/wp-content/themes/archdiocese/parishes/locations.xml, which I have saved as a spreadsheet [here](data/parish-data.xlsx). I will use this data to place the points of interest on the map. For a basemap, I need one with streets. I like Mapbox's Streets theme because its colors aren't too loud.
## 2. Topic
My goal is to create interactive maps for use on pilgrimages planned for the Archdiocese of Cincinnati's Bicentennial.
My title will be "Archdiocese of Cincinnati Pilgrimage Trails."
## 3. Map Objectives and User Needs
* I have seen various posts on social media about these trails and they mention planning pilgrimages for a wider group of people, not just the Boy Scouts that the page originally targeted. Having interactive versions of the trails in addition to the PDFs would make the trips accessible to more people. The user could also view information on the various churches on the routes (mass times, other devotions) on the map. The information can also be more easily updated through a web map.
* Imagine Taylor decides to organize a pilgrimage for her young adult group at her parish. She isn't the best at following written directions because she always uses Google Maps navigation. She goes to the Pilgrimage of Faith website and picks out her route. She plans where the group will attend mass and go to confession along the way from the information provided. On the day of the event, she uses her phone to lead the group and check the directions. She zooms and pans to check out the route. The group is moving slower than expected, so she retrieves the information via the popups for the remaining churches to see where and when devotees are celebrating the next mass.

## 4. Identification of anticipated thematic representation
I plan to use lines to represent the trails. I will have markers will appropriate symbols for points of interest (churches and other religious/other landmarks).
## 5. Content and requirements list
### Content requirements
* route location represented
* church location represented
* selected trail description and stops/segment directions displayed
* Mass times at churches along route available to user

### Functional specifications
* map will load data from GeoJSON and CSV file to create two data layers
* data layers drawn to map
* a dropdown will select trail (will start with Cathedral trail selected)
* additional information (i.e., mass times) will be attached to each symbol and available to user on a click or hover
* user's location shown on map

## 6. Description of the anticipated user interaction
* dropdown with trail selection
* zoom and pan to see the route details
* click on markers to obtain information from popups
* in list of stops, click to zoom to that stop on the map

## 7. Mockup
[mockup](images/mockup.png)

## 8. Technology stack
* geojson.io - create data for routes
* Excel - clean parish data
* data files - GeoJSON for routes, CSV for parishes/other points of interest
* Mapbox - basemap and geolocation
* other web technologies: CSS for styling page, HTML
* GitHub pages - host my map here
