const { isWin } = require('@common/utils')
// require('./request')
// require('./appName')
require('./progressBar')
require('./trafficLight')
require('./musicMeta')
require('./selectDir')
require('./setWindowSize')
require('./showSaveDialog')
require('./cache')
require('./setIgnoreMouseEvent')
require('./getEnvParams')
require('./appSetting')
require('./setLyricInfo')
require('./hotKey')
require('./getDataPath')
require('./showDialog')
require('./playList')
require('./data')
require('./lyric')
require('./musicUrl')
require('./systemFonts')
require('./wait')
require('./openDevtools')

if (isWin) require('./taskbar')

// require('./kw_decodeLyric')

require('./userApi')
require('./sync')
require('./s2t')

