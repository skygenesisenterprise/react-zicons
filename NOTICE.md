React-Zicons
============

Original project code
---------------------

The React-Zicons implementation in this repository is original work by
Sky Genesis Enterprise and is licensed under the MIT License. See LICENSE.

Upstream icon assets
--------------------

The SVG icon assets under `vendor/phosphor/assets` are derived from
Phosphor Icons Core:

  Repository: https://github.com/phosphor-icons/core
  Version:    2.1.1
  Commit:     2b75f3ad12b420c9504ef05df8d2564a28f8500e
  License:    MIT
  Copyright:  Copyright (c) 2023 Phosphor Icons

Phosphor Icons is an independent project. Sky Genesis Enterprise does not
claim ownership of the Phosphor icon artwork. The Phosphor MIT license text is
preserved in `vendor/phosphor/LICENSE` and applies to the upstream assets.

Upstream-derived metadata
-------------------------

The icon catalog metadata under `vendor/phosphor/metadata` is derived from the
Phosphor Icons Core package. It is distributed under the same MIT license and
copyright notice.

Upstream architectural references
---------------------------------

The public API and rendering model of this package were informed by the
architecture of `@phosphor-icons/react`:

  https://github.com/phosphor-icons/react

The implementation in this repository is independently written for React-Zicons.
No upstream React component source is copied verbatim.

Third-party dependencies
------------------------

Development and runtime dependency licenses are listed by their respective
packages. React is a peer dependency and is not bundled with this package.
