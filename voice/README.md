# Memoria Voice Service

Python 语音服务，为 Memoria.chat 提供语音交互能力。

## 前置依赖

### Windows / macOS

无需额外操作，`sounddevice` 自带 PortAudio 二进制。

### Linux (Debian/Ubuntu)

```bash
sudo apt install libportaudio2
```

### Linux (Fedora/RHEL)

```bash
sudo dnf install portaudio
```

## 快速开始

```bash
cd voice
pip install -r requirements.txt
python main.py --test-audio
```

预期流程：
1. 打印可用音频设备列表
2. 开始录音（5 秒）
3. 录完自动播放
4. 从音箱听到自己的声音即为成功

## 配置

编辑 `config.yaml` 或通过环境变量覆盖：

| 环境变量 | 配置键 | 默认值 |
|---|---|---|
| `SAMPLE_RATE` | `sample_rate` | `16000` |
| `CHANNELS` | `channels` | `1` |
| `MEMORIA_URL` | `memoria_url` | `http://127.0.0.1:3000` |
| `ADMIN_TOKEN` | `admin_token` | (空) |

> **Security**: Use environment variables for `ADMIN_TOKEN`. Never put real tokens in `config.yaml` (it's tracked by git).

## 项目结构

```
voice/
├── main.py           # 入口
├── config.py         # 配置加载
├── config.yaml       # 默认配置
├── state_machine.py  # 状态机定义
├── audio_io.py       # 麦克风录音 + 播放
├── requirements.txt  # Python 依赖
└── README.md
```
