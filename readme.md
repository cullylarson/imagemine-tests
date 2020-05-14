# imagemine-tests

> Test different imagemin plugins

```
Image Format    Lossy Plugin        Lossless Plugin
------------------------------------------------------
JPEG            imagemin-mozjpeg    imagemin-jpegtran
PNG             imagemin-pngquant   imagemin-optipng
GIF             imagemin-giflossy   imagemin-gifsicle
SVG             imagemin-svgo
WebP            imagemin-webp
```

You can run each test using the package.json script, or by manually running each test's `do.js`. You have to run it in the test folder (it has some relative paths that might not work if run from somewhere else). It will convert all applicable images from the `/images` folder and put them into a `results` folder. It will output a JSON summary of the results. You can pipe that to `results/summary.json` if you want to keep it. It also writes a `results/index.html` summary of the results, with image comparison.
