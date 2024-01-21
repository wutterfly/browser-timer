use crate::{err::MessageError, SEPERATOR};

#[repr(u8)]
pub enum SendCode {
    Ping = 0,
    Rtt = 1,
}

#[repr(u8)]
pub enum ReceiveCode {
    Pong = 0,
    Data = 1,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EventTyp {
    KeyDown,
    KeyUp,
}

impl EventTyp {
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::KeyDown => "keydown",
            Self::KeyUp => "keyup",
        }
    }
}

impl TryFrom<&str> for ReceiveCode {
    type Error = MessageError;

    fn try_from(value: &str) -> std::prelude::v1::Result<Self, Self::Error> {
        match value {
            "0" => Ok(Self::Pong),
            "1" => Ok(Self::Data),
            _ => Err(MessageError::InvalidCode),
        }
    }
}

#[derive(Debug, Clone)]
pub enum TimerMessage {
    Ping {
        i: u32,
    },
    Pong {
        i: u32,
    },
    Rtt {
        rtt: u128,
    },
    Data {
        key: Box<str>,
        key_code: i32,
        typ: EventTyp,
    },
}

impl TryFrom<&str> for TimerMessage {
    type Error = MessageError;

    fn try_from(value: &str) -> std::prelude::v1::Result<Self, Self::Error> {
        let mut split = value.split(SEPERATOR);

        if let Some(code_str) = split.next() {
            let code = ReceiveCode::try_from(code_str)?;

            match code {
                ReceiveCode::Pong => {
                    if let Some(i_str) = split.next() {
                        let i = i_str
                            .parse::<u32>()
                            .map_err(|_| MessageError::CounterParseError)?;

                        if split.next().is_none() {
                            return Ok(Self::Pong { i });
                        }

                        // no more data expected
                        return Err(MessageError::NoMoreDataExpected);
                    }

                    Err(MessageError::MoreDataExpected("ping counter"))
                }

                ReceiveCode::Data => {
                    let key = if let Some(key) = split.next() {
                        if key == "," {
                            "\",\"".to_owned()
                        } else {
                            key.to_owned()
                        }
                    } else {
                        return Err(MessageError::MoreDataExpected("key"));
                    };

                    let key_code = if let Some(code) = split.next() {
                        let trimmed = code;

                        trimmed.parse::<i32>().unwrap_or_else(|_| {
                            log::error!(
                                "{} - KeyCode: [{}]",
                                MessageError::KeyCodeParseError,
                                trimmed
                            );
                            -1
                        })
                    } else {
                        return Err(MessageError::MoreDataExpected("ping counter"));
                    };

                    let typ = match split.next() {
                        Some("keyup") => EventTyp::KeyUp,
                        Some("keydown") => EventTyp::KeyDown,
                        _ => return Err(MessageError::InvalidTyp),
                    };

                    Ok(Self::Data {
                        key: key.into(),
                        key_code,
                        typ,
                    })
                }
            }
        } else {
            Err(MessageError::MoreDataExpected("message"))
        }
    }
}

impl TimerMessage {
    pub fn as_string(&self) -> String {
        match self {
            Self::Ping { i } => format!("{}{SEPERATOR}{i}", SendCode::Ping as u8),
            Self::Pong { i } => format!("{}{SEPERATOR}{i}", ReceiveCode::Pong as u8),
            Self::Rtt { rtt } => format!("{}{SEPERATOR}{rtt}", SendCode::Rtt as u8),
            Self::Data { key, key_code, typ } => {
                format!(
                    "{}{SEPERATOR}{key}{SEPERATOR}{key_code}{SEPERATOR}{}",
                    ReceiveCode::Data as u8,
                    typ.as_str()
                )
            }
        }
    }
}
