import { utils } from "../methods/utils"
import RedCircle from "@/assets/imgs/RedCircle.svg"

import GreenCircle from "@/assets/imgs/Success.svg"


export const _getLeads = (state, data) => {

  data.body.forEach(element => {
    if (data.hasOwnProperty('local')) {

      if (element.hasOwnProperty('custom') && element.custom === true) {
        element.class = element.type
      }

      else if (element.hasOwnProperty('userName')) {
        element.title = element.userName
      }


      if (!(element.hasOwnProperty('custom') && element.custom === true)) {
        if (element.accepted) {
          element.class = 'accepted'
        }
        else {
          element.class = 'denied'
        }
      }
    }
    else {
      if (element.hasOwnProperty('type')) {
        if (!element.hasOwnProperty('class')) {
          element.class = element.type
          if (element.type != "custom" && !element.hasOwnProperty('custom')) {
            if (element.accepted)
              element.class += "-accepted"
            else
              element.class += "-denied"
          }
        }
      }
    }
    if (element.accepted) {
      element.content = '<img src="' + GreenCircle +'" alt="Accepted event" width="500" height="600"></img>'
    }
    else if (!element.accepted) {
      element.content = '<i class="icon material-icons"> <img src="' + RedCircle + '" alt="Waiting approval" width="25" height="25"></img></i>'

    }
    if (element.hasOwnProperty('description')) {
      element.content = element.description
    }
    const objIndex = state.leads.findIndex((obj => obj.id == element.id))
    if (objIndex == -1)
      state.leads.push(element)
    else {
      state.leads[objIndex] = element
    }

  });

}


export const _userInfo = (state, data) => {
  state.userInfo.surname = data.surname
  state.userInfo.id = data.userId
  state.userInfo.family_name = data.family_name
  state.userInfo.phone = data.phone
  state.userInfo.name = data.name
  state.userInfo.email = data.email
}

export const _addMonth = (state, data) => {
  if (!state.userInfo.loadedMonths.includes(data))
    state.userInfo.loadedMonths.push(data)
}

export const _confirmLead = (state, data) => {
  if (state.leads.find(lead => lead.id == data.id)) {
    const index = state.leads.findIndex(lead => lead.id == data.id)
    state.leads[index].accepted = data.accepted
    if (data.accepted)
      state.leads[index].class = 'accepted'
    else {
      state.leads[index].class = 'deleted'

    }

  }
}

export const _addLead = (state, data) => {
  if (data.hasOwnProperty('user')) {
    data.accepted ? data.class = data.type + "-accepted" : data.class = data.type + "-denied"
    delete (data.user)
  }
  else
    data.accepted ? data.class = "accepted" : data.class = "denied"

  if (data.custom == true)
    data.class = data.type

  state.leads.push(data)

  const day = utils.formatDate(data.start)
  const objIndex = state.timeRanges.findIndex((obj => obj.day == day))


  const hours = parseInt(data.hours)
  var indFree = state.timeRanges[objIndex].freeTimes.findIndex(obj => obj.time == hours)

  if (state.timeRanges[objIndex].freeTimes[indFree].spaces > 1) {
    let newNumber = state.timeRanges[objIndex].freeTimes[indFree].spaces = state.timeRanges[objIndex].freeTimes[indFree].spaces - 1

    state.timeRanges[objIndex].readableTimes[indFree] = state.timeRanges[objIndex].readableTimes[indFree].replace(/\(\d+\)/, `(${newNumber})`)
  }
  else {
    state.timeRanges[objIndex].freeTimes.splice(indFree, 1)
    state.timeRanges[objIndex].readableTimes.splice(indFree, 1)
  }

}

export const _getAllLocals = (state, data) => {
  state.locals = data.body
}

export const _getTimes = (state, data) => {
  if (data.body != undefined) {
    const objIndex = state.timeRanges.findIndex((obj => obj.localId == data.body.localId && obj.day == data.body.day))
    data.body.freeTimes.sort(function (a, b) {
      return a.time - b.time;
    })
    data.body.readableTimes = makeTime(data.body.freeTimes)
    if (objIndex == -1)
      state.timeRanges.push(data.body)
    else
      state.timeRanges[objIndex] = data.body

  }
}


export const _pushLocalTimes = (state, data) => {
  if (data.body != undefined) {
    data.body.forEach(element => {
      const objIndex = state.timeRanges.findIndex((obj => obj.localId == element.localId && obj.day == element.day))
      element.freeTimes.sort((a, b) => {
        return a.time - b.time;
      })
      element.readableTimes = makeTime(element.freeTimes)
      if (objIndex == -1)
        state.timeRanges.push(element)
      else
        state.timeRanges[objIndex] = element

    });
  }

}

export const _removeTime = (state, data) => {
  const timeIndex = state.timeRanges.findIndex(obj => obj.localId == data.localId && obj.day == data.day)
  state.timeRanges.splice(timeIndex, 1)
}

function makeTime(date) {
  var redable = []
  for (var i = 0; i < date.length; i++) {
    var hour = Math.floor(date[i].time / 60)
    var min = date[i].time % 60
    if (hour < 10)
      hour = "0" + hour
    if (min < 10)
      min = "0" + min
    redable.push(hour + ":" + min + "  " + "(" + date[i].spaces + ")")
  }
  return redable
}

export const updateName = (state, data) => {
  state.userInfo.name = data
}

export const _updateUserInfo = (state, data) => {
  const updatedObject = { ...state.userInfo, ...data };

  state.userInfo = updatedObject;
}

export const _userAuth = (state, data) => {
  state.userInfo.accessToken = data.accessToken
  state.userInfo.idToken = data.idToken
  state.userInfo.sub = data.sub,
    state.userInfo.groups = data.groups
  state.userInfo.isLocal = data.isLocal
}

export const _resetStore = (state) => {
  state.leads = []
  state.locals = []
  state.userInfo = {}
  state.userInfo.loadedMonths = []
  state.timeRanges = []
}

export const _initializeLocalInfo = (state) => {
  state.locals[0] = {
    name: "",
    given_name: ""
  }
}