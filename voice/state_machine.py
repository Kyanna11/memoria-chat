"""Six-state state machine for the voice assistant lifecycle."""

from enum import Enum, auto


class State(Enum):
    IDLE = auto()
    LISTENING = auto()
    PROCESSING = auto()
    SPEAKING = auto()
    SLEEPING = auto()
    ERROR = auto()


# Allowed transitions: state → set of reachable states
_TRANSITIONS: dict[State, set[State]] = {
    State.IDLE: {State.LISTENING, State.SLEEPING, State.ERROR},
    State.LISTENING: {State.PROCESSING, State.IDLE, State.ERROR},
    State.PROCESSING: {State.SPEAKING, State.IDLE, State.ERROR},
    State.SPEAKING: {State.IDLE, State.LISTENING, State.ERROR},
    State.SLEEPING: {State.IDLE, State.ERROR},
    State.ERROR: {State.IDLE},
}


class StateMachine:
    """Minimal FSM with guarded transitions."""

    def __init__(self) -> None:
        self.state = State.IDLE

    def transition(self, to: State) -> None:
        allowed = _TRANSITIONS.get(self.state, set())
        if to not in allowed:
            raise RuntimeError(
                f"Illegal transition: {self.state.name} → {to.name} "
                f"(allowed: {', '.join(s.name for s in allowed)})"
            )
        self.state = to

    def reset(self) -> None:
        """Force back to IDLE (for recovery)."""
        self.state = State.IDLE

    def __repr__(self) -> str:
        return f"StateMachine({self.state.name})"
