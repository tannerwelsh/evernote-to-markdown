const filenamify = require('filenamify')
    , toMarkdown = require('to-markdown')
    , yaml = require('js-yaml')
    , {mediaFolder} = require('./config')

module.exports = format

function format(parsedNote) {
  let { metadata, content, media } = parsedNote
    , noteMarkdown = {}
    , noteMedia

  if (media) {
    noteMedia = {
      filename: media.filename
    , content: media.content
    }

    content = `![${media.filename}](${mediaFolder}/${media.filename})`
  }

  noteMarkdown.filename = formatFilename(metadata.title, '.md')
  noteMarkdown.content = [
      '---'
    , formatHeader(metadata)
    + '---'
    , formatContent(content)
  ].join('\n')

  return [ noteMarkdown, noteMedia ]
}

function formatFilename(title, extension) {
  return filenamify(title, {replacement: '-'}) + extension
}

function formatHeader(metadata) {
  const headerYAML = yaml.safeDump(metadata)
  return headerYAML
}

function formatContent(contentHTML) {
  const converters = [
    {
      filter: 'div',
      replacement: (content) => '\n' + content + '\n'
    }
  , {
      filter: 'en-note',
      replacement: (content) => '\n' + content + '\n'
    }
  ]

  return toMarkdown(contentHTML, {converters, gfm: true})
}
