---
title: "Automatically Censor Profanity with Node.js"
description: "Learn how to create censored audio files automatically."
date: 2021-11-04
cover: https://res.cloudinary.com/deepgram/image/upload/v1635438532/blog/2021/11/censor-profanity-nodejs/automatically-censor-profanity-with-nodejs-blog%402x.png
authors:
    - kevin-lewis
category: tutorial
tags:
    - nodejs
seo:
    title: "Automatically Censor Profanity with Node.js"
    description: "Learn how to create censored audio files automatically."
shorturls:
    share: https://dpgr.am/562fccf
    twitter: https://dpgr.am/f751da2
    linkedin: https://dpgr.am/b3df202
    reddit: https://dpgr.am/afc2f1d
    facebook: https://dpgr.am/d4e7bb9
og:
    image: https://res.cloudinary.com/deepgram/image/upload/v1661453797/blog/censor-profanity-nodejs/ograph.png
---

Here at Deepgram we run GRAM JAM - a series of internal hackathons to have Deepgrammers build cool projects using our own API. Sometimes the projects lead to product improvements, sometimes they get a laugh, and other times they are just super useful. This blog post is based on one of those projects - Bleepgram - built by the very interdisciplinary team of Faye Donnelley, Mike Stivaletti , Conner Goodrum, Claudia Ring, and Anthony Deschamps.

Sometimes we all let "unprovoked or unintended utterances" slip out of our mouth, and often it's the job of an editor to go through recordings and overlay a bleep so no one has to hear the original word. Historically this has been a manual process, but with Deepgram's Speech Recognition API we can work to censor them automatically.

If you want to look at the final project code you can find it at <https://github.com/deepgram-devs/censor-audio>.

## Before We Start

You will need:

*   Node.js installed on your machine - [download it here](https://nodejs.org/en/).
*   A Deepgram API Key - [get one here](https://console.deepgram.com/signup?jump=keys).
*   An audio file to censor - [here's one you can download](https://github.com/deepgram-devs/censor-audio-js/blob/main/input.m4a) and place in your new project directory.

Create a new directory and navigate to it with your terminal. Run `npm init -y` to create a `package.json` file and then install the following packages:

    npm install @deepgram/sdk ffmpeg-static profane-words

Create an `index.js` file, and open it in your code editor.

## Preparing Dependencies

At the top of your file require these packages:

```js
const fs = require('fs')
const { exec } = require('child_process')
const { Deepgram } = require('@deepgram/sdk')
const profanities = require('profane-words')
const ffmpegStatic = require('ffmpeg-static')
```

*   `fs` is the built-in file system module for Node.js. It is used to read and write files which you will be doing a few times throughout this post.
*   `exec` allows us to fire off terminal commands from our Node.js script.
*   `profane-words` exports an array of, perhaps unsurprisingly, profane words.
*   `ffmpeg-static` includes a version of FFmpeg in our node\_modules directory, and requiring it returns the file path.

[FFmpeg](https://ffmpeg.org) is a terminal-based toolkit for developers to work with audio and video files, which can include some quite complex manipulation. We'll be using `exec` to run it.

Initialize the Deepgram client:

```js
const deepgram = new Deepgram('YOUR DEEPGRAM KEY')
```

## Creating a Main Function

Since Node.js 14.8 you can use `await` anywhere, even outside of an asynchronous function, if you are creating a module. For this blog post I'll assume that's not the case, so we'll create a `main()` function for our logic to sit in:

```js
async function main() {
  try {
    // Logic goes here
  } catch (error) {
    console.error(error)
  }
}

main()
```

## Get Transcript and Profanity

Inside of our `main()` function get a transcript using the Deepgram Node.js SDK, and then find the profanities:

```js
const transcript = await deepgram.transcription.preRecorded({
  buffer: fs.readFileSync('./input.m4a'),
  mimetype: 'audio/m4a',
})
const words = transcript.results.channels[0].alternatives[0].words
const bleeps = words.filter((word) => profanities.find((w) => word.word == w))
console.log(bleeps)
```

Bleeps will return words that appear in the `profane-words` list. Test this code by running `node index.js` in your terminal and you should see a result like this:

![A terminal showing an array with four items. Each has a word, start, end, and confidence. Each of the words is clearly profanity but has been edited to obscure the actual words.](https://res.cloudinary.com/deepgram/image/upload/v1635438533/blog/2021/11/censor-profanity-nodejs/profane-words.png)

Once you have done this, remove the `console.log()` statement.

## Determine Clean Audio Timings

Next, we want the inverse start and end times - where the audio is 'clean' and doesn't need bleeping. Add this to the `main()` function:

```js
const noBleeps = [{ start: 0, end: bleeps[0].start }]
for (let i = 0; i < bleeps.length; i++) {
  if (i < bleeps.length - 1) {
    noBleeps.push({ start: bleeps[i].end, end: bleeps[i + 1].start })
  } else {
    noBleeps.push({ start: bleeps[i].end })
  }
}

console.log(noBleeps)
```

Run this again with `node index.js` and you should have the following result:

![A terminal showing an array of 5 objects, each with a start and end except the last which only has a start.](https://res.cloudinary.com/deepgram/image/upload/v1635438533/blog/2021/11/censor-profanity-nodejs/no-bleeps.png)

## FFmpeg Complex Filters

FFmpeg allows complex manipulation of audio files, and works by chaining smaller manipulations known as filters. We pass in audio by a variable name, do something, and export a new variable which we can then further chain. This might feel complex, so let's talk through what we will do.

1.  Take the original audio file and drop the volume to 0 during times where we have profanity.
2.  Generate a constant beep with a sine wave.
3.  Make the constant beep end when the final profanity finishes.
4.  Drop the volume of the beep to 0 whenever there is not profanity.
5.  Mix the bleep and the vocals to one final track which at any point in time will have a bleep or vocals - never both.

In our `main()` function let's do this with code. Starting with dropping the volume wherever we have profanity:

```js
const dippedVocals = `[0]volume=0:enable='${bleeps
  .map((b) => `between(t,${b.start},${b.end})`)
  .join('+')}'[dippedVocals]`
```

`dippedVocals` will now look something like:

    [0]volume=0:enable='between(t,1.5777808,1.977219)+between(t,4.7732863,5.2732863)+between(t,5.3724437,5.8724437)+between(t,6.371039,6.7704773)'[dippedVocals]

This takes the provided file (which here is `[0]`), makes the volume 0 between the provided times, and makes this altered version available to future parts of this filter as `[dippedVocals]`

Delete `dippedVocals` and create `filter` which contains all parts of our complex filter with the value of `dippedVocals` as the first item, and then creates a valid string for FFmpeg:

```js
const filter = [
  `[0]volume=0:enable='${bleeps
    .map((b) => `between(t,${b.start},${b.end})`)
    .join('+')}'[dippedVocals]`,
  'sine=d=5:f=800,pan=stereo|FL=c0|FR=c0[constantBleep]',
  `[constantBleep]atrim=start=0:end=${
    noBleeps[noBleeps.length - 1].start
  }[shortenedBleep]`,
  `[shortenedBleep]volume=0:enable='${noBleeps
    .slice(0, -1)
    .map((b) => `between(t,${b.start},${b.end})`)
    .join('+')}'[dippedBleep]`,
  '[dippedVocals][dippedBleep]amix=inputs=2',
].join(';')
```

That's all five steps above built into one complex filter. The final filter looks like this:

    [0]volume=0:enable='between(t,1.5777808,1.977219)+between(t,4.7732863,5.2732863)+between(t,5.3724437,5.8724437)+between(t,6.371039,6.7704773)'[dippedVocals];sine=d=5:f=800,pan=stereo|FL=c0|FR=c0[constantBleep];[constantBleep]atrim=start=0:end=6.7704773[shortenedBleep];[shortenedBleep]volume=0:enable='between(t,0,1.5777808)+between(t,1.977219,4.7732863)+between(t,5.2732863,5.3724437)+between(t,5.8724437,6.371039)'[dippedBleep];[dippedVocals][dippedBleep]amix=inputs=2

Yeah. We did it in an array for a reason.

## Create Censored File

The very final step is to actually run FFmpeg via `exec` with the above filter. Add this line to the bottom of your `main()` function:

```js
exec(`${ffmpegStatic} -y -i input.m4a -filter_complex "${filter}" output.wav`)
```

And run your script with `node index.js`. Once completed, your `output.wav` file should be your original file with automatic transcription.

## Wrapping Up

A transcript is not always the final step in a project - you can use the structured data returned by Deepgram to do further processing or analysis, as demonstrated by this post. I hope you found it interesting.

The complete project is available at <https://github.com/deepgram-devs/censor-audio> and if you have any questions please feel free to reach out on Twitter - we're [@DeepgramDevs](https://twitter.com/DeepgramDevs).

        