import { combineReducers } from 'redux';
import auth from './auth_reducer';
import map from './map_reducers';

export default combineReducers({
  auth, map
});
