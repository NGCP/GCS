# -*- coding: utf-8 -*-

import re
import json

from sphinx.locale import _

with open('../package.json') as json_file:
    data = json.load(json_file)

project = u'Ground Control Station'
slug = re.sub(r'\W+', '-', project.lower())
author = data['author']
copyright = data['author']
version = data['version']
release = data['version']
language = 'en'

extensions = []

templates_path = ['_templates']
source_suffix = '.rst'
exclude_patterns = [u'_build', 'Thumbs.db', '.DS_Store']

master_doc = 'index'
language = None
pygments_style = None

html_theme = 'sphinx_rtd_theme'
html_theme_options = {
}
html_show_sourcelink = False
html_favicon = '../resources/images/icon.png'

htmlhelp_basename = slug

latex_documents = [
  ('index', '{0}.tex'.format(slug), project, author, 'manual'),
]

man_pages = [
    ('index', slug, project, [author], 1)
]

texinfo_documents = [
  ('index', slug, project, author, slug, project, 'Miscellaneous'),
]

epub_title = project
epub_exclude_files = ['search.html']

def setup(app):
    from sphinx.domains.python import PyField
    from sphinx.util.docfields import Field

    app.add_object_type(
        'confval',
        'confval',
        objname='configuration value',
        indextemplate='pair: %s; configuration value',
        doc_field_types=[
            PyField(
                'type',
                label=_('Type'),
                has_arg=False,
                names=('type',),
                bodyrolename='class'
            ),
            Field(
                'default',
                label=_('Default'),
                has_arg=False,
                names=('default',),
            ),
        ]
    )
