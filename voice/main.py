"""Memoria Voice Service — entry point."""

import argparse
import sys


def test_audio() -> None:
    """Record 5 seconds from the mic and play it back."""
    from config import cfg
    import audio_io

    sr = cfg["sample_rate"]
    ch = cfg["channels"]

    print("=== Audio devices ===")
    audio_io.list_devices()
    print()

    print(f"开始录音（5 秒）...  [sample_rate={sr}, channels={ch}]")
    audio = audio_io.record(seconds=5, sample_rate=sr, channels=ch)
    peak = audio.max()
    print(f"录音结束 — {len(audio)} samples, peak amplitude: {peak:.4f}")

    if peak < 0.001:
        print("⚠ 几乎没有检测到声音，请检查麦克风是否正常工作")

    print("播放中...")
    audio_io.play(audio, sample_rate=sr)
    print("测试完成 ✓")


def main() -> None:
    parser = argparse.ArgumentParser(description="Memoria Voice Service")
    parser.add_argument(
        "--test-audio",
        action="store_true",
        help="Record 5 seconds and play back (hardware sanity check)",
    )
    args = parser.parse_args()

    if args.test_audio:
        try:
            test_audio()
        except Exception as e:
            print(f"Audio test failed: {e}", file=sys.stderr)
            sys.exit(1)
        return

    # Future: initialize state machine → event loop
    print("Voice service not yet implemented. Use --test-audio to verify hardware.")
    sys.exit(0)


if __name__ == "__main__":
    main()
