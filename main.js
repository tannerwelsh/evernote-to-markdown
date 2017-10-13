const fs = require('fs')
    , path = require('path')
    , mkdirp = require('mkdirp')
    , config = require('./config')
    , parse = require('./parse')
    , format = require('./format')

const exportFile = process.argv[2]
    , notesDir = path.join(__dirname, config.notesFolder)
    , mediaDir = path.join(notesDir, config.mediaFolder)

const buildPath = (filename) => {
  let baseDir = notesDir

  if (path.extname(filename) !== '.md')
    baseDir = mediaDir

  return path.join(baseDir, filename)
}


mkdirp.sync(mediaDir)

fs.readFile(exportFile, function(err, data) {
  if (err) throw err

  console.log(`Parsing Evernotes from ${exportFile}...`, '')

  parse(data, (err, notes) => {
    if (err) throw err

    console.log(`Converting ${notes.length} notes to files...`, '')

    notes.forEach(note => {
      const [noteMarkdown, noteMedia] = format(note)

      const markdownWritePath = buildPath(noteMarkdown.filename)
      fs.writeFile(markdownWritePath, noteMarkdown.content, (err) => {
        if (err) throw err

        console.log(`${noteMarkdown.filename} written to disk`)
      })

      if (noteMedia) {
        const mediaWritePath = buildPath(noteMedia.filename)
        fs.writeFile(mediaWritePath, noteMedia.content, (err) => {
          if (err) throw err

          console.log(`${noteMedia.filename} written to disk`)
        })
      }
    })
  })
})
