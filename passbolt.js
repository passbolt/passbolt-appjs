/**
 * @page passbolt Passbolt
 * @tag passbolt
 * @parent index
 *
 * The passbolt page
 *
 */
import AppBootstrap from 'app/bootstrap';
import Config from 'passbolt-mad/config/config';
import 'lib/p3_narrow/p3.narrow';
import notificationConfig from 'app/config/notification.json';
import appConfig from 'app/config/config.json';
import $ from 'can-jquery';

$(document).ready(function () {
	// Adds classes to an element (body by default) based on document width.
	$.p3.narrow({
		sizes: {
			fourfour:   440,
			fourheight: 480,
			fivefour:   540,
			six: 		600,
			ninefive: 	980,
			nineheight: 980
		}
	});

	// Load the config served by the CakePHP.
	// The variable cakephpConfig is define directly in the DOM.
	Config.loadFile(document.location.href + 'settings.json?contain[header]=0', 'server');
	// Load the application config.
	Config.load(appConfig);
	// Load notifications config.
	Config.load(notificationConfig);

	// Start the application bootstrap.
	new AppBootstrap();
});
