 const WEATHER_API_DATA = "https://api.open-meteo.com/v1/forecast?latitude=-0.69&longitude=34.79&hourly=temperature_2m,relativehumidity_2m,rain,evapotranspiration,soil_moisture_9_27cm&daily=temperature_2m_max,temperature_2m_min,precipitation_hours&current_weather=true&timezone=Africa%2FCairo";
const temp = document.getElementById('temp');
const humidity  = document.getElementById('humid');
const soilMoisture = document.getElementById('soilMoisture');
const averageRain = document.getElementById('avg-rain');
const averageTemp = document.getElementById('avg-temp');
const averageSoilMoisture = document.getElementById('avg-soilMoisture');
const state = document.querySelector('.status');
const expectedWater = document.querySelector('.year1');

async function getApiData(url){
	const response = await fetch(url);
	const responseData = await response.json();
     // console.log(responseData);
	showData(responseData);
  displayAverages(responseData.hourly.temperature_2m,responseData.hourly.rain,responseData.hourly.soil_moisture_9_27cm,responseData);
}


function showData(data){
	temp.innerText = data.hourly.temperature_2m[0] +" "+ data.hourly_units.temperature_2m[0];
	humidity.innerText = data.hourly.relativehumidity_2m[0] +" "+ data.hourly_units.relativehumidity_2m[0];
	soilMoisture.innerText = data.hourly.soil_moisture_9_27cm[0] + " "+ data.hourly_units.soil_moisture_9_27cm;
	
}

getApiData(WEATHER_API_DATA);

// display average temp,soilMoisture,rain;

function displayAverages(array1,array2,array3,data){
   averageTemp.innerText = calculateAverages(array1) + " " + data.hourly_units.temperature_2m[0];
   averageSoilMoisture.innerText = calculateAverages(array3) + " " + data.hourly_units.soil_moisture_9_27cm;
   averageRain.innerText = calculateAverages(array2) + " " + data.hourly_units.rain;
}

function calculateAverages(array){
let sum =0;
  array.forEach(item =>{
    sum +=item;
  });
  //console.log(sum);
  return sum/array.length * 100;

}
	

var map = L.map('map').setView([ -0.680482, 34.777061], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
maxZoom: 19,
attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

navigator.geolocation.getCurrentPosition(success,error);
let marker,circle;

function success(pos){
const lat =pos.coords.latitude;
const long =pos.coords.longitude;
const accuracy = pos.coords.accuracy;
if(marker){
map.removeLayer(marker);
map.removeLayer(circle);
}

marker=L.marker([lat,long]).addTo(map);
circle=L.circle([lat,long ], { radius: accuracy}).addTo(map);

map.fitBounds(circle.getBounds());
}

function error(err){
if(err.code === 1){
alert("please allow geolocation access");
}else{
alert("cannot get current location ");
}
}




async function getApiData1(){
	const response = await fetch(WEATHER_API_DATA);
	const responseData = await response.json();

   var rain = calculateAverages(responseData.hourly.rain);
   var moisture = calculateAverages(responseData.hourly.soil_moisture_9_27cm);
   localStorage.setItem('rain',`${rain}`);
   localStorage.setItem('soilMoisture',`${moisture}`);
   //console.log(rain,moisture);
  //generateIrrigationStatus(results) 
}
getApiData1();


function determineToIrrigateOrNot() {

  const averageCropRain = document.getElementById('rainfall').textContent;
  const averageCropSoilMoisture = Math.trunc(document.getElementById('soil-moisture').textContent);
  const averageRain = localStorage.getItem('rain');
  const averageSoilMoisture = Math.trunc(localStorage.getItem('soilMoisture'));
  console.log(averageCropRain,averageCropSoilMoisture);
  console.log(averageRain,averageSoilMoisture);
let status = true;
let expectedWaterToIrrigate = 0 + " mm";
let result = []
  if(averageRain == 0 && averageRain < averageCropRain && averageSoilMoisture < averageCropSoilMoisture){
    status = true;
    expectedWaterToIrrigate = averageCropRain -averageRain;
    console.log('1')
  result = [status, expectedWaterToIrrigate]

  }else if(averageRain == 0  && averageRain < averageCropRain && averageSoilMoisture < averageCropSoilMoisture){
    status = true;
    expectedWaterToIrrigate = averageCropRain -averageRain;
    console.log('2')

  result = [status, expectedWaterToIrrigate];

  }else if(averageRain == 0  && averageRain < averageCropRain && averageSoilMoisture >= averageCropSoilMoisture){
    status = false;
    expectedWaterToIrrigate = 0 + "mm";
    console.log('3')

   result = [status, expectedWaterToIrrigate];

  }else if(averageRain == 0  && averageRain > averageCropRain && averageSoilMoisture < averageCropSoilMoisture){
    status = false;
    expectedWaterToIrrigate = averageCropRain -averageRain;
    console.log('4')
    
    result =  [status, expectedWaterToIrrigate];

  }else if(averageRain == 0  && averageRain < averageCropRain && averageSoilMoisture > averageCropSoilMoisture){
    status = false;
    expectedWaterToIrrigate = -averageRain -averageCropRain ;
    console.log('5')


   result = [status, expectedWaterToIrrigate];
    
  }
  return result;
  
}
var results = determineToIrrigateOrNot();
console.log(results);
generateIrrigationStatus(results);
function generateIrrigationStatus(results){
  let status = results[0];
  let waterNeeded = results[1];
   console.log(status,waterNeeded);

  if(status){
    console.log(" irrigate");
    state.style.backgroundColor = 'green';
    expectedWater.innerText = waterNeeded;
    
  }else{
    console.log("don't irrigate");
    state.style.backgroundColor = 'red';
    expectedWater.innerText = waterNeeded;
   
  }
}
//generateIrrigationStatus();


var slidePosition = 1;
SlideShow(slidePosition);

// forward/Back controls
function plusSlides(n) {
  SlideShow(slidePosition += n);
}

//  images controls
function currentSlide(n) {
  SlideShow(slidePosition = n);
}

function SlideShow(n) {
  var i;
  var slides = document.getElementsByClassName("Containers");
  var circles = document.getElementsByClassName("dots");
  if (n > slides.length) {slidePosition = 1}
  if (n < 1) {slidePosition = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
  }
  for (i = 0; i < circles.length; i++) {
      circles[i].className = circles[i].className.replace(" enable", "");
  }
  slides[slidePosition-1].style.display = "block";
  circles[slidePosition-1].className += " enable";
} 
var slidePosition = 0;
SlideShow();

function SlideShow() {
  var i;
  var slides = document.getElementsByClassName("Containers");
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slidePosition++;
  if (slidePosition > slides.length) {slidePosition = 1}
  slides[slidePosition-1].style.display = "block";
  setTimeout(SlideShow, 2000); // Change image every 2 seconds
} 
