import pytest
from pydantic import ValidationError

from api.models import ChatRequest


class TestChatRequest:
    def test_whitespace_only_message_is_rejected(self):
        with pytest.raises(ValidationError):
            ChatRequest(message="   ")

    def test_message_is_stripped(self):
        assert ChatRequest(message="  hello  ").message == "hello"

    def test_message_at_max_length_is_accepted(self):
        assert len(ChatRequest(message="a" * 4000).message) == 4000

    def test_message_over_max_length_is_rejected(self):
        with pytest.raises(ValidationError):
            ChatRequest(message="a" * 4001)

    def test_session_id_over_max_length_is_rejected(self):
        with pytest.raises(ValidationError):
            ChatRequest(message="hi", session_id="s" * 129)

    def test_session_id_defaults_to_none(self):
        assert ChatRequest(message="hi").session_id is None

    def test_conversation_history_defaults_to_empty_list(self):
        assert ChatRequest(message="hi").conversation_history == []
