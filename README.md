# Evernote => Markdown

Export from Evernote, then convert notes to Markdown files.

Metadata is converted to YAML "front matter" in each file. Media notes (e.g. images) are extracted and stored in a media directory.

```shell-session
$ node main.js <path to Evernote export file>
# ... [ does its thing, extracts notes to a notes/ subdirectory ]
```
