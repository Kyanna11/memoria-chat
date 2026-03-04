"""Microphone recording and speaker playback via sounddevice."""

import numpy as np
import sounddevice as sd


def list_devices() -> None:
    """Print all available audio devices."""
    print(sd.query_devices())


def record(seconds: float, sample_rate: int = 16000, channels: int = 1) -> np.ndarray:
    """Record audio from the default input device (blocking).

    Returns:
        numpy array of shape (frames, channels), dtype float32.
    """
    frames = int(seconds * sample_rate)
    audio = sd.rec(frames, samplerate=sample_rate, channels=channels, dtype="float32")
    sd.wait()
    return audio


def play(audio_data: np.ndarray, sample_rate: int = 16000) -> None:
    """Play audio through the default output device (blocking)."""
    sd.play(audio_data, samplerate=sample_rate)
    sd.wait()
