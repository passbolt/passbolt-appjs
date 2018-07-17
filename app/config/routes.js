import CanDefineMap from 'can-define/map/map';
import route from 'can-route/can-route';

const AppViewModel = CanDefineMap.extend({
  controller: 'string',
  action: 'string'
});
const appState = new AppViewModel();
route.data = appState;

// Home page
route('', {controller: 'Password', action: 'index'});

// Passwords routes
route.register('/passwords', {controller: 'Password', action: 'index'});
route.register('/passwords/view/{id}', {controller: 'Password', action: 'view'});

// Users routes
route.register('/users', {controller: 'User', action: 'index'});

// User settings routes
route.register('/settings', {controller: 'Settings', action: 'index'});
route.start();
