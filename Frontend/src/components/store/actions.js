import { _getTimes } from "./mutations"

import { Auth } from "aws-amplify";

export const getLeads = ({ commit, state }) => {
  const headers = new Headers();
  headers.append('authorizationToken', state.userInfo.idToken);

  fetch('https://zdn41z77wc.execute-api.us-east-1.amazonaws.com/Prod/lead/' + state.userInfo.sub, {
    method: 'GET',
    headers: headers
  }
  )
    .then(response => response.json())
    .then(data => commit('_getLeads', data))
    .catch((err) => console.error(err));

}

export const getLocalsEvents = ({ commit, state, dispatch }, dates) => {
  var lastKey = dates.firstMonday
  var lastDay = dates.lastSunday
  if (lastKey == null)
    return

  var localId = state.userInfo.sub
  var weekStart = lastKey
  var pageSize = 10

  const headers = new Headers();
  headers.append('authorizationToken', state.userInfo.idToken);

  fetch('https://zdn41z77wc.execute-api.us-east-1.amazonaws.com/Prod/lead/locals/' + localId + '/' + weekStart + '/' + pageSize, {
    method: 'GET',
    headers: headers
  })

    .then(response => {
      if (response.ok)
        return response.json();
      throw new Error("ERROR AT GETTING EVENTS")
    })
    .then(values => {
      const body = values.body
      if (body) {
        commit('_getLeads', { body: body.results, local: true })
        commit('_pushLocalTimes', { body: body.leadsDay })
        body.hasNextPage ? lastKey = body.lastKey.S : lastKey = null

        if(lastKey == null) 
          return;

        if (body.hasNextPage && paginationCompleted(lastKey, lastDay)) {
          dates = {
            firstMonday : lastKey,
            lastSunday : lastDay
          }
          dispatch('getLocalsEvents', dates)
        }
      }
    })
}





const paginationCompleted = (actualDate, endDay) => {
  if (actualDate == null)
    return false

  const start = new Date(actualDate)
  const end = new Date(endDay)

  if (start.getTime() >= end.getTime()) {
    //no sigue
    return false
  }
  else
    return true

}



export const addLead = ({ commit }, data) => {
  commit('_addLead', data)
}

export const removeTime = ({ commit }, data) => {
  commit('_removeTime', data)
}

export const postLead = ({ commit, state }, data) => {

  fetch('https://zdn41z77wc.execute-api.us-east-1.amazonaws.com/Prod/lead', {
    method: 'POST',
    body: JSON.stringify(data)
  }
  ).then(response => {

  }).then(commit('_addLead', data))
    .catch(err => {

    })
}

export const getAllLocals = ({ commit, state }) => {
  fetch('https://zdn41z77wc.execute-api.us-east-1.amazonaws.com/Prod/local', {
    method: 'GET',
  }).then(response => response.json())
    .then(data => commit('_getAllLocals', data))
    .catch((err) => console.error(err))
}

export const postLeadC = ({ commit, state }, data) => {
  const hourMin = data.hours.split(':')
  const hours = Number(hourMin[0] * 60) + Number(hourMin[1])



  //authenticate and send userId
  const info = {
    type: data.type,
    start: data.start,
    end: data.end,
    localId: data.local.localId,
    name: data.name,
    title: data.title,
    accepted: false,
    hours: hours.toString()
  }


  fetch('https://zdn41z77wc.execute-api.us-east-1.amazonaws.com/Prod/lead', {
    method: 'POST',
    body: JSON.stringify(info)
  })
    .then(response => {
      if (response.status == 200) {

        commit('_addLead', info);
      }
      else {

        throw new Error(response.status)
      }
    })
    .catch(err => {

      return Promise.reject(err)
    })
}

export const getTimes = ({ commit, state }, data) => {
  const headers = new Headers();
  headers.append('authorizationToken', state.userInfo.idToken);

  fetch('https://zdn41z77wc.execute-api.us-east-1.amazonaws.com/Prod/localTime/' + data.localId + '/' + data.day, {
    method: 'GET',
    headers: headers
  })

    .then(response => response.json())
    .then(data => commit('_getTimes', data))
    .catch(err => {

    })
}


export const userAuth = ({ commit, state, dispatch }) => {

  let isLocal
  let sub

  const session = Auth.currentSession().then(session => {
    const accessToken = session.getAccessToken().getJwtToken()
    const idToken = session.getIdToken().getJwtToken()
    sub = session.getIdToken().payload.sub
    const groups = session.getIdToken().payload['cognito:groups'] || []
    const isLocalStr = session.getIdToken().payload['custom:isLocal']





    isLocal = (isLocalStr === 'true')


    const obj = {
      accessToken: accessToken,
      idToken: idToken,
      sub: sub,
      groups: groups,
      isLocal: isLocal
    }
    commit('_userAuth', obj)
    return sub
  }
  )
    .then(auth => {

      if (!isLocal) {

        Promise.all([
          dispatch('getLeads'),
          dispatch('getAllLocals'),
          dispatch('getUserInfo', sub)
        ])
      }
      else if (isLocal) {
        var { firstMonday, lastSunday } = getFirstMondayAndLastSunday(new Date().getMonth());

        var dates = {
          firstMonday,
          lastSunday
        }

        dispatch('getLocalsEvents', dates)


        dispatch('getLocalInfo', state.userInfo.sub)
      }
    })

}

export const getUserInfo = ({ commit, state }, sub) => {

  const headers = new Headers();
  headers.append('authorizationToken', state.userInfo.idToken);


  fetch('https://zdn41z77wc.execute-api.us-east-1.amazonaws.com/Prod/users/' + sub, {
    method: 'GET',
    headers: headers
  }).then(response => {
    if (response.ok)
      return response.json();
    throw new Error("ERROR AT GETTING EVENTS")
  })
    .then(values => {

      const body = values.body
      if (body) {

        commit('_userInfo', body)
      }
    })
}



export const getLocalInfo = ({ commit, state, dispatch }, sub) => {
  const headers = new Headers();
  headers.append('authorizationToken', state.userInfo.idToken);


  fetch('https://zdn41z77wc.execute-api.us-east-1.amazonaws.com/Prod/local/' + sub, {
    method: 'GET',
    headers: headers
  }).then(response => {
    if (response.ok)
      return response.json();
    throw new Error("ERROR AT GETTING EVENTS")
  })
    .then(values => {

      const body = values.body
      if (body) {
        state.locals.push(body[0])
        state.userInfo.name = body[0].name
      }
    })
}



export const confirmLead = ({ commit, state, dispatch }, data) => {
  commit('_confirmLead', data)


}

export const resetStore = ({ commit, state, dispatch }) => {

  commit('_resetStore')
}

function getFirstMondayAndLastSunday(actualMonth) {
  // Get the current year and month
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  // Get the first day of the month
  const firstDayOfMonth = new Date(year, month - 1, 1);
  let firstMonday = new Date();
  if (firstDayOfMonth.getDay() === 1) {
    // First day is a Monday
    firstMonday = firstDayOfMonth.addDays(1)
    firstMonday = firstDayOfMonth.toISOString().substring(0, 10)

  }
  else {
    // First day is some other day

    firstMonday.setDate(2 - firstDayOfMonth.getDay());
    firstMonday = firstMonday.toISOString().substring(0, 10)
  }

  if (!actualMonth) {
    actualMonth = new Date().getMonth()
  };
  // Get the last day of the month
  const lastDayOfMonth = new Date(year, actualMonth, 0);
  // Check if the last day is a Sunday
  if (lastDayOfMonth.getDay() === 0) {
    // Last day is a Sunday, return it
    var lastSunday = lastDayOfMonth.toISOString().substring(0, 10);
  } else {
    // Last day is not a Sunday, find the first Sunday of the next month
    var daysForward = (7 - lastDayOfMonth.getDay()) % 7;
    var lastSunday = new Date(year, month, daysForward + 1).toISOString().substring(0, 10);
  }

  return {
    firstMonday,
    lastSunday
  };

}
export const initializeLocalInfo = ({ commit, state, dispatch }) => {
  commit('_initializeLocalInfo')
}