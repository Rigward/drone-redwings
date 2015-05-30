/**
 * Created by Rigward on 29-May-15.
 */
(function () {

    // vars
    var device,
        osc,
        lfo1,
        lfo2,
        lfo3,
        lfo4,
        fft,
        fps = 30,
        channelCount = 2,
        width,
        height,
        context,
        playing = false;

    // This is the function that actually fills the
    // audio buffer with samples. In this case it
    // does crazy stuff with LFO's to produce
    // some interesting samples for the FFT.
    function audioCallback (buffer, channels) {

        if (!playing) return;

        var i, n, sample, bufferLength = buffer.length;

        for (i = 0; i < bufferLength; i += channels) {

            lfo1.generate();
            lfo2.generate();
            lfo3.generate();
            lfo4.generate();

            lfo2.fm = lfo1.getMix();
            lfo3.fm = lfo2.getMix();
            lfo4.fm = lfo3.getMix();

            osc.fm = lfo4.getMix();
            osc.generate();

            sample = osc.getMix();

            fft.pushSample(sample);

            for (n = 0; n < channelCount; n++){
                buffer[i + n] = sample;
            }
        }
    }

    window.addEventListener('load', function() {

        var canvas, button;

        // set up audio device and oscillators
        device = audioLib.AudioDevice(audioCallback, channelCount);
        osc = audioLib.Oscillator(device.sampleRate, 600);
        osc.waveShape = 'triangle';
        lfo1 = audioLib.Oscillator(device.sampleRate, 0.1);
        lfo2 = audioLib.Oscillator(device.sampleRate, 10.3);
        lfo3 = audioLib.Oscillator(device.sampleRate, 0.7);
        lfo4 = audioLib.Oscillator(device.sampleRate, 6.2);

        // create the FFT
        fft = audioLib.FFT(device.sampleRate, 4096);

        // set up UI and FFT canvas
        canvas = document.getElementById('canvas');
        context = canvas.getContext('2d');
        width = canvas.width;
        height = canvas.height;
        gradient = context.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, "#ff0000");
        gradient.addColorStop(0.6, "#ff0000");
        gradient.addColorStop(1, "#0000ff");
        context.fillStyle = gradient;
        context.lineWidth = 1;

        button = document.getElementById('playButton');
        button.onclick = function () {
            playing = !playing;
            button.innerHTML = playing ? 'pause' : 'play';
        };

    });

    // This function actually draws the FFT spectrum
    // on the HTML5 canvas.
    function drawFFT () {

        var length, count;
        length = fft.spectrum.length / 8;

        context.clearRect(0, 0, width, height);
        context.beginPath();
        context.moveTo(0, height);

        for (count = 0; count < length; count++) {
            context.lineTo(count / length * width,
                fft.spectrum[count] * -height * 2 + height);
        }

        context.moveTo(width,0);
        context.closePath();
        context.fill();
        context.stroke();
    }

    function drawFFT2 () {

        var length, count;
        length = fft.spectrum.length / 8;
        var sum = 0;
        for (count = 0; count < length; count++) {
            sum+=fft.spectrum[count];
        }
        sum = sum/length;
        console.log(sum);

    }

    // Use sink.js (built in to audiolib.js) to
    // call drawFFT at the given frame rate.
    Sink.doInterval(function(){
        if (playing) drawFFT();
    }, fps/100);

})();