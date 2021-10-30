import React, { useRef, useState, useEffect } from 'react';
import './app.scss';
import axios from 'axios';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import Loader from 'react-loader-spinner';
import moment from 'moment';
import 'moment/locale/fr';
import MapGL from 'react-map-gl';
moment.locale('fr');

const MAPBOX_TOKEN =
  'pk.eyJ1Ijoia2FraWNoZTYiLCJhIjoiY2t2Y2g4a2pqM3NsNTJvbHA4Y2xxczdhdiJ9.ring34IstupnJBYS7hZ-_Q';

const App = () => {
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState([]);
  const [city, setCity] = useState('');
  const [cityToDisplay, setCityToDisplay] = useState('');
  const [error, setError] = useState(false);
  const [message, setMessage] = useState('Y a eu une erreur');
  const [lat, setLat] = useState(36.7137843);
  const [lng, setLng] = useState(4.0493919);
  const [viewport, setViewport] = useState({
    width: '100%',
    height: 400,
    latitude: lat,
    longitude: lng,
    zoom: 15,
  });
  const [showMap, setShowMap] = useState(false);

  const getMeteoByCity = city => {
    if (city !== '') {
      setLoader(true);
      axios
        .get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=0ea31f09c7f325c68ad433527ba56a98&lang=fr`
        )
        .then(result => {
          if (result.data.cod === '200') {
            setData(result.data.list);
            setCityToDisplay(city);
          } else if (result.data.cod === '404') {
            setError(true);
            setMessage(result.data.message);
          }

          setLoader(false);
          setCity('');
        })
        .catch(error => {
          setError(true);
        });
    }
  };

  const SubmitForm = e => {
    e.preventDefault();
    getMeteoByCity(city);
  };

  const getMyPostion = () => {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        getMeteoByCoords(position.coords.latitude, position.coords.longitude);
        setShowMap(true);
      },
      function (error) {
        setError(true);
        setMessage("Il y a eu une erreur lors de l'accès à votre position");
      }
    );
  };

  const getMeteoByCoords = (lat, lng) => {
    if (lng && lat) {
      setLoader(true);
      axios
        .get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=0ea31f09c7f325c68ad433527ba56a98&lang=fr`
        )
        .then(result => {
          if (result.data.cod === '200') {
            setData(result.data.list);
            setCityToDisplay('Votre position actuelle');
            setViewport(currentState => ({
              ...currentState,
              latitude: lat,
              longitude: lng,
            }));
          } else if (result.data.cod === '404') {
            setError(true);
            setMessage(result.data.message);
          }

          setLoader(false);
        })
        .catch(error => {
          setError(true);
        });
    }
  };

  useEffect(() => {
    getMeteoByCity('alger');
  }, []);

  if (loader) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Loader type='Puff' color='#00BFFF' height={100} width={100} />
      </div>
    );
  }

  return (
    <div className='container'>
      <div className='content'>
        <form onSubmit={SubmitForm} className='search'>
          <input
            placeholder='Rechercher une ville ...'
            type='text'
            value={city}
            onChange={e => setCity(e.target.value)}
          />
          <button type='submit'>Rechercher</button>
          <button onClick={getMyPostion}>Ma position actuelle</button>
        </form>
        {showMap && (
          <div className='map'>
            <MapGL
              {...viewport}
              width='100%'
              height='300px'
              mapStyle='mapbox://styles/mapbox/streets-v11'
              onViewportChange={setViewport}
              mapboxApiAccessToken={MAPBOX_TOKEN}
            />
          </div>
        )}
        {!error ? (
          <>
            <h1>Météo {cityToDisplay && `à ${cityToDisplay}`}</h1>
            <div className='meteo'>
              <div className='actual-day'>
                <h2>Aujourd'hui</h2>
                <h3>
                  {moment(data[0].dt_txt.split(' ')[0])
                    .format('dddd')
                    .toUpperCase()}
                </h3>
                <img
                  src={`http://openweathermap.org/img/wn/${data[0].weather[0].icon}.png`}
                  alt='Weather Condition'
                />
                <h4> {data[0].weather[0].description.toUpperCase()} </h4>
                <div>
                  <p>
                    Température:{' '}
                    {(parseFloat(data[0].main.temp) - 273.15).toFixed(0)}°{' '}
                  </p>
                </div>
              </div>
              <div className='other-days'>
                {data.map((item, index) => {
                  if (
                    index > 0 &&
                    (index == 3 ||
                      index === 11 ||
                      index === 19 ||
                      index === 27 ||
                      index === 35)
                  ) {
                    return (
                      <div key={item.dt} className='day'>
                        <h3>
                          {moment(item.dt_txt.split(' ')[0], 'YYYY-MM-DD')
                            .format('dddd')
                            .toUpperCase()}
                        </h3>
                        <img
                          src={`http://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                          alt='Weather Condition'
                        />
                        <h4> {item.weather[0].description.toUpperCase()} </h4>
                        <div>
                          <p>
                            Température:{' '}
                            {(parseFloat(item.main.temp) - 273.15).toFixed(0)}°{' '}
                          </p>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          </>
        ) : (
          <h2> {message} </h2>
        )}
      </div>
    </div>
  );
};

export default App;
