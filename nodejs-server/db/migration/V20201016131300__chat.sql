CREATE TABLE chat_state(
    id SERIAL,
    user_id character varying(100),
    active BOOLEAN,
    state jsonb,
    PRIMARY KEY (id)
);

CREATE INDEX chat_state_idx_user_id ON chat_state (user_id);
CREATE INDEX chat_state_idx_active ON chat_state (active);