import { createStore } from 'vuex'
import * as getters from './getters'
import * as actions from './actions'
import * as mutations from './mutations'


const state = {
  history: [],
  leads: [{
    "start" : "2023-01-18 10:35",
    "end" : "2023-01-18 11:35",
    "local": "Restaurante de alberto",
    "owner": "AlbertoId",
    "id": "ae20f9b7-d291-4a2f-ae3b-97c661fd533f",
    "name": "7 Lead",
    "type": "Restaurant"
}],
locals : [],
userInfo : {
  id: '',
  name: '',
  surname: '',
  phone: '',
  email: '',

  accesToken : '',
  idToken : '',
  sub : '',
  groups : '',
  isLocal : false,

  hasNextPage: true,
  loadedMonths: []
},


timeRanges: [
 /* {
  "localId" : "0000000000000000000000",
  "day" : "2023-02-9",
  "times" : {
    "start": "18:00",
    "end": "18:20"
  }

}*/],

cities : 
  ['Alava','Albacete','Alicante','Almería','Asturias','Avila','Badajoz','Barcelona','Burgos','Cáceres',
'Cádiz','Cantabria','Castellón','Ciudad Real','Córdoba','La Coruña','Cuenca','Gerona','Granada','Guadalajara',
'Guipúzcoa','Huelva','Huesca','Islas Baleares','Jaén','León','Lérida','Lugo','Madrid','Málaga','Murcia','Navarra',
'Orense','Palencia','Las Palmas','Pontevedra','La Rioja','Salamanca','Segovia','Sevilla','Soria','Tarragona',
'Santa Cruz de Tenerife','Teruel','Toledo','Valencia','Valladolid','Vizcaya','Zamora','Zaragoza']

}

const store = createStore({
  state,
  getters,
  actions,
  mutations
})

export default store
