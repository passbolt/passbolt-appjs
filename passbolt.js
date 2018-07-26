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
import $ from 'jquery';

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

	// Start the application bootstrap.
	new AppBootstrap();
});
