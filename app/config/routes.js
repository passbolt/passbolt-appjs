import CanDefineMap from 'can-define/map/map';
import route from 'can-route/can-route';

const AppViewModel = CanDefineMap.extend({
  controller: 'string',
  action: 'string'
});
const appState = new AppViewModel();
route.data = appState;

// Default route
route('', {controller: 'Password', action: 'index'});

route.register('/debug', {controller: 'Debug', action: 'index'});

// Groups routes
route.register('/groups/delete/{id}', {controller: 'User', action: 'groupDelete'});
route.register('/groups/edit/{id}', {controller: 'User', action: 'groupEdit'});
route.register('/groups/view/{id}', {controller: 'User', action: 'groupView'});
route.register('/groups/view/{id}/membership', {controller: 'User', action: 'groupViewGroupsUsers'});

// Passwords routes
route.register('/passwords', {controller: 'Password', action: 'index'});
route.register('/passwords/edit/{id}', {controller: 'Password', action: 'edit'});
route.register('/passwords/view/{id}', {controller: 'Password', action: 'view'});

// Users routes
route.register('/users', {controller: 'User', action: 'index'});
route.register('/users/add', {controller: 'User', action: 'add'});
route.register('/users/edit/{id}', {controller: 'User', action: 'edit'});
route.register('/users/delete/{id}', {controller: 'User', action: 'delete'});
route.register('/users/view/{id}', {controller: 'User', action: 'view'});

// User settings routes
route.register('/settings', {controller: 'Settings', action: 'profile'});
route.register('/settings/keys', {controller: 'Settings', action: 'keys'});
route.register('/settings/profile', {controller: 'Settings', action: 'profile'});
route.register('/settings/theme', {controller: 'Settings', action: 'theme'});
route.start();
