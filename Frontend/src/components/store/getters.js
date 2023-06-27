
export const returnCities = state => state.cities

export const recentHistory = state => {
  return state.history
    .slice(-5)
    .join(', ')
}

export const returnAllLeads = state => {
  return state.leads
}

export const returnLocals = state => {
  return state.locals
}

export const returnTypes = state => {
   const names = ['leisure', 'sport', 'health']
    return names
}

export const returnCustomTypes = state => {
  return ['leisure', 'sport', 'health', 'custom']
}


export const returnLocalsByName = state => id =>{
  state.locals.forEach(element => {
    if(id == element.localId){
      

      return element.name
    }
  });
}


export const returnLocalsByType = state => type => {
  //
  const names = []
  state.locals.forEach(element => {
    if(element.type == type){
      names.push(element)
    }
    
  });
  
  return names
}
/*
export const returnAvailableTimes = state => type => {
  return state.timeRanges
}
*/

export const returnAvailableTimes = state => (local, day) => {
  if(local == -1){
    
    const nullValue = []
    return nullValue
  }
  var loc = []
  state.timeRanges.forEach(element => {
    if(element.localId == local && element.day == day){
      loc = Object.values(element.readableTimes)
      
    }  
  
  });
  if(loc.length == 0){
    return -1;
  }

  return loc

}


export const returnUserInfo = state => {
  return state.userInfo;
}













