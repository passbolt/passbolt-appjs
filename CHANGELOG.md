# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
- PB-575: As AD I can see the MFA status of each user in the users grid
- PB-639: As LU I can delete a personal tag
- PB-687: As an admin I can resend an invitation for a user that didn't complete the setup

### Fixed
- GITHUB-16: Opening an URI in a new tab leads to /SAFE_URI
- PB-883: Fix dependencies vulnerabilities

## [2.11.3] - 2019-08-07
### Fixed
- Don't display the session expired popup when the user clicks on logout

## [2.11.2] - 2019-08-04
### Fixed
- PB-611: Fix tags autocomplete can trigger XSS
- Fix password grid contextual menu, open uri in a new tab can trigger XSS

## [2.11.1] - 2019-08-02
### Fixed
- Fix plugin "is ready" detection

## [2.11.0] - 2019-08-02
### Improved
- PB-242: Performance - Fetch the passwords in priority
- Extend resource checkbox clickable area
- Select the just created resource
- Select created tag after the import of resources
- Unselect the select all checkbox if all passwords are not selected
- PB-567: Retrieve the user authenticated status from the browser extension

### Fixed
- Take in account the search even if the passwords list is not loaded
- Log the user out when the session is expired

## [2.10.4] - 2019-07-11
### Fixed
- PB-504: update dependencies

## [2.10.3] - 2019-07-10
### Fixed
- Publish latest build

## [2.10.2] - 2019-07-10
### Improved
- PB-391: As an admin deleting a user I should see the name and email of the user i'm about the delete in the model dialog
- PB-396: As a user deleting a password I should see the name of the password i’m about to delete in the modal
- PB-397: As a user in the user workspace, I should see a relevant feedback if a user is not a member of any group
- PB-364: Fix Pressing enter on tag editor doesn't hide autocomplete
- PB-366: Undeletable tags shouldn't have the "delete" button
- Migrate the passwords grid in react
- PB-242: Performance - The passwords should be fetched in priority
- Extend resource checkbox clickable area
- Select the just created resource

### Fixed
- PB-337: Tag autocomplete shows suggestions that are already in the list
- PB-425: Fix documentation URL in the Email Notification screen
- PB-416: As an admin using Yubikey I should be able to setup a secret key with a '+' sign in it

### Fixed
- Select created tag after the import of resources
- Unselect the select all checkbox if not all passwords are selected
- The search should be applied even if the passwords take long to load

## [2.10.1] - 2019-05-15
### Fixed
- PB-167: Email notification settings admin screen should be available on CE

## [2.10.0] - 2019-05-15
### Added
- PB-167: Email notification settings admin screen

### Improved
- PB-195: Ensure the requests to the API are made in v2

## [2.8.4] - 2019-04-15
### Improved
- PB-48: Performance - remove the creator/modifier from the resources workspace grid query
- PB-159: Remove the usage of canjs connect-hydrate module

### Fixed
- GITHUB-10: Selecting a group on the users workspace should not reset the grid "Last Logged In" column to "Never"
- GITHUB-62: Sorting the users on the users workspace should not break the infinite scroll
- PB-160: Update jquery

## [2.8.3] - 2019-04-10
### Fixed
- GITHUB-299: Fix - Passwords are shown twice in workspace list

## [2.8.2] - 2019-04-09
### Fixed
- PB-147: Update the steal dependency

## [2.8.1] - 2019-04-09
### Fixed
- GITHUB-315: Fix the permalink of the passwords

## [2.8.0] - 2019-04-01
### Added
- PB-1: Audit Logs - Browse the resources and see the activity logs to see who is doing what on them

### Improved
- PASSBOLT-3443: LDAP: Fix "in settings, username and password should not be compulsory fields"
- PASSBOLT-3327: LDAP: Improve administration UI
- PASSBOLT-3328: LDAP: Add test connection option

## [2.7.0] - 2019-02-06
### Added
- PASSBOLT-2978: Open a paginated grid on a page containing a target item
- PASSBOLT-3285: The url should be updated when the user is selecting a password
- PASSBOLT-2995: As LU I should be able to copy the permalink of a password
- PASSBOLT-3312: As GM adding a user to a group I should see a relevant feedback in case of network/proxy errors
- PASSBOLT-3318: As LU I should retrieve a secret when I'm copying it
- PASSBOLT-3319: As LU I should retrieve a secret when I'm editing it
- PASSBOLT-3403: As LU I should retrieve secrets when I'm exporting the associated passwords
- PASSBOLT-3397: Remove the list of secrets from the API request while loading the list of passwords

### Fixed
- PASSBOLT-3268: BaseDN should not be mandatory
- PASSBOLT-3269: Search on administration screen should be disabled

## [2.6.2] - 2018-12-04
### Fixed
- Only admin should see the admin panel navigation link

## [2.6.1] - 2018-12-04
### Fixed
- Fix users directory form typo

## [2.6.0] - 2018-12-04
### Added
- PASSBOLT-3130: As AD I can configure my users directory integration from the administration panel
- PASSBOLT-3121: As AD I can configure my multi factor authentication integrations from the administration panel
- PASSBOLT-3235: As AD I can synchronize my users directory from the administration panel

## [2.5.3] - 2018-11-17
### Improved
- Add travis job

## [2.5.2] - 2018-11-02
### Improved
- Add the build to the repository

## [2.5.1] - 2018-11-01
### Improved
- PASSBOLT-3188: As LU the UI shouldn't crash if a password uri cannot be parsed

## [2.5.0] - 2018-10-30
### Added
- PASSBOLT-3093: As LU I can select all passwords to perform a bulk operation

### Fixed
- PASSBOLT-3150: I should not see duplicates rows when I filter my passwords by keywords

## [2.4.0] - 2018-10-12
### Added
- PASSBOLT-2972: As LU I should be able to delete multiple passwords in bulk
- PASSBOLT-2983: As LU I should be able to share multiple passwords in bulk

### Improved
- PASSBOLT-3073: As LU I should get a visual feedback directly after filtering the passwords or the users workspace
- PASSBOLT-2972: As LU I should be able to select multiple passwords with standard keyboard interactions (command and shift keys)

### Fixed
- PASSBOLT-2534: As LU I should not be able to copy to clipboard empty login/url
- PASSBOLT-2017: As LU when I save a password (create/edit) the dialog shouldn't persist until the request is processed by the API
- PASSBOLT-3063: Fix appjs base url and subfolder
- PASSBOLT-3024: As LU I can access the theme manager screen via /settings/theme url
- PASSBOLT-2976: Fix API requests issues when the user is going to another workspace
- PASSBOLT-2982: Fix session expired check
- PASSBOLT-3086: As LU when I have 100+ passwords I cannot see the passwords after the 100th more than once

## [2.3.0] - 2018-08-30
### Fixed
- Route rewriting should take in account passbolt installed in a subirectory
- PASSBOLT-2965: Group filter link stays active after switching to a non group filter
- Fix the loading bar stuck in the initialization state

### Improved
- PASSBOLT-2950: Display empty content feedbacks
- PASSBOLT-2971: Reset the workspaces when a resource or a user is created
- PASSBOLT-2267: As an admin deleting a user I can transfer ownership of this user shared passwords to another user that have read access.

## [2.2.0] - 2018-08-13
### Added
- PASSBOLT-2906: Enable CSRF protection

### Fixed
- PASSBOLT-2896: Fix filter by tag from the password details sidebar
- PASSBOLT-2903: Fix logout link. It should target a full based url link
- PASSBOLT-2926: Fix session timeout check
- PASSBOLT-2940: Implement routes
- PASSBOLT-2805: Sort by date fix and sort by user first_name by default

### Improved
- PASSBOLT-2933: Upgrade to canjs 4
- PASSBOLT-2941: Grid performance fix

## [2.1.0] - 2018-06-14
### Added
- PASSBOLT-2878: Integrate dark theme
- PASSBOLT-2861: Make username clickable for copy to clipboard

### Fixed
- PASSBOLT-1917: Upgrade to canjs 3.x
- PASSBOLT-2883: Fix logout link and remember me cleanup
- PASSBOLT-2886: Fix fingerprint tooltips in user group management dialog
- PASSBOLT-2894: Fix missing div breaking elipsis on long url in password workspace
- PASSBOLT-2891: Fix group edit users tooltips
- PASSBOLT-2884: Update header left menu. Remove home and add help
- PASSBOLT-2885: Update user settings menus
- PASSBOLT-2895: Fix/homogenize notifications

# Terminology
- AN: Anonymous user
- LU: Logged in user
- AP: User with plugin installed
- LU: Logged in user

[Unreleased]: https://github.com/passbolt/passbolt_api/compare/v2.11.3...HEAD
[2.11.3]: https://github.com/passbolt/passbolt-appjs/compare/v2.11.2...v2.11.3
[2.11.2]: https://github.com/passbolt/passbolt-appjs/compare/v2.11.1...v2.11.2
[2.11.1]: https://github.com/passbolt/passbolt-appjs/compare/v2.11.0...v2.11.1
[2.11.0]: https://github.com/passbolt/passbolt-appjs/compare/v2.10.4...v2.11.0
[2.10.4]: https://github.com/passbolt/passbolt-appjs/compare/v2.10.3...v2.10.4
[2.10.3]: https://github.com/passbolt/passbolt-appjs/compare/v2.10.2...v2.10.3
[2.10.2]: https://github.com/passbolt/passbolt-appjs/compare/v2.10.1...v2.10.2
[2.10.1]: https://github.com/passbolt/passbolt-appjs/compare/v2.10.0...v2.10.1
[2.10.0]: https://github.com/passbolt/passbolt-appjs/compare/v2.8.4...v2.10.0
[2.8.4]: https://github.com/passbolt/passbolt-appjs/compare/v2.8.3...v2.8.4
[2.8.3]: https://github.com/passbolt/passbolt-appjs/compare/v2.8.2...v2.8.3
[2.8.2]: https://github.com/passbolt/passbolt-appjs/compare/v2.8.1...v2.8.2
[2.8.1]: https://github.com/passbolt/passbolt-appjs/compare/v2.8.0...v2.8.1
[2.8.0]: https://github.com/passbolt/passbolt-appjs/compare/v2.7.0...v2.8.0
[2.7.0]: https://github.com/passbolt/passbolt-appjs/compare/v2.6.2...v2.7.0
[2.6.2]: https://github.com/passbolt/passbolt-appjs/compare/v2.6.1...v2.6.2
[2.6.1]: https://github.com/passbolt/passbolt-appjs/compare/v2.6.0...v2.6.1
[2.6.0]: https://github.com/passbolt/passbolt-appjs/compare/v2.5.3...v2.6.0
[2.5.3]: https://github.com/passbolt/passbolt-appjs/compare/v2.5.2...v2.5.3
[2.5.2]: https://github.com/passbolt/passbolt-appjs/compare/v2.5.1...v2.5.2
[2.5.1]: https://github.com/passbolt/passbolt-appjs/compare/v2.5.0...v2.5.1
[2.5.0]: https://github.com/passbolt/passbolt-appjs/compare/v2.4.0...v2.5.0
[2.4.0]: https://github.com/passbolt/passbolt-appjs/compare/v2.3.0...v2.4.0
[2.3.0]: https://github.com/passbolt/passbolt-appjs/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/passbolt/passbolt-appjs/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/passbolt/passbolt-appjs/compare/5df5207...v2.1.0
