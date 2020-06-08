import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import { Map, TileLayer, Marker, } from 'react-leaflet';
import {LeafletMouseEvent} from 'leaflet';
import Axios from 'axios';
import Lottie from 'react-lottie';
import animationData from '../../assets/confirm.json';
import api from '../../services/api';


import './styles.css';

import logo from '../../assets/logo.svg';


interface Item {
  id: number;
  title: string;
  img_url: string;
}

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

const CreatePoint = () => {
  const [submited, setSubmited] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUFs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);

  const [selectedUF, setSelectedUF] = useState("0");
  const [selectedCity, setSelectedCity] = useState("0");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);  
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  })

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      setInitialPosition([
        position.coords.latitude,
        position.coords.longitude
      ])
    })
  });

  useEffect(() => { 
    api.get('items').then(response => {
      setItems(response.data);
    });
  }, []); 

  useEffect(() => { 
    Axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
      const ufInitials = response.data.map(uf => uf.sigla);
      setUFs(ufInitials);
    });
  }, []); 

  //load cities everytime UF change
  useEffect(() => { 
    Axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`).then(response => {
      const cityNames = response.data.map(uf => uf.nome);

      setCities(cityNames);
    });
  }, [selectedUF]);

  //permitira navegar para outra rota
  const history = useHistory();

  //configurações de animação
  const defaultOptions = {
    loop: false,
    autoplay: true, 
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  function handleSelectUF(event: ChangeEvent<HTMLSelectElement>){
    const uf = event.target.value;

    setSelectedUF(uf);
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>){
    const city = event.target.value;

    setSelectedCity(city);
  }

  function handleMapClick(event:LeafletMouseEvent){
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ]);
  }

  function handleInputChange(event:ChangeEvent<HTMLInputElement>){
    const {name, value} = event.target;

    setFormData({
      ...formData,
      [name]: value
    })
  }

  function handleSelectedItem(id: number){
    const alreadySelected = selectedItems.findIndex(item => item === id);

    if(alreadySelected >= 0){
      const filteredItems = selectedItems.filter(item => item !== id);

      setSelectedItems(filteredItems);
    }else{
      setSelectedItems([
        ...selectedItems, 
        id
      ])
    }
  }

  async function handleSubmit(event:FormEvent){
    //evita o submit de efetuar refresh da tela
    event.preventDefault();
    
    const {name, email, whatsapp} = formData;
    const uf = selectedUF;
    const city = selectedCity;
    const [lat, long] = selectedPosition;
    const items = selectedItems;
    
    const data = {
      name,
      email,
      whatsapp,
      uf,
      city,
      lat,
      long,
      items
    };

    try {
      await api.post('points',data);      

      setSubmited(true);

      setTimeout(() => {
        setSubmited(false);
        history.push('/');
      },2000)


      
    } catch (e){
      console.log(e);
    };

    
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="ColetaWeb"/>
        <Link to="/"><FiArrowLeft /> Voltar para home</Link>
      </header> 

      <form action="" onSubmit={handleSubmit}>
        <h1>Cadastro do <br/> Ponto de Coleta</h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            /> 
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                type="text"
                name="email"
                id="email"
                onChange={handleInputChange}
              /> 
            </div>

            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              /> 
            </div>
          </div>
          
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onclick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={selectedPosition[0] === 0 && selectedPosition[1] === 0 ? initialPosition : selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="Estado (UF)"></label>
              <select 
                name="uf" 
                id="uf" 
                value={selectedUF} 
                onChange={handleSelectUF}
              >
                <option value="0">Selecione uma UF</option>
                {ufs.map(uf => (
                  <option key={uf} value={uf}>{uf}</option> 
                ))}
              </select>
            </div>
           

            <div className="field">
              <label htmlFor="city"></label>
              <select 
                name="city" 
                id="city"
                value={selectedCity}
                onChange={handleSelectCity}
              >
                <option value="0">Selecione uma Cidade</option>
                {cities.map(citie => (
                  <option key={citie} value={citie}>{citie}</option> 
                ))}
              </select>
            </div>
          </div>           
        </fieldset>
        <fieldset>
          <legend>
            <h2>Itens de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map(item =>
              <li 
                key={item.id} 
                onClick={() => handleSelectedItem(item.id)}
                className={selectedItems.includes(item.id) ? 'selected' : ''}
              >
                
                <img src={item.img_url} alt={item.title}/>
                <span>{item.title}</span>
              </li>
            )}
                       
          </ul>
        </fieldset>

        <button type="submit">
          <span><FiCheck/></span>
          Cadastrar ponto de coleta
        </button>
      </form>
      {
        submited 
        ?
          <div className="confirm-modal">
            <div className="animation">
              <Lottie options={defaultOptions}
                      height={400}
                      width={400}
              />
            
            <h1>Ponto de coleta <br/>cadastrado com sucesso!</h1>
            </div>
          </div> 
        :
          null         
      }
      <div>
      </div>    
    </div>
  );
}

export default CreatePoint;