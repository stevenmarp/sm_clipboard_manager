# -*- coding: utf-8 -*-
{
    'name': 'SM Clipboard Manager',
    'version': '16.0.1.0.0',
    'category': 'Productivity',
    'summary': 'Clipboard history manager in systray for quick access to copied content',
    'description': """
SM Clipboard Manager
====================
A clipboard history manager widget in systray.

Features:
- Save clipboard history automatically
- Pin important items for quick access
- Search through clipboard history
- One-click copy to clipboard
- Clear history with confirmation
- Supports text content
- Keyboard shortcut (Ctrl+Shift+V)
- Data persists in localStorage
- Maximum 50 items history
    """,
    'author': 'Steven Marp',
    'website': 'https://apps.odoo.com/apps/browse?repo_maintainer_id=512936',
    'license': 'OPL-1',
    'depends': ['web'],
    'data': [],
    'assets': {
        'web.assets_backend': [
            'sm_clipboard_manager/static/src/components/**/*',
        ],
    },
    'images': ['static/description/banner.gif'],
    'installable': True,
    'auto_install': False,
    'application': True,
    'price': 0.00,
    'currency': 'USD',
}
