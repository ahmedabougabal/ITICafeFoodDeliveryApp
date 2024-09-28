import React, { useEffect, useReducer } from 'react'
import { getAll, search } from '../../services/FoodService';
import Thumbnails from '../../components/Thumbnails/Thumbnails';
import { useParams } from 'react-router-dom';
import Search from '../../components/Search/Search';


const initialState = { foods: []};
const reducer = (state :any,action :any) => {
  switch(action.type){
    case 'FOODS_LOADED':
      return {...state, foods: action.payload };
    default:
      return state;
  }
};
const HomePage = () => {
  const [state,dispatch] = useReducer(reducer,initialState);
  const {foods} = state;
  const {searchTerm} = useParams();

  useEffect( ()=>{
    
    const loadedFood = searchTerm ? search(searchTerm):getAll();
    loadedFood.then(foods => dispatch({type:'FOODS_LOADED',payload:foods}))
  },[searchTerm])
  return (
    <>
    <Search />
    <Thumbnails foods={foods} />
    </>
  )
}

export default HomePage