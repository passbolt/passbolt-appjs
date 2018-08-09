# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Fixed
- PASSBOLT-2896: Fix filter by tag from the password details sidebar
- PASSBOLT-2906: Enable CSRF protection
- PASSBOLT-2903: Fix logout link. It should target a full based url link
- PASSBOLT-2933: Upgrade to canjs 4
- PASSBOLT-2926: Fix session timeout check
- PASSBOLT-2940: Implement routes
- PASSBOLT-2941: Grid performance fix
- PASSBOLT-2805: Sort by date fix and sort by user first_name by default

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

[Unreleased]: https://github.com/passbolt/passbolt_api/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/passbolt/passbolt-appjs/compare/5df5207...v2.1.0
