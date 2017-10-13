const xml2js = require('xml2js')
    , moment = require('moment')

module.exports = parse

const Parser = new xml2js.Parser()

function parse(evernoteXML, callback) {
  Parser.parseString(evernoteXML, function (err, result) {
    const notes = result['en-export']['note']
    const parsedNotes = notes.map(parseNote)

    callback(err, parsedNotes)
  })
}

function parseNote(noteData) {
  const metadata = parseMetadata(noteData)
  const content = noteData['content'][0]
  const media = parseMedia(noteData)

  if (media) {
    metadata.mediaFile = media.filename
  }

  return {
    metadata,
    content,
    media
  }
}

function parseMetadata(noteData) {
  const {title, created, updated, tag, resource} = noteData
  const attributes = noteData['note-attributes'][0]

  const metadata = {
    title: title[0]
  , created: moment(created[0]).toDate()
  , updated: moment(updated[0]).toDate()
  , sourceApp: 'Evernote'
  }

  if (tag)
    metadata.tag = noteData.tag

  const optionalAttrs = ['latitude', 'longitude', 'altitude', 'source']

  optionalAttrs.forEach(attr => {
    if (attributes[attr] && attributes[attr][0]) {
      metadata[attr] = attributes[attr][0]
    }
  })

  if (resource && resource[0]) {
    const ignore = /data|recognition/

    const media = {}

    Object.keys(resource[0]).forEach(resKey => {
      if (!ignore.test(resKey))
        media[resKey] = resource[0][resKey][0]
    })

    if (media['resource-attributes']) {
      media.attributes = media['resource-attributes']
      delete media['resource-attributes']

      Object.keys(media.attributes).forEach(attr => {
        media.attributes[attr] = media.attributes[attr][0]
      })
    }

    metadata.media = media
  }

  return metadata
}

function parseMedia(noteData) {
  if (!noteData['resource']) return null

  let {content, resource} = noteData

  resource = resource[0]
  content = content[0]

  const matchHash = /hash="(\w+)"/
  const matchFileType = /type="\w+\/(\w+)"/

  const hash = content.match(matchHash)[1]
  const extension = content.match(matchFileType)[1]
  const filename = `${hash}.${extension}`

  const encodedData = resource['data'][0]['_']
  const encoding = resource['data'][0]['$']['encoding']

  content = new Buffer(encodedData, encoding)

  return {
    filename,
    content
  }
}
