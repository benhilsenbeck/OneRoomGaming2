import counterReducer from './counter'
import loggedReducer from './isLogged'
import {combineReducers} from 'redux'

const allreducers = combineReducers({
    counter: counterReducer,
    isLogged: loggedReducer,
})

export default allreducers