import CanDefineMap from 'can-define/map/map';
import route from 'can-route';
import RoutePushstate from 'can-route-pushstate';
import $ from 'jquery';

const AppViewModel = CanDefineMap.extend({
  controller: 'string',
  action: 'string'
});
const appState = new AppViewModel();
route.data = appState;
route.urlData = new RoutePushstate();
const appUrl = new URL($('base').attr('href'));
route.urlData.root = appUrl.pathname;

// Administration routes
route.register('/app/administration/users-directory/edit', {controller: 'Administration', action: 'usersDirectory/edit'});
route.register('/app/administration/users-directory', {controller: 'Administration', action: 'usersDirectory'});
route.register('/app/administration/mfa', {controller: 'Administration', action: 'mfa'});
route.register('/app/administration', {controller: 'Administration', action: 'mfa'});

// Groups routes
route.register('/app/groups/delete/{id}', {controller: 'User', action: 'groupDelete'});
route.register('/app/groups/edit/{id}', {controller: 'User', action: 'groupEdit'});
route.register('/app/groups/view/{id}', {controller: 'User', action: 'groupView'});
route.register('/app/groups/view/{id}/membership', {controller: 'User', action: 'groupViewMembership'});

// Passwords routes
route.register('/app/passwords', {controller: 'Password', action: 'index'});
route.register('/app/passwords/edit/{id}', {controller: 'Password', action: 'edit'});
route.register('/app/passwords/view/{id}', {controller: 'Password', action: 'view'});
route.register('/app/passwords/view/{id}/comments', {controller: 'Password', action: 'commentsView'});

// Users routes
route.register('/app/users', {controller: 'User', action: 'index'});
route.register('/app/users/add', {controller: 'User', action: 'add'});
route.register('/app/users/edit/{id}', {controller: 'User', action: 'edit'});
route.register('/app/users/delete/{id}', {controller: 'User', action: 'delete'});
route.register('/app/users/view/{id}', {controller: 'User', action: 'view'});

// User settings routes
route.register('/app/settings/keys', {controller: 'Settings', action: 'keys'});
route.register('/app/settings/profile', {controller: 'Settings', action: 'profile'});
route.register('/app/settings/theme', {controller: 'Settings', action: 'theme'});
route.register('/app/settings/mfa', {controller: 'Settings', action: 'mfa'});
route.register('/app/settings', {controller: 'Settings', action: 'profile'});

// Default route
route.register('', {controller: 'Password', action: 'index'});

route.start();
