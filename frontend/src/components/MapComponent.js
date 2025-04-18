import { useEffect, useRef, useState } from "react";
import { GoogleMap, Marker, useLoadScript} from "@react-google-maps/api";

import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";

function MapComponent() {

  const libraries = ["places"];

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: libraries, 
  });

  //const [center, setCenter] = useState({  lat: 38.9869, lng: -76.9378 }); college park
  const [center, setCenter] = useState({  lat: 39.09892028445157, lng: -77.15935081936276}); //Rockville

  const [markerPosition, setMarkerPosition] = useState(center);
  const [googleStreetView, setGoogleStreetView] = useState(null);
  const [detectedImage, setDetectedImage] = useState(null);
  const [classes, setClasses] = useState([])

  useEffect (()=>{}, [classes])

  if (!isLoaded) return <div>Loading...</div>;

  const handleOnClick = async (e)=> {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPosition({lat, lng});
    console.log({lat, lng});

    const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${lat},${lng}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;
    //setGoogleStreetView(streetViewUrl);
    
    
    try {
    fetch ( "http://localhost:5000/upload", {
      method: "POST",
      headers: {"Content-Type": "application/json" },
      body: JSON.stringify({ lat, lng, streetViewUrl }),
    }).
    then ( async (response) => {
        if (!response.ok){  
          throw new Error ('Not found')
        }
        
        let blob = await response.blob();
        const processedImageUrl = URL.createObjectURL(blob);
        setGoogleStreetView(streetViewUrl);
        setDetectedImage(processedImageUrl);
    })
    .catch( (error) =>  {
       console.log('Error fetching ', error)
    });

    await new Promise((resolve) => setTimeout(resolve, 500)); 

    fetch ( "http://localhost:5000/get-classes", {
      method: "GET"
    }).
    then ( async (response) => {
        if (!response.ok){  
          throw new Error ('Not found')
        }
        
        console.log(response)
        let class_list = await response.json();
        console.log("changing class now with ", class_list)
        setClasses(class_list.classes)
    })

    
  }
  catch( error ) {
       console.log('Error fetching ', error)
  };
   
  }


  return (
    <>

      <GoogleMap onClick={handleOnClick} zoom={16} center={center} mapContainerStyle={{ width: "80%", height: "400px" }}>
        <Marker position={markerPosition} />
      </GoogleMap>

      <div>
          <h3>Street View Image</h3>
          <img className="" src={googleStreetView} alt="Street View" />
          <img src={detectedImage} alt="Street View" />
      </div>

      <h3>Detected classes</h3>
      <ul>
        {classes.map((cls, index) => (
          <li key={index}>{cls}</li>
        ))}
      </ul>
    </>
  );
}

export default MapComponent;
