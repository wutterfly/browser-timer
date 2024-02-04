#![warn(clippy::pedantic)]
#![warn(clippy::nursery)]
#![allow(clippy::module_name_repetitions)]

mod data;
mod err;
mod message;
mod ping;
mod server_http;
mod server_ws;
mod time;

use data::{Distributer, WriteOn};
use env_logger::Env;
use message::EventTyp;
use server_ws::Server;
use std::io::Write;
use std::path::PathBuf;
use std::sync::Arc;

const SEPERATOR: char = '\u{F003}';

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // initialize global logger
    env_logger::Builder::from_env(Env::default().default_filter_or("trace"))
        .format(|buf, record| {
            writeln!(
                buf,
                "[{:<5}] -- [{}:{}] [{}]  {}",
                record.level(),
                record.file().unwrap_or_default(),
                record.line().unwrap_or_default(),
                record.target(),
                record.args()
            )
        })
        .filter_module("tokio_tungstenite", log::LevelFilter::Off)
        .filter_module("tungstenite", log::LevelFilter::Off)
        .init();

    // build async runtime
    let rt = tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()?;

    // prepare data output
    let dist = Arc::new(Distributer::new(
        Some(WriteOn::Filter(Arc::new(|data| {
            // on escape key up
            data.key_code == 27 && data.typ == EventTyp::KeyUp
        }))),
        PathBuf::from("./output"),
        "./key_data",
    )?);

    let rtt_interval = 4;

    // create websocket server
    let server = Server::new(rtt_interval);

    let port = 8021;

    // start server
    let (x, y) = rt.block_on(async {
        tokio::join!(
            server.start_server(dist.clone(), port),
            server_http::start(dist, 8022)
        )
    });

    x?;
    y?;

    Ok(())
}
