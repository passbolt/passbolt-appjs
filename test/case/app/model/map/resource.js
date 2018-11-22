/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SARL (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 */
import "test/bootstrap";
import domEvents from 'can-dom-events';
import Resource from "app/model/map/resource";
import safeUrlTemplate from 'test/case/app/model/map/safeUrl.stache!';
import View from 'passbolt-mad/view/view';

describe("Resource", () => {

  afterEach(() => {
    $('#test-html').empty();
  });

  describe("safeUrl() should return safe and clickable url", () => {
    function checkSafeUri(checks) {
      for (const rule in checks) {
        const input = checks[rule].input;
        const output = checks[rule].output;
        const resource = new Resource({uri: input});
        const safeUrl = resource.safeUrl();
        expect(safeUrl).to.be.equal(output, rule);
      }
    }

    function checkXssClickLink(checks) {
      for (const rule in checks) {
        const input = checks[rule].input;
        const resource = new Resource({uri: input});
        const safeUrl = resource.safeUrl();
        if (safeUrl != '') {
          $('#test-html').empty();
          const html = View.render(safeUrlTemplate, {uri: input, safeUrl: safeUrl});
          $('#test-html').append(html);

          // Dispatch a click event. If the exploit has been executed, the next test will not be able to perform.
          const ev = new MouseEvent("click");
          const el = document.getElementById("safe-url");
          el.dispatchEvent(ev);
        }
      }
    }

    it('should have a default behavior if no protocol defined', () => {
      const checks = {
        'ip v4 address no protocol': {input: '127.0.0.1', output: 'http://127.0.0.1'},
        'ip v6 address no protocol': {input: 'fe80:0000:0000:0000:0204:61ff:fe9d:f156', output: ''}, // The lib cannot recognize IPV6 address when no protocol defined
        'domain name with no protocol': {input: 'passbolt.com', output: 'http://passbolt.com'},
        'email address with no protocol': {input: 'test@passbolt.com', output: 'http://test@passbolt.com'},
        'mailto': {input: 'mailto:test@passbolt.com', output: ''} // Is not considered as an url
      };
      checkSafeUri(checks);
    });

    it('should recognize protocols', () => {
      const checks = {
        'http with ip v6': {input: 'fe80:0000:0000:0000:0204:61ff:fe9d:f156', output: ''},
        'http': {input: 'http://passbolt.com', output: 'http://passbolt.com'},
        'https': {input: 'https://passbolt.com', output: 'https://passbolt.com'},
        'ftp': {input: 'ftp://passbolt.com', output: 'ftp://passbolt.com'},
        'ssh': {input: 'ssh://doe@host.example.com:2222', output: 'ssh://doe@host.example.com:2222'},
        'ldaps': {input: 'ldaps://ldap.example.com/cn=John%20Doe,dc=example,dc=com', output: 'ldaps://ldap.example.com/cn=John%20Doe,dc=example,dc=com'},
        'javascript': {input: 'javascript:document.write("xss")', output: ''}
      };
      checkSafeUri(checks);
    });

    it('should not considered not parsable url as safe', () => {
      const checks = {
        'http with special character': {input: 'http://[staging/production].passbolt.com', output: ''},
        'ssh with special character': {input: 'ssh://[staging/production]@passbolt.com', output: ''},
      };
      checkSafeUri(checks);
    });

    it('should protect against xss uri', () => {
      // Xss based on passbolt/mad/test/fixtures/xss.js
      const checks = {
        'xss JavaScript directive quote semicolon': {input: "javascript:document.write('xss1');", output: ''},
        'xss JavaScript directive quote no semicolon': {input: "javascript:document.write('xss2')", output: ''},
        'xss JavaScript directive double quote': {input: 'javascript:document.write("XSS3")', output: ''},
        'xss JavaScript directive case insensitive': {input: "JaVaScRiPt:document.write('XSS4')", output: ''},
        'xss Javascript directive HTML entities': {input: 'javascript:document.write(&quot;XSS5&quot;)', output: ''},
        'xss Javascript directive fromCharCode': {input: 'javascript:document.write(String.fromCharCode(88,83,83))', output: ''},
        'xss Decimal HTML character references': {input: '&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#100;&#111;&#99;&#117;&#109;&#101;&#110;&#116;&#46;&#119;&#114;&#105;&#116;&#101;&#40;&#39;&#88;&#83;&#83;&#55;&#39;&#41;', output: 'http://&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#100;&#111;&#99;&#117;&#109;&#101;&#110;&#116;&#46;&#119;&#114;&#105;&#116;&#101;&#40;&#39;&#88;&#83;&#83;&#55;&#39;&#41;'},
        'xss Decimal HTML character references without trailing semicolons': {input: '&#0000106;&#0000097;&#0000118;&#0000097;&#0000115;&#0000099;&#0000114;&#0000105;&#0000112;&#0000116;&#0000058;&#0000100;&#0000111;&#0000099;&#0000117;&#0000109;&#0000101;&#0000110;&#0000116;&#0000046;&#0000119;&#0000114;&#0000105;&#0000116;&#0000101;&#0000040;&#0000039;&#0000088;&#0000083;&#0000083;&#0000056;&#0000039;&#0000041;', output: 'http://&#0000106;&#0000097;&#0000118;&#0000097;&#0000115;&#0000099;&#0000114;&#0000105;&#0000112;&#0000116;&#0000058;&#0000100;&#0000111;&#0000099;&#0000117;&#0000109;&#0000101;&#0000110;&#0000116;&#0000046;&#0000119;&#0000114;&#0000105;&#0000116;&#0000101;&#0000040;&#0000039;&#0000088;&#0000083;&#0000083;&#0000056;&#0000039;&#0000041;'},
        'xss Hexadecimal HTML char references without trailing semicolons': {input: '&#x6A&#x61&#x76&#x61&#x73&#x63&#x72&#x69&#x70&#x74&#x3A&#x64&#x6f&#x63&#x75&#x6d&#x65&#x6e&#x74&#x2e&#x77&#x72&#x69&#x74&#x65&#x27&#x58&#x53&#x53&#x39&#x27&#x29', output: 'http://&#x6A&#x61&#x76&#x61&#x73&#x63&#x72&#x69&#x70&#x74&#x3A&#x64&#x6f&#x63&#x75&#x6d&#x65&#x6e&#x74&#x2e&#x77&#x72&#x69&#x74&#x65&#x27&#x58&#x53&#x53&#x39&#x27&#x29'},
        'xss Embedded tab': {input: "jav        ascript:document.write('XSS10');", output: 'http://jav        ascript:document.write(\'XSS10\');'},
        'xss Embedded Encoded tab': {input: "jav&#x09;ascript:document.write('XSS11');", output: "http://jav&#x09;ascript:document.write('XSS11');"},
        'xss Embedded carriage return to break up XSS': {input: "jav&#x0D;ascript:document.write('XSS12');", output: "http://jav&#x0D;ascript:document.write('XSS12');"},
        'xss Embedded newline to break up XSS': {input: "jav&#x0A;ascript:document.write('XSS13');", output: "http://jav&#x0A;ascript:document.write('XSS13');"},
        'xss space and meta chars before the javascript': {input: "&#14;  javascript:document.write('XSS14');", output: "http://&#14;  javascript:document.write('XSS14');"},
        'xss Extraneous >': {input: '"' + "><script>document.write('xss15')</script>", output: 'http://"' + "><script>document.write('xss15')</script>"},
        'xss Extraneous closing double quote': {input: '">' + "onclick=document.write('xxs16')", output: 'http://">' + "onclick=document.write('xxs16')"},
        'xss & JavaScript includes': {input: "&{document.write('XSS17')}", output: "http://&{document.write('XSS17')}"},
        'xss null breaks up javascript directive': {input: 'java\0script:document.write("XSS18")', output: 'http://java\0script:document.write("XSS18")'}
      };
      checkSafeUri(checks);
      checkXssClickLink(checks);
    });

  });
});