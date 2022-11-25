 const WEATHER_API_DATA = "https://api.open-meteo.com/v1/forecast?latitude=-0.69&longitude=34.79&hourly=temperature_2m,relativehumidity_2m,rain,evapotranspiration,soil_moisture_9_27cm&daily=temperature_2m_max,temperature_2m_min,precipitation_hours&current_weather=true&timezone=Africa%2FCairo";
const temp = document.getElementById('temp');
const humidity  = document.getElementById('humid');
const soilMoisture = document.getElementById('soilMoisture');
const averageRain = document.getElementById('avg-rain');
const averageTemp = document.getElementById('avg-temp');
const averageSoilMoisture = document.getElementById('avg-soilMoisture');
const state = document.querySelector('.year');
const expectedWater = document.querySelector('.year1');

async function getApiData(url){
	const response = await fetch(url);
	const responseData = await response.json();
      console.log(responseData);
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
  console.log(sum);
  return sum/array.length;

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



// const input = document.getElementById('crop').value;
// // importing crop api
// const cropApi = " "+input;
// // const data = fetchCropApi(cropApi);
// function fetchCropApi(url){
// 	const response = fetch(url)
// 	.then( res =>{
// 		return res.json()
// 	}).then(data =>{
// 		return data;
// 	}).catch(err =>{return err});
// }
// const container = document.querySelector('.crop-conditions');

// function showContent(){
// 	const list = container.createElement('div');
// 	const res = fetchCropApi(cropApi)
//    res.forEach((data)=>{
// 	list.innerHTML =`
// 	  <h3>crop name: ${data.cropName}</h3>
// 	  <img src=${data.cropImage} alt="crop-image">
// 	  <ul>
// 	  <li>${data.cropTemp}</li>
// 	  <li>${data.cropRainfall}</li>
// 	  <li>${data.cropMoistureSupport}</li>
// 	  <li><P>${data.cropDescription}</li>
// 	  </ul>
// 	           `;

//    });
//    container.appendChild(list);

// }
// showContent();

 

// function to determine if to irrigate or not by getting the averages

function determineToIrrigateOrNot(averageRain,averageSoilMoisture,averageCropRain,averageCropSoilMoisture) {
let status = true;
let expectedWaterToIrrigate = 0 + " mm";
  if(averageRain == 0 && averageCropRain < averageCropRain && averageSoilMoisture < averageCropSoilMoisture){
    status = true;
    expectedWaterToIrrigate = averageCropRain -averageRain;

    console.log('its ')
    return {
      'status':status,
      'expectedWaterToIrrigate':expectedWaterToIrrigate
    }
  }else if(averageRain > 0 && averageRain < averageCropRain && averageSoilMoisture < averageCropSoilMoisture){
    status = true;
    expectedWaterToIrrigate = averageCropRain -averageRain;
    return {
      'status':status,
      'expectedWaterToIrrigate':expectedWaterToIrrigate
    }
  }else if(averageRain > 0 && averageRain < averageCropRain && averageSoilMoisture >= averageCropSoilMoisture){
    status = false;
    expectedWaterToIrrigate = 0 + "mm";

    return {
      'status':status,
      'expectedWaterToIrrigate':expectedWaterToIrrigate
    }
  }else if(averageRain > 0 && averageRain > averageCropRain && averageSoilMoisture < averageCropSoilMoisture){
    status = false;
    expectedWaterToIrrigate = averageCropRain -averageRain;

    return {
      'status':status,
      'expectedWaterToIrrigate':expectedWaterToIrrigate
    }

  }else if(averageRain > 0 && averageRain < averageCropRain && averageSoilMoisture > averageCropSoilMoisture){
    status = false;
    expectedWaterToIrrigate = -averageRain -averageCropRain ;
    console.log("overflow");

    return {
      'status':status,
      'expectedWaterToIrrigate':expectedWaterToIrrigate
    }
  }

}

function generateIrrigationStatus(determineToIrrigateOrNot){
  let status = determineToIrrigateOrNot.status;
  let waterNeeded = determineToIrrigateOrNot.expectedWaterToIrrigate;


  if(status){
    state.style.backgroundColor = 'green';
    expectedWater.innerText = waterNeeded;
    
  }else{
    state.style.backgroundColor = 'red';
    expectedWater.innerText = waterNeeded;
  }
}

// logical
// check the weather forecast and see if there is presence of raining in the day and by how much


// check the current soil moisture content of the area and see if

// The amount of water to irrigate randomly is determined

// Calculate if the soil moisture content is above the thresh-hold and can sustain the plant during the whole day then save water for the plant

// Check the weather forecast if there is to expect rain of certain mm which is above the thresh-hold then save the water for the plant

// check the amount of evapotranspiration content if it will be low during the day then save the water for the plant

// combine the  condition to find if its suitable to irrigate then show a notification button to show weather to irrigate or not

 
// handling the corousel


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
