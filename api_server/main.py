# Import all libraries
#import IPython.display as ipd
#import librosa
#import librosa.display
import numpy as np
import torch
#from matplotlib import pyplot as plt
#import io
#from scipy.io.wavfile import write
#import os
import tensorflow as tf

import json
import sys
from flask import Flask, request
from flask_cors import CORS

#os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
from nemo.utils import logging
logging.setLevel(logging.ERROR)



from nemo.collections.tts.models import FastPitchModel
from nemo.collections.tts.models import HifiGanModel
from nemo.collections.tts.parts.utils.helpers import regulate_len


'''
import riva.client
import IPython.display as ipd

server = "localhost:50051"                # location of riva server
auth = riva.client.Auth(uri=server)
tts_service = riva.client.SpeechSynthesisService(auth)

#text = "Determination."
text = """<speak><prosody pitch='+2'>T<prosody pitch='-2'>o<prosody pitch='-2'>d<prosody pitch='-2'>a<prosody pitch='-2'>y</prosody></prosody></prosody></prosody></prosody>is a sunny day.</speak>"""
language_code = "en-US"                  # currently required to be "en-US"
sample_rate_hz = 44100                    # the desired sample rate
voice_name = "English-US.Female-1"      # subvoice to generate the audio output.
data_type = np.int16                      # For RIVA version < 1.10.0 please set this to np.float32

resp = tts_service.synthesize(text, voice_name=voice_name, language_code=language_code, sample_rate_hz=sample_rate_hz)
audio = resp.audio

#meta = resp.meta
#processed_text = meta.processed_text
#predicted_durations = meta.predicted_durations

audio_samples = np.frombuffer(resp.audio, dtype=data_type)


'''

from nemo.collections.common.parts.preprocessing.parsers import CharParser


app = Flask(__name__)
CORS(app)

# Load the models from NGC
fastpitch = FastPitchModel.from_pretrained("tts_en_fastpitch").eval().cuda()
hifigan = HifiGanModel.from_pretrained("tts_en_hifigan").eval().cuda()
sr = 22050

def str_to_audio(inp, pace=1.0, durs=None, pitch=None):
    with torch.no_grad():
        tokens = fastpitch.parse(inp)
       # x = fastpitch.cfg.pitch_mean
        #print(x.tokens)
        #print(tokens)
        spec, _, durs_pred, _, pitch_pred, *_ = fastpitch(text=tokens, durs=durs, pitch=pitch, speaker=None, pace=pace)
        audio = hifigan.convert_spectrogram_to_audio(spec=spec).to('cpu').numpy()
    return spec, audio, durs_pred, pitch_pred
    
input_string = "I have $250 in my pocket."  # Feel free to change it and experiment
spec, audio, durs_pred, pitch_pred = str_to_audio(input_string)

def regulate_len(durations, pace=1.0):
    durations = durations.float() / pace
    return durations.long()

def tensorToArr(tens):
    return tens.detach().cpu()[0].tolist()

def arrToTensor(arr):
    tensor_array = torch.tensor(arr)
    tensor_2d = torch.unsqueeze(tensor_array, 0)

def numpyToArr(nmp):
    return nmp[0].tolist()

@app.route('/')
def hello_world():
    input_string = "Hey, I am speaking at different paces!"
    _, audio, *_ = str_to_audio(input_string)
    return np.array2string(audio[0][1])

@app.route('/generate', methods=['POST'])
def post_data():

    rqjson = request.json
    print(rqjson)
    pace = 1
    if ('pace' in rqjson):
        pace = rqjson['pace']


    if ('inputString' in rqjson and 'pitchPreds' in rqjson):
        pitchTens = arrToTensor(rqjson['pitchPreds'])
        _, audio, durs_preds, pitch_preds = str_to_audio(rqjson['inputString'], pitch=pitchTens, pace=pace)
        resjson = {
            "inputString": rqjson['inputString'],
            "pitchPreds": rqjson['pitchPreds'],
            "dursPreds": tensorToArr(durs_preds),
            "audio": numpyToArr(audio),
            "pace": pace
        }
    else:
        _, audio, durs_preds, pitch_preds = str_to_audio(rqjson['inputString'], pace=pace)
        resjson = {
            "inputString": rqjson['inputString'],
            "pitchPreds": tensorToArr(pitch_preds),
            "dursPreds": tensorToArr(durs_preds),
            "audio": numpyToArr(audio),
            "pace": pace
        }
    return resjson

if __name__ == '__main__':
    app.run(debug=False)


#   write('test.wav', sr, audio.T)


'''
    with open(sys.argv[3], "w") as outfile:
        outfile.write(json_object_result)
    print("OK")
# Define a helper function to plot spectrograms with pitch and display the audio
def display_pitch(audio, pitch, sr=22050, durs=None):
    fig, ax = plt.subplots(figsize=(12, 6))
    spec = np.abs(librosa.stft(audio[0], n_fft=1024))
    # Check to see if pitch has been unnormalized
    if torch.abs(torch.mean(pitch)) <= 1.0:
        # Unnormalize the pitch with LJSpeech's mean and std
        pitch = pitch * 65.72037058703644 + 214.72202032404294
    # Check to see if pitch has been expanded to the spec length yet
    if len(pitch) != spec.shape[0] and durs is not None:
        pitch = regulate_len(durs, pitch.unsqueeze(-1))[0].squeeze(-1)
    # Plot and display audio, spectrogram, and pitch
    ax.plot(pitch.cpu().numpy()[0], color='cyan', linewidth=1)
    librosa.display.specshow(np.log(spec+1e-12), y_axis='log')
    ipd.display(ipd.Audio(audio, rate=sr))
    plt.show()

    '''
