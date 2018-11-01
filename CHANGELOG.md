# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
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

[Unreleased]: https://github.com/passbolt/passbolt_api/compare/v2.5.0...HEAD
[2.5.0]: https://github.com/passbolt/passbolt-appjs/compare/v2.4.0...v2.5.0
[2.4.0]: https://github.com/passbolt/passbolt-appjs/compare/v2.3.0...v2.4.0
[2.3.0]: https://github.com/passbolt/passbolt-appjs/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/passbolt/passbolt-appjs/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/passbolt/passbolt-appjs/compare/5df5207...v2.1.0
