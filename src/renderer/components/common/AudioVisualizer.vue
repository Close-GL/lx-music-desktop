<template>
  <div :class="$style.content">
    <canvas :class="$style.canvas" ref="dom_canvas"></canvas>
  </div>
</template>

<script>
import { ref, onBeforeUnmount, onMounted, useRefGetter, watch } from '@renderer/utils/vueTools'
import { getAnalyser } from '@renderer/plugins/player'
import { isPlay } from '@renderer/core/share/player'
import { player as eventPlayerNames } from '@renderer/event/names'

const themes = {
  green: 'rgba(77,175,124,.16)',
  blue: 'rgba(52,152,219,.16)',
  yellow: 'rgba(233,212,96,.22)',
  orange: 'rgba(245,171,53,.16)',
  red: 'rgba(214,69,65,.12)',
  pink: 'rgba(241,130,141,.16)',
  purple: 'rgba(155,89,182,.14)',
  grey: 'rgba(108,122,137,.16)',
  ming: 'rgba(51,110,123,.14)',
  blue2: 'rgba(79,98,208,.14)',
  black: 'rgba(39,39,39,.4)',
  mid_autumn: 'rgba(74,55,82,.1)',
  naruto: 'rgba(87,144,167,.14)',
  happy_new_year: 'rgba(192,57,43,.1)',
}
export default {
  setup() {
    const dom_canvas = ref(null)
    const analyser = getAnalyser()

    let ctx
    let bufferLength
    let dataArray
    let WIDTH
    let HEIGHT
    let barWidth
    let barHeight
    let x = 0
    let isPlaying = false
    let animationFrameId

    let num
    let mult
    const maxNum = 255
    let frequencyAvg = 0

    const theme = useRefGetter('theme')
    // const setting = useRefGetter('setting')
    let themeColor = themes[theme.value || 'green']
    watch(theme, theme => {
      themeColor = themes[theme || 'green']
    })

    // https://developer.mozilla.org/zh-CN/docs/Web/API/AnalyserNode/smoothingTimeConstant
    const renderFrame = () => {
      animationFrameId = null
      if (isPlaying) animationFrameId = window.requestAnimationFrame(renderFrame)

      x = 0

      analyser.getByteFrequencyData(dataArray)

      ctx.clearRect(0, 0, WIDTH, HEIGHT)
      // ctx.fillRect(0, 0, WIDTH, HEIGHT)
      ctx.fillStyle = themeColor

      for (let i = 0; i < bufferLength; i++) {
        mult = Math.floor(i / maxNum)
        num = mult % 2 === 0 ? (i - maxNum * mult) : (maxNum - (i - maxNum * mult))
        let spectrum = num > 90 ? 0 : dataArray[num + 20]
        frequencyAvg += spectrum * 1.2
      }
      frequencyAvg /= bufferLength
      frequencyAvg *= 1.4

      frequencyAvg = frequencyAvg / maxNum
      // ctx.scale(1, 1 + frequencyAvg)

      for (let i = 0; i < bufferLength; i++) {
        if (x > WIDTH) break

        barHeight = dataArray[i]

        // let r = barHeight + (25 * (i / bufferLength))
        // let g = 250 * (i / bufferLength)
        // let b = 50

        // ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')'
        barHeight = barHeight * frequencyAvg + barHeight * 0.42
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight)

        x += barWidth
      }
    }

    const handlePlay = () => {
      isPlaying = true
      analyser.fftSize = 256
      bufferLength = analyser.frequencyBinCount
      // console.log(bufferLength)
      barWidth = (WIDTH / bufferLength) * 2.5
      dataArray = new Uint8Array(bufferLength)
      renderFrame()
    }
    const handlePause = () => {
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId)
      isPlaying = false
    }

    window.eventHub.on(eventPlayerNames.play, handlePlay)
    window.eventHub.on(eventPlayerNames.pause, handlePause)
    window.eventHub.on(eventPlayerNames.error, handlePause)
    onBeforeUnmount(() => {
      handlePause()
      window.eventHub.off(eventPlayerNames.play, handlePlay)
      window.eventHub.off(eventPlayerNames.pause, handlePause)
      window.eventHub.off(eventPlayerNames.error, handlePause)
    })

    onMounted(() => {
      const canvas = dom_canvas.value
      ctx = canvas.getContext('2d')
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
      WIDTH = canvas.width
      HEIGHT = canvas.height
      if (isPlay.value) handlePlay()
    })

    return {
      dom_canvas,
    }
  },
}
</script>

<style lang="less" module>
.content {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}
.canvas {
  width: 100%;
  height: 100%;
  // opacity: 0.1;
}
</style>
